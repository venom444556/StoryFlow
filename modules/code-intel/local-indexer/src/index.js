/**
 * @storyflow/code-intel-local-indexer
 *
 * Pure-local code intelligence indexer. Walks a repo with node:fs and
 * produces ImpactRaw, SearchHit, Cluster, and ChangeSet shapes that
 * conform to modules/code-intel/CONTRACTS.md.
 *
 * Zero network. Zero LLM. Zero external dependencies.
 *
 * Public API:
 *   - buildIndex(repoRoot)         — one-shot index of a repo.
 *   - createLocalResponder(opts)   — Responder bound to a repo, drop-in
 *                                    replacement for any GitNexus responder.
 *   - clusterIdForFile(rel)        — exposed so callers can derive cluster
 *                                    identity for a path without indexing.
 */

export { buildIndex } from './indexer.js'
export { createLocalResponder } from './responder.js'
export { clusterIdForFile, clusterNameFor } from './clusters.js'
export { walkSourceFiles, toRelative } from './walker.js'
export { parseFile } from './parser.js'
export { resolveImport } from './resolver.js'
