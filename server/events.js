// ---------------------------------------------------------------------------
// Event stream layer for StoryFlow v2
// Captures every mutation as a structured event with provenance and reasoning
// ---------------------------------------------------------------------------

import crypto from 'node:crypto'

let db = null

const VALID_ACTORS = ['ai', 'human', 'system']
const VALID_CATEGORIES = [
  'board',
  'wiki',
  'architecture',
  'workflow',
  'timeline',
  'decisions',
  'project',
  'steering',
  'system',
]
const VALID_ACTIONS = [
  'create',
  'update',
  'delete',
  'status_change',
  'assign',
  'move',
  'approve',
  'reject',
  'redirect',
  'analyze',
  'steer',
  'info',
]

// ---------------------------------------------------------------------------
// Initialization — called from db.js after SQL.js is ready
// ---------------------------------------------------------------------------

export function initEvents(database) {
  db = database

  db.run(`
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      actor TEXT NOT NULL,
      agent_id TEXT,
      session_id TEXT,
      category TEXT NOT NULL,
      action TEXT NOT NULL,
      entity_type TEXT,
      entity_id TEXT,
      entity_title TEXT,
      changes TEXT,
      reasoning TEXT,
      confidence REAL,
      triggered_by TEXT,
      human_response TEXT,
      data TEXT NOT NULL DEFAULT '{}'
    )
  `)

  db.run('CREATE INDEX IF NOT EXISTS idx_events_project ON events(project_id, timestamp DESC)')
  db.run('CREATE INDEX IF NOT EXISTS idx_events_category ON events(project_id, category)')
  db.run(
    'CREATE INDEX IF NOT EXISTS idx_events_entity ON events(project_id, entity_type, entity_id)'
  )

  console.log('[Events] Events table ready')
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

function validateEvent(event) {
  if (!event.project_id) return '"project_id" is required'
  if (!event.actor || !VALID_ACTORS.includes(event.actor))
    return `"actor" must be one of: ${VALID_ACTORS.join(', ')}`
  if (!event.category || !VALID_CATEGORIES.includes(event.category))
    return `"category" must be one of: ${VALID_CATEGORIES.join(', ')}`
  if (!event.action || !VALID_ACTIONS.includes(event.action))
    return `"action" must be one of: ${VALID_ACTIONS.join(', ')}`
  if (event.confidence !== undefined && event.confidence !== null) {
    if (typeof event.confidence !== 'number' || event.confidence < 0 || event.confidence > 1)
      return '"confidence" must be a number between 0 and 1'
  }
  return null
}

// ---------------------------------------------------------------------------
// CRUD
// ---------------------------------------------------------------------------

/** Record a new event. Returns the created event. */
export function recordEvent(event) {
  if (!db) throw new Error('Events not initialized')

  const err = validateEvent(event)
  if (err) return { error: err }

  const id = event.id || crypto.randomUUID()
  const now = new Date().toISOString()

  const record = {
    id,
    project_id: event.project_id,
    timestamp: event.timestamp || now,
    actor: event.actor,
    agent_id: event.agent_id || null,
    session_id: event.session_id || null,
    category: event.category,
    action: event.action,
    entity_type: event.entity_type || null,
    entity_id: event.entity_id || null,
    entity_title: event.entity_title || null,
    changes: event.changes ? JSON.stringify(event.changes) : null,
    reasoning: event.reasoning || null,
    confidence: event.confidence ?? null,
    triggered_by: event.triggered_by || null,
    human_response: event.human_response ? JSON.stringify(event.human_response) : null,
    data: JSON.stringify(event.data || {}),
  }

  db.run(
    `INSERT INTO events
      (id, project_id, timestamp, actor, agent_id, session_id, category, action,
       entity_type, entity_id, entity_title, changes, reasoning, confidence,
       triggered_by, human_response, data)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      record.id,
      record.project_id,
      record.timestamp,
      record.actor,
      record.agent_id,
      record.session_id,
      record.category,
      record.action,
      record.entity_type,
      record.entity_id,
      record.entity_title,
      record.changes,
      record.reasoning,
      record.confidence,
      record.triggered_by,
      record.human_response,
      record.data,
    ]
  )

  return record
}

/** Query events with filters. Returns array of parsed event objects. */
export function queryEvents(projectId, filters = {}) {
  if (!db) throw new Error('Events not initialized')

  const conditions = ['project_id = ?']
  const params = [projectId]

  if (filters.category) {
    conditions.push('category = ?')
    params.push(filters.category)
  }
  if (filters.actor) {
    conditions.push('actor = ?')
    params.push(filters.actor)
  }
  if (filters.entity_type) {
    conditions.push('entity_type = ?')
    params.push(filters.entity_type)
  }
  if (filters.entity_id) {
    conditions.push('entity_id = ?')
    params.push(filters.entity_id)
  }
  if (filters.since) {
    conditions.push('timestamp > ?')
    params.push(filters.since)
  }
  if (filters.before) {
    conditions.push('timestamp < ?')
    params.push(filters.before)
  }
  if (filters.action) {
    conditions.push('action = ?')
    params.push(filters.action)
  }

  const limit = Math.min(filters.limit || 100, 500)
  const offset = filters.offset || 0

  const sql = `
    SELECT * FROM events
    WHERE ${conditions.join(' AND ')}
    ORDER BY timestamp DESC
    LIMIT ? OFFSET ?
  `
  params.push(limit, offset)

  const results = db.exec(sql, params)
  if (results.length === 0) return []

  const columns = results[0].columns
  return results[0].values.map((row) => {
    const obj = {}
    columns.forEach((col, i) => {
      obj[col] = row[i]
    })
    // Parse JSON fields
    if (obj.changes) obj.changes = JSON.parse(obj.changes)
    if (obj.human_response) obj.human_response = JSON.parse(obj.human_response)
    if (obj.data) obj.data = JSON.parse(obj.data)
    return obj
  })
}

/** Get a single event by ID */
export function getEvent(eventId) {
  if (!db) throw new Error('Events not initialized')

  const results = db.exec('SELECT * FROM events WHERE id = ?', [eventId])
  if (results.length === 0 || results[0].values.length === 0) return null

  const columns = results[0].columns
  const row = results[0].values[0]
  const obj = {}
  columns.forEach((col, i) => {
    obj[col] = row[i]
  })
  if (obj.changes) obj.changes = JSON.parse(obj.changes)
  if (obj.human_response) obj.human_response = JSON.parse(obj.human_response)
  if (obj.data) obj.data = JSON.parse(obj.data)
  return obj
}

/** Record a human response (approve/reject/redirect) on an event */
export function respondToEvent(eventId, response) {
  if (!db) throw new Error('Events not initialized')

  const event = getEvent(eventId)
  if (!event) return null

  const humanResponse = {
    action: response.action, // 'approve' | 'reject' | 'redirect'
    timestamp: new Date().toISOString(),
    comment: response.comment || null,
  }

  db.run('UPDATE events SET human_response = ? WHERE id = ?', [
    JSON.stringify(humanResponse),
    eventId,
  ])

  return { ...event, human_response: humanResponse }
}

// ---------------------------------------------------------------------------
// Auto-emit helpers — called from mutation endpoints
// ---------------------------------------------------------------------------

/** Extract provenance from request headers */
export function extractProvenance(req) {
  return {
    actor: req.headers['x-storyflow-actor'] || 'human',
    reasoning: req.headers['x-storyflow-reasoning'] || null,
    confidence: req.headers['x-storyflow-confidence']
      ? parseFloat(req.headers['x-storyflow-confidence'])
      : null,
    agent_id: req.headers['x-storyflow-agent-id'] || null,
    session_id: req.headers['x-storyflow-session-id'] || null,
  }
}

/** Build and record an event from a mutation context */
export function emitMutationEvent({
  projectId,
  provenance,
  category,
  action,
  entityType,
  entityId,
  entityTitle,
  changes,
  data,
  triggeredBy,
}) {
  const event = recordEvent({
    project_id: projectId,
    actor: provenance.actor,
    agent_id: provenance.agent_id,
    session_id: provenance.session_id,
    category,
    action,
    entity_type: entityType,
    entity_id: entityId,
    entity_title: entityTitle,
    changes,
    reasoning: provenance.reasoning,
    confidence: provenance.confidence,
    triggered_by: triggeredBy,
    data,
  })

  return event
}

/** Count events for a project (for metrics) */
export function countEvents(projectId, filters = {}) {
  if (!db) throw new Error('Events not initialized')

  const conditions = ['project_id = ?']
  const params = [projectId]

  if (filters.actor) {
    conditions.push('actor = ?')
    params.push(filters.actor)
  }
  if (filters.since) {
    conditions.push('timestamp > ?')
    params.push(filters.since)
  }

  const sql = `SELECT COUNT(*) FROM events WHERE ${conditions.join(' AND ')}`
  const results = db.exec(sql, params)
  return results.length > 0 ? results[0].values[0][0] : 0
}
