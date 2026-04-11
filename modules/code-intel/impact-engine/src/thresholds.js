/**
 * @typedef {import('./types.js').BlastRadiusThresholds} BlastRadiusThresholds
 */

/**
 * Default blast radius thresholds as specified in CONTRACTS.md.
 * These are the authoritative defaults for the impact-engine module.
 *
 * @type {Readonly<BlastRadiusThresholds>}
 */
export const DEFAULT_THRESHOLDS = Object.freeze({
  low_maxCallsites: 5,
  medium_maxCallsites: 20,
  medium_maxServices: 1,
  high_minCallsites: 21,
  high_minServices: 2,
  critical_minCallsites: 50,
})

/**
 * Merge caller-supplied thresholds with the defaults. Returns a frozen object
 * so downstream code cannot mutate the result. Does not mutate its inputs.
 *
 * @param {Partial<BlastRadiusThresholds>} [overrides]
 * @returns {Readonly<BlastRadiusThresholds>}
 */
export function resolveThresholds(overrides) {
  if (!overrides) return DEFAULT_THRESHOLDS
  return Object.freeze({ ...DEFAULT_THRESHOLDS, ...overrides })
}
