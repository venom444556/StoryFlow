// ---------------------------------------------------------------------------
// SQLite database layer for StoryFlow (using sql.js — pure JS, no native deps)
// Stores data in data/storyflow.db with WAL-style manual persistence
// ---------------------------------------------------------------------------

import initSqlJs from 'sql.js'
import { readFileSync, existsSync, mkdirSync, renameSync } from 'node:fs'
import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'

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
function scheduleSave() {
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
  // Clear existing and re-insert all
  db.run('DELETE FROM projects')
  for (const p of projects) {
    upsertProject(p.id, p)
  }
  // upsertProject already schedules saves, but force one for the DELETE
  await saveToDisk()
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
  return issues
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
}

function normalizeStatus(status) {
  if (!status) return 'To Do'
  // Already canonical
  if (['To Do', 'In Progress', 'Done'].includes(status)) return status
  // Try case-insensitive alias lookup
  const normalized = STATUS_ALIASES[status.toLowerCase().trim()]
  return normalized || null // null = unknown status
}

export function addIssue(projectId, issue) {
  const project = getProject(projectId)
  if (!project) return null
  if (!project.board) project.board = { issues: [], sprints: [], nextIssueNumber: 1 }

  // Normalize status — reject unknown values
  if (issue.status) {
    const normalized = normalizeStatus(issue.status)
    if (!normalized)
      return { error: `Unknown status "${issue.status}". Valid: To Do, In Progress, Done` }
    issue.status = normalized
  }

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
  else if (newIssue.status === 'Done' && !newIssue.doneAt) newIssue.doneAt = now

  project.board.issues.push(newIssue)
  project.board.nextIssueNumber = nextNumber + 1
  project.updatedAt = now
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
      return { error: `Unknown status "${updates.status}". Valid: To Do, In Progress, Done` }
    updates.status = normalized
  }

  const now = new Date().toISOString()

  if (updates.status && updates.status !== issue.status) {
    if (updates.status === 'To Do' && !issue.todoAt) updates.todoAt = now
    else if (updates.status === 'In Progress' && !issue.inProgressAt) updates.inProgressAt = now
    else if (updates.status === 'Done' && !issue.doneAt) updates.doneAt = now
  }

  Object.assign(issue, updates, { updatedAt: now })
  project.updatedAt = now
  upsertProject(projectId, project)
  return issue
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
  const newSprint = { ...sprint, id: sprint.id || crypto.randomUUID(), createdAt: now }
  project.board.sprints.push(newSprint)
  project.updatedAt = now
  upsertProject(projectId, project)
  return newSprint
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

export function addPage(projectId, page) {
  const project = getProject(projectId)
  if (!project) return null
  if (!project.pages) project.pages = []

  const now = new Date().toISOString()
  const newPage = {
    ...page,
    id: page.id || crypto.randomUUID(),
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

  const byStatus = { 'To Do': 0, 'In Progress': 0, Done: 0 }
  const byType = {}
  let totalPoints = 0
  let donePoints = 0

  for (const issue of issues) {
    byStatus[issue.status] = (byStatus[issue.status] || 0) + 1
    byType[issue.type] = (byType[issue.type] || 0) + 1
    if (issue.storyPoints) {
      totalPoints += issue.storyPoints
      if (issue.status === 'Done') donePoints += issue.storyPoints
    }
  }

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
  }
}

// ---------------------------------------------------------------------------
// Add project (convenience — creates from partial data)
// ---------------------------------------------------------------------------

export function addProject(project) {
  const now = new Date().toISOString()
  const id = project.id || crypto.randomUUID()
  const newProject = { ...project, id, createdAt: now, updatedAt: now }
  upsertProject(id, newProject)
  return newProject
}
