/**
 * Tests for the local-indexer module that powers code intelligence
 * without external dependencies.
 *
 * Lives under server/ rather than modules/code-intel/local-indexer/tests/
 * because the top-level vitest config picks up tests from server/ but not
 * from sub-package tests/ directories. The local-indexer is pure node — it
 * has no DOM dependency — so the server pool is the natural fit.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {
  buildIndex,
  createLocalResponder,
  clusterIdForFile,
  walkSourceFiles,
  parseFile,
  resolveImport,
} from '../modules/code-intel/local-indexer/src/index.js'

// ---------------------------------------------------------------------------
// Fixture: a tiny in-memory project written to a tempdir.
// ---------------------------------------------------------------------------
let repoRoot

function writeFile(rel, content) {
  const abs = path.join(repoRoot, rel)
  fs.mkdirSync(path.dirname(abs), { recursive: true })
  fs.writeFileSync(abs, content, 'utf8')
}

function buildFixture() {
  // src/components/board/IssueCard.jsx
  writeFile(
    'src/components/board/IssueCard.jsx',
    `import React from 'react'
import { formatDate } from '../../utils/dates.js'
export function IssueCard({ issue }) {
  return <div>{formatDate(issue.createdAt)}</div>
}`
  )

  // src/components/board/IssueDetail.jsx — also imports formatDate
  writeFile(
    'src/components/board/IssueDetail.jsx',
    `import { formatDate } from '../../utils/dates.js'
import { IssueCard } from './IssueCard.jsx'
export default function IssueDetail({ issue }) {
  return null
}`
  )

  // src/utils/dates.js — the target
  writeFile(
    'src/utils/dates.js',
    `export function formatDate(d) { return new Date(d).toISOString() }
export const DAY_MS = 86400000
`
  )

  // src/stores/issuesStore.js — uses dates too
  writeFile(
    'src/stores/issuesStore.js',
    `import { formatDate } from '../utils/dates.js'
export function useIssuesStore() { return { formatDate } }
`
  )

  // server/app.js — different cluster, doesn't import from src
  writeFile(
    'server/app.js',
    `export function startServer() { return true }
`
  )

  // node_modules/should-be-skipped/index.js — must NOT be indexed
  writeFile(
    'node_modules/should-be-skipped/index.js',
    `export function evil() { throw new Error('do not index me') }
`
  )
}

beforeEach(() => {
  repoRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'sf-local-indexer-'))
  buildFixture()
})

afterEach(() => {
  if (repoRoot) {
    fs.rmSync(repoRoot, { recursive: true, force: true })
  }
})

// ---------------------------------------------------------------------------
// walker
// ---------------------------------------------------------------------------
describe('walkSourceFiles', () => {
  it('finds every source file under the root', () => {
    const files = walkSourceFiles(repoRoot)
    const rels = files.map((f) => path.relative(repoRoot, f).split(path.sep).join('/')).sort()
    expect(rels).toContain('src/components/board/IssueCard.jsx')
    expect(rels).toContain('src/components/board/IssueDetail.jsx')
    expect(rels).toContain('src/utils/dates.js')
    expect(rels).toContain('src/stores/issuesStore.js')
    expect(rels).toContain('server/app.js')
  })

  it('skips node_modules entirely', () => {
    const files = walkSourceFiles(repoRoot)
    for (const f of files) {
      expect(f).not.toContain('node_modules')
    }
  })
})

// ---------------------------------------------------------------------------
// parser
// ---------------------------------------------------------------------------
describe('parseFile', () => {
  it('extracts named function exports', () => {
    const parsed = parseFile('foo.js', `export function alpha() {}\nexport function beta() {}`)
    expect(parsed.exports.map((e) => e.name).sort()).toEqual(['alpha', 'beta'])
    expect(parsed.exports[0].kind).toBe('function')
  })

  it('extracts default function exports', () => {
    const parsed = parseFile('foo.jsx', `export default function MyComp() { return null }`)
    expect(parsed.exports.map((e) => e.name)).toContain('MyComp')
  })

  it('extracts const exports', () => {
    const parsed = parseFile('foo.js', `export const MAX = 42\nexport const MIN = 0`)
    expect(parsed.exports.map((e) => e.name).sort()).toEqual(['MAX', 'MIN'])
    expect(parsed.exports[0].kind).toBe('const')
  })

  it('extracts class exports', () => {
    const parsed = parseFile('foo.js', `export class Animal {}`)
    expect(parsed.exports[0]).toMatchObject({ name: 'Animal', kind: 'class' })
  })

  it('extracts re-export braces', () => {
    const parsed = parseFile('foo.js', `export { foo, bar as baz }`)
    expect(parsed.exports.map((e) => e.name).sort()).toEqual(['baz', 'foo'])
  })

  it('captures import specifiers', () => {
    const parsed = parseFile(
      'foo.js',
      `import x from './a'
import { y, z } from './b'
import * as ns from './c'
const dyn = await import('./d')
const cjs = require('./e')`
    )
    expect(parsed.imports.sort()).toEqual(['./a', './b', './c', './d', './e'])
  })

  it('ignores imports inside line comments', () => {
    const parsed = parseFile(
      'foo.js',
      `// import { evil } from './bad'\nimport { good } from './good'`
    )
    expect(parsed.imports).toEqual(['./good'])
  })

  it('ignores imports inside block comments', () => {
    const parsed = parseFile(
      'foo.js',
      `/* import { evil } from './bad' */\nimport { good } from './good'`
    )
    expect(parsed.imports).toEqual(['./good'])
  })
})

// ---------------------------------------------------------------------------
// resolver
// ---------------------------------------------------------------------------
describe('resolveImport', () => {
  it('returns null for bare specifiers (packages)', () => {
    const fromFile = path.join(repoRoot, 'src/components/board/IssueCard.jsx')
    expect(resolveImport(fromFile, 'react')).toBe(null)
    expect(resolveImport(fromFile, '@scope/pkg')).toBe(null)
  })

  it('resolves a relative path with explicit extension', () => {
    const fromFile = path.join(repoRoot, 'src/components/board/IssueCard.jsx')
    const target = resolveImport(fromFile, '../../utils/dates.js')
    expect(target).toBe(path.join(repoRoot, 'src/utils/dates.js'))
  })

  it('appends .js when no extension is given', () => {
    const fromFile = path.join(repoRoot, 'src/components/board/IssueCard.jsx')
    const target = resolveImport(fromFile, '../../utils/dates')
    expect(target).toBe(path.join(repoRoot, 'src/utils/dates.js'))
  })

  it('returns null for unresolvable paths', () => {
    const fromFile = path.join(repoRoot, 'src/components/board/IssueCard.jsx')
    expect(resolveImport(fromFile, '../../nope/missing')).toBe(null)
  })
})

// ---------------------------------------------------------------------------
// clusters
// ---------------------------------------------------------------------------
describe('clusterIdForFile', () => {
  it('clusters by components subdir', () => {
    expect(clusterIdForFile('src/components/board/IssueCard.jsx')).toBe('components/board')
    expect(clusterIdForFile('src/components/timeline/View.jsx')).toBe('components/timeline')
  })

  it('clusters by features subdir', () => {
    expect(clusterIdForFile('src/features/code-intelligence/index.js')).toBe(
      'features/code-intelligence'
    )
  })

  it('clusters generic src by top-level dir', () => {
    expect(clusterIdForFile('src/utils/dates.js')).toBe('src/utils')
    expect(clusterIdForFile('src/stores/issuesStore.js')).toBe('src/stores')
  })

  it('clusters server/* as a single cluster', () => {
    expect(clusterIdForFile('server/app.js')).toBe('server')
    expect(clusterIdForFile('server/db.js')).toBe('server')
  })

  it('clusters modules/* by sibling subproject', () => {
    expect(clusterIdForFile('modules/code-intel/local-indexer/src/indexer.js')).toBe(
      'modules/code-intel/local-indexer'
    )
  })
})

// ---------------------------------------------------------------------------
// indexer + responder integration
// ---------------------------------------------------------------------------
describe('buildIndex', () => {
  it('indexes the fixture and finds all exports', () => {
    const idx = buildIndex(repoRoot)
    expect(idx.fileCount).toBe(5)
    // formatDate, DAY_MS, IssueCard, IssueDetail, useIssuesStore, startServer = 6
    expect(idx.symbolCount).toBeGreaterThanOrEqual(6)
    expect(idx.clusterCount).toBeGreaterThanOrEqual(3)
  })

  it('builds the importedBy reverse map', () => {
    const idx = buildIndex(repoRoot)
    const datesAbs = path.join(repoRoot, 'src/utils/dates.js')
    const importers = idx.importedBy.get(datesAbs)
    expect(importers).toBeDefined()
    // 3 files import dates.js: IssueCard, IssueDetail, issuesStore
    expect(importers.length).toBe(3)
  })
})

describe('createLocalResponder', () => {
  it('throws when repoRoot is missing', () => {
    expect(() => createLocalResponder({})).toThrow(/repoRoot/)
  })

  it('impact() finds all callers of a symbol', async () => {
    const responder = createLocalResponder({ repoRoot })
    const result = await responder.impact({ symbol: 'formatDate' })
    expect(result.target.name).toBe('formatDate')
    expect(result.target.file).toBe('src/utils/dates.js')
    expect(result.callsiteCount).toBe(3)
    expect(result.affectedClusters).toContain('components/board')
    expect(result.affectedClusters).toContain('src/stores')
  })

  it('impact() returns empty shape for unknown symbol', async () => {
    const responder = createLocalResponder({ repoRoot })
    const result = await responder.impact({ symbol: 'doesNotExist' })
    expect(result.callsiteCount).toBe(0)
    expect(result.callers).toEqual([])
  })

  it('impact() supports file: query', async () => {
    const responder = createLocalResponder({ repoRoot })
    const result = await responder.impact({ file: 'src/utils/dates.js' })
    expect(result.callsiteCount).toBe(3)
  })

  it('search() returns hits ordered by score', async () => {
    const responder = createLocalResponder({ repoRoot })
    const hits = await responder.search('format')
    expect(hits.length).toBeGreaterThan(0)
    expect(hits[0].symbol.name).toBe('formatDate')
    expect(hits[0].score).toBe(0.85) // prefix match
  })

  it('search() returns empty array for empty query', async () => {
    const responder = createLocalResponder({ repoRoot })
    expect(await responder.search('')).toEqual([])
  })

  it('listClusters() returns every cluster sorted by callsite count', async () => {
    const responder = createLocalResponder({ repoRoot })
    const clusters = await responder.listClusters()
    expect(clusters.length).toBeGreaterThanOrEqual(3)
    // src/utils should rank highest (3 callsites for dates.js)
    expect(clusters[0].id).toBe('src/utils')
  })

  it('queryGraph() returns localOnly:true marker, never throws', async () => {
    const responder = createLocalResponder({ repoRoot })
    const result = await responder.queryGraph('MATCH (n) RETURN n')
    expect(result).toMatchObject({ rows: [], localOnly: true })
  })

  it('detectChanges() reports added files on rebuild', async () => {
    const responder = createLocalResponder({ repoRoot })
    // Prime the index
    await responder.impact({ symbol: 'formatDate' })
    // Add a new file
    writeFile('src/utils/newThing.js', `export function newlyAdded() { return 1 }`)
    const cs = await responder.detectChanges()
    expect(cs.changedFiles).toContain('src/utils/newThing.js')
    expect(cs.affectedClusterIds).toContain('src/utils')
    expect(cs.changedSymbols.some((s) => s.name === 'newlyAdded')).toBe(true)
  })

  it('getStats() reports counts after first query', async () => {
    const responder = createLocalResponder({ repoRoot })
    await responder.impact({ symbol: 'formatDate' })
    const stats = responder.getStats()
    expect(stats.fileCount).toBe(5)
    expect(stats.symbolCount).toBeGreaterThanOrEqual(6)
    expect(stats.builtAtMs).toBeGreaterThan(0)
  })
})
