import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { EventEmitter } from 'node:events'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { setImmediate } from 'node:timers'
import { createGitNexusClient } from '../src/client.js'

class FakeChild extends EventEmitter {
  kill() {
    setImmediate(() => this.emit('exit', 0))
    return true
  }
  unref() {}
}

function makeSpawner() {
  const calls = []
  return {
    calls,
    spawner: (cmd, args, opts) => {
      const child = new FakeChild()
      calls.push({ cmd, args, opts, child })
      return child
    },
  }
}

let repoPath
beforeEach(() => {
  repoPath = fs.mkdtempSync(path.join(os.tmpdir(), 'gnx-client-'))
})
afterEach(() => {
  try {
    fs.rmSync(repoPath, { recursive: true, force: true })
  } catch {
    /* ignore */
  }
})

function cfg() {
  return {
    version: '1.5.3',
    repoPath,
    llm: {
      baseUrl: 'https://llm.internal.example.com/v1',
      apiKey: 'sk-test',
    },
  }
}

// Fixture ImpactRaw response conforming to CONTRACTS.md
const impactFixture = {
  target: { name: 'auth.verify', file: 'src/auth.js', line: 42, kind: 'function' },
  callers: [
    {
      from: { name: 'routes.login', file: 'src/routes/login.js', kind: 'function' },
      to: { name: 'auth.verify', file: 'src/auth.js', kind: 'function' },
    },
    {
      from: { name: 'routes.session', file: 'src/routes/session.js', kind: 'function' },
      to: { name: 'auth.verify', file: 'src/auth.js', kind: 'function' },
      via: 'middleware.auth',
    },
  ],
  callsiteCount: 2,
  affectedClusters: ['cluster-auth', 'cluster-routes'],
  affectedServices: 1,
}

const fixtureResponder = {
  impact: async () => impactFixture,
  search: async () => [
    {
      symbol: { name: 'auth.verify', file: 'src/auth.js' },
      score: 0.92,
      snippet: 'function verify(token) { ... }',
    },
  ],
  listClusters: async () => [
    {
      id: 'cluster-auth',
      name: 'Authentication',
      symbols: [{ name: 'auth.verify', file: 'src/auth.js' }],
      callsiteCount: 5,
    },
  ],
  queryGraph: async () => ({ rows: [] }),
  detectChanges: async () => ({
    changedFiles: ['src/auth.js'],
    changedSymbols: [{ name: 'auth.verify', file: 'src/auth.js' }],
    affectedClusterIds: ['cluster-auth'],
    fromSha: 'abc123',
    toSha: 'def456',
  }),
}

describe('GitNexusClient MCP methods', () => {
  it('impact() returns a correctly typed ImpactRaw against the fixture', async () => {
    const { spawner } = makeSpawner()
    const client = createGitNexusClient(cfg(), {
      spawner,
      responder: fixtureResponder,
    })
    await client.start()

    const result = await client.impact({ symbol: 'auth.verify' })

    // Type-shape assertions per CONTRACTS.md ImpactRaw
    expect(result.target).toBeDefined()
    expect(typeof result.target.name).toBe('string')
    expect(typeof result.target.file).toBe('string')
    expect(Array.isArray(result.callers)).toBe(true)
    expect(typeof result.callsiteCount).toBe('number')
    expect(Array.isArray(result.affectedClusters)).toBe(true)
    expect(typeof result.affectedServices).toBe('number')

    // Caller shape
    for (const c of result.callers) {
      expect(c.from).toBeDefined()
      expect(c.to).toBeDefined()
      expect(typeof c.from.name).toBe('string')
      expect(typeof c.to.name).toBe('string')
    }

    expect(result.callsiteCount).toBe(2)
    expect(result.affectedClusters).toContain('cluster-auth')

    await client.stop()
  })

  it('impact() throws clearly if called before start()', async () => {
    const { spawner } = makeSpawner()
    const client = createGitNexusClient(cfg(), {
      spawner,
      responder: fixtureResponder,
    })
    await expect(client.impact({ symbol: 'x' })).rejects.toThrow(/process is not running/i)
  })

  it('search() returns SearchHit[] shape', async () => {
    const { spawner } = makeSpawner()
    const client = createGitNexusClient(cfg(), {
      spawner,
      responder: fixtureResponder,
    })
    await client.start()
    const hits = await client.search('verify', { topK: 5 })
    expect(Array.isArray(hits)).toBe(true)
    expect(hits[0].symbol).toBeDefined()
    expect(typeof hits[0].score).toBe('number')
    expect(typeof hits[0].snippet).toBe('string')
    await client.stop()
  })

  it('listClusters() returns Cluster[] shape', async () => {
    const { spawner } = makeSpawner()
    const client = createGitNexusClient(cfg(), {
      spawner,
      responder: fixtureResponder,
    })
    await client.start()
    const clusters = await client.listClusters()
    expect(clusters[0].id).toBe('cluster-auth')
    expect(typeof clusters[0].callsiteCount).toBe('number')
    await client.stop()
  })

  it('detectChanges() returns ChangeSet shape', async () => {
    const { spawner } = makeSpawner()
    const client = createGitNexusClient(cfg(), {
      spawner,
      responder: fixtureResponder,
    })
    await client.start()
    const cs = await client.detectChanges()
    expect(Array.isArray(cs.changedFiles)).toBe(true)
    expect(Array.isArray(cs.changedSymbols)).toBe(true)
    expect(typeof cs.fromSha).toBe('string')
    expect(typeof cs.toSha).toBe('string')
    await client.stop()
  })

  it("default (no responder) client throws 'not yet connected' on impact", async () => {
    const { spawner } = makeSpawner()
    const client = createGitNexusClient(cfg(), { spawner })
    await client.start()
    await expect(client.impact({ symbol: 'x' })).rejects.toThrow(/not yet connected/i)
    await client.stop()
  })
})
