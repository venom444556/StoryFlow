/**
 * Indexer.
 *
 * Walks a repo, parses every source file, and builds two indexes:
 *
 *   1. symbolIndex: Map<symbolName, SymbolRef[]>
 *      All exported symbols across the repo, keyed by name. A name can map
 *      to multiple SymbolRefs because a name can be exported from more
 *      than one file (e.g. `default` exports, common names like `Button`).
 *
 *   2. importIndex: Map<targetFile, Array<{ from: string }>>
 *      For each file in the repo, the list of files that import from it.
 *      Used to compute callers for the impact() query.
 *
 * The indexer is built lazily on first query and cached. Call rebuild()
 * to invalidate. The whole index is in-memory and rebuilds in well under
 * a second on a repo of a few hundred files, which makes it feasible to
 * just rebuild on every server boot.
 */

import fs from 'node:fs'
import { walkSourceFiles, toRelative } from './walker.js'
import { parseFile } from './parser.js'
import { resolveImport } from './resolver.js'
import { clusterIdForFile } from './clusters.js'

/**
 * @typedef {Object} SymbolRef
 * @property {string} name
 * @property {string} file - Repo-relative path with forward slashes.
 * @property {number} [line]
 * @property {string} [kind]
 */

/**
 * @typedef {Object} IndexEntry
 * @property {string} relativePath
 * @property {string} cluster
 * @property {Array<{ name: string, kind: string, line: number }>} exports
 * @property {string[]} importsAbs - Resolved absolute paths of local imports.
 * @property {string[]} importsRel - Same set, repo-relative paths.
 */

/**
 * @typedef {Object} BuiltIndex
 * @property {string} repoRoot
 * @property {Map<string, IndexEntry>} files - keyed by absolute path
 * @property {Map<string, SymbolRef[]>} symbolIndex - keyed by symbol name (lowercase)
 * @property {Map<string, Array<{ fromAbs: string, fromRel: string }>>} importedBy - keyed by target absolute path
 * @property {Map<string, Set<string>>} clusterMembership - clusterId -> set of repo-relative paths
 * @property {number} fileCount
 * @property {number} symbolCount
 * @property {number} clusterCount
 * @property {number} builtAtMs
 */

/**
 * Build a fresh index for the given repo root.
 *
 * @param {string} repoRoot - Absolute path.
 * @returns {BuiltIndex}
 */
export function buildIndex(repoRoot) {
  const builtAtMs = Date.now()
  const sourceFiles = walkSourceFiles(repoRoot)

  /** @type {Map<string, IndexEntry>} */
  const files = new Map()
  /** @type {Map<string, SymbolRef[]>} */
  const symbolIndex = new Map()
  /** @type {Map<string, Array<{ fromAbs: string, fromRel: string }>>} */
  const importedBy = new Map()
  /** @type {Map<string, Set<string>>} */
  const clusterMembership = new Map()

  // First pass: parse every file, collect exports, register symbols.
  for (const absPath of sourceFiles) {
    let source
    try {
      source = fs.readFileSync(absPath, 'utf8')
    } catch {
      continue
    }
    const relativePath = toRelative(repoRoot, absPath)
    const cluster = clusterIdForFile(relativePath)
    const parsed = parseFile(relativePath, source)

    files.set(absPath, {
      relativePath,
      cluster,
      exports: parsed.exports,
      importsAbs: [],
      importsRel: [],
    })

    if (!clusterMembership.has(cluster)) {
      clusterMembership.set(cluster, new Set())
    }
    clusterMembership.get(cluster).add(relativePath)

    for (const exported of parsed.exports) {
      const key = exported.name.toLowerCase()
      const ref = {
        name: exported.name,
        file: relativePath,
        line: exported.line,
        kind: exported.kind,
      }
      if (!symbolIndex.has(key)) symbolIndex.set(key, [])
      symbolIndex.get(key).push(ref)
    }
  }

  // Second pass: resolve every file's import specs into absolute paths.
  for (const [absPath, entry] of files) {
    let source
    try {
      source = fs.readFileSync(absPath, 'utf8')
    } catch {
      continue
    }
    const parsed = parseFile(entry.relativePath, source)
    for (const spec of parsed.imports) {
      const resolved = resolveImport(absPath, spec)
      if (!resolved || !files.has(resolved)) continue
      entry.importsAbs.push(resolved)
      entry.importsRel.push(files.get(resolved).relativePath)

      if (!importedBy.has(resolved)) importedBy.set(resolved, [])
      importedBy.get(resolved).push({ fromAbs: absPath, fromRel: entry.relativePath })
    }
  }

  let symbolCount = 0
  for (const refs of symbolIndex.values()) symbolCount += refs.length

  return {
    repoRoot,
    files,
    symbolIndex,
    importedBy,
    clusterMembership,
    fileCount: files.size,
    symbolCount,
    clusterCount: clusterMembership.size,
    builtAtMs,
  }
}
