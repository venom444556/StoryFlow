import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import process from 'node:process'

import {
  loadConfig,
  reloadConfig,
  resetConfigCache,
  validateConfig,
  isCodeIntelligenceEnabled,
} from '../config.js'

function withTempCwd(fn, fileContents) {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'sf-code-intel-'))
  const modulesDir = path.join(tmpRoot, '.storyflow', 'modules')
  fs.mkdirSync(modulesDir, { recursive: true })
  if (fileContents !== undefined) {
    fs.writeFileSync(path.join(modulesDir, 'code-intelligence.json'), fileContents)
  }
  const originalCwd = process.cwd()
  process.chdir(tmpRoot)
  try {
    return fn(tmpRoot)
  } finally {
    process.chdir(originalCwd)
    fs.rmSync(tmpRoot, { recursive: true, force: true })
  }
}

beforeEach(() => {
  resetConfigCache()
})

afterEach(() => {
  resetConfigCache()
  vi.restoreAllMocks()
})

describe('validateConfig', () => {
  it('returns disabled when raw is null/undefined/non-object', () => {
    expect(validateConfig(null)).toEqual({ enabled: false })
    expect(validateConfig(undefined)).toEqual({ enabled: false })
    expect(validateConfig('nope')).toEqual({ enabled: false })
  })

  it('returns disabled when enabled is not true', () => {
    expect(validateConfig({ enabled: false })).toEqual({ enabled: false })
    expect(validateConfig({})).toEqual({ enabled: false })
  })

  it('accepts a valid enabled config', () => {
    const cfg = validateConfig({
      enabled: true,
      gitnexusVersion: '1.5.3',
      repoPath: '/tmp/repo',
      llm: { baseUrl: 'http://localhost:11434/v1', apiKey: 'sk-local' },
      features: { impactBadges: true },
      thresholds: { preflightBlockAt: 'HIGH' },
    })
    expect(cfg.enabled).toBe(true)
    expect(cfg.gitnexusVersion).toBe('1.5.3')
    expect(cfg.repoPath).toBe('/tmp/repo')
    expect(cfg.llm.baseUrl).toBe('http://localhost:11434/v1')
    expect(cfg.llm.allowOpenRouter).toBe(false)
    expect(cfg.features.impactBadges).toBe(true)
    expect(cfg.features.codebaseMap).toBe(false)
    expect(cfg.thresholds.preflightBlockAt).toBe('HIGH')
  })

  it('throws when enabled and llm block is missing', () => {
    expect(() => validateConfig({ enabled: true, gitnexusVersion: '1.5.3' })).toThrow(
      /llm.*required/i
    )
  })

  it('throws when enabled and llm.apiKey is missing', () => {
    expect(() =>
      validateConfig({
        enabled: true,
        gitnexusVersion: '1.5.3',
        llm: { baseUrl: 'http://localhost' },
      })
    ).toThrow(/apiKey/i)
  })

  it('throws when gitnexusVersion is "latest"', () => {
    expect(() =>
      validateConfig({
        enabled: true,
        gitnexusVersion: 'latest',
        llm: { baseUrl: 'http://localhost', apiKey: 'k' },
      })
    ).toThrow(/pinned semver/i)
  })

  it('throws when baseUrl points to OpenRouter without opt-in', () => {
    expect(() =>
      validateConfig({
        enabled: true,
        gitnexusVersion: '1.5.3',
        llm: { baseUrl: 'https://openrouter.ai/api/v1', apiKey: 'k' },
      })
    ).toThrow(/OpenRouter/i)
  })

  it('accepts OpenRouter when explicitly opted in', () => {
    const cfg = validateConfig({
      enabled: true,
      gitnexusVersion: '1.5.3',
      llm: {
        baseUrl: 'https://openrouter.ai/api/v1',
        apiKey: 'k',
        allowOpenRouter: true,
      },
    })
    expect(cfg.enabled).toBe(true)
    expect(cfg.llm.allowOpenRouter).toBe(true)
  })

  it('rejects invalid preflightBlockAt', () => {
    expect(() =>
      validateConfig({
        enabled: true,
        gitnexusVersion: '1.5.3',
        llm: { baseUrl: 'http://localhost', apiKey: 'k' },
        thresholds: { preflightBlockAt: 'EXTREME' },
      })
    ).toThrow(/preflightBlockAt/i)
  })
})

describe('loadConfig', () => {
  it('returns disabled when the config file does not exist', () => {
    withTempCwd(() => {
      const cfg = loadConfig()
      expect(cfg).toEqual({ enabled: false })
      expect(isCodeIntelligenceEnabled()).toBe(false)
    })
  })

  it('returns disabled when the file is malformed JSON and logs a warning', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    withTempCwd(() => {
      const cfg = loadConfig()
      expect(cfg).toEqual({ enabled: false })
      expect(warn).toHaveBeenCalled()
    }, '{ this is not json')
  })

  it('loads and caches a valid config', () => {
    withTempCwd(
      () => {
        const cfg = reloadConfig()
        expect(cfg.enabled).toBe(true)
        expect(cfg.gitnexusVersion).toBe('1.5.3')
        expect(isCodeIntelligenceEnabled()).toBe(true)
        // cached
        expect(loadConfig()).toBe(cfg)
      },
      JSON.stringify({
        enabled: true,
        gitnexusVersion: '1.5.3',
        llm: { baseUrl: 'http://localhost:11434/v1', apiKey: 'k' },
      })
    )
  })
})
