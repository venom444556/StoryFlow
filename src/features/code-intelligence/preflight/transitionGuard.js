import { runPreflightForIssue } from './gate.js'

/**
 * Error thrown when a status transition to "In Progress" is blocked by
 * the pre-flight gate. Carries the full decision so UI components can
 * render the gate dialog with reports + reason.
 */
export class PreflightBlockedError extends Error {
  constructor(decision) {
    super((decision && decision.reason) || 'Pre-flight gate blocked transition to In Progress')
    this.name = 'PreflightBlockedError'
    this.decision = decision
  }
}

/**
 * Wraps a store mutation so that any transition to "In Progress" runs the
 * pre-flight gate first. Returns a new function with the same signature
 * that may reject with a PreflightBlockedError.
 *
 * @param {(projectId: string, issueId: string, updates: object) => Promise} updateFn
 * @param {(issueId: string) => (object|undefined)} getIssue
 * @returns {(projectId: string, issueId: string, updates: object) => Promise}
 */
export function withPreflightGuard(updateFn, getIssue) {
  return async function guardedUpdate(projectId, issueId, updates) {
    if (!updates || updates.status !== 'In Progress') {
      return updateFn(projectId, issueId, updates)
    }
    const issue = typeof getIssue === 'function' ? getIssue(issueId) : undefined
    const decision = await runPreflightForIssue(issue)
    if (decision && decision.outcome === 'block') {
      throw new PreflightBlockedError(decision)
    }
    return updateFn(projectId, issueId, updates)
  }
}
