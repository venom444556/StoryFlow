/* global process, Buffer */
// ---------------------------------------------------------------------------
// Figma REST API Client — Headless Figma access for Design Forge
// Wraps the Figma v1 REST API with the same connect-per-command ethos as CDP.
// Auth: Personal Access Token (PAT) via FIGMA_TOKEN env or --token flag.
// ---------------------------------------------------------------------------

const BASE_URL = 'https://api.figma.com'

function getToken(opts) {
  const token = opts?.token || process.env.FIGMA_TOKEN
  if (!token) {
    throw new Error(
      'Figma token required. Set FIGMA_TOKEN env var or pass --token.\n' +
        'Generate one at: https://www.figma.com/developers/api#access-tokens'
    )
  }
  return token
}

function parseUrl(figmaUrl) {
  // figma.com/design/:fileKey/:fileName?node-id=:nodeId
  // figma.com/design/:fileKey/branch/:branchKey/:fileName
  // figma.com/file/:fileKey/:fileName?node-id=:nodeId (legacy)
  const url = new URL(figmaUrl)
  const parts = url.pathname.split('/').filter(Boolean)

  let fileKey = null
  let nodeId = null

  if (parts[0] === 'design' || parts[0] === 'file') {
    fileKey = parts[1]
    // Branch URLs: use branchKey instead
    if (parts[2] === 'branch' && parts[3]) {
      fileKey = parts[3]
    }
  }

  // Node ID from query params (convert dashes to colons)
  const nodeParam = url.searchParams.get('node-id')
  if (nodeParam) {
    nodeId = nodeParam.replace(/-/g, ':')
  }

  return { fileKey, nodeId }
}

async function figmaFetch(path, token, options = {}) {
  const url = `${BASE_URL}${path}`
  const headers = {
    'X-Figma-Token': token,
    ...options.headers,
  }

  const res = await fetch(url, {
    ...options,
    headers,
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Figma API ${res.status}: ${body || res.statusText}`)
  }

  return res.json()
}

// --- File operations ---

async function getFile(fileKey, token, opts = {}) {
  const params = new URLSearchParams()
  if (opts.depth) params.set('depth', opts.depth)
  if (opts.nodeIds) params.set('ids', opts.nodeIds.join(','))
  const qs = params.toString()
  return figmaFetch(`/v1/files/${fileKey}${qs ? '?' + qs : ''}`, token)
}

async function getNodes(fileKey, nodeIds, token) {
  const ids = Array.isArray(nodeIds) ? nodeIds.join(',') : nodeIds
  return figmaFetch(`/v1/files/${fileKey}/nodes?ids=${encodeURIComponent(ids)}`, token)
}

// --- Image export ---

async function exportImages(fileKey, nodeIds, token, opts = {}) {
  const ids = Array.isArray(nodeIds) ? nodeIds.join(',') : nodeIds
  const params = new URLSearchParams({
    ids,
    format: opts.format || 'png',
    scale: String(opts.scale || 2),
  })
  if (opts.svgIncludeId) params.set('svg_include_id', 'true')
  if (opts.svgSimplifyStroke) params.set('svg_simplify_stroke', 'true')

  const result = await figmaFetch(`/v1/images/${fileKey}?${params}`, token)

  if (opts.download && result.images) {
    const downloads = {}
    for (const [id, url] of Object.entries(result.images)) {
      if (url) {
        const res = await fetch(url)
        downloads[id] = Buffer.from(await res.arrayBuffer())
      }
    }
    return { ...result, downloads }
  }

  return result
}

// --- Variables (Design Tokens) ---

async function getVariables(fileKey, token, opts = {}) {
  const endpoint = opts.published ? 'variables/published' : 'variables/local'
  return figmaFetch(`/v1/files/${fileKey}/${endpoint}`, token)
}

// --- Components & Styles ---

async function getComponents(fileKey, token) {
  const file = await getFile(fileKey, token, { depth: 1 })
  return file.components || {}
}

async function getTeamComponents(teamId, token) {
  return figmaFetch(`/v1/teams/${teamId}/components`, token)
}

async function getStyles(fileKey, token) {
  const file = await getFile(fileKey, token, { depth: 1 })
  return file.styles || {}
}

async function getTeamStyles(teamId, token) {
  return figmaFetch(`/v1/teams/${teamId}/styles`, token)
}

// --- Comments ---

async function getComments(fileKey, token) {
  return figmaFetch(`/v1/files/${fileKey}/comments`, token)
}

async function postComment(fileKey, message, token, opts = {}) {
  const body = { message }
  if (opts.nodeId) {
    body.client_meta = { node_id: opts.nodeId }
  }
  return figmaFetch(`/v1/files/${fileKey}/comments`, token, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

// --- Version History ---

async function getVersions(fileKey, token) {
  return figmaFetch(`/v1/files/${fileKey}/versions`, token)
}

// --- User ---

async function getMe(token) {
  return figmaFetch('/v1/me', token)
}

// --- Image fills ---

async function getImageFills(fileKey, token) {
  return figmaFetch(`/v1/files/${fileKey}/images`, token)
}

// --- Token extraction (design tokens from variables) ---

function flattenVariables(variablesResponse) {
  const collections = variablesResponse.meta?.variableCollections || {}
  const variables = variablesResponse.meta?.variables || {}
  const tokens = []

  for (const [id, variable] of Object.entries(variables)) {
    const collection = collections[variable.variableCollectionId]
    for (const [modeId, value] of Object.entries(variable.valuesByMode)) {
      const mode = collection?.modes?.find((m) => m.modeId === modeId)
      tokens.push({
        id,
        name: variable.name,
        collection: collection?.name || 'unknown',
        mode: mode?.name || 'default',
        type: variable.resolvedType,
        value: resolveValue(value),
      })
    }
  }

  return tokens
}

function resolveValue(value) {
  if (value === null || value === undefined) return null
  if (typeof value === 'number' || typeof value === 'string' || typeof value === 'boolean') {
    return value
  }
  // Color values: { r, g, b, a }
  if ('r' in value && 'g' in value && 'b' in value) {
    const r = Math.round(value.r * 255)
    const g = Math.round(value.g * 255)
    const b = Math.round(value.b * 255)
    const a = value.a !== undefined ? value.a : 1
    if (a < 1) return `rgba(${r}, ${g}, ${b}, ${a.toFixed(2)})`
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
  }
  // Variable alias: { type: 'VARIABLE_ALIAS', id: '...' }
  if (value.type === 'VARIABLE_ALIAS') return `var(${value.id})`
  return JSON.stringify(value)
}

export {
  getToken,
  parseUrl,
  getFile,
  getNodes,
  exportImages,
  getVariables,
  getComponents,
  getTeamComponents,
  getStyles,
  getTeamStyles,
  getComments,
  postComment,
  getVersions,
  getMe,
  getImageFills,
  flattenVariables,
}
