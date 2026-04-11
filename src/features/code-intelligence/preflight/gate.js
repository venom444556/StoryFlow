import { getCodeIntelligenceModule } from '../index.js'

/**
 * StoryFlow-aware wrapper around the impact-engine pre-flight gate.
 *
 * Fetches the code-intelligence module singleton, delegates to its
 * `runPreflight` implementation, and returns the resulting decision.
 *
 * Fail-open posture: if the module is disabled, missing, or throws,
 * we return an `allow` decision so a broken feature module can never
 * brick status transitions on the board.
 *
 * @param {import('../../../../modules/code-intel/CONTRACTS.md').Issue} issue
 * @returns {Promise<import('../../../../modules/code-intel/CONTRACTS.md').PreflightGateDecision>}
 */
export async function runPreflightForIssue(issue) {
  try {
    const module = getCodeIntelligenceModule()
    if (!module || !module.config || module.config.enabled === false) {
      return {
        outcome: 'allow',
        reason: 'code-intelligence disabled',
        reports: [],
      }
    }
    const decision = await module.runPreflight(issue)
    return decision
  } catch (err) {
    console.warn('[preflight-gate] failed, failing open:', err)
    return {
      outcome: 'allow',
      reason: 'preflight errored: ' + (err && err.message ? err.message : String(err)),
      reports: [],
    }
  }
}
