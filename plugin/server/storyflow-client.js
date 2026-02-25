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

/** Read the auth token from env var or config file */
function getAuthToken() {
  if (process.env.STORYFLOW_MCP_TOKEN) {
    return process.env.STORYFLOW_MCP_TOKEN
  }
  if (existsSync(CONFIG_PATH)) {
    try {
      const config = JSON.parse(readFileSync(CONFIG_PATH, 'utf-8'))
      if (config.token) return config.token
    } catch {
      // Fall through
    }
  }
  return null
}

/** Check if StoryFlow is configured */
export function isConfigured() {
  return getBaseUrl() !== null
}

const REQUEST_TIMEOUT_MS = parseInt(process.env.STORYFLOW_TIMEOUT_MS, 10) || 15_000

/** Generic fetch wrapper with error handling and timeout */
async function request(path, options = {}) {
  const base = getBaseUrl()
  if (!base) {
    throw new Error(
      'StoryFlow URL not configured. Run /storyflow:setup to set the URL, or set the STORYFLOW_URL environment variable.'
    )
  }

  const token = getAuthToken()
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {}

  const url = `${base}${path}`
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
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
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error(`StoryFlow API request timed out after ${REQUEST_TIMEOUT_MS}ms: ${path}`)
    }
    throw err
  } finally {
    clearTimeout(timeout)
  }
}

// --- Projects ---

export function listProjects() {
  return request('/api/projects')
}

export function getProject(id) {
  return request(`/api/projects/${encodeURIComponent(id)}`)
}

export function createProject(data) {
  return request('/api/projects', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function updateProject(id, data) {
  return request(`/api/projects/${encodeURIComponent(id)}`, {
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
  return request(`/api/projects/${encodeURIComponent(projectId)}/issues${qs ? `?${qs}` : ''}`)
}

export function createIssue(projectId, data) {
  return request(`/api/projects/${encodeURIComponent(projectId)}/issues`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function updateIssue(projectId, issueId, data) {
  return request(
    `/api/projects/${encodeURIComponent(projectId)}/issues/${encodeURIComponent(issueId)}`,
    {
      method: 'PUT',
      body: JSON.stringify(data),
    }
  )
}

export function deleteIssue(projectId, issueId) {
  return request(
    `/api/projects/${encodeURIComponent(projectId)}/issues/${encodeURIComponent(issueId)}`,
    {
      method: 'DELETE',
    }
  )
}

// --- Board ---

export function getBoardSummary(projectId) {
  return request(`/api/projects/${encodeURIComponent(projectId)}/board-summary`)
}

// --- Sprints ---

export function listSprints(projectId) {
  return request(`/api/projects/${encodeURIComponent(projectId)}/sprints`)
}

export function createSprint(projectId, data) {
  return request(`/api/projects/${encodeURIComponent(projectId)}/sprints`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

// --- Pages ---

export function listPages(projectId) {
  return request(`/api/projects/${encodeURIComponent(projectId)}/pages`)
}

export function createPage(projectId, data) {
  return request(`/api/projects/${encodeURIComponent(projectId)}/pages`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function updatePage(projectId, pageId, data) {
  return request(
    `/api/projects/${encodeURIComponent(projectId)}/pages/${encodeURIComponent(pageId)}`,
    {
      method: 'PUT',
      body: JSON.stringify(data),
    }
  )
}

export function deletePage(projectId, pageId) {
  return request(
    `/api/projects/${encodeURIComponent(projectId)}/pages/${encodeURIComponent(pageId)}`,
    {
      method: 'DELETE',
    }
  )
}

export function deleteSprint(projectId, sprintId) {
  return request(
    `/api/projects/${encodeURIComponent(projectId)}/sprints/${encodeURIComponent(sprintId)}`,
    {
      method: 'DELETE',
    }
  )
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
