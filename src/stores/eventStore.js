// ---------------------------------------------------------------------------
// Event Store — real-time AI transparency event stream
// Connects to WebSocket for live events, REST API for catch-up
// ---------------------------------------------------------------------------

import { create } from 'zustand'

const API_BASE = '/api'
const WS_RECONNECT_DELAY = 3000

export const useEventStore = create((set, get) => ({
  // --- State ---
  events: [], // newest-first
  aiStatus: { status: 'idle', detail: '', updatedAt: null },
  connected: false,
  projectId: null,

  // --- Actions ---

  /** Set the active project and start listening for events */
  setProject(projectId) {
    const current = get().projectId
    if (current === projectId) return
    set({ projectId, events: [] })
    if (projectId) {
      get().fetchEvents(projectId)
      get().connectWebSocket(projectId)
    } else {
      get().disconnectWebSocket()
    }
  },

  /** Fetch historical events from REST API */
  async fetchEvents(projectId, filters = {}) {
    try {
      const params = new URLSearchParams()
      if (filters.category) params.set('category', filters.category)
      if (filters.actor) params.set('actor', filters.actor)
      if (filters.since) params.set('since', filters.since)
      if (filters.limit) params.set('limit', String(filters.limit))
      const qs = params.toString()
      const res = await fetch(
        `${API_BASE}/projects/${encodeURIComponent(projectId)}/events${qs ? `?${qs}` : ''}`
      )
      if (!res.ok) return
      const events = await res.json()
      set({ events })
    } catch {
      // Silently fail — events are non-critical
    }
  },

  /** Fetch AI status */
  async fetchAiStatus(projectId) {
    try {
      const res = await fetch(`${API_BASE}/projects/${encodeURIComponent(projectId)}/ai-status`)
      if (!res.ok) return
      const status = await res.json()
      set({ aiStatus: status })
    } catch {
      // Silently fail
    }
  },

  /** Respond to an AI event (approve/reject/redirect) */
  async respondToEvent(eventId, action, comment) {
    const { projectId } = get()
    if (!projectId) return
    try {
      const res = await fetch(
        `${API_BASE}/projects/${encodeURIComponent(projectId)}/events/${encodeURIComponent(eventId)}/respond`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action, comment }),
        }
      )
      if (!res.ok) return
      const updated = await res.json()
      // Update the event in local state
      set((state) => ({
        events: state.events.map((e) => (e.id === eventId ? updated : e)),
      }))
    } catch {
      // Silently fail
    }
  },

  /** Record a custom event */
  async recordEvent(event) {
    const { projectId } = get()
    if (!projectId) return null
    try {
      const res = await fetch(`${API_BASE}/projects/${encodeURIComponent(projectId)}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      })
      if (!res.ok) return null
      return await res.json()
    } catch {
      return null
    }
  },

  // --- WebSocket ---
  _ws: null,
  _wsTimer: null,

  connectWebSocket(projectId) {
    get().disconnectWebSocket()

    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${wsProtocol}//localhost:3001`

    try {
      const ws = new WebSocket(wsUrl)

      ws.onopen = () => {
        set({ connected: true })
        // Catch up on any events we missed while disconnected
        const { events } = get()
        if (events.length > 0) {
          get().fetchEvents(projectId, { since: events[0].timestamp })
        } else {
          get().fetchEvents(projectId)
        }
        get().fetchAiStatus(projectId)
      }

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data)
          if (msg.type === 'event' && msg.event) {
            // Only add events for the active project
            if (msg.event.project_id === get().projectId) {
              set((state) => ({
                events: [msg.event, ...state.events].slice(0, 500),
              }))
            }
          } else if (msg.type === 'gate_update') {
            if (msg.projectId === get().projectId) {
              set((state) => ({
                events: state.events.map((e) =>
                  e.id === msg.eventId ? { ...e, status: msg.status } : e
                ),
              }))
            }
          } else if (msg.type === 'ai_status') {
            if (msg.projectId === get().projectId) {
              set({
                aiStatus: {
                  status: msg.status,
                  detail: msg.detail,
                  updatedAt: msg.updatedAt,
                },
              })
            }
          }
        } catch {
          // Ignore malformed messages
        }
      }

      ws.onclose = () => {
        set({ connected: false })
        // Auto-reconnect
        const timer = setTimeout(() => {
          const { projectId: pid } = get()
          if (pid) get().connectWebSocket(pid)
        }, WS_RECONNECT_DELAY)
        set({ _wsTimer: timer })
      }

      ws.onerror = () => {
        ws.close()
      }

      set({ _ws: ws })
    } catch {
      // WebSocket constructor can throw
    }
  },

  disconnectWebSocket() {
    const { _ws, _wsTimer } = get()
    if (_wsTimer) clearTimeout(_wsTimer)
    if (_ws) {
      _ws.onclose = null // prevent reconnect
      _ws.close()
    }
    set({ _ws: null, _wsTimer: null, connected: false })
  },
}))

// --- Selectors ---

export const selectEvents = (state) => state.events
export const selectAiStatus = (state) => state.aiStatus
export const selectConnected = (state) => state.connected

export const selectEventsByCategory = (category) => (state) =>
  state.events.filter((e) => e.category === category)

export const selectEventsByActor = (actor) => (state) =>
  state.events.filter((e) => e.actor === actor)

export const selectEventsByEntity = (entityType, entityId) => (state) =>
  state.events.filter((e) => e.entity_type === entityType && e.entity_id === entityId)

export const selectRecentAiEvents =
  (limit = 20) =>
  (state) =>
    state.events.filter((e) => e.actor === 'ai').slice(0, limit)

export const selectPendingAiEvents = (state) =>
  state.events.filter((e) => e.actor === 'ai' && !e.human_response)

export const selectPendingGates = (state) => state.events.filter((e) => e.status === 'pending')

export const selectRejectedEvents = (state) => state.events.filter((e) => e.status === 'rejected')

export const selectGateCount = (state) => state.events.filter((e) => e.status === 'pending').length
