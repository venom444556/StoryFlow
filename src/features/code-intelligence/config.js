/**
 * Code Intelligence feature module — config loader.
 *
 * Reads `.storyflow/modules/code-intelligence.json` from the StoryFlow project
 * root. The feature is off by default: missing or malformed config files resolve
 * to `{ enabled: false }` so a fresh clone behaves identically to vanilla
 * StoryFlow.
 *
 * See `CONTRACTS.md` for the full schema.
 */

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

/**
 * @typedef {Object} CodeIntelligenceConfig
 * @property {boolean} enabled
 * @property {string} [gitnexusVersion]
 * @property {string} [repoPath]
 * @property {{ baseUrl: string, apiKey: string, allowOpenRouter?: boolean }} [llm]
 * @property {{
 *   impactBadges: boolean,
 *   preflightHook: boolean,
 *   codebaseMap: boolean,
 *   codeTab: boolean,
 *   decisionAttachment: boolean,
 *   timelineEvents: boolean
 * }} [features]
 * @property {{ preflightBlockAt: 'LOW'|'MEDIUM'|'HIGH'|'CRITICAL' }} [thresholds]
 */

const CONFIG_RELATIVE_PATH = '.storyflow/modules/code-intelligence.json'

/** @type {CodeIntelligenceConfig|null} */
let cachedConfig = null

const DISABLED = Object.freeze({ enabled: false })

const DEFAULT_FEATURES = Object.freeze({
  impactBadges: false,
  preflightHook: false,
  codebaseMap: false,
  codeTab: false,
  decisionAttachment: false,
  timelineEvents: false,
})

const VALID_BLAST_LEVELS = new Set(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])

function resolveConfigPath() {
  return path.join(process.cwd(), CONFIG_RELATIVE_PATH)
}

function isOpenRouter(url) {
  if (!url || typeof url !== 'string') return false
  try {
    const host = new URL(url).hostname.toLowerCase()
    return host === 'openrouter.ai' || host.endsWith('.openrouter.ai')
  } catch {
    return false
  }
}

/**
 * Validate a parsed config object. Returns a normalized config on success,
 * throws on safety-critical misconfiguration when `enabled: true`.
 * @param {any} raw
 * @returns {CodeIntelligenceConfig}
 */
export function validateConfig(raw) {
  if (!raw || typeof raw !== 'object') return { ...DISABLED }
  if (raw.enabled !== true) return { ...DISABLED }

  const thresholds = raw.thresholds || {}
  const blockAt = thresholds.preflightBlockAt || 'HIGH'
  if (!VALID_BLAST_LEVELS.has(blockAt)) {
    throw new Error(
      `code-intelligence: \`thresholds.preflightBlockAt\` must be one of LOW|MEDIUM|HIGH|CRITICAL (got ${blockAt}).`
    )
  }

  const features = { ...DEFAULT_FEATURES, ...(raw.features || {}) }
  const repoPath = raw.repoPath && typeof raw.repoPath === 'string' ? raw.repoPath : process.cwd()

  // Local-only mode: skip gitnexusVersion and llm validation entirely.
  // The frontend doesn't actually call the LLM directly — it talks to
  // /api/code-intelligence on the server, which is configured server-side.
  if (raw.localOnly === true) {
    return {
      enabled: true,
      localOnly: true,
      repoPath,
      features,
      thresholds: { preflightBlockAt: blockAt },
    }
  }

  // Remote mode validation below.
  if (!raw.gitnexusVersion || typeof raw.gitnexusVersion !== 'string') {
    throw new Error(
      'code-intelligence: `gitnexusVersion` is required when enabled:true and localOnly is not set (pin a semver, e.g. "1.5.3").'
    )
  }
  if (raw.gitnexusVersion === 'latest') {
    throw new Error('code-intelligence: `gitnexusVersion` must be a pinned semver, not "latest".')
  }

  if (!raw.llm || typeof raw.llm !== 'object') {
    throw new Error(
      'code-intelligence: `llm` block is required in remote mode. Set `localOnly: true` to use the local indexer instead.'
    )
  }
  if (!raw.llm.baseUrl || typeof raw.llm.baseUrl !== 'string') {
    throw new Error('code-intelligence: `llm.baseUrl` is required in remote mode.')
  }
  if (!raw.llm.apiKey || typeof raw.llm.apiKey !== 'string') {
    throw new Error('code-intelligence: `llm.apiKey` is required in remote mode.')
  }
  if (isOpenRouter(raw.llm.baseUrl) && raw.llm.allowOpenRouter !== true) {
    throw new Error(
      'code-intelligence: `llm.baseUrl` points to OpenRouter but `llm.allowOpenRouter` is not true. Refusing to bootstrap.'
    )
  }

  return {
    enabled: true,
    localOnly: false,
    gitnexusVersion: raw.gitnexusVersion,
    repoPath,
    llm: {
      baseUrl: raw.llm.baseUrl,
      apiKey: raw.llm.apiKey,
      allowOpenRouter: raw.llm.allowOpenRouter === true,
    },
    features,
    thresholds: { preflightBlockAt: blockAt },
  }
}

/**
 * Load the code-intelligence config from disk. Caches the result.
 * @returns {CodeIntelligenceConfig}
 */
export function loadConfig() {
  if (cachedConfig) return cachedConfig
  const configPath = resolveConfigPath()

  let fileText
  try {
    fileText = fs.readFileSync(configPath, 'utf8')
  } catch (err) {
    if (err && err.code === 'ENOENT') {
      cachedConfig = { ...DISABLED }
      return cachedConfig
    }

    console.warn(`[code-intelligence] unable to read ${CONFIG_RELATIVE_PATH}: ${err.message}`)
    cachedConfig = { ...DISABLED }
    return cachedConfig
  }

  let parsed
  try {
    parsed = JSON.parse(fileText)
  } catch (err) {
    console.warn(
      `[code-intelligence] ${CONFIG_RELATIVE_PATH} is not valid JSON, disabling feature: ${err.message}`
    )
    cachedConfig = { ...DISABLED }
    return cachedConfig
  }

  cachedConfig = validateConfig(parsed)
  return cachedConfig
}

/**
 * Force a reload on next `loadConfig()` call. Intended for tests.
 */
export function reloadConfig() {
  cachedConfig = null
  return loadConfig()
}

/**
 * Clear the cached config without reloading. Intended for tests.
 */
export function resetConfigCache() {
  cachedConfig = null
}

/**
 * Synchronous check used by hot paths and the singleton bootstrap.
 * @returns {boolean}
 */
export function isCodeIntelligenceEnabled() {
  return loadConfig().enabled === true
}
