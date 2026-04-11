/**
 * JSDoc-only type declarations shared across the impact-engine module.
 * These mirror the shapes defined in
 * `modules/code-intel/CONTRACTS.md` and exist so editors and the
 * TypeScript language server can infer types for the pure-JS source.
 *
 * This file intentionally exports nothing at runtime.
 */

/**
 * @typedef {Object} SymbolRef
 * @property {string} name
 * @property {string} file
 * @property {number} [line]
 * @property {string} [kind]
 */

/**
 * @typedef {Object} Caller
 * @property {SymbolRef} from
 * @property {SymbolRef} to
 * @property {string} [via]
 */

/**
 * @typedef {"LOW"|"MEDIUM"|"HIGH"|"CRITICAL"} BlastRadius
 */

/**
 * @typedef {Object} ImpactRaw
 * @property {SymbolRef} target
 * @property {Caller[]} callers
 * @property {number} callsiteCount
 * @property {string[]} affectedClusters
 * @property {number} affectedServices
 */

/**
 * @typedef {Object} ImpactReport
 * @property {SymbolRef} target
 * @property {BlastRadius} blastRadius
 * @property {number} callsiteCount
 * @property {string[]} affectedClusterIds
 * @property {number} affectedServiceCount
 * @property {Caller[]} topCallers
 * @property {string} rationale
 */

/**
 * @typedef {Object} BlastRadiusThresholds
 * @property {number} low_maxCallsites
 * @property {number} medium_maxCallsites
 * @property {number} medium_maxServices
 * @property {number} high_minCallsites
 * @property {number} high_minServices
 * @property {number} critical_minCallsites
 */

/**
 * @typedef {Object} PreflightGateDecision
 * @property {"allow"|"block"} outcome
 * @property {string} reason
 * @property {ImpactReport[]} reports
 */

export {}
