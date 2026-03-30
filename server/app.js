// ---------------------------------------------------------------------------
// Express REST API for StoryFlow
// Same endpoints as the old Vite plugin, backed by SQLite via db.js
// ---------------------------------------------------------------------------

import express from 'express'
import { timingSafeEqual } from 'node:crypto'
import * as db from './db.js'
import { notifyClients, broadcastEvent, broadcastAiStatus, broadcastGateUpdate } from './ws.js'
import {
  recordEvent,
  queryEvents,
  respondToEvent,
  extractProvenance,
  emitMutationEvent,
  cleanupOldEvents,
  checkApprovalGates,
  getRejectedEvents,
  hasEntityGate,
} from './events.js'
import {
  addSteeringDirective,
  getSteeringDirectives,
  acknowledgeDirective,
  checkTitleDuplication,
  emitHygieneEvents,
} from './intelligence.js'
const app = express()

// --- Request body validation helpers ---
const VALID_ISSUE_TYPES = ['epic', 'story', 'task', 'bug', 'subtask']
const VALID_ISSUE_PRIORITIES = ['critical', 'high', 'medium', 'low']
const VALID_PROJECT_STATUSES = ['planning', 'in-progress', 'completed', 'on-hold']
const VALID_SPRINT_STATUSES = ['planning', 'active', 'completed']

function requireString(body, field) {
  if (typeof body[field] !== 'string' || body[field].trim() === '') {
    return `"${field}" is required and must be a non-empty string`
  }
  return null
}

function validateIssueBody(body, isUpdate = false) {
  if (!isUpdate) {
    const titleErr = requireString(body, 'title')
    if (titleErr) return titleErr
    const typeErr = requireString(body, 'type')
    if (typeErr) return typeErr
    if (!VALID_ISSUE_TYPES.includes(body.type)) {
      return `"type" must be one of: ${VALID_ISSUE_TYPES.join(', ')}`
    }
  } else {
    if (body.type !== undefined && !VALID_ISSUE_TYPES.includes(body.type)) {
      return `"type" must be one of: ${VALID_ISSUE_TYPES.join(', ')}`
    }
  }
  if (body.priority !== undefined && !VALID_ISSUE_PRIORITIES.includes(body.priority)) {
    return `"priority" must be one of: ${VALID_ISSUE_PRIORITIES.join(', ')}`
  }
  if (body.storyPoints !== undefined && typeof body.storyPoints !== 'number') {
    return '"storyPoints" must be a number'
  }
  if (body.labels !== undefined && !Array.isArray(body.labels)) {
    return '"labels" must be an array'
  }
  return null
}

function validateProjectBody(body, isUpdate = false) {
  if (!isUpdate) {
    const nameErr = requireString(body, 'name')
    if (nameErr) return nameErr
  }
  if (body.status !== undefined && !VALID_PROJECT_STATUSES.includes(body.status)) {
    return `"status" must be one of: ${VALID_PROJECT_STATUSES.join(', ')}`
  }
  if (body.techStack !== undefined && !Array.isArray(body.techStack)) {
    return '"techStack" must be an array'
  }
  return null
}

function validateSprintBody(body, isUpdate = false) {
  if (!isUpdate) {
    const nameErr = requireString(body, 'name')
    if (nameErr) return nameErr
  }
  if (body.status !== undefined && !VALID_SPRINT_STATUSES.includes(body.status)) {
    return `"status" must be one of: ${VALID_SPRINT_STATUSES.join(', ')}`
  }
  return null
}

function validatePageBody(body, isUpdate = false) {
  if (!isUpdate) {
    const titleErr = requireString(body, 'title')
    if (titleErr) return titleErr
  }
  return null
}

// --- Auto-sync: issue Done → linked workflow nodes (#39) ---
function autoSyncLinkedWorkflowNodes(projectId, issueKey) {
  try {
    const project = db.getProject(projectId)
    if (!project?.workflow?.nodes) return
    for (const node of project.workflow.nodes) {
      if (!node.linkedIssueKeys?.includes(issueKey)) continue
      // Check if ALL linked issues are Done
      const issues = project.board?.issues || []
      const allLinkedDone = node.linkedIssueKeys.every((key) => {
        const iss = issues.find((i) => i.key === key)
        return iss && iss.status === 'Done'
      })
      if (allLinkedDone && node.status !== 'success') {
        db.updateWorkflowNode(projectId, node.id, { status: 'success' })
      }
    }
  } catch (err) {
    console.error('[AutoSync] Failed to sync workflow nodes for issue', issueKey, err.message)
  }
}

// --- Middleware ---
app.use(express.json({ limit: '10mb' }))

// Rate limiting — sliding window per IP
const RATE_LIMIT_MAX = parseInt(process.env.STORYFLOW_RATE_LIMIT_MAX, 10) || 100
const RATE_LIMIT_WINDOW_MS = parseInt(process.env.STORYFLOW_RATE_LIMIT_WINDOW_MS, 10) || 60_000
const rateLimitMap = new Map()

// Clean up stale entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [ip, timestamps] of rateLimitMap) {
    const valid = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS)
    if (valid.length === 0) rateLimitMap.delete(ip)
    else rateLimitMap.set(ip, valid)
  }
}, 5 * 60_000)

app.use('/api', (req, res, next) => {
  const ip = req.ip || req.socket.remoteAddress
  const now = Date.now()
  const timestamps = (rateLimitMap.get(ip) || []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS)

  if (timestamps.length >= RATE_LIMIT_MAX) {
    res.set('Retry-After', String(Math.ceil(RATE_LIMIT_WINDOW_MS / 1000)))
    return res.status(429).json({ error: 'Too many requests' })
  }

  timestamps.push(now)
  rateLimitMap.set(ip, timestamps)
  next()
})

// CORS — trust any localhost origin (private app), or use env override
const CUSTOM_CORS_ORIGINS = process.env.STORYFLOW_CORS_ORIGINS
  ? new Set(
      process.env.STORYFLOW_CORS_ORIGINS.split(',')
        .map((o) => o.trim())
        .filter(Boolean)
    )
  : null

function isAllowedOrigin(origin) {
  if (!origin) return false
  if (CUSTOM_CORS_ORIGINS) return CUSTOM_CORS_ORIGINS.has(origin)
  try {
    const url = new URL(origin)
    return url.hostname === 'localhost' || url.hostname === '127.0.0.1'
  } catch {
    return false
  }
}

app.use((req, res, next) => {
  const origin = req.headers.origin
  if (isAllowedOrigin(origin)) {
    res.header('Access-Control-Allow-Origin', origin)
    res.header('Vary', 'Origin')
  }
  // No Access-Control-Allow-Origin header if origin is not in allowlist —
  // browser will block the response.
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.header(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-StoryFlow-Token, X-Confirm, X-StoryFlow-Actor, X-StoryFlow-Reasoning, X-StoryFlow-Confidence, X-StoryFlow-Agent-Id, X-StoryFlow-Session-Id'
  )
  res.header('Access-Control-Max-Age', '600')
  if (req.method === 'OPTIONS') return res.sendStatus(204)
  next()
})

// Token auth — if STORYFLOW_TOKEN is set, require it on mutating requests
const AUTH_TOKEN = process.env.STORYFLOW_TOKEN || process.env.STORYFLOW_MCP_TOKEN || null

function requireToken(req, res, next) {
  if (!AUTH_TOKEN) return next() // token not configured — skip auth

  // Accept token via Authorization: Bearer <token> or X-StoryFlow-Token header
  const bearer = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.slice(7)
    : null
  const headerToken = req.headers['x-storyflow-token'] || null
  const provided = bearer || headerToken

  if (!provided) {
    return res.status(401).json({ error: 'Missing or invalid authentication token' })
  }

  // Timing-safe comparison to prevent character-by-character brute force
  const a = Buffer.from(provided)
  const b = Buffer.from(AUTH_TOKEN)
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return res.status(401).json({ error: 'Missing or invalid authentication token' })
  }
  next()
}

// Apply token auth to all mutating API routes
app.post('/api/*', requireToken)
app.put('/api/*', requireToken)
app.delete('/api/*', requireToken)

// ---------------------------------------------------------------------------
// Gate enforcement middleware — Phase 1
// Hybrid gate enforcement — blocks AI mutations on gated entities,
// requires higher confidence for high-risk actions. Humans bypass.
// ---------------------------------------------------------------------------
const ENTITY_PARAM_MAP = {
  issueId: 'issue',
  key: 'issue',
  pageId: 'page',
  sprintId: 'sprint',
  decisionId: 'decision',
  phaseId: 'phase',
  milestoneId: 'milestone',
  nodeId: 'workflow_node',
  compId: 'architecture_component',
  connId: 'connection',
}

const HIGH_RISK_PATHS = ['/restore', '/batch-update']
const HIGH_RISK_CONFIDENCE = 0.7

function enforceGates(req, res, next) {
  // Humans bypass gates
  if (req.headers['x-storyflow-actor'] !== 'ai') return next()

  const projectId = req.params.id
  if (!projectId) return next()

  // 1. Entity-specific gate check — block if pending gate exists
  for (const [param, entityType] of Object.entries(ENTITY_PARAM_MAP)) {
    const entityId = req.params[param]
    if (entityId) {
      try {
        if (hasEntityGate(projectId, entityType, entityId)) {
          return res.status(403).json({
            error: 'Blocked by pending gate',
            gated_entity: { type: entityType, id: entityId },
          })
        }
      } catch {
        // If gate check fails, don't block — fail open
      }
      break
    }
  }

  // 2. High-risk pre-flight — DELETE and dangerous paths require confidence >= 0.7
  const isHighRisk = req.method === 'DELETE' || HIGH_RISK_PATHS.some((p) => req.path.endsWith(p))
  if (isHighRisk) {
    const confidence = parseFloat(req.headers['x-storyflow-confidence'] || '0')
    if (confidence < HIGH_RISK_CONFIDENCE) {
      return res.status(403).json({
        error: `High-risk mutation requires confidence >= ${HIGH_RISK_CONFIDENCE}`,
        required_confidence: HIGH_RISK_CONFIDENCE,
        provided_confidence: confidence,
      })
    }
  }

  next()
}

// Apply gate enforcement to all mutating project routes
app.post('/api/projects/:id/*', enforceGates)
app.put('/api/projects/:id/*', enforceGates)
app.delete('/api/projects/:id/*', enforceGates)

// Project ID format validation (slug-based: lowercase alphanumeric + hyphens)
const PROJECT_ID_RE = /^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/
function validateProjectId(req, res, next) {
  const id = req.params.id
  if (id && (!PROJECT_ID_RE.test(id) || id.length > 255)) {
    return res.status(400).json({ error: 'Invalid project ID format' })
  }
  next()
}
app.param('id', validateProjectId)

// ---------------------------------------------------------------------------
// Snapshot helper
// Auto-snapshots before high-risk mutations (deletes, batch ops)
// ---------------------------------------------------------------------------
function maybeSnapshot(req, action, entityType, entityId) {
  const projectId = req.params.id
  const actor = req.headers['x-storyflow-actor'] || 'human'
  const entity = entityId ? `${entityType}:${entityId}` : entityType
  return db.createSnapshot(projectId, { action, entity, actor })
}

// --- Projects ---
app.get('/api/projects', (req, res) => {
  res.json(db.listProjects())
})

app.post('/api/projects', (req, res) => {
  const err = validateProjectBody(req.body)
  if (err) return res.status(400).json({ error: err })
  const project = db.addProject(req.body)
  const provenance = extractProvenance(req)
  const event = emitMutationEvent({
    projectId: project.id,
    provenance,
    category: 'project',
    action: 'create',
    entityType: 'project',
    entityId: project.id,
    entityTitle: project.name,
  })
  broadcastEvent(event)
  notifyClients()
  res.status(201).json(project)
})

app.get('/api/projects/:id', (req, res) => {
  const project = db.getProject(req.params.id)
  if (!project) return res.status(404).json({ error: 'Project not found' })
  res.json(project)
})

app.put('/api/projects/:id', (req, res) => {
  const err = validateProjectBody(req.body, true)
  if (err) return res.status(400).json({ error: err })
  const project = db.updateProject(req.params.id, req.body)
  if (!project) return res.status(404).json({ error: 'Project not found' })
  const provenance = extractProvenance(req)
  const event = emitMutationEvent({
    projectId: req.params.id,
    provenance,
    category: 'project',
    action: 'update',
    entityType: 'project',
    entityId: req.params.id,
    entityTitle: project.name,
    changes: Object.keys(req.body).map((k) => ({ field: k, to: req.body[k] })),
  })
  broadcastEvent(event)
  notifyClients()
  res.json(project)
})

app.delete('/api/projects/:id', (req, res) => {
  const project = db.getProject(req.params.id)
  if (!project) return res.status(404).json({ error: 'Project not found' })
  maybeSnapshot(req, 'delete_project', 'project', req.params.id)
  db.softDeleteProject(req.params.id)
  const provenance = extractProvenance(req)
  const event = emitMutationEvent({
    projectId: req.params.id,
    provenance,
    category: 'project',
    action: 'delete',
    entityType: 'project',
    entityId: req.params.id,
    entityTitle: project.name,
  })
  broadcastEvent(event)
  notifyClients()
  res.json({ success: true, message: `Project "${project.name}" deleted` })
})

// --- Board summary ---
app.get('/api/projects/:id/analytics', (req, res) => {
  const analytics = db.getProjectAnalytics(req.params.id)
  if (!analytics) return res.status(404).json({ error: 'Project not found' })
  res.json(analytics)
})

app.get('/api/projects/:id/board-summary', (req, res) => {
  const summary = db.getBoardSummary(req.params.id)
  if (!summary) return res.status(404).json({ error: 'Project not found' })
  res.json(summary)
})

// --- Context boot (agent contract — accepted schema) ---
app.get('/api/projects/:id/context', (req, res) => {
  const summary = db.getOperationalSummary(req.params.id, { includeHygiene: true })
  if (!summary) return res.status(404).json({ error: 'Project not found' })

  const status = aiStatus[req.params.id] || { status: 'idle', detail: '', updatedAt: null }
  summary.agentState = status

  const pending = checkApprovalGates(req.params.id)
  summary.pendingGatesCount = pending.length
  summary.pendingGates = pending.map((g) => ({
    id: g.id,
    entityType: g.entity_type,
    entityTitle: g.entity_title,
    reasoning: g.reasoning || null,
    confidence: g.confidence || 0,
    createdAt: g.timestamp,
  }))

  const directives = getSteeringDirectives(req.params.id)
  summary.directivesCount = directives.length
  summary.directives = directives
  summary.wiki = db.getWikiAudit(req.params.id)
  summary.lessons = db.getLessonsLearnedSummary(req.params.id)

  res.json(summary)
})

// --- Operational summary (Dashboard / Overview) ---
app.get('/api/projects/:id/operational', (req, res) => {
  const summary = db.getOperationalSummary(req.params.id)
  if (!summary) return res.status(404).json({ error: 'Project not found' })

  // Merge in-memory AI status (not in SQLite)
  const status = aiStatus[req.params.id] || { status: 'idle', detail: '', updatedAt: null }
  summary.agentState = status

  // Merge gates from events system
  const pending = checkApprovalGates(req.params.id)
  summary.pendingGatesCount = pending.length
  summary.pendingGates = pending.map((g) => ({
    id: g.id,
    entityType: g.entity_type,
    entityTitle: g.entity_title,
    reasoning: g.reasoning,
    confidence: g.confidence,
    createdAt: g.timestamp,
  }))

  // Merge unconsumed steering directives
  const directives = getSteeringDirectives(req.params.id)
  summary.directivesCount = directives.length
  summary.directives = directives

  res.json(summary)
})

// --- Cross-entity search ---
app.get('/api/projects/:id/search', (req, res) => {
  const query = (req.query.q || '').trim()
  if (!query) return res.status(400).json({ error: '"q" query parameter is required' })
  if (!db.projectExists(req.params.id)) return res.status(404).json({ error: 'Project not found' })

  const types = req.query.types ? req.query.types.split(',') : null
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100)
  const results = db.searchEntities(req.params.id, query, { types, limit })
  res.json({ query, results, total: results.length })
})

// --- Entity resolution ---
app.get('/api/projects/:id/resolve', (req, res) => {
  const type = req.query.type
  const ref = (req.query.ref || '').trim()
  if (!type || !ref)
    return res.status(400).json({ error: '"type" and "ref" query parameters are required' })
  if (!db.projectExists(req.params.id)) return res.status(404).json({ error: 'Project not found' })

  const result = db.resolveEntity(req.params.id, type, ref)
  res.json(result)
})

// --- Issues ---
app.get('/api/projects/:id/issues', (req, res) => {
  const result = db.listIssues(req.params.id, req.query)
  if (result === null) return res.status(404).json({ error: 'Project not found' })
  // Return paginated result with backward-compatible array response when no pagination params
  if (req.query.page || req.query.limit) {
    res.json(result)
  } else {
    // Legacy: return flat array for backward compatibility
    res.json(result.issues)
  }
})

app.post('/api/projects/:id/issues', (req, res) => {
  const err = validateIssueBody(req.body)
  if (err) return res.status(400).json({ error: err })
  const provenance = extractProvenance(req)

  // Server-side dedup check — SQL-based, no full-project load
  const similar = db.findSimilarIssues(req.params.id, req.body.title)
  if (similar.length > 0) {
    req._dedupWarning = {
      similar_to: similar[0].key || similar[0].id,
      similar_title: similar[0].title,
      score: similar[0].score,
    }
  }

  // Stamp provenance onto the entity itself so the UI can show badges
  const issueData = { ...req.body }
  if (provenance.actor !== 'human') {
    issueData.createdBy = provenance.actor
    issueData.createdByReasoning = provenance.reasoning
    if (provenance.confidence !== null && provenance.confidence !== undefined) {
      issueData.createdByConfidence = provenance.confidence
    }
  }
  const issue = db.addIssue(req.params.id, issueData)
  if (!issue) return res.status(404).json({ error: 'Project not found' })
  if (issue.error) return res.status(400).json({ error: issue.error })
  const event = emitMutationEvent({
    projectId: req.params.id,
    provenance,
    category: 'board',
    action: 'create',
    entityType: 'issue',
    entityId: issue.id,
    entityTitle: issue.title,
    data: { key: issue.key, type: issue.type, status: issue.status },
  })
  broadcastEvent(event)
  notifyClients()
  const response = req._dedupWarning ? { ...issue, _dedup_warning: req._dedupWarning } : issue
  res.status(201).json(response)
})

app.put('/api/projects/:id/issues/:issueId', (req, res) => {
  const err = validateIssueBody(req.body, true)
  if (err) return res.status(400).json({ error: err })
  try {
    const issue = db.updateIssue(req.params.id, req.params.issueId, req.body)
    if (!issue) return res.status(404).json({ error: 'Issue or project not found' })
    if (issue.error) return res.status(400).json({ error: issue.error })
    const provenance = extractProvenance(req)
    const action = req.body.status ? 'status_change' : 'update'
    const event = emitMutationEvent({
      projectId: req.params.id,
      provenance,
      category: 'board',
      action,
      entityType: 'issue',
      entityId: issue.id,
      entityTitle: issue.title,
      changes: Object.keys(req.body).map((k) => ({ field: k, to: req.body[k] })),
      data: { key: issue.key, type: issue.type, status: issue.status },
    })
    broadcastEvent(event)

    // #39 — Auto-update linked workflow nodes when issue moves to Done
    if (req.body.status === 'Done' && issue.key) {
      autoSyncLinkedWorkflowNodes(req.params.id, issue.key)
    }

    notifyClients()
    res.json(issue)
  } catch (e) {
    console.error('[API] Issue update failed:', e.message)
    res.status(500).json({ error: 'Issue update failed', detail: e.message })
  }
})

app.delete('/api/projects/:id/issues/:issueId', (req, res) => {
  maybeSnapshot(req, 'delete_issue', 'issue', req.params.issueId)
  const ok = db.deleteIssue(req.params.id, req.params.issueId)
  if (!ok) return res.status(404).json({ error: 'Issue or project not found' })
  const provenance = extractProvenance(req)
  const event = emitMutationEvent({
    projectId: req.params.id,
    provenance,
    category: 'board',
    action: 'delete',
    entityType: 'issue',
    entityId: req.params.issueId,
  })
  broadcastEvent(event)
  notifyClients()
  res.json({ success: true })
})

// --- Batch issue update ---
app.post('/api/projects/:id/issues/batch-update', (req, res) => {
  const { updates } = req.body
  if (!Array.isArray(updates) || updates.length === 0) {
    return res.status(400).json({ error: '"updates" must be a non-empty array' })
  }
  if (updates.length > 50) {
    return res.status(400).json({ error: 'Maximum 50 updates per batch' })
  }
  maybeSnapshot(req, 'batch_update_issues', 'batch', null)
  const provenance = extractProvenance(req)
  const results = { updated: [], errors: [] }

  for (const entry of updates) {
    const { issue_id, issue_key, ...fields } = entry
    if (!issue_id && !issue_key) {
      results.errors.push({ entry, error: 'Missing issue_id or issue_key' })
      continue
    }
    // Map snake_case fields to camelCase DB fields
    const data = {}
    if (fields.title !== undefined) data.title = fields.title
    if (fields.status !== undefined) data.status = fields.status
    if (fields.priority !== undefined) data.priority = fields.priority
    if (fields.description !== undefined) data.description = fields.description
    if (fields.story_points !== undefined) data.storyPoints = fields.story_points
    if (fields.storyPoints !== undefined) data.storyPoints = fields.storyPoints
    if (fields.epic_id !== undefined) data.epicId = fields.epic_id
    if (fields.epicId !== undefined) data.epicId = fields.epicId
    if (fields.sprint_id !== undefined) data.sprintId = fields.sprint_id
    if (fields.sprintId !== undefined) data.sprintId = fields.sprintId
    if (fields.assignee !== undefined) data.assignee = fields.assignee
    if (fields.labels !== undefined) data.labels = fields.labels

    const issue = issue_key
      ? db.updateIssueByKey(req.params.id, issue_key, data)
      : db.updateIssue(req.params.id, issue_id, data)

    if (!issue) {
      results.errors.push({
        identifier: issue_key || issue_id,
        error: 'Issue not found',
      })
    } else if (issue.error) {
      results.errors.push({ identifier: issue_key || issue_id, error: issue.error })
    } else {
      results.updated.push({ id: issue.id, key: issue.key, title: issue.title })
    }
  }

  // Emit one summary mutation event
  const event = emitMutationEvent({
    projectId: req.params.id,
    provenance,
    category: 'board',
    action: 'update',
    entityType: 'batch',
    entityTitle: `Batch update: ${results.updated.length} issues`,
    data: {
      updatedCount: results.updated.length,
      errorCount: results.errors.length,
    },
  })
  broadcastEvent(event)
  notifyClients()
  res.json(results)
})

// --- Issues by key (e.g. SCA-43) ---
app.get('/api/projects/:id/issues/by-key/:key', (req, res) => {
  const issue = db.getIssueByKey(req.params.id, req.params.key)
  if (!issue) return res.status(404).json({ error: 'Issue not found' })
  res.json(issue)
})

app.put('/api/projects/:id/issues/by-key/:key', (req, res) => {
  const err = validateIssueBody(req.body, true)
  if (err) return res.status(400).json({ error: err })
  try {
    const issue = db.updateIssueByKey(req.params.id, req.params.key, req.body)
    if (!issue) return res.status(404).json({ error: 'Issue not found' })
    if (issue.error) return res.status(400).json({ error: issue.error })
    const provenance = extractProvenance(req)
    const action = req.body.status ? 'status_change' : 'update'
    const event = emitMutationEvent({
      projectId: req.params.id,
      provenance,
      category: 'board',
      action,
      entityType: 'issue',
      entityId: issue.id,
      entityTitle: issue.title,
      changes: Object.keys(req.body).map((k) => ({ field: k, to: req.body[k] })),
      data: { key: issue.key, type: issue.type, status: issue.status },
    })
    broadcastEvent(event)

    // #39 — Auto-update linked workflow nodes when issue moves to Done
    if (req.body.status === 'Done' && issue.key) {
      autoSyncLinkedWorkflowNodes(req.params.id, issue.key)
    }

    notifyClients()
    res.json(issue)
  } catch (e) {
    console.error('[API] Issue update by key failed:', e.message)
    res.status(500).json({ error: 'Issue update failed', detail: e.message })
  }
})

app.delete('/api/projects/:id/issues/by-key/:key', (req, res) => {
  maybeSnapshot(req, 'delete_issue_by_key', 'issue', req.params.key)
  const ok = db.deleteIssueByKey(req.params.id, req.params.key)
  if (!ok) return res.status(404).json({ error: 'Issue not found' })
  const provenance = extractProvenance(req)
  const event = emitMutationEvent({
    projectId: req.params.id,
    provenance,
    category: 'board',
    action: 'delete',
    entityType: 'issue',
    entityId: req.params.key,
  })
  broadcastEvent(event)
  notifyClients()
  res.json({ success: true })
})

// --- Comments ---
app.post('/api/projects/:id/issues/:issueId/comments', (req, res) => {
  if (!req.body.body || typeof req.body.body !== 'string') {
    return res.status(400).json({ error: '"body" is required and must be a non-empty string' })
  }
  const comment = db.addComment(req.params.id, req.params.issueId, req.body)
  if (!comment) return res.status(404).json({ error: 'Issue or project not found' })
  const provenance = extractProvenance(req)
  const event = emitMutationEvent({
    projectId: req.params.id,
    provenance,
    category: 'board',
    action: 'comment',
    entityType: 'issue',
    entityId: req.params.issueId,
    entityTitle: req.body.body.slice(0, 120),
  })
  broadcastEvent(event)
  notifyClients()
  res.json(comment)
})

app.post('/api/projects/:id/issues/by-key/:key/comments', (req, res) => {
  if (!req.body.body || typeof req.body.body !== 'string') {
    return res.status(400).json({ error: '"body" is required and must be a non-empty string' })
  }
  const comment = db.addCommentByKey(req.params.id, req.params.key, req.body)
  if (!comment) return res.status(404).json({ error: 'Issue not found' })
  const provenance = extractProvenance(req)
  const event = emitMutationEvent({
    projectId: req.params.id,
    provenance,
    category: 'board',
    action: 'comment',
    entityType: 'issue',
    entityId: req.params.key,
    entityTitle: req.body.body.slice(0, 120),
  })
  broadcastEvent(event)
  notifyClients()
  res.json(comment)
})

// --- Nudge (reset staleness) ---
app.post('/api/projects/:id/issues/:issueId/nudge', (req, res) => {
  const updates = {}
  if (req.body.message) {
    updates.lastNudgeMessage = req.body.message
    updates.lastNudgeAuthor = req.body.author || 'system'
  }
  const issue = db.updateIssue(req.params.id, req.params.issueId, updates)
  if (!issue) return res.status(404).json({ error: 'Issue or project not found' })
  notifyClients()
  res.json({ success: true, issueId: issue.id, updatedAt: issue.updatedAt })
})

app.post('/api/projects/:id/issues/by-key/:key/nudge', (req, res) => {
  const updates = {}
  if (req.body.message) {
    updates.lastNudgeMessage = req.body.message
    updates.lastNudgeAuthor = req.body.author || 'system'
  }
  const issue = db.updateIssueByKey(req.params.id, req.params.key, updates)
  if (!issue) return res.status(404).json({ error: 'Issue not found' })
  notifyClients()
  res.json({ success: true, issueId: issue.id, updatedAt: issue.updatedAt })
})

// --- Sprints ---
app.get('/api/projects/:id/sprints', (req, res) => {
  const sprints = db.listSprints(req.params.id)
  if (sprints === null) return res.status(404).json({ error: 'Project not found' })
  res.json(sprints)
})

app.post('/api/projects/:id/sprints', (req, res) => {
  const err = validateSprintBody(req.body)
  if (err) return res.status(400).json({ error: err })
  const sprint = db.addSprint(req.params.id, req.body)
  if (!sprint) return res.status(404).json({ error: 'Project not found' })
  const provenance = extractProvenance(req)
  const event = emitMutationEvent({
    projectId: req.params.id,
    provenance,
    category: 'board',
    action: 'create',
    entityType: 'sprint',
    entityId: sprint.id,
    entityTitle: sprint.name,
  })
  broadcastEvent(event)
  notifyClients()
  res.status(201).json(sprint)
})

// --- Pages ---
app.get('/api/projects/:id/pages', (req, res) => {
  const pages = db.listPages(req.params.id)
  if (pages === null) return res.status(404).json({ error: 'Project not found' })
  res.json(pages)
})

app.get('/api/projects/:id/pages/:pageId', (req, res) => {
  const page = db.getPage(req.params.id, req.params.pageId)
  if (!page) return res.status(404).json({ error: 'Page or project not found' })
  res.json(page)
})

app.get('/api/projects/:id/wiki-audit', (req, res) => {
  const audit = db.getWikiAudit(req.params.id)
  if (!audit) return res.status(404).json({ error: 'Project not found' })
  res.json(audit)
})

app.post('/api/projects/:id/pages', (req, res) => {
  const err = validatePageBody(req.body)
  if (err) return res.status(400).json({ error: err })
  const provenance = extractProvenance(req)
  const pageData = { ...req.body }
  if (provenance.actor !== 'human') {
    pageData.createdBy = provenance.actor
    pageData.createdByReasoning = provenance.reasoning
  }
  const page = db.addPage(req.params.id, pageData)
  if (!page) return res.status(404).json({ error: 'Project not found' })
  const event = emitMutationEvent({
    projectId: req.params.id,
    provenance,
    category: 'wiki',
    action: 'create',
    entityType: 'page',
    entityId: page.id,
    entityTitle: page.title,
  })
  broadcastEvent(event)
  notifyClients()
  res.status(201).json(page)
})

app.put('/api/projects/:id/pages/:pageId', (req, res) => {
  const err = validatePageBody(req.body, true)
  if (err) return res.status(400).json({ error: err })
  const page = db.updatePage(req.params.id, req.params.pageId, req.body)
  if (!page) return res.status(404).json({ error: 'Page or project not found' })
  const provenance = extractProvenance(req)
  const event = emitMutationEvent({
    projectId: req.params.id,
    provenance,
    category: 'wiki',
    action: 'update',
    entityType: 'page',
    entityId: page.id,
    entityTitle: page.title,
    changes: Object.keys(req.body).map((k) => ({ field: k, to: req.body[k] })),
  })
  broadcastEvent(event)
  notifyClients()
  res.json(page)
})

app.delete('/api/projects/:id/pages/:pageId', (req, res) => {
  maybeSnapshot(req, 'delete_page', 'page', req.params.pageId)
  const ok = db.deletePage(req.params.id, req.params.pageId)
  if (!ok) return res.status(404).json({ error: 'Page or project not found' })
  const provenance = extractProvenance(req)
  const event = emitMutationEvent({
    projectId: req.params.id,
    provenance,
    category: 'wiki',
    action: 'delete',
    entityType: 'page',
    entityId: req.params.pageId,
  })
  broadcastEvent(event)
  notifyClients()
  res.json({ success: true })
})

// --- Sprint update ---
app.put('/api/projects/:id/sprints/:sprintId', (req, res) => {
  if (req.body.status !== undefined && !VALID_SPRINT_STATUSES.includes(req.body.status)) {
    return res
      .status(400)
      .json({ error: `"status" must be one of: ${VALID_SPRINT_STATUSES.join(', ')}` })
  }
  const data = {}
  if (req.body.name !== undefined) data.name = req.body.name
  if (req.body.goal !== undefined) data.goal = req.body.goal
  if (req.body.startDate !== undefined) data.startDate = req.body.startDate
  if (req.body.endDate !== undefined) data.endDate = req.body.endDate
  if (req.body.status !== undefined) data.status = req.body.status
  const sprint = db.updateSprint(req.params.id, req.params.sprintId, data)
  if (!sprint) return res.status(404).json({ error: 'Sprint or project not found' })
  const provenance = extractProvenance(req)
  const event = emitMutationEvent({
    projectId: req.params.id,
    provenance,
    category: 'board',
    action: req.body.status ? 'status_change' : 'update',
    entityType: 'sprint',
    entityId: sprint.id,
    entityTitle: sprint.name,
    changes: Object.keys(data).map((k) => ({ field: k, to: data[k] })),
  })
  broadcastEvent(event)
  notifyClients()
  res.json(sprint)
})

// --- Sprint deletion ---
app.delete('/api/projects/:id/sprints/:sprintId', (req, res) => {
  maybeSnapshot(req, 'delete_sprint', 'sprint', req.params.sprintId)
  const ok = db.deleteSprint(req.params.id, req.params.sprintId)
  if (!ok) return res.status(404).json({ error: 'Sprint or project not found' })
  const provenance = extractProvenance(req)
  const event = emitMutationEvent({
    projectId: req.params.id,
    provenance,
    category: 'board',
    action: 'delete',
    entityType: 'sprint',
    entityId: req.params.sprintId,
  })
  broadcastEvent(event)
  notifyClients()
  res.json({ success: true })
})

// --- Decisions ---
app.get('/api/projects/:id/decisions', (req, res) => {
  const decisions = db.listDecisions(req.params.id)
  if (decisions === null) return res.status(404).json({ error: 'Project not found' })
  res.json(decisions)
})

app.post('/api/projects/:id/decisions', (req, res) => {
  const titleErr = requireString(req.body, 'title')
  if (titleErr) return res.status(400).json({ error: titleErr })
  const decision = db.addDecision(req.params.id, req.body)
  if (!decision) return res.status(404).json({ error: 'Project not found' })
  const provenance = extractProvenance(req)
  const event = emitMutationEvent({
    projectId: req.params.id,
    provenance,
    category: 'project',
    action: 'create',
    entityType: 'decision',
    entityId: decision.id,
    entityTitle: decision.title,
  })
  broadcastEvent(event)
  notifyClients()
  res.status(201).json(decision)
})

app.put('/api/projects/:id/decisions/:decisionId', (req, res) => {
  const decision = db.updateDecision(req.params.id, req.params.decisionId, req.body)
  if (!decision) return res.status(404).json({ error: 'Decision or project not found' })
  const provenance = extractProvenance(req)
  const event = emitMutationEvent({
    projectId: req.params.id,
    provenance,
    category: 'project',
    action: 'update',
    entityType: 'decision',
    entityId: decision.id,
    entityTitle: decision.title,
    changes: Object.keys(req.body).map((k) => ({ field: k, to: req.body[k] })),
  })
  broadcastEvent(event)
  notifyClients()
  res.json(decision)
})

app.delete('/api/projects/:id/decisions/:decisionId', (req, res) => {
  maybeSnapshot(req, 'delete_decision', 'decision', req.params.decisionId)
  const ok = db.deleteDecision(req.params.id, req.params.decisionId)
  if (!ok) return res.status(404).json({ error: 'Decision or project not found' })
  const provenance = extractProvenance(req)
  const event = emitMutationEvent({
    projectId: req.params.id,
    provenance,
    category: 'project',
    action: 'delete',
    entityType: 'decision',
    entityId: req.params.decisionId,
  })
  broadcastEvent(event)
  notifyClients()
  res.json({ success: true })
})

// --- Timeline Phases ---
app.get('/api/projects/:id/phases', (req, res) => {
  const phases = db.listPhases(req.params.id)
  if (phases === null) return res.status(404).json({ error: 'Project not found' })
  res.json(phases)
})

app.post('/api/projects/:id/phases', (req, res) => {
  const nameErr = requireString(req.body, 'name')
  if (nameErr) return res.status(400).json({ error: nameErr })
  const phase = db.addPhase(req.params.id, req.body)
  if (!phase) return res.status(404).json({ error: 'Project not found' })
  const provenance = extractProvenance(req)
  const event = emitMutationEvent({
    projectId: req.params.id,
    provenance,
    category: 'project',
    action: 'create',
    entityType: 'phase',
    entityId: phase.id,
    entityTitle: phase.name,
  })
  broadcastEvent(event)
  notifyClients()
  res.status(201).json(phase)
})

app.put('/api/projects/:id/phases/:phaseId', (req, res) => {
  const phase = db.updatePhase(req.params.id, req.params.phaseId, req.body)
  if (!phase) return res.status(404).json({ error: 'Phase or project not found' })
  const provenance = extractProvenance(req)
  const event = emitMutationEvent({
    projectId: req.params.id,
    provenance,
    category: 'project',
    action: 'update',
    entityType: 'phase',
    entityId: phase.id,
    entityTitle: phase.name,
    changes: Object.keys(req.body).map((k) => ({ field: k, to: req.body[k] })),
  })
  broadcastEvent(event)
  notifyClients()
  res.json(phase)
})

app.delete('/api/projects/:id/phases/:phaseId', (req, res) => {
  maybeSnapshot(req, 'delete_phase', 'phase', req.params.phaseId)
  const ok = db.deletePhase(req.params.id, req.params.phaseId)
  if (!ok) return res.status(404).json({ error: 'Phase or project not found' })
  const provenance = extractProvenance(req)
  const event = emitMutationEvent({
    projectId: req.params.id,
    provenance,
    category: 'project',
    action: 'delete',
    entityType: 'phase',
    entityId: req.params.phaseId,
  })
  broadcastEvent(event)
  notifyClients()
  res.json({ success: true })
})

// --- Timeline Milestones ---
app.get('/api/projects/:id/milestones', (req, res) => {
  const milestones = db.listMilestones(req.params.id)
  if (milestones === null) return res.status(404).json({ error: 'Project not found' })
  res.json(milestones)
})

app.post('/api/projects/:id/milestones', (req, res) => {
  const nameErr = requireString(req.body, 'name')
  if (nameErr) return res.status(400).json({ error: nameErr })
  const milestone = db.addMilestone(req.params.id, req.body)
  if (!milestone) return res.status(404).json({ error: 'Project not found' })
  const provenance = extractProvenance(req)
  const event = emitMutationEvent({
    projectId: req.params.id,
    provenance,
    category: 'project',
    action: 'create',
    entityType: 'milestone',
    entityId: milestone.id,
    entityTitle: milestone.name,
  })
  broadcastEvent(event)
  notifyClients()
  res.status(201).json(milestone)
})

app.put('/api/projects/:id/milestones/:milestoneId', (req, res) => {
  const milestone = db.updateMilestone(req.params.id, req.params.milestoneId, req.body)
  if (!milestone) return res.status(404).json({ error: 'Milestone or project not found' })
  const provenance = extractProvenance(req)
  const event = emitMutationEvent({
    projectId: req.params.id,
    provenance,
    category: 'project',
    action: 'update',
    entityType: 'milestone',
    entityId: milestone.id,
    entityTitle: milestone.name,
    changes: Object.keys(req.body).map((k) => ({ field: k, to: req.body[k] })),
  })
  broadcastEvent(event)
  notifyClients()
  res.json(milestone)
})

app.delete('/api/projects/:id/milestones/:milestoneId', (req, res) => {
  maybeSnapshot(req, 'delete_milestone', 'milestone', req.params.milestoneId)
  const ok = db.deleteMilestone(req.params.id, req.params.milestoneId)
  if (!ok) return res.status(404).json({ error: 'Milestone or project not found' })
  const provenance = extractProvenance(req)
  const event = emitMutationEvent({
    projectId: req.params.id,
    provenance,
    category: 'project',
    action: 'delete',
    entityType: 'milestone',
    entityId: req.params.milestoneId,
  })
  broadcastEvent(event)
  notifyClients()
  res.json({ success: true })
})

// --- Phase Hot Wash ---

// Helper: resolve phaseId param by UUID or name
function resolvePhaseParam(req, res) {
  const projectId = req.params.id
  const raw = decodeURIComponent(req.params.phaseId)
  const resolved = db.resolvePhaseRef(projectId, raw)
  if (!resolved) {
    res.status(404).json({ error: `Phase "${raw}" not found` })
    return null
  }
  return resolved
}

app.post('/api/projects/:id/phases/:phaseId/hot-wash/generate', (req, res) => {
  const phaseId = resolvePhaseParam(req, res)
  if (!phaseId) return
  const provenance = extractProvenance(req)
  const result = db.generateHotWash(req.params.id, phaseId, {
    generatedBy: provenance.actor || 'ai',
    overrides: req.body || {},
  })
  if (!result) return res.status(404).json({ error: 'Phase or project not found' })
  if (result.error) return res.status(409).json({ error: result.error })
  const event = emitMutationEvent({
    projectId: req.params.id,
    provenance,
    category: 'timeline',
    action: 'create',
    entityType: 'hot_wash',
    entityId: result.id,
    entityTitle: `Hot wash for phase ${phaseId}`,
  })
  broadcastEvent(event)
  notifyClients()
  res.status(201).json(result)
})

app.get('/api/projects/:id/phases/:phaseId/hot-wash', (req, res) => {
  const phaseId = resolvePhaseParam(req, res)
  if (!phaseId) return
  const hw = db.getHotWash(req.params.id, phaseId)
  if (!hw) return res.status(404).json({ error: 'No hot wash for this phase' })
  res.json(hw)
})

app.put('/api/projects/:id/phases/:phaseId/hot-wash', (req, res) => {
  const phaseId = resolvePhaseParam(req, res)
  if (!phaseId) return
  const result = db.updateHotWash(req.params.id, phaseId, req.body)
  if (!result) return res.status(404).json({ error: 'No hot wash for this phase' })
  if (result.error) return res.status(400).json({ error: result.error })
  notifyClients()
  res.json(result)
})

app.post('/api/projects/:id/phases/:phaseId/hot-wash/finalize', (req, res) => {
  const phaseId = resolvePhaseParam(req, res)
  if (!phaseId) return
  const provenance = extractProvenance(req)
  const result = db.finalizeHotWash(req.params.id, phaseId, {
    finalizedBy: provenance.actor || 'human',
  })
  if (!result) return res.status(404).json({ error: 'No hot wash for this phase' })
  if (result.error) return res.status(400).json({ error: result.error })
  const event = emitMutationEvent({
    projectId: req.params.id,
    provenance,
    category: 'timeline',
    action: 'update',
    entityType: 'hot_wash',
    entityId: result.id,
    entityTitle: `Finalized hot wash`,
  })
  broadcastEvent(event)
  notifyClients()
  res.json(result)
})

app.delete('/api/projects/:id/phases/:phaseId/hot-wash', (req, res) => {
  const phaseId = resolvePhaseParam(req, res)
  if (!phaseId) return
  const result = db.deleteHotWash(req.params.id, phaseId)
  if (!result) return res.status(404).json({ error: 'No hot wash for this phase' })
  if (result.error) return res.status(400).json({ error: result.error })
  const provenance = extractProvenance(req)
  const event = emitMutationEvent({
    projectId: req.params.id,
    provenance,
    category: 'timeline',
    action: 'delete',
    entityType: 'hot_wash',
    entityId: result.deletedId,
    entityTitle: `Deleted hot wash for phase ${phaseId}`,
  })
  broadcastEvent(event)
  notifyClients()
  res.json(result)
})

app.get('/api/projects/:id/hot-washes', (req, res) => {
  const list = db.listHotWashes(req.params.id)
  res.json(list)
})

app.get('/api/projects/:id/lessons-learned', (req, res) => {
  const summary = db.getLessonsLearnedSummary(req.params.id, { syncPage: true })
  if (!summary) return res.status(404).json({ error: 'Project not found' })
  res.json(summary)
})

// --- Agent Sessions ---
app.post('/api/projects/:id/sessions', (req, res) => {
  const session = db.saveSessionSummary(req.params.id, req.body)
  const provenance = extractProvenance(req)
  const event = emitMutationEvent({
    projectId: req.params.id,
    provenance,
    category: 'system',
    action: 'create',
    entityType: 'session',
    entityId: session.id,
    entityTitle: (req.body.summary || 'Agent session').slice(0, 120),
  })
  broadcastEvent(event)
  res.status(201).json(session)
})

app.get('/api/projects/:id/sessions/latest', (req, res) => {
  const session = db.getLastSession(req.params.id)
  if (!session) return res.json({ message: 'No previous sessions found' })
  res.json(session)
})

app.get('/api/projects/:id/sessions', (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10
  const sessions = db.listSessions(req.params.id, limit)
  res.json(sessions)
})

// --- Events API ---
app.get('/api/projects/:id/events', (req, res) => {
  const events = queryEvents(req.params.id, {
    category: req.query.category,
    actor: req.query.actor,
    entity_type: req.query.entity_type,
    entity_id: req.query.entity_id,
    since: req.query.since,
    before: req.query.before,
    action: req.query.action,
    limit: req.query.limit ? parseInt(req.query.limit, 10) : undefined,
    offset: req.query.offset ? parseInt(req.query.offset, 10) : undefined,
  })
  res.json(events)
})

app.post('/api/projects/:id/events', (req, res) => {
  const event = recordEvent({ ...req.body, project_id: req.params.id })
  if (event.error) return res.status(400).json({ error: event.error })
  broadcastEvent(event)
  res.status(201).json(event)
})

app.post('/api/projects/:id/events/:eventId/respond', (req, res) => {
  if (!req.body.action || !['approve', 'reject', 'redirect'].includes(req.body.action)) {
    return res.status(400).json({ error: '"action" must be approve, reject, or redirect' })
  }
  const event = respondToEvent(req.params.eventId, req.body)
  if (!event) return res.status(404).json({ error: 'Event not found' })

  // Phase 5: Record the response as a causal child of the original event
  const responseEvent = recordEvent({
    project_id: req.params.id,
    actor: 'human',
    category: event.category || 'system',
    action: req.body.action,
    entity_type: event.entity_type,
    entity_id: event.entity_id,
    entity_title: `${req.body.action}: ${(event.entity_title || '').slice(0, 100)}`,
    data: { comment: req.body.comment || null, original_event_id: req.params.eventId },
    parent_event_id: req.params.eventId,
  })

  broadcastEvent(event)
  broadcastEvent(responseEvent)
  // Broadcast gate status change for real-time UI updates
  if (event.status) {
    broadcastGateUpdate({
      projectId: req.params.id,
      eventId: req.params.eventId,
      status: event.status,
    })
  }
  res.json(event)
})

// --- Approval Gates ---
app.get('/api/projects/:id/gates', (req, res) => {
  const rawPending = checkApprovalGates(req.params.id)
  const rawRejected = getRejectedEvents(req.params.id, req.query.since)

  // Normalize for UI consumption — stable shape across page refreshes
  const mapGate = (g) => ({
    id: g.id,
    entityType: g.entity_type,
    entityId: g.entity_id,
    entityTitle: g.entity_title,
    category: g.category,
    action: g.action,
    reasoning: g.reasoning || null,
    confidence: g.confidence || null,
    actor: g.actor,
    status: g.status,
    createdAt: g.timestamp,
    data: g.data || {},
  })

  res.json({
    pending: rawPending.map(mapGate),
    rejected: rawRejected.map(mapGate),
    pendingCount: rawPending.length,
    rejectedCount: rawRejected.length,
  })
})

// --- Snapshots — Phase 3 ---
app.get('/api/projects/:id/snapshots', (req, res) => {
  const snapshots = db.listSnapshots(req.params.id)
  res.json(snapshots)
})

app.post('/api/projects/:id/snapshots/:snapshotId/restore', (req, res) => {
  if (req.headers['x-confirm'] !== 'restore') {
    return res.status(400).json({ error: 'Restore requires X-Confirm: restore header' })
  }
  const project = db.restoreSnapshot(req.params.id, req.params.snapshotId)
  if (!project) return res.status(404).json({ error: 'Snapshot not found' })
  const provenance = extractProvenance(req)
  const event = emitMutationEvent({
    projectId: req.params.id,
    provenance,
    category: 'system',
    action: 'update',
    entityType: 'snapshot',
    entityId: req.params.snapshotId,
    entityTitle: 'Project restored from snapshot',
    data: { snapshot_id: req.params.snapshotId },
  })
  broadcastEvent(event)
  notifyClients()
  res.json({ restored: true, snapshot_id: req.params.snapshotId, project })
})

// --- Event Cleanup ---
app.delete('/api/projects/:id/events/cleanup', (req, res) => {
  const days = parseInt(req.query.retention_days, 10) || 90
  if (days < 1 || days > 3650) {
    return res.status(400).json({ error: 'retention_days must be between 1 and 3650' })
  }
  const result = cleanupOldEvents(req.params.id, days)
  res.json(result)
})

// --- AI Status ---
const aiStatus = {}

app.get('/api/projects/:id/ai-status', (req, res) => {
  res.json(aiStatus[req.params.id] || { status: 'idle', detail: '', updatedAt: null })
})

app.post('/api/projects/:id/ai-status', (req, res) => {
  const { status, detail } = req.body
  if (!status || !['working', 'idle', 'blocked'].includes(status)) {
    return res.status(400).json({ error: '"status" must be working, idle, or blocked' })
  }
  aiStatus[req.params.id] = {
    status,
    detail: detail || '',
    updatedAt: new Date().toISOString(),
  }
  broadcastAiStatus({ projectId: req.params.id, ...aiStatus[req.params.id] })
  res.json(aiStatus[req.params.id])
})

// --- Steering ---
app.post('/api/projects/:id/steer', (req, res) => {
  if (!req.body.text || typeof req.body.text !== 'string' || !req.body.text.trim()) {
    return res.status(400).json({ error: '"text" is required and must be a non-empty string' })
  }
  const directive = addSteeringDirective(req.params.id, {
    text: req.body.text.trim(),
    priority: req.body.priority,
    context: req.body.context,
  })

  // Phase 4: Auto-unblock agent when human sends a steering directive while blocked
  if (aiStatus[req.params.id]?.status === 'blocked') {
    aiStatus[req.params.id] = {
      status: 'idle',
      detail: 'Unblocked by steering directive',
      updatedAt: new Date().toISOString(),
    }
    broadcastAiStatus({ projectId: req.params.id, ...aiStatus[req.params.id] })
  }

  res.status(201).json(directive)
})

app.get('/api/projects/:id/steering-queue', (req, res) => {
  const consume = req.query.consume === 'true'
  const directives = getSteeringDirectives(req.params.id, { consume })
  res.json(directives)
})

app.post('/api/projects/:id/steering-queue/:directiveId/acknowledge', (req, res) => {
  const directive = acknowledgeDirective(req.params.id, req.params.directiveId)
  if (!directive) return res.status(404).json({ error: 'Directive not found' })
  res.json(directive)
})

// --- Board Hygiene ---
app.get('/api/projects/:id/hygiene', (req, res) => {
  if (!db.projectExists(req.params.id)) return res.status(404).json({ error: 'Project not found' })
  // SQL-based hygiene — no full-project load
  const summary = db.getHygieneSummary(req.params.id)
  res.json({ findings: summary.findings, ...summary })
})

// --- Title dedup check ---
app.post('/api/projects/:id/check-duplicate', (req, res) => {
  if (!req.body.title) return res.status(400).json({ error: '"title" is required' })
  if (!db.projectExists(req.params.id)) return res.status(404).json({ error: 'Project not found' })
  const similar = db.findSimilarIssues(req.params.id, req.body.title)
  res.json({
    isDuplicate: similar.length > 0,
    matches: similar.map((s) => ({
      issue: { key: s.key, id: s.id, title: s.title },
      score: s.score / 100,
    })),
  })
})

// --- Workflow nodes ---

app.get('/api/projects/:id/workflow/nodes', (req, res) => {
  const nodes = db.listWorkflowNodes(req.params.id)
  if (nodes === null) return res.status(404).json({ error: 'Project not found' })
  res.json(nodes)
})

app.get('/api/projects/:id/workflow/nodes/:nodeId', (req, res) => {
  const node = db.getWorkflowNode(req.params.id, req.params.nodeId)
  if (!node) return res.status(404).json({ error: 'Node not found' })
  res.json(node)
})

app.post('/api/projects/:id/workflow/nodes', (req, res) => {
  const node = db.addWorkflowNode(req.params.id, req.body)
  if (!node) return res.status(404).json({ error: 'Project not found' })
  const provenance = extractProvenance(req)
  const event = emitMutationEvent({
    projectId: req.params.id,
    provenance,
    category: 'workflow',
    action: 'create',
    entityType: 'workflow_node',
    entityId: node.id,
    entityTitle: node.title || node.id,
  })
  broadcastEvent(event)
  notifyClients()
  res.status(201).json(node)
})

app.put('/api/projects/:id/workflow/nodes/:nodeId', (req, res) => {
  const result = db.updateWorkflowNode(req.params.id, req.params.nodeId, req.body)
  if (!result) return res.status(404).json({ error: 'Node not found' })
  if (result.error) return res.status(400).json({ error: result.error })
  const provenance = extractProvenance(req)
  const event = emitMutationEvent({
    projectId: req.params.id,
    provenance,
    category: 'workflow',
    action: 'update',
    entityType: 'workflow_node',
    entityId: req.params.nodeId,
    entityTitle: result.title || req.params.nodeId,
    changes: Object.keys(req.body).map((k) => ({ field: k, to: req.body[k] })),
  })
  broadcastEvent(event)
  notifyClients()
  res.json(result)
})

app.delete('/api/projects/:id/workflow/nodes/:nodeId', (req, res) => {
  const ok = db.deleteWorkflowNode(req.params.id, req.params.nodeId)
  if (!ok) return res.status(404).json({ error: 'Node not found' })
  const provenance = extractProvenance(req)
  const event = emitMutationEvent({
    projectId: req.params.id,
    provenance,
    category: 'workflow',
    action: 'delete',
    entityType: 'workflow_node',
    entityId: req.params.nodeId,
  })
  broadcastEvent(event)
  notifyClients()
  res.json({ ok: true })
})

app.post('/api/projects/:id/workflow/nodes/:nodeId/link', (req, res) => {
  const { issueKey } = req.body
  if (!issueKey) return res.status(400).json({ error: 'issueKey is required' })
  const node = db.linkIssueToWorkflowNode(req.params.id, req.params.nodeId, issueKey)
  if (!node) return res.status(404).json({ error: 'Node not found' })
  const provenance = extractProvenance(req)
  const event = emitMutationEvent({
    projectId: req.params.id,
    provenance,
    category: 'workflow',
    action: 'link',
    entityType: 'workflow_node',
    entityId: req.params.nodeId,
    entityTitle: `${node.title || req.params.nodeId} ← ${issueKey}`,
  })
  broadcastEvent(event)
  notifyClients()
  res.json(node)
})

app.post('/api/projects/:id/workflow/nodes/:nodeId/unlink', (req, res) => {
  const { issueKey } = req.body
  if (!issueKey) return res.status(400).json({ error: 'issueKey is required' })
  const node = db.unlinkIssueFromWorkflowNode(req.params.id, req.params.nodeId, issueKey)
  if (!node) return res.status(404).json({ error: 'Node not found' })
  notifyClients()
  res.json(node)
})

// --- Architecture components ---

app.get('/api/projects/:id/architecture/components', (req, res) => {
  const comps = db.listArchitectureComponents(req.params.id)
  if (comps === null) return res.status(404).json({ error: 'Project not found' })
  res.json(comps)
})

app.get('/api/projects/:id/architecture/components/:compId', (req, res) => {
  const comp = db.getArchitectureComponent(req.params.id, req.params.compId)
  if (!comp) return res.status(404).json({ error: 'Component not found' })
  res.json(comp)
})

app.post('/api/projects/:id/architecture/components', (req, res) => {
  const comp = db.addArchitectureComponent(req.params.id, req.body)
  if (!comp) return res.status(404).json({ error: 'Project not found' })
  const provenance = extractProvenance(req)
  const event = emitMutationEvent({
    projectId: req.params.id,
    provenance,
    category: 'project',
    action: 'create',
    entityType: 'architecture_component',
    entityId: comp.id,
    entityTitle: comp.name || comp.id,
  })
  broadcastEvent(event)
  notifyClients()
  res.status(201).json(comp)
})

app.put('/api/projects/:id/architecture/components/:compId', (req, res) => {
  const comp = db.updateArchitectureComponent(req.params.id, req.params.compId, req.body)
  if (!comp) return res.status(404).json({ error: 'Component not found' })
  const provenance = extractProvenance(req)
  const event = emitMutationEvent({
    projectId: req.params.id,
    provenance,
    category: 'project',
    action: 'update',
    entityType: 'architecture_component',
    entityId: req.params.compId,
    entityTitle: comp.name || req.params.compId,
    changes: Object.keys(req.body).map((k) => ({ field: k, to: req.body[k] })),
  })
  broadcastEvent(event)
  notifyClients()
  res.json(comp)
})

app.delete('/api/projects/:id/architecture/components/:compId', (req, res) => {
  const ok = db.deleteArchitectureComponent(req.params.id, req.params.compId)
  if (!ok) return res.status(404).json({ error: 'Component not found' })
  const provenance = extractProvenance(req)
  const event = emitMutationEvent({
    projectId: req.params.id,
    provenance,
    category: 'project',
    action: 'delete',
    entityType: 'architecture_component',
    entityId: req.params.compId,
  })
  broadcastEvent(event)
  notifyClients()
  res.json({ ok: true })
})

// --- Workflow connections (edges) ---

app.get('/api/projects/:id/workflow/connections', (req, res) => {
  const conns = db.listWorkflowConnections(req.params.id)
  res.json(conns)
})

app.post('/api/projects/:id/workflow/connections', (req, res) => {
  const { fromNodeId, toNodeId, type } = req.body
  if (!fromNodeId || !toNodeId)
    return res.status(400).json({ error: '"fromNodeId" and "toNodeId" are required' })
  const result = db.addWorkflowConnection(req.params.id, { fromNodeId, toNodeId, type })
  if (!result) return res.status(404).json({ error: 'Project not found' })
  if (result.error) return res.status(400).json({ error: result.error })
  notifyClients()
  res.status(201).json(result)
})

app.delete('/api/projects/:id/workflow/connections/:connId', (req, res) => {
  const ok = db.deleteWorkflowConnection(req.params.id, req.params.connId)
  if (!ok) return res.status(404).json({ error: 'Connection not found' })
  notifyClients()
  res.json({ success: true })
})

// --- Architecture connections (edges) ---

app.get('/api/projects/:id/architecture/connections', (req, res) => {
  const conns = db.listArchConnections(req.params.id)
  res.json(conns)
})

app.post('/api/projects/:id/architecture/connections', (req, res) => {
  const { fromComponentId, toComponentId, type } = req.body
  if (!fromComponentId || !toComponentId)
    return res.status(400).json({ error: '"fromComponentId" and "toComponentId" are required' })
  const result = db.addArchConnection(req.params.id, { fromComponentId, toComponentId, type })
  if (!result) return res.status(404).json({ error: 'Project not found' })
  if (result.error) return res.status(400).json({ error: result.error })
  notifyClients()
  res.status(201).json(result)
})

app.delete('/api/projects/:id/architecture/connections/:connId', (req, res) => {
  const ok = db.deleteArchConnection(req.params.id, req.params.connId)
  if (!ok) return res.status(404).json({ error: 'Connection not found' })
  notifyClients()
  res.json({ success: true })
})

// --- Agent Package (workspace-scoped, not per-project) ---
import {
  existsSync as fsExists,
  readFileSync as fsRead,
  readdirSync as fsReaddir,
  statSync as fsStat,
  mkdirSync as fsMkdir,
  writeFileSync as fsWrite,
  chmodSync as fsChmod,
} from 'node:fs'
import { execFileSync as fsExecFile } from 'node:child_process'

const AGENT_DIR = join(process.cwd(), 'agent')
const AGENT_MEMORY_DB = join(AGENT_DIR, 'memory.db')
const AGENT_CONFIG = join(AGENT_DIR, 'config.json')
const AGENT_CLAUDE_SETTINGS = join(process.cwd(), '.claude', 'settings.local.json')

function readClaudeHookSettings() {
  if (!fsExists(AGENT_CLAUDE_SETTINGS)) return null
  try {
    return JSON.parse(fsRead(AGENT_CLAUDE_SETTINGS, 'utf-8'))
  } catch {
    return null
  }
}

function hasInstalledAgentHooks(settings) {
  return !!settings?.hooks && Object.keys(settings.hooks).length > 0
}

app.get('/api/agent/status', (req, res) => {
  const packagePresent = fsExists(AGENT_DIR) && fsExists(join(AGENT_DIR, 'CLAUDE.md'))
  const memoryDbPresent = fsExists(AGENT_MEMORY_DB)
  const configPresent = fsExists(AGENT_CONFIG)

  let config = null
  if (configPresent) {
    try {
      config = JSON.parse(fsRead(AGENT_CONFIG, 'utf-8'))
    } catch {
      /* corrupt */
    }
  }

  let hookCount = 0
  const hooksDir = join(AGENT_DIR, 'hooks')
  if (fsExists(hooksDir)) {
    hookCount = fsReaddir(hooksDir).filter((f) => f.endsWith('.sh')).length
  }
  const claudeSettings = readClaudeHookSettings()
  const hooksInstalled = hasInstalledAgentHooks(claudeSettings)

  let kbCount = 0
  const kbDir = join(AGENT_DIR, 'kb')
  if (fsExists(kbDir)) {
    const count = (dir) => {
      let n = 0
      for (const e of fsReaddir(dir)) {
        const full = join(dir, e)
        try {
          n += fsStat(full).isDirectory() ? count(full) : 1
        } catch {
          /* skip */
        }
      }
      return n
    }
    kbCount = count(kbDir)
  }

  // Overall health state for UI rendering
  let health = 'missing'
  if (packagePresent && memoryDbPresent && hookCount > 0 && hooksInstalled) health = 'healthy'
  else if (packagePresent) health = 'warning'

  res.json({
    health,
    packagePresent,
    memoryDbPresent,
    configPresent,
    config,
    hookCount,
    hooksInstalled,
    kbCount,
  })
})

app.get('/api/agent/doctor', (req, res) => {
  const checks = []

  // 1. Package presence (workspace-level)
  const pkgPresent = fsExists(AGENT_DIR) && fsExists(join(AGENT_DIR, 'CLAUDE.md'))
  checks.push({
    name: 'Agent package present',
    pass: pkgPresent,
    level: 'workspace',
    detail: pkgPresent ? `Found at ${AGENT_DIR}` : 'agent/ directory missing',
    fix: pkgPresent ? null : 'Run: storyflow agent init',
  })

  // 2. Memory DB (workspace-level)
  checks.push({
    name: 'Memory DB',
    pass: fsExists(AGENT_MEMORY_DB),
    level: 'workspace',
    fix: fsExists(AGENT_MEMORY_DB) ? null : 'Run: storyflow agent init',
  })

  // 3. Config (workspace-level)
  const configOk = fsExists(AGENT_CONFIG)
  let configData = null
  if (configOk) {
    try {
      configData = JSON.parse(fsRead(AGENT_CONFIG, 'utf-8'))
    } catch {
      /* corrupt */
    }
  }
  checks.push({
    name: 'Config file',
    pass: configOk && !!configData,
    level: 'workspace',
    detail: configData ? `v${configData.version}` : null,
    fix: configOk ? null : 'Run: storyflow agent init',
  })

  // 4. Hooks (workspace-level)
  const hooksDir = join(AGENT_DIR, 'hooks')
  let hookCount = 0
  if (fsExists(hooksDir)) {
    hookCount = fsReaddir(hooksDir).filter((f) => f.endsWith('.sh')).length
  }
  checks.push({
    name: 'Hook files',
    pass: hookCount > 0,
    level: 'workspace',
    detail: hookCount > 0 ? `${hookCount} hook(s)` : 'No hooks',
    fix: hookCount > 0 ? null : 'Run: storyflow agent install-hooks',
  })

  const claudeSettings = readClaudeHookSettings()
  const hooksInstalled = hasInstalledAgentHooks(claudeSettings)
  checks.push({
    name: 'Hooks installed',
    pass: hooksInstalled,
    level: 'workspace',
    detail: hooksInstalled ? 'Registered in .claude/settings.local.json' : 'Not installed',
    fix: hooksInstalled ? null : 'Run: storyflow agent install-hooks',
  })

  // 5. Server connectivity (workspace-level — always true if this endpoint is reachable)
  checks.push({ name: 'StoryFlow server', pass: true, level: 'workspace', detail: 'Responding' })

  // 6. Project-aware checks (optional, if projectId provided)
  const projectId = req.query.projectId
  if (projectId) {
    // Context boot check
    try {
      const summary = db.getOperationalSummary(projectId, { includeHygiene: true })
      checks.push({
        name: 'Context boot',
        pass: !!summary,
        level: 'project',
        detail: summary ? `Project: ${summary.project.name}` : 'Failed',
      })
    } catch (e) {
      checks.push({ name: 'Context boot', pass: false, level: 'project', detail: e.message })
    }

    // Default project resolution
    checks.push({
      name: 'Project resolution',
      pass: true,
      level: 'project',
      detail: `Resolved: ${projectId}`,
    })
  }

  const failCount = checks.filter((c) => !c.pass).length
  res.json({ checks, failCount, timestamp: new Date().toISOString() })
})

app.post('/api/agent/init', (req, res) => {
  const force = req.body?.force === true
  const exists = fsExists(AGENT_DIR) && fsExists(join(AGENT_DIR, 'CLAUDE.md'))
  if (exists && !force) {
    return res.json({ alreadyExists: true, created: [] })
  }

  // Delegate to CLI — safest way to reuse the scaffold logic
  try {
    const args = ['agent', 'init', '--json']
    if (force) args.push('--force')
    const cliPath = join(process.cwd(), 'cli', 'bin', 'storyflow.js')
    const result = fsExecFile('node', [cliPath, ...args], {
      cwd: process.cwd(),
      stdio: 'pipe',
      timeout: 10000,
    })
    const parsed = JSON.parse(result.toString())
    res.status(201).json(parsed)
  } catch (e) {
    res.status(500).json({ error: 'Init failed', detail: e.message })
  }
})

app.post('/api/agent/install-hooks', (req, res) => {
  const hooksDir = join(AGENT_DIR, 'hooks')
  if (!fsExists(hooksDir)) {
    return res.status(400).json({ error: 'agent/hooks/ not found. Run init first.' })
  }

  const installed = []
  const files = fsReaddir(hooksDir).filter((f) => f.endsWith('.sh'))
  for (const file of files) {
    fsChmod(join(hooksDir, file), 0o755)
    installed.push(file)
  }

  // Write .claude/settings.local.json with hook entries
  const claudeDir = join(process.cwd(), '.claude')
  if (!fsExists(claudeDir)) fsMkdir(claudeDir, { recursive: true })
  const settingsPath = join(claudeDir, 'settings.local.json')
  let settings = {}
  if (fsExists(settingsPath)) {
    try {
      settings = JSON.parse(fsRead(settingsPath, 'utf-8'))
    } catch {
      settings = {}
    }
  }
  const absHooksDir = join(process.cwd(), 'agent', 'hooks')
  const hookConfig = {}
  if (files.includes('session-start.sh'))
    hookConfig.SessionStart = [
      {
        matcher: '*',
        hooks: [
          {
            type: 'command',
            command: `bash ${join(absHooksDir, 'session-start.sh')}`,
            timeout: 15,
          },
        ],
      },
    ]
  if (files.includes('pre-mutation.sh'))
    hookConfig.PreToolUse = [
      {
        matcher: 'Bash',
        hooks: [
          { type: 'command', command: `bash ${join(absHooksDir, 'pre-mutation.sh')}`, timeout: 10 },
        ],
      },
    ]
  if (files.includes('post-mutation.sh'))
    hookConfig.PostToolUse = [
      {
        matcher: 'Bash',
        hooks: [
          {
            type: 'command',
            command: `bash ${join(absHooksDir, 'post-mutation.sh')}`,
            timeout: 10,
          },
        ],
      },
    ]
  if (files.includes('session-stop.sh'))
    hookConfig.Stop = [
      {
        matcher: '*',
        hooks: [
          { type: 'command', command: `bash ${join(absHooksDir, 'session-stop.sh')}`, timeout: 5 },
        ],
      },
    ]
  settings.hooks = hookConfig
  fsWrite(settingsPath, JSON.stringify(settings, null, 2))
  installed.push('.claude/settings.local.json')

  // Write manifest
  const manifest = {
    description: 'StoryFlow Agent hooks — installed',
    installedAt: new Date().toISOString(),
    settingsPath,
  }
  fsWrite(join(hooksDir, 'manifest.json'), JSON.stringify(manifest, null, 2))
  installed.push('manifest.json')

  res.json({ installed, settingsPath })
})

// --- Catch-all for production SPA serving ---
// In dev, Vite middleware (mounted in index.js) handles this instead.
import { existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DIST_DIR = join(__dirname, '../dist')

if (process.env.NODE_ENV === 'production' && existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR))
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(join(DIST_DIR, 'index.html'))
    }
  })
}

// --- Error handler ---
app.use((err, req, res, _next) => {
  console.error('[API]', err)
  // Never leak internal error details to client
  res.status(500).json({ error: 'Internal server error' })
})

export default app
