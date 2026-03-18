import { create } from 'zustand'

export const useTimelineStore = create((set, get) => ({
  phases: [],
  milestones: [],
  loading: false,
  error: null,

  // --- Phases ---

  fetchPhases: async (projectId) => {
    set({ loading: true, error: null })
    try {
      const res = await fetch(`/api/projects/${projectId}/phases`)
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      set({ phases: Array.isArray(data) ? data : [], loading: false })
    } catch (err) {
      set({ error: err.message, loading: false })
    }
  },

  createPhase: async (projectId, phase) => {
    const res = await fetch(`/api/projects/${projectId}/phases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(phase),
    })
    if (!res.ok) throw new Error(await res.text())
    const created = await res.json()
    set((state) => ({ phases: [...state.phases, created] }))
    return created
  },

  updatePhase: async (projectId, phaseId, updates) => {
    const res = await fetch(`/api/projects/${projectId}/phases/${phaseId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    if (!res.ok) throw new Error(await res.text())
    const updated = await res.json()
    set((state) => ({
      phases: state.phases.map((p) => (p.id === phaseId ? { ...p, ...updated } : p)),
    }))
    return updated
  },

  deletePhase: async (projectId, phaseId) => {
    const res = await fetch(`/api/projects/${projectId}/phases/${phaseId}`, {
      method: 'DELETE',
    })
    if (!res.ok) throw new Error(await res.text())
    set((state) => ({ phases: state.phases.filter((p) => p.id !== phaseId) }))
  },

  // --- Milestones ---

  fetchMilestones: async (projectId) => {
    set({ loading: true, error: null })
    try {
      const res = await fetch(`/api/projects/${projectId}/milestones`)
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      set({ milestones: Array.isArray(data) ? data : [], loading: false })
    } catch (err) {
      set({ error: err.message, loading: false })
    }
  },

  createMilestone: async (projectId, milestone) => {
    const res = await fetch(`/api/projects/${projectId}/milestones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(milestone),
    })
    if (!res.ok) throw new Error(await res.text())
    const created = await res.json()
    set((state) => ({ milestones: [...state.milestones, created] }))
    return created
  },

  updateMilestone: async (projectId, milestoneId, updates) => {
    const res = await fetch(`/api/projects/${projectId}/milestones/${milestoneId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    if (!res.ok) throw new Error(await res.text())
    const updated = await res.json()
    set((state) => ({
      milestones: state.milestones.map((m) => (m.id === milestoneId ? { ...m, ...updated } : m)),
    }))
    return updated
  },

  deleteMilestone: async (projectId, milestoneId) => {
    const res = await fetch(`/api/projects/${projectId}/milestones/${milestoneId}`, {
      method: 'DELETE',
    })
    if (!res.ok) throw new Error(await res.text())
    set((state) => ({ milestones: state.milestones.filter((m) => m.id !== milestoneId) }))
  },

  clear: () => set({ phases: [], milestones: [], loading: false, error: null }),
}))
