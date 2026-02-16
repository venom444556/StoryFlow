import { useState, useRef, useEffect, useCallback } from 'react'

// ---------------------------------------------------------------------------
// Full-text search across every project in the store.
// Results are grouped by type and debounced by 300 ms.
// ---------------------------------------------------------------------------

const DEBOUNCE_MS = 300
const EMPTY_RESULTS = { projects: [], issues: [], pages: [], decisions: [] }

/**
 * Generate a short preview snippet around the first occurrence of `query`
 * inside `text`. Returns up to ~120 characters.
 */
function snippet(text, query, len = 120) {
  if (!text) return ''
  const lower = text.toLowerCase()
  const idx = lower.indexOf(query.toLowerCase())
  if (idx === -1) return text.slice(0, len)

  const start = Math.max(0, idx - 40)
  const end = Math.min(text.length, idx + query.length + 80)
  let s = text.slice(start, end).trim()
  if (start > 0) s = '...' + s
  if (end < text.length) s = s + '...'
  return s
}

/**
 * Simple fuzzy match: checks if all characters of `query` appear in order
 * within `text`. Returns a score (lower = better match) or -1 if no match.
 */
function fuzzyScore(query, text) {
  if (!text) return -1
  const q = query.toLowerCase()
  const t = text.toLowerCase()

  // Exact substring match is highest priority
  if (t.includes(q)) return 0

  // Fuzzy: all chars of query appear in order
  let qi = 0
  let gaps = 0
  let lastMatchIdx = -1
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) {
      if (lastMatchIdx >= 0) gaps += ti - lastMatchIdx - 1
      lastMatchIdx = ti
      qi++
    }
  }
  return qi === q.length ? 1 + gaps : -1
}

/**
 * Returns true when any of the provided strings match `query`.
 * Uses fuzzy matching: all characters of query must appear in order.
 */
function matches(query, ...fields) {
  const q = query.toLowerCase()
  return fields.some((f) => {
    if (!f || typeof f !== 'string') return false
    return fuzzyScore(q, f) >= 0
  })
}

/**
 * Core search function -- runs synchronously over the in-memory project array.
 */
function searchProjects(projects, query) {
  if (!query || !query.trim()) {
    return { projects: [], issues: [], pages: [], decisions: [] }
  }

  const q = query.trim()
  const resultProjects = []
  const resultIssues = []
  const resultPages = []
  const resultDecisions = []

  for (const project of projects) {
    // --- Match project itself ---
    if (matches(q, project.name, project.description)) {
      resultProjects.push({
        id: project.id,
        type: 'project',
        title: project.name,
        preview: snippet(project.description || project.name, q),
        projectId: project.id,
        projectName: project.name,
      })
    }

    // --- Issues ---
    if (project.board && Array.isArray(project.board.issues)) {
      for (const issue of project.board.issues) {
        if (matches(q, issue.title, issue.description, issue.key)) {
          resultIssues.push({
            id: issue.id,
            type: 'issue',
            title: issue.title || issue.key || 'Untitled Issue',
            preview: snippet(issue.description || '', q),
            projectId: project.id,
            projectName: project.name,
          })
        }
      }
    }

    // --- Pages ---
    if (Array.isArray(project.pages)) {
      for (const page of project.pages) {
        if (matches(q, page.title, page.content)) {
          resultPages.push({
            id: page.id,
            type: 'page',
            title: page.title || 'Untitled Page',
            preview: snippet(page.content || '', q),
            projectId: project.id,
            projectName: project.name,
          })
        }
      }
    }

    // --- Decisions ---
    if (Array.isArray(project.decisions)) {
      for (const decision of project.decisions) {
        if (matches(q, decision.title, decision.context, decision.outcome)) {
          resultDecisions.push({
            id: decision.id,
            type: 'decision',
            title: decision.title || 'Untitled Decision',
            preview: snippet(decision.context || decision.outcome || '', q),
            projectId: project.id,
            projectName: project.name,
          })
        }
      }
    }
  }

  return {
    projects: resultProjects,
    issues: resultIssues,
    pages: resultPages,
    decisions: resultDecisions,
  }
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useSearch(projects) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState(EMPTY_RESULTS)
  const [isSearching, setIsSearching] = useState(false)
  const timerRef = useRef(null)

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults(EMPTY_RESULTS)
      setIsSearching(false)
      return
    }

    setIsSearching(true)

    if (timerRef.current) clearTimeout(timerRef.current)

    timerRef.current = setTimeout(() => {
      const res = searchProjects(projects, query)
      setResults(res)
      setIsSearching(false)
    }, DEBOUNCE_MS)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [query, projects])

  const clearSearch = useCallback(() => {
    setQuery('')
    setResults(EMPTY_RESULTS)
    setIsSearching(false)
  }, [])

  return { query, setQuery, results, isSearching, clearSearch }
}
