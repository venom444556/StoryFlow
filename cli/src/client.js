// ---------------------------------------------------------------------------
// StoryFlow HTTP client — talks directly to the Express API
// Evolved from plugin/server/storyflow-client.js, zero MCP overhead
// ---------------------------------------------------------------------------

import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { homedir } from 'node:os'

const CONFIG_PATH = join(homedir(), '.config', 'storyflow', 'config.json')
const REQUEST_TIMEOUT_MS = parseInt(process.env.STORYFLOW_TIMEOUT_MS, 10) || 15_000

// --- Config ---

function readConfig() {
  if (!existsSync(CONFIG_PATH)) return {}
  try {
    return JSON.parse(readFileSync(CONFIG_PATH, 'utf-8'))
  } catch {
    return {}
  }
}

export function getBaseUrl() {
  if (process.env.STORYFLOW_URL) {
    return process.env.STORYFLOW_URL.replace(/\/+$/, '')
  }
  const config = readConfig()
  if (config.url) return config.url.replace(/\/+$/, '')
  return null
}

function getAuthToken() {
  if (process.env.STORYFLOW_MCP_TOKEN) return process.env.STORYFLOW_MCP_TOKEN
  const config = readConfig()
  return config.token || null
}

export function getDefaultProject() {
  if (process.env.STORYFLOW_PROJECT) return process.env.STORYFLOW_PROJECT
  const config = readConfig()
  return config.defaultProject || null
}

export function isConfigured() {
  return getBaseUrl() !== null
}

// --- Project resolution ---
// Accepts: full UUID, name prefix, or slug. Resolves against the server.

let _projectCache = null

export async function resolveProject(input) {
  if (!input) {
    const def = getDefaultProject()
    if (!def)
      throw new Error(
        'No project specified and no default set. Run: storyflow config set-default <project>'
      )
    input = def
  }

  // Full UUID — skip resolution
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-/.test(input)) return input

  // Fetch project list (cached for this process)
  if (!_projectCache) {
    _projectCache = await projects.list()
  }

  const lower = input.toLowerCase()

  // Exact ID match
  const exact = _projectCache.find((p) => p.id === input)
  if (exact) return exact.id

  // Name prefix match (case-insensitive)
  const nameMatches = _projectCache.filter((p) => p.name.toLowerCase().startsWith(lower))
  if (nameMatches.length === 1) return nameMatches[0].id
  if (nameMatches.length > 1) {
    const names = nameMatches.map((p) => `  ${p.name} (${p.id})`).join('\n')
    throw new Error(`Ambiguous project "${input}" — matches:\n${names}`)
  }

  // Fuzzy: name contains
  const fuzzy = _projectCache.filter((p) => p.name.toLowerCase().includes(lower))
  if (fuzzy.length === 1) return fuzzy[0].id
  if (fuzzy.length > 1) {
    const names = fuzzy.map((p) => `  ${p.name} (${p.id})`).join('\n')
    throw new Error(`Ambiguous project "${input}" — matches:\n${names}`)
  }

  throw new Error(`Project "${input}" not found. Run: storyflow projects list`)
}

// --- HTTP ---

async function request(path, options = {}) {
  const base = getBaseUrl()
  if (!base) {
    throw new Error('StoryFlow not configured. Run: storyflow config set-url <url>')
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
        'X-StoryFlow-Actor': 'human',
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
      throw new Error(`API error (${res.status}): ${message}`)
    }

    return res.json()
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error(`Request timed out after ${REQUEST_TIMEOUT_MS}ms: ${path}`)
    }
    throw err
  } finally {
    clearTimeout(timeout)
  }
}

function enc(v) {
  return encodeURIComponent(v)
}

function qs(filters) {
  const params = new URLSearchParams()
  for (const [k, v] of Object.entries(filters)) {
    if (v !== undefined && v !== null && v !== '') params.set(k, String(v))
  }
  const s = params.toString()
  return s ? `?${s}` : ''
}

// --- Projects ---

export const projects = {
  list: () => request('/api/projects'),
  get: (id) => request(`/api/projects/${enc(id)}`),
  create: (data) => request('/api/projects', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) =>
    request(`/api/projects/${enc(id)}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/api/projects/${enc(id)}`, { method: 'DELETE' }),
}

// --- Issues ---

export const issues = {
  list: (pid, filters = {}) => request(`/api/projects/${enc(pid)}/issues${qs(filters)}`),
  create: (pid, data) =>
    request(`/api/projects/${enc(pid)}/issues`, { method: 'POST', body: JSON.stringify(data) }),
  update: (pid, iid, data) =>
    request(`/api/projects/${enc(pid)}/issues/${enc(iid)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (pid, iid) =>
    request(`/api/projects/${enc(pid)}/issues/${enc(iid)}`, { method: 'DELETE' }),
  getByKey: (pid, key) => request(`/api/projects/${enc(pid)}/issues/by-key/${enc(key)}`),
  updateByKey: (pid, key, data) =>
    request(`/api/projects/${enc(pid)}/issues/by-key/${enc(key)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  batchUpdate: (pid, updates) =>
    request(`/api/projects/${enc(pid)}/issues/batch-update`, {
      method: 'POST',
      body: JSON.stringify({ updates }),
    }),
  addComment: (pid, iid, data) =>
    request(`/api/projects/${enc(pid)}/issues/${enc(iid)}/comments`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  addCommentByKey: (pid, key, data) =>
    request(`/api/projects/${enc(pid)}/issues/by-key/${enc(key)}/comments`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  nudge: (pid, key) =>
    request(`/api/projects/${enc(pid)}/issues/by-key/${enc(key)}/nudge`, {
      method: 'POST',
      body: '{}',
    }),
}

// --- Board ---

export const board = {
  summary: (pid) => request(`/api/projects/${enc(pid)}/board-summary`),
  hygiene: (pid) => request(`/api/projects/${enc(pid)}/hygiene`),
}

// --- Sprints ---

export const sprints = {
  list: (pid) => request(`/api/projects/${enc(pid)}/sprints`),
  create: (pid, data) =>
    request(`/api/projects/${enc(pid)}/sprints`, { method: 'POST', body: JSON.stringify(data) }),
  update: (pid, sid, data) =>
    request(`/api/projects/${enc(pid)}/sprints/${enc(sid)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (pid, sid) =>
    request(`/api/projects/${enc(pid)}/sprints/${enc(sid)}`, { method: 'DELETE' }),
}

// --- Pages ---

export const pages = {
  list: (pid) => request(`/api/projects/${enc(pid)}/pages`),
  get: (pid, pageId) => request(`/api/projects/${enc(pid)}/pages/${enc(pageId)}`),
  create: (pid, data) =>
    request(`/api/projects/${enc(pid)}/pages`, { method: 'POST', body: JSON.stringify(data) }),
  update: (pid, pageId, data) =>
    request(`/api/projects/${enc(pid)}/pages/${enc(pageId)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (pid, pageId) =>
    request(`/api/projects/${enc(pid)}/pages/${enc(pageId)}`, { method: 'DELETE' }),
}

// --- Events ---

export const events = {
  query: (pid, filters = {}) => request(`/api/projects/${enc(pid)}/events${qs(filters)}`),
  record: (pid, event) =>
    request(`/api/projects/${enc(pid)}/events`, { method: 'POST', body: JSON.stringify(event) }),
}

// --- AI Status & Steering ---

export const ai = {
  getStatus: (pid) => request(`/api/projects/${enc(pid)}/ai-status`),
  setStatus: (pid, status, detail) =>
    request(`/api/projects/${enc(pid)}/ai-status`, {
      method: 'POST',
      body: JSON.stringify({ status, detail }),
    }),
  getDirectives: (pid, consume = false) =>
    request(`/api/projects/${enc(pid)}/steering-queue${consume ? '?consume=true' : ''}`),
  steer: (pid, text, priority = 'normal') =>
    request(`/api/projects/${enc(pid)}/steer`, {
      method: 'POST',
      body: JSON.stringify({ text, priority }),
    }),
}

// --- Sessions ---

export const sessions = {
  list: (pid, limit = 10) =>
    request(`/api/projects/${enc(pid)}/sessions${limit !== 10 ? `?limit=${limit}` : ''}`),
  latest: (pid) => request(`/api/projects/${enc(pid)}/sessions/latest`),
  save: (pid, data) =>
    request(`/api/projects/${enc(pid)}/sessions`, { method: 'POST', body: JSON.stringify(data) }),
}

// --- Gates & Snapshots ---

export const safety = {
  gates: (pid) => request(`/api/projects/${enc(pid)}/gates`),
  snapshots: (pid) => request(`/api/projects/${enc(pid)}/snapshots`),
  restore: (pid, sid) =>
    request(`/api/projects/${enc(pid)}/snapshots/${enc(sid)}/restore`, {
      method: 'POST',
      headers: { 'X-Confirm': 'restore' },
    }),
}

// --- Health ---

export async function checkConnection() {
  const base = getBaseUrl()
  if (!base) return { connected: false, error: 'Not configured' }
  try {
    const list = await projects.list()
    return { connected: true, projectCount: list.length, url: base }
  } catch (err) {
    return { connected: false, error: err.message, url: base }
  }
}
