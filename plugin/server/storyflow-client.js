// ---------------------------------------------------------------------------
// StoryFlow REST API client
// Wraps fetch() calls to the StoryFlow Express server
// ---------------------------------------------------------------------------

import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { homedir } from 'node:os'

const CONFIG_PATH = join(homedir(), '.config', 'storyflow', 'config.json')

/** Read the StoryFlow URL from global config or env var */
export function getBaseUrl() {
  // 1. Environment variable takes priority
  if (process.env.STORYFLOW_URL) {
    return process.env.STORYFLOW_URL.replace(/\/+$/, '')
  }
  // 2. Global config file
  if (existsSync(CONFIG_PATH)) {
    try {
      const config = JSON.parse(readFileSync(CONFIG_PATH, 'utf-8'))
      if (config.url) return config.url.replace(/\/+$/, '')
    } catch {
      // Fall through to default
    }
  }
  // 3. Default
  return null
}

/** Check if StoryFlow is configured */
export function isConfigured() {
  return getBaseUrl() !== null
}

/** Generic fetch wrapper with error handling */
async function request(path, options = {}) {
  const base = getBaseUrl()
  if (!base) {
    throw new Error(
      'StoryFlow URL not configured. Run /storyflow:setup to set the URL, or set the STORYFLOW_URL environment variable.'
    )
  }

  const url = `${base}${path}`
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!res.ok) {
    const body = await res.text()
    let message
    try {
      message = JSON.parse(body).error
    } catch {
      message = body
    }
    throw new Error(`StoryFlow API error (${res.status}): ${message}`)
  }

  return res.json()
}

// --- Projects ---

export function listProjects() {
  return request('/api/projects')
}

export function getProject(id) {
  return request(`/api/projects/${id}`)
}

export function createProject(data) {
  return request('/api/projects', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function updateProject(id, data) {
  return request(`/api/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

// --- Issues ---

export function listIssues(projectId, filters = {}) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(filters)) {
    if (value) params.set(key, value)
  }
  const qs = params.toString()
  return request(`/api/projects/${projectId}/issues${qs ? `?${qs}` : ''}`)
}

export function createIssue(projectId, data) {
  return request(`/api/projects/${projectId}/issues`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function updateIssue(projectId, issueId, data) {
  return request(`/api/projects/${projectId}/issues/${issueId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export function deleteIssue(projectId, issueId) {
  return request(`/api/projects/${projectId}/issues/${issueId}`, {
    method: 'DELETE',
  })
}

// --- Board ---

export function getBoardSummary(projectId) {
  return request(`/api/projects/${projectId}/board-summary`)
}

// --- Sprints ---

export function listSprints(projectId) {
  return request(`/api/projects/${projectId}/sprints`)
}

export function createSprint(projectId, data) {
  return request(`/api/projects/${projectId}/sprints`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

// --- Pages ---

export function listPages(projectId) {
  return request(`/api/projects/${projectId}/pages`)
}

export function createPage(projectId, data) {
  return request(`/api/projects/${projectId}/pages`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function updatePage(projectId, pageId, data) {
  return request(`/api/projects/${projectId}/pages/${pageId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

// --- Health check ---

export async function checkConnection() {
  const base = getBaseUrl()
  if (!base) return { connected: false, error: 'Not configured' }
  try {
    const projects = await listProjects()
    return { connected: true, projectCount: projects.length, url: base }
  } catch (err) {
    return { connected: false, error: err.message, url: base }
  }
}
