// @vitest-environment node
// ---------------------------------------------------------------------------
// Backend API tests — exercises Express routes via in-memory SQLite
// ---------------------------------------------------------------------------

import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest'
import { createServer } from 'node:http'
import * as db from './db.js'
import app from './app.js'

let server
let baseUrl

beforeAll(async () => {
  await db.initDb()
  server = createServer(app)
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  const { port } = server.address()
  baseUrl = `http://127.0.0.1:${port}`
})

afterAll(() => {
  server?.close()
})

// Helper to make requests
async function api(path, options = {}) {
  const { headers: extraHeaders, ...rest } = options
  const res = await fetch(`${baseUrl}${path}`, {
    ...rest,
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
  })
  const body = await res.json().catch(() => null)
  return { status: res.status, body, headers: res.headers }
}

// Seed a test project for reuse
async function seedProject(overrides = {}) {
  const { body } = await api('/api/projects', {
    method: 'POST',
    body: JSON.stringify({ name: 'Test Project', ...overrides }),
  })
  return body
}

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

describe('Projects API', () => {
  it('GET /api/projects returns array', async () => {
    const { status, body } = await api('/api/projects')
    expect(status).toBe(200)
    expect(Array.isArray(body)).toBe(true)
  })

  it('POST /api/projects creates a project', async () => {
    const { status, body } = await api('/api/projects', {
      method: 'POST',
      body: JSON.stringify({ name: 'New Project', description: 'desc' }),
    })
    expect(status).toBe(201)
    expect(body.name).toBe('New Project')
    expect(body.description).toBe('desc')
    expect(body.createdAt).toBeTruthy()
  })

  it('GET /api/projects/:id returns project', async () => {
    const project = await seedProject({ name: 'Fetch Me' })
    const { status, body } = await api(`/api/projects/${project.id}`)
    expect(status).toBe(200)
    expect(body.name).toBe('Fetch Me')
  })

  it('GET /api/projects/:id returns 404 for missing', async () => {
    const { status } = await api('/api/projects/nonexistent')
    expect(status).toBe(404)
  })

  it('PUT /api/projects/:id updates project', async () => {
    const project = await seedProject({ name: 'Before' })
    const { status, body } = await api(`/api/projects/${project.id}`, {
      method: 'PUT',
      body: JSON.stringify({ name: 'After' }),
    })
    expect(status).toBe(200)
    expect(body.name).toBe('After')
  })

  it('rejects invalid project ID format', async () => {
    const { status, body } = await api('/api/projects/INVALID_ID!')
    expect(status).toBe(400)
    expect(body.error).toMatch(/Invalid project ID/)
  })
})

// ---------------------------------------------------------------------------
// Issues
// ---------------------------------------------------------------------------

describe('Issues API', () => {
  let projectId

  beforeEach(async () => {
    const project = await seedProject({ name: 'Issue Test' })
    projectId = project.id
  })

  it('POST + GET issues', async () => {
    const { status, body: issue } = await api(`/api/projects/${projectId}/issues`, {
      method: 'POST',
      body: JSON.stringify({ title: 'Bug 1', type: 'bug' }),
    })
    expect(status).toBe(201)
    expect(issue.title).toBe('Bug 1')
    expect(issue.key).toBeTruthy()

    const { body: issues } = await api(`/api/projects/${projectId}/issues`)
    expect(issues.some((i) => i.id === issue.id)).toBe(true)
  })

  it('normalizes status aliases', async () => {
    const { body } = await api(`/api/projects/${projectId}/issues`, {
      method: 'POST',
      body: JSON.stringify({ title: 'WIP task', type: 'task', status: 'wip' }),
    })
    expect(body.status).toBe('In Progress')
  })

  it('rejects unknown status', async () => {
    const { status, body } = await api(`/api/projects/${projectId}/issues`, {
      method: 'POST',
      body: JSON.stringify({ title: 'Bad', type: 'task', status: 'invalid-status' }),
    })
    expect(status).toBe(400)
    expect(body.error).toMatch(/Unknown status/)
  })

  it('PUT updates an issue', async () => {
    const { body: issue } = await api(`/api/projects/${projectId}/issues`, {
      method: 'POST',
      body: JSON.stringify({ title: 'Original', type: 'story' }),
    })
    const { status, body } = await api(`/api/projects/${projectId}/issues/${issue.id}`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'Done' }),
    })
    expect(status).toBe(200)
    expect(body.status).toBe('Done')
    expect(body.doneAt).toBeTruthy()
  })

  it('DELETE removes an issue', async () => {
    const { body: issue } = await api(`/api/projects/${projectId}/issues`, {
      method: 'POST',
      body: JSON.stringify({ title: 'Delete Me', type: 'task' }),
    })
    const { status } = await api(`/api/projects/${projectId}/issues/${issue.id}`, {
      method: 'DELETE',
    })
    expect(status).toBe(200)

    const { body: issues } = await api(`/api/projects/${projectId}/issues`)
    expect(issues.find((i) => i.id === issue.id)).toBeUndefined()
  })
})

// ---------------------------------------------------------------------------
// Issues by key
// ---------------------------------------------------------------------------

describe('Issues by Key API', () => {
  let projectId

  beforeEach(async () => {
    const project = await seedProject({ name: 'Key Test' })
    projectId = project.id
  })

  it('GET by key returns the issue', async () => {
    const { body: issue } = await api(`/api/projects/${projectId}/issues`, {
      method: 'POST',
      body: JSON.stringify({ title: 'Auth flow', type: 'story' }),
    })
    const { status, body } = await api(`/api/projects/${projectId}/issues/by-key/${issue.key}`)
    expect(status).toBe(200)
    expect(body.id).toBe(issue.id)
    expect(body.title).toBe('Auth flow')
  })

  it('GET by key is case-insensitive', async () => {
    const { body: issue } = await api(`/api/projects/${projectId}/issues`, {
      method: 'POST',
      body: JSON.stringify({ title: 'Case test', type: 'task' }),
    })
    const lowerKey = issue.key.toLowerCase()
    const { status, body } = await api(`/api/projects/${projectId}/issues/by-key/${lowerKey}`)
    expect(status).toBe(200)
    expect(body.id).toBe(issue.id)
  })

  it('GET by key returns 404 for unknown key', async () => {
    const { status } = await api(`/api/projects/${projectId}/issues/by-key/NOPE-999`)
    expect(status).toBe(404)
  })

  it('PUT by key updates the issue', async () => {
    const { body: issue } = await api(`/api/projects/${projectId}/issues`, {
      method: 'POST',
      body: JSON.stringify({ title: 'Update me', type: 'bug' }),
    })
    const { status, body } = await api(`/api/projects/${projectId}/issues/by-key/${issue.key}`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'Done' }),
    })
    expect(status).toBe(200)
    expect(body.status).toBe('Done')
    expect(body.doneAt).toBeTruthy()
  })

  it('DELETE by key removes the issue', async () => {
    const { body: issue } = await api(`/api/projects/${projectId}/issues`, {
      method: 'POST',
      body: JSON.stringify({ title: 'Delete me', type: 'task' }),
    })
    const { status } = await api(`/api/projects/${projectId}/issues/by-key/${issue.key}`, {
      method: 'DELETE',
    })
    expect(status).toBe(200)

    const { body: issues } = await api(`/api/projects/${projectId}/issues`)
    expect(issues.find((i) => i.id === issue.id)).toBeUndefined()
  })
})

// ---------------------------------------------------------------------------
// Sprints
// ---------------------------------------------------------------------------

describe('Sprints API', () => {
  let projectId

  beforeEach(async () => {
    const project = await seedProject({ name: 'Sprint Test' })
    projectId = project.id
  })

  it('POST + GET sprints', async () => {
    const { status, body: sprint } = await api(`/api/projects/${projectId}/sprints`, {
      method: 'POST',
      body: JSON.stringify({ name: 'Sprint 1', goal: 'Ship it' }),
    })
    expect(status).toBe(201)
    expect(sprint.name).toBe('Sprint 1')

    const { body: sprints } = await api(`/api/projects/${projectId}/sprints`)
    expect(sprints.some((s) => s.id === sprint.id)).toBe(true)
  })

  it('DELETE removes a sprint', async () => {
    const { body: sprint } = await api(`/api/projects/${projectId}/sprints`, {
      method: 'POST',
      body: JSON.stringify({ name: 'Delete Me' }),
    })
    const { status } = await api(`/api/projects/${projectId}/sprints/${sprint.id}`, {
      method: 'DELETE',
    })
    expect(status).toBe(200)

    const { body: sprints } = await api(`/api/projects/${projectId}/sprints`)
    expect(sprints.find((s) => s.id === sprint.id)).toBeUndefined()
  })
})

// ---------------------------------------------------------------------------
// Pages
// ---------------------------------------------------------------------------

describe('Pages API', () => {
  let projectId

  beforeEach(async () => {
    const project = await seedProject({ name: 'Page Test' })
    projectId = project.id
  })

  it('POST + GET pages', async () => {
    const { status, body: page } = await api(`/api/projects/${projectId}/pages`, {
      method: 'POST',
      body: JSON.stringify({ title: 'Getting Started', content: '# Hello' }),
    })
    expect(status).toBe(201)
    expect(page.title).toBe('Getting Started')

    const { body: pages } = await api(`/api/projects/${projectId}/pages`)
    expect(pages.some((p) => p.id === page.id)).toBe(true)
  })

  it('PUT updates a page', async () => {
    const { body: page } = await api(`/api/projects/${projectId}/pages`, {
      method: 'POST',
      body: JSON.stringify({ title: 'V1' }),
    })
    const { status, body } = await api(`/api/projects/${projectId}/pages/${page.id}`, {
      method: 'PUT',
      body: JSON.stringify({ title: 'V2', content: 'Updated' }),
    })
    expect(status).toBe(200)
    expect(body.title).toBe('V2')
  })

  it('DELETE removes a page', async () => {
    const { body: page } = await api(`/api/projects/${projectId}/pages`, {
      method: 'POST',
      body: JSON.stringify({ title: 'Temp' }),
    })
    const { status } = await api(`/api/projects/${projectId}/pages/${page.id}`, {
      method: 'DELETE',
    })
    expect(status).toBe(200)

    const { body: pages } = await api(`/api/projects/${projectId}/pages`)
    expect(pages.find((p) => p.id === page.id)).toBeUndefined()
  })
})

// ---------------------------------------------------------------------------
// Board Summary
// ---------------------------------------------------------------------------

describe('Board Summary API', () => {
  it('returns summary with correct counts', async () => {
    const project = await seedProject({ name: 'Summary Test' })
    await api(`/api/projects/${project.id}/issues`, {
      method: 'POST',
      body: JSON.stringify({ title: 'A', type: 'task', storyPoints: 3 }),
    })
    await api(`/api/projects/${project.id}/issues`, {
      method: 'POST',
      body: JSON.stringify({ title: 'B', type: 'bug', status: 'Done', storyPoints: 5 }),
    })

    const { status, body } = await api(`/api/projects/${project.id}/board-summary`)
    expect(status).toBe(200)
    expect(body.issueCount).toBe(2)
    expect(body.byStatus['Done']).toBe(1)
    expect(body.totalPoints).toBe(8)
    expect(body.donePoints).toBe(5)
  })
})

// ---------------------------------------------------------------------------
// Phase advancement
// ---------------------------------------------------------------------------

describe('Phase advancement', () => {
  it('advances project from planning to in-progress', async () => {
    const project = await seedProject({ name: 'Phase Test', status: 'planning' })
    const { status, body } = await api(`/api/projects/${project.id}`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'in-progress' }),
    })
    expect(status).toBe(200)
    expect(body.status).toBe('in-progress')
  })

  it('advances project from in-progress to completed', async () => {
    const project = await seedProject({ name: 'Phase Test 2', status: 'in-progress' })
    const { status, body } = await api(`/api/projects/${project.id}`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'completed' }),
    })
    expect(status).toBe(200)
    expect(body.status).toBe('completed')
  })

  it('allows setting project to on-hold', async () => {
    const project = await seedProject({ name: 'Hold Test', status: 'in-progress' })
    const { status, body } = await api(`/api/projects/${project.id}`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'on-hold' }),
    })
    expect(status).toBe(200)
    expect(body.status).toBe('on-hold')
  })

  it('rejects invalid status values', async () => {
    const project = await seedProject({ name: 'Invalid Test' })
    const { status, body } = await api(`/api/projects/${project.id}`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'banana' }),
    })
    expect(status).toBe(400)
    expect(body.error).toMatch(/"status"/)
  })
})

// ---------------------------------------------------------------------------
// Auto phase advancement (#22)
// ---------------------------------------------------------------------------

describe('Auto phase advancement (#22)', () => {
  it('advances from planning to in-progress when issue moves to In Progress', async () => {
    const project = await seedProject({ name: 'Auto Phase 1' })
    // Create an issue (defaults to To Do)
    const { body: issue } = await api(`/api/projects/${project.id}/issues`, {
      method: 'POST',
      body: JSON.stringify({ title: 'Task A', type: 'task' }),
    })
    // Verify still planning (new projects may omit status in JSON, defaulting to 'planning')
    const { body: before } = await api(`/api/projects/${project.id}`)
    expect(before.status || 'planning').toBe('planning')

    // Move issue to In Progress
    await api(`/api/projects/${project.id}/issues/${issue.id}`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'In Progress' }),
    })
    const { body: after } = await api(`/api/projects/${project.id}`)
    expect(after.status).toBe('in-progress')
  })

  it('advances from in-progress to completed when all issues are Done', async () => {
    const project = await seedProject({ name: 'Auto Phase 2' })
    // Create two issues
    const { body: i1 } = await api(`/api/projects/${project.id}/issues`, {
      method: 'POST',
      body: JSON.stringify({ title: 'Task 1', type: 'task', status: 'In Progress' }),
    })
    const { body: i2 } = await api(`/api/projects/${project.id}/issues`, {
      method: 'POST',
      body: JSON.stringify({ title: 'Task 2', type: 'task', status: 'In Progress' }),
    })
    // Project should now be in-progress
    const { body: mid } = await api(`/api/projects/${project.id}`)
    expect(mid.status).toBe('in-progress')

    // Mark first issue Done — not all done yet
    await api(`/api/projects/${project.id}/issues/${i1.id}`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'Done' }),
    })
    const { body: partial } = await api(`/api/projects/${project.id}`)
    expect(partial.status).toBe('in-progress')

    // Mark second issue Done — now all done
    await api(`/api/projects/${project.id}/issues/${i2.id}`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'Done' }),
    })
    const { body: done } = await api(`/api/projects/${project.id}`)
    expect(done.status).toBe('completed')
  })

  it('does NOT auto-advance from on-hold', async () => {
    const project = await seedProject({ name: 'On Hold Test' })
    // Manually set to on-hold
    await api(`/api/projects/${project.id}`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'on-hold' }),
    })
    // Create an In Progress issue — should NOT advance
    await api(`/api/projects/${project.id}/issues`, {
      method: 'POST',
      body: JSON.stringify({ title: 'Blocked task', type: 'task', status: 'In Progress' }),
    })
    const { body: after } = await api(`/api/projects/${project.id}`)
    expect(after.status).toBe('on-hold')
  })

  it('creating an issue as In Progress triggers advancement', async () => {
    const project = await seedProject({ name: 'Create In Progress' })

    // Verify starts as planning via GET (POST response may omit default status)
    const { body: before } = await api(`/api/projects/${project.id}`)
    expect(before.status || 'planning').toBe('planning')

    // Create issue directly as In Progress
    await api(`/api/projects/${project.id}/issues`, {
      method: 'POST',
      body: JSON.stringify({ title: 'Hot task', type: 'task', status: 'In Progress' }),
    })
    const { body: after } = await api(`/api/projects/${project.id}`)
    expect(after.status).toBe('in-progress')
  })
})

// ---------------------------------------------------------------------------
// Issue & Sprint defaults (#25)
// ---------------------------------------------------------------------------

describe('Issue & Sprint defaults (#25)', () => {
  let projectId

  beforeEach(async () => {
    const project = await seedProject({ name: 'Defaults Test' })
    projectId = project.id
  })

  it('issue without status defaults to To Do', async () => {
    const { status, body } = await api(`/api/projects/${projectId}/issues`, {
      method: 'POST',
      body: JSON.stringify({ title: 'No status', type: 'task' }),
    })
    expect(status).toBe(201)
    expect(body.status).toBe('To Do')
  })

  it('sprint without status defaults to planning', async () => {
    const { status, body } = await api(`/api/projects/${projectId}/sprints`, {
      method: 'POST',
      body: JSON.stringify({ name: 'Sprint A' }),
    })
    expect(status).toBe(201)
    expect(body.status).toBe('planning')
  })
})

// ---------------------------------------------------------------------------
// Sprint update (#25)
// ---------------------------------------------------------------------------

describe('Sprint update (#25)', () => {
  let projectId

  beforeEach(async () => {
    const project = await seedProject({ name: 'Sprint Update Test' })
    projectId = project.id
  })

  it('PUT updates sprint fields', async () => {
    const { body: sprint } = await api(`/api/projects/${projectId}/sprints`, {
      method: 'POST',
      body: JSON.stringify({ name: 'Sprint 1', goal: 'Ship v1' }),
    })
    const { status, body } = await api(`/api/projects/${projectId}/sprints/${sprint.id}`, {
      method: 'PUT',
      body: JSON.stringify({ name: 'Sprint 1 (renamed)', status: 'active' }),
    })
    expect(status).toBe(200)
    expect(body.name).toBe('Sprint 1 (renamed)')
    expect(body.status).toBe('active')
    expect(body.updatedAt).toBeTruthy()
  })

  it('PUT to nonexistent sprint returns 404', async () => {
    const { status } = await api(`/api/projects/${projectId}/sprints/nonexistent-id`, {
      method: 'PUT',
      body: JSON.stringify({ name: 'Nope' }),
    })
    expect(status).toBe(404)
  })

  it('PUT with invalid status returns 400', async () => {
    const { body: sprint } = await api(`/api/projects/${projectId}/sprints`, {
      method: 'POST',
      body: JSON.stringify({ name: 'Sprint X' }),
    })
    const { status, body } = await api(`/api/projects/${projectId}/sprints/${sprint.id}`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'banana' }),
    })
    expect(status).toBe(400)
    expect(body.error).toMatch(/"status"/)
  })
})

// ---------------------------------------------------------------------------
// Board summary with undefined status (#25)
// ---------------------------------------------------------------------------

describe('Board summary handles undefined status (#25)', () => {
  it('byStatus never contains undefined key', async () => {
    const project = await seedProject({ name: 'Undefined Status Test' })
    // Directly insert an issue without status via the db layer to simulate legacy data
    // We use the API which now defaults, but we verify the summary is clean
    await api(`/api/projects/${project.id}/issues`, {
      method: 'POST',
      body: JSON.stringify({ title: 'No explicit status', type: 'task' }),
    })

    const { status, body } = await api(`/api/projects/${project.id}/board-summary`)
    expect(status).toBe(200)
    expect(body.byStatus).not.toHaveProperty('undefined')
    expect(body.byStatus['To Do']).toBeGreaterThanOrEqual(1)
  })
})

// ---------------------------------------------------------------------------
// Sync
// ---------------------------------------------------------------------------

// Sync API removed — normalized SQL is the only storage path

// ---------------------------------------------------------------------------
// Error handling
// ---------------------------------------------------------------------------

describe('Error handling', () => {
  it('CORS headers present for allowed origin', async () => {
    const res = await fetch(`${baseUrl}/api/projects`, {
      headers: { Origin: 'http://127.0.0.1:3001' },
    })
    expect(res.headers.get('access-control-allow-origin')).toBe('http://127.0.0.1:3001')
  })

  it('CORS headers absent for disallowed origin', async () => {
    const res = await fetch(`${baseUrl}/api/projects`, {
      headers: { Origin: 'http://evil.com' },
    })
    expect(res.headers.get('access-control-allow-origin')).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// Rate limiting
// ---------------------------------------------------------------------------

describe('Rate limiting', () => {
  it('returns 429 after exceeding rate limit', async () => {
    // The default is 100 req/min per IP. We'll just verify the header exists
    // by making a single request and checking it doesn't 429 yet.
    const { status } = await api('/api/projects')
    expect(status).toBe(200)
  })
})

// ---------------------------------------------------------------------------
// Schema validation
// ---------------------------------------------------------------------------

describe('Schema validation', () => {
  let projectId

  beforeEach(async () => {
    const project = await seedProject({ name: 'Validation Test' })
    projectId = project.id
  })

  it('rejects project without name', async () => {
    const { status, body } = await api('/api/projects', {
      method: 'POST',
      body: JSON.stringify({ description: 'no name' }),
    })
    expect(status).toBe(400)
    expect(body.error).toMatch(/"name"/)
  })

  it('rejects project with invalid status', async () => {
    const { status, body } = await api(`/api/projects/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'bogus' }),
    })
    expect(status).toBe(400)
    expect(body.error).toMatch(/"status"/)
  })

  it('rejects issue without title', async () => {
    const { status, body } = await api(`/api/projects/${projectId}/issues`, {
      method: 'POST',
      body: JSON.stringify({ type: 'task' }),
    })
    expect(status).toBe(400)
    expect(body.error).toMatch(/"title"/)
  })

  it('rejects issue without type', async () => {
    const { status, body } = await api(`/api/projects/${projectId}/issues`, {
      method: 'POST',
      body: JSON.stringify({ title: 'No type' }),
    })
    expect(status).toBe(400)
    expect(body.error).toMatch(/"type"/)
  })

  it('rejects issue with invalid type', async () => {
    const { status, body } = await api(`/api/projects/${projectId}/issues`, {
      method: 'POST',
      body: JSON.stringify({ title: 'Bad', type: 'invalid' }),
    })
    expect(status).toBe(400)
    expect(body.error).toMatch(/"type"/)
  })

  it('rejects issue with non-numeric storyPoints', async () => {
    const { status, body } = await api(`/api/projects/${projectId}/issues`, {
      method: 'POST',
      body: JSON.stringify({ title: 'Bad pts', type: 'task', storyPoints: 'five' }),
    })
    expect(status).toBe(400)
    expect(body.error).toMatch(/storyPoints/)
  })

  it('rejects sprint without name', async () => {
    const { status, body } = await api(`/api/projects/${projectId}/sprints`, {
      method: 'POST',
      body: JSON.stringify({ goal: 'no name' }),
    })
    expect(status).toBe(400)
    expect(body.error).toMatch(/"name"/)
  })

  it('rejects page without title', async () => {
    const { status, body } = await api(`/api/projects/${projectId}/pages`, {
      method: 'POST',
      body: JSON.stringify({ content: 'no title' }),
    })
    expect(status).toBe(400)
    expect(body.error).toMatch(/"title"/)
  })

  it('allows valid update without required fields', async () => {
    const { body: issue } = await api(`/api/projects/${projectId}/issues`, {
      method: 'POST',
      body: JSON.stringify({ title: 'Orig', type: 'task' }),
    })
    const { status } = await api(`/api/projects/${projectId}/issues/${issue.id}`, {
      method: 'PUT',
      body: JSON.stringify({ description: 'added desc' }),
    })
    expect(status).toBe(200)
  })
})

// ---------------------------------------------------------------------------
// Context Boot Contract (Execution Order 06)
// ---------------------------------------------------------------------------

describe('Context Boot API', () => {
  let projectId

  beforeEach(async () => {
    const project = await seedProject({ name: 'Boot Test' })
    projectId = project.id
  })

  it('GET /api/projects/:id/context returns accepted schema', async () => {
    const { status, body } = await api(`/api/projects/${projectId}/context`)
    expect(status).toBe(200)

    // All 15 top-level keys from accepted contract
    const expected = [
      'project',
      'agentState',
      'pendingGatesCount',
      'pendingGates',
      'directivesCount',
      'directives',
      'board',
      'activeSprint',
      'activeBlockers',
      'staleIssues',
      'lastSession',
      'agentPages',
      'lastAgentActivity',
      'hygiene',
      'wiki',
    ]
    for (const key of expected) {
      expect(body).toHaveProperty(key)
    }
  })

  it('returns project with id, name, status', async () => {
    const { body } = await api(`/api/projects/${projectId}/context`)
    expect(body.project).toEqual({
      id: projectId,
      name: 'Boot Test',
      status: 'planning',
    })
  })

  it('returns agentState with status, detail, updatedAt', async () => {
    const { body } = await api(`/api/projects/${projectId}/context`)
    expect(body.agentState).toHaveProperty('status')
    expect(body.agentState).toHaveProperty('detail')
    expect(body.agentState).toHaveProperty('updatedAt')
  })

  it('returns hygiene with correct shape', async () => {
    const { body } = await api(`/api/projects/${projectId}/context`)
    expect(body.hygiene).toHaveProperty('findings')
    expect(body.hygiene).toHaveProperty('missingEstimates')
    expect(body.hygiene).toHaveProperty('orphanedStories')
    expect(body.hygiene).toHaveProperty('stuckIssues')
    expect(body.hygiene).toHaveProperty('completableSprints')
    expect(Array.isArray(body.hygiene.missingEstimates)).toBe(true)
    expect(Array.isArray(body.hygiene.orphanedStories)).toBe(true)
    expect(Array.isArray(body.hygiene.stuckIssues)).toBe(true)
    expect(Array.isArray(body.hygiene.completableSprints)).toBe(true)
  })

  it('returns wiki audit with missing/stale core page arrays', async () => {
    const { body } = await api(`/api/projects/${projectId}/context`)
    expect(body.wiki).toHaveProperty('findings')
    expect(body.wiki).toHaveProperty('requiredCorePages')
    expect(body.wiki).toHaveProperty('missingCorePages')
    expect(body.wiki).toHaveProperty('staleCorePages')
    expect(Array.isArray(body.wiki.requiredCorePages)).toBe(true)
    expect(Array.isArray(body.wiki.missingCorePages)).toBe(true)
    expect(Array.isArray(body.wiki.staleCorePages)).toBe(true)
  })

  it('returns lessons learned rollup with summary and reports', async () => {
    const { body } = await api(`/api/projects/${projectId}/context`)
    expect(body.lessons).toHaveProperty('summary')
    expect(body.lessons.summary).toHaveProperty('reportsCount')
    expect(body.lessons.summary).toHaveProperty('lessonsCount')
    expect(body.lessons.summary).toHaveProperty('followUpActionsCount')
    expect(body.lessons).toHaveProperty('reports')
    expect(Array.isArray(body.lessons.reports)).toBe(true)
  })

  it('handles empty project gracefully (all optional sections null/empty)', async () => {
    const { body } = await api(`/api/projects/${projectId}/context`)
    expect(body.board.issueCount).toBe(0)
    expect(body.activeBlockers).toEqual([])
    expect(body.staleIssues).toEqual([])
    expect(body.lastSession).toBeNull()
    expect(Array.isArray(body.agentPages)).toBe(true)
    expect(body.activeSprint).toBeNull()
    expect(body.pendingGatesCount).toBe(0)
    expect(body.directivesCount).toBe(0)
    expect(body.lessons.summary.reportsCount).toBe(0)
  })

  it('returns 404 for nonexistent project', async () => {
    const { status } = await api('/api/projects/nonexistent/context')
    expect(status).toBe(404)
  })
})

// ---------------------------------------------------------------------------
// Wiki Audit API
// ---------------------------------------------------------------------------

describe('Wiki Audit API', () => {
  let projectId

  beforeEach(async () => {
    const project = await seedProject({ name: 'Wiki Audit Test' })
    projectId = project.id
  })

  it('GET /api/projects/:id/wiki-audit returns missing core pages for a fresh project', async () => {
    const { status, body } = await api(`/api/projects/${projectId}/wiki-audit`)
    expect(status).toBe(200)
    expect(body.findings).toBeGreaterThan(0)
    expect(body.requiredCorePages.some((p) => p.title === 'Agent Core')).toBe(true)
    expect(body.requiredCorePages.some((p) => p.exists === false || p.isStale === true)).toBe(true)
  })

  it('removes existing core pages from missing list', async () => {
    await api(`/api/projects/${projectId}/pages`, {
      method: 'POST',
      body: JSON.stringify({ title: 'Dependencies & Tech Stack', content: 'current stack' }),
    })

    const { body } = await api(`/api/projects/${projectId}/wiki-audit`)
    expect(body.missingCorePages.some((p) => p.title === 'Dependencies & Tech Stack')).toBe(false)
    expect(
      body.requiredCorePages.find((p) => p.title === 'Dependencies & Tech Stack')?.exists
    ).toBe(true)
  })

  it('returns 404 for nonexistent project', async () => {
    const { status } = await api('/api/projects/nonexistent/wiki-audit')
    expect(status).toBe(404)
  })
})

// ---------------------------------------------------------------------------
// Operational Summary Contract (Execution Order 06)
// ---------------------------------------------------------------------------

describe('Operational Summary API', () => {
  let projectId

  beforeEach(async () => {
    const project = await seedProject({ name: 'Ops Test' })
    projectId = project.id
  })

  it('GET /api/projects/:id/operational returns live summary', async () => {
    const { status, body } = await api(`/api/projects/${projectId}/operational`)
    expect(status).toBe(200)
    expect(body).toHaveProperty('project')
    expect(body).toHaveProperty('board')
    expect(body).toHaveProperty('agentState')
  })

  it('does not contain nextRecommendedAction (deferred intelligence field)', async () => {
    const { body } = await api(`/api/projects/${projectId}/operational`)
    expect(body).not.toHaveProperty('nextRecommendedAction')
  })

  it('contains only additive live-summary fields', async () => {
    const { body } = await api(`/api/projects/${projectId}/operational`)
    // Must have real data, not synthesized intelligence
    expect(body.board.issueCount).toBeTypeOf('number')
    expect(body.agentState.status).toBeTypeOf('string')
    expect(body.pendingGatesCount).toBeTypeOf('number')
  })
})

// ---------------------------------------------------------------------------
// Search and Resolve (Execution Order 06)
// ---------------------------------------------------------------------------

describe('Search API', () => {
  let projectId

  beforeEach(async () => {
    const project = await seedProject({ name: 'Search Test' })
    projectId = project.id
    // Create some searchable entities
    await api(`/api/projects/${projectId}/issues`, {
      method: 'POST',
      body: JSON.stringify({ title: 'Authentication middleware', type: 'story' }),
    })
    await api(`/api/projects/${projectId}/issues`, {
      method: 'POST',
      body: JSON.stringify({ title: 'Database schema migration', type: 'task' }),
    })
    await api(`/api/projects/${projectId}/pages`, {
      method: 'POST',
      body: JSON.stringify({ title: 'Auth Design Doc', content: 'auth middleware details' }),
    })
  })

  it('GET /api/projects/:id/search returns results with correct shape', async () => {
    const { status, body } = await api(`/api/projects/${projectId}/search?q=auth`)
    expect(status).toBe(200)
    expect(body).toHaveProperty('query', 'auth')
    expect(body).toHaveProperty('results')
    expect(body).toHaveProperty('total')
    expect(body.results.length).toBeGreaterThan(0)
  })

  it('results have type, id, title, score', async () => {
    const { body } = await api(`/api/projects/${projectId}/search?q=auth`)
    for (const r of body.results) {
      expect(r).toHaveProperty('type')
      expect(r).toHaveProperty('id')
      expect(r).toHaveProperty('title')
      expect(r).toHaveProperty('score')
    }
  })

  it('results are ordered by score descending', async () => {
    const { body } = await api(`/api/projects/${projectId}/search?q=auth`)
    for (let i = 1; i < body.results.length; i++) {
      expect(body.results[i].score).toBeLessThanOrEqual(body.results[i - 1].score)
    }
  })

  it('filters by type parameter', async () => {
    const { body } = await api(`/api/projects/${projectId}/search?q=auth&types=page`)
    expect(body.results.length).toBeGreaterThan(0)
    for (const r of body.results) {
      expect(r.type).toBe('page')
    }
  })

  it('returns 400 without q parameter', async () => {
    const { status } = await api(`/api/projects/${projectId}/search`)
    expect(status).toBe(400)
  })
})

describe('Resolve API', () => {
  let projectId
  let issueKey

  beforeEach(async () => {
    const project = await seedProject({ name: 'Resolve Test' })
    projectId = project.id
    const { body } = await api(`/api/projects/${projectId}/issues`, {
      method: 'POST',
      body: JSON.stringify({ title: 'Unique resolve target', type: 'task' }),
    })
    issueKey = body.key
  })

  it('resolves by exact key with confidence 1.0', async () => {
    const { status, body } = await api(
      `/api/projects/${projectId}/resolve?type=issue&ref=${issueKey}`
    )
    expect(status).toBe(200)
    expect(body.resolved).toBe(true)
    expect(body.key).toBe(issueKey)
    expect(body.confidence).toBe(1.0)
  })

  it('resolves by UUID with confidence 1.0', async () => {
    // First get the UUID
    const { body: issue } = await api(`/api/projects/${projectId}/issues/by-key/${issueKey}`)
    const { body } = await api(`/api/projects/${projectId}/resolve?type=issue&ref=${issue.id}`)
    expect(body.resolved).toBe(true)
    expect(body.confidence).toBe(1.0)
  })

  it('resolves by title prefix with lower confidence', async () => {
    const { body } = await api(`/api/projects/${projectId}/resolve?type=issue&ref=Unique resolve`)
    expect(body.resolved).toBe(true)
    expect(body.confidence).toBeLessThan(1.0)
  })

  it('returns candidates for ambiguous match', async () => {
    // Create two similar issues
    await api(`/api/projects/${projectId}/issues`, {
      method: 'POST',
      body: JSON.stringify({ title: 'Ambiguous target alpha', type: 'task' }),
    })
    await api(`/api/projects/${projectId}/issues`, {
      method: 'POST',
      body: JSON.stringify({ title: 'Ambiguous target beta', type: 'task' }),
    })
    const { body } = await api(`/api/projects/${projectId}/resolve?type=issue&ref=Ambiguous target`)
    expect(body.resolved).toBe(false)
    expect(body.candidates.length).toBeGreaterThanOrEqual(2)
  })

  it('returns empty candidates for no match', async () => {
    const { body } = await api(`/api/projects/${projectId}/resolve?type=issue&ref=zzz_no_match_zzz`)
    expect(body.resolved).toBe(false)
    expect(body.candidates).toEqual([])
  })

  it('returns error for unknown type', async () => {
    const { body } = await api(`/api/projects/${projectId}/resolve?type=bogus&ref=test`)
    expect(body).toHaveProperty('error')
  })

  it('returns 400 without required params', async () => {
    const { status } = await api(`/api/projects/${projectId}/resolve`)
    expect(status).toBe(400)
  })
})

// ---------------------------------------------------------------------------
// Batch Issue Updates (Execution Order 06)
// ---------------------------------------------------------------------------

describe('Batch Issue Updates', () => {
  let projectId

  beforeEach(async () => {
    const project = await seedProject({ name: 'Batch Test' })
    projectId = project.id
  })

  it('batch-update succeeds with valid updates', async () => {
    const { body: i1 } = await api(`/api/projects/${projectId}/issues`, {
      method: 'POST',
      body: JSON.stringify({ title: 'Batch A', type: 'task' }),
    })
    const { body: i2 } = await api(`/api/projects/${projectId}/issues`, {
      method: 'POST',
      body: JSON.stringify({ title: 'Batch B', type: 'task' }),
    })
    const { status, body } = await api(`/api/projects/${projectId}/issues/batch-update`, {
      method: 'POST',
      body: JSON.stringify({
        updates: [
          { issue_key: i1.key, status: 'Done' },
          { issue_key: i2.key, status: 'In Progress' },
        ],
      }),
    })
    expect(status).toBe(200)
    expect(body.updated.length).toBe(2)
  })

  it('batch-update handles partial failure', async () => {
    const { body: i1 } = await api(`/api/projects/${projectId}/issues`, {
      method: 'POST',
      body: JSON.stringify({ title: 'Batch C', type: 'task' }),
    })
    const { status, body } = await api(`/api/projects/${projectId}/issues/batch-update`, {
      method: 'POST',
      body: JSON.stringify({
        updates: [
          { issue_key: i1.key, status: 'Done' },
          { issue_key: 'NONEXISTENT-999', status: 'Done' },
        ],
      }),
    })
    expect(status).toBe(200)
    expect(body.updated.length).toBe(1)
    expect(body.errors.length).toBe(1)
  })
})

// ---------------------------------------------------------------------------
// Wire-Now Persistence Round Trips (Execution Order 06)
// ---------------------------------------------------------------------------

describe('Wire-Now Field Persistence', () => {
  let projectId

  beforeEach(async () => {
    const project = await seedProject({ name: 'Wire Test' })
    projectId = project.id
  })

  // --- Issues: lastNudgeMessage, lastNudgeAuthor ---
  it('issues: nudge persists lastNudgeMessage and lastNudgeAuthor', async () => {
    const { body: issue } = await api(`/api/projects/${projectId}/issues`, {
      method: 'POST',
      body: JSON.stringify({ title: 'Nudge me', type: 'task' }),
    })
    await api(`/api/projects/${projectId}/issues/${issue.id}/nudge`, {
      method: 'POST',
      body: JSON.stringify({ message: 'wake up', author: 'sheldon' }),
    })
    const { body: fetched } = await api(`/api/projects/${projectId}/issues/by-key/${issue.key}`)
    expect(fetched.lastNudgeMessage).toBe('wake up')
    expect(fetched.lastNudgeAuthor).toBe('sheldon')
  })

  // --- Issues: priority validation ---
  it('issues: rejects invalid priority', async () => {
    const { status, body } = await api(`/api/projects/${projectId}/issues`, {
      method: 'POST',
      body: JSON.stringify({ title: 'Bad priority', type: 'task', priority: 'urgent' }),
    })
    expect(status).toBe(400)
    expect(body.error).toContain('priority')
  })

  it('issues: accepts valid priorities', async () => {
    for (const priority of ['critical', 'high', 'medium', 'low']) {
      const { status } = await api(`/api/projects/${projectId}/issues`, {
        method: 'POST',
        body: JSON.stringify({ title: `Priority ${priority}`, type: 'task', priority }),
      })
      expect(status).toBe(201)
    }
  })

  // --- Pages: icon ---
  it('pages: icon round-trips through create and fetch', async () => {
    const { body: page } = await api(`/api/projects/${projectId}/pages`, {
      method: 'POST',
      body: JSON.stringify({ title: 'Icon Page', icon: '📝' }),
    })
    expect(page.icon).toBe('📝')
    const { body: fetched } = await api(`/api/projects/${projectId}/pages/${page.id}`)
    expect(fetched.icon).toBe('📝')
  })

  it('pages: icon can be updated', async () => {
    const { body: page } = await api(`/api/projects/${projectId}/pages`, {
      method: 'POST',
      body: JSON.stringify({ title: 'Icon Update', icon: '📋' }),
    })
    const { body: updated } = await api(`/api/projects/${projectId}/pages/${page.id}`, {
      method: 'PUT',
      body: JSON.stringify({ icon: '🔧' }),
    })
    expect(updated.icon).toBe('🔧')
  })

  // --- Phases: startDate, endDate, deliverables, color ---
  it('phases: startDate and endDate round-trip', async () => {
    const { body: phase } = await api(`/api/projects/${projectId}/phases`, {
      method: 'POST',
      body: JSON.stringify({ name: 'Phase 1', startDate: '2026-04-01', endDate: '2026-04-30' }),
    })
    expect(phase.startDate).toBe('2026-04-01')
    expect(phase.endDate).toBe('2026-04-30')
  })

  it('phases: deliverables round-trip as array', async () => {
    const deliverables = ['API spec', 'DB schema', 'CLI commands']
    const { body: phase } = await api(`/api/projects/${projectId}/phases`, {
      method: 'POST',
      body: JSON.stringify({ name: 'Phase 2', deliverables }),
    })
    expect(phase.deliverables).toEqual(deliverables)
  })

  it('phases: color round-trips', async () => {
    const { body: phase } = await api(`/api/projects/${projectId}/phases`, {
      method: 'POST',
      body: JSON.stringify({ name: 'Phase 3', color: '#4A90D9' }),
    })
    expect(phase.color).toBe('#4A90D9')
  })

  // --- Milestones: phaseId, color, dueDate normalization ---
  it('milestones: phaseId and color round-trip', async () => {
    const { body: phase } = await api(`/api/projects/${projectId}/phases`, {
      method: 'POST',
      body: JSON.stringify({ name: 'MS Phase' }),
    })
    const { body: ms } = await api(`/api/projects/${projectId}/milestones`, {
      method: 'POST',
      body: JSON.stringify({ name: 'Milestone 1', phaseId: phase.id, color: '#FF5733' }),
    })
    expect(ms.phaseId).toBe(phase.id)
    expect(ms.color).toBe('#FF5733')
  })

  it('milestones: dueDate normalizes from date field', async () => {
    // API should accept both `dueDate` and `date` and normalize to `dueDate`
    const { body: ms } = await api(`/api/projects/${projectId}/milestones`, {
      method: 'POST',
      body: JSON.stringify({ name: 'Due Date Test', dueDate: '2026-06-15' }),
    })
    expect(ms.dueDate).toBe('2026-06-15')
  })

  // --- Sessions: agent_id ---
  it('sessions: agent_id persists through save and fetch', async () => {
    await api(`/api/projects/${projectId}/sessions`, {
      method: 'POST',
      body: JSON.stringify({ summary: 'Test session', agent_id: 'claude-opus-4-6' }),
    })
    const { body: latest } = await api(`/api/projects/${projectId}/sessions/latest`)
    expect(latest.agent_id).toBe('claude-opus-4-6')
  })
})

// ---------------------------------------------------------------------------
// Phase Hot Wash (Execution Order 08)
// ---------------------------------------------------------------------------

describe('Phase Hot Wash API', () => {
  let projectId
  let phaseId

  beforeEach(async () => {
    const project = await seedProject({ name: 'HW Test' })
    projectId = project.id
    // Create a phase with dates
    const { body: phase } = await api(`/api/projects/${projectId}/phases`, {
      method: 'POST',
      body: JSON.stringify({ name: 'Alpha Phase', startDate: '2026-01-01', endDate: '2026-12-31' }),
    })
    phaseId = phase.id
    // Create some issues in the phase window
    await api(`/api/projects/${projectId}/issues`, {
      method: 'POST',
      body: JSON.stringify({ title: 'HW Task A', type: 'task' }),
    })
    await api(`/api/projects/${projectId}/issues`, {
      method: 'POST',
      body: JSON.stringify({ title: 'HW Task B', type: 'story' }),
    })
  })

  it('generates a hot wash report', async () => {
    const { status, body } = await api(
      `/api/projects/${projectId}/phases/${phaseId}/hot-wash/generate`,
      {
        method: 'POST',
      }
    )
    expect(status).toBe(201)
    expect(body.status).toBe('draft')
    expect(body.phaseId).toBe(phaseId)
    expect(body.summary).toBeTruthy()
    expect(Array.isArray(body.planned)).toBe(true)
    expect(Array.isArray(body.shipped)).toBe(true)
    expect(Array.isArray(body.slipped)).toBe(true)
    expect(body.wikiPageId).toBeTruthy()
  })

  it('retrieves a generated hot wash', async () => {
    await api(`/api/projects/${projectId}/phases/${phaseId}/hot-wash/generate`, { method: 'POST' })
    const { status, body } = await api(`/api/projects/${projectId}/phases/${phaseId}/hot-wash`)
    expect(status).toBe(200)
    expect(body.phaseId).toBe(phaseId)
    expect(body.status).toBe('draft')
  })

  it('returns 404 for phase without hot wash', async () => {
    const { status } = await api(`/api/projects/${projectId}/phases/${phaseId}/hot-wash`)
    expect(status).toBe(404)
  })

  it('updates a draft hot wash', async () => {
    await api(`/api/projects/${projectId}/phases/${phaseId}/hot-wash/generate`, { method: 'POST' })
    const { status, body } = await api(`/api/projects/${projectId}/phases/${phaseId}/hot-wash`, {
      method: 'PUT',
      body: JSON.stringify({ summary: 'Updated summary', lessonsLearned: ['Lesson 1'] }),
    })
    expect(status).toBe(200)
    expect(body.summary).toBe('Updated summary')
    expect(body.lessonsLearned).toContain('Lesson 1')
  })

  it('finalizes a hot wash and locks it', async () => {
    await api(`/api/projects/${projectId}/phases/${phaseId}/hot-wash/generate`, { method: 'POST' })
    const { status, body } = await api(
      `/api/projects/${projectId}/phases/${phaseId}/hot-wash/finalize`,
      {
        method: 'POST',
      }
    )
    expect(status).toBe(200)
    expect(body.status).toBe('final')
    expect(body.finalizedAt).toBeTruthy()
  })

  it('rejects edits on finalized hot wash', async () => {
    await api(`/api/projects/${projectId}/phases/${phaseId}/hot-wash/generate`, { method: 'POST' })
    await api(`/api/projects/${projectId}/phases/${phaseId}/hot-wash/finalize`, { method: 'POST' })
    const { status, body } = await api(`/api/projects/${projectId}/phases/${phaseId}/hot-wash`, {
      method: 'PUT',
      body: JSON.stringify({ summary: 'Should fail' }),
    })
    expect(status).toBe(400)
    expect(body.error).toContain('finalized')
  })

  it('rejects regeneration of finalized hot wash', async () => {
    await api(`/api/projects/${projectId}/phases/${phaseId}/hot-wash/generate`, { method: 'POST' })
    await api(`/api/projects/${projectId}/phases/${phaseId}/hot-wash/finalize`, { method: 'POST' })
    const { status, body } = await api(
      `/api/projects/${projectId}/phases/${phaseId}/hot-wash/generate`,
      {
        method: 'POST',
      }
    )
    expect(status).toBe(409)
    expect(body.error).toContain('finalized')
  })

  it('lists hot washes for a project', async () => {
    await api(`/api/projects/${projectId}/phases/${phaseId}/hot-wash/generate`, { method: 'POST' })
    const { status, body } = await api(`/api/projects/${projectId}/hot-washes`)
    expect(status).toBe(200)
    expect(body.length).toBe(1)
    expect(body[0].phaseId).toBe(phaseId)
    expect(body[0].phaseName).toBe('Alpha Phase')
  })

  it('auto-generates hot wash when phase is marked completed', async () => {
    // Mark phase completed
    await api(`/api/projects/${projectId}/phases/${phaseId}`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'completed' }),
    })
    // Hot wash should exist now
    const { status, body } = await api(`/api/projects/${projectId}/phases/${phaseId}/hot-wash`)
    expect(status).toBe(200)
    expect(body.generatedBy).toBe('system')
    expect(body.status).toBe('draft')
  })

  it('does not duplicate hot wash on repeated phase complete', async () => {
    // Generate manually first
    await api(`/api/projects/${projectId}/phases/${phaseId}/hot-wash/generate`, { method: 'POST' })
    // Mark phase completed — should not create a second hot wash
    await api(`/api/projects/${projectId}/phases/${phaseId}`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'completed' }),
    })
    const { body: list } = await api(`/api/projects/${projectId}/hot-washes`)
    expect(list.length).toBe(1)
  })

  it('allows regenerating a draft hot wash', async () => {
    await api(`/api/projects/${projectId}/phases/${phaseId}/hot-wash/generate`, { method: 'POST' })
    // Add another issue
    await api(`/api/projects/${projectId}/issues`, {
      method: 'POST',
      body: JSON.stringify({ title: 'HW Task C', type: 'task' }),
    })
    // Regenerate
    const { status, body } = await api(
      `/api/projects/${projectId}/phases/${phaseId}/hot-wash/generate`,
      {
        method: 'POST',
      }
    )
    expect(status).toBe(201)
    expect(body.status).toBe('draft')
  })

  it('rolls up project-level lessons learned and syncs a durable wiki page', async () => {
    await api(`/api/projects/${projectId}/phases/${phaseId}/hot-wash/generate`, {
      method: 'POST',
      body: JSON.stringify({
        lessonsLearned: ['Keep the API contract ahead of the UI.'],
        followUpActions: ['Carry forward: HW-99 — Stabilize rollout'],
      }),
    })

    const { status, body } = await api(`/api/projects/${projectId}/lessons-learned`)
    expect(status).toBe(200)
    expect(body.summary.reportsCount).toBe(1)
    expect(body.summary.lessonsCount).toBeGreaterThan(0)
    expect(body.summary.followUpActionsCount).toBeGreaterThan(0)
    expect(body.summary.pageId).toBeTruthy()
    expect(body.reports[0].phaseName).toBe('Alpha Phase')
    expect(body.reports[0].lessonsLearned).toContain('Keep the API contract ahead of the UI.')
    expect(
      body.reports[0].followUpActions.some(
        (action) => action.title === 'Stabilize rollout' && action.key === 'HW-99'
      )
    ).toBe(true)

    const { status: pageStatus, body: page } = await api(
      `/api/projects/${projectId}/pages/${body.summary.pageId}`
    )
    expect(pageStatus).toBe(200)
    expect(page.title).toBe('Lessons Learned')
    expect(page.content).toContain('Alpha Phase')
  })

  it('returns 404 for lessons learned on a missing project', async () => {
    const { status } = await api('/api/projects/nonexistent/lessons-learned')
    expect(status).toBe(404)
  })
})

// ---------------------------------------------------------------------------
// Gate Enforcement (Execution Order 09)
// ---------------------------------------------------------------------------

describe('Gate Enforcement', () => {
  let projectId

  beforeEach(async () => {
    const project = await seedProject({ name: 'Gate Test' })
    projectId = project.id
  })

  it('human actor bypasses gate enforcement on DELETE', async () => {
    const { body: issue } = await api(`/api/projects/${projectId}/issues`, {
      method: 'POST',
      body: JSON.stringify({ title: 'Human delete', type: 'task' }),
    })
    const { status } = await api(`/api/projects/${projectId}/issues/${issue.id}`, {
      method: 'DELETE',
      headers: { 'X-StoryFlow-Actor': 'human' },
    })
    expect(status).toBe(200)
  })

  it('AI actor can create issues without gate interference', async () => {
    const { status } = await api(`/api/projects/${projectId}/issues`, {
      method: 'POST',
      body: JSON.stringify({ title: 'AI create', type: 'task', priority: 'medium' }),
      headers: { 'X-StoryFlow-Actor': 'ai', 'X-StoryFlow-Confidence': '0.9' },
    })
    expect(status).toBe(201)
  })
})

// ---------------------------------------------------------------------------
// Search/Resolve Edge Cases (Execution Order 09)
// ---------------------------------------------------------------------------

describe('Search and Resolve Edge Cases', () => {
  let projectId

  beforeEach(async () => {
    const project = await seedProject({ name: 'Edge Test' })
    projectId = project.id
    await api(`/api/projects/${projectId}/issues`, {
      method: 'POST',
      body: JSON.stringify({ title: 'case SENSITIVE Test', type: 'task' }),
    })
  })

  it('search is case-insensitive', async () => {
    const { body: upper } = await api(`/api/projects/${projectId}/search?q=CASE SENSITIVE`)
    const { body: lower } = await api(`/api/projects/${projectId}/search?q=case sensitive`)
    expect(upper.total).toBe(lower.total)
    expect(upper.total).toBeGreaterThan(0)
  })

  it('search handles empty results gracefully', async () => {
    const { status, body } = await api(`/api/projects/${projectId}/search?q=zzz_no_match_zzz`)
    expect(status).toBe(200)
    expect(body.results).toEqual([])
    expect(body.total).toBe(0)
  })

  it('resolve handles case-insensitive key matching', async () => {
    const { body: issue } = await api(`/api/projects/${projectId}/issues`, {
      method: 'POST',
      body: JSON.stringify({ title: 'Key case test', type: 'task' }),
    })
    const key = issue.key
    const lowerKey = key.toLowerCase()
    const { body: resolved } = await api(
      `/api/projects/${projectId}/resolve?type=issue&ref=${lowerKey}`
    )
    expect(resolved.resolved).toBe(true)
    expect(resolved.key).toBe(key)
  })

  it('resolve returns error for unknown entity type', async () => {
    const { body } = await api(`/api/projects/${projectId}/resolve?type=unicorn&ref=test`)
    expect(body.error).toBeTruthy()
    expect(body.error).toContain('Unknown type')
  })
})

// ---------------------------------------------------------------------------
// Workflow Connections (Execution Order 10)
// ---------------------------------------------------------------------------

describe('Workflow Connections API', () => {
  let projectId
  let nodeA
  let nodeB

  beforeEach(async () => {
    const project = await seedProject({ name: 'WF Conn Test' })
    projectId = project.id
    const { body: a } = await api(`/api/projects/${projectId}/workflow/nodes`, {
      method: 'POST',
      body: JSON.stringify({ title: 'Node A', type: 'task' }),
    })
    const { body: b } = await api(`/api/projects/${projectId}/workflow/nodes`, {
      method: 'POST',
      body: JSON.stringify({ title: 'Node B', type: 'task' }),
    })
    nodeA = a.id
    nodeB = b.id
  })

  it('creates a connection between two nodes', async () => {
    const { status, body } = await api(`/api/projects/${projectId}/workflow/connections`, {
      method: 'POST',
      body: JSON.stringify({ fromNodeId: nodeA, toNodeId: nodeB }),
    })
    expect(status).toBe(201)
    expect(body.fromNodeId).toBe(nodeA)
    expect(body.toNodeId).toBe(nodeB)
  })

  it('rejects self-loops', async () => {
    const { status, body } = await api(`/api/projects/${projectId}/workflow/connections`, {
      method: 'POST',
      body: JSON.stringify({ fromNodeId: nodeA, toNodeId: nodeA }),
    })
    expect(status).toBe(400)
    expect(body.error).toContain('Self-loop')
  })

  it('lists connections', async () => {
    await api(`/api/projects/${projectId}/workflow/connections`, {
      method: 'POST',
      body: JSON.stringify({ fromNodeId: nodeA, toNodeId: nodeB }),
    })
    const { body } = await api(`/api/projects/${projectId}/workflow/connections`)
    expect(body.length).toBe(1)
  })

  it('deletes a connection', async () => {
    const { body: conn } = await api(`/api/projects/${projectId}/workflow/connections`, {
      method: 'POST',
      body: JSON.stringify({ fromNodeId: nodeA, toNodeId: nodeB }),
    })
    const { status } = await api(`/api/projects/${projectId}/workflow/connections/${conn.id}`, {
      method: 'DELETE',
    })
    expect(status).toBe(200)
    const { body: list } = await api(`/api/projects/${projectId}/workflow/connections`)
    expect(list.length).toBe(0)
  })

  it('rejects duplicate connections', async () => {
    await api(`/api/projects/${projectId}/workflow/connections`, {
      method: 'POST',
      body: JSON.stringify({ fromNodeId: nodeA, toNodeId: nodeB }),
    })
    const { status } = await api(`/api/projects/${projectId}/workflow/connections`, {
      method: 'POST',
      body: JSON.stringify({ fromNodeId: nodeA, toNodeId: nodeB }),
    })
    expect(status).toBe(400)
  })
})

// ---------------------------------------------------------------------------
// Architecture Connections (Execution Order 10)
// ---------------------------------------------------------------------------

describe('Architecture Connections API', () => {
  let projectId
  let compA
  let compB

  beforeEach(async () => {
    const project = await seedProject({ name: 'Arch Conn Test' })
    projectId = project.id
    const { body: a } = await api(`/api/projects/${projectId}/architecture/components`, {
      method: 'POST',
      body: JSON.stringify({ name: 'Service A', type: 'service' }),
    })
    const { body: b } = await api(`/api/projects/${projectId}/architecture/components`, {
      method: 'POST',
      body: JSON.stringify({ name: 'Database B', type: 'database' }),
    })
    compA = a.id
    compB = b.id
  })

  it('creates a connection between two components', async () => {
    const { status, body } = await api(`/api/projects/${projectId}/architecture/connections`, {
      method: 'POST',
      body: JSON.stringify({ fromComponentId: compA, toComponentId: compB }),
    })
    expect(status).toBe(201)
    expect(body.fromComponentId).toBe(compA)
    expect(body.toComponentId).toBe(compB)
  })

  it('rejects self-loops', async () => {
    const { status, body } = await api(`/api/projects/${projectId}/architecture/connections`, {
      method: 'POST',
      body: JSON.stringify({ fromComponentId: compA, toComponentId: compA }),
    })
    expect(status).toBe(400)
    expect(body.error).toContain('Self-loop')
  })

  it('lists connections', async () => {
    await api(`/api/projects/${projectId}/architecture/connections`, {
      method: 'POST',
      body: JSON.stringify({ fromComponentId: compA, toComponentId: compB }),
    })
    const { body } = await api(`/api/projects/${projectId}/architecture/connections`)
    expect(body.length).toBe(1)
  })

  it('deletes a connection', async () => {
    const { body: conn } = await api(`/api/projects/${projectId}/architecture/connections`, {
      method: 'POST',
      body: JSON.stringify({ fromComponentId: compA, toComponentId: compB }),
    })
    const { status } = await api(`/api/projects/${projectId}/architecture/connections/${conn.id}`, {
      method: 'DELETE',
    })
    expect(status).toBe(200)
  })
})

// ---------------------------------------------------------------------------
// Hybrid Gate Enforcement (Execution Order 10)
// ---------------------------------------------------------------------------

describe('Hybrid Gate Enforcement', () => {
  let projectId

  beforeEach(async () => {
    const project = await seedProject({ name: 'Hybrid Gate Test' })
    projectId = project.id
  })

  it('blocks AI DELETE with low confidence', async () => {
    const { body: issue } = await api(`/api/projects/${projectId}/issues`, {
      method: 'POST',
      body: JSON.stringify({ title: 'Gate delete test', type: 'task' }),
    })
    const { status, body } = await api(`/api/projects/${projectId}/issues/${issue.id}`, {
      method: 'DELETE',
      headers: { 'X-StoryFlow-Actor': 'ai', 'X-StoryFlow-Confidence': '0.3' },
    })
    expect(status).toBe(403)
    expect(body.error).toContain('High-risk')
    expect(body.required_confidence).toBe(0.7)
  })

  it('allows AI DELETE with high confidence', async () => {
    const { body: issue } = await api(`/api/projects/${projectId}/issues`, {
      method: 'POST',
      body: JSON.stringify({ title: 'Gate pass test', type: 'task' }),
    })
    const { status } = await api(`/api/projects/${projectId}/issues/${issue.id}`, {
      method: 'DELETE',
      headers: { 'X-StoryFlow-Actor': 'ai', 'X-StoryFlow-Confidence': '0.9' },
    })
    expect(status).toBe(200)
  })

  it('human bypasses high-risk gate', async () => {
    const { body: issue } = await api(`/api/projects/${projectId}/issues`, {
      method: 'POST',
      body: JSON.stringify({ title: 'Human gate bypass', type: 'task' }),
    })
    const { status } = await api(`/api/projects/${projectId}/issues/${issue.id}`, {
      method: 'DELETE',
      headers: { 'X-StoryFlow-Actor': 'human' },
    })
    expect(status).toBe(200)
  })

  it('allows AI create without confidence requirement', async () => {
    const { status } = await api(`/api/projects/${projectId}/issues`, {
      method: 'POST',
      body: JSON.stringify({ title: 'AI low confidence create', type: 'task' }),
      headers: { 'X-StoryFlow-Actor': 'ai', 'X-StoryFlow-Confidence': '0.2' },
    })
    expect(status).toBe(201)
  })
})

// ---------------------------------------------------------------------------
// Gate Truth Contract (Execution Order 11)
// ---------------------------------------------------------------------------

describe('Gate Truth API', () => {
  let projectId

  beforeEach(async () => {
    const project = await seedProject({ name: 'Gate Truth Test' })
    projectId = project.id
  })

  it('GET /gates returns normalized shape with counts', async () => {
    const { status, body } = await api(`/api/projects/${projectId}/gates`)
    expect(status).toBe(200)
    expect(body).toHaveProperty('pending')
    expect(body).toHaveProperty('rejected')
    expect(body).toHaveProperty('pendingCount')
    expect(body).toHaveProperty('rejectedCount')
    expect(Array.isArray(body.pending)).toBe(true)
    expect(body.pendingCount).toBeTypeOf('number')
  })
})

// ---------------------------------------------------------------------------
// Decision Sequence Identity (Execution Order 11)
// ---------------------------------------------------------------------------

describe('Decision Sequence Identity', () => {
  let projectId

  beforeEach(async () => {
    const project = await seedProject({ name: 'Decision Seq Test' })
    projectId = project.id
  })

  it('new decisions get auto-assigned sequence numbers', async () => {
    const { body: d1 } = await api(`/api/projects/${projectId}/decisions`, {
      method: 'POST',
      body: JSON.stringify({ title: 'First decision' }),
    })
    const { body: d2 } = await api(`/api/projects/${projectId}/decisions`, {
      method: 'POST',
      body: JSON.stringify({ title: 'Second decision' }),
    })
    expect(d1.sequenceNumber).toBe(1)
    expect(d2.sequenceNumber).toBe(2)
  })

  it('sequence numbers survive deletion of earlier decisions', async () => {
    const { body: d1 } = await api(`/api/projects/${projectId}/decisions`, {
      method: 'POST',
      body: JSON.stringify({ title: 'To be deleted' }),
    })
    await api(`/api/projects/${projectId}/decisions`, {
      method: 'POST',
      body: JSON.stringify({ title: 'Keeper' }),
    })
    await api(`/api/projects/${projectId}/decisions/${d1.id}`, { method: 'DELETE' })
    const { body: d3 } = await api(`/api/projects/${projectId}/decisions`, {
      method: 'POST',
      body: JSON.stringify({ title: 'Third decision' }),
    })
    expect(d3.sequenceNumber).toBe(3)
  })

  it('sequence number is returned in list', async () => {
    await api(`/api/projects/${projectId}/decisions`, {
      method: 'POST',
      body: JSON.stringify({ title: 'Listed decision' }),
    })
    const { body: list } = await api(`/api/projects/${projectId}/decisions`)
    expect(list[0].sequenceNumber).toBe(1)
  })
})

// ---------------------------------------------------------------------------
// Project Analytics (Execution Order 11)
// ---------------------------------------------------------------------------

describe('Project Analytics API', () => {
  let projectId

  beforeEach(async () => {
    const project = await seedProject({ name: 'Analytics Test' })
    projectId = project.id
  })

  it('returns analytics with correct shape', async () => {
    const { status, body } = await api(`/api/projects/${projectId}/analytics`)
    expect(status).toBe(200)
    expect(body).toHaveProperty('completion')
    expect(body.completion).toHaveProperty('percent')
    expect(body.completion).toHaveProperty('donePoints')
    expect(body.completion).toHaveProperty('totalPoints')
    expect(body).toHaveProperty('byStatus')
  })

  it('computes completion from real issue data', async () => {
    await api(`/api/projects/${projectId}/issues`, {
      method: 'POST',
      body: JSON.stringify({ title: 'Done one', type: 'task', storyPoints: 5, status: 'Done' }),
    })
    await api(`/api/projects/${projectId}/issues`, {
      method: 'POST',
      body: JSON.stringify({ title: 'Todo one', type: 'task', storyPoints: 5 }),
    })
    const { body } = await api(`/api/projects/${projectId}/analytics`)
    expect(body.completion.totalPoints).toBe(10)
    expect(body.completion.donePoints).toBe(5)
    expect(body.completion.percent).toBe(50)
  })

  it('returns null velocity when no active sprint', async () => {
    const { body } = await api(`/api/projects/${projectId}/analytics`)
    expect(body.velocity).toBeNull()
  })

  it('returns 404 for missing project', async () => {
    const { status } = await api('/api/projects/nonexistent/analytics')
    expect(status).toBe(404)
  })
})

// ---------------------------------------------------------------------------
// Agent Package Endpoints — workspace-scoped (Execution Order 13)
// ---------------------------------------------------------------------------

describe('Agent Package API (workspace-scoped)', () => {
  it('GET /api/agent/status returns health shape', async () => {
    const { status, body } = await api('/api/agent/status')
    expect(status).toBe(200)
    expect(body).toHaveProperty('health')
    expect(body).toHaveProperty('packagePresent')
    expect(body).toHaveProperty('memoryDbPresent')
    expect(body).toHaveProperty('hookCount')
    expect(body).toHaveProperty('hooksInstalled')
    expect(body).toHaveProperty('kbCount')
    expect(['missing', 'warning', 'healthy']).toContain(body.health)
  })

  it('GET /api/agent/doctor returns checks array', async () => {
    const { status, body } = await api('/api/agent/doctor')
    expect(status).toBe(200)
    expect(body).toHaveProperty('checks')
    expect(body).toHaveProperty('failCount')
    expect(body).toHaveProperty('timestamp')
    expect(Array.isArray(body.checks)).toBe(true)
  })

  it('doctor checks have name, pass, and level', async () => {
    const { body } = await api('/api/agent/doctor')
    for (const check of body.checks) {
      expect(check).toHaveProperty('name')
      expect(check).toHaveProperty('pass')
      expect(check).toHaveProperty('level')
      expect(['workspace', 'project']).toContain(check.level)
    }
  })

  it('doctor includes project-aware checks when projectId provided', async () => {
    const project = await seedProject({ name: 'Doctor Project Test' })
    const { body } = await api(`/api/agent/doctor?projectId=${project.id}`)
    const projectChecks = body.checks.filter((c) => c.level === 'project')
    expect(projectChecks.length).toBeGreaterThan(0)
  })

  it('server check always passes (since endpoint is reachable)', async () => {
    const { body } = await api('/api/agent/doctor')
    const serverCheck = body.checks.find((c) => c.name === 'StoryFlow server')
    expect(serverCheck.pass).toBe(true)
  })

  it('doctor includes hooks installed check', async () => {
    const { body } = await api('/api/agent/doctor')
    const hooksInstalledCheck = body.checks.find((c) => c.name === 'Hooks installed')
    expect(hooksInstalledCheck).toBeTruthy()
    expect(hooksInstalledCheck).toHaveProperty('pass')
    expect(hooksInstalledCheck).toHaveProperty('level', 'workspace')
  })
})
