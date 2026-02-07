import { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react'
import { generateId } from '../utils/ids'
import { createDefaultProject } from '../data/defaultProject'
import { createSeedProject, SEED_VERSION } from '../data/seedProject'

const STORAGE_KEY = 'storyflow-projects'

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------
function projectsReducer(state, action) {
  switch (action.type) {
    case 'SET_PROJECTS':
      return action.payload

    case 'ADD_PROJECT':
      return [...state, action.payload]

    case 'UPDATE_PROJECT':
      return state.map((project) =>
        project.id === action.payload.id
          ? { ...project, ...action.payload.updates, updatedAt: new Date().toISOString() }
          : project
      )

    case 'DELETE_PROJECT':
      return state.filter((project) => project.id !== action.payload.id)

    case 'IMPORT_PROJECT': {
      const imported = {
        ...action.payload,
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      return [...state, imported]
    }

    default:
      return state
  }
}

// ---------------------------------------------------------------------------
// Migrate seed project if a new version is available
// ---------------------------------------------------------------------------
function migrateSeedProject(projects) {
  const seedIndex = projects.findIndex((p) => p.isSeed === true)

  if (seedIndex === -1) {
    // Legacy: pre-versioning seed project has no isSeed flag
    const legacyIndex = projects.findIndex(
      (p) => p.name === 'StoryFlow Development' && p.isSeed === undefined
    )
    if (legacyIndex !== -1) {
      const updated = [...projects]
      updated[legacyIndex] = createSeedProject()
      return updated
    }
    // User deleted the seed project — leave as-is
    return projects
  }

  // Check version — replace if outdated
  if ((projects[seedIndex].seedVersion || 0) < SEED_VERSION) {
    const updated = [...projects]
    updated[seedIndex] = createSeedProject()
    return updated
  }

  return projects
}

// ---------------------------------------------------------------------------
// Load initial state from localStorage
// ---------------------------------------------------------------------------
function loadInitialState() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return migrateSeedProject(parsed)
      }
    }
  } catch {
    // Ignore parse errors and fall through to seed data
  }

  // Seed with project on first load
  return [createSeedProject()]
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------
const ProjectsContext = createContext(null)

export function ProjectsProvider({ children }) {
  const [projects, dispatch] = useReducer(projectsReducer, null, loadInitialState)
  const isInitialRender = useRef(true)

  // Persist to localStorage on every state change
  useEffect(() => {
    // Skip the initial render to avoid an unnecessary write
    if (isInitialRender.current) {
      isInitialRender.current = false
      return
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
    } catch (e) {
      console.error('Failed to persist projects to localStorage:', e)
    }
  }, [projects])

  // ------ Convenience helpers ------

  const addProject = useCallback(
    (name) => {
      const project = createDefaultProject(name)
      dispatch({ type: 'ADD_PROJECT', payload: project })
      return project
    },
    [dispatch]
  )

  const updateProject = useCallback(
    (id, updates) => {
      dispatch({ type: 'UPDATE_PROJECT', payload: { id, updates } })
    },
    [dispatch]
  )

  const deleteProject = useCallback(
    (id) => {
      dispatch({ type: 'DELETE_PROJECT', payload: { id } })
    },
    [dispatch]
  )

  const getProject = useCallback(
    (id) => {
      return projects.find((p) => p.id === id) || null
    },
    [projects]
  )

  const importProject = useCallback(
    (data) => {
      dispatch({ type: 'IMPORT_PROJECT', payload: data })
    },
    [dispatch]
  )

  const value = {
    projects,
    dispatch,
    addProject,
    updateProject,
    deleteProject,
    getProject,
    importProject,
  }

  return <ProjectsContext.Provider value={value}>{children}</ProjectsContext.Provider>
}

export function useProjectsContext() {
  const ctx = useContext(ProjectsContext)
  if (!ctx) {
    throw new Error('useProjectsContext must be used within a ProjectsProvider')
  }
  return ctx
}

export default ProjectsContext
