import { create } from 'zustand'

export const useWorkflowStore = create((set, get) => ({
  nodes: [],
  loading: false,
  error: null,

  fetchNodes: async (projectId) => {
    set({ loading: true, error: null })
    try {
      const res = await fetch(`/api/projects/${projectId}/workflow/nodes`)
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      set({ nodes: Array.isArray(data) ? data : [], loading: false })
    } catch (err) {
      set({ error: err.message, loading: false })
    }
  },

  createNode: async (projectId, node) => {
    const res = await fetch(`/api/projects/${projectId}/workflow/nodes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(node),
    })
    if (!res.ok) throw new Error(await res.text())
    const created = await res.json()
    set((state) => ({ nodes: [...state.nodes, created] }))
    return created
  },

  updateNode: async (projectId, nodeId, updates) => {
    const res = await fetch(`/api/projects/${projectId}/workflow/nodes/${nodeId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    if (!res.ok) throw new Error(await res.text())
    const updated = await res.json()
    set((state) => ({
      nodes: state.nodes.map((n) => (n.id === nodeId ? { ...n, ...updated } : n)),
    }))
    return updated
  },

  deleteNode: async (projectId, nodeId) => {
    const res = await fetch(`/api/projects/${projectId}/workflow/nodes/${nodeId}`, {
      method: 'DELETE',
    })
    if (!res.ok) throw new Error(await res.text())
    set((state) => ({ nodes: state.nodes.filter((n) => n.id !== nodeId) }))
  },

  linkIssue: async (projectId, nodeId, issueKey) => {
    const res = await fetch(`/api/projects/${projectId}/workflow/nodes/${nodeId}/link`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ issueKey }),
    })
    if (!res.ok) throw new Error(await res.text())
    const updated = await res.json()
    set((state) => ({
      nodes: state.nodes.map((n) => (n.id === nodeId ? { ...n, ...updated } : n)),
    }))
    return updated
  },

  unlinkIssue: async (projectId, nodeId, issueKey) => {
    const res = await fetch(`/api/projects/${projectId}/workflow/nodes/${nodeId}/unlink`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ issueKey }),
    })
    if (!res.ok) throw new Error(await res.text())
    const updated = await res.json()
    set((state) => ({
      nodes: state.nodes.map((n) => (n.id === nodeId ? { ...n, ...updated } : n)),
    }))
    return updated
  },

  clear: () => set({ nodes: [], loading: false, error: null }),
}))
