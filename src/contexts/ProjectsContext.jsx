import { createContext, useContext, useMemo } from 'react'
import { useProjectsStore, selectProjects } from '../stores/projectsStore'

// ---------------------------------------------------------------------------
// Context (now backed by Zustand for actual state management)
// ---------------------------------------------------------------------------
const ProjectsContext = createContext(null)

// Stable dispatch function
const deprecatedDispatch = () => {
  console.warn(
    'dispatch() is deprecated. Use useProjectsStore() actions directly.'
  )
}

/**
 * ProjectsProvider now wraps Zustand store for backward compatibility.
 * Components can use either:
 * - useProjectsContext() - legacy hook (still works)
 * - useProjectsStore() - direct Zustand access (preferred for new code)
 */
export function ProjectsProvider({ children }) {
  // Get state from Zustand store
  const projects = useProjectsStore(selectProjects)

  // Get stable action references directly from store
  const addProject = useProjectsStore((state) => state.addProject)
  const updateProject = useProjectsStore((state) => state.updateProject)
  const deleteProject = useProjectsStore((state) => state.deleteProject)
  const getProject = useProjectsStore((state) => state.getProject)
  const importProject = useProjectsStore((state) => state.importProject)

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    projects,
    dispatch: deprecatedDispatch,
    addProject,
    updateProject,
    deleteProject,
    getProject,
    importProject,
  }), [projects, addProject, updateProject, deleteProject, getProject, importProject])

  return (
    <ProjectsContext.Provider value={value}>
      {children}
    </ProjectsContext.Provider>
  )
}

export function useProjectsContext() {
  const ctx = useContext(ProjectsContext)
  if (!ctx) {
    throw new Error('useProjectsContext must be used within a ProjectsProvider')
  }
  return ctx
}

export default ProjectsContext
