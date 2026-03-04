// ---------------------------------------------------------------------------
// Server-side intelligence layer
// Moves deterministic logic out of the AI agent prompt into the server:
//   - Fuzzy title deduplication on issue creation
//   - Staleness detection → emits warning events
//   - Board hygiene checks (orphan issues, missing estimates)
//   - Steering queue management (human directives for AI consumption)
// ---------------------------------------------------------------------------

import { recordEvent } from './events.js'
import { broadcastEvent } from './ws.js'

// ---------------------------------------------------------------------------
// Steering Queue — human directives for the AI to process
// ---------------------------------------------------------------------------

// In-memory steering queue per project (directives persist until consumed)
const steeringQueues = new Map()

/**
 * Add a steering directive from a human.
 * @param {string} projectId
 * @param {object} directive - { text, priority?, context? }
 * @returns {object} The stored directive with id and timestamp
 */
export function addSteeringDirective(projectId, directive) {
  if (!steeringQueues.has(projectId)) {
    steeringQueues.set(projectId, [])
  }
  const entry = {
    id: `steer-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    text: directive.text,
    priority: directive.priority || 'normal',
    context: directive.context || null,
    createdAt: new Date().toISOString(),
    consumed: false,
  }
  steeringQueues.get(projectId).push(entry)

  // Record as an event for the activity stream
  const event = recordEvent({
    project_id: projectId,
    actor: 'human',
    category: 'steering',
    action: 'steer',
    entity_type: 'directive',
    entity_id: entry.id,
    entity_title: entry.text.slice(0, 120),
    reasoning: null,
    data: entry,
  })
  broadcastEvent(event)

  return entry
}

/**
 * Get pending (unconsumed) steering directives for a project.
 * @param {string} projectId
 * @param {object} options - { consume?: boolean }
 */
export function getSteeringDirectives(projectId, { consume = false } = {}) {
  const queue = steeringQueues.get(projectId) || []
  const pending = queue.filter((d) => !d.consumed)

  if (consume && pending.length > 0) {
    pending.forEach((d) => {
      d.consumed = true
      d.consumedAt = new Date().toISOString()
    })
  }

  return pending
}

/**
 * Acknowledge a specific steering directive.
 */
export function acknowledgeDirective(projectId, directiveId) {
  const queue = steeringQueues.get(projectId) || []
  const directive = queue.find((d) => d.id === directiveId)
  if (directive) {
    directive.consumed = true
    directive.consumedAt = new Date().toISOString()
  }
  return directive || null
}

// ---------------------------------------------------------------------------
// Fuzzy title deduplication
// ---------------------------------------------------------------------------

/**
 * Normalize a title for comparison — lowercase, collapse whitespace,
 * strip common prefixes like "Add", "Implement", "Create", "Fix".
 */
function normalizeTitle(title) {
  return title
    .toLowerCase()
    .replace(/^(add|implement|create|build|fix|update|refactor|remove|delete)\s+/i, '')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Simple bigram similarity (Dice coefficient).
 * Returns a score between 0 and 1.
 */
function bigramSimilarity(a, b) {
  if (a === b) return 1
  if (a.length < 2 || b.length < 2) return 0

  const bigramsA = new Set()
  for (let i = 0; i < a.length - 1; i++) bigramsA.add(a.slice(i, i + 2))

  let intersection = 0
  const bigramCountB = b.length - 1
  for (let i = 0; i < b.length - 1; i++) {
    if (bigramsA.has(b.slice(i, i + 2))) intersection++
  }

  return (2 * intersection) / (bigramsA.size + bigramCountB)
}

/**
 * Check if a new issue title is too similar to existing issues.
 * Returns { isDuplicate, matches } where matches is an array of
 * { issue, score } sorted by score descending.
 *
 * @param {string} newTitle
 * @param {Array} existingIssues
 * @param {number} threshold - similarity threshold (0-1, default 0.75)
 */
export function checkTitleDuplication(newTitle, existingIssues, threshold = 0.75) {
  const normalizedNew = normalizeTitle(newTitle)
  const matches = []

  for (const issue of existingIssues) {
    const normalizedExisting = normalizeTitle(issue.title)
    const score = bigramSimilarity(normalizedNew, normalizedExisting)
    if (score >= threshold) {
      matches.push({ issue, score })
    }
  }

  matches.sort((a, b) => b.score - a.score)

  return {
    isDuplicate: matches.length > 0,
    matches,
  }
}

// ---------------------------------------------------------------------------
// Board hygiene checks
// ---------------------------------------------------------------------------

/**
 * Run board hygiene checks and return findings.
 * @param {object} project - Full project object with board data
 * @returns {Array<{ type, severity, message, entityId?, entityTitle? }>}
 */
export function runBoardHygiene(project) {
  const findings = []
  const issues = project.board?.issues || []
  const sprints = project.board?.sprints || []

  // 1. In-progress issues without estimates
  const inProgressNoEstimate = issues.filter(
    (i) =>
      i.status === 'In Progress' &&
      (i.storyPoints === null || i.storyPoints === undefined) &&
      i.type !== 'epic'
  )
  for (const issue of inProgressNoEstimate) {
    findings.push({
      type: 'missing_estimate',
      severity: 'warning',
      message: `"${issue.title}" is in progress but has no story point estimate`,
      entityId: issue.id,
      entityTitle: issue.title,
    })
  }

  // 2. Orphan issues (non-epic issues not assigned to any epic)
  const epics = issues.filter((i) => i.type === 'epic')
  if (epics.length > 0) {
    const orphans = issues.filter((i) => i.type !== 'epic' && !i.epicId && i.status !== 'Done')
    if (orphans.length > 3) {
      findings.push({
        type: 'orphan_issues',
        severity: 'info',
        message: `${orphans.length} issues are not assigned to any epic`,
      })
    }
  }

  // 3. Sprint with all issues done → suggest closing
  for (const sprint of sprints) {
    if (sprint.status !== 'active') continue
    const sprintIssues = issues.filter((i) => i.sprintId === sprint.id && i.type !== 'epic')
    if (sprintIssues.length > 0 && sprintIssues.every((i) => i.status === 'Done')) {
      findings.push({
        type: 'sprint_completable',
        severity: 'info',
        message: `Sprint "${sprint.name}" has all issues done — consider closing it`,
        entityId: sprint.id,
        entityTitle: sprint.name,
      })
    }
  }

  // 4. Issues stuck in same status for too long (7+ days)
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  const stuckIssues = issues.filter(
    (i) =>
      i.status === 'In Progress' && i.updatedAt && new Date(i.updatedAt).getTime() < sevenDaysAgo
  )
  for (const issue of stuckIssues) {
    findings.push({
      type: 'stuck_issue',
      severity: 'warning',
      message: `"${issue.title}" has been In Progress for 7+ days without updates`,
      entityId: issue.id,
      entityTitle: issue.title,
    })
  }

  return findings
}

/**
 * Run hygiene checks and emit findings as events.
 */
export function emitHygieneEvents(projectId, project) {
  const findings = runBoardHygiene(project)
  const events = []

  for (const finding of findings) {
    const event = recordEvent({
      project_id: projectId,
      actor: 'system',
      category: 'board',
      action: 'info',
      entity_type: finding.entityId ? 'issue' : null,
      entity_id: finding.entityId || null,
      entity_title: finding.message,
      reasoning: null,
      data: finding,
    })
    events.push(event)
    broadcastEvent(event)
  }

  return events
}
