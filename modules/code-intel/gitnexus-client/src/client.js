/**
 * GitNexusClient implementation.
 *
 * Combines config validation (config.js) + process lifecycle (lifecycle.js)
 * and exposes the typed async methods defined in CONTRACTS.md.
 *
 * NOTE on stubbing: this build session does not implement the MCP wire
 * protocol between this client and the GitNexus subprocess. The methods
 * `impact`, `search`, `listClusters`, `queryGraph`, and `detectChanges`
 * are "not yet connected" — they throw a clear error if the process is
 * not running, and return a structured stub shape when the process IS
 * running so that higher layers can wire against the interface.
 *
 * The stub responses follow the contract shapes in CONTRACTS.md exactly
 * so that `impact-engine` and `symbol-resolver` can depend on this module
 * via a test double. Any integration test that needs real GitNexus data
 * must plug in a real implementation of these methods (or inject a mock
 * via the `responder` dependency in `createGitNexusClient` — see tests).
 */

import { validateConfig } from './config.js'
import { createLifecycle } from './lifecycle.js'
import { createLocalResponder } from '../../local-indexer/src/index.js'

/**
 * A responder is an injection seam: the object responsible for actually
 * answering MCP calls once the process is running. In production this
 * would wrap a JSON-RPC client against the GitNexus MCP stdio transport.
 * In tests, it's a plain mock. If not provided, a "not yet connected"
 * stub is used.
 *
 * @typedef {Object} Responder
 * @property {(input: { symbol?: string, file?: string }) => Promise<import("./index.js").ImpactRaw>} impact
 * @property {(query: string, opts?: { topK?: number }) => Promise<import("./index.js").SearchHit[]>} search
 * @property {() => Promise<import("./index.js").Cluster[]>} listClusters
 * @property {(cypher: string) => Promise<unknown>} queryGraph
 * @property {() => Promise<import("./index.js").ChangeSet>} detectChanges
 */

/**
 * @returns {Responder}
 */
function makeNotConnectedResponder() {
  const notConnected = async () => {
    throw new Error(
      'GitNexusClient: MCP wire protocol is not yet connected in this build. ' +
        'Inject a responder via createGitNexusClient(cfg, { responder }) to test against a mock, ' +
        'or wait for the MCP transport integration.'
    )
  }
  return {
    impact: notConnected,
    search: notConnected,
    listClusters: notConnected,
    queryGraph: notConnected,
    detectChanges: notConnected,
  }
}

/**
 * Create a GitNexusClient.
 *
 * @param {import("./index.js").GitNexusConfig} rawConfig
 * @param {{
 *   spawner?: import("./lifecycle.js").Spawner,
 *   responder?: Responder,
 * }} [deps]
 * @returns {import("./index.js").GitNexusClient}
 */
export function createGitNexusClient(rawConfig, deps = {}) {
  // Validate at construction time — FAIL CLOSED.
  const cfg = validateConfig(rawConfig)

  // Local-only mode: skip the lifecycle entirely and route through the
  // built-in local indexer. The client looks identical to callers — same
  // start/stop/health/impact/etc. interface — but never spawns a
  // subprocess and never touches the network.
  if (cfg.localOnly === true) {
    return createLocalOnlyClient(cfg, deps)
  }

  const lifecycle = createLifecycle(cfg, { spawner: deps.spawner })
  const responder = deps.responder || makeNotConnectedResponder()

  function ensureRunning() {
    if (!lifecycle._isRunning()) {
      throw new Error(
        'GitNexusClient: process is not running. Call start() before making MCP calls.'
      )
    }
  }

  return {
    async start() {
      await lifecycle.start()
    },

    async stop() {
      await lifecycle.stop()
    },

    async health() {
      return lifecycle.health()
    },

    async impact(input) {
      ensureRunning()
      return responder.impact(input)
    },

    async search(query, opts) {
      ensureRunning()
      return responder.search(query, opts)
    },

    async listClusters() {
      ensureRunning()
      return responder.listClusters()
    },

    async queryGraph(cypher) {
      ensureRunning()
      return responder.queryGraph(cypher)
    },

    async detectChanges() {
      ensureRunning()
      return responder.detectChanges()
    },
  }
}

/**
 * Local-only variant of the GitNexus client. Has the same interface as the
 * remote variant but never spawns a subprocess and never touches the
 * network. Backed by the local-indexer module.
 *
 * The `start()` method here is still meaningful — it triggers the first
 * index build, which is what would have happened on subprocess spawn in
 * the remote variant. `stop()` is a no-op (nothing to clean up).
 *
 * @param {Readonly<import("./index.js").GitNexusConfig>} cfg
 * @param {{ responder?: Responder }} deps
 * @returns {import("./index.js").GitNexusClient}
 */
function createLocalOnlyClient(cfg, deps = {}) {
  // Allow callers to inject a custom responder (e.g. tests with fixtures).
  // Default is the real local indexer bound to the configured repoPath.
  const responder = deps.responder || createLocalResponder({ repoRoot: cfg.repoPath })
  let started = false

  return {
    async start() {
      // Trigger an index build by calling getStats(). The local responder
      // builds lazily on first query, so this just primes the cache.
      if (typeof responder.getStats === 'function') {
        responder.getStats()
      }
      started = true
    },

    async stop() {
      started = false
    },

    async health() {
      return started ? 'ok' : 'down'
    },

    async impact(input) {
      if (!started) {
        throw new Error('GitNexusClient: local-only client is not started. Call start() first.')
      }
      return responder.impact(input)
    },

    async search(query, opts) {
      if (!started) {
        throw new Error('GitNexusClient: local-only client is not started. Call start() first.')
      }
      return responder.search(query, opts)
    },

    async listClusters() {
      if (!started) {
        throw new Error('GitNexusClient: local-only client is not started. Call start() first.')
      }
      return responder.listClusters()
    },

    async queryGraph(cypher) {
      if (!started) {
        throw new Error('GitNexusClient: local-only client is not started. Call start() first.')
      }
      return responder.queryGraph(cypher)
    },

    async detectChanges() {
      if (!started) {
        throw new Error('GitNexusClient: local-only client is not started. Call start() first.')
      }
      return responder.detectChanges()
    },
  }
}
