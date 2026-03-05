import { formatDistanceToNowStrict } from 'date-fns'

const FOUR_HOURS_MS = 4 * 60 * 60 * 1000

/**
 * Determine if an "In Progress" issue is stale.
 * Returns { isStale: false } for non-qualifying issues.
 */
export function getStaleInfo(issue, thresholdMs = FOUR_HOURS_MS) {
  if (!issue || issue.status !== 'In Progress' || !issue.updatedAt) {
    return { isStale: false, agoText: '' }
  }

  const elapsed = Date.now() - new Date(issue.updatedAt).getTime()
  if (elapsed < thresholdMs) {
    return { isStale: false, agoText: '' }
  }

  return {
    isStale: true,
    agoText: formatDistanceToNowStrict(new Date(issue.updatedAt)),
  }
}
