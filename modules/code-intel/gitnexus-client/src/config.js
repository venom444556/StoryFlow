/**
 * Config validation for createGitNexusClient.
 *
 * Fail-closed rules (all enforced at construction time):
 *   1. `version` must be a pinned semver like "1.5.3". Reject "latest" or missing.
 *   2. `repoPath` must be a non-empty string (ideally absolute, but we don't fs-check here).
 *   3. `llm` block is REQUIRED. No defaults.
 *   4. `llm.baseUrl` and `llm.apiKey` must both be present.
 *   5. `llm.baseUrl` cannot point to openrouter.ai (or any *.openrouter.ai subdomain)
 *      unless `llm.allowOpenRouter === true`.
 */

const SEMVER_RE = /^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/

/**
 * @param {string} urlStr
 * @returns {boolean}
 */
export function isOpenRouterUrl(urlStr) {
  if (typeof urlStr !== 'string' || urlStr.length === 0) return false
  let host
  try {
    host = new URL(urlStr).hostname.toLowerCase()
  } catch {
    // If the URL doesn't parse, we conservatively assume it's not OpenRouter,
    // but the caller's baseUrl validation will still reject it elsewhere.
    return false
  }
  return host === 'openrouter.ai' || host.endsWith('.openrouter.ai')
}

/**
 * Validate a GitNexusConfig. Throws a descriptive Error on any violation.
 * Returns a frozen, normalized copy of the config.
 *
 * Two modes are supported:
 *
 *   1. Remote (default): requires `version`, `repoPath`, and a full `llm`
 *      block. The client will spawn the gitnexus subprocess and route
 *      queries through it.
 *
 *   2. Local-only: set `localOnly: true`. Only `repoPath` is required.
 *      The `version` and `llm` blocks are ignored. The client will skip
 *      the subprocess entirely and route queries through a built-in
 *      local indexer that uses static analysis. Zero network, zero LLM.
 *
 * @param {import("./index.js").GitNexusConfig} cfg
 * @returns {Readonly<import("./index.js").GitNexusConfig>}
 */
export function validateConfig(cfg) {
  if (cfg === null || typeof cfg !== 'object') {
    throw new Error('GitNexusClient: config is required. Pass a GitNexusConfig object.')
  }

  const localOnly = cfg.localOnly === true

  // --- repoPath (required in both modes) ---
  const { repoPath } = cfg
  if (typeof repoPath !== 'string' || repoPath.length === 0) {
    throw new Error('GitNexusClient: config.repoPath is required and must be a non-empty string.')
  }

  if (localOnly) {
    // Local-only mode: skip version and llm validation entirely.
    return Object.freeze({
      localOnly: true,
      repoPath,
      version: null,
      llm: null,
      scarfAnalytics: false,
    })
  }

  // --- Remote mode validation below ---

  // --- version ---
  const { version } = cfg
  if (version === undefined || version === null || version === '') {
    throw new Error(
      "GitNexusClient: config.version is required. Must be a pinned semver (e.g. '1.5.3'). '@latest' is not allowed."
    )
  }
  if (typeof version !== 'string') {
    throw new Error(
      `GitNexusClient: config.version must be a string semver, got ${typeof version}.`
    )
  }
  if (version === 'latest' || version === '@latest') {
    throw new Error(
      "GitNexusClient: config.version='latest' is not allowed. Pin an exact semver (e.g. '1.5.3')."
    )
  }
  if (!SEMVER_RE.test(version)) {
    throw new Error(
      `GitNexusClient: config.version='${version}' is not a valid semver. Use an exact pin like '1.5.3'.`
    )
  }

  // --- llm block ---
  const { llm } = cfg
  if (llm === null || typeof llm !== 'object') {
    throw new Error(
      'GitNexusClient: config.llm is REQUIRED in remote mode. No default LLM endpoint is provided. ' +
        'You must explicitly set { baseUrl, apiKey }, or set localOnly:true to use the local indexer.'
    )
  }
  if (typeof llm.baseUrl !== 'string' || llm.baseUrl.length === 0) {
    throw new Error('GitNexusClient: config.llm.baseUrl is required (explicit LLM endpoint).')
  }
  if (typeof llm.apiKey !== 'string' || llm.apiKey.length === 0) {
    throw new Error(
      'GitNexusClient: config.llm.apiKey is required. Use env indirection if desired but it must resolve to a non-empty string.'
    )
  }

  // OpenRouter lockdown
  if (isOpenRouterUrl(llm.baseUrl) && llm.allowOpenRouter !== true) {
    throw new Error(
      `GitNexusClient: config.llm.baseUrl points to OpenRouter ('${llm.baseUrl}'). ` +
        'OpenRouter is blocked by default. Set llm.allowOpenRouter=true to explicitly opt in.'
    )
  }

  // Scarf must be false in StoryFlow. If the caller passes true, reject loudly.
  if (cfg.scarfAnalytics === true) {
    throw new Error(
      'GitNexusClient: config.scarfAnalytics=true is not permitted. Scarf telemetry must be disabled.'
    )
  }

  const normalized = Object.freeze({
    localOnly: false,
    version,
    repoPath,
    llm: Object.freeze({
      baseUrl: llm.baseUrl,
      apiKey: llm.apiKey,
      allowOpenRouter: llm.allowOpenRouter === true,
    }),
    scarfAnalytics: false,
  })

  return normalized
}
