// @vitest-environment node
// ---------------------------------------------------------------------------
// Tests for server/codeIntelligence.js — GitNexus lifecycle owner.
//
// These tests write a real config file to .storyflow/modules/code-intelligence.json
// at the repo root (the module reads from a fixed absolute path computed from
// import.meta.url). Each test restores the previous state in afterEach so they
// never leave the repo dirty.
//
// The real createGitNexusClient is swapped for a fake via _resetForTests to
// avoid spawning any subprocesses.
// ---------------------------------------------------------------------------

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  loadServerConfig,
  startCodeIntelligence,
  stopCodeIntelligence,
  _resetForTests,
} from './codeIntelligence.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const REPO_ROOT = path.resolve(__dirname, '..')
const CONFIG_DIR = path.join(REPO_ROOT, '.storyflow', 'modules')
const CONFIG_PATH = path.join(CONFIG_DIR, 'code-intelligence.json')

function writeConfig(obj) {
  fs.mkdirSync(CONFIG_DIR, { recursive: true })
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(obj, null, 2), 'utf8')
}

function removeConfig() {
  try {
    fs.unlinkSync(CONFIG_PATH)
  } catch (err) {
    if (err.code !== 'ENOENT') throw err
  }
}

// A minimal valid config skeleton.
function validConfig(overrides = {}) {
  return {
    enabled: true,
    gitnexusVersion: '1.5.3',
    repoPath: '/tmp/fake-repo',
    llm: {
      baseUrl: 'https://api.example.com/v1',
      apiKey: 'sk-test-key',
    },
    ...overrides,
  }
}

// Fake client factory — records calls, lets tests drive success/failure.
function makeFakeFactory({ startImpl, stopImpl } = {}) {
  const calls = { construct: 0, start: 0, stop: 0 }
  const factory = (cfg) => {
    calls.construct += 1
    calls.lastConfig = cfg
    return {
      async start() {
        calls.start += 1
        if (startImpl) await startImpl()
      },
      async stop() {
        calls.stop += 1
        if (stopImpl) await stopImpl()
      },
    }
  }
  return { factory, calls }
}

let hadConfigBefore = false
let configBackup = null

beforeEach(() => {
  // Back up any pre-existing config file so tests never clobber user state.
  hadConfigBefore = fs.existsSync(CONFIG_PATH)
  configBackup = hadConfigBefore ? fs.readFileSync(CONFIG_PATH, 'utf8') : null
  removeConfig()
  _resetForTests()
  vi.spyOn(console, 'log').mockImplementation(() => {})
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(async () => {
  await stopCodeIntelligence()
  removeConfig()
  if (hadConfigBefore && configBackup !== null) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true })
    fs.writeFileSync(CONFIG_PATH, configBackup, 'utf8')
  }
  _resetForTests()
  vi.restoreAllMocks()
})

describe('loadServerConfig', () => {
  it('returns { enabled: false } when the config file does not exist', () => {
    expect(loadServerConfig()).toEqual({ enabled: false })
  })

  it('returns { enabled: false } and logs for malformed JSON', () => {
    fs.mkdirSync(CONFIG_DIR, { recursive: true })
    fs.writeFileSync(CONFIG_PATH, '{ not valid json', 'utf8')
    const cfg = loadServerConfig()
    expect(cfg).toEqual({ enabled: false })
    expect(console.error).toHaveBeenCalled()
  })

  it('returns { enabled: false } when the enabled flag is false', () => {
    writeConfig({ enabled: false })
    expect(loadServerConfig()).toEqual({ enabled: false })
  })

  it('rejects "latest" as gitnexusVersion', () => {
    writeConfig(validConfig({ gitnexusVersion: 'latest' }))
    expect(loadServerConfig()).toEqual({ enabled: false })
    expect(console.error).toHaveBeenCalled()
  })

  it('rejects a missing llm block', () => {
    const cfg = validConfig()
    delete cfg.llm
    writeConfig(cfg)
    expect(loadServerConfig()).toEqual({ enabled: false })
  })

  it('rejects OpenRouter base URLs unless allowOpenRouter is true', () => {
    writeConfig(
      validConfig({
        llm: { baseUrl: 'https://openrouter.ai/api/v1', apiKey: 'sk-test' },
      })
    )
    expect(loadServerConfig()).toEqual({ enabled: false })
  })

  it('accepts OpenRouter when allowOpenRouter is explicitly true', () => {
    writeConfig(
      validConfig({
        llm: {
          baseUrl: 'https://openrouter.ai/api/v1',
          apiKey: 'sk-test',
          allowOpenRouter: true,
        },
      })
    )
    const cfg = loadServerConfig()
    expect(cfg.enabled).toBe(true)
  })

  it('returns a fully-populated object for a valid config', () => {
    writeConfig(validConfig())
    const cfg = loadServerConfig()
    expect(cfg).toMatchObject({
      enabled: true,
      localOnly: false,
      gitnexusVersion: '1.5.3',
      repoPath: '/tmp/fake-repo',
      llm: {
        baseUrl: 'https://api.example.com/v1',
        apiKey: 'sk-test-key',
        allowOpenRouter: false,
      },
    })
  })

  it('accepts localOnly mode without gitnexusVersion or llm', () => {
    writeConfig({ enabled: true, localOnly: true, repoPath: '/tmp/fake-repo' })
    const cfg = loadServerConfig()
    expect(cfg).toMatchObject({
      enabled: true,
      localOnly: true,
      repoPath: '/tmp/fake-repo',
    })
    // Crucially: no llm field at all
    expect(cfg.llm).toBeUndefined()
    expect(cfg.gitnexusVersion).toBeUndefined()
  })

  it('localOnly mode falls back to cwd when repoPath is missing', () => {
    writeConfig({ enabled: true, localOnly: true })
    const cfg = loadServerConfig()
    expect(cfg.enabled).toBe(true)
    expect(cfg.localOnly).toBe(true)
    expect(cfg.repoPath).toBe(process.cwd())
  })

  it('localOnly mode ignores any llm block that happens to be present', () => {
    writeConfig({
      enabled: true,
      localOnly: true,
      repoPath: '/tmp/fake-repo',
      llm: { baseUrl: 'https://evil.example.com', apiKey: 'sk-evil' },
    })
    const cfg = loadServerConfig()
    expect(cfg.enabled).toBe(true)
    expect(cfg.localOnly).toBe(true)
    expect(cfg.llm).toBeUndefined()
  })
})

describe('startCodeIntelligence', () => {
  it('is a silent no-op when no config file exists', async () => {
    const { factory, calls } = makeFakeFactory()
    _resetForTests({ factory })
    await expect(startCodeIntelligence()).resolves.toBeUndefined()
    expect(calls.construct).toBe(0)
    expect(calls.start).toBe(0)
  })

  it('is a silent no-op when config is disabled', async () => {
    writeConfig({ enabled: false })
    const { factory, calls } = makeFakeFactory()
    _resetForTests({ factory })
    await startCodeIntelligence()
    expect(calls.construct).toBe(0)
  })

  it('constructs and starts the client when config is enabled', async () => {
    writeConfig(validConfig())
    const { factory, calls } = makeFakeFactory()
    _resetForTests({ factory })
    await startCodeIntelligence()
    expect(calls.construct).toBe(1)
    expect(calls.start).toBe(1)
    expect(calls.lastConfig).toMatchObject({
      version: '1.5.3',
      repoPath: '/tmp/fake-repo',
      llm: { baseUrl: 'https://api.example.com/v1', apiKey: 'sk-test-key' },
    })
  })

  it('is idempotent — calling twice only starts one client', async () => {
    writeConfig(validConfig())
    const { factory, calls } = makeFakeFactory()
    _resetForTests({ factory })
    await startCodeIntelligence()
    await startCodeIntelligence()
    expect(calls.construct).toBe(1)
    expect(calls.start).toBe(1)
  })

  it('catches client start errors and leaves the feature disabled (fail-open)', async () => {
    writeConfig(validConfig())
    const { factory, calls } = makeFakeFactory({
      startImpl: async () => {
        throw new Error('boom: gitnexus died')
      },
    })
    _resetForTests({ factory })
    await expect(startCodeIntelligence()).resolves.toBeUndefined()
    expect(calls.construct).toBe(1)
    expect(calls.start).toBe(1)
    expect(console.error).toHaveBeenCalled()
    // Per contract: on failure, client=null and started=false. Stopping is a no-op.
    await expect(stopCodeIntelligence()).resolves.toBeUndefined()
    expect(calls.stop).toBe(0)
  })

  it('catches constructor errors and leaves the feature disabled', async () => {
    writeConfig(validConfig())
    const factory = () => {
      throw new Error('bad config at construct time')
    }
    _resetForTests({ factory })
    await expect(startCodeIntelligence()).resolves.toBeUndefined()
    expect(console.error).toHaveBeenCalled()
  })

  it('passes localOnly:true to the client factory in local-only mode', async () => {
    writeConfig({ enabled: true, localOnly: true, repoPath: '/tmp/fake-repo' })
    const { factory, calls } = makeFakeFactory()
    _resetForTests({ factory })
    await startCodeIntelligence()
    expect(calls.construct).toBe(1)
    expect(calls.lastConfig).toMatchObject({
      localOnly: true,
      repoPath: '/tmp/fake-repo',
    })
    // Crucially: never passes a version or llm block in local-only mode
    expect(calls.lastConfig.version).toBeUndefined()
    expect(calls.lastConfig.llm).toBeUndefined()
  })
})

describe('stopCodeIntelligence', () => {
  it('is a no-op when the client was never started', async () => {
    const { factory, calls } = makeFakeFactory()
    _resetForTests({ factory })
    await expect(stopCodeIntelligence()).resolves.toBeUndefined()
    expect(calls.stop).toBe(0)
  })

  it('calls client.stop() after a successful start', async () => {
    writeConfig(validConfig())
    const { factory, calls } = makeFakeFactory()
    _resetForTests({ factory })
    await startCodeIntelligence()
    await stopCodeIntelligence()
    expect(calls.stop).toBe(1)
  })

  it('is idempotent — a second stop call does not throw or double-stop', async () => {
    writeConfig(validConfig())
    const { factory, calls } = makeFakeFactory()
    _resetForTests({ factory })
    await startCodeIntelligence()
    await stopCodeIntelligence()
    await stopCodeIntelligence()
    expect(calls.stop).toBe(1)
  })

  it('swallows errors thrown by client.stop()', async () => {
    writeConfig(validConfig())
    const { factory } = makeFakeFactory({
      stopImpl: async () => {
        throw new Error('stop blew up')
      },
    })
    _resetForTests({ factory })
    await startCodeIntelligence()
    await expect(stopCodeIntelligence()).resolves.toBeUndefined()
    expect(console.error).toHaveBeenCalled()
  })
})
