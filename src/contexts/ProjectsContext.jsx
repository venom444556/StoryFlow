import { createContext, useContext, useMemo } from 'react'
import {
  useProjectsStore,
  selectActiveProjects,
  selectTrashedProjects,
} from '../stores/projectsStore'

// ---------------------------------------------------------------------------
// Context (now backed by Zustand for actual state management)
// ---------------------------------------------------------------------------
const ProjectsContext = createContext(null)

// Stable dispatch function
const deprecatedDispatch = () => {
  console.warn('dispatch() is deprecated. Use useProjectsStore() actions directly.')
}

/**
 * ProjectsProvider now wraps Zustand store for backward compatibility.
 * Components can use either:
 * - useProjectsContext() - legacy hook (still works)
 * - useProjectsStore() - direct Zustand access (preferred for new code)
 */
export function ProjectsProvider({ children }) {
  // Get state from Zustand store — active projects by default
  const projects = useProjectsStore(selectActiveProjects)
  const trashedProjects = useProjectsStore(selectTrashedProjects)

  // Get stable action references directly from store
  const addProject = useProjectsStore((state) => state.addProject)
  const updateProject = useProjectsStore((state) => state.updateProject)
  const deleteProject = useProjectsStore((state) => state.deleteProject)
  const trashProject = useProjectsStore((state) => state.trashProject)
  const restoreProject = useProjectsStore((state) => state.restoreProject)
  const permanentlyDeleteProject = useProjectsStore((state) => state.permanentlyDeleteProject)
  const emptyTrash = useProjectsStore((state) => state.emptyTrash)
  const getProject = useProjectsStore((state) => state.getProject)
  const importProject = useProjectsStore((state) => state.importProject)

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({
      projects,
      trashedProjects,
      dispatch: deprecatedDispatch,
      addProject,
      updateProject,
      deleteProject,
      trashProject,
      restoreProject,
      permanentlyDeleteProject,
      emptyTrash,
      getProject,
      importProject,
    }),
    [
      projects,
      trashedProjects,
      addProject,
      updateProject,
      deleteProject,
      trashProject,
      restoreProject,
      permanentlyDeleteProject,
      emptyTrash,
      getProject,
      importProject,
    ]
  )

  return <ProjectsContext.Provider value={value}>{children}</ProjectsContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useProjectsContext() {
  const ctx = useContext(ProjectsContext)
  if (!ctx) {
    throw new Error('useProjectsContext must be used within a ProjectsProvider')
  }
  return ctx
}

export default ProjectsContext
