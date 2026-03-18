import { create } from 'zustand'

export const useSprintsStore = create((set, get) => ({
  sprints: [],
  loading: false,
  error: null,

  fetchSprints: async (projectId) => {
    set({ loading: true, error: null })
    try {
      const res = await fetch(`/api/projects/${projectId}/sprints`)
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      set({ sprints: Array.isArray(data) ? data : [], loading: false })
    } catch (err) {
      set({ error: err.message, loading: false })
    }
  },

  createSprint: async (projectId, sprint) => {
    const res = await fetch(`/api/projects/${projectId}/sprints`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sprint),
    })
    if (!res.ok) throw new Error(await res.text())
    const created = await res.json()
    set((state) => ({ sprints: [...state.sprints, created] }))
    return created
  },

  updateSprint: async (projectId, sprintId, updates) => {
    const res = await fetch(`/api/projects/${projectId}/sprints/${sprintId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    if (!res.ok) throw new Error(await res.text())
    const updated = await res.json()
    set((state) => ({
      sprints: state.sprints.map((s) => (s.id === sprintId ? { ...s, ...updated } : s)),
    }))
    return updated
  },

  deleteSprint: async (projectId, sprintId) => {
    const res = await fetch(`/api/projects/${projectId}/sprints/${sprintId}`, {
      method: 'DELETE',
    })
    if (!res.ok) throw new Error(await res.text())
    set((state) => ({ sprints: state.sprints.filter((s) => s.id !== sprintId) }))
  },

  clear: () => set({ sprints: [], loading: false, error: null }),
}))
