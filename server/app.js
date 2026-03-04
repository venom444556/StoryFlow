// ---------------------------------------------------------------------------
// Express REST API for StoryFlow
// Same endpoints as the old Vite plugin, backed by SQLite via db.js
// ---------------------------------------------------------------------------

import express from 'express'
import { timingSafeEqual } from 'node:crypto'
import * as db from './db.js'
import { withProjectLock } from './db.js'
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
// const VALID_ISSUE_STATUSES = ['To Do', 'In Progress', 'Done']
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

function validateSprintBody(body) {
  const nameErr = requireString(body, 'name')
  if (nameErr) return nameErr
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

app.use((req, res, next) => {
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

// CORS — strict origin allowlist (no wildcard)
const ALLOWED_ORIGINS = new Set(
  (
    process.env.STORYFLOW_CORS_ORIGINS ||
    'http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001'
  )
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean)
)

app.use((req, res, next) => {
  const origin = req.headers.origin
  if (origin && ALLOWED_ORIGINS.has(origin)) {
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

// Token auth — if STORYFLOW_MCP_TOKEN is set, require it on mutating requests
const AUTH_TOKEN = process.env.STORYFLOW_MCP_TOKEN || null

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

// --- Sync endpoint (destructive: replaces all projects) ---
app.post('/api/sync', (req, res) => {
  // Require explicit confirmation header for this destructive operation
  if (req.headers['x-confirm'] !== 'overwrite-all') {
    return res.status(400).json({
      error: 'Sync replaces all data. Set header X-Confirm: overwrite-all to proceed.',
    })
  }
  if (req.body.projects) {
    db.syncAll(req.body.projects)
    return res.json({ success: true, count: req.body.projects.length })
  }
  res.status(400).json({ error: 'Missing projects array' })
})

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
  withProjectLock(req.params.id, () => {
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
})

// --- Board summary ---
app.get('/api/projects/:id/board-summary', (req, res) => {
  const summary = db.getBoardSummary(req.params.id)
  if (!summary) return res.status(404).json({ error: 'Project not found' })
  res.json(summary)
})

// --- Issues ---
app.get('/api/projects/:id/issues', (req, res) => {
  const issues = db.listIssues(req.params.id, req.query)
  if (issues === null) return res.status(404).json({ error: 'Project not found' })
  res.json(issues)
})

app.post('/api/projects/:id/issues', (req, res) => {
  const err = validateIssueBody(req.body)
  if (err) return res.status(400).json({ error: err })
  withProjectLock(req.params.id, () => {
    const provenance = extractProvenance(req)

    // Server-side dedup check — warn on near-matches but don't block
    const project = db.getProject(req.params.id)
    if (project) {
      const existingIssues = project.board?.issues || []
      const dedup = checkTitleDuplication(req.body.title, existingIssues)
      if (dedup.isDuplicate) {
        const topMatch = dedup.matches[0]
        // Include a dedup_warning in the response (non-blocking)
        req._dedupWarning = {
          similar_to: topMatch.issue.key || topMatch.issue.id,
          similar_title: topMatch.issue.title,
          score: Math.round(topMatch.score * 100),
        }
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
})

app.put('/api/projects/:id/issues/:issueId', (req, res) => {
  const err = validateIssueBody(req.body, true)
  if (err) return res.status(400).json({ error: err })
  withProjectLock(req.params.id, () => {
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
    notifyClients()
    res.json(issue)
  })
})

app.delete('/api/projects/:id/issues/:issueId', (req, res) => {
  withProjectLock(req.params.id, () => {
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
  withProjectLock(req.params.id, () => {
    const provenance = extractProvenance(req)
    const results = { updated: [], errors: [] }

    for (const entry of updates) {
      const { issue_id, issue_key, ...fields } = entry
      if (!issue_id && !issue_key) {
        results.errors.push({ entry, error: 'Missing issue_id or issue_key' })
        continue
      }
      // Map snake_case MCP fields to camelCase DB fields
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
  withProjectLock(req.params.id, () => {
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
    notifyClients()
    res.json(issue)
  })
})

app.delete('/api/projects/:id/issues/by-key/:key', (req, res) => {
  withProjectLock(req.params.id, () => {
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
})

// --- Comments ---
app.post('/api/projects/:id/issues/:issueId/comments', (req, res) => {
  if (!req.body.body || typeof req.body.body !== 'string') {
    return res.status(400).json({ error: '"body" is required and must be a non-empty string' })
  }
  withProjectLock(req.params.id, () => {
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
})

app.post('/api/projects/:id/issues/by-key/:key/comments', (req, res) => {
  if (!req.body.body || typeof req.body.body !== 'string') {
    return res.status(400).json({ error: '"body" is required and must be a non-empty string' })
  }
  withProjectLock(req.params.id, () => {
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
})

// --- Nudge (reset staleness) ---
app.post('/api/projects/:id/issues/:issueId/nudge', (req, res) => {
  withProjectLock(req.params.id, () => {
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
})

app.post('/api/projects/:id/issues/by-key/:key/nudge', (req, res) => {
  withProjectLock(req.params.id, () => {
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
  withProjectLock(req.params.id, () => {
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

app.post('/api/projects/:id/pages', (req, res) => {
  const err = validatePageBody(req.body)
  if (err) return res.status(400).json({ error: err })
  withProjectLock(req.params.id, () => {
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
})

app.put('/api/projects/:id/pages/:pageId', (req, res) => {
  const err = validatePageBody(req.body, true)
  if (err) return res.status(400).json({ error: err })
  withProjectLock(req.params.id, () => {
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
})

app.delete('/api/projects/:id/pages/:pageId', (req, res) => {
  withProjectLock(req.params.id, () => {
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
})

// --- Sprint update ---
app.put('/api/projects/:id/sprints/:sprintId', (req, res) => {
  if (req.body.status !== undefined && !VALID_SPRINT_STATUSES.includes(req.body.status)) {
    return res
      .status(400)
      .json({ error: `"status" must be one of: ${VALID_SPRINT_STATUSES.join(', ')}` })
  }
  withProjectLock(req.params.id, () => {
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
})

// --- Sprint deletion ---
app.delete('/api/projects/:id/sprints/:sprintId', (req, res) => {
  withProjectLock(req.params.id, () => {
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
  broadcastEvent(event)
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
  const pending = checkApprovalGates(req.params.id)
  const rejected = getRejectedEvents(req.params.id, req.query.since)
  res.json({ pending, rejected })
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
  const project = db.getProject(req.params.id)
  if (!project) return res.status(404).json({ error: 'Project not found' })
  const events = emitHygieneEvents(req.params.id, project)
  res.json({ findings: events.length, events })
})

// --- Title dedup check ---
app.post('/api/projects/:id/check-duplicate', (req, res) => {
  if (!req.body.title) return res.status(400).json({ error: '"title" is required' })
  const project = db.getProject(req.params.id)
  if (!project) return res.status(404).json({ error: 'Project not found' })
  const issues = project.board?.issues || []
  const result = checkTitleDuplication(req.body.title, issues, req.body.threshold)
  res.json(result)
})

// --- Catch-all for production SPA serving ---
// (only activated when dist/ exists and NODE_ENV=production)
import { existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DIST_DIR = join(__dirname, '../dist')

if (existsSync(DIST_DIR)) {
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
