/**
 * @storyflow/code-intel-symbol-resolver
 *
 * Public entrypoint. Re-exports the factory `createSymbolResolver` which returns
 * an object with a `resolveTicket(ticket)` method that conforms to the contract
 * defined in `modules/code-intel/CONTRACTS.md > symbol-resolver`.
 *
 * The module never imports the real gitnexus-client. Callers must inject a
 * client that implements the `GitNexusClient` interface (at minimum `search`).
 */

export { createSymbolResolver } from './resolver.js'
export {
  extractExplicitSymbolMarkers,
  extractFilePathMentions,
  extractIdentifierMentions,
} from './heuristics.js'
export { scoreHit, DEFAULT_CONFIG } from './scoring.js'
