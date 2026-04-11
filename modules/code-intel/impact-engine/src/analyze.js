import { resolveThresholds } from './thresholds.js'

/**
 * @typedef {import('./types.js').ImpactRaw} ImpactRaw
 * @typedef {import('./types.js').ImpactReport} ImpactReport
 * @typedef {import('./types.js').BlastRadiusThresholds} BlastRadiusThresholds
 * @typedef {import('./types.js').BlastRadius} BlastRadius
 * @typedef {import('./types.js').Caller} Caller
 */

/** Maximum number of top callers surfaced in a report. */
export const TOP_CALLERS_CAP = 10

/**
 * Classify a raw GitNexus impact response into a structured ImpactReport.
 *
 * Classification rules (monotonic in callsiteCount and affectedServices):
 *   1. callsiteCount >= critical_minCallsites                -> CRITICAL
 *   2. callsiteCount >= high_minCallsites                    -> HIGH
 *   3. affectedServices >= high_minServices                  -> HIGH
 *   4. callsiteCount >  low_maxCallsites                     -> MEDIUM
 *   5. otherwise                                             -> LOW
 *
 * The rationale string always references the exact threshold value that
 * triggered the classification so humans can audit the decision.
 *
 * This function is pure: same input, same output, no side effects.
 *
 * @param {ImpactRaw} raw
 * @param {Partial<BlastRadiusThresholds>} [thresholds]
 * @returns {ImpactReport}
 */
export function analyzeImpact(raw, thresholds) {
  if (!raw || typeof raw !== 'object') {
    throw new TypeError('analyzeImpact: raw ImpactRaw is required')
  }
  const t = resolveThresholds(thresholds)

  const callsiteCount = Number.isFinite(raw.callsiteCount) ? raw.callsiteCount : 0
  const affectedServiceCount = Number.isFinite(raw.affectedServices) ? raw.affectedServices : 0
  const affectedClusterIds = Array.isArray(raw.affectedClusters) ? [...raw.affectedClusters] : []
  const callers = Array.isArray(raw.callers) ? raw.callers : []

  const { blastRadius, rationale } = classify(callsiteCount, affectedServiceCount, t)

  return {
    target: raw.target,
    blastRadius,
    callsiteCount,
    affectedClusterIds,
    affectedServiceCount,
    topCallers: rankCallers(callers),
    rationale,
  }
}

/**
 * Pure classification core. Extracted so tests and monotonicity proofs can
 * exercise it without constructing a full ImpactRaw.
 *
 * @param {number} callsiteCount
 * @param {number} affectedServiceCount
 * @param {Readonly<BlastRadiusThresholds>} t
 * @returns {{ blastRadius: BlastRadius, rationale: string }}
 */
export function classify(callsiteCount, affectedServiceCount, t) {
  if (callsiteCount >= t.critical_minCallsites) {
    return {
      blastRadius: 'CRITICAL',
      rationale:
        `CRITICAL — ${callsiteCount} callsites meets or exceeds ` +
        `critical_minCallsites threshold of ${t.critical_minCallsites}, ` +
        `spans ${affectedServiceCount} service${affectedServiceCount === 1 ? '' : 's'}.`,
    }
  }

  if (callsiteCount >= t.high_minCallsites) {
    return {
      blastRadius: 'HIGH',
      rationale:
        `HIGH — ${callsiteCount} callsites meets or exceeds ` +
        `high_minCallsites threshold of ${t.high_minCallsites}, ` +
        `spans ${affectedServiceCount} service${affectedServiceCount === 1 ? '' : 's'}.`,
    }
  }

  if (affectedServiceCount >= t.high_minServices) {
    return {
      blastRadius: 'HIGH',
      rationale:
        `HIGH — ${affectedServiceCount} services meets or exceeds ` +
        `high_minServices threshold of ${t.high_minServices} ` +
        `(${callsiteCount} callsites).`,
    }
  }

  if (callsiteCount > t.low_maxCallsites) {
    return {
      blastRadius: 'MEDIUM',
      rationale:
        `MEDIUM — ${callsiteCount} callsites exceeds ` +
        `low_maxCallsites threshold of ${t.low_maxCallsites} ` +
        `(<= medium_maxCallsites ${t.medium_maxCallsites}), ` +
        `spans ${affectedServiceCount} service${affectedServiceCount === 1 ? '' : 's'}.`,
    }
  }

  return {
    blastRadius: 'LOW',
    rationale:
      `LOW — ${callsiteCount} callsites is within ` +
      `low_maxCallsites threshold of ${t.low_maxCallsites}, ` +
      `spans ${affectedServiceCount} service${affectedServiceCount === 1 ? '' : 's'}.`,
  }
}

/**
 * Rank callers by how "heavy" they look. We have no call-frequency data in
 * ImpactRaw, so we use a deterministic, stable ordering: callers with a `via`
 * link are treated as weaker (transitive) than direct callers, then we keep
 * original order for stability. Finally the list is capped.
 *
 * @param {Caller[]} callers
 * @returns {Caller[]}
 */
function rankCallers(callers) {
  const direct = []
  const transitive = []
  for (const c of callers) {
    if (c && c.via) transitive.push(c)
    else if (c) direct.push(c)
  }
  return [...direct, ...transitive].slice(0, TOP_CALLERS_CAP)
}
