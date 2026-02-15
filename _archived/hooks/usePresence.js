import { useState, useEffect, useCallback, useRef } from 'react'

const STORAGE_KEY = 'storyflow-presence'
const HEARTBEAT_INTERVAL = 5000 // 5 seconds
const STALE_THRESHOLD = 15000 // 15 seconds - viewer considered gone after this

/**
 * Generate a unique viewer ID for this browser tab
 */
function getViewerId() {
  let viewerId = sessionStorage.getItem('storyflow-viewer-id')
  if (!viewerId) {
    viewerId = `viewer-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    sessionStorage.setItem('storyflow-viewer-id', viewerId)
  }
  return viewerId
}

/**
 * Get viewer display name (could be enhanced with user authentication)
 */
function getViewerName() {
  // Try to get a stored name, otherwise generate one
  let name = localStorage.getItem('storyflow-viewer-name')
  if (!name) {
    // Generate a friendly name
    const adjectives = ['Swift', 'Clever', 'Bright', 'Quick', 'Keen']
    const nouns = ['Fox', 'Owl', 'Bear', 'Wolf', 'Hawk']
    name = `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${nouns[Math.floor(Math.random() * nouns.length)]}`
    localStorage.setItem('storyflow-viewer-name', name)
  }
  return name
}

/**
 * Hook for managing presence in a project
 */
export function usePresence(projectId, activeTab = 'overview') {
  const [viewers, setViewers] = useState([])
  const viewerIdRef = useRef(getViewerId())
  const viewerNameRef = useRef(getViewerName())
  const intervalRef = useRef(null)

  // Update presence data
  const updatePresence = useCallback(() => {
    if (!projectId) return

    try {
      const now = Date.now()
      const stored = localStorage.getItem(STORAGE_KEY)
      const presence = stored ? JSON.parse(stored) : {}

      // Initialize project presence if needed
      if (!presence[projectId]) {
        presence[projectId] = { viewers: [] }
      }

      // Remove stale viewers
      presence[projectId].viewers = presence[projectId].viewers.filter(
        (v) => now - v.lastSeen < STALE_THRESHOLD
      )

      // Update or add current viewer
      const existingIndex = presence[projectId].viewers.findIndex(
        (v) => v.id === viewerIdRef.current
      )

      const viewerData = {
        id: viewerIdRef.current,
        name: viewerNameRef.current,
        tab: activeTab,
        lastSeen: now,
        color: getViewerColor(viewerIdRef.current),
      }

      if (existingIndex >= 0) {
        presence[projectId].viewers[existingIndex] = viewerData
      } else {
        presence[projectId].viewers.push(viewerData)
      }

      // Save to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(presence))

      // Update local state (excluding self)
      setViewers(
        presence[projectId].viewers.filter((v) => v.id !== viewerIdRef.current)
      )
    } catch (error) {
      console.error('Presence update error:', error)
    }
  }, [projectId, activeTab])

  // Remove self from presence
  const removePresence = useCallback(() => {
    if (!projectId) return

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return

      const presence = JSON.parse(stored)
      if (presence[projectId]) {
        presence[projectId].viewers = presence[projectId].viewers.filter(
          (v) => v.id !== viewerIdRef.current
        )
        localStorage.setItem(STORAGE_KEY, JSON.stringify(presence))
      }
    } catch (error) {
      console.error('Presence removal error:', error)
    }
  }, [projectId])

  // Listen for storage events (other tabs)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === STORAGE_KEY && projectId) {
        try {
          const presence = JSON.parse(e.newValue || '{}')
          if (presence[projectId]) {
            const now = Date.now()
            setViewers(
              presence[projectId].viewers.filter(
                (v) => v.id !== viewerIdRef.current && now - v.lastSeen < STALE_THRESHOLD
              )
            )
          }
        } catch (error) {
          console.error('Storage event parse error:', error)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [projectId])

  // Start heartbeat on mount
  useEffect(() => {
    if (!projectId) return

    // Initial presence update
    updatePresence()

    // Start heartbeat
    intervalRef.current = setInterval(updatePresence, HEARTBEAT_INTERVAL)

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      removePresence()
    }
  }, [projectId, updatePresence, removePresence])

  // Update tab when it changes
  useEffect(() => {
    updatePresence()
  }, [activeTab, updatePresence])

  return {
    viewers,
    viewerId: viewerIdRef.current,
    viewerName: viewerNameRef.current,
    setViewerName: (name) => {
      viewerNameRef.current = name
      localStorage.setItem('storyflow-viewer-name', name)
      updatePresence()
    },
  }
}

/**
 * Get a consistent color for a viewer based on their ID
 */
function getViewerColor(viewerId) {
  const colors = [
    '#3B82F6', // blue
    '#10B981', // green
    '#F59E0B', // amber
    '#EF4444', // red
    '#8B5CF6', // violet
    '#EC4899', // pink
    '#06B6D4', // cyan
    '#F97316', // orange
  ]

  // Simple hash from viewer ID
  let hash = 0
  for (let i = 0; i < viewerId.length; i++) {
    hash = (hash << 5) - hash + viewerId.charCodeAt(i)
    hash = hash & hash
  }

  return colors[Math.abs(hash) % colors.length]
}

/**
 * Hook to get all active viewers across all projects
 */
export function useAllPresence() {
  const [allViewers, setAllViewers] = useState({})

  useEffect(() => {
    const updateAll = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          const presence = JSON.parse(stored)
          const now = Date.now()

          // Clean up stale viewers
          const cleaned = {}
          for (const [projectId, data] of Object.entries(presence)) {
            const activeViewers = data.viewers.filter(
              (v) => now - v.lastSeen < STALE_THRESHOLD
            )
            if (activeViewers.length > 0) {
              cleaned[projectId] = { viewers: activeViewers }
            }
          }

          setAllViewers(cleaned)
        }
      } catch (error) {
        console.error('All presence error:', error)
      }
    }

    updateAll()
    const interval = setInterval(updateAll, HEARTBEAT_INTERVAL)

    window.addEventListener('storage', updateAll)

    return () => {
      clearInterval(interval)
      window.removeEventListener('storage', updateAll)
    }
  }, [])

  return allViewers
}

export default usePresence
