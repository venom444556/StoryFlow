/**
 * Process lifecycle for the GitNexus MCP subprocess.
 *
 * Responsibilities:
 *   - Spawn `npx -y gitnexus@<pinnedVersion> mcp` with a sanitized env.
 *   - Idempotent start(): calling twice does not spawn twice.
 *   - stop(): graceful kill, idempotent, never throws if called twice.
 *   - Sanitized launch log written to <repoPath>/.gitnexus/launch.log.
 *     API key is ALWAYS redacted as "<redacted>".
 *
 * NOTE on stubbing: real integration with a GitNexus MCP wire protocol is
 * out of scope for this build session. The MCP request/response plumbing
 * for impact/search/etc. is stubbed and returns "not yet connected" errors
 * (see client.js). Process lifecycle + env + args are NOT stubbed — they
 * run for real and are what the contract tests exercise.
 */

import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

/**
 * Spawner injection seam so tests can capture args/env without actually
 * shelling out to npx.
 * @typedef {(cmd: string, args: string[], opts: object) => import("node:child_process").ChildProcess} Spawner
 */

/**
 * Build the launch arguments for GitNexus. The version is always pinned;
 * we never pass `@latest`.
 * @param {string} version
 * @returns {{ cmd: string, args: string[] }}
 */
export function buildLaunchArgs(version) {
  return {
    cmd: 'npx',
    args: ['-y', `gitnexus@${version}`, 'mcp'],
  }
}

/**
 * Build the sanitized environment for the child process.
 * @param {object} params
 * @param {string} params.repoPath
 * @param {string} params.llmBaseUrl
 * @param {string} params.llmApiKey
 * @param {NodeJS.ProcessEnv} [params.parentEnv]
 * @returns {NodeJS.ProcessEnv}
 */
export function buildLaunchEnv({ repoPath, llmBaseUrl, llmApiKey, parentEnv = process.env }) {
  return {
    ...parentEnv,
    SCARF_ANALYTICS: 'false',
    GITNEXUS_API_KEY: llmApiKey,
    GITNEXUS_LLM_BASE_URL: llmBaseUrl,
    GITNEXUS_REPO_PATH: repoPath,
  }
}

/**
 * Produce a redacted copy of the env for logging. API key is always masked.
 * @param {NodeJS.ProcessEnv} env
 * @returns {Record<string, string|undefined>}
 */
export function redactEnvForLog(env) {
  const redacted = {}
  for (const [k, v] of Object.entries(env)) {
    if (k === 'GITNEXUS_API_KEY') {
      redacted[k] = '<redacted>'
    } else if (
      k === 'SCARF_ANALYTICS' ||
      k === 'GITNEXUS_LLM_BASE_URL' ||
      k === 'GITNEXUS_REPO_PATH'
    ) {
      redacted[k] = v
    }
  }
  return redacted
}

/**
 * Write a sanitized launch record to <repoPath>/.gitnexus/launch.log.
 * Creates the directory if needed. Never throws — logging failures do not
 * block startup, but they are reported via console.warn.
 *
 * @param {object} params
 * @param {string} params.repoPath
 * @param {string} params.cmd
 * @param {string[]} params.args
 * @param {NodeJS.ProcessEnv} params.env
 */
export function writeLaunchLog({ repoPath, cmd, args, env }) {
  try {
    const dir = path.join(repoPath, '.gitnexus')
    fs.mkdirSync(dir, { recursive: true })
    const logFile = path.join(dir, 'launch.log')
    const entry = {
      ts: new Date().toISOString(),
      cmd,
      args,
      env: redactEnvForLog(env),
    }
    fs.appendFileSync(logFile, JSON.stringify(entry) + '\n', 'utf8')
    return logFile
  } catch (err) {
    console.warn(
      `[gitnexus-client] Failed to write launch log: ${err && err.message ? err.message : err}`
    )
    return null
  }
}

/**
 * Create a lifecycle controller bound to a validated config.
 *
 * @param {Readonly<import("./index.js").GitNexusConfig>} cfg
 * @param {{ spawner?: Spawner }} [deps]
 */
export function createLifecycle(cfg, deps = {}) {
  const spawner = deps.spawner || spawn

  /** @type {import("node:child_process").ChildProcess | null} */
  let child = null
  /** @type {"idle"|"starting"|"running"|"stopped"} */
  let state = 'idle'
  /** @type {Promise<void> | null} */
  let startPromise = null

  async function start() {
    // Idempotent: if already running or starting, reuse.
    if (state === 'running') return
    if (startPromise) return startPromise

    state = 'starting'
    startPromise = (async () => {
      const { cmd, args } = buildLaunchArgs(cfg.version)
      const env = buildLaunchEnv({
        repoPath: cfg.repoPath,
        llmBaseUrl: cfg.llm.baseUrl,
        llmApiKey: cfg.llm.apiKey,
      })

      writeLaunchLog({ repoPath: cfg.repoPath, cmd, args, env })

      child = spawner(cmd, args, {
        cwd: cfg.repoPath,
        env,
        // `detached: true` lets the child survive the hook that spawned it
        // on POSIX. We still retain the handle so stop() can kill it.
        // stdio 'ignore' so the parent doesn't block on child pipes.
        detached: true,
        stdio: 'ignore',
      })

      if (child && typeof child.unref === 'function') {
        // Don't keep the event loop alive on account of the child.
        child.unref()
      }

      if (child) {
        child.on('exit', () => {
          if (state !== 'stopped') {
            state = 'stopped'
          }
          child = null
        })
        child.on('error', () => {
          // Swallow spawn errors at the lifecycle level; health() will
          // report "down" and subsequent calls will fail closed.
          if (state !== 'stopped') {
            state = 'stopped'
          }
          child = null
        })
      }

      state = 'running'
    })()

    try {
      await startPromise
    } finally {
      startPromise = null
    }
  }

  async function stop() {
    // Idempotent and never throws.
    if (state === 'idle' || state === 'stopped') {
      state = 'stopped'
      child = null
      return
    }
    try {
      if (child && typeof child.kill === 'function') {
        child.kill('SIGTERM')
      }
    } catch {
      // ignore — stop() is fire-and-forget
    }
    child = null
    state = 'stopped'
  }

  async function health() {
    return state === 'running' && child !== null ? 'ok' : 'down'
  }

  function _isRunning() {
    return state === 'running' && child !== null
  }

  return { start, stop, health, _isRunning }
}
