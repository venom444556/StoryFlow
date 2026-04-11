/**
 * Scoring primitives for symbol resolution.
 *
 * Confidence is computed as a deterministic function of:
 *   - the raw semantic search score from GitNexusClient.search()
 *   - heuristic boosts that reward direct evidence the ticket is
 *     talking about a specific symbol
 *
 * Boosts are additive but the final confidence is clamped to [0, 1],
 * so the same input always produces the same output.
 */

export const DEFAULT_CONFIG = Object.freeze({
  topK: 5,
  minConfidence: 0.3,
})

/**
 * Weights for each evidence source. Tuned so that a solid semantic hit
 * (score >= 0.5) combined with one strong boost lands comfortably above
 * the default 0.3 floor, while noise below 0.2 still gets pruned.
 */
export const WEIGHTS = Object.freeze({
  explicitMarker: 0.5, // [[Symbol:foo]] — authoritative signal
  titleNameMatch: 0.25, // exact symbol name appears in title
  descriptionNameMatch: 0.1,
  filePathMatch: 0.15, // file path referenced anywhere in ticket
  kindBoost: 0.02, // tiny nudge for function/method over module
})

/**
 * Compute confidence and reason for a single search hit.
 *
 * @param {object} hit              GitNexus SearchHit.
 * @param {object} evidence         Extracted from ticket text once per call.
 * @param {Set<string>} evidence.explicitMarkers  Lowercased symbol names from [[Symbol:...]].
 * @param {string} evidence.titleLower            Lowercased title.
 * @param {string} evidence.descriptionLower      Lowercased description.
 * @param {Set<string>} evidence.filePaths        Lowercased file-path-like tokens from the ticket.
 * @returns {{ confidence: number, reason: string }}
 */
export function scoreHit(hit, evidence) {
  const baseScore = clamp01(typeof hit.score === 'number' ? hit.score : 0)
  const name = hit.symbol?.name ?? ''
  const nameLower = name.toLowerCase()
  const file = hit.symbol?.file ?? ''
  const fileLower = file.toLowerCase()
  const kind = hit.symbol?.kind ?? ''

  const reasons = []
  let confidence = baseScore
  reasons.push(`semantic match score ${baseScore.toFixed(2)}`)

  // Explicit [[Symbol:name]] marker — the strongest signal.
  if (name && evidence.explicitMarkers.has(nameLower)) {
    confidence += WEIGHTS.explicitMarker
    reasons.push(`explicit [[Symbol:${name}]] marker`)
  }

  // Direct name mention in title.
  if (name && nameMentioned(nameLower, evidence.titleLower)) {
    confidence += WEIGHTS.titleNameMatch
    reasons.push(`matched from title: ${name}`)
  } else if (name && nameMentioned(nameLower, evidence.descriptionLower)) {
    confidence += WEIGHTS.descriptionNameMatch
    reasons.push(`matched from description: ${name}`)
  }

  // File path mention.
  if (file && filePathMentioned(fileLower, evidence.filePaths)) {
    confidence += WEIGHTS.filePathMatch
    reasons.push(`file path referenced: ${file}`)
  }

  // Tiny kind-based nudge so function/method edges out module on ties.
  if (kind === 'function' || kind === 'method') {
    confidence += WEIGHTS.kindBoost
  }

  confidence = clamp01(confidence)

  return {
    confidence,
    reason: reasons.join('; '),
  }
}

function clamp01(n) {
  if (!Number.isFinite(n)) return 0
  if (n < 0) return 0
  if (n > 1) return 1
  return n
}

/**
 * Match the last path segment of a dotted symbol name against text.
 * This catches "verify" inside "auth.middleware.verify" when a ticket
 * title says "fix verify() flow".
 */
function nameMentioned(nameLower, textLower) {
  if (!nameLower || !textLower) return false
  if (textLower.includes(nameLower)) return true
  const lastSegment = nameLower.split('.').pop()
  if (lastSegment && lastSegment.length >= 3) {
    // Word-boundary-ish match to avoid matching "verify" inside "overification".
    const re = new RegExp(`(^|[^a-z0-9_])${escapeRegex(lastSegment)}($|[^a-z0-9_])`, 'i')
    return re.test(textLower)
  }
  return false
}

function filePathMentioned(fileLower, filePaths) {
  if (!fileLower || filePaths.size === 0) return false
  if (filePaths.has(fileLower)) return true
  // Match if any mentioned path is a suffix of the candidate file path or
  // the candidate's basename is mentioned.
  const basename = fileLower.split('/').pop()
  for (const mentioned of filePaths) {
    if (!mentioned) continue
    if (fileLower.endsWith(mentioned)) return true
    if (basename && mentioned.endsWith(basename)) return true
  }
  return false
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
