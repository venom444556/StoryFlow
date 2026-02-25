// ---------------------------------------------------------------------------
// Express REST API for StoryFlow
// Same endpoints as the old Vite plugin, backed by SQLite via db.js
// ---------------------------------------------------------------------------

import express from 'express'
import * as db from './db.js'
import { notifyClients } from './ws.js'

const app = express()

// --- Middleware ---
app.use(express.json({ limit: '10mb' }))

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
    'Content-Type, Authorization, X-StoryFlow-Token, X-Confirm'
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

  if (!provided || provided !== AUTH_TOKEN) {
    return res.status(401).json({ error: 'Missing or invalid authentication token' })
  }
  next()
}

// Apply token auth to all mutating API routes
app.post('/api/*', requireToken)
app.put('/api/*', requireToken)
app.delete('/api/*', requireToken)

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
  const project = db.addProject(req.body)
  notifyClients()
  res.status(201).json(project)
})

app.get('/api/projects/:id', (req, res) => {
  const project = db.getProject(req.params.id)
  if (!project) return res.status(404).json({ error: 'Project not found' })
  res.json(project)
})

app.put('/api/projects/:id', (req, res) => {
  const project = db.updateProject(req.params.id, req.body)
  if (!project) return res.status(404).json({ error: 'Project not found' })
  notifyClients()
  res.json(project)
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
  const issue = db.addIssue(req.params.id, req.body)
  if (!issue) return res.status(404).json({ error: 'Project not found' })
  if (issue.error) return res.status(400).json({ error: issue.error })
  notifyClients()
  res.status(201).json(issue)
})

app.put('/api/projects/:id/issues/:issueId', (req, res) => {
  const issue = db.updateIssue(req.params.id, req.params.issueId, req.body)
  if (!issue) return res.status(404).json({ error: 'Issue or project not found' })
  if (issue.error) return res.status(400).json({ error: issue.error })
  notifyClients()
  res.json(issue)
})

app.delete('/api/projects/:id/issues/:issueId', (req, res) => {
  const ok = db.deleteIssue(req.params.id, req.params.issueId)
  if (!ok) return res.status(404).json({ error: 'Issue or project not found' })
  notifyClients()
  res.json({ success: true })
})

// --- Sprints ---
app.get('/api/projects/:id/sprints', (req, res) => {
  const sprints = db.listSprints(req.params.id)
  if (sprints === null) return res.status(404).json({ error: 'Project not found' })
  res.json(sprints)
})

app.post('/api/projects/:id/sprints', (req, res) => {
  const sprint = db.addSprint(req.params.id, req.body)
  if (!sprint) return res.status(404).json({ error: 'Project not found' })
  notifyClients()
  res.status(201).json(sprint)
})

// --- Pages ---
app.get('/api/projects/:id/pages', (req, res) => {
  const pages = db.listPages(req.params.id)
  if (pages === null) return res.status(404).json({ error: 'Project not found' })
  res.json(pages)
})

app.post('/api/projects/:id/pages', (req, res) => {
  const page = db.addPage(req.params.id, req.body)
  if (!page) return res.status(404).json({ error: 'Project not found' })
  notifyClients()
  res.status(201).json(page)
})

app.put('/api/projects/:id/pages/:pageId', (req, res) => {
  const page = db.updatePage(req.params.id, req.params.pageId, req.body)
  if (!page) return res.status(404).json({ error: 'Page or project not found' })
  notifyClients()
  res.json(page)
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
  res.status(500).json({ error: err.message || 'Internal server error' })
})

export default app
