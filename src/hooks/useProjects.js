import { useProjectsContext } from '../contexts/ProjectsContext'

export function useProjects() {
  const {
    projects,
    trashedProjects,
    addProject,
    deleteProject,
    trashProject,
    restoreProject,
    permanentlyDeleteProject,
    emptyTrash,
    importProject,
    getProject,
  } = useProjectsContext()

  return {
    projects,
    trashedProjects,
    addProject,
    deleteProject,
    trashProject,
    restoreProject,
    permanentlyDeleteProject,
    emptyTrash,
    importProject,
    getProject,
  }
}
