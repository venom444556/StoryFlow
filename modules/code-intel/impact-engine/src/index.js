/**
 * @storyflow/code-intel-impact-engine
 *
 * Pure-logic blast radius classification and pre-flight gate policy.
 * No I/O. No network. No clock. No randomness. Same input, same output.
 */

export { analyzeImpact, classify, TOP_CALLERS_CAP } from './analyze.js'
export { preflightGate } from './gate.js'
export { DEFAULT_THRESHOLDS, resolveThresholds } from './thresholds.js'
