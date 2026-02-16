import { useProjectsContext } from '../contexts/ProjectsContext'

export function useProjects() {
  const { projects, addProject, deleteProject, importProject, getProject } = useProjectsContext()

  return {
    projects,
    addProject,
    deleteProject,
    importProject,
    getProject,
  }
}
