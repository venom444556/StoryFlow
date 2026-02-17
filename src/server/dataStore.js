// ---------------------------------------------------------------------------
// Server-side JSON data store for StoryFlow REST API
// Reads/writes data/storyflow-data.json — no IndexedDB dependency
// ---------------------------------------------------------------------------

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'

const DATA_FILE = join(process.cwd(), 'data', 'storyflow-data.json')

function ensureDir() {
  const dir = dirname(DATA_FILE)
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }
}

/** Load all data from the JSON file */
export function loadAll() {
  ensureDir()
  if (!existsSync(DATA_FILE)) {
    return { projects: [] }
  }
  try {
    return JSON.parse(readFileSync(DATA_FILE, 'utf-8'))
  } catch {
    return { projects: [] }
  }
}

/** Save all data to the JSON file */
export function saveAll(data) {
  ensureDir()
  writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8')
}

/** Get all projects (summary: id, name, status, updatedAt) */
export function listProjects() {
  const { projects } = loadAll()
  return projects
    .filter((p) => !p.deletedAt)
    .map((p) => ({
      id: p.id,
      name: p.name,
      status: p.status,
      description: p.description || '',
      updatedAt: p.updatedAt,
      createdAt: p.createdAt,
      issueCount: p.board?.issues?.length || 0,
      sprintCount: p.board?.sprints?.length || 0,
    }))
}

/** Get a single project by ID (full data) */
export function getProject(id) {
  const { projects } = loadAll()
  return projects.find((p) => p.id === id && !p.deletedAt) || null
}

/** Update (replace) a project by ID */
export function updateProject(id, updates) {
  const data = loadAll()
  const idx = data.projects.findIndex((p) => p.id === id)
  if (idx === -1) return null
  data.projects[idx] = { ...data.projects[idx], ...updates, updatedAt: new Date().toISOString() }
  saveAll(data)
  return data.projects[idx]
}

/** Add a new project */
export function addProject(project) {
  const data = loadAll()
  const now = new Date().toISOString()
  const newProject = { ...project, createdAt: now, updatedAt: now }
  data.projects.push(newProject)
  saveAll(data)
  return newProject
}

/** Sync: replace all data (used by client on load to push IndexedDB state) */
export function syncAll(projects) {
  saveAll({ projects })
}

// --- Issue operations ---

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

export function addIssue(projectId, issue) {
  const data = loadAll()
  const project = data.projects.find((p) => p.id === projectId)
  if (!project) return null
  if (!project.board) project.board = { issues: [], sprints: [], nextIssueNumber: 1 }

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

  // Set initial phase timestamp
  if (newIssue.status === 'To Do' && !newIssue.todoAt) newIssue.todoAt = now
  else if (newIssue.status === 'In Progress' && !newIssue.inProgressAt) newIssue.inProgressAt = now
  else if (newIssue.status === 'Done' && !newIssue.doneAt) newIssue.doneAt = now

  project.board.issues.push(newIssue)
  project.board.nextIssueNumber = nextNumber + 1
  project.updatedAt = now
  saveAll(data)
  return newIssue
}

export function updateIssue(projectId, issueId, updates) {
  const data = loadAll()
  const project = data.projects.find((p) => p.id === projectId)
  if (!project) return null
  const issue = project.board?.issues?.find((i) => i.id === issueId)
  if (!issue) return null

  const now = new Date().toISOString()

  // Track phase transitions
  if (updates.status && updates.status !== issue.status) {
    if (updates.status === 'To Do' && !issue.todoAt) updates.todoAt = now
    else if (updates.status === 'In Progress' && !issue.inProgressAt) updates.inProgressAt = now
    else if (updates.status === 'Done' && !issue.doneAt) updates.doneAt = now
  }

  Object.assign(issue, updates, { updatedAt: now })
  project.updatedAt = now
  saveAll(data)
  return issue
}

export function deleteIssue(projectId, issueId) {
  const data = loadAll()
  const project = data.projects.find((p) => p.id === projectId)
  if (!project || !project.board?.issues) return false
  const idx = project.board.issues.findIndex((i) => i.id === issueId)
  if (idx === -1) return false
  project.board.issues.splice(idx, 1)
  project.updatedAt = new Date().toISOString()
  saveAll(data)
  return true
}

// --- Sprint operations ---

export function listSprints(projectId) {
  const project = getProject(projectId)
  if (!project) return null
  return project.board?.sprints || []
}

export function addSprint(projectId, sprint) {
  const data = loadAll()
  const project = data.projects.find((p) => p.id === projectId)
  if (!project) return null
  if (!project.board) project.board = { issues: [], sprints: [], nextIssueNumber: 1 }

  const now = new Date().toISOString()
  const newSprint = { ...sprint, id: sprint.id || crypto.randomUUID(), createdAt: now }
  project.board.sprints.push(newSprint)
  project.updatedAt = now
  saveAll(data)
  return newSprint
}

// --- Page operations ---

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
  const data = loadAll()
  const project = data.projects.find((p) => p.id === projectId)
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
  saveAll(data)
  return newPage
}

export function updatePage(projectId, pageId, updates) {
  const data = loadAll()
  const project = data.projects.find((p) => p.id === projectId)
  if (!project) return null
  const page = project.pages?.find((p) => p.id === pageId)
  if (!page) return null

  const now = new Date().toISOString()
  Object.assign(page, updates, { updatedAt: now })
  project.updatedAt = now
  saveAll(data)
  return page
}

// --- Board summary ---

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
