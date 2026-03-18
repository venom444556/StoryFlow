import { create } from 'zustand'

export const usePagesStore = create((set, get) => ({
  pages: [],
  loading: false,
  error: null,

  fetchPages: async (projectId) => {
    set({ loading: true, error: null })
    try {
      const res = await fetch(`/api/projects/${projectId}/pages`)
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      set({ pages: Array.isArray(data) ? data : [], loading: false })
    } catch (err) {
      set({ error: err.message, loading: false })
    }
  },

  fetchPage: async (projectId, pageId) => {
    const res = await fetch(`/api/projects/${projectId}/pages/${pageId}`)
    if (!res.ok) throw new Error(await res.text())
    const page = await res.json()
    // Merge full page content into local array (upsert)
    set((state) => {
      const exists = state.pages.some((p) => p.id === pageId)
      if (exists) {
        return { pages: state.pages.map((p) => (p.id === pageId ? { ...p, ...page } : p)) }
      }
      return { pages: [...state.pages, page] }
    })
    return page
  },

  createPage: async (projectId, page) => {
    const res = await fetch(`/api/projects/${projectId}/pages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(page),
    })
    if (!res.ok) throw new Error(await res.text())
    const created = await res.json()
    set((state) => ({ pages: [...state.pages, created] }))
    return created
  },

  updatePage: async (projectId, pageId, updates) => {
    const res = await fetch(`/api/projects/${projectId}/pages/${pageId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    if (!res.ok) throw new Error(await res.text())
    const updated = await res.json()
    set((state) => ({
      pages: state.pages.map((p) => (p.id === pageId ? { ...p, ...updated } : p)),
    }))
    return updated
  },

  deletePage: async (projectId, pageId) => {
    const res = await fetch(`/api/projects/${projectId}/pages/${pageId}`, {
      method: 'DELETE',
    })
    if (!res.ok) throw new Error(await res.text())
    set((state) => ({ pages: state.pages.filter((p) => p.id !== pageId) }))
  },

  clear: () => set({ pages: [], loading: false, error: null }),
}))
