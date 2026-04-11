/**
 * @typedef {import('./types.js').ImpactReport} ImpactReport
 * @typedef {import('./types.js').BlastRadius} BlastRadius
 * @typedef {import('./types.js').PreflightGateDecision} PreflightGateDecision
 */

/**
 * Numeric severity rank. Higher = worse. Used only for comparison;
 * never exposed in the public API.
 * @type {Record<BlastRadius, number>}
 */
const SEVERITY_RANK = Object.freeze({
  LOW: 0,
  MEDIUM: 1,
  HIGH: 2,
  CRITICAL: 3,
})

/**
 * Decide whether a ticket should be blocked from entering In Progress based
 * on the blast radius of its linked symbols.
 *
 * Blocks if ANY report has a blast radius >= `blockAt`. Returns the original
 * reports array (by reference — the function does not mutate it) on the
 * decision so callers can surface the same data to humans.
 *
 * Pure: no I/O, no randomness, no clock.
 *
 * @param {ImpactReport[]} reports
 * @param {"MEDIUM"|"HIGH"|"CRITICAL"} blockAt
 * @returns {PreflightGateDecision}
 */
export function preflightGate(reports, blockAt) {
  if (!Array.isArray(reports)) {
    throw new TypeError('preflightGate: reports must be an array')
  }
  if (!(blockAt in SEVERITY_RANK) || blockAt === 'LOW') {
    throw new RangeError(
      `preflightGate: blockAt must be MEDIUM, HIGH, or CRITICAL (got "${blockAt}")`
    )
  }

  if (reports.length === 0) {
    return {
      outcome: 'allow',
      reason: 'no linked symbols.',
      reports: [],
    }
  }

  const threshold = SEVERITY_RANK[blockAt]
  let worst = reports[0]
  for (const r of reports) {
    if (SEVERITY_RANK[r.blastRadius] > SEVERITY_RANK[worst.blastRadius]) {
      worst = r
    }
  }

  if (SEVERITY_RANK[worst.blastRadius] >= threshold) {
    const targetName = (worst.target && worst.target.name) || '<unknown symbol>'
    return {
      outcome: 'block',
      reason:
        `blocked at ${blockAt} — worst linked symbol "${targetName}" ` +
        `classified ${worst.blastRadius}: ${worst.rationale}`,
      reports,
    }
  }

  return {
    outcome: 'allow',
    reason:
      `all ${reports.length} linked symbol${reports.length === 1 ? '' : 's'} ` +
      `below ${blockAt} threshold (worst: ${worst.blastRadius}).`,
    reports,
  }
}
