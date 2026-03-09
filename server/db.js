// ---------------------------------------------------------------------------
// SQLite database layer for StoryFlow (using sql.js — pure JS, no native deps)
// Stores data in data/storyflow.db with WAL-style manual persistence
// ---------------------------------------------------------------------------

import initSqlJs from 'sql.js'
import { readFileSync, existsSync, mkdirSync, renameSync } from 'node:fs'
import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { initEvents } from './events.js'
import { initSteering } from './intelligence.js'

const DATA_DIR = join(process.cwd(), 'data')
const DB_PATH = join(DATA_DIR, 'storyflow.db')
const JSON_PATH = join(DATA_DIR, 'storyflow-data.json')
const JSON_BACKUP_PATH = join(DATA_DIR, 'storyflow-data.json.backup')

let db = null
let _saveTimer = null

// ---------------------------------------------------------------------------
// Initialization
// ---------------------------------------------------------------------------

/** Initialize the database (must be called before any other function) */
export async function initDb() {
  const SQL = await initSqlJs()

  mkdirSync(DATA_DIR, { recursive: true })

  // Load existing DB from disk if it exists
  if (existsSync(DB_PATH)) {
    const buffer = readFileSync(DB_PATH)
    db = new SQL.Database(buffer)
    console.log('[DB] Loaded existing database from', DB_PATH)
  } else {
    db = new SQL.Database()
    console.log('[DB] Created new database')
  }

  // Create schema (IF NOT EXISTS — safe to run always)
  db.run(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      status TEXT DEFAULT 'planning',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      deleted_at TEXT,
      is_seed INTEGER DEFAULT 0,
      seed_version INTEGER,
      issue_count INTEGER DEFAULT 0,
      sprint_count INTEGER DEFAULT 0,
      data TEXT NOT NULL
    )
  `)

  db.run('CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status)')
  db.run('CREATE INDEX IF NOT EXISTS idx_projects_deleted ON projects(deleted_at)')
  db.run('CREATE INDEX IF NOT EXISTS idx_projects_updated ON projects(updated_at DESC)')

  // Agent session memory
  db.run(`
    CREATE TABLE IF NOT EXISTS agent_sessions (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      started_at TEXT NOT NULL,
      ended_at TEXT,
      summary TEXT,
      work_done TEXT,
      issues_created INTEGER DEFAULT 0,
      issues_updated INTEGER DEFAULT 0,
      events_recorded INTEGER DEFAULT 0,
      key_decisions TEXT,
      learnings TEXT,
      wiki_pages_updated TEXT,
      next_steps TEXT,
      created_at TEXT NOT NULL
    )
  `)
  db.run(
    'CREATE INDEX IF NOT EXISTS idx_agent_sessions_project ON agent_sessions(project_id, created_at DESC)'
  )

  // Snapshots table for undo/restore
  db.run(`
    CREATE TABLE IF NOT EXISTS snapshots (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      trigger_action TEXT NOT NULL,
      trigger_entity TEXT,
      trigger_actor TEXT,
      data TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `)
  db.run(
    'CREATE INDEX IF NOT EXISTS idx_snapshots_project ON snapshots(project_id, created_at DESC)'
  )

  // Initialize event stream table
  initEvents(db)

  // Initialize steering directives table
  initSteering(db)

  await saveToDisk()

  // Auto-migrate from JSON if DB is empty and JSON exists
  if (countProjects() === 0 && existsSync(JSON_PATH)) {
    console.log('[DB] Migrating from JSON file...')
    migrateFromJson()
  }
}

/** Persist database to disk asynchronously (non-blocking) */
async function saveToDisk() {
  if (!db) return
  const data = db.export()
  await writeFile(DB_PATH, Buffer.from(data))
}

/** Schedule a save (debounced 100ms to batch rapid writes) */
export function scheduleSave() {
  clearTimeout(_saveTimer)
  _saveTimer = setTimeout(saveToDisk, 100)
}

/** Force immediate save (for shutdown) */
export async function flushToDisk() {
  clearTimeout(_saveTimer)
  await saveToDisk()
}

// ---------------------------------------------------------------------------
// Write lock — serializes read→modify→write operations per project to prevent
// concurrent requests from overwriting each other's changes (#12).
// ---------------------------------------------------------------------------
const _projectLocks = new Map()

/**
 * Acquire a per-project lock, execute fn(), then release.
 * Concurrent callers for the same projectId queue up and run sequentially.
 */
export function withProjectLock(projectId, fn) {
  const prev = _projectLocks.get(projectId) || Promise.resolve()
  const next = prev.then(fn, fn) // run fn even if prior rejects
  _projectLocks.set(projectId, next)
  // Prevent unhandled rejection crashes (Node 15+ terminates on these)
  next.catch((err) => {
    console.error(`[DB] Unhandled error in project lock for ${projectId}:`, err.message || err)
  })
  // Clean up the map entry when the chain settles to avoid unbounded growth
  next.finally(() => {
    if (_projectLocks.get(projectId) === next) {
      _projectLocks.delete(projectId)
    }
  })
  return next
}

// ---------------------------------------------------------------------------
// Migration from JSON
// ---------------------------------------------------------------------------

function migrateFromJson() {
  try {
    const raw = readFileSync(JSON_PATH, 'utf-8')
    const { projects } = JSON.parse(raw)

    if (!projects || projects.length === 0) {
      console.log('[DB] JSON file is empty, nothing to migrate')
      return
    }

    const stmt = db.prepare(`
      INSERT OR REPLACE INTO projects
        (id, name, description, status, created_at, updated_at,
         deleted_at, is_seed, seed_version, issue_count, sprint_count, data)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    for (const p of projects) {
      stmt.bind([
        p.id,
        p.name || '',
        p.description || '',
        p.status || 'planning',
        p.createdAt || new Date().toISOString(),
        p.updatedAt || new Date().toISOString(),
        p.deletedAt || null,
        p.isSeed ? 1 : 0,
        p.seedVersion || null,
        p.board?.issues?.length || 0,
        p.board?.sprints?.length || 0,
        JSON.stringify(p),
      ])
      stmt.step()
      stmt.reset()
    }
    stmt.free()

    saveToDisk()

    // Backup the JSON file
    renameSync(JSON_PATH, JSON_BACKUP_PATH)
    console.log(`[DB] Migrated ${projects.length} projects from JSON → SQLite`)
    console.log(`[DB] JSON backup saved to ${JSON_BACKUP_PATH}`)
  } catch (err) {
    console.error('[DB] Migration failed:', err.message)
  }
}

// ---------------------------------------------------------------------------
// Project CRUD
// ---------------------------------------------------------------------------

function countProjects() {
  const result = db.exec('SELECT COUNT(*) FROM projects')
  return result.length > 0 ? result[0].values[0][0] : 0
}

/** List all active projects (summary — no full data JSON) */
export function listProjects() {
  const results = db.exec(`
    SELECT id, name, description, status, updated_at, created_at,
           issue_count, sprint_count
    FROM projects
    WHERE deleted_at IS NULL
    ORDER BY updated_at DESC
  `)

  if (results.length === 0) return []

  return results[0].values.map((row) => ({
    id: row[0],
    name: row[1],
    description: row[2] || '',
    status: row[3],
    updatedAt: row[4],
    createdAt: row[5],
    issueCount: row[6] || 0,
    sprintCount: row[7] || 0,
  }))
}

/** Get a single project by ID (full data — parses JSON blob) */
export function getProject(id) {
  const results = db.exec('SELECT data FROM projects WHERE id = ? AND deleted_at IS NULL', [id])
  if (results.length === 0 || results[0].values.length === 0) return null
  return JSON.parse(results[0].values[0][0])
}

/** Upsert a project (insert or replace) */
export function upsertProject(id, project) {
  db.run(
    `INSERT OR REPLACE INTO projects
      (id, name, description, status, created_at, updated_at,
       deleted_at, is_seed, seed_version, issue_count, sprint_count, data)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      project.name || '',
      project.description || '',
      project.status || 'planning',
      project.createdAt || new Date().toISOString(),
      project.updatedAt || new Date().toISOString(),
      project.deletedAt || null,
      project.isSeed ? 1 : 0,
      project.seedVersion || null,
      project.board?.issues?.length || 0,
      project.board?.sprints?.length || 0,
      JSON.stringify(project),
    ]
  )
  scheduleSave()
}

/** Update a project (merges updates into existing data) */
export function updateProject(id, updates) {
  const existing = getProject(id)
  if (!existing) return null
  const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() }
  upsertProject(id, updated)
  return updated
}

/** Soft-delete a project */
export function softDeleteProject(id) {
  const now = new Date().toISOString()
  db.run('UPDATE projects SET deleted_at = ?, updated_at = ? WHERE id = ?', [now, now, id])
  scheduleSave()
}

/** Hard-delete a project */
export function deleteProject(id) {
  db.run('DELETE FROM projects WHERE id = ?', [id])
  scheduleSave()
}

/** Sync: replace all projects (called by client on load) */
export async function syncAll(projects) {
  if (!Array.isArray(projects) || projects.length === 0) {
    console.warn('[DB] syncAll called with empty/invalid projects — skipping to prevent data wipe')
    return
  }
  try {
    db.run('DELETE FROM projects')
    for (const p of projects) {
      upsertProject(p.id, p)
    }
    await saveToDisk()
  } catch (err) {
    console.error('[DB] CRITICAL: syncAll failed during re-insert:', err.message)
    throw err
  }
}

// ---------------------------------------------------------------------------
// Issue operations (read from project JSON, write back)
// ---------------------------------------------------------------------------

export function listIssues(projectId, filters = {}) {
  const project = getProject(projectId)
  if (!project) return null
  let issues = project.board?.issues || []
  if (filters.status) issues = issues.filter((i) => i.status === filters.status)
  if (filters.type) issues = issues.filter((i) => i.type === filters.type)
  if (filters.epicId) issues = issues.filter((i) => i.epicId === filters.epicId)
  if (filters.sprintId) issues = issues.filter((i) => i.sprintId === filters.sprintId)
  if (filters.assignee) issues = issues.filter((i) => i.assignee === filters.assignee)
  if (filters.search) {
    const q = filters.search.toLowerCase()
    issues = issues.filter(
      (i) =>
        (i.title && i.title.toLowerCase().includes(q)) ||
        (i.key && i.key.toLowerCase().includes(q)) ||
        (i.description && i.description.toLowerCase().includes(q))
    )
  }

  const total = issues.length

  // Pagination
  const page = Math.max(1, parseInt(filters.page, 10) || 1)
  const limit = Math.min(100, Math.max(1, parseInt(filters.limit, 10) || 50))
  const offset = (page - 1) * limit

  // Fields selection — return summary format when requested
  if (filters.fields === 'summary') {
    issues = issues.map((i) => ({
      id: i.id,
      key: i.key,
      title: i.title,
      status: i.status,
      type: i.type,
    }))
  }

  const paginated = issues.slice(offset, offset + limit)

  return { issues: paginated, total, page, limit, hasMore: offset + limit < total }
}

// Normalize common status variants to canonical Title Case values
const STATUS_ALIASES = {
  'to do': 'To Do',
  todo: 'To Do',
  'to-do': 'To Do',
  backlog: 'To Do',
  'in progress': 'In Progress',
  'in-progress': 'In Progress',
  inprogress: 'In Progress',
  wip: 'In Progress',
  done: 'Done',
  completed: 'Done',
  closed: 'Done',
  blocked: 'Blocked',
  'on hold': 'Blocked',
  'on-hold': 'Blocked',
}

function normalizeStatus(status) {
  if (!status) return 'To Do'
  // Already canonical
  if (['To Do', 'In Progress', 'Done', 'Blocked'].includes(status)) return status
  // Try case-insensitive alias lookup
  const normalized = STATUS_ALIASES[status.toLowerCase().trim()]
  return normalized || null // null = unknown status
}

/**
 * Auto-advance project phase based on issue statuses.
 * planning → in-progress: any issue is "In Progress"
 * in-progress → completed: all issues are "Done" (with ≥1 issue)
 * Never advances from on-hold or completed (manual overrides).
 */
function maybeAdvanceProjectPhase(project) {
  const issues = project.board?.issues || []
  if (issues.length === 0) return
  const current = project.status || 'planning'

  if (current === 'planning' && issues.some((i) => i.status === 'In Progress')) {
    project.status = 'in-progress'
    return
  }

  if (current === 'in-progress' && issues.every((i) => i.status === 'Done')) {
    project.status = 'completed'
    return
  }
}

export function addIssue(projectId, issue) {
  const project = getProject(projectId)
  if (!project) return null
  if (!project.board) project.board = { issues: [], sprints: [], nextIssueNumber: 1 }

  // Normalize status — reject unknown values, default to 'To Do'
  const normalized = normalizeStatus(issue.status)
  if (!normalized)
    return { error: `Unknown status "${issue.status}". Valid: To Do, In Progress, Blocked, Done` }
  issue.status = normalized

  const nextNumber = project.board.nextIssueNumber || 1
  const prefix =
    project.name
      .split(/[\s-]+/)
      .filter(Boolean)
      .map((w) => w[0].toUpperCase())
      .join('')
      .slice(0, 3) || 'IS'
  const now = new Date().toISOString()

  const newIssue = {
    ...issue,
    id: issue.id || crypto.randomUUID(),
    key: issue.key || `${prefix}-${nextNumber}`,
    createdAt: now,
    updatedAt: now,
  }

  if (newIssue.status === 'To Do' && !newIssue.todoAt) newIssue.todoAt = now
  else if (newIssue.status === 'In Progress' && !newIssue.inProgressAt) newIssue.inProgressAt = now
  else if (newIssue.status === 'Blocked' && !newIssue.blockedAt) newIssue.blockedAt = now
  else if (newIssue.status === 'Done' && !newIssue.doneAt) newIssue.doneAt = now

  project.board.issues.push(newIssue)
  project.board.nextIssueNumber = nextNumber + 1
  project.updatedAt = now
  maybeAdvanceProjectPhase(project)
  upsertProject(projectId, project)
  return newIssue
}

export function updateIssue(projectId, issueId, updates) {
  const project = getProject(projectId)
  if (!project) return null
  const issue = project.board?.issues?.find((i) => i.id === issueId)
  if (!issue) return null

  // Normalize status if provided
  if (updates.status) {
    const normalized = normalizeStatus(updates.status)
    if (!normalized)
      return {
        error: `Unknown status "${updates.status}". Valid: To Do, In Progress, Blocked, Done`,
      }
    updates.status = normalized
  }

  const now = new Date().toISOString()

  if (updates.status && updates.status !== issue.status) {
    if (updates.status === 'To Do' && !issue.todoAt) updates.todoAt = now
    else if (updates.status === 'In Progress' && !issue.inProgressAt) updates.inProgressAt = now
    else if (updates.status === 'Blocked' && !issue.blockedAt) updates.blockedAt = now
    else if (updates.status === 'Done' && !issue.doneAt) updates.doneAt = now
  }

  Object.assign(issue, updates, { updatedAt: now })
  project.updatedAt = now
  maybeAdvanceProjectPhase(project)
  upsertProject(projectId, project)
  return issue
}

export function getIssueByKey(projectId, key) {
  const project = getProject(projectId)
  if (!project) return null
  const issue = (project.board?.issues || []).find(
    (i) => i.key && i.key.toLowerCase() === key.toLowerCase()
  )
  return issue || null
}

export function updateIssueByKey(projectId, key, updates) {
  const issue = getIssueByKey(projectId, key)
  if (!issue) return null
  return updateIssue(projectId, issue.id, updates)
}

export function deleteIssueByKey(projectId, key) {
  const issue = getIssueByKey(projectId, key)
  if (!issue) return false
  return deleteIssue(projectId, issue.id)
}

export function addComment(projectId, issueId, comment) {
  const project = getProject(projectId)
  if (!project) return null
  const issue = project.board?.issues?.find((i) => i.id === issueId)
  if (!issue) return null

  if (!issue.comments) issue.comments = []
  const now = new Date().toISOString()
  const newComment = {
    id: crypto.randomUUID(),
    author: comment.author || 'agent',
    body: comment.body,
    createdAt: now,
  }
  issue.comments.push(newComment)
  issue.updatedAt = now
  project.updatedAt = now
  upsertProject(projectId, project)
  return newComment
}

export function addCommentByKey(projectId, key, comment) {
  const issue = getIssueByKey(projectId, key)
  if (!issue) return null
  return addComment(projectId, issue.id, comment)
}

export function deleteIssue(projectId, issueId) {
  const project = getProject(projectId)
  if (!project || !project.board?.issues) return false
  const idx = project.board.issues.findIndex((i) => i.id === issueId)
  if (idx === -1) return false
  project.board.issues.splice(idx, 1)
  project.updatedAt = new Date().toISOString()
  upsertProject(projectId, project)
  return true
}

// ---------------------------------------------------------------------------
// Sprint operations
// ---------------------------------------------------------------------------

export function listSprints(projectId) {
  const project = getProject(projectId)
  if (!project) return null
  return project.board?.sprints || []
}

export function addSprint(projectId, sprint) {
  const project = getProject(projectId)
  if (!project) return null
  if (!project.board) project.board = { issues: [], sprints: [], nextIssueNumber: 1 }

  const now = new Date().toISOString()
  const newSprint = {
    ...sprint,
    id: sprint.id || crypto.randomUUID(),
    status: sprint.status || 'planning',
    createdAt: now,
  }
  project.board.sprints.push(newSprint)
  project.updatedAt = now
  upsertProject(projectId, project)
  return newSprint
}

export function updateSprint(projectId, sprintId, updates) {
  const project = getProject(projectId)
  if (!project) return null
  const sprint = project.board?.sprints?.find((s) => s.id === sprintId)
  if (!sprint) return null

  const now = new Date().toISOString()
  Object.assign(sprint, updates, { updatedAt: now })
  project.updatedAt = now
  upsertProject(projectId, project)
  return sprint
}

// ---------------------------------------------------------------------------
// Page operations
// ---------------------------------------------------------------------------

export function listPages(projectId) {
  const project = getProject(projectId)
  if (!project) return null
  return (project.pages || []).map((p) => ({
    id: p.id,
    title: p.title,
    parentId: p.parentId || null,
    updatedAt: p.updatedAt,
  }))
}

export function getPage(projectId, pageId) {
  const project = getProject(projectId)
  if (!project) return null
  return (project.pages || []).find((p) => p.id === pageId) || null
}

export function addPage(projectId, page) {
  const project = getProject(projectId)
  if (!project) return null
  if (!project.pages) project.pages = []

  const now = new Date().toISOString()
  // Auto-publish "Agent:" pages — they're agent self-documentation, not user-facing drafts
  const autoPublish = page.createdBy === 'ai' && page.title?.startsWith('Agent:') && !page.status
  const newPage = {
    ...page,
    id: page.id || crypto.randomUUID(),
    status: autoPublish ? 'published' : page.status || 'draft',
    createdAt: now,
    updatedAt: now,
  }
  project.pages.push(newPage)
  project.updatedAt = now
  upsertProject(projectId, project)
  return newPage
}

export function updatePage(projectId, pageId, updates) {
  const project = getProject(projectId)
  if (!project) return null
  const page = project.pages?.find((p) => p.id === pageId)
  if (!page) return null

  const now = new Date().toISOString()
  Object.assign(page, updates, { updatedAt: now })
  project.updatedAt = now
  upsertProject(projectId, project)
  return page
}

export function deletePage(projectId, pageId) {
  const project = getProject(projectId)
  if (!project || !project.pages) return false
  const idx = project.pages.findIndex((p) => p.id === pageId)
  if (idx === -1) return false
  project.pages.splice(idx, 1)
  project.updatedAt = new Date().toISOString()
  upsertProject(projectId, project)
  return true
}

// ---------------------------------------------------------------------------
// Sprint deletion
// ---------------------------------------------------------------------------

export function deleteSprint(projectId, sprintId) {
  const project = getProject(projectId)
  if (!project || !project.board?.sprints) return false
  const idx = project.board.sprints.findIndex((s) => s.id === sprintId)
  if (idx === -1) return false
  project.board.sprints.splice(idx, 1)
  project.updatedAt = new Date().toISOString()
  upsertProject(projectId, project)
  return true
}

// ---------------------------------------------------------------------------
// Board summary
// ---------------------------------------------------------------------------

export function getBoardSummary(projectId) {
  const project = getProject(projectId)
  if (!project) return null

  const issues = project.board?.issues || []
  const sprints = project.board?.sprints || []

  const byStatus = { 'To Do': 0, 'In Progress': 0, Done: 0, Blocked: 0 }
  const byType = {}
  let totalPoints = 0
  let donePoints = 0

  for (const issue of issues) {
    const status = issue.status || 'To Do'
    byStatus[status] = (byStatus[status] || 0) + 1
    byType[issue.type] = (byType[issue.type] || 0) + 1
    if (issue.storyPoints) {
      totalPoints += issue.storyPoints
      if (issue.status === 'Done') donePoints += issue.storyPoints
    }
  }

  // Detect stale "In Progress" issues (>4 hours since last update)
  const STALE_THRESHOLD_MS = 4 * 60 * 60 * 1000
  const now = Date.now()
  const staleIssues = issues
    .filter(
      (i) =>
        i.status === 'In Progress' &&
        i.updatedAt &&
        now - new Date(i.updatedAt).getTime() > STALE_THRESHOLD_MS
    )
    .map((i) => ({ id: i.id, key: i.key, title: i.title, updatedAt: i.updatedAt }))

  return {
    projectName: project.name,
    projectStatus: project.status,
    issueCount: issues.length,
    byStatus,
    byType,
    totalPoints,
    donePoints,
    sprintCount: sprints.length,
    activeSprint: sprints.find((s) => s.status === 'active') || null,
    staleIssues,
    staleCount: staleIssues.length,
  }
}

// ---------------------------------------------------------------------------
// Decision operations
// ---------------------------------------------------------------------------

export function listDecisions(projectId) {
  const project = getProject(projectId)
  if (!project) return null
  return project.decisions || []
}

export function addDecision(projectId, decision) {
  const project = getProject(projectId)
  if (!project) return null
  if (!project.decisions) project.decisions = []

  const now = new Date().toISOString()
  const newDecision = {
    ...decision,
    id: decision.id || crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  }
  project.decisions.push(newDecision)
  project.updatedAt = now
  upsertProject(projectId, project)
  return newDecision
}

export function updateDecision(projectId, decisionId, updates) {
  const project = getProject(projectId)
  if (!project) return null
  const decision = (project.decisions || []).find((d) => d.id === decisionId)
  if (!decision) return null

  const now = new Date().toISOString()
  Object.assign(decision, updates, { updatedAt: now })
  project.updatedAt = now
  upsertProject(projectId, project)
  return decision
}

export function deleteDecision(projectId, decisionId) {
  const project = getProject(projectId)
  if (!project || !project.decisions) return false
  const idx = project.decisions.findIndex((d) => d.id === decisionId)
  if (idx === -1) return false
  project.decisions.splice(idx, 1)
  project.updatedAt = new Date().toISOString()
  upsertProject(projectId, project)
  return true
}

// ---------------------------------------------------------------------------
// Timeline phase operations
// ---------------------------------------------------------------------------

export function listPhases(projectId) {
  const project = getProject(projectId)
  if (!project) return null
  return project.timeline?.phases || []
}

export function addPhase(projectId, phase) {
  const project = getProject(projectId)
  if (!project) return null
  if (!project.timeline) project.timeline = { phases: [], milestones: [] }

  const now = new Date().toISOString()
  const newPhase = {
    ...phase,
    id: phase.id || crypto.randomUUID(),
    progress: phase.progress || 0,
    createdAt: now,
    updatedAt: now,
  }
  project.timeline.phases.push(newPhase)
  project.updatedAt = now
  upsertProject(projectId, project)
  return newPhase
}

export function updatePhase(projectId, phaseId, updates) {
  const project = getProject(projectId)
  if (!project) return null
  const phase = (project.timeline?.phases || []).find((p) => p.id === phaseId)
  if (!phase) return null

  const now = new Date().toISOString()
  Object.assign(phase, updates, { updatedAt: now })
  project.updatedAt = now
  upsertProject(projectId, project)
  return phase
}

export function deletePhase(projectId, phaseId) {
  const project = getProject(projectId)
  if (!project || !project.timeline?.phases) return false
  const idx = project.timeline.phases.findIndex((p) => p.id === phaseId)
  if (idx === -1) return false
  project.timeline.phases.splice(idx, 1)
  project.updatedAt = new Date().toISOString()
  upsertProject(projectId, project)
  return true
}

// ---------------------------------------------------------------------------
// Timeline milestone operations
// ---------------------------------------------------------------------------

export function listMilestones(projectId) {
  const project = getProject(projectId)
  if (!project) return null
  return project.timeline?.milestones || []
}

export function addMilestone(projectId, milestone) {
  const project = getProject(projectId)
  if (!project) return null
  if (!project.timeline) project.timeline = { phases: [], milestones: [] }

  const now = new Date().toISOString()
  const newMilestone = {
    ...milestone,
    id: milestone.id || crypto.randomUUID(),
    completed: milestone.completed || false,
    createdAt: now,
    updatedAt: now,
  }
  project.timeline.milestones.push(newMilestone)
  project.updatedAt = now
  upsertProject(projectId, project)
  return newMilestone
}

export function updateMilestone(projectId, milestoneId, updates) {
  const project = getProject(projectId)
  if (!project) return null
  const milestone = (project.timeline?.milestones || []).find((m) => m.id === milestoneId)
  if (!milestone) return null

  const now = new Date().toISOString()
  Object.assign(milestone, updates, { updatedAt: now })
  project.updatedAt = now
  upsertProject(projectId, project)
  return milestone
}

export function deleteMilestone(projectId, milestoneId) {
  const project = getProject(projectId)
  if (!project || !project.timeline?.milestones) return false
  const idx = project.timeline.milestones.findIndex((m) => m.id === milestoneId)
  if (idx === -1) return false
  project.timeline.milestones.splice(idx, 1)
  project.updatedAt = new Date().toISOString()
  upsertProject(projectId, project)
  return true
}

// ---------------------------------------------------------------------------
// Workflow nodes
// ---------------------------------------------------------------------------

export function listWorkflowNodes(projectId) {
  const project = getProject(projectId)
  if (!project) return null
  return project.workflow?.nodes || []
}

export function getWorkflowNode(projectId, nodeId) {
  const project = getProject(projectId)
  if (!project) return null
  return (project.workflow?.nodes || []).find((n) => n.id === nodeId) || null
}

export function addWorkflowNode(projectId, node) {
  const project = getProject(projectId)
  if (!project) return null
  if (!project.workflow) project.workflow = { nodes: [], connections: [] }
  if (!project.workflow.nodes) project.workflow.nodes = []

  const now = new Date().toISOString()
  const newNode = {
    ...node,
    id: node.id || crypto.randomUUID(),
    status: node.status || 'idle',
    createdAt: now,
    updatedAt: now,
  }
  project.workflow.nodes.push(newNode)
  project.updatedAt = now
  upsertProject(projectId, project)
  return newNode
}

export function updateWorkflowNode(projectId, nodeId, updates) {
  const project = getProject(projectId)
  if (!project) return null
  const node = (project.workflow?.nodes || []).find((n) => n.id === nodeId)
  if (!node) return null

  // #40 — Validate phase nodes: cannot set status to "success" if children are incomplete
  if (updates.status === 'success' && node.children?.nodes?.length > 0) {
    const children = node.children.nodes
    const allComplete = children.every((c) => c.status === 'success')
    if (!allComplete) {
      return { error: 'Cannot set phase to success: not all children are complete' }
    }
  }

  const now = new Date().toISOString()

  // Support updating a specific child node within a phase
  if (updates.child_id) {
    const child = (node.children?.nodes || []).find((c) => c.id === updates.child_id)
    if (!child) return null
    const { child_id, ...childUpdates } = updates
    Object.assign(child, childUpdates, { updatedAt: now })

    // Auto-derive parent phase status from children
    const children = node.children.nodes
    const allSuccess = children.every((c) => c.status === 'success')
    const anyRunning = children.some((c) => c.status === 'running')
    const anyError = children.some((c) => c.status === 'error')
    if (allSuccess) node.status = 'success'
    else if (anyError) node.status = 'error'
    else if (anyRunning) node.status = 'running'

    node.updatedAt = now
  } else {
    Object.assign(node, updates, { updatedAt: now })
  }

  project.updatedAt = now
  upsertProject(projectId, project)
  return node
}

export function deleteWorkflowNode(projectId, nodeId) {
  const project = getProject(projectId)
  if (!project || !project.workflow?.nodes) return false
  const idx = project.workflow.nodes.findIndex((n) => n.id === nodeId)
  if (idx === -1) return false
  project.workflow.nodes.splice(idx, 1)
  // Also remove connections referencing this node
  if (project.workflow.connections) {
    project.workflow.connections = project.workflow.connections.filter(
      (c) => c.from !== nodeId && c.to !== nodeId
    )
  }
  project.updatedAt = new Date().toISOString()
  upsertProject(projectId, project)
  return true
}

export function linkIssueToWorkflowNode(projectId, nodeId, issueKey) {
  const project = getProject(projectId)
  if (!project) return null
  const node = (project.workflow?.nodes || []).find((n) => n.id === nodeId)
  if (!node) return null

  if (!node.linkedIssueKeys) node.linkedIssueKeys = []
  if (!node.linkedIssueKeys.includes(issueKey)) {
    node.linkedIssueKeys.push(issueKey)
  }
  const now = new Date().toISOString()
  node.updatedAt = now
  project.updatedAt = now
  upsertProject(projectId, project)
  return node
}

export function unlinkIssueFromWorkflowNode(projectId, nodeId, issueKey) {
  const project = getProject(projectId)
  if (!project) return null
  const node = (project.workflow?.nodes || []).find((n) => n.id === nodeId)
  if (!node || !node.linkedIssueKeys) return null

  node.linkedIssueKeys = node.linkedIssueKeys.filter((k) => k !== issueKey)
  const now = new Date().toISOString()
  node.updatedAt = now
  project.updatedAt = now
  upsertProject(projectId, project)
  return node
}

// ---------------------------------------------------------------------------
// Architecture components
// ---------------------------------------------------------------------------

export function listArchitectureComponents(projectId) {
  const project = getProject(projectId)
  if (!project) return null
  return project.architecture?.components || []
}

export function getArchitectureComponent(projectId, componentId) {
  const project = getProject(projectId)
  if (!project) return null
  return (project.architecture?.components || []).find((c) => c.id === componentId) || null
}

export function addArchitectureComponent(projectId, component) {
  const project = getProject(projectId)
  if (!project) return null
  if (!project.architecture) project.architecture = { components: [], connections: [] }
  if (!project.architecture.components) project.architecture.components = []

  const now = new Date().toISOString()
  const newComp = {
    ...component,
    id: component.id || crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  }
  project.architecture.components.push(newComp)
  project.updatedAt = now
  upsertProject(projectId, project)
  return newComp
}

export function updateArchitectureComponent(projectId, componentId, updates) {
  const project = getProject(projectId)
  if (!project) return null
  const comp = (project.architecture?.components || []).find((c) => c.id === componentId)
  if (!comp) return null

  const now = new Date().toISOString()
  Object.assign(comp, updates, { updatedAt: now })
  project.updatedAt = now
  upsertProject(projectId, project)
  return comp
}

export function deleteArchitectureComponent(projectId, componentId) {
  const project = getProject(projectId)
  if (!project || !project.architecture?.components) return false
  const idx = project.architecture.components.findIndex((c) => c.id === componentId)
  if (idx === -1) return false
  project.architecture.components.splice(idx, 1)
  // Also remove connections referencing this component
  if (project.architecture.connections) {
    project.architecture.connections = project.architecture.connections.filter(
      (c) => c.from !== componentId && c.to !== componentId
    )
  }
  project.updatedAt = new Date().toISOString()
  upsertProject(projectId, project)
  return true
}

// ---------------------------------------------------------------------------
// Snapshot operations — Phase 3
// ---------------------------------------------------------------------------

const MAX_SNAPSHOTS_PER_PROJECT = 20

export function createSnapshot(projectId, { action, entity, actor }) {
  const project = getProject(projectId)
  if (!project) return null

  const id = crypto.randomUUID()
  const now = new Date().toISOString()

  db.run(
    `INSERT INTO snapshots (id, project_id, trigger_action, trigger_entity, trigger_actor, data, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, projectId, action, entity || null, actor || null, JSON.stringify(project), now]
  )

  const countResult = db.exec('SELECT COUNT(*) FROM snapshots WHERE project_id = ?', [projectId])
  const count = countResult.length > 0 ? countResult[0].values[0][0] : 0
  if (count > MAX_SNAPSHOTS_PER_PROJECT) {
    db.run(
      `DELETE FROM snapshots WHERE id IN (
         SELECT id FROM snapshots WHERE project_id = ?
         ORDER BY created_at ASC LIMIT ?
       )`,
      [projectId, count - MAX_SNAPSHOTS_PER_PROJECT]
    )
  }

  scheduleSave()
  return {
    id,
    project_id: projectId,
    trigger_action: action,
    trigger_entity: entity,
    created_at: now,
  }
}

export function listSnapshots(projectId) {
  const results = db.exec(
    `SELECT id, project_id, trigger_action, trigger_entity, trigger_actor, created_at
     FROM snapshots WHERE project_id = ? ORDER BY created_at DESC`,
    [projectId]
  )
  if (results.length === 0) return []
  return results[0].values.map((row) => ({
    id: row[0],
    project_id: row[1],
    trigger_action: row[2],
    trigger_entity: row[3],
    trigger_actor: row[4],
    created_at: row[5],
  }))
}

export function restoreSnapshot(projectId, snapshotId) {
  const results = db.exec('SELECT data FROM snapshots WHERE id = ? AND project_id = ?', [
    snapshotId,
    projectId,
  ])
  if (results.length === 0 || results[0].values.length === 0) return null
  const project = JSON.parse(results[0].values[0][0])
  upsertProject(projectId, project)
  return project
}

// ---------------------------------------------------------------------------
// Add project (convenience — creates from partial data)
// ---------------------------------------------------------------------------

const DEPENDENCIES_TEMPLATE = `# Dependencies & Tech Stack

## Runtime Versions
| Runtime | Version |
|---------|---------|
| | |

## Production Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| | | |

## Dev Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| | | |

## External Services & APIs
| Service | Purpose | Required? |
|---------|---------|-----------|
| | | |

## Environment Variables
| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| | | | |

## DB Migrations
| Migration | Description | Date |
|-----------|-------------|------|
| | | |
`

const WORKFLOW_RULES_TEMPLATE = `# Agent: Workflow Rules

## Update Rules
1. **Proactive, not reactive** — Update StoryFlow before or during implementation, not after being asked.
2. **Create issues before writing code** — Every code change should have a corresponding issue in "In Progress" status.
3. **Mark Done immediately** — When a story/task is complete, update its status to "Done" right away.
4. **Update workflow nodes** — When completing work linked to workflow nodes, update the node status.

## Dependency Transparency
- When adding a new dependency (npm, pip, etc.), update the "Dependencies & Tech Stack" wiki page.
- When adding a new environment variable, document it immediately.
- When creating a DB migration, log it in the Dependencies page.

## Workflow Node Maintenance
- Keep workflow node statuses in sync with actual progress.
- Phase nodes derive status from children — update children, not the parent directly.
- Link issues to workflow nodes using linkedIssueKeys for automatic status tracking.

## Correction Protocol
- If the human corrects a StoryFlow update, acknowledge and fix immediately.
- Log the correction as a learning in the session summary.
`

export function addProject(project) {
  const now = new Date().toISOString()
  const id = project.id || crypto.randomUUID()
  const newProject = { ...project, id, createdAt: now, updatedAt: now }

  // Auto-scaffold wiki pages (#44, #45)
  if (!newProject.pages) newProject.pages = []
  newProject.pages.push({
    id: crypto.randomUUID(),
    title: 'Dependencies & Tech Stack',
    content: DEPENDENCIES_TEMPLATE,
    parentId: null,
    createdAt: now,
    updatedAt: now,
    createdBy: 'system',
  })
  newProject.pages.push({
    id: crypto.randomUUID(),
    title: 'Agent: Workflow Rules',
    content: WORKFLOW_RULES_TEMPLATE,
    parentId: null,
    createdAt: now,
    updatedAt: now,
    createdBy: 'system',
  })

  upsertProject(id, newProject)
  return newProject
}

// ---------------------------------------------------------------------------
// Agent session memory
// ---------------------------------------------------------------------------

export function saveSessionSummary(projectId, session) {
  const now = new Date().toISOString()
  const id = session.id || crypto.randomUUID()
  db.run(
    `INSERT OR REPLACE INTO agent_sessions
      (id, project_id, started_at, ended_at, summary, work_done,
       issues_created, issues_updated, events_recorded,
       key_decisions, learnings, wiki_pages_updated, next_steps, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      projectId,
      session.started_at || now,
      session.ended_at || now,
      session.summary || '',
      session.work_done || '',
      session.issues_created || 0,
      session.issues_updated || 0,
      session.events_recorded || 0,
      session.key_decisions || '',
      session.learnings || '',
      session.wiki_pages_updated || '',
      session.next_steps || '',
      now,
    ]
  )
  scheduleSave()
  return { id, projectId, ...session, created_at: now }
}

export function getLastSession(projectId) {
  const results = db.exec(
    'SELECT * FROM agent_sessions WHERE project_id = ? ORDER BY created_at DESC LIMIT 1',
    [projectId]
  )
  if (results.length === 0 || results[0].values.length === 0) return null
  const cols = results[0].columns
  const row = results[0].values[0]
  const session = {}
  for (let i = 0; i < cols.length; i++) session[cols[i]] = row[i]
  return session
}

export function listSessions(projectId, limit = 10) {
  const results = db.exec(
    'SELECT * FROM agent_sessions WHERE project_id = ? ORDER BY created_at DESC LIMIT ?',
    [projectId, limit]
  )
  if (results.length === 0) return []
  const cols = results[0].columns
  return results[0].values.map((row) => {
    const session = {}
    for (let i = 0; i < cols.length; i++) session[cols[i]] = row[i]
    return session
  })
}
