/**
 * Code Intelligence feature module singleton.
 *
 * Composes the four standalone sub-modules under `modules/code-intel/` and
 * exposes a single object per the `CodeIntelligenceModule` contract in
 * `CONTRACTS.md`. When the feature is disabled, the factory still returns an
 * object with identical shape — every method resolves to the empty-result
 * values documented in the contract. UI components can call through
 * unconditionally without null-checking.
 */

import {
  analyzeImpact,
  preflightGate,
} from '../../../modules/code-intel/impact-engine/src/index.js'
import { createSymbolResolver } from '../../../modules/code-intel/symbol-resolver/src/index.js'
import { createHttpGitNexusProxy } from './httpClient.js'
import { loadConfig } from './config.js'

/**
 * @typedef {import('./config.js').CodeIntelligenceConfig} CodeIntelligenceConfig
 */

const DISABLED_PREFLIGHT = Object.freeze({
  outcome: 'allow',
  reason: 'code-intelligence disabled',
  reports: [],
})

const EMPTY_CLUSTER_SUMMARY = Object.freeze({ clusters: [], stats: {} })
const EMPTY_GRAPH_DATA = Object.freeze({ nodes: [], edges: [], clusters: [] })

/**
 * Build the no-op module used when the feature is disabled. Every contract
 * method resolves cleanly with the contract's empty-result shape.
 * @param {CodeIntelligenceConfig} config
 * @returns {import('./index.js').CodeIntelligenceModule}
 */
function createDisabledModule(config) {
  return {
    config,
    enabled: false,
    ready: Promise.resolve(),
    async analyzeSymbols() {
      return []
    },
    async resolveTicket() {
      return []
    },
    async runPreflight() {
      return { ...DISABLED_PREFLIGHT }
    },
    async fetchClusterSummary() {
      return { ...EMPTY_CLUSTER_SUMMARY }
    },
    async fetchGraphData() {
      return { ...EMPTY_GRAPH_DATA }
    },
    async shutdown() {
      /* no-op */
    },
  }
}

/**
 * Translate a list of `Cluster` records from gitnexus-client into the
 * `{ nodes, edges, clusters }` shape the graph-renderer expects.
 *
 * Interpretation: each `SymbolRef` inside a cluster becomes a `GraphNode` with
 * a stable id of `"<clusterId>::<symbol.file>::<symbol.name>"`. Since
 * `listClusters()` only exposes symbols and membership (no call edges), we
 * derive a minimal set of inter-cluster edges by connecting the *first* symbol
 * in each cluster to the first symbol of every cluster referenced indirectly
 * through shared file paths — a conservative fallback. Richer edges should
 * come from `queryGraph()` when the agent owning the graph page needs them;
 * the current integration layer only needs a renderable minimum.
 *
 * @param {import('../../../modules/code-intel/gitnexus-client/src/index.js').Cluster[]} clusters
 * @returns {{ nodes: any[], edges: any[], clusters: any[] }}
 */
export function clustersToGraphData(clusters) {
  if (!Array.isArray(clusters) || clusters.length === 0) {
    return { nodes: [], edges: [], clusters: [] }
  }

  const nodes = []
  const nodeIdByFile = new Map()

  for (const cluster of clusters) {
    const symbols = Array.isArray(cluster.symbols) ? cluster.symbols : []
    for (const symbol of symbols) {
      const id = `${cluster.id}::${symbol.file}::${symbol.name}`
      nodes.push({
        id,
        label: symbol.name,
        clusterId: cluster.id,
        size: undefined,
        symbol,
      })
      if (!nodeIdByFile.has(symbol.file)) {
        nodeIdByFile.set(symbol.file, [])
      }
      nodeIdByFile.get(symbol.file).push({ id, clusterId: cluster.id })
    }
  }

  // Minimal cross-cluster edges: when two clusters share a file, connect
  // their representative nodes once. This is a placeholder until queryGraph
  // integration lands.
  const edges = []
  const seenEdges = new Set()
  for (const occupants of nodeIdByFile.values()) {
    if (occupants.length < 2) continue
    for (let i = 0; i < occupants.length; i += 1) {
      for (let j = i + 1; j < occupants.length; j += 1) {
        if (occupants[i].clusterId === occupants[j].clusterId) continue
        const key =
          occupants[i].id < occupants[j].id
            ? `${occupants[i].id}->${occupants[j].id}`
            : `${occupants[j].id}->${occupants[i].id}`
        if (seenEdges.has(key)) continue
        seenEdges.add(key)
        edges.push({ source: occupants[i].id, target: occupants[j].id, weight: 1 })
      }
    }
  }

  return { nodes, edges, clusters }
}

/**
 * Create a live (enabled) module instance. Spins up the gitnexus client, the
 * symbol resolver, and wires in the pure impact-engine helpers. Exported for
 * unit tests — production callers should use `getCodeIntelligenceModule()`.
 *
 * @param {CodeIntelligenceConfig} config
 * @param {{
 *   gitnexusFactory?: typeof createHttpGitNexusProxy,
 *   symbolResolverFactory?: typeof createSymbolResolver,
 *   analyzeImpact?: typeof analyzeImpact,
 *   preflightGate?: typeof preflightGate,
 * }} [deps]
 * @returns {import('./index.js').CodeIntelligenceModule}
 */
export function createCodeIntelligenceModule(config, deps = {}) {
  if (!config || config.enabled !== true) {
    return createDisabledModule(config || { enabled: false })
  }

  const gitnexusFactory = deps.gitnexusFactory || createHttpGitNexusProxy
  const symbolResolverFactory = deps.symbolResolverFactory || createSymbolResolver
  const analyze = deps.analyzeImpact || analyzeImpact
  const gate = deps.preflightGate || preflightGate

  // Browser-side: the real GitNexus client lives on the server. We use an
  // HTTP proxy that implements the subset of the client surface used here.
  // Server-side callers can inject their own factory via deps.gitnexusFactory.
  const gitnexus = gitnexusFactory()

  const resolver = symbolResolverFactory(gitnexus, { topK: 5, minConfidence: 0.3 })

  let started = false
  let stopped = false

  const ready = (async () => {
    if (typeof gitnexus.start === 'function') {
      await gitnexus.start()
      started = true
    }
  })().catch((err) => {
    console.error('[code-intelligence] failed to start gitnexus-client:', err)
    throw err
  })

  /**
   * @param {string[]} symbols
   */
  async function analyzeSymbols(symbols) {
    if (!Array.isArray(symbols) || symbols.length === 0) return []
    await ready
    const results = []
    for (const symbolName of symbols) {
      const raw = await gitnexus.impact({ symbol: symbolName })
      results.push(analyze(raw))
    }
    return results
  }

  async function resolveTicket(ticket) {
    if (!ticket || typeof ticket !== 'object') return []
    await ready
    return resolver.resolveTicket(ticket)
  }

  async function runPreflight(issue) {
    await ready
    const codeLinks = issue && Array.isArray(issue.codeLinks) ? issue.codeLinks : []
    if (codeLinks.length === 0) {
      return { outcome: 'allow', reason: 'no linked symbols', reports: [] }
    }
    const reports = []
    for (const link of codeLinks) {
      const symbolName = typeof link === 'string' ? link : link && link.symbol
      if (!symbolName) continue
      const raw = await gitnexus.impact({ symbol: symbolName })
      reports.push(analyze(raw))
    }
    const blockAt =
      config.thresholds && config.thresholds.preflightBlockAt
        ? config.thresholds.preflightBlockAt
        : 'HIGH'
    // preflightGate accepts MEDIUM|HIGH|CRITICAL; LOW is effectively "never block"
    // which we degrade to MEDIUM if someone opts into the most sensitive tier.
    const effectiveBlockAt = blockAt === 'LOW' ? 'MEDIUM' : blockAt
    return gate(reports, effectiveBlockAt)
  }

  async function fetchClusterSummary() {
    await ready
    const clusters = await gitnexus.listClusters()
    const stats = {
      clusterCount: clusters.length,
      symbolCount: clusters.reduce(
        (sum, c) => sum + (Array.isArray(c.symbols) ? c.symbols.length : 0),
        0
      ),
      callsiteCount: clusters.reduce((sum, c) => sum + (c.callsiteCount || 0), 0),
    }
    return { clusters, stats }
  }

  async function fetchGraphData() {
    await ready
    const clusters = await gitnexus.listClusters()
    return clustersToGraphData(clusters)
  }

  async function shutdown() {
    if (stopped) return
    stopped = true
    if (started && typeof gitnexus.stop === 'function') {
      try {
        await gitnexus.stop()
      } catch (err) {
        console.warn('[code-intelligence] gitnexus.stop() failed:', err)
      }
    }
  }

  return {
    config,
    enabled: true,
    ready,
    analyzeSymbols,
    resolveTicket,
    runPreflight,
    fetchClusterSummary,
    fetchGraphData,
    shutdown,
  }
}

/** @type {import('./index.js').CodeIntelligenceModule|null} */
let singleton = null

/**
 * Lazy singleton accessor. First call reads config and bootstraps the module.
 * Subsequent calls return the same instance.
 * @returns {import('./index.js').CodeIntelligenceModule}
 */
export function getCodeIntelligenceModule() {
  if (singleton) return singleton
  const config = loadConfig()
  singleton = createCodeIntelligenceModule(config)
  return singleton
}

/**
 * Reset the singleton. Intended for tests.
 */
export function resetCodeIntelligenceModule() {
  singleton = null
}
