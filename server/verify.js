// ---------------------------------------------------------------------------
// Verification: compare JSON blob data against normalized SQL tables
// Used during migration to detect discrepancies before switching reads.
// ---------------------------------------------------------------------------

/**
 * Helper: run a SQL query and return rows as array of objects.
 * Uses the sql.js .exec() method (not child_process).
 */
function queryAll(rawDb, sql, params = []) {
  const results = rawDb.exec(sql, params)
  if (results.length === 0) return []
  const cols = results[0].columns
  return results[0].values.map((row) => {
    const obj = {}
    for (let i = 0; i < cols.length; i++) obj[cols[i]] = row[i]
    return obj
  })
}

/**
 * Build a Map keyed by id from an array of objects.
 */
function indexById(arr) {
  const map = new Map()
  for (const item of arr) {
    if (item.id) map.set(item.id, item)
  }
  return map
}

/**
 * Flatten workflow nodes: blob stores children nested inside parent nodes.
 * Returns a flat array of all nodes.
 */
function flattenWorkflowNodes(nodes) {
  const flat = []
  for (const n of nodes || []) {
    flat.push(n)
    if (n.children?.nodes) {
      flat.push(...flattenWorkflowNodes(n.children.nodes))
    }
  }
  return flat
}

/**
 * Compare two values, handling type coercion (e.g. boolean vs integer).
 */
function valuesMatch(blobVal, sqlVal) {
  if (blobVal === sqlVal) return true
  if (blobVal === null && sqlVal === null) return true
  if (blobVal === undefined && sqlVal === undefined) return true
  if ((blobVal === null || blobVal === undefined) && (sqlVal === null || sqlVal === undefined))
    return true
  if (blobVal === null || blobVal === undefined || sqlVal === null || sqlVal === undefined)
    return false
  // Boolean/integer coercion (milestones.completed)
  if (typeof blobVal === 'boolean') return blobVal === (sqlVal === 1)
  if (typeof sqlVal === 'boolean') return sqlVal === (blobVal === 1)
  // Number coercion
  if (typeof blobVal === 'number' && typeof sqlVal === 'string') return blobVal === Number(sqlVal)
  if (typeof sqlVal === 'number' && typeof blobVal === 'string') return Number(blobVal) === sqlVal
  // String comparison
  return String(blobVal) === String(sqlVal)
}

/**
 * Compare a single entity type between blob and SQL.
 * @param {Array} blobItems - items from the blob
 * @param {Array} sqlRows - rows from the SQL table
 * @param {string} entityName - e.g. 'issue', 'sprint'
 * @param {Array<{blob: string, sql: string}>} fieldMap - fields to compare
 * @param {Function} [detailFn] - optional function to get a human-readable key
 * @returns {{ count: {blob: number, sql: number}, discrepancies: Array }}
 */
function compareEntity(blobItems, sqlRows, entityName, fieldMap, detailFn) {
  const discrepancies = []
  const blobMap = indexById(blobItems)
  const sqlMap = indexById(sqlRows)

  // Check blob items missing in SQL
  for (const [id, item] of blobMap) {
    if (!sqlMap.has(id)) {
      discrepancies.push({
        entity: entityName,
        type: 'missing_in_sql',
        id,
        detail: detailFn ? detailFn(item) : undefined,
      })
      continue
    }

    // Compare fields
    const sqlItem = sqlMap.get(id)
    for (const { blob: blobField, sql: sqlField } of fieldMap) {
      const blobVal = item[blobField]
      const sqlVal = sqlItem[sqlField]
      if (!valuesMatch(blobVal, sqlVal)) {
        discrepancies.push({
          entity: entityName,
          type: 'field_mismatch',
          id,
          field: sqlField,
          blob: blobVal ?? null,
          sql: sqlVal ?? null,
        })
      }
    }
  }

  // Check SQL rows missing in blob
  for (const [id] of sqlMap) {
    if (!blobMap.has(id)) {
      const sqlItem = sqlMap.get(id)
      discrepancies.push({
        entity: entityName,
        type: 'missing_in_blob',
        id,
        detail: detailFn ? detailFn(sqlItem) : undefined,
      })
    }
  }

  return {
    count: { blob: blobItems.length, sql: sqlRows.length },
    discrepancies,
  }
}

/**
 * Verify a single project: compare blob data against SQL tables.
 * @param {object} rawDb - raw sql.js database handle
 * @param {object} project - parsed project JSON blob
 * @returns {object} verification result
 */
export function verifyProject(rawDb, project) {
  const projectId = project.id
  const allDiscrepancies = []
  const entityCounts = {}

  // --- Issues ---
  const blobIssues = project.board?.issues || []
  const sqlIssues = queryAll(rawDb, 'SELECT * FROM issues WHERE project_id = ?', [projectId])
  const issueResult = compareEntity(
    blobIssues,
    sqlIssues,
    'issue',
    [
      { blob: 'key', sql: 'key' },
      { blob: 'title', sql: 'title' },
      { blob: 'status', sql: 'status' },
      { blob: 'type', sql: 'type' },
      { blob: 'priority', sql: 'priority' },
      { blob: 'storyPoints', sql: 'story_points' },
    ],
    (item) => `key: ${item.key || item.title || '?'}`
  )
  entityCounts.issues = issueResult.count
  allDiscrepancies.push(...issueResult.discrepancies)

  // --- Comments (grouped by issue) ---
  const sqlComments = queryAll(rawDb, 'SELECT * FROM comments WHERE project_id = ?', [projectId])
  const blobComments = []
  for (const issue of blobIssues) {
    for (const c of issue.comments || []) {
      blobComments.push({ ...c, _issueId: issue.id })
    }
  }
  const commentResult = compareEntity(
    blobComments,
    sqlComments,
    'comment',
    [
      { blob: 'body', sql: 'body' },
      { blob: 'author', sql: 'author' },
    ],
    (item) => `issue: ${item._issueId || item.issue_id || '?'}`
  )
  entityCounts.comments = commentResult.count
  allDiscrepancies.push(...commentResult.discrepancies)

  // --- Sprints ---
  const blobSprints = project.board?.sprints || []
  const sqlSprints = queryAll(rawDb, 'SELECT * FROM sprints WHERE project_id = ?', [projectId])
  const sprintResult = compareEntity(
    blobSprints,
    sqlSprints,
    'sprint',
    [
      { blob: 'name', sql: 'name' },
      { blob: 'status', sql: 'status' },
    ],
    (item) => `name: ${item.name || '?'}`
  )
  entityCounts.sprints = sprintResult.count
  allDiscrepancies.push(...sprintResult.discrepancies)

  // --- Pages ---
  const blobPages = project.pages || []
  const sqlPages = queryAll(rawDb, 'SELECT * FROM pages WHERE project_id = ?', [projectId])
  const pageResult = compareEntity(
    blobPages,
    sqlPages,
    'page',
    [
      { blob: 'title', sql: 'title' },
      { blob: 'status', sql: 'status' },
      { blob: 'createdBy', sql: 'created_by' },
    ],
    (item) => `title: ${item.title || '?'}`
  )
  entityCounts.pages = pageResult.count
  allDiscrepancies.push(...pageResult.discrepancies)

  // --- Decisions ---
  const blobDecisions = project.decisions || []
  const sqlDecisions = queryAll(rawDb, 'SELECT * FROM decisions WHERE project_id = ?', [projectId])
  const decisionResult = compareEntity(
    blobDecisions,
    sqlDecisions,
    'decision',
    [
      { blob: 'title', sql: 'title' },
      { blob: 'status', sql: 'status' },
    ],
    (item) => `title: ${item.title || '?'}`
  )
  entityCounts.decisions = decisionResult.count
  allDiscrepancies.push(...decisionResult.discrepancies)

  // --- Phases ---
  const blobPhases = project.timeline?.phases || []
  const sqlPhases = queryAll(rawDb, 'SELECT * FROM phases WHERE project_id = ?', [projectId])
  const phaseResult = compareEntity(
    blobPhases,
    sqlPhases,
    'phase',
    [
      { blob: 'name', sql: 'name' },
      { blob: 'status', sql: 'status' },
      { blob: 'progress', sql: 'progress' },
    ],
    (item) => `name: ${item.name || '?'}`
  )
  entityCounts.phases = phaseResult.count
  allDiscrepancies.push(...phaseResult.discrepancies)

  // --- Milestones ---
  const blobMilestones = project.timeline?.milestones || []
  const sqlMilestones = queryAll(rawDb, 'SELECT * FROM milestones WHERE project_id = ?', [
    projectId,
  ])
  const milestoneResult = compareEntity(
    blobMilestones,
    sqlMilestones,
    'milestone',
    [
      { blob: 'name', sql: 'name' },
      { blob: 'completed', sql: 'completed' },
    ],
    (item) => `name: ${item.name || '?'}`
  )
  entityCounts.milestones = milestoneResult.count
  allDiscrepancies.push(...milestoneResult.discrepancies)

  // --- Workflow nodes (flatten blob hierarchy) ---
  const blobWorkflowNodes = flattenWorkflowNodes(project.workflow?.nodes || [])
  const sqlWorkflowNodes = queryAll(rawDb, 'SELECT * FROM workflow_nodes WHERE project_id = ?', [
    projectId,
  ])
  const workflowNodeResult = compareEntity(
    blobWorkflowNodes,
    sqlWorkflowNodes,
    'workflow_node',
    [
      { blob: 'title', sql: 'title' },
      { blob: 'status', sql: 'status' },
      { blob: 'type', sql: 'type' },
    ],
    (item) => `title: ${item.title || '?'}`
  )
  entityCounts.workflow_nodes = workflowNodeResult.count
  allDiscrepancies.push(...workflowNodeResult.discrepancies)

  // --- Workflow connections ---
  const blobWorkflowConns = project.workflow?.connections || []
  const sqlWorkflowConns = queryAll(
    rawDb,
    'SELECT * FROM workflow_connections WHERE project_id = ?',
    [projectId]
  )
  const workflowConnResult = compareEntity(
    blobWorkflowConns,
    sqlWorkflowConns,
    'workflow_connection',
    [
      { blob: 'from', sql: 'from_node_id' },
      { blob: 'to', sql: 'to_node_id' },
    ]
  )
  entityCounts.workflow_connections = workflowConnResult.count
  allDiscrepancies.push(...workflowConnResult.discrepancies)

  // --- Architecture components ---
  const blobArchComponents = project.architecture?.components || []
  const sqlArchComponents = queryAll(
    rawDb,
    'SELECT * FROM architecture_components WHERE project_id = ?',
    [projectId]
  )
  const archCompResult = compareEntity(
    blobArchComponents,
    sqlArchComponents,
    'architecture_component',
    [
      { blob: 'name', sql: 'name' },
      { blob: 'type', sql: 'type' },
      { blob: 'tech', sql: 'tech' },
    ],
    (item) => `name: ${item.name || '?'}`
  )
  entityCounts.architecture_components = archCompResult.count
  allDiscrepancies.push(...archCompResult.discrepancies)

  // --- Architecture connections ---
  const blobArchConns = project.architecture?.connections || []
  const sqlArchConns = queryAll(
    rawDb,
    'SELECT * FROM architecture_connections WHERE project_id = ?',
    [projectId]
  )
  const archConnResult = compareEntity(blobArchConns, sqlArchConns, 'architecture_connection', [
    { blob: 'from', sql: 'from_component_id' },
    { blob: 'to', sql: 'to_component_id' },
  ])
  entityCounts.architecture_connections = archConnResult.count
  allDiscrepancies.push(...archConnResult.discrepancies)

  return {
    projectId,
    projectName: project.name || '(unnamed)',
    status: allDiscrepancies.length === 0 ? 'pass' : 'fail',
    entityCounts,
    discrepancies: allDiscrepancies,
  }
}

/**
 * Verify all projects: compare blob data against SQL tables.
 * @param {object} rawDb - raw sql.js database handle
 * @param {Function} listProjects - returns [{id, ...}]
 * @param {Function} getProject - returns full parsed project blob by id
 * @returns {Array} array of verification results
 */
export function verifyAll(rawDb, listProjects, getProject) {
  const summaries = listProjects()
  const results = []

  for (const summary of summaries) {
    const project = getProject(summary.id)
    if (!project) continue
    results.push(verifyProject(rawDb, project))
  }

  return results
}
