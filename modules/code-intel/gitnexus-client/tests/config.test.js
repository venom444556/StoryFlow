import { describe, it, expect } from 'vitest'
import { validateConfig, isOpenRouterUrl } from '../src/config.js'
import { createGitNexusClient } from '../src/client.js'

const validLLM = {
  baseUrl: 'https://llm.internal.example.com/v1',
  apiKey: 'sk-test-123',
}

const validCfg = () => ({
  version: '1.5.3',
  repoPath: '/tmp/repo',
  llm: { ...validLLM },
})

describe('validateConfig — fail-closed safety', () => {
  it("rejects version: 'latest' with a clear error", () => {
    expect(() => validateConfig({ ...validCfg(), version: 'latest' })).toThrow(
      /latest.*not allowed|pinned semver/i
    )
  })

  it('rejects missing version', () => {
    const cfg = validCfg()
    delete cfg.version
    expect(() => validateConfig(cfg)).toThrow(/version is required/i)
  })

  it('rejects non-semver version', () => {
    expect(() => validateConfig({ ...validCfg(), version: 'v1' })).toThrow(/not a valid semver/i)
  })

  it('accepts a valid pinned semver', () => {
    const cfg = validateConfig(validCfg())
    expect(cfg.version).toBe('1.5.3')
  })

  it('rejects config with no llm block', () => {
    const cfg = validCfg()
    delete cfg.llm
    expect(() => validateConfig(cfg)).toThrow(/llm is REQUIRED/i)
  })

  it('rejects llm block missing baseUrl', () => {
    expect(() =>
      validateConfig({
        ...validCfg(),
        llm: { apiKey: 'sk-x' },
      })
    ).toThrow(/llm\.baseUrl is required/i)
  })

  it('rejects llm block missing apiKey', () => {
    expect(() =>
      validateConfig({
        ...validCfg(),
        llm: { baseUrl: 'https://x.example.com' },
      })
    ).toThrow(/llm\.apiKey is required/i)
  })

  it('rejects OpenRouter baseUrl without allowOpenRouter', () => {
    expect(() =>
      validateConfig({
        ...validCfg(),
        llm: {
          baseUrl: 'https://openrouter.ai/api/v1',
          apiKey: 'sk-x',
        },
      })
    ).toThrow(/OpenRouter.*blocked|allowOpenRouter/i)
  })

  it('rejects *.openrouter.ai subdomain without allowOpenRouter', () => {
    expect(() =>
      validateConfig({
        ...validCfg(),
        llm: {
          baseUrl: 'https://api.openrouter.ai/v1',
          apiKey: 'sk-x',
        },
      })
    ).toThrow(/OpenRouter/i)
  })

  it('allows OpenRouter when allowOpenRouter is explicitly true', () => {
    const cfg = validateConfig({
      ...validCfg(),
      llm: {
        baseUrl: 'https://openrouter.ai/api/v1',
        apiKey: 'sk-x',
        allowOpenRouter: true,
      },
    })
    expect(cfg.llm.allowOpenRouter).toBe(true)
  })

  it('rejects missing repoPath', () => {
    const cfg = validCfg()
    delete cfg.repoPath
    expect(() => validateConfig(cfg)).toThrow(/repoPath is required/i)
  })

  it('rejects scarfAnalytics: true', () => {
    expect(() => validateConfig({ ...validCfg(), scarfAnalytics: true })).toThrow(
      /scarfAnalytics.*not permitted/i
    )
  })

  it('returns a frozen normalized config', () => {
    const cfg = validateConfig(validCfg())
    expect(Object.isFrozen(cfg)).toBe(true)
    expect(Object.isFrozen(cfg.llm)).toBe(true)
    expect(cfg.scarfAnalytics).toBe(false)
  })
})

describe('isOpenRouterUrl', () => {
  it('matches openrouter.ai', () => {
    expect(isOpenRouterUrl('https://openrouter.ai/api/v1')).toBe(true)
  })
  it('matches subdomains', () => {
    expect(isOpenRouterUrl('https://api.openrouter.ai/v1')).toBe(true)
  })
  it('does not match lookalikes', () => {
    expect(isOpenRouterUrl('https://notopenrouter.ai')).toBe(false)
    expect(isOpenRouterUrl('https://openrouter.ai.evil.com')).toBe(false)
  })
  it('does not match other hosts', () => {
    expect(isOpenRouterUrl('https://api.openai.com')).toBe(false)
  })
})

describe('createGitNexusClient — construction-time fail-closed', () => {
  it('throws on version: latest', () => {
    expect(() => createGitNexusClient({ ...validCfg(), version: 'latest' })).toThrow(/latest/i)
  })
  it('throws when llm is missing', () => {
    const cfg = validCfg()
    delete cfg.llm
    expect(() => createGitNexusClient(cfg)).toThrow(/llm is REQUIRED/i)
  })
  it('throws on OpenRouter without opt-in', () => {
    expect(() =>
      createGitNexusClient({
        ...validCfg(),
        llm: {
          baseUrl: 'https://openrouter.ai/api/v1',
          apiKey: 'sk-x',
        },
      })
    ).toThrow(/OpenRouter/i)
  })
})
