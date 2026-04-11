import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { EventEmitter } from 'node:events'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { setImmediate } from 'node:timers'
import { buildLaunchArgs, buildLaunchEnv, redactEnvForLog } from '../src/lifecycle.js'
import { createGitNexusClient } from '../src/client.js'

/**
 * Fake child process: looks enough like a ChildProcess for lifecycle.js.
 */
class FakeChild extends EventEmitter {
  constructor() {
    super()
    this.killed = false
    this.killCount = 0
  }
  kill(signal) {
    this.killCount += 1
    this.killed = true
    // Simulate exit on next tick.
    setImmediate(() => this.emit('exit', 0, signal || 'SIGTERM'))
    return true
  }
  unref() {
    /* noop */
  }
}

function makeTempRepo() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gnx-test-'))
  return dir
}

function cleanupTempRepo(dir) {
  try {
    fs.rmSync(dir, { recursive: true, force: true })
  } catch {
    /* ignore */
  }
}

function makeSpawner() {
  /** @type {{ cmd: string, args: string[], opts: any, child: FakeChild }[]} */
  const calls = []
  const spawner = (cmd, args, opts) => {
    const child = new FakeChild()
    calls.push({ cmd, args, opts, child })
    return child
  }
  return { spawner, calls }
}

function baseCfg(repoPath) {
  return {
    version: '1.5.3',
    repoPath,
    llm: {
      baseUrl: 'https://llm.internal.example.com/v1',
      apiKey: 'sk-secret-do-not-log',
    },
  }
}

describe('buildLaunchArgs', () => {
  it('pins the version and uses npx -y', () => {
    expect(buildLaunchArgs('1.5.3')).toEqual({
      cmd: 'npx',
      args: ['-y', 'gitnexus@1.5.3', 'mcp'],
    })
  })
  it('never emits @latest', () => {
    const { args } = buildLaunchArgs('1.5.3')
    expect(args.join(' ')).not.toMatch(/latest/)
  })
})

describe('buildLaunchEnv', () => {
  it('sets SCARF_ANALYTICS=false', () => {
    const env = buildLaunchEnv({
      repoPath: '/r',
      llmBaseUrl: 'https://x',
      llmApiKey: 'sk-1',
      parentEnv: {},
    })
    expect(env.SCARF_ANALYTICS).toBe('false')
  })
  it('sets GITNEXUS_API_KEY and GITNEXUS_LLM_BASE_URL', () => {
    const env = buildLaunchEnv({
      repoPath: '/r',
      llmBaseUrl: 'https://x.example/v1',
      llmApiKey: 'sk-1',
      parentEnv: {},
    })
    expect(env.GITNEXUS_API_KEY).toBe('sk-1')
    expect(env.GITNEXUS_LLM_BASE_URL).toBe('https://x.example/v1')
    expect(env.GITNEXUS_REPO_PATH).toBe('/r')
  })
})

describe('redactEnvForLog', () => {
  it('redacts the API key', () => {
    const env = buildLaunchEnv({
      repoPath: '/r',
      llmBaseUrl: 'https://x',
      llmApiKey: 'sk-very-secret',
      parentEnv: {},
    })
    const r = redactEnvForLog(env)
    expect(r.GITNEXUS_API_KEY).toBe('<redacted>')
    expect(JSON.stringify(r)).not.toContain('sk-very-secret')
  })
})

describe('client lifecycle', () => {
  let repoPath
  beforeEach(() => {
    repoPath = makeTempRepo()
  })
  afterEach(() => {
    cleanupTempRepo(repoPath)
  })

  it('start() launches with SCARF_ANALYTICS=false in env', async () => {
    const { spawner, calls } = makeSpawner()
    const client = createGitNexusClient(baseCfg(repoPath), { spawner })
    await client.start()
    expect(calls).toHaveLength(1)
    expect(calls[0].opts.env.SCARF_ANALYTICS).toBe('false')
    await client.stop()
  })

  it('start() launches with pinned version, not @latest', async () => {
    const { spawner, calls } = makeSpawner()
    const client = createGitNexusClient(baseCfg(repoPath), { spawner })
    await client.start()
    expect(calls[0].cmd).toBe('npx')
    expect(calls[0].args).toEqual(['-y', 'gitnexus@1.5.3', 'mcp'])
    expect(calls[0].args.join(' ')).not.toMatch(/latest/)
    await client.stop()
  })

  it('start() sets GITNEXUS_API_KEY and GITNEXUS_LLM_BASE_URL', async () => {
    const { spawner, calls } = makeSpawner()
    const client = createGitNexusClient(baseCfg(repoPath), { spawner })
    await client.start()
    expect(calls[0].opts.env.GITNEXUS_API_KEY).toBe('sk-secret-do-not-log')
    expect(calls[0].opts.env.GITNEXUS_LLM_BASE_URL).toBe('https://llm.internal.example.com/v1')
    await client.stop()
  })

  it('start() is idempotent — calling twice does not spawn twice', async () => {
    const { spawner, calls } = makeSpawner()
    const client = createGitNexusClient(baseCfg(repoPath), { spawner })
    await client.start()
    await client.start()
    await client.start()
    expect(calls).toHaveLength(1)
    await client.stop()
  })

  it('writes a sanitized launch log with no API key', async () => {
    const { spawner } = makeSpawner()
    const client = createGitNexusClient(baseCfg(repoPath), { spawner })
    await client.start()
    const logFile = path.join(repoPath, '.gitnexus', 'launch.log')
    expect(fs.existsSync(logFile)).toBe(true)
    const content = fs.readFileSync(logFile, 'utf8')
    expect(content).not.toContain('sk-secret-do-not-log')
    expect(content).toContain('<redacted>')
    expect(content).toContain('gitnexus@1.5.3')
    await client.stop()
  })

  it("health() returns 'down' when the process is not running", async () => {
    const { spawner } = makeSpawner()
    const client = createGitNexusClient(baseCfg(repoPath), { spawner })
    expect(await client.health()).toBe('down')
  })

  it("health() returns 'ok' when the process is running", async () => {
    const { spawner } = makeSpawner()
    const client = createGitNexusClient(baseCfg(repoPath), { spawner })
    await client.start()
    expect(await client.health()).toBe('ok')
    await client.stop()
  })

  it('stop() is idempotent and never throws if called twice', async () => {
    const { spawner } = makeSpawner()
    const client = createGitNexusClient(baseCfg(repoPath), { spawner })
    await client.start()
    await expect(client.stop()).resolves.toBeUndefined()
    await expect(client.stop()).resolves.toBeUndefined()
    expect(await client.health()).toBe('down')
  })

  it('stop() before start() does not throw', async () => {
    const { spawner } = makeSpawner()
    const client = createGitNexusClient(baseCfg(repoPath), { spawner })
    await expect(client.stop()).resolves.toBeUndefined()
  })
})
