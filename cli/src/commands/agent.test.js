// @vitest-environment node
// ---------------------------------------------------------------------------
// Agent care package tests — exercises init, doctor, status via CLI
// ---------------------------------------------------------------------------

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { existsSync, rmSync, readFileSync, readdirSync, statSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { execFileSync } from 'node:child_process'

const CLI_BIN = join(process.cwd(), 'cli', 'bin', 'storyflow.js')
const TEST_DIR = join(process.cwd(), 'test-tmp-agent')
const AGENT_DIR = join(TEST_DIR, 'agent')

function sf(...args) {
  try {
    const result = execFileSync('node', [CLI_BIN, ...args], {
      cwd: TEST_DIR,
      env: { ...process.env, STORYFLOW_URL: 'http://localhost:99999' },
      stdio: 'pipe',
      timeout: 10000,
    })
    return { stdout: result.toString(), code: 0 }
  } catch (e) {
    return {
      stdout: e.stdout?.toString() || '',
      stderr: e.stderr?.toString() || '',
      code: e.status || 1,
    }
  }
}

describe('Agent Care Package CLI', () => {
  beforeEach(() => {
    if (existsSync(TEST_DIR)) rmSync(TEST_DIR, { recursive: true })
    mkdirSync(TEST_DIR, { recursive: true })
  })

  afterEach(() => {
    if (existsSync(TEST_DIR)) rmSync(TEST_DIR, { recursive: true })
  })

  describe('agent init', () => {
    it('creates the full scaffold', () => {
      sf('agent', 'init')
      expect(existsSync(join(AGENT_DIR, 'CLAUDE.md'))).toBe(true)
      expect(existsSync(join(AGENT_DIR, 'SKILL.md'))).toBe(true)
      expect(existsSync(join(AGENT_DIR, 'config.json'))).toBe(true)
      expect(existsSync(join(AGENT_DIR, 'hooks'))).toBe(true)
      expect(existsSync(join(AGENT_DIR, 'kb'))).toBe(true)
      expect(existsSync(join(AGENT_DIR, 'memory.db'))).toBe(true)
      expect(existsSync(join(AGENT_DIR, 'state'))).toBe(true)
    })

    it('is idempotent without --force', () => {
      sf('agent', 'init')
      const { stdout } = sf('agent', 'init')
      expect(stdout).toContain('already exists')
    })

    it('reinitializes with --force', () => {
      sf('agent', 'init')
      const { code } = sf('agent', 'init', '--force')
      expect(code).toBe(0)
    })

    it('creates executable hooks', () => {
      sf('agent', 'init')
      const hooks = readdirSync(join(AGENT_DIR, 'hooks')).filter((f) => f.endsWith('.sh'))
      expect(hooks.length).toBeGreaterThanOrEqual(4)
      for (const h of hooks) {
        const mode = statSync(join(AGENT_DIR, 'hooks', h)).mode
        expect(mode & 0o111).toBeTruthy()
      }
    })

    it('config.json is valid', () => {
      sf('agent', 'init')
      const config = JSON.parse(readFileSync(join(AGENT_DIR, 'config.json'), 'utf-8'))
      expect(config.version).toBe('1.0.0')
      expect(config.hooks.sessionStart).toBe('hooks/session-start.sh')
    })
  })

  describe('agent doctor --json', () => {
    it('returns checks array with failCount', () => {
      sf('agent', 'init')
      const { stdout } = sf('agent', 'doctor', '--json')
      const result = JSON.parse(stdout)
      expect(result).toHaveProperty('checks')
      expect(result).toHaveProperty('failCount')
      expect(Array.isArray(result.checks)).toBe(true)
    })

    it('detects missing agent package', () => {
      const { stdout } = sf('agent', 'doctor', '--json')
      const result = JSON.parse(stdout)
      const pkgCheck = result.checks.find((c) => c.name === 'Agent package present')
      expect(pkgCheck.pass).toBe(false)
    })

    it('passes package check after init', () => {
      sf('agent', 'init')
      const { stdout } = sf('agent', 'doctor', '--json')
      const result = JSON.parse(stdout)
      const pkgCheck = result.checks.find((c) => c.name === 'Agent package present')
      expect(pkgCheck.pass).toBe(true)
    })
  })

  describe('agent status --json', () => {
    it('returns status shape', () => {
      const { stdout } = sf('agent', 'status', '--json')
      const result = JSON.parse(stdout)
      expect(result).toHaveProperty('packagePresent')
      expect(result).toHaveProperty('memoryDbPresent')
      expect(result).toHaveProperty('hookCount')
    })

    it('shows installed after init', () => {
      sf('agent', 'init')
      const { stdout } = sf('agent', 'status', '--json')
      const result = JSON.parse(stdout)
      expect(result.packagePresent).toBe(true)
      expect(result.memoryDbPresent).toBe(true)
      expect(result.hookCount).toBeGreaterThanOrEqual(4)
    })
  })

  describe('agent install-hooks', () => {
    it('creates manifest.json', () => {
      sf('agent', 'init')
      sf('agent', 'install-hooks')
      const manifest = JSON.parse(readFileSync(join(AGENT_DIR, 'hooks', 'manifest.json'), 'utf-8'))
      expect(manifest.hooks).toHaveProperty('SessionStart')
      expect(manifest.installedAt).toBeTruthy()
    })
  })
})
