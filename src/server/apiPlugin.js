// ---------------------------------------------------------------------------
// Vite plugin: StoryFlow REST API
// Adds /api/* routes via configureServer — zero new npm dependencies
// ---------------------------------------------------------------------------

import * as store from './dataStore.js'

/** Parse JSON body from an incoming request */
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', (chunk) => (body += chunk))
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {})
      } catch {
        reject(new Error('Invalid JSON'))
      }
    })
    req.on('error', reject)
  })
}

/** Send JSON response */
function json(res, data, status = 200) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.end(JSON.stringify(data))
}

/** Send error response */
function error(res, message, status = 400) {
  json(res, { error: message }, status)
}

/** Extract route params from a URL pattern */
function matchRoute(url, pattern) {
  // Remove query string
  const path = url.split('?')[0]
  const patternParts = pattern.split('/')
  const urlParts = path.split('/')
  if (patternParts.length !== urlParts.length) return null

  const params = {}
  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(':')) {
      params[patternParts[i].slice(1)] = urlParts[i]
    } else if (patternParts[i] !== urlParts[i]) {
      return null
    }
  }
  return params
}

/** Parse query string filters */
function parseQuery(url) {
  const q = url.split('?')[1]
  if (!q) return {}
  return Object.fromEntries(new URLSearchParams(q))
}

export default function storyflowApiPlugin() {
  return {
    name: 'storyflow-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        // Only handle /api/* routes
        if (!req.url?.startsWith('/api/')) return next()

        // CORS preflight
        if (req.method === 'OPTIONS') {
          res.setHeader('Access-Control-Allow-Origin', '*')
          res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
          res.statusCode = 204
          return res.end()
        }

        const url = req.url
        const method = req.method
        let params, body

        try {
          // --- Sync endpoint ---
          if (method === 'POST' && url === '/api/sync') {
            body = await parseBody(req)
            if (body.projects) {
              store.syncAll(body.projects)
              return json(res, { success: true, count: body.projects.length })
            }
            return error(res, 'Missing projects array')
          }

          // --- Projects ---
          if (method === 'GET' && url.split('?')[0] === '/api/projects') {
            return json(res, store.listProjects())
          }

          params = matchRoute(url, '/api/projects/:id/board-summary')
          if (method === 'GET' && params) {
            const summary = store.getBoardSummary(params.id)
            return summary ? json(res, summary) : error(res, 'Project not found', 404)
          }

          params = matchRoute(url, '/api/projects/:id/issues/:issueId')
          if (params) {
            if (method === 'PUT') {
              body = await parseBody(req)
              const issue = store.updateIssue(params.id, params.issueId, body)
              if (!issue) return error(res, 'Issue or project not found', 404)
              notifyClient(server)
              return json(res, issue)
            }
            if (method === 'DELETE') {
              const ok = store.deleteIssue(params.id, params.issueId)
              if (!ok) return error(res, 'Issue or project not found', 404)
              notifyClient(server)
              return json(res, { success: true })
            }
          }

          params = matchRoute(url, '/api/projects/:id/issues')
          if (params) {
            if (method === 'GET') {
              const filters = parseQuery(url)
              const issues = store.listIssues(params.id, filters)
              return issues !== null ? json(res, issues) : error(res, 'Project not found', 404)
            }
            if (method === 'POST') {
              body = await parseBody(req)
              const issue = store.addIssue(params.id, body)
              if (!issue) return error(res, 'Project not found', 404)
              notifyClient(server)
              return json(res, issue, 201)
            }
          }

          params = matchRoute(url, '/api/projects/:id/sprints')
          if (params) {
            if (method === 'GET') {
              const sprints = store.listSprints(params.id)
              return sprints !== null ? json(res, sprints) : error(res, 'Project not found', 404)
            }
            if (method === 'POST') {
              body = await parseBody(req)
              const sprint = store.addSprint(params.id, body)
              if (!sprint) return error(res, 'Project not found', 404)
              notifyClient(server)
              return json(res, sprint, 201)
            }
          }

          params = matchRoute(url, '/api/projects/:id/pages/:pageId')
          if (method === 'PUT' && params) {
            body = await parseBody(req)
            const page = store.updatePage(params.id, params.pageId, body)
            if (!page) return error(res, 'Page or project not found', 404)
            notifyClient(server)
            return json(res, page)
          }

          params = matchRoute(url, '/api/projects/:id/pages')
          if (params) {
            if (method === 'GET') {
              const pages = store.listPages(params.id)
              return pages !== null ? json(res, pages) : error(res, 'Project not found', 404)
            }
            if (method === 'POST') {
              body = await parseBody(req)
              const page = store.addPage(params.id, body)
              if (!page) return error(res, 'Project not found', 404)
              notifyClient(server)
              return json(res, page, 201)
            }
          }

          params = matchRoute(url, '/api/projects/:id')
          if (params) {
            if (method === 'GET') {
              const project = store.getProject(params.id)
              return project ? json(res, project) : error(res, 'Project not found', 404)
            }
            if (method === 'PUT') {
              body = await parseBody(req)
              const project = store.updateProject(params.id, body)
              if (!project) return error(res, 'Project not found', 404)
              notifyClient(server)
              return json(res, project)
            }
          }

          if (method === 'POST' && url.split('?')[0] === '/api/projects') {
            body = await parseBody(req)
            const project = store.addProject(body)
            notifyClient(server)
            return json(res, project, 201)
          }

          // No route matched
          return error(res, 'Not found', 404)
        } catch (err) {
          console.error('[StoryFlow API]', err)
          return error(res, err.message || 'Internal server error', 500)
        }
      })
    },
  }
}

/** Notify the client of external data changes via Vite HMR WebSocket */
function notifyClient(server) {
  try {
    server.ws.send({ type: 'custom', event: 'storyflow:sync' })
  } catch {
    // WebSocket may not be available during tests
  }
}
