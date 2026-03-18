// ---------------------------------------------------------------------------
// Backfill: unpack project JSON blobs into normalized SQL tables
// Idempotent — uses INSERT OR REPLACE, safe to re-run on every startup.
// ---------------------------------------------------------------------------

/**
 * Backfill a single project's blob data into normalized tables.
 * @param {object} db - raw sql.js database handle
 * @param {object} project - parsed project JSON blob
 */
export function backfillProject(db, project) {
  const projectId = project.id
  const now = new Date().toISOString()

  // Update next_issue_number on the projects row
  const nextIssueNumber = project.board?.nextIssueNumber || 1
  db.run('UPDATE projects SET next_issue_number = ? WHERE id = ?', [nextIssueNumber, projectId])

  // --- Sprints (must come before issues — FK dependency) ---
  const sprints = project.board?.sprints || []
  for (const s of sprints) {
    db.run(
      `INSERT OR REPLACE INTO sprints
        (id, project_id, name, goal, start_date, end_date, status, created_at, updated_at)
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
        s.updatedAt || s.createdAt || now,
      ]
    )
  }

  // --- Issues ---
  const issues = project.board?.issues || []
  for (const i of issues) {
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
        i.updatedAt || i.createdAt || now,
      ]
    )

    // --- Comments (nested inside issues) ---
    const comments = i.comments || []
    for (const c of comments) {
      db.run(
        `INSERT OR REPLACE INTO comments
          (id, issue_id, project_id, body, author, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [c.id, i.id, projectId, c.body || '', c.author || null, c.createdAt || now]
      )
    }
  }

  // --- Pages (wiki) ---
  const pages = project.pages || []
  for (const p of pages) {
    db.run(
      `INSERT OR REPLACE INTO pages
        (id, project_id, title, content, parent_id, status, created_by, created_at, updated_at)
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
        p.updatedAt || p.createdAt || now,
      ]
    )
  }

  // --- Decisions ---
  const decisions = project.decisions || []
  for (const d of decisions) {
    db.run(
      `INSERT OR REPLACE INTO decisions
        (id, project_id, title, description, rationale, status, author, created_at, updated_at)
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
        d.updatedAt || d.createdAt || now,
      ]
    )
  }

  // --- Phases ---
  const phases = project.timeline?.phases || []
  for (const p of phases) {
    db.run(
      `INSERT OR REPLACE INTO phases
        (id, project_id, name, description, status, progress, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        p.id,
        projectId,
        p.name || '',
        p.description || null,
        p.status || 'pending',
        p.progress || 0,
        p.createdAt || now,
        p.updatedAt || p.createdAt || now,
      ]
    )
  }

  // --- Milestones ---
  const milestones = project.timeline?.milestones || []
  for (const m of milestones) {
    db.run(
      `INSERT OR REPLACE INTO milestones
        (id, project_id, name, description, due_date, completed, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        m.id,
        projectId,
        m.name || '',
        m.description || null,
        m.dueDate || null,
        m.completed ? 1 : 0,
        m.createdAt || now,
        m.updatedAt || m.createdAt || now,
      ]
    )
  }

  // --- Workflow nodes (flatten parent + children) ---
  const workflowNodes = project.workflow?.nodes || []
  for (const n of workflowNodes) {
    insertWorkflowNode(db, projectId, n, null, now)
  }

  // --- Workflow connections ---
  const workflowConnections = project.workflow?.connections || []
  for (const c of workflowConnections) {
    db.run(
      `INSERT OR REPLACE INTO workflow_connections
        (id, project_id, from_node_id, to_node_id, type)
       VALUES (?, ?, ?, ?, ?)`,
      [c.id, projectId, c.from, c.to, c.type || null]
    )
  }

  // --- Architecture components ---
  const archComponents = project.architecture?.components || []
  for (const c of archComponents) {
    db.run(
      `INSERT OR REPLACE INTO architecture_components
        (id, project_id, name, description, type, tech, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        c.id,
        projectId,
        c.name || '',
        c.description || null,
        c.type || null,
        c.tech || null,
        c.createdAt || now,
        c.updatedAt || c.createdAt || now,
      ]
    )
  }

  // --- Architecture connections ---
  const archConnections = project.architecture?.connections || []
  for (const c of archConnections) {
    db.run(
      `INSERT OR REPLACE INTO architecture_connections
        (id, project_id, from_component_id, to_component_id, type)
       VALUES (?, ?, ?, ?, ?)`,
      [c.id, projectId, c.from, c.to, c.type || null]
    )
  }
}

/**
 * Recursively insert a workflow node and its children.
 * Children are stored in node.children.nodes[] in the blob.
 */
function insertWorkflowNode(db, projectId, node, parentNodeId, fallbackNow) {
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
      node.createdAt || fallbackNow,
      node.updatedAt || node.createdAt || fallbackNow,
    ]
  )

  // Recurse into children
  const children = node.children?.nodes || []
  for (const child of children) {
    insertWorkflowNode(db, projectId, child, node.id, fallbackNow)
  }
}

/**
 * Backfill all projects into normalized tables.
 * @param {object} db - raw sql.js database handle
 * @param {Function} listProjectsFn - returns [{id, ...}]
 * @param {Function} getProjectFn - returns full parsed project blob by id
 * @returns {number} count of projects backfilled
 */
export function backfillAll(db, listProjectsFn, getProjectFn) {
  const summaries = listProjectsFn()
  let count = 0

  for (const summary of summaries) {
    const project = getProjectFn(summary.id)
    if (!project) continue
    backfillProject(db, project)
    count++
  }

  return count
}
