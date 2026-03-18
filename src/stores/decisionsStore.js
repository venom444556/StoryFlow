import { create } from 'zustand'

export const useDecisionsStore = create((set, get) => ({
  decisions: [],
  loading: false,
  error: null,

  fetchDecisions: async (projectId) => {
    set({ loading: true, error: null })
    try {
      const res = await fetch(`/api/projects/${projectId}/decisions`)
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      set({ decisions: Array.isArray(data) ? data : [], loading: false })
    } catch (err) {
      set({ error: err.message, loading: false })
    }
  },

  createDecision: async (projectId, decision) => {
    const res = await fetch(`/api/projects/${projectId}/decisions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(decision),
    })
    if (!res.ok) throw new Error(await res.text())
    const created = await res.json()
    set((state) => ({ decisions: [...state.decisions, created] }))
    return created
  },

  updateDecision: async (projectId, decisionId, updates) => {
    const res = await fetch(`/api/projects/${projectId}/decisions/${decisionId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    if (!res.ok) throw new Error(await res.text())
    const updated = await res.json()
    set((state) => ({
      decisions: state.decisions.map((d) => (d.id === decisionId ? { ...d, ...updated } : d)),
    }))
    return updated
  },

  deleteDecision: async (projectId, decisionId) => {
    const res = await fetch(`/api/projects/${projectId}/decisions/${decisionId}`, {
      method: 'DELETE',
    })
    if (!res.ok) throw new Error(await res.text())
    set((state) => ({ decisions: state.decisions.filter((d) => d.id !== decisionId) }))
  },

  clear: () => set({ decisions: [], loading: false, error: null }),
}))
