/**
 * Regression test for Issue #20 — syncToServer race condition.
 *
 * Scenario: a syncToServer debounce timer is scheduled, then reloadFromServer()
 * fires before the 500ms timer elapses. The stale timer must be cancelled so it
 * doesn't POST stale client state back to /api/sync, overwriting fresh MCP data.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useProjectsStore, reloadFromServer } from './projectsStore'

// ---------------------------------------------------------------------------
// Helpers
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
describe('syncToServer race condition (#20)', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
    useProjectsStore.setState({ projects: [] })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('cancels pending sync timer when reloadFromServer is called', async () => {
    const fetchCalls = []

    // Track all fetch calls so we can assert which ones happened
    vi.stubGlobal(
      'fetch',
      vi.fn((url, opts) => {
        fetchCalls.push({ url, method: opts?.method || 'GET' })

        // Handle /api/projects list
        if (url === '/api/projects' && (!opts || !opts.method || opts.method === 'GET')) {
          return Promise.resolve({
            ok: true,
            json: async () => [{ id: 'server-proj' }],
          })
        }

        // Handle /api/projects/:id detail fetch
        if (url === '/api/projects/server-proj') {
          return Promise.resolve({
            ok: true,
            json: async () => makeProject('server-proj', 'From Server'),
          })
        }

        // Handle /api/sync POST — this should NOT happen after reload
        if (url === '/api/sync') {
          return Promise.resolve({ ok: true, json: async () => ({ success: true }) })
        }

        return Promise.resolve({ ok: true, json: async () => ({}) })
      })
    )

    // Step 1: Trigger a state change that schedules a syncToServer debounce timer.
    // The subscribe handler in the store calls syncToServer when projects change.
    useProjectsStore.setState({
      projects: [makeProject('stale-data', 'Stale Local Data')],
    })

    // Step 2: Advance 100ms — the 500ms debounce timer is ticking but hasn't fired
    await vi.advanceTimersByTimeAsync(100)

    // Step 3: Call reloadFromServer() which sets _isSyncing = true
    // The fix ensures clearTimeout runs BEFORE the _isSyncing guard, cancelling
    // the stale timer even though _isSyncing is now true.
    const reloadPromise = reloadFromServer()

    // Step 4: Advance past the 500ms debounce window
    await vi.advanceTimersByTimeAsync(600)

    // Wait for the reload to complete
    await reloadPromise

    // Step 5: Assert that NO POST to /api/sync was made.
    // The stale debounce timer should have been cancelled by the fix.
    const syncCalls = fetchCalls.filter((c) => c.url === '/api/sync')
    expect(syncCalls).toHaveLength(0)

    // Verify reload DID happen (GET calls for project data)
    const getCalls = fetchCalls.filter((c) => c.url === '/api/projects' && c.method === 'GET')
    expect(getCalls.length).toBeGreaterThanOrEqual(1)
  })
})
