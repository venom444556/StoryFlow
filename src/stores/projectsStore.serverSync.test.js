/**
 * Tests for the server-sync behaviour of projectsStore.
 *
 * Regression coverage for two related bugs:
 *
 * 1. "0 projects on fresh load" — IndexedDB is empty (data was written via
 *    MCP/REST with no browser tab open).  reloadFromServer() must hydrate the
 *    store from the server on startup.
 *
 * 2. "Browser refresh doesn't show MCP changes" — IndexedDB has stale data;
 *    old code called syncToServer(stale) on startup, overwriting server-side
 *    MCP writes.  reloadFromServer() is now called unconditionally so the
 *    server (which has the MCP changes) always wins on startup.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useProjectsStore, reloadFromServer } from './projectsStore'

// ---------------------------------------------------------------------------
// Minimal project fixture
// ---------------------------------------------------------------------------
function makeProject(id, name = `Project ${id}`) {
  return {
    id,
    name,
    board: { issues: [], sprints: [], columns: [], nextIssueNumber: 1 },
    pages: [],
    decisions: [],
    timeline: { phases: [] },
    settings: {},
  }
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------
describe('reloadFromServer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset the Zustand store to a clean empty state before each test
    useProjectsStore.setState({ projects: [] })
  })

  afterEach(() => {
    // Restore any globals stubbed with vi.stubGlobal
    vi.unstubAllGlobals()
  })

  it('fetches /api/projects and /api/projects/:id then populates the store', async () => {
    const project = makeProject('sas-cyber-advisory', 'SAS Cyber Advisory Platform')

    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [{ id: 'sas-cyber-advisory', name: project.name }],
        })
        .mockResolvedValueOnce({ ok: true, json: async () => project })
    )

    reloadFromServer()

    await vi.waitFor(() => {
      expect(useProjectsStore.getState().projects).toHaveLength(1)
    })

    expect(fetch).toHaveBeenCalledWith('/api/projects')
    expect(fetch).toHaveBeenCalledWith('/api/projects/sas-cyber-advisory')
    expect(useProjectsStore.getState().projects[0].id).toBe('sas-cyber-advisory')
  })

  it('merges server projects with existing client-only projects', async () => {
    const clientProject = makeProject('client-only', 'Client Only')
    useProjectsStore.setState({ projects: [clientProject] })

    const serverProject = makeProject('server-proj', 'Server Project')
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [{ id: 'server-proj' }],
        })
        .mockResolvedValueOnce({ ok: true, json: async () => serverProject })
    )

    reloadFromServer()

    await vi.waitFor(() => {
      expect(useProjectsStore.getState().projects).toHaveLength(2)
    })

    const ids = useProjectsStore.getState().projects.map((p) => p.id)
    expect(ids).toContain('client-only')
    expect(ids).toContain('server-proj')
  })

  it('server project overwrites local version when IDs match', async () => {
    const localVersion = makeProject('shared-id', 'Old Name')
    useProjectsStore.setState({ projects: [localVersion] })

    const serverVersion = makeProject('shared-id', 'Updated Name')
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [{ id: 'shared-id' }],
        })
        .mockResolvedValueOnce({ ok: true, json: async () => serverVersion })
    )

    reloadFromServer()

    await vi.waitFor(() => {
      const match = useProjectsStore.getState().projects.find((p) => p.id === 'shared-id')
      expect(match?.name).toBe('Updated Name')
    })

    // Should still be exactly one project (no duplicates)
    expect(useProjectsStore.getState().projects).toHaveLength(1)
  })

  it('leaves store empty when server returns an empty list', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce({ ok: true, json: async () => [] }))

    reloadFromServer()
    await new Promise((r) => setTimeout(r, 50))

    expect(useProjectsStore.getState().projects).toHaveLength(0)
  })

  it('leaves store unchanged when the server is unreachable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValueOnce(new Error('Network error')))

    reloadFromServer()
    await new Promise((r) => setTimeout(r, 50))

    expect(useProjectsStore.getState().projects).toHaveLength(0)
  })

  it('leaves store unchanged when the server responds with a non-ok status', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce({ ok: false, json: async () => null }))

    reloadFromServer()
    await new Promise((r) => setTimeout(r, 50))

    expect(useProjectsStore.getState().projects).toHaveLength(0)
  })
})
