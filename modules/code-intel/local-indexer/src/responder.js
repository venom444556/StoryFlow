/**
 * Local responder.
 *
 * Implements the gitnexus-client Responder interface
 * (impact / search / listClusters / queryGraph / detectChanges) using a
 * BuiltIndex from indexer.js. This is the bridge that lets the existing
 * code-intelligence frontend, server lifecycle, and impact-engine
 * consume local data without ever talking to GitNexus or any LLM.
 *
 * The shapes returned here MUST match `modules/code-intel/CONTRACTS.md`
 * exactly — that's what makes this a drop-in replacement.
 */

import { buildIndex } from './indexer.js'
import { clusterNameFor } from './clusters.js'

/**
 * Create a Responder bound to a repo root. The first call to any method
 * triggers an index build; subsequent calls reuse the cached index until
 * `rebuildNow()` is invoked or the underlying files change. The indexer
 * is fast enough (sub-second on a few-hundred-file repo) that callers
 * who need always-fresh data can call rebuildNow() before each query.
 *
 * @param {{ repoRoot: string }} opts
 */
export function createLocalResponder(opts) {
  if (!opts || typeof opts.repoRoot !== 'string' || opts.repoRoot.length === 0) {
    throw new Error('createLocalResponder: opts.repoRoot is required')
  }
  const repoRoot = opts.repoRoot

  /** @type {ReturnType<typeof buildIndex> | null} */
  let cached = null

  function ensureIndex() {
    if (!cached) cached = buildIndex(repoRoot)
    return cached
  }

  function rebuildNow() {
    cached = buildIndex(repoRoot)
    return cached
  }

  /**
   * impact() — for a given symbol or file, return the raw impact shape.
   *
   * Strategy:
   *   1. Resolve the input to a target file (via symbol lookup or direct file).
   *   2. The target's "callers" are every file that imports it (importedBy).
   *   3. Each caller becomes a Caller{ from, to } pair where `from` is an
   *      arbitrary export of the calling file (or the file itself as a
   *      module-kind SymbolRef if it has no exports).
   *   4. callsiteCount = number of caller files (one callsite per importing
   *      file is the conservative count we can derive without AST traversal).
   *   5. affectedClusters = unique cluster ids of caller files.
   *   6. affectedServices = number of unique top-level package roots touched
   *      (we treat every cluster-prefix mismatch as a service boundary).
   *
   * @param {{ symbol?: string, file?: string }} input
   * @returns {Promise<import('../../impact-engine/src/types.js').ImpactRaw>}
   */
  async function impact(input) {
    const idx = ensureIndex()
    const target = resolveTarget(idx, input)
    if (!target) {
      return emptyImpact(input)
    }

    const callers = idx.importedBy.get(target.absPath) || []
    const callerSummaries = callers.map((c) => buildCaller(idx, c, target.symbolRef))

    const affectedClusters = uniqueClustersOf(
      idx,
      callers.map((c) => c.fromAbs)
    )
    const affectedServices = countServices(affectedClusters)

    return {
      target: target.symbolRef,
      callers: callerSummaries,
      callsiteCount: callers.length,
      affectedClusters,
      affectedServices,
    }
  }

  /**
   * search() — substring match against the symbol index.
   * Score is based on whether the query is a prefix, exact, or substring match.
   *
   * @param {string} query
   * @param {{ topK?: number }} [opts]
   * @returns {Promise<import('../../gitnexus-client/src/index.js').SearchHit[]>}
   */
  async function search(query, opts) {
    const idx = ensureIndex()
    const topK = opts && Number.isFinite(opts.topK) ? opts.topK : 25
    const q = String(query || '')
      .toLowerCase()
      .trim()
    if (!q) return []

    /** @type {Array<{ symbol: import('../../impact-engine/src/types.js').SymbolRef, score: number, snippet: string }>} */
    const hits = []
    for (const [name, refs] of idx.symbolIndex) {
      let score = 0
      if (name === q) score = 1.0
      else if (name.startsWith(q)) score = 0.85
      else if (name.includes(q)) score = 0.6
      else continue

      for (const ref of refs) {
        hits.push({
          symbol: ref,
          score,
          snippet: `${ref.kind || 'symbol'} ${ref.name} — ${ref.file}${ref.line ? ':' + ref.line : ''}`,
        })
      }
    }

    hits.sort((a, b) => b.score - a.score)
    return hits.slice(0, topK)
  }

  /**
   * listClusters() — return every cluster with its members.
   *
   * @returns {Promise<import('../../impact-engine/src/types.js').Cluster[]>}
   */
  async function listClusters() {
    const idx = ensureIndex()
    /** @type {import('../../impact-engine/src/types.js').Cluster[]} */
    const out = []
    for (const [clusterId, fileSet] of idx.clusterMembership) {
      const symbols = []
      let callsiteCount = 0
      for (const relativePath of fileSet) {
        // Find absolute path back from relative.
        for (const [absPath, entry] of idx.files) {
          if (entry.relativePath !== relativePath) continue
          for (const e of entry.exports) {
            symbols.push({
              name: e.name,
              file: relativePath,
              line: e.line,
              kind: e.kind,
            })
          }
          callsiteCount += (idx.importedBy.get(absPath) || []).length
          break
        }
      }
      out.push({
        id: clusterId,
        name: clusterNameFor(clusterId),
        symbols,
        callsiteCount,
      })
    }
    out.sort((a, b) => b.callsiteCount - a.callsiteCount)
    return out
  }

  /**
   * queryGraph() — local indexer doesn't speak Cypher. Return a stable
   * "not supported in local mode" shape that doesn't break callers.
   *
   * @param {string} _cypher
   * @returns {Promise<{ rows: [], localOnly: true }>}
   */
  async function queryGraph(_cypher) {
    return { rows: [], localOnly: true }
  }

  /**
   * detectChanges() — local indexer compares the cached index against the
   * current filesystem state and returns the delta. This is intentionally
   * shallow (file-level, not symbol-level diffing) — that's enough to
   * trigger the timeline event "code-intel-change-detected" downstream.
   *
   * @returns {Promise<import('../../gitnexus-client/src/index.js').ChangeSet>}
   */
  async function detectChanges() {
    const before = cached
    const after = rebuildNow()

    if (!before) {
      return {
        changedFiles: [],
        changedSymbols: [],
        affectedClusterIds: [],
        fromSha: 'local-bootstrap',
        toSha: 'local-' + after.builtAtMs,
      }
    }

    const changedFiles = []
    const changedSymbols = []
    const affectedClusterIds = new Set()

    // Files added or whose export set changed.
    for (const [absPath, afterEntry] of after.files) {
      const beforeEntry = before.files.get(absPath)
      if (!beforeEntry) {
        changedFiles.push(afterEntry.relativePath)
        affectedClusterIds.add(afterEntry.cluster)
        for (const e of afterEntry.exports) {
          changedSymbols.push({ name: e.name, file: afterEntry.relativePath, kind: e.kind })
        }
        continue
      }
      const beforeNames = beforeEntry.exports
        .map((e) => e.name)
        .sort()
        .join(',')
      const afterNames = afterEntry.exports
        .map((e) => e.name)
        .sort()
        .join(',')
      if (beforeNames !== afterNames) {
        changedFiles.push(afterEntry.relativePath)
        affectedClusterIds.add(afterEntry.cluster)
        for (const e of afterEntry.exports) {
          changedSymbols.push({ name: e.name, file: afterEntry.relativePath, kind: e.kind })
        }
      }
    }

    // Files removed.
    for (const [absPath, beforeEntry] of before.files) {
      if (!after.files.has(absPath)) {
        changedFiles.push(beforeEntry.relativePath)
        affectedClusterIds.add(beforeEntry.cluster)
      }
    }

    return {
      changedFiles,
      changedSymbols,
      affectedClusterIds: Array.from(affectedClusterIds),
      fromSha: 'local-' + before.builtAtMs,
      toSha: 'local-' + after.builtAtMs,
    }
  }

  return {
    impact,
    search,
    listClusters,
    queryGraph,
    detectChanges,
    // Local-only utilities; not part of the contract but useful for the
    // server lifecycle layer.
    rebuildNow,
    getStats() {
      const idx = ensureIndex()
      return {
        fileCount: idx.fileCount,
        symbolCount: idx.symbolCount,
        clusterCount: idx.clusterCount,
        builtAtMs: idx.builtAtMs,
      }
    },
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * @param {ReturnType<typeof buildIndex>} idx
 * @param {{ symbol?: string, file?: string }} input
 * @returns {{ absPath: string, symbolRef: import('../../impact-engine/src/types.js').SymbolRef } | null}
 */
function resolveTarget(idx, input) {
  if (input && typeof input.symbol === 'string' && input.symbol.length > 0) {
    const refs = idx.symbolIndex.get(input.symbol.toLowerCase())
    if (refs && refs.length > 0) {
      // Pick the first match. If multiple files export the same name, the
      // caller can disambiguate by passing `file:` instead.
      const symbolRef = refs[0]
      // Find absolute path matching this relativePath.
      for (const [absPath, entry] of idx.files) {
        if (entry.relativePath === symbolRef.file) {
          return { absPath, symbolRef }
        }
      }
    }
    return null
  }

  if (input && typeof input.file === 'string' && input.file.length > 0) {
    // Normalize forward slashes.
    const wanted = input.file.split('\\').join('/')
    for (const [absPath, entry] of idx.files) {
      if (entry.relativePath === wanted || entry.relativePath.endsWith('/' + wanted)) {
        // Use the file's first export as the symbol, or the file itself as a module.
        const firstExport = entry.exports[0]
        const symbolRef = firstExport
          ? {
              name: firstExport.name,
              file: entry.relativePath,
              line: firstExport.line,
              kind: firstExport.kind,
            }
          : { name: entry.relativePath, file: entry.relativePath, kind: 'module' }
        return { absPath, symbolRef }
      }
    }
  }

  return null
}

/**
 * @param {ReturnType<typeof buildIndex>} idx
 * @param {{ fromAbs: string, fromRel: string }} caller
 * @param {import('../../impact-engine/src/types.js').SymbolRef} target
 * @returns {import('../../impact-engine/src/types.js').Caller}
 */
function buildCaller(idx, caller, target) {
  const fromEntry = idx.files.get(caller.fromAbs)
  const fromExport = fromEntry && fromEntry.exports[0]
  return {
    from: fromExport
      ? {
          name: fromExport.name,
          file: caller.fromRel,
          line: fromExport.line,
          kind: fromExport.kind,
        }
      : { name: caller.fromRel, file: caller.fromRel, kind: 'module' },
    to: target,
  }
}

/**
 * @param {{ symbol?: string, file?: string }} input
 * @returns {import('../../impact-engine/src/types.js').ImpactRaw}
 */
function emptyImpact(input) {
  const name = (input && (input.symbol || input.file)) || 'unknown'
  return {
    target: { name, file: input && input.file ? input.file : 'unknown', kind: 'module' },
    callers: [],
    callsiteCount: 0,
    affectedClusters: [],
    affectedServices: 0,
  }
}

/**
 * @param {ReturnType<typeof buildIndex>} idx
 * @param {string[]} callerAbsPaths
 * @returns {string[]}
 */
function uniqueClustersOf(idx, callerAbsPaths) {
  const out = new Set()
  for (const abs of callerAbsPaths) {
    const entry = idx.files.get(abs)
    if (entry) out.add(entry.cluster)
  }
  return Array.from(out)
}

/**
 * Count "services" as distinct top-level cluster prefixes.
 * E.g. ['components/board', 'components/timeline', 'server'] => 2
 *      (components/* counts as one service, server counts as another).
 *
 * @param {string[]} clusterIds
 * @returns {number}
 */
function countServices(clusterIds) {
  const services = new Set()
  for (const id of clusterIds) {
    const top = id.split('/')[0]
    services.add(top)
  }
  return services.size
}
