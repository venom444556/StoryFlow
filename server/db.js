// ---------------------------------------------------------------------------
// SQLite database layer for StoryFlow (using sql.js — pure JS, no native deps)
// Stores data in data/storyflow.db — normalized tables for all entities
// ---------------------------------------------------------------------------

import initSqlJs from 'sql.js'
import { readFileSync, existsSync, mkdirSync } from 'node:fs'
import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { initEvents } from './events.js'
import { initSteering } from './intelligence.js'

const DATA_DIR = join(process.cwd(), 'data')
const DB_PATH = join(DATA_DIR, 'storyflow.db')

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
      next_issue_number INTEGER DEFAULT 1
    )
  `)

  db.run('CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status)')
  db.run('CREATE INDEX IF NOT EXISTS idx_projects_deleted ON projects(deleted_at)')
  db.run('CREATE INDEX IF NOT EXISTS idx_projects_updated ON projects(updated_at DESC)')

  // NOTE: blob migration runs AFTER all normalized tables are created (below)

  // Drop legacy migration_state table (no longer needed)
  db.run('DROP TABLE IF EXISTS migration_state')

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

  // Add per-entity snapshot columns (idempotent via try/catch)
  const snapshotEntityColumns = [
    'project_data',
    'issues_data',
    'sprints_data',
    'pages_data',
    'decisions_data',
    'phases_data',
    'milestones_data',
    'workflow_nodes_data',
    'workflow_connections_data',
    'arch_components_data',
    'arch_connections_data',
  ]
  for (const col of snapshotEntityColumns) {
    try {
      db.run(`ALTER TABLE snapshots ADD COLUMN ${col} TEXT`)
    } catch (_) {
      // Column already exists — safe to ignore
    }
  }

  // Add next_issue_number to projects if missing
  try {
    db.run('ALTER TABLE projects ADD COLUMN next_issue_number INTEGER DEFAULT 1')
  } catch (_) {
    // Column already exists — safe to ignore
  }

  // Sprints (must come before issues due to FK dependency)
  db.run(`
    CREATE TABLE IF NOT EXISTS sprints (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      goal TEXT,
      start_date TEXT,
      end_date TEXT,
      status TEXT DEFAULT 'planning',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `)
  db.run('CREATE INDEX IF NOT EXISTS idx_sprints_project ON sprints(project_id)')

  // Issues
  db.run(`
    CREATE TABLE IF NOT EXISTS issues (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      key TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      type TEXT DEFAULT 'task',
      status TEXT DEFAULT 'To Do',
      priority TEXT DEFAULT 'medium',
      story_points INTEGER,
      assignee TEXT,
      epic_id TEXT REFERENCES issues(id) ON DELETE SET NULL,
      sprint_id TEXT REFERENCES sprints(id) ON DELETE SET NULL,
      labels TEXT,
      linked_issue_keys TEXT,
      created_by TEXT,
      created_by_reasoning TEXT,
      created_by_confidence REAL,
      todo_at TEXT,
      in_progress_at TEXT,
      blocked_at TEXT,
      done_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE(project_id, key)
    )
  `)
  db.run('CREATE INDEX IF NOT EXISTS idx_issues_project ON issues(project_id)')
  db.run('CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(project_id, status)')
  db.run('CREATE INDEX IF NOT EXISTS idx_issues_epic ON issues(epic_id)')
  db.run('CREATE INDEX IF NOT EXISTS idx_issues_sprint ON issues(sprint_id)')

  // Comments
  db.run(`
    CREATE TABLE IF NOT EXISTS comments (
      id TEXT PRIMARY KEY,
      issue_id TEXT NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
      project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      body TEXT NOT NULL,
      author TEXT,
      created_at TEXT NOT NULL
    )
  `)
  db.run('CREATE INDEX IF NOT EXISTS idx_comments_issue ON comments(issue_id)')

  // Pages (wiki)
  db.run(`
    CREATE TABLE IF NOT EXISTS pages (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      content TEXT,
      parent_id TEXT REFERENCES pages(id) ON DELETE SET NULL,
      status TEXT,
      created_by TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `)
  db.run('CREATE INDEX IF NOT EXISTS idx_pages_project ON pages(project_id)')

  // Decisions
  db.run(`
    CREATE TABLE IF NOT EXISTS decisions (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT,
      rationale TEXT,
      status TEXT DEFAULT 'proposed',
      author TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `)
  db.run('CREATE INDEX IF NOT EXISTS idx_decisions_project ON decisions(project_id)')

  // Phases
  db.run(`
    CREATE TABLE IF NOT EXISTS phases (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'pending',
      progress REAL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `)
  db.run('CREATE INDEX IF NOT EXISTS idx_phases_project ON phases(project_id)')

  // Milestones
  db.run(`
    CREATE TABLE IF NOT EXISTS milestones (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      description TEXT,
      due_date TEXT,
      completed INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `)
  db.run('CREATE INDEX IF NOT EXISTS idx_milestones_project ON milestones(project_id)')

  // Workflow nodes
  db.run(`
    CREATE TABLE IF NOT EXISTS workflow_nodes (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      parent_node_id TEXT REFERENCES workflow_nodes(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT,
      type TEXT,
      status TEXT DEFAULT 'pending',
      linked_issue_keys TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `)
  db.run('CREATE INDEX IF NOT EXISTS idx_workflow_nodes_project ON workflow_nodes(project_id)')
  db.run('CREATE INDEX IF NOT EXISTS idx_workflow_nodes_parent ON workflow_nodes(parent_node_id)')

  // Workflow connections
  db.run(`
    CREATE TABLE IF NOT EXISTS workflow_connections (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      from_node_id TEXT NOT NULL REFERENCES workflow_nodes(id) ON DELETE CASCADE,
      to_node_id TEXT NOT NULL REFERENCES workflow_nodes(id) ON DELETE CASCADE,
      type TEXT
    )
  `)
  db.run(
    'CREATE INDEX IF NOT EXISTS idx_workflow_connections_project ON workflow_connections(project_id)'
  )

  // Architecture components
  db.run(`
    CREATE TABLE IF NOT EXISTS architecture_components (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      description TEXT,
      type TEXT,
      tech TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `)
  db.run(
    'CREATE INDEX IF NOT EXISTS idx_arch_components_project ON architecture_components(project_id)'
  )

  // Architecture connections
  db.run(`
    CREATE TABLE IF NOT EXISTS architecture_connections (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      from_component_id TEXT NOT NULL REFERENCES architecture_components(id) ON DELETE CASCADE,
      to_component_id TEXT NOT NULL REFERENCES architecture_components(id) ON DELETE CASCADE,
      type TEXT
    )
  `)
  db.run(
    'CREATE INDEX IF NOT EXISTS idx_arch_connections_project ON architecture_connections(project_id)'
  )

  // Drop legacy migration_state table (no longer needed)
  try {
    db.run('DROP TABLE IF EXISTS migration_state')
  } catch (_) {
    // Safe to ignore
  }

  // Auto-migrate: if upgrading from pre-normalized (blob) schema, unpack blob data
  // into normalized tables before dropping the legacy columns.
  _migrateBlobsIfNeeded()

  // Initialize event stream table
  initEvents(db)

  // Initialize steering directives table
  initSteering(db)

  await saveToDisk()
}

// ---------------------------------------------------------------------------
// Auto-migration: blob to normalized tables (for upgrades from pre-v3 schema)
// Runs once on startup if the legacy `data` column exists with non-empty blobs.
// After migration, drops the legacy columns (data, issue_count, sprint_count).
// ---------------------------------------------------------------------------

function _migrateBlobsIfNeeded() {
  // Check if the legacy `data` column exists on the projects table
  let hasDataColumn = false
  try {
    const pragma = db.exec('PRAGMA table_info(projects)')
    if (pragma.length > 0) {
      hasDataColumn = pragma[0].values.some((row) => row[1] === 'data')
    }
  } catch (_) {
    return
  }

  if (!hasDataColumn) return

  // Read all project blobs
  let rows
  try {
    rows = db.exec("SELECT id, data FROM projects WHERE data IS NOT NULL AND data != ''")
  } catch (_) {
    return
  }

  if (rows.length === 0 || rows[0].values.length === 0) {
    _dropLegacyColumns()
    return
  }

  console.log(
    `[DB] Migrating ${rows[0].values.length} project(s) from blob to normalized tables...`
  )

  for (const [projectId, blobJson] of rows[0].values) {
    let project
    try {
      project = JSON.parse(blobJson)
    } catch (_) {
      console.warn(`[DB] Skipping project ${projectId} — invalid JSON blob`)
      continue
    }
    _backfillProjectFromBlob(projectId, project)
  }

  console.log('[DB] Blob migration complete')
  _dropLegacyColumns()
}

function _backfillProjectFromBlob(projectId, project) {
  const now = new Date().toISOString()
  // sql.js rejects undefined — coerce all bind values to null
  const n = (v) => (v === undefined ? null : v)
  // Wrap db.run to sanitize all params
  const safeRun = (sql, params) => db.run(sql, params.map(n))

  try {
    safeRun('UPDATE projects SET next_issue_number = ? WHERE id = ?', [
      project.board?.nextIssueNumber || 1,
      projectId,
    ])
  } catch (_) {
    /* column may not exist yet */
  }

  for (const s of project.board?.sprints || []) {
    safeRun(
      `INSERT OR IGNORE INTO sprints
        (id, project_id, name, goal, start_date, end_date, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        s.id,
        projectId,
        s.name || '',
        n(s.goal),
        n(s.startDate),
        n(s.endDate),
        s.status || 'planning',
        s.createdAt || now,
        s.updatedAt || s.createdAt || now,
      ]
    )
  }

  for (const i of project.board?.issues || []) {
    safeRun(
      `INSERT OR IGNORE INTO issues
        (id, project_id, key, title, description, type, status, priority,
         story_points, assignee, epic_id, sprint_id,
         labels, linked_issue_keys,
         created_by, created_by_reasoning, created_by_confidence,
         todo_at, in_progress_at, blocked_at, done_at,
         created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        i.id,
        projectId,
        i.key || '',
        i.title || '',
        n(i.description),
        i.type || 'task',
        i.status || 'To Do',
        i.priority || 'medium',
        n(i.storyPoints),
        n(i.assignee),
        n(i.epicId),
        n(i.sprintId),
        i.labels ? JSON.stringify(i.labels) : null,
        i.linkedIssueKeys ? JSON.stringify(i.linkedIssueKeys) : null,
        n(i.createdBy),
        n(i.createdByReasoning),
        n(i.createdByConfidence),
        n(i.todoAt),
        n(i.inProgressAt),
        n(i.blockedAt),
        n(i.doneAt),
        i.createdAt || now,
        i.updatedAt || i.createdAt || now,
      ]
    )
    for (const c of i.comments || []) {
      safeRun(
        `INSERT OR IGNORE INTO comments (id, issue_id, project_id, body, author, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [c.id, i.id, projectId, c.body || '', n(c.author), c.createdAt || now]
      )
    }
  }

  for (const p of project.pages || []) {
    safeRun(
      `INSERT OR IGNORE INTO pages
        (id, project_id, title, content, parent_id, status, created_by, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        p.id,
        projectId,
        p.title || '',
        n(p.content),
        n(p.parentId),
        n(p.status),
        n(p.createdBy),
        p.createdAt || now,
        p.updatedAt || p.createdAt || now,
      ]
    )
  }

  for (const d of project.decisions || []) {
    safeRun(
      `INSERT OR IGNORE INTO decisions
        (id, project_id, title, description, rationale, status, author, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        d.id,
        projectId,
        d.title || '',
        n(d.description),
        n(d.rationale),
        d.status || 'proposed',
        n(d.author),
        d.createdAt || now,
        d.updatedAt || d.createdAt || now,
      ]
    )
  }

  for (const p of project.timeline?.phases || []) {
    safeRun(
      `INSERT OR IGNORE INTO phases
        (id, project_id, name, description, status, progress, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        p.id,
        projectId,
        p.name || '',
        n(p.description),
        p.status || 'pending',
        p.progress || 0,
        p.createdAt || now,
        p.updatedAt || p.createdAt || now,
      ]
    )
  }

  for (const m of project.timeline?.milestones || []) {
    safeRun(
      `INSERT OR IGNORE INTO milestones
        (id, project_id, name, description, due_date, completed, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        m.id,
        projectId,
        m.name || '',
        n(m.description),
        n(m.dueDate),
        m.completed ? 1 : 0,
        m.createdAt || now,
        m.updatedAt || m.createdAt || now,
      ]
    )
  }

  function insertNode(node, parentNodeId) {
    safeRun(
      `INSERT OR IGNORE INTO workflow_nodes
        (id, project_id, parent_node_id, title, description, type, status,
         linked_issue_keys, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        node.id,
        projectId,
        n(parentNodeId),
        node.title || '',
        n(node.description),
        n(node.type),
        node.status || 'pending',
        node.linkedIssueKeys ? JSON.stringify(node.linkedIssueKeys) : null,
        node.createdAt || now,
        node.updatedAt || node.createdAt || now,
      ]
    )
    for (const child of node.children?.nodes || []) {
      insertNode(child, node.id)
    }
  }
  for (const wn of project.workflow?.nodes || []) {
    insertNode(wn, null)
  }

  for (const c of project.workflow?.connections || []) {
    safeRun(
      `INSERT OR IGNORE INTO workflow_connections (id, project_id, from_node_id, to_node_id, type)
       VALUES (?, ?, ?, ?, ?)`,
      [c.id, projectId, n(c.from), n(c.to), n(c.type)]
    )
  }

  for (const comp of project.architecture?.components || []) {
    safeRun(
      `INSERT OR IGNORE INTO architecture_components
        (id, project_id, name, description, type, tech, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        comp.id,
        projectId,
        comp.name || '',
        n(comp.description),
        n(comp.type),
        n(comp.tech),
        comp.createdAt || now,
        comp.updatedAt || comp.createdAt || now,
      ]
    )
  }

  for (const c of project.architecture?.connections || []) {
    safeRun(
      `INSERT OR IGNORE INTO architecture_connections
        (id, project_id, from_component_id, to_component_id, type)
       VALUES (?, ?, ?, ?, ?)`,
      [c.id, projectId, n(c.from), n(c.to), n(c.type)]
    )
  }
}

function _dropLegacyColumns() {
  for (const col of ['data', 'issue_count', 'sprint_count']) {
    try {
      db.run(`ALTER TABLE projects DROP COLUMN ${col}`)
    } catch (_) {
      /* Column doesn't exist or can't be dropped */
    }
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
// SQL row mappers — convert snake_case SQL rows to camelCase API objects
// ---------------------------------------------------------------------------

function _sqlQuery(sql, params = []) {
  const stmt = db.prepare(sql)
  stmt.bind(params)
  const rows = []
  while (stmt.step()) rows.push(stmt.getAsObject())
  stmt.free()
  return rows
}

function _sqlQueryOne(sql, params = []) {
  const rows = _sqlQuery(sql, params)
  return rows.length > 0 ? rows[0] : null
}

function mapIssueRow(row) {
  return {
    id: row.id,
    key: row.key,
    title: row.title,
    description: row.description || '',
    type: row.type,
    status: row.status,
    priority: row.priority,
    storyPoints: row.story_points || null,
    assignee: row.assignee || null,
    epicId: row.epic_id || null,
    sprintId: row.sprint_id || null,
    labels: row.labels ? JSON.parse(row.labels) : [],
    linkedIssueKeys: row.linked_issue_keys ? JSON.parse(row.linked_issue_keys) : [],
    createdBy: row.created_by || null,
    createdByReasoning: row.created_by_reasoning || null,
    createdByConfidence: row.created_by_confidence || null,
    todoAt: row.todo_at || null,
    inProgressAt: row.in_progress_at || null,
    blockedAt: row.blocked_at || null,
    doneAt: row.done_at || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    comments: [], // populated separately
  }
}

function mapCommentRow(row) {
  return {
    id: row.id,
    author: row.author || null,
    body: row.body,
    createdAt: row.created_at,
  }
}

function mapSprintRow(row) {
  return {
    id: row.id,
    name: row.name,
    goal: row.goal || null,
    startDate: row.start_date || null,
    endDate: row.end_date || null,
    status: row.status || 'planning',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapPageRow(row) {
  return {
    id: row.id,
    title: row.title,
    content: row.content || '',
    parentId: row.parent_id || null,
    status: row.status || null,
    createdBy: row.created_by || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapDecisionRow(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description || '',
    rationale: row.rationale || '',
    status: row.status || 'proposed',
    author: row.author || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapPhaseRow(row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description || '',
    status: row.status || 'pending',
    progress: row.progress || 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapMilestoneRow(row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description || '',
    dueDate: row.due_date || null,
    completed: row.completed === 1 || row.completed === true,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapWorkflowNodeRow(row) {
  return {
    id: row.id,
    parentNodeId: row.parent_node_id || null,
    title: row.title,
    description: row.description || '',
    type: row.type || null,
    status: row.status || 'pending',
    linkedIssueKeys: row.linked_issue_keys ? JSON.parse(row.linked_issue_keys) : [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapWorkflowConnectionRow(row) {
  return {
    id: row.id,
    from: row.from_node_id,
    to: row.to_node_id,
    type: row.type || null,
  }
}

function mapArchComponentRow(row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description || '',
    type: row.type || null,
    tech: row.tech || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapArchConnectionRow(row) {
  return {
    id: row.id,
    from: row.from_component_id,
    to: row.to_component_id,
    type: row.type || null,
  }
}

// ---------------------------------------------------------------------------
// Internal raw SQL helpers — read from normalized tables
// Used by getProject reconstruction and by read functions
// ---------------------------------------------------------------------------

function _listCommentsForIssue(issueId) {
  const rows = _sqlQuery(
    'SELECT id, body, author, created_at FROM comments WHERE issue_id = ? ORDER BY created_at ASC',
    [issueId]
  )
  return rows.map(mapCommentRow)
}

function _listIssuesRaw(projectId) {
  const rows = _sqlQuery('SELECT * FROM issues WHERE project_id = ? ORDER BY created_at ASC', [
    projectId,
  ])
  const issues = rows.map(mapIssueRow)
  // Populate comments for each issue
  for (const issue of issues) {
    issue.comments = _listCommentsForIssue(issue.id)
  }
  return issues
}

function _listSprintsRaw(projectId) {
  const rows = _sqlQuery('SELECT * FROM sprints WHERE project_id = ? ORDER BY created_at ASC', [
    projectId,
  ])
  return rows.map(mapSprintRow)
}

function _listPagesRaw(projectId) {
  const rows = _sqlQuery('SELECT * FROM pages WHERE project_id = ? ORDER BY created_at ASC', [
    projectId,
  ])
  return rows.map(mapPageRow)
}

function _listDecisionsRaw(projectId) {
  const rows = _sqlQuery('SELECT * FROM decisions WHERE project_id = ? ORDER BY created_at ASC', [
    projectId,
  ])
  return rows.map(mapDecisionRow)
}

function _listPhasesRaw(projectId) {
  const rows = _sqlQuery('SELECT * FROM phases WHERE project_id = ? ORDER BY created_at ASC', [
    projectId,
  ])
  return rows.map(mapPhaseRow)
}

function _listMilestonesRaw(projectId) {
  const rows = _sqlQuery('SELECT * FROM milestones WHERE project_id = ? ORDER BY created_at ASC', [
    projectId,
  ])
  return rows.map(mapMilestoneRow)
}

function _buildWorkflowTree(projectId) {
  const rows = _sqlQuery(
    'SELECT * FROM workflow_nodes WHERE project_id = ? ORDER BY created_at ASC',
    [projectId]
  )
  const allNodes = rows.map(mapWorkflowNodeRow)

  // Group children by parent_node_id
  const childrenMap = new Map()
  const topLevel = []
  for (const node of allNodes) {
    if (node.parentNodeId) {
      if (!childrenMap.has(node.parentNodeId)) childrenMap.set(node.parentNodeId, [])
      childrenMap.get(node.parentNodeId).push(node)
    } else {
      topLevel.push(node)
    }
  }

  // Recursively attach children
  function attachChildren(node) {
    const kids = childrenMap.get(node.id) || []
    if (kids.length > 0) {
      node.children = { nodes: kids.map(attachChildren) }
    }
    delete node.parentNodeId
    return node
  }

  return topLevel.map(attachChildren)
}

function _listWorkflowConnectionsRaw(projectId) {
  const rows = _sqlQuery('SELECT * FROM workflow_connections WHERE project_id = ?', [projectId])
  return rows.map(mapWorkflowConnectionRow)
}

function _listArchComponentsRaw(projectId) {
  const rows = _sqlQuery(
    'SELECT * FROM architecture_components WHERE project_id = ? ORDER BY created_at ASC',
    [projectId]
  )
  return rows.map(mapArchComponentRow)
}

function _listArchConnectionsRaw(projectId) {
  const rows = _sqlQuery('SELECT * FROM architecture_connections WHERE project_id = ?', [projectId])
  return rows.map(mapArchConnectionRow)
}

/** Check if a project exists (not soft-deleted) */
function _projectExists(projectId) {
  const row = _sqlQueryOne('SELECT id FROM projects WHERE id = ? AND deleted_at IS NULL', [
    projectId,
  ])
  return !!row
}

// ---------------------------------------------------------------------------
// Project CRUD
// ---------------------------------------------------------------------------

function countProjects() {
  const result = db.exec('SELECT COUNT(*) FROM projects')
  return result.length > 0 ? result[0].values[0][0] : 0
}

/** List all active projects (summary — computed counts from SQL) */
export function listProjects() {
  const rows = _sqlQuery(`
    SELECT p.id, p.name, p.description, p.status, p.updated_at, p.created_at,
           (SELECT COUNT(*) FROM issues WHERE project_id = p.id) as issue_count,
           (SELECT COUNT(*) FROM sprints WHERE project_id = p.id) as sprint_count
    FROM projects p
    WHERE p.deleted_at IS NULL
    ORDER BY p.updated_at DESC
  `)

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description || '',
    status: row.status,
    updatedAt: row.updated_at,
    createdAt: row.created_at,
    issueCount: row.issue_count || 0,
    sprintCount: row.sprint_count || 0,
  }))
}

/** Get a single project by ID (reconstructs full shape from SQL tables) */
export function getProject(id) {
  const row = _sqlQueryOne(
    'SELECT id, name, description, status, created_at, updated_at, deleted_at, is_seed, seed_version, next_issue_number FROM projects WHERE id = ? AND deleted_at IS NULL',
    [id]
  )
  if (!row) return null

  const project = {
    id: row.id,
    name: row.name,
    description: row.description || '',
    status: row.status || 'planning',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at || null,
    isSeed: row.is_seed === 1,
    seedVersion: row.seed_version || null,
  }

  // Board: issues + sprints + nextIssueNumber
  const issues = _listIssuesRaw(id)
  const sprints = _listSprintsRaw(id)
  project.board = {
    issues,
    sprints,
    nextIssueNumber: row.next_issue_number || 1,
  }

  // Pages
  project.pages = _listPagesRaw(id)

  // Decisions
  project.decisions = _listDecisionsRaw(id)

  // Timeline
  project.timeline = {
    phases: _listPhasesRaw(id),
    milestones: _listMilestonesRaw(id),
  }

  // Workflow
  project.workflow = {
    nodes: _buildWorkflowTree(id),
    connections: _listWorkflowConnectionsRaw(id),
  }

  // Architecture
  project.architecture = {
    components: _listArchComponentsRaw(id),
    connections: _listArchConnectionsRaw(id),
  }

  return project
}

/** Update a project (top-level fields only) */
export function updateProject(id, updates) {
  if (!_projectExists(id)) return null
  const now = new Date().toISOString()

  // Build dynamic SET clause for allowed fields
  const allowedFields = {
    name: 'name',
    description: 'description',
    status: 'status',
  }
  const setClauses = ['updated_at = ?']
  const params = [now]

  for (const [camel, col] of Object.entries(allowedFields)) {
    if (updates[camel] !== undefined) {
      setClauses.push(`${col} = ?`)
      params.push(updates[camel])
    }
  }

  params.push(id)
  db.run(`UPDATE projects SET ${setClauses.join(', ')} WHERE id = ?`, params)
  scheduleSave()

  return getProject(id)
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

// ---------------------------------------------------------------------------
// Issue operations
// ---------------------------------------------------------------------------

export function listIssues(projectId, filters = {}) {
  if (!_projectExists(projectId)) return null

  // Build dynamic WHERE clause
  const conditions = ['project_id = ?']
  const params = [projectId]

  if (filters.status) {
    conditions.push('status = ?')
    params.push(filters.status)
  }
  if (filters.type) {
    conditions.push('type = ?')
    params.push(filters.type)
  }
  if (filters.epicId) {
    conditions.push('epic_id = ?')
    params.push(filters.epicId)
  }
  if (filters.sprintId) {
    conditions.push('sprint_id = ?')
    params.push(filters.sprintId)
  }
  if (filters.assignee) {
    conditions.push('assignee = ?')
    params.push(filters.assignee)
  }
  if (filters.search) {
    conditions.push('(LOWER(title) LIKE ? OR LOWER(key) LIKE ? OR LOWER(description) LIKE ?)')
    const q = '%' + filters.search.toLowerCase() + '%'
    params.push(q, q, q)
  }

  const where = conditions.join(' AND ')

  // Get total count
  const countRow = _sqlQueryOne(`SELECT COUNT(*) as cnt FROM issues WHERE ${where}`, params)
  const total = countRow ? countRow.cnt : 0

  // Pagination
  const page = Math.max(1, parseInt(filters.page, 10) || 1)
  const limit = Math.min(500, Math.max(1, parseInt(filters.limit, 10) || 50))
  const offset = (page - 1) * limit

  const rows = _sqlQuery(
    `SELECT * FROM issues WHERE ${where} ORDER BY created_at ASC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  )

  let issues
  if (filters.fields === 'summary') {
    issues = rows.map((r) => ({
      id: r.id,
      key: r.key,
      title: r.title,
      status: r.status,
      type: r.type,
    }))
  } else {
    issues = rows.map(mapIssueRow)
    // Populate comments for each issue
    for (const issue of issues) {
      issue.comments = _listCommentsForIssue(issue.id)
    }
  }

  return { issues, total, page, limit, hasMore: offset + limit < total }
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
 * planning -> in-progress: any issue is "In Progress"
 * in-progress -> completed: all issues are "Done" (with >=1 issue)
 * Never advances from on-hold or completed (manual overrides).
 */
function maybeAdvanceProjectPhase(projectId) {
  const projRow = _sqlQueryOne('SELECT status FROM projects WHERE id = ?', [projectId])
  if (!projRow) return
  const current = projRow.status || 'planning'

  const countRow = _sqlQueryOne('SELECT COUNT(*) as cnt FROM issues WHERE project_id = ?', [
    projectId,
  ])
  if (!countRow || countRow.cnt === 0) return

  if (current === 'planning') {
    const inProgress = _sqlQueryOne(
      "SELECT COUNT(*) as cnt FROM issues WHERE project_id = ? AND status = 'In Progress'",
      [projectId]
    )
    if (inProgress && inProgress.cnt > 0) {
      db.run("UPDATE projects SET status = 'in-progress' WHERE id = ?", [projectId])
    }
  } else if (current === 'in-progress') {
    const notDone = _sqlQueryOne(
      "SELECT COUNT(*) as cnt FROM issues WHERE project_id = ? AND status != 'Done'",
      [projectId]
    )
    if (notDone && notDone.cnt === 0) {
      db.run("UPDATE projects SET status = 'completed' WHERE id = ?", [projectId])
    }
  }
}

export function addIssue(projectId, issue) {
  if (!_projectExists(projectId)) return null

  // Normalize status — reject unknown values, default to 'To Do'
  const normalized = normalizeStatus(issue.status)
  if (!normalized)
    return { error: `Unknown status "${issue.status}". Valid: To Do, In Progress, Blocked, Done` }
  issue.status = normalized

  // Get project name for key prefix and next issue number
  const projRow = _sqlQueryOne('SELECT name, next_issue_number FROM projects WHERE id = ?', [
    projectId,
  ])
  const nextNumber = projRow.next_issue_number || 1
  const prefix =
    projRow.name
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

  db.run(
    `INSERT OR REPLACE INTO issues
      (id, project_id, key, title, description, type, status, priority,
       story_points, assignee, epic_id, sprint_id,
       labels, linked_issue_keys,
       created_by, created_by_reasoning, created_by_confidence,
       todo_at, in_progress_at, blocked_at, done_at,
       created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      newIssue.id,
      projectId,
      newIssue.key,
      newIssue.title || '',
      newIssue.description || null,
      newIssue.type || 'task',
      newIssue.status || 'To Do',
      newIssue.priority || 'medium',
      newIssue.storyPoints || null,
      newIssue.assignee || null,
      newIssue.epicId || null,
      newIssue.sprintId || null,
      newIssue.labels ? JSON.stringify(newIssue.labels) : null,
      newIssue.linkedIssueKeys ? JSON.stringify(newIssue.linkedIssueKeys) : null,
      newIssue.createdBy || null,
      newIssue.createdByReasoning || null,
      newIssue.createdByConfidence || null,
      newIssue.todoAt || null,
      newIssue.inProgressAt || null,
      newIssue.blockedAt || null,
      newIssue.doneAt || null,
      newIssue.createdAt,
      newIssue.updatedAt,
    ]
  )
  db.run('UPDATE projects SET next_issue_number = ?, updated_at = ? WHERE id = ?', [
    nextNumber + 1,
    now,
    projectId,
  ])

  maybeAdvanceProjectPhase(projectId)
  scheduleSave()
  return newIssue
}

export function updateIssue(projectId, issueId, updates) {
  const row = _sqlQueryOne('SELECT * FROM issues WHERE id = ? AND project_id = ?', [
    issueId,
    projectId,
  ])
  if (!row) return null
  const issue = mapIssueRow(row)

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

  // Merge updates into issue
  const merged = { ...issue, ...updates, updatedAt: now }

  db.run(
    `INSERT OR REPLACE INTO issues
      (id, project_id, key, title, description, type, status, priority,
       story_points, assignee, epic_id, sprint_id,
       labels, linked_issue_keys,
       created_by, created_by_reasoning, created_by_confidence,
       todo_at, in_progress_at, blocked_at, done_at,
       created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      merged.id,
      projectId,
      merged.key,
      merged.title || '',
      merged.description || null,
      merged.type || 'task',
      merged.status || 'To Do',
      merged.priority || 'medium',
      merged.storyPoints || null,
      merged.assignee || null,
      merged.epicId || null,
      merged.sprintId || null,
      merged.labels ? JSON.stringify(merged.labels) : null,
      merged.linkedIssueKeys ? JSON.stringify(merged.linkedIssueKeys) : null,
      merged.createdBy || null,
      merged.createdByReasoning || null,
      merged.createdByConfidence || null,
      merged.todoAt || null,
      merged.inProgressAt || null,
      merged.blockedAt || null,
      merged.doneAt || null,
      merged.createdAt || now,
      merged.updatedAt,
    ]
  )

  db.run('UPDATE projects SET updated_at = ? WHERE id = ?', [now, projectId])
  maybeAdvanceProjectPhase(projectId)
  scheduleSave()
  return merged
}

export function getIssueByKey(projectId, key) {
  const row = _sqlQueryOne('SELECT * FROM issues WHERE project_id = ? AND LOWER(key) = LOWER(?)', [
    projectId,
    key,
  ])
  if (!row) return null
  const issue = mapIssueRow(row)
  issue.comments = _listCommentsForIssue(issue.id)
  return issue
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
  const issueRow = _sqlQueryOne('SELECT id FROM issues WHERE id = ? AND project_id = ?', [
    issueId,
    projectId,
  ])
  if (!issueRow) return null

  const now = new Date().toISOString()
  const newComment = {
    id: crypto.randomUUID(),
    author: comment.author || 'agent',
    body: comment.body,
    createdAt: now,
  }

  db.run(
    `INSERT OR REPLACE INTO comments (id, issue_id, project_id, body, author, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      newComment.id,
      issueId,
      projectId,
      newComment.body || '',
      newComment.author || null,
      newComment.createdAt,
    ]
  )
  db.run('UPDATE issues SET updated_at = ? WHERE id = ?', [now, issueId])
  db.run('UPDATE projects SET updated_at = ? WHERE id = ?', [now, projectId])
  scheduleSave()
  return newComment
}

export function addCommentByKey(projectId, key, comment) {
  const issue = getIssueByKey(projectId, key)
  if (!issue) return null
  return addComment(projectId, issue.id, comment)
}

export function deleteIssue(projectId, issueId) {
  const row = _sqlQueryOne('SELECT id FROM issues WHERE id = ? AND project_id = ?', [
    issueId,
    projectId,
  ])
  if (!row) return false

  db.run('DELETE FROM comments WHERE issue_id = ? AND project_id = ?', [issueId, projectId])
  db.run('DELETE FROM issues WHERE id = ? AND project_id = ?', [issueId, projectId])
  db.run('UPDATE projects SET updated_at = ? WHERE id = ?', [new Date().toISOString(), projectId])
  scheduleSave()
  return true
}

// ---------------------------------------------------------------------------
// Sprint operations
// ---------------------------------------------------------------------------

export function listSprints(projectId) {
  if (!_projectExists(projectId)) return null
  return _listSprintsRaw(projectId)
}

export function addSprint(projectId, sprint) {
  if (!_projectExists(projectId)) return null

  const now = new Date().toISOString()
  const newSprint = {
    ...sprint,
    id: sprint.id || crypto.randomUUID(),
    status: sprint.status || 'planning',
    createdAt: now,
    updatedAt: now,
  }

  db.run(
    `INSERT OR REPLACE INTO sprints
      (id, project_id, name, goal, start_date, end_date, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      newSprint.id,
      projectId,
      newSprint.name || '',
      newSprint.goal || null,
      newSprint.startDate || null,
      newSprint.endDate || null,
      newSprint.status || 'planning',
      newSprint.createdAt,
      newSprint.updatedAt,
    ]
  )
  db.run('UPDATE projects SET updated_at = ? WHERE id = ?', [now, projectId])
  scheduleSave()
  return newSprint
}

export function updateSprint(projectId, sprintId, updates) {
  const row = _sqlQueryOne('SELECT * FROM sprints WHERE id = ? AND project_id = ?', [
    sprintId,
    projectId,
  ])
  if (!row) return null
  const sprint = mapSprintRow(row)

  const now = new Date().toISOString()
  const merged = { ...sprint, ...updates, updatedAt: now }

  db.run(
    `INSERT OR REPLACE INTO sprints
      (id, project_id, name, goal, start_date, end_date, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      merged.id,
      projectId,
      merged.name || '',
      merged.goal || null,
      merged.startDate || null,
      merged.endDate || null,
      merged.status || 'planning',
      merged.createdAt || now,
      merged.updatedAt,
    ]
  )
  db.run('UPDATE projects SET updated_at = ? WHERE id = ?', [now, projectId])
  scheduleSave()
  return merged
}

export function deleteSprint(projectId, sprintId) {
  const row = _sqlQueryOne('SELECT id FROM sprints WHERE id = ? AND project_id = ?', [
    sprintId,
    projectId,
  ])
  if (!row) return false

  db.run('UPDATE issues SET sprint_id = NULL WHERE sprint_id = ? AND project_id = ?', [
    sprintId,
    projectId,
  ])
  db.run('DELETE FROM sprints WHERE id = ? AND project_id = ?', [sprintId, projectId])
  db.run('UPDATE projects SET updated_at = ? WHERE id = ?', [new Date().toISOString(), projectId])
  scheduleSave()
  return true
}

// ---------------------------------------------------------------------------
// Page operations
// ---------------------------------------------------------------------------

export function listPages(projectId) {
  if (!_projectExists(projectId)) return null
  const rows = _sqlQuery(
    'SELECT id, title, parent_id, updated_at, created_by, status FROM pages WHERE project_id = ? ORDER BY created_at ASC',
    [projectId]
  )
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    parentId: r.parent_id || null,
    updatedAt: r.updated_at,
  }))
}

export function getPage(projectId, pageId) {
  const row = _sqlQueryOne('SELECT * FROM pages WHERE id = ? AND project_id = ?', [
    pageId,
    projectId,
  ])
  if (!row) return null
  return mapPageRow(row)
}

export function addPage(projectId, page) {
  if (!_projectExists(projectId)) return null

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

  db.run(
    `INSERT OR REPLACE INTO pages
      (id, project_id, title, content, parent_id, status, created_by, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      newPage.id,
      projectId,
      newPage.title || '',
      newPage.content || null,
      newPage.parentId || null,
      newPage.status || null,
      newPage.createdBy || null,
      newPage.createdAt,
      newPage.updatedAt,
    ]
  )
  db.run('UPDATE projects SET updated_at = ? WHERE id = ?', [now, projectId])
  scheduleSave()
  return newPage
}

export function updatePage(projectId, pageId, updates) {
  const row = _sqlQueryOne('SELECT * FROM pages WHERE id = ? AND project_id = ?', [
    pageId,
    projectId,
  ])
  if (!row) return null
  const page = mapPageRow(row)

  const now = new Date().toISOString()
  const merged = { ...page, ...updates, updatedAt: now }

  db.run(
    `INSERT OR REPLACE INTO pages
      (id, project_id, title, content, parent_id, status, created_by, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      merged.id,
      projectId,
      merged.title || '',
      merged.content || null,
      merged.parentId || null,
      merged.status || null,
      merged.createdBy || null,
      merged.createdAt || now,
      merged.updatedAt,
    ]
  )
  db.run('UPDATE projects SET updated_at = ? WHERE id = ?', [now, projectId])
  scheduleSave()
  return merged
}

export function deletePage(projectId, pageId) {
  const row = _sqlQueryOne('SELECT id FROM pages WHERE id = ? AND project_id = ?', [
    pageId,
    projectId,
  ])
  if (!row) return false

  db.run('DELETE FROM pages WHERE id = ? AND project_id = ?', [pageId, projectId])
  db.run('UPDATE projects SET updated_at = ? WHERE id = ?', [new Date().toISOString(), projectId])
  scheduleSave()
  return true
}

// ---------------------------------------------------------------------------
// Board summary
// ---------------------------------------------------------------------------

export function getBoardSummary(projectId) {
  const projRow = _sqlQueryOne(
    'SELECT id, name, status FROM projects WHERE id = ? AND deleted_at IS NULL',
    [projectId]
  )
  if (!projRow) return null

  // Aggregate status counts
  const statusRows = _sqlQuery(
    'SELECT status, COUNT(*) as cnt FROM issues WHERE project_id = ? GROUP BY status',
    [projectId]
  )
  const byStatus = { 'To Do': 0, 'In Progress': 0, Done: 0, Blocked: 0 }
  for (const r of statusRows) byStatus[r.status] = r.cnt

  // Aggregate type counts
  const typeRows = _sqlQuery(
    'SELECT type, COUNT(*) as cnt FROM issues WHERE project_id = ? GROUP BY type',
    [projectId]
  )
  const byType = {}
  for (const r of typeRows) byType[r.type] = r.cnt

  // Story points
  const pointsRow = _sqlQueryOne(
    `SELECT COALESCE(SUM(story_points), 0) as total,
            COALESCE(SUM(CASE WHEN status = 'Done' THEN story_points ELSE 0 END), 0) as done
     FROM issues WHERE project_id = ? AND story_points IS NOT NULL`,
    [projectId]
  )
  const totalPoints = pointsRow ? pointsRow.total : 0
  const donePoints = pointsRow ? pointsRow.done : 0

  // Issue count
  const countRow = _sqlQueryOne('SELECT COUNT(*) as cnt FROM issues WHERE project_id = ?', [
    projectId,
  ])
  const issueCount = countRow ? countRow.cnt : 0

  // Sprint count + active sprint
  const sprintCountRow = _sqlQueryOne('SELECT COUNT(*) as cnt FROM sprints WHERE project_id = ?', [
    projectId,
  ])
  const sprintCount = sprintCountRow ? sprintCountRow.cnt : 0
  const activeSprintRow = _sqlQueryOne(
    "SELECT * FROM sprints WHERE project_id = ? AND status = 'active' LIMIT 1",
    [projectId]
  )
  const activeSprint = activeSprintRow ? mapSprintRow(activeSprintRow) : null

  // Stale "In Progress" issues (>4 hours since last update)
  const STALE_THRESHOLD_MS = 4 * 60 * 60 * 1000
  const staleThreshold = new Date(Date.now() - STALE_THRESHOLD_MS).toISOString()
  const staleRows = _sqlQuery(
    `SELECT id, key, title, updated_at FROM issues
     WHERE project_id = ? AND status = 'In Progress' AND updated_at < ?`,
    [projectId, staleThreshold]
  )
  const staleIssues = staleRows.map((r) => ({
    id: r.id,
    key: r.key,
    title: r.title,
    updatedAt: r.updated_at,
  }))

  return {
    projectName: projRow.name,
    projectStatus: projRow.status,
    issueCount,
    byStatus,
    byType,
    totalPoints,
    donePoints,
    sprintCount,
    activeSprint,
    staleIssues,
    staleCount: staleIssues.length,
  }
}

// ---------------------------------------------------------------------------
// Decision operations
// ---------------------------------------------------------------------------

export function listDecisions(projectId) {
  if (!_projectExists(projectId)) return null
  return _listDecisionsRaw(projectId)
}

export function addDecision(projectId, decision) {
  if (!_projectExists(projectId)) return null

  const now = new Date().toISOString()
  const newDecision = {
    ...decision,
    id: decision.id || crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  }

  db.run(
    `INSERT OR REPLACE INTO decisions
      (id, project_id, title, description, rationale, status, author, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      newDecision.id,
      projectId,
      newDecision.title || '',
      newDecision.description || null,
      newDecision.rationale || null,
      newDecision.status || 'proposed',
      newDecision.author || null,
      newDecision.createdAt,
      newDecision.updatedAt,
    ]
  )
  db.run('UPDATE projects SET updated_at = ? WHERE id = ?', [now, projectId])
  scheduleSave()
  return newDecision
}

export function updateDecision(projectId, decisionId, updates) {
  const row = _sqlQueryOne('SELECT * FROM decisions WHERE id = ? AND project_id = ?', [
    decisionId,
    projectId,
  ])
  if (!row) return null
  const decision = mapDecisionRow(row)

  const now = new Date().toISOString()
  const merged = { ...decision, ...updates, updatedAt: now }

  db.run(
    `INSERT OR REPLACE INTO decisions
      (id, project_id, title, description, rationale, status, author, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      merged.id,
      projectId,
      merged.title || '',
      merged.description || null,
      merged.rationale || null,
      merged.status || 'proposed',
      merged.author || null,
      merged.createdAt || now,
      merged.updatedAt,
    ]
  )
  db.run('UPDATE projects SET updated_at = ? WHERE id = ?', [now, projectId])
  scheduleSave()
  return merged
}

export function deleteDecision(projectId, decisionId) {
  const row = _sqlQueryOne('SELECT id FROM decisions WHERE id = ? AND project_id = ?', [
    decisionId,
    projectId,
  ])
  if (!row) return false

  db.run('DELETE FROM decisions WHERE id = ? AND project_id = ?', [decisionId, projectId])
  db.run('UPDATE projects SET updated_at = ? WHERE id = ?', [new Date().toISOString(), projectId])
  scheduleSave()
  return true
}

// ---------------------------------------------------------------------------
// Timeline phase operations
// ---------------------------------------------------------------------------

export function listPhases(projectId) {
  if (!_projectExists(projectId)) return null
  return _listPhasesRaw(projectId)
}

export function addPhase(projectId, phase) {
  if (!_projectExists(projectId)) return null

  const now = new Date().toISOString()
  const newPhase = {
    ...phase,
    id: phase.id || crypto.randomUUID(),
    progress: phase.progress || 0,
    createdAt: now,
    updatedAt: now,
  }

  db.run(
    `INSERT OR REPLACE INTO phases
      (id, project_id, name, description, status, progress, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      newPhase.id,
      projectId,
      newPhase.name || '',
      newPhase.description || null,
      newPhase.status || 'pending',
      newPhase.progress || 0,
      newPhase.createdAt,
      newPhase.updatedAt,
    ]
  )
  db.run('UPDATE projects SET updated_at = ? WHERE id = ?', [now, projectId])
  scheduleSave()
  return newPhase
}

export function updatePhase(projectId, phaseId, updates) {
  const row = _sqlQueryOne('SELECT * FROM phases WHERE id = ? AND project_id = ?', [
    phaseId,
    projectId,
  ])
  if (!row) return null
  const phase = mapPhaseRow(row)

  const now = new Date().toISOString()
  const merged = { ...phase, ...updates, updatedAt: now }

  db.run(
    `INSERT OR REPLACE INTO phases
      (id, project_id, name, description, status, progress, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      merged.id,
      projectId,
      merged.name || '',
      merged.description || null,
      merged.status || 'pending',
      merged.progress || 0,
      merged.createdAt || now,
      merged.updatedAt,
    ]
  )
  db.run('UPDATE projects SET updated_at = ? WHERE id = ?', [now, projectId])
  scheduleSave()
  return merged
}

export function deletePhase(projectId, phaseId) {
  const row = _sqlQueryOne('SELECT id FROM phases WHERE id = ? AND project_id = ?', [
    phaseId,
    projectId,
  ])
  if (!row) return false

  db.run('DELETE FROM phases WHERE id = ? AND project_id = ?', [phaseId, projectId])
  db.run('UPDATE projects SET updated_at = ? WHERE id = ?', [new Date().toISOString(), projectId])
  scheduleSave()
  return true
}

// ---------------------------------------------------------------------------
// Timeline milestone operations
// ---------------------------------------------------------------------------

export function listMilestones(projectId) {
  if (!_projectExists(projectId)) return null
  return _listMilestonesRaw(projectId)
}

export function addMilestone(projectId, milestone) {
  if (!_projectExists(projectId)) return null

  const now = new Date().toISOString()
  const newMilestone = {
    ...milestone,
    id: milestone.id || crypto.randomUUID(),
    completed: milestone.completed || false,
    createdAt: now,
    updatedAt: now,
  }

  db.run(
    `INSERT OR REPLACE INTO milestones
      (id, project_id, name, description, due_date, completed, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      newMilestone.id,
      projectId,
      newMilestone.name || '',
      newMilestone.description || null,
      newMilestone.dueDate || null,
      newMilestone.completed ? 1 : 0,
      newMilestone.createdAt,
      newMilestone.updatedAt,
    ]
  )
  db.run('UPDATE projects SET updated_at = ? WHERE id = ?', [now, projectId])
  scheduleSave()
  return newMilestone
}

export function updateMilestone(projectId, milestoneId, updates) {
  const row = _sqlQueryOne('SELECT * FROM milestones WHERE id = ? AND project_id = ?', [
    milestoneId,
    projectId,
  ])
  if (!row) return null
  const milestone = mapMilestoneRow(row)

  const now = new Date().toISOString()
  const merged = { ...milestone, ...updates, updatedAt: now }

  db.run(
    `INSERT OR REPLACE INTO milestones
      (id, project_id, name, description, due_date, completed, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      merged.id,
      projectId,
      merged.name || '',
      merged.description || null,
      merged.dueDate || null,
      merged.completed ? 1 : 0,
      merged.createdAt || now,
      merged.updatedAt,
    ]
  )
  db.run('UPDATE projects SET updated_at = ? WHERE id = ?', [now, projectId])
  scheduleSave()
  return merged
}

export function deleteMilestone(projectId, milestoneId) {
  const row = _sqlQueryOne('SELECT id FROM milestones WHERE id = ? AND project_id = ?', [
    milestoneId,
    projectId,
  ])
  if (!row) return false

  db.run('DELETE FROM milestones WHERE id = ? AND project_id = ?', [milestoneId, projectId])
  db.run('UPDATE projects SET updated_at = ? WHERE id = ?', [new Date().toISOString(), projectId])
  scheduleSave()
  return true
}

// ---------------------------------------------------------------------------
// Workflow nodes
// ---------------------------------------------------------------------------

export function listWorkflowNodes(projectId) {
  if (!_projectExists(projectId)) return null
  return _buildWorkflowTree(projectId)
}

export function getWorkflowNode(projectId, nodeId) {
  const row = _sqlQueryOne('SELECT * FROM workflow_nodes WHERE id = ? AND project_id = ?', [
    nodeId,
    projectId,
  ])
  if (!row) return null
  const node = mapWorkflowNodeRow(row)
  // Attach children
  const childRows = _sqlQuery(
    'SELECT * FROM workflow_nodes WHERE parent_node_id = ? AND project_id = ? ORDER BY created_at ASC',
    [nodeId, projectId]
  )
  if (childRows.length > 0) {
    node.children = { nodes: childRows.map(mapWorkflowNodeRow) }
    // Remove parentNodeId from children
    for (const child of node.children.nodes) delete child.parentNodeId
  }
  delete node.parentNodeId
  return node
}

// Helper: write a single workflow node (and its children recursively) to the normalized table
function _writeWorkflowNode(projectId, node, parentNodeId) {
  const now = new Date().toISOString()
  db.run(
    `INSERT OR REPLACE INTO workflow_nodes
      (id, project_id, parent_node_id, title, description, type, status,
       linked_issue_keys, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      node.id,
      projectId,
      parentNodeId || null,
      node.title || '',
      node.description || null,
      node.type || null,
      node.status || 'pending',
      node.linkedIssueKeys ? JSON.stringify(node.linkedIssueKeys) : null,
      node.createdAt || now,
      node.updatedAt || now,
    ]
  )
  // Recurse into children
  const children = node.children?.nodes || []
  for (const child of children) {
    _writeWorkflowNode(projectId, child, node.id)
  }
}

export function addWorkflowNode(projectId, node) {
  if (!_projectExists(projectId)) return null

  const now = new Date().toISOString()
  const newNode = {
    ...node,
    id: node.id || crypto.randomUUID(),
    status: node.status || 'idle',
    createdAt: now,
    updatedAt: now,
  }

  _writeWorkflowNode(projectId, newNode, null)
  db.run('UPDATE projects SET updated_at = ? WHERE id = ?', [now, projectId])
  scheduleSave()
  return newNode
}

export function updateWorkflowNode(projectId, nodeId, updates) {
  const row = _sqlQueryOne('SELECT * FROM workflow_nodes WHERE id = ? AND project_id = ?', [
    nodeId,
    projectId,
  ])
  if (!row) return null
  const node = mapWorkflowNodeRow(row)

  // Attach children for validation
  const childRows = _sqlQuery(
    'SELECT * FROM workflow_nodes WHERE parent_node_id = ? AND project_id = ? ORDER BY created_at ASC',
    [nodeId, projectId]
  )
  if (childRows.length > 0) {
    node.children = { nodes: childRows.map(mapWorkflowNodeRow) }
  }

  // Validate phase nodes: cannot set status to "success" if children are incomplete
  if (updates.status === 'success' && node.children?.nodes?.length > 0) {
    const allComplete = node.children.nodes.every((c) => c.status === 'success')
    if (!allComplete) {
      return { error: 'Cannot set phase to success: not all children are complete' }
    }
  }

  const now = new Date().toISOString()

  // Support updating a specific child node within a phase
  if (updates.child_id) {
    const childRow = _sqlQueryOne(
      'SELECT * FROM workflow_nodes WHERE id = ? AND parent_node_id = ? AND project_id = ?',
      [updates.child_id, nodeId, projectId]
    )
    if (!childRow) return null
    const { child_id, ...childUpdates } = updates

    // Update the child node
    const childNode = mapWorkflowNodeRow(childRow)
    const mergedChild = { ...childNode, ...childUpdates, updatedAt: now }
    db.run(
      `UPDATE workflow_nodes SET title = ?, description = ?, type = ?, status = ?,
       linked_issue_keys = ?, updated_at = ? WHERE id = ? AND project_id = ?`,
      [
        mergedChild.title || '',
        mergedChild.description || null,
        mergedChild.type || null,
        mergedChild.status || 'pending',
        mergedChild.linkedIssueKeys ? JSON.stringify(mergedChild.linkedIssueKeys) : null,
        now,
        updates.child_id,
        projectId,
      ]
    )

    // Re-read children to auto-derive parent status
    const updatedChildRows = _sqlQuery(
      'SELECT * FROM workflow_nodes WHERE parent_node_id = ? AND project_id = ?',
      [nodeId, projectId]
    )
    const children = updatedChildRows.map(mapWorkflowNodeRow)
    const allSuccess = children.every((c) => c.status === 'success')
    const anyRunning = children.some((c) => c.status === 'running')
    const anyError = children.some((c) => c.status === 'error')
    let parentStatus = node.status
    if (allSuccess) parentStatus = 'success'
    else if (anyError) parentStatus = 'error'
    else if (anyRunning) parentStatus = 'running'

    db.run('UPDATE workflow_nodes SET status = ?, updated_at = ? WHERE id = ? AND project_id = ?', [
      parentStatus,
      now,
      nodeId,
      projectId,
    ])
  } else {
    // Direct update of this node
    const merged = { ...node, ...updates, updatedAt: now }
    delete merged.children // Don't store children field
    delete merged.parentNodeId // Internal field

    db.run(
      `UPDATE workflow_nodes SET title = ?, description = ?, type = ?, status = ?,
       linked_issue_keys = ?, updated_at = ? WHERE id = ? AND project_id = ?`,
      [
        merged.title || '',
        merged.description || null,
        merged.type || null,
        merged.status || 'pending',
        merged.linkedIssueKeys ? JSON.stringify(merged.linkedIssueKeys) : null,
        now,
        nodeId,
        projectId,
      ]
    )
  }

  db.run('UPDATE projects SET updated_at = ? WHERE id = ?', [now, projectId])
  scheduleSave()

  // Return the updated node with children
  return getWorkflowNode(projectId, nodeId)
}

export function deleteWorkflowNode(projectId, nodeId) {
  const row = _sqlQueryOne('SELECT id FROM workflow_nodes WHERE id = ? AND project_id = ?', [
    nodeId,
    projectId,
  ])
  if (!row) return false

  db.run(
    'DELETE FROM workflow_connections WHERE (from_node_id = ? OR to_node_id = ?) AND project_id = ?',
    [nodeId, nodeId, projectId]
  )
  // Delete children first (they reference parent), then the node itself
  db.run('DELETE FROM workflow_nodes WHERE parent_node_id = ? AND project_id = ?', [
    nodeId,
    projectId,
  ])
  db.run('DELETE FROM workflow_nodes WHERE id = ? AND project_id = ?', [nodeId, projectId])
  db.run('UPDATE projects SET updated_at = ? WHERE id = ?', [new Date().toISOString(), projectId])
  scheduleSave()
  return true
}

export function linkIssueToWorkflowNode(projectId, nodeId, issueKey) {
  const row = _sqlQueryOne('SELECT * FROM workflow_nodes WHERE id = ? AND project_id = ?', [
    nodeId,
    projectId,
  ])
  if (!row) return null
  const node = mapWorkflowNodeRow(row)

  if (!node.linkedIssueKeys) node.linkedIssueKeys = []
  if (!node.linkedIssueKeys.includes(issueKey)) {
    node.linkedIssueKeys.push(issueKey)
  }
  const now = new Date().toISOString()

  db.run(
    'UPDATE workflow_nodes SET linked_issue_keys = ?, updated_at = ? WHERE id = ? AND project_id = ?',
    [JSON.stringify(node.linkedIssueKeys), now, nodeId, projectId]
  )
  db.run('UPDATE projects SET updated_at = ? WHERE id = ?', [now, projectId])
  scheduleSave()

  delete node.parentNodeId
  node.updatedAt = now
  return node
}

export function unlinkIssueFromWorkflowNode(projectId, nodeId, issueKey) {
  const row = _sqlQueryOne('SELECT * FROM workflow_nodes WHERE id = ? AND project_id = ?', [
    nodeId,
    projectId,
  ])
  if (!row) return null
  const node = mapWorkflowNodeRow(row)
  if (!node.linkedIssueKeys) return null

  node.linkedIssueKeys = node.linkedIssueKeys.filter((k) => k !== issueKey)
  const now = new Date().toISOString()

  db.run(
    'UPDATE workflow_nodes SET linked_issue_keys = ?, updated_at = ? WHERE id = ? AND project_id = ?',
    [
      node.linkedIssueKeys.length > 0 ? JSON.stringify(node.linkedIssueKeys) : null,
      now,
      nodeId,
      projectId,
    ]
  )
  db.run('UPDATE projects SET updated_at = ? WHERE id = ?', [now, projectId])
  scheduleSave()

  delete node.parentNodeId
  node.updatedAt = now
  return node
}

// ---------------------------------------------------------------------------
// Architecture components
// ---------------------------------------------------------------------------

export function listArchitectureComponents(projectId) {
  if (!_projectExists(projectId)) return null
  return _listArchComponentsRaw(projectId)
}

export function getArchitectureComponent(projectId, componentId) {
  const row = _sqlQueryOne(
    'SELECT * FROM architecture_components WHERE id = ? AND project_id = ?',
    [componentId, projectId]
  )
  if (!row) return null
  return mapArchComponentRow(row)
}

export function addArchitectureComponent(projectId, component) {
  if (!_projectExists(projectId)) return null

  const now = new Date().toISOString()
  const newComp = {
    ...component,
    id: component.id || crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  }

  db.run(
    `INSERT OR REPLACE INTO architecture_components
      (id, project_id, name, description, type, tech, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      newComp.id,
      projectId,
      newComp.name || '',
      newComp.description || null,
      newComp.type || null,
      newComp.tech || null,
      newComp.createdAt,
      newComp.updatedAt,
    ]
  )
  db.run('UPDATE projects SET updated_at = ? WHERE id = ?', [now, projectId])
  scheduleSave()
  return newComp
}

export function updateArchitectureComponent(projectId, componentId, updates) {
  const row = _sqlQueryOne(
    'SELECT * FROM architecture_components WHERE id = ? AND project_id = ?',
    [componentId, projectId]
  )
  if (!row) return null
  const comp = mapArchComponentRow(row)

  const now = new Date().toISOString()
  const merged = { ...comp, ...updates, updatedAt: now }

  db.run(
    `INSERT OR REPLACE INTO architecture_components
      (id, project_id, name, description, type, tech, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      merged.id,
      projectId,
      merged.name || '',
      merged.description || null,
      merged.type || null,
      merged.tech || null,
      merged.createdAt || now,
      merged.updatedAt,
    ]
  )
  db.run('UPDATE projects SET updated_at = ? WHERE id = ?', [now, projectId])
  scheduleSave()
  return merged
}

export function deleteArchitectureComponent(projectId, componentId) {
  const row = _sqlQueryOne(
    'SELECT id FROM architecture_components WHERE id = ? AND project_id = ?',
    [componentId, projectId]
  )
  if (!row) return false

  db.run(
    'DELETE FROM architecture_connections WHERE (from_component_id = ? OR to_component_id = ?) AND project_id = ?',
    [componentId, componentId, projectId]
  )
  db.run('DELETE FROM architecture_components WHERE id = ? AND project_id = ?', [
    componentId,
    projectId,
  ])
  db.run('UPDATE projects SET updated_at = ? WHERE id = ?', [new Date().toISOString(), projectId])
  scheduleSave()
  return true
}

// ---------------------------------------------------------------------------
// Snapshot operations
// ---------------------------------------------------------------------------

const MAX_SNAPSHOTS_PER_PROJECT = 20

export function createSnapshot(projectId, { action, entity, actor }) {
  if (!_projectExists(projectId)) return null

  const id = crypto.randomUUID()
  const now = new Date().toISOString()

  // Store per-entity data from normalized tables
  const projRow = _sqlQueryOne(
    'SELECT id, name, description, status, created_at, updated_at, is_seed, seed_version, next_issue_number FROM projects WHERE id = ? AND deleted_at IS NULL',
    [projectId]
  )
  const projectMeta = projRow
    ? {
        name: projRow.name,
        description: projRow.description,
        status: projRow.status,
        isSeed: projRow.is_seed === 1,
        seedVersion: projRow.seed_version,
        nextIssueNumber: projRow.next_issue_number || 1,
        createdAt: projRow.created_at,
        updatedAt: projRow.updated_at,
      }
    : {}

  const issues = _listIssuesRaw(projectId)
  const sprints = _listSprintsRaw(projectId)
  const pages = _listPagesRaw(projectId)
  const decisions = _listDecisionsRaw(projectId)
  const phases = _listPhasesRaw(projectId)
  const milestones = _listMilestonesRaw(projectId)
  // Flat workflow nodes (not tree) — preserves parent_node_id for faithful restore
  const workflowNodes = _sqlQuery(
    'SELECT * FROM workflow_nodes WHERE project_id = ? ORDER BY created_at ASC',
    [projectId]
  ).map(mapWorkflowNodeRow)
  const workflowConnections = _listWorkflowConnectionsRaw(projectId)
  const archComponents = _listArchComponentsRaw(projectId)
  const archConnections = _listArchConnectionsRaw(projectId)

  db.run(
    `INSERT INTO snapshots
      (id, project_id, trigger_action, trigger_entity, trigger_actor, data, created_at,
       project_data, issues_data, sprints_data, pages_data, decisions_data,
       phases_data, milestones_data, workflow_nodes_data, workflow_connections_data,
       arch_components_data, arch_connections_data)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      projectId,
      action,
      entity || null,
      actor || null,
      '{}', // placeholder — per-entity columns hold the real data
      now,
      JSON.stringify(projectMeta),
      JSON.stringify(issues),
      JSON.stringify(sprints),
      JSON.stringify(pages),
      JSON.stringify(decisions),
      JSON.stringify(phases),
      JSON.stringify(milestones),
      JSON.stringify(workflowNodes),
      JSON.stringify(workflowConnections),
      JSON.stringify(archComponents),
      JSON.stringify(archConnections),
    ]
  )

  // LRU cap — keep at most MAX_SNAPSHOTS_PER_PROJECT
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
  const row = _sqlQueryOne(
    'SELECT data, project_data, issues_data, sprints_data, pages_data, decisions_data, phases_data, milestones_data, workflow_nodes_data, workflow_connections_data, arch_components_data, arch_connections_data FROM snapshots WHERE id = ? AND project_id = ?',
    [snapshotId, projectId]
  )
  if (!row) return null

  // Per-entity columns are populated
  if (row.issues_data) {
    const projectMeta = JSON.parse(row.project_data || '{}')
    const issues = JSON.parse(row.issues_data)
    const sprints = JSON.parse(row.sprints_data || '[]')
    const pages = JSON.parse(row.pages_data || '[]')
    const decisions = JSON.parse(row.decisions_data || '[]')
    const phases = JSON.parse(row.phases_data || '[]')
    const milestones = JSON.parse(row.milestones_data || '[]')
    const workflowNodes = JSON.parse(row.workflow_nodes_data || '[]')
    const workflowConnections = JSON.parse(row.workflow_connections_data || '[]')
    const archComponents = JSON.parse(row.arch_components_data || '[]')
    const archConnections = JSON.parse(row.arch_connections_data || '[]')

    // Disable FK checks for bulk delete+insert
    db.run('PRAGMA foreign_keys = OFF')

    try {
      // Delete all entity rows for this project (children before parents)
      db.run('DELETE FROM comments WHERE project_id = ?', [projectId])
      db.run('DELETE FROM issues WHERE project_id = ?', [projectId])
      db.run('DELETE FROM sprints WHERE project_id = ?', [projectId])
      db.run('DELETE FROM workflow_connections WHERE project_id = ?', [projectId])
      db.run('DELETE FROM workflow_nodes WHERE project_id = ?', [projectId])
      db.run('DELETE FROM architecture_connections WHERE project_id = ?', [projectId])
      db.run('DELETE FROM architecture_components WHERE project_id = ?', [projectId])
      db.run('DELETE FROM pages WHERE project_id = ?', [projectId])
      db.run('DELETE FROM decisions WHERE project_id = ?', [projectId])
      db.run('DELETE FROM phases WHERE project_id = ?', [projectId])
      db.run('DELETE FROM milestones WHERE project_id = ?', [projectId])

      // Restore project metadata
      if (projectMeta.nextIssueNumber) {
        db.run(
          'UPDATE projects SET next_issue_number = ?, name = ?, description = ?, status = ?, updated_at = ? WHERE id = ?',
          [
            projectMeta.nextIssueNumber,
            projectMeta.name || '',
            projectMeta.description || '',
            projectMeta.status || 'planning',
            new Date().toISOString(),
            projectId,
          ]
        )
      }

      // Re-insert all entities
      const now = new Date().toISOString()

      for (const s of sprints) {
        db.run(
          `INSERT OR REPLACE INTO sprints (id, project_id, name, goal, start_date, end_date, status, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            s.id,
            projectId,
            s.name || '',
            s.goal || null,
            s.startDate || null,
            s.endDate || null,
            s.status || 'planning',
            s.createdAt || now,
            s.updatedAt || now,
          ]
        )
      }

      for (const i of issues) {
        db.run(
          `INSERT OR REPLACE INTO issues
            (id, project_id, key, title, description, type, status, priority,
             story_points, assignee, epic_id, sprint_id, labels, linked_issue_keys,
             created_by, created_by_reasoning, created_by_confidence,
             todo_at, in_progress_at, blocked_at, done_at, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            i.id,
            projectId,
            i.key || '',
            i.title || '',
            i.description || null,
            i.type || 'task',
            i.status || 'To Do',
            i.priority || 'medium',
            i.storyPoints || null,
            i.assignee || null,
            i.epicId || null,
            i.sprintId || null,
            i.labels ? JSON.stringify(i.labels) : null,
            i.linkedIssueKeys ? JSON.stringify(i.linkedIssueKeys) : null,
            i.createdBy || null,
            i.createdByReasoning || null,
            i.createdByConfidence || null,
            i.todoAt || null,
            i.inProgressAt || null,
            i.blockedAt || null,
            i.doneAt || null,
            i.createdAt || now,
            i.updatedAt || now,
          ]
        )
        // Restore comments embedded in issues
        for (const c of i.comments || []) {
          db.run(
            `INSERT OR REPLACE INTO comments (id, issue_id, project_id, body, author, created_at)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [c.id, i.id, projectId, c.body || '', c.author || null, c.createdAt || now]
          )
        }
      }

      for (const p of pages) {
        db.run(
          `INSERT OR REPLACE INTO pages (id, project_id, title, content, parent_id, status, created_by, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            p.id,
            projectId,
            p.title || '',
            p.content || null,
            p.parentId || null,
            p.status || null,
            p.createdBy || null,
            p.createdAt || now,
            p.updatedAt || now,
          ]
        )
      }

      for (const d of decisions) {
        db.run(
          `INSERT OR REPLACE INTO decisions (id, project_id, title, description, rationale, status, author, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            d.id,
            projectId,
            d.title || '',
            d.description || null,
            d.rationale || null,
            d.status || 'proposed',
            d.author || null,
            d.createdAt || now,
            d.updatedAt || now,
          ]
        )
      }

      for (const p of phases) {
        db.run(
          `INSERT OR REPLACE INTO phases (id, project_id, name, description, status, progress, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            p.id,
            projectId,
            p.name || '',
            p.description || null,
            p.status || 'pending',
            p.progress || 0,
            p.createdAt || now,
            p.updatedAt || now,
          ]
        )
      }

      for (const m of milestones) {
        db.run(
          `INSERT OR REPLACE INTO milestones (id, project_id, name, description, due_date, completed, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            m.id,
            projectId,
            m.name || '',
            m.description || null,
            m.dueDate || null,
            m.completed ? 1 : 0,
            m.createdAt || now,
            m.updatedAt || now,
          ]
        )
      }

      for (const n of workflowNodes) {
        db.run(
          `INSERT OR REPLACE INTO workflow_nodes
            (id, project_id, parent_node_id, title, description, type, status, linked_issue_keys, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            n.id,
            projectId,
            n.parentNodeId || null,
            n.title || '',
            n.description || null,
            n.type || null,
            n.status || 'pending',
            n.linkedIssueKeys ? JSON.stringify(n.linkedIssueKeys) : null,
            n.createdAt || now,
            n.updatedAt || now,
          ]
        )
      }

      for (const c of workflowConnections) {
        db.run(
          `INSERT OR REPLACE INTO workflow_connections (id, project_id, from_node_id, to_node_id, type)
           VALUES (?, ?, ?, ?, ?)`,
          [c.id, projectId, c.from, c.to, c.type || null]
        )
      }

      for (const c of archComponents) {
        db.run(
          `INSERT OR REPLACE INTO architecture_components (id, project_id, name, description, type, tech, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            c.id,
            projectId,
            c.name || '',
            c.description || null,
            c.type || null,
            c.tech || null,
            c.createdAt || now,
            c.updatedAt || now,
          ]
        )
      }

      for (const c of archConnections) {
        db.run(
          `INSERT OR REPLACE INTO architecture_connections (id, project_id, from_component_id, to_component_id, type)
           VALUES (?, ?, ?, ?, ?)`,
          [c.id, projectId, c.from, c.to, c.type || null]
        )
      }
    } finally {
      db.run('PRAGMA foreign_keys = ON')
    }

    scheduleSave()
    return getProject(projectId)
  }

  // Old-format snapshot — return the data as-is (read-only, can't fully restore)
  return JSON.parse(row.data)
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

  // Insert the project row
  db.run(
    `INSERT OR REPLACE INTO projects
      (id, name, description, status, created_at, updated_at, next_issue_number)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      project.name || '',
      project.description || '',
      project.status || 'planning',
      now,
      now,
      project.board?.nextIssueNumber || 1,
    ]
  )

  // Auto-scaffold wiki pages
  const scaffoldPages = [
    {
      id: crypto.randomUUID(),
      title: 'Dependencies & Tech Stack',
      content: DEPENDENCIES_TEMPLATE,
      parentId: null,
      createdAt: now,
      updatedAt: now,
      createdBy: 'system',
    },
    {
      id: crypto.randomUUID(),
      title: 'Agent: Workflow Rules',
      content: WORKFLOW_RULES_TEMPLATE,
      parentId: null,
      createdAt: now,
      updatedAt: now,
      createdBy: 'system',
    },
  ]

  for (const p of scaffoldPages) {
    db.run(
      `INSERT OR REPLACE INTO pages
        (id, project_id, title, content, parent_id, status, created_by, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        p.id,
        id,
        p.title || '',
        p.content || null,
        p.parentId || null,
        p.status || null,
        p.createdBy || null,
        p.createdAt,
        p.updatedAt,
      ]
    )
  }

  scheduleSave()

  // Return the full project shape
  return getProject(id)
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
