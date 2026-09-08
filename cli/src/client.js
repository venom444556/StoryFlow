// ---------------------------------------------------------------------------
// StoryFlow HTTP client — talks directly to the Express API
// Direct HTTP client for the Express API
// ---------------------------------------------------------------------------

import { readFileSync, existsSync, appendFileSync, mkdirSync } from 'node:fs'
import { join, dirname, resolve as resolvePath } from 'node:path'
import { homedir } from 'node:os'

const CONFIG_DIR = join(homedir(), '.config', 'storyflow')
const CONFIG_PATH = join(CONFIG_DIR, 'config.json')
const REFUSAL_LOG = join(CONFIG_DIR, 'write-refusals.log')
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
  if (process.env.STORYFLOW_TOKEN) return process.env.STORYFLOW_TOKEN
  const config = readConfig()
  return config.token || null
}

// --- Project binding -------------------------------------------------------
// A board belongs to a REPO, not to the machine. Resolution order, most
// specific first:
//
//   1. --project / positional argument       explicit, per invocation
//   2. STORYFLOW_PROJECT in the environment  explicit, per shell or session
//   3. a binding file at or above the cwd    explicit, travels with the repo
//        .storyflow.json             -> { "project": "<id>" }
//        .claude/settings.local.json -> { "env": { "STORYFLOW_PROJECT": "<id>" } }
//        .claude/settings.json       -> same
//   4. projectsByPath in the global config   explicit, for repos you cannot edit
//   5. defaultProject in the global config   NOT explicit -- a machine-wide guess
//
// Only 1-4 mean somebody named the board for THIS working tree. Step 5 is a
// guess, and a guess must never mutate a board: assertWriteIsScoped() refuses
// any non-GET request carrying an id that arrived that way. Reads still fall
// back so the CLI stays usable, and announce the choice on stderr.

const BINDING_FILES = [
  { file: '.storyflow.json', pick: (j) => j && j.project },
  {
    file: join('.claude', 'settings.local.json'),
    pick: (j) => j && j.env && j.env.STORYFLOW_PROJECT,
  },
  { file: join('.claude', 'settings.json'), pick: (j) => j && j.env && j.env.STORYFLOW_PROJECT },
]

function readJsonFile(path) {
  if (!existsSync(path)) return null
  try {
    return JSON.parse(readFileSync(path, 'utf-8'))
  } catch {
    return null
  }
}

function bindingInDir(dir) {
  for (const { file, pick } of BINDING_FILES) {
    const path = join(dir, file)
    const value = pick(readJsonFile(path))
    if (typeof value === 'string' && value.trim()) {
      return { project: value.trim(), source: 'repo', where: path, explicit: true }
    }
  }
  return null
}

function findRepoBinding(startDir) {
  const home = resolvePath(homedir())
  let dir = resolvePath(startDir)
  for (;;) {
    // Stop AT the home directory. ~/.claude/settings.json is the global agent
    // config, not a per-repo binding -- reading it here would relabel a
    // machine-wide default as "explicit" and re-arm the trap this closes.
    if (dir === home) return null
    const found = bindingInDir(dir)
    if (found) return found
    const parent = dirname(dir)
    if (parent === dir) return null
    dir = parent
  }
}

function findPathMapBinding(startDir) {
  const map = readConfig().projectsByPath
  if (!map || typeof map !== 'object') return null
  const cwd = resolvePath(startDir)
  let best = null
  for (const [rawPath, project] of Object.entries(map)) {
    if (typeof project !== 'string' || !project.trim()) continue
    const base = resolvePath(rawPath.replace(/^~(?=$|\/)/, homedir()))
    if (cwd !== base && !cwd.startsWith(base + '/')) continue
    // Longest prefix wins, so a nested repo beats the tree it sits inside.
    if (!best || base.length > best.base.length) best = { base, project: project.trim() }
  }
  if (!best) return null
  return {
    project: best.project,
    source: 'path-map',
    where: CONFIG_PATH + ' projectsByPath["' + best.base + '"]',
    explicit: true,
  }
}

export function getProjectBinding(cwd = process.cwd()) {
  const env = process.env.STORYFLOW_PROJECT
  if (typeof env === 'string' && env.trim()) {
    return { project: env.trim(), source: 'env', where: 'STORYFLOW_PROJECT', explicit: true }
  }
  const repo = findRepoBinding(cwd)
  if (repo) return repo
  const mapped = findPathMapBinding(cwd)
  if (mapped) return mapped
  const fallback = readConfig().defaultProject
  if (typeof fallback === 'string' && fallback.trim()) {
    return {
      project: fallback.trim(),
      source: 'global-default',
      where: CONFIG_PATH + ' defaultProject',
      explicit: false,
    }
  }
  return { project: null, source: 'none', where: null, explicit: false }
}

export function getDefaultProject() {
  return getProjectBinding().project
}

export function bindingHelp(cwd) {
  return [
    'No StoryFlow board is bound to ' + cwd + '.',
    'Bind one (any of these):',
    '  ' + join(cwd, '.storyflow.json') + '   ->  { "project": "<project-id>" }',
    '  ' +
      join(cwd, '.claude', 'settings.json') +
      '   ->  { "env": { "STORYFLOW_PROJECT": "<project-id>" } }',
    '  ' + CONFIG_PATH + '   ->  "projectsByPath": { "' + cwd + '": "<project-id>" }',
    'Or name it per command:  --project <project-id>',
  ].join('\n')
}

// --- Write scoping ---------------------------------------------------------
// Ids that reached us from the machine-wide default rather than from anything
// that named this working tree. One CLI invocation is one process, so this is
// the provenance of THIS command. Consulted by every outbound request, which is
// why a new command -- or a fifth hook script -- cannot forget to check.

const unscopedIds = new Set()
let unscopedBinding = null

function recordProvenance(id, binding) {
  if (binding.explicit) {
    unscopedIds.delete(id)
  } else {
    unscopedIds.add(id)
    unscopedBinding = binding
  }
}

function logRefusal(line) {
  try {
    mkdirSync(CONFIG_DIR, { recursive: true })
    appendFileSync(REFUSAL_LOG, new Date().toISOString() + ' ' + line + '\n')
  } catch {
    // The refusal is the point; never fail because the log could not be written.
  }
}

function isMutating(method, path) {
  if (method !== 'GET') return true
  // One GET mutates: consuming the steering queue pops directives off it.
  return path.includes('/steering-queue') && path.includes('consume=true')
}

function assertWriteIsScoped(method, path) {
  if (unscopedIds.size === 0) return
  const segments = path.split('?')[0].split('/')
  for (const id of unscopedIds) {
    if (!segments.includes(enc(id))) continue
    const b = unscopedBinding || {}
    const cwd = process.cwd()
    logRefusal(
      'REFUSED ' + method + ' ' + path + ' cwd=' + cwd + ' would-have-written=' + b.project
    )
    throw new Error(
      'Refusing to ' +
        method +
        ' ' +
        path +
        '\n' +
        'No StoryFlow board is bound to ' +
        cwd +
        ', so this write would land on "' +
        b.project +
        '" -- the machine-wide default from ' +
        b.where +
        ', which has nothing to do with this working tree.\n' +
        bindingHelp(cwd)
    )
  }
}

export function isConfigured() {
  return getBaseUrl() !== null
}

// --- Project resolution ---
// Accepts: full UUID, name prefix, or slug. Resolves against the server.

let _projectCache = null

export async function resolveProject(input) {
  let binding
  if (input) {
    binding = { project: input, source: 'argument', where: '--project', explicit: true }
  } else {
    binding = getProjectBinding()
    if (!binding.project) throw new Error(bindingHelp(process.cwd()))
    if (!binding.explicit) {
      // Say what we chose and why. stderr, so --json stdout stays parseable.
      console.error(
        'storyflow: no board bound to ' +
          process.cwd() +
          '; reading "' +
          binding.project +
          '" from ' +
          binding.where +
          '. Writes from here are refused -- bind the repo or pass --project.'
      )
    }
  }

  const id = await resolveProjectId(binding.project)
  recordProvenance(id, binding)
  return id
}

async function resolveProjectId(input) {
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
  const method = (options.method || 'GET').toUpperCase()
  if (isMutating(method, path)) assertWriteIsScoped(method, path)

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
        'X-StoryFlow-Actor': 'ai',
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
  audit: (pid) => request(`/api/projects/${enc(pid)}/wiki-audit`),
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

// --- Decisions ---

export const decisions = {
  list: (pid) => request(`/api/projects/${enc(pid)}/decisions`),
  get: (pid, did) => request(`/api/projects/${enc(pid)}/decisions/${enc(did)}`),
  create: (pid, data) =>
    request(`/api/projects/${enc(pid)}/decisions`, { method: 'POST', body: JSON.stringify(data) }),
  update: (pid, did, data) =>
    request(`/api/projects/${enc(pid)}/decisions/${enc(did)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (pid, did) =>
    request(`/api/projects/${enc(pid)}/decisions/${enc(did)}`, { method: 'DELETE' }),
}

// --- Timeline: Phases ---

export const phases = {
  list: (pid) => request(`/api/projects/${enc(pid)}/phases`),
  create: (pid, data) =>
    request(`/api/projects/${enc(pid)}/phases`, { method: 'POST', body: JSON.stringify(data) }),
  update: (pid, phaseId, data) =>
    request(`/api/projects/${enc(pid)}/phases/${enc(phaseId)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (pid, phaseId) =>
    request(`/api/projects/${enc(pid)}/phases/${enc(phaseId)}`, { method: 'DELETE' }),
}

// --- Timeline: Milestones ---

export const milestones = {
  list: (pid) => request(`/api/projects/${enc(pid)}/milestones`),
  create: (pid, data) =>
    request(`/api/projects/${enc(pid)}/milestones`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (pid, mid, data) =>
    request(`/api/projects/${enc(pid)}/milestones/${enc(mid)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (pid, mid) =>
    request(`/api/projects/${enc(pid)}/milestones/${enc(mid)}`, { method: 'DELETE' }),
}

// --- Hot Washes ---

export const hotWashes = {
  generate: (pid, phaseId, data = {}) =>
    request(`/api/projects/${enc(pid)}/phases/${enc(phaseId)}/hot-wash/generate`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  get: (pid, phaseId) => request(`/api/projects/${enc(pid)}/phases/${enc(phaseId)}/hot-wash`),
  update: (pid, phaseId, data) =>
    request(`/api/projects/${enc(pid)}/phases/${enc(phaseId)}/hot-wash`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  finalize: (pid, phaseId) =>
    request(`/api/projects/${enc(pid)}/phases/${enc(phaseId)}/hot-wash/finalize`, {
      method: 'POST',
    }),
  delete: (pid, phaseId) =>
    request(`/api/projects/${enc(pid)}/phases/${enc(phaseId)}/hot-wash`, {
      method: 'DELETE',
    }),
  list: (pid) => request(`/api/projects/${enc(pid)}/hot-washes`),
  lessons: (pid) => request(`/api/projects/${enc(pid)}/lessons-learned`),
}

// --- Workflow ---

export const workflow = {
  list: (pid) => request(`/api/projects/${enc(pid)}/workflow/nodes`),
  get: (pid, nid) => request(`/api/projects/${enc(pid)}/workflow/nodes/${enc(nid)}`),
  create: (pid, data) =>
    request(`/api/projects/${enc(pid)}/workflow/nodes`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (pid, nid, data) =>
    request(`/api/projects/${enc(pid)}/workflow/nodes/${enc(nid)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (pid, nid) =>
    request(`/api/projects/${enc(pid)}/workflow/nodes/${enc(nid)}`, { method: 'DELETE' }),
  link: (pid, nid, issueKey) =>
    request(`/api/projects/${enc(pid)}/workflow/nodes/${enc(nid)}/link`, {
      method: 'POST',
      body: JSON.stringify({ issueKey }),
    }),
  unlink: (pid, nid, issueKey) =>
    request(`/api/projects/${enc(pid)}/workflow/nodes/${enc(nid)}/unlink`, {
      method: 'POST',
      body: JSON.stringify({ issueKey }),
    }),
  connections: {
    list: (pid) => request(`/api/projects/${enc(pid)}/workflow/connections`),
    create: (pid, data) =>
      request(`/api/projects/${enc(pid)}/workflow/connections`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    delete: (pid, connId) =>
      request(`/api/projects/${enc(pid)}/workflow/connections/${enc(connId)}`, {
        method: 'DELETE',
      }),
  },
}

// --- Architecture ---

export const architecture = {
  list: (pid) => request(`/api/projects/${enc(pid)}/architecture/components`),
  get: (pid, cid) => request(`/api/projects/${enc(pid)}/architecture/components/${enc(cid)}`),
  create: (pid, data) =>
    request(`/api/projects/${enc(pid)}/architecture/components`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (pid, cid, data) =>
    request(`/api/projects/${enc(pid)}/architecture/components/${enc(cid)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (pid, cid) =>
    request(`/api/projects/${enc(pid)}/architecture/components/${enc(cid)}`, { method: 'DELETE' }),
  connections: {
    list: (pid) => request(`/api/projects/${enc(pid)}/architecture/connections`),
    create: (pid, data) =>
      request(`/api/projects/${enc(pid)}/architecture/connections`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    delete: (pid, connId) =>
      request(`/api/projects/${enc(pid)}/architecture/connections/${enc(connId)}`, {
        method: 'DELETE',
      }),
  },
}

// --- Events ---

export const events = {
  query: (pid, filters = {}) => request(`/api/projects/${enc(pid)}/events${qs(filters)}`),
  record: (pid, event) =>
    request(`/api/projects/${enc(pid)}/events`, { method: 'POST', body: JSON.stringify(event) }),
  respond: (pid, eventId, data) =>
    request(`/api/projects/${enc(pid)}/events/${enc(eventId)}/respond`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  cleanup: (pid) => request(`/api/projects/${enc(pid)}/events/cleanup`, { method: 'DELETE' }),
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
  acknowledge: (pid, directiveId) =>
    request(`/api/projects/${enc(pid)}/steering-queue/${enc(directiveId)}/acknowledge`, {
      method: 'POST',
      body: '{}',
    }),
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

// --- Operational & Context ---

export const operational = {
  context: (pid) => request(`/api/projects/${enc(pid)}/context`),
  get: (pid) => request(`/api/projects/${enc(pid)}/operational`),
  search: (pid, q, opts = {}) =>
    request(`/api/projects/${enc(pid)}/search${qs({ q, types: opts.types, limit: opts.limit })}`),
  resolve: (pid, type, ref) => request(`/api/projects/${enc(pid)}/resolve${qs({ type, ref })}`),
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
