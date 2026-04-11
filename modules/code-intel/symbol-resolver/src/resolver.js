/**
 * Symbol resolver factory.
 *
 * Consumes a dependency-injected GitNexusClient (never imported directly)
 * and returns an object with `resolveTicket(ticket)` that implements the
 * contract in `modules/code-intel/CONTRACTS.md > symbol-resolver`.
 */

import { extractExplicitSymbolMarkers, extractFilePathMentions } from './heuristics.js'
import { scoreHit, DEFAULT_CONFIG } from './scoring.js'

/**
 * @param {object} client  Anything matching the GitNexusClient interface;
 *                         only `client.search(query, { topK })` is called.
 * @param {object} [config]
 * @param {number} [config.topK=5]
 * @param {number} [config.minConfidence=0.3]
 * @returns {{ resolveTicket: (ticket: object) => Promise<object[]> }}
 */
export function createSymbolResolver(client, config = {}) {
  if (!client || typeof client.search !== 'function') {
    throw new Error(
      'createSymbolResolver: client must implement search(query, opts). ' +
        'Inject a GitNexusClient or a compatible fake.'
    )
  }

  const topK =
    Number.isFinite(config.topK) && config.topK > 0 ? Math.floor(config.topK) : DEFAULT_CONFIG.topK
  const minConfidence = Number.isFinite(config.minConfidence)
    ? config.minConfidence
    : DEFAULT_CONFIG.minConfidence

  return {
    async resolveTicket(ticket) {
      const title = typeof ticket?.title === 'string' ? ticket.title.trim() : ''
      const description = typeof ticket?.description === 'string' ? ticket.description.trim() : ''

      if (!title && !description) {
        throw new Error('symbol-resolver: ticket must include a non-empty title or description')
      }

      // Query: use title + description when both are present, title alone
      // otherwise. Keeps the query concise but gives the semantic search
      // enough context when the description is rich.
      const query = title && description ? `${title}\n\n${description}` : title || description

      // Extract ticket-wide evidence once.
      const combined = [title, description].filter(Boolean).join('\n')
      const explicitMarkers = extractExplicitSymbolMarkers(combined)
      const filePaths = extractFilePathMentions(combined)
      const evidence = {
        explicitMarkers,
        filePaths,
        titleLower: title.toLowerCase(),
        descriptionLower: description.toLowerCase(),
      }

      // Call the client.search() — propagate any errors with context.
      let hits
      try {
        hits = await client.search(query, { topK })
      } catch (err) {
        const wrapped = new Error(
          `symbol-resolver: GitNexusClient.search failed: ${err?.message ?? err}`
        )
        wrapped.cause = err
        throw wrapped
      }

      if (!Array.isArray(hits) || hits.length === 0) {
        return []
      }

      const candidates = hits
        .filter((hit) => hit && hit.symbol && typeof hit.symbol.name === 'string')
        .map((hit) => {
          const { confidence, reason } = scoreHit(hit, evidence)
          return {
            symbol: {
              name: hit.symbol.name,
              file: hit.symbol.file,
              ...(typeof hit.symbol.line === 'number' ? { line: hit.symbol.line } : {}),
              ...(hit.symbol.kind ? { kind: hit.symbol.kind } : {}),
            },
            confidence,
            reason,
          }
        })
        .filter((c) => c.confidence >= minConfidence)
        .sort((a, b) => {
          if (b.confidence !== a.confidence) return b.confidence - a.confidence
          // Stable tiebreaker on name to keep output deterministic.
          return a.symbol.name.localeCompare(b.symbol.name)
        })
        .slice(0, topK)

      return candidates
    },
  }
}
