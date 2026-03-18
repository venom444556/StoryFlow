import { create } from 'zustand'

export const useIssuesStore = create((set, get) => ({
  issues: [],
  loading: false,
  error: null,

  fetchIssues: async (projectId, filters = {}) => {
    set({ loading: true, error: null })
    try {
      const params = new URLSearchParams()
      if (filters.status) params.set('status', filters.status)
      if (filters.type) params.set('type', filters.type)
      if (filters.epicId) params.set('epicId', filters.epicId)
      if (filters.sprintId) params.set('sprintId', filters.sprintId)
      if (filters.search) params.set('search', filters.search)
      const qs = params.toString()
      const res = await fetch(`/api/projects/${projectId}/issues${qs ? '?' + qs : ''}`)
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      // API returns bare array (legacy) or { issues: [...] } (paginated)
      const issues = Array.isArray(data) ? data : data.issues || []
      set({ issues, loading: false })
    } catch (err) {
      set({ error: err.message, loading: false })
    }
  },

  createIssue: async (projectId, issue) => {
    const res = await fetch(`/api/projects/${projectId}/issues`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(issue),
    })
    if (!res.ok) throw new Error(await res.text())
    const created = await res.json()
    set((state) => ({ issues: [...state.issues, created] }))
    return created
  },

  updateIssue: async (projectId, issueId, updates) => {
    const res = await fetch(`/api/projects/${projectId}/issues/${issueId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    if (!res.ok) throw new Error(await res.text())
    const updated = await res.json()
    set((state) => ({
      issues: state.issues.map((i) => (i.id === issueId ? { ...i, ...updated } : i)),
    }))
    return updated
  },

  updateIssueByKey: async (projectId, key, updates) => {
    const res = await fetch(`/api/projects/${projectId}/issues/by-key/${key}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    if (!res.ok) throw new Error(await res.text())
    const updated = await res.json()
    set((state) => ({
      issues: state.issues.map((i) => (i.key === key ? { ...i, ...updated } : i)),
    }))
    return updated
  },

  deleteIssue: async (projectId, issueId) => {
    const res = await fetch(`/api/projects/${projectId}/issues/${issueId}`, {
      method: 'DELETE',
    })
    if (!res.ok) throw new Error(await res.text())
    set((state) => ({ issues: state.issues.filter((i) => i.id !== issueId) }))
  },

  deleteIssueByKey: async (projectId, key) => {
    const res = await fetch(`/api/projects/${projectId}/issues/by-key/${key}`, {
      method: 'DELETE',
    })
    if (!res.ok) throw new Error(await res.text())
    set((state) => ({ issues: state.issues.filter((i) => i.key !== key) }))
  },

  addComment: async (projectId, issueId, comment) => {
    const res = await fetch(`/api/projects/${projectId}/issues/${issueId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(comment),
    })
    if (!res.ok) throw new Error(await res.text())
    return res.json()
  },

  clear: () => set({ issues: [], loading: false, error: null }),
}))
