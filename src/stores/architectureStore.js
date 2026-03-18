import { create } from 'zustand'

export const useArchitectureStore = create((set, get) => ({
  components: [],
  loading: false,
  error: null,

  fetchComponents: async (projectId) => {
    set({ loading: true, error: null })
    try {
      const res = await fetch(`/api/projects/${projectId}/architecture/components`)
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      set({ components: Array.isArray(data) ? data : [], loading: false })
    } catch (err) {
      set({ error: err.message, loading: false })
    }
  },

  createComponent: async (projectId, component) => {
    const res = await fetch(`/api/projects/${projectId}/architecture/components`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(component),
    })
    if (!res.ok) throw new Error(await res.text())
    const created = await res.json()
    set((state) => ({ components: [...state.components, created] }))
    return created
  },

  updateComponent: async (projectId, compId, updates) => {
    const res = await fetch(`/api/projects/${projectId}/architecture/components/${compId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    if (!res.ok) throw new Error(await res.text())
    const updated = await res.json()
    set((state) => ({
      components: state.components.map((c) => (c.id === compId ? { ...c, ...updated } : c)),
    }))
    return updated
  },

  deleteComponent: async (projectId, compId) => {
    const res = await fetch(`/api/projects/${projectId}/architecture/components/${compId}`, {
      method: 'DELETE',
    })
    if (!res.ok) throw new Error(await res.text())
    set((state) => ({ components: state.components.filter((c) => c.id !== compId) }))
  },

  clear: () => set({ components: [], loading: false, error: null }),
}))
