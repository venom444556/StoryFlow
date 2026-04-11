// ---------------------------------------------------------------------------
// Code Intelligence lifecycle — server-side owner of the GitNexus MCP client.
//
// Responsibilities:
//   - Load .storyflow/modules/code-intelligence.json (fail-closed).
//   - Enforce safety rules locally so misconfigurations fail at boot.
//   - Start/stop the GitNexus client with fail-open semantics: a broken
//     GitNexus must NEVER prevent StoryFlow from booting.
//   - Register process signal handlers so shutdown is graceful even when
//     the host server's own shutdown path does not know about this module.
// ---------------------------------------------------------------------------

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createGitNexusClient } from '../modules/code-intel/gitnexus-client/src/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Repo root is the parent of /server
const REPO_ROOT = path.resolve(__dirname, '..')
const CONFIG_PATH = path.join(REPO_ROOT, '.storyflow', 'modules', 'code-intelligence.json')

const LOG_PREFIX = '[CodeIntelligence]'
const SEMVER_RE = /^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/

let client = null
let started = false
let signalHandlersInstalled = false
// Injection seam for tests — swap in a fake factory without monkey-patching ESM.
let clientFactory = createGitNexusClient

function isOpenRouterHost(urlStr) {
  if (typeof urlStr !== 'string' || urlStr.length === 0) return false
  try {
    const host = new URL(urlStr).hostname.toLowerCase()
    return host === 'openrouter.ai' || host.endsWith('.openrouter.ai')
  } catch {
    return false
  }
}

/**
 * Load and validate the server-side code intelligence config.
 * Fail-closed: any problem => `{ enabled: false }`.
 *
 * Two modes are supported:
 *
 *   1. Local-only (recommended): set `localOnly: true`. Only `repoPath`
 *      is required (defaults to cwd). The feature uses the built-in
 *      local indexer — zero network, zero LLM, zero external subprocess.
 *
 *   2. Remote (legacy): requires `gitnexusVersion` and a full `llm`
 *      block with baseUrl + apiKey. Spawns a gitnexus subprocess that
 *      talks to the configured LLM endpoint.
 *
 * @returns {{enabled: false} | {
 *   enabled: true,
 *   localOnly: true,
 *   repoPath: string,
 * } | {
 *   enabled: true,
 *   localOnly: false,
 *   gitnexusVersion: string,
 *   repoPath: string,
 *   llm: { baseUrl: string, apiKey: string, allowOpenRouter?: boolean },
 * }}
 */
export function loadServerConfig() {
  let raw
  try {
    raw = fs.readFileSync(CONFIG_PATH, 'utf8')
  } catch (err) {
    if (err && err.code === 'ENOENT') {
      return { enabled: false }
    }
    console.error(`${LOG_PREFIX} Failed to read config at ${CONFIG_PATH}:`, err.message)
    return { enabled: false }
  }

  let parsed
  try {
    parsed = JSON.parse(raw)
  } catch (err) {
    console.error(`${LOG_PREFIX} Malformed JSON in ${CONFIG_PATH}:`, err.message)
    return { enabled: false }
  }

  if (!parsed || typeof parsed !== 'object') {
    console.error(`${LOG_PREFIX} Config must be a JSON object. Feature disabled.`)
    return { enabled: false }
  }

  if (parsed.enabled !== true) {
    return { enabled: false }
  }

  const repoPath =
    typeof parsed.repoPath === 'string' && parsed.repoPath.length > 0
      ? parsed.repoPath
      : process.cwd()

  // --- Local-only mode (zero external dependencies) ---
  if (parsed.localOnly === true) {
    return {
      enabled: true,
      localOnly: true,
      repoPath,
    }
  }

  // --- Remote mode validation below ---

  const version = parsed.gitnexusVersion
  if (typeof version !== 'string' || version.length === 0) {
    console.error(
      `${LOG_PREFIX} config.gitnexusVersion is required in remote mode. Feature disabled.`
    )
    return { enabled: false }
  }
  if (version === 'latest' || version === '@latest' || !SEMVER_RE.test(version)) {
    console.error(
      `${LOG_PREFIX} config.gitnexusVersion='${version}' must be a pinned semver (e.g. '1.5.3'). Feature disabled.`
    )
    return { enabled: false }
  }

  const llm = parsed.llm
  if (!llm || typeof llm !== 'object') {
    console.error(
      `${LOG_PREFIX} config.llm is required in remote mode with { baseUrl, apiKey }. Set localOnly:true to use the local indexer instead. Feature disabled.`
    )
    return { enabled: false }
  }
  if (typeof llm.baseUrl !== 'string' || llm.baseUrl.length === 0) {
    console.error(`${LOG_PREFIX} config.llm.baseUrl is required. Feature disabled.`)
    return { enabled: false }
  }
  if (typeof llm.apiKey !== 'string' || llm.apiKey.length === 0) {
    console.error(`${LOG_PREFIX} config.llm.apiKey is required. Feature disabled.`)
    return { enabled: false }
  }
  if (isOpenRouterHost(llm.baseUrl) && llm.allowOpenRouter !== true) {
    console.error(
      `${LOG_PREFIX} config.llm.baseUrl points to OpenRouter. Set llm.allowOpenRouter=true to opt in. Feature disabled.`
    )
    return { enabled: false }
  }

  return {
    enabled: true,
    localOnly: false,
    gitnexusVersion: version,
    repoPath,
    llm: {
      baseUrl: llm.baseUrl,
      apiKey: llm.apiKey,
      allowOpenRouter: llm.allowOpenRouter === true,
    },
  }
}

function installSignalHandlers() {
  if (signalHandlersInstalled) return
  signalHandlersInstalled = true
  // Best-effort cleanup: the host's own shutdown path may or may not call us.
  const handler = () => {
    stopCodeIntelligence().catch(() => {
      /* swallow — process is exiting */
    })
  }
  process.once('SIGTERM', handler)
  process.once('SIGINT', handler)
}

/**
 * Boot the GitNexus client if the feature is enabled. Idempotent.
 * Fail-open: swallows construction/start errors so the server always boots.
 *
 * @returns {Promise<void>}
 */
export async function startCodeIntelligence() {
  if (started) return

  const cfg = loadServerConfig()
  if (!cfg.enabled) {
    return
  }

  try {
    const clientConfig = cfg.localOnly
      ? { localOnly: true, repoPath: cfg.repoPath }
      : {
          version: cfg.gitnexusVersion,
          repoPath: cfg.repoPath,
          llm: cfg.llm,
        }
    const instance = clientFactory(clientConfig)
    await instance.start()
    client = instance
    started = true
    installSignalHandlers()
    if (cfg.localOnly) {
      console.log(
        `${LOG_PREFIX} Local indexer started (repo ${cfg.repoPath}) — zero external dependencies`
      )
    } else {
      console.log(
        `${LOG_PREFIX} GitNexus client started (version ${cfg.gitnexusVersion}, repo ${cfg.repoPath})`
      )
    }
  } catch (err) {
    console.error(
      `${LOG_PREFIX} Failed to start code intelligence — feature disabled:`,
      err.message
    )
    client = null
    started = false
  }
}

/**
 * Stop the GitNexus client cleanly. Idempotent. Swallows errors.
 *
 * @returns {Promise<void>}
 */
export async function stopCodeIntelligence() {
  if (!started || !client) {
    client = null
    started = false
    return
  }
  const instance = client
  client = null
  started = false
  try {
    await instance.stop()
    console.log(`${LOG_PREFIX} GitNexus client stopped`)
  } catch (err) {
    console.error(`${LOG_PREFIX} Error stopping GitNexus client (ignored):`, err.message)
  }
}

/**
 * Returns the currently-running GitNexus client, or `null` if the feature is
 * disabled or has not started. Used by the HTTP route layer so the browser
 * never imports gitnexus-client directly.
 *
 * @returns {ReturnType<typeof createGitNexusClient> | null}
 */
export function getGitNexusClient() {
  return client
}

/**
 * Test-only: reset module state and allow swapping the client factory.
 *
 * @param {{ factory?: typeof createGitNexusClient } | undefined} [opts]
 */
export function _resetForTests(opts) {
  client = null
  started = false
  signalHandlersInstalled = false
  clientFactory = (opts && opts.factory) || createGitNexusClient
}
