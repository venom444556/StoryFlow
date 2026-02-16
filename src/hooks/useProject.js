import { useCallback, useMemo } from 'react'
import { useProjectsStore } from '../stores/projectsStore'

/**
 * Hook for working with a single project
 * Now powered by Zustand for optimized re-renders
 */
export function useProject(projectId) {
  // Use a stable selector to avoid infinite loops
  const projectSelector = useCallback(
    (state) => state.projects.find((p) => p.id === projectId),
    [projectId]
  )
  const project = useProjectsStore(projectSelector)

  // Get stable action references using getState() - these don't cause re-renders
  const getStore = useProjectsStore.getState

  // ------ Generic project updater ------

  const updateProject = useCallback(
    (updates) => {
      getStore().updateProject(projectId, updates)
    },
    [projectId, getStore]
  )

  // ------ Overview ------

  const updateOverview = useCallback(
    (data) => {
      const currentProject = getStore().projects.find((p) => p.id === projectId)
      if (!currentProject) return
      getStore().updateProject(projectId, {
        overview: { ...currentProject.overview, ...data },
      })
    },
    [projectId, getStore]
  )

  // ------ Issues ------

  const addIssue = useCallback(
    (issue) => {
      return getStore().addIssue(projectId, issue)
    },
    [projectId, getStore]
  )

  const updateIssue = useCallback(
    (issueId, updates) => {
      getStore().updateIssue(projectId, issueId, updates)
    },
    [projectId, getStore]
  )

  const deleteIssue = useCallback(
    (issueId) => {
      getStore().deleteIssue(projectId, issueId)
    },
    [projectId, getStore]
  )

  // ------ Pages ------

  const addPage = useCallback(
    (page) => {
      return getStore().addPage(projectId, page)
    },
    [projectId, getStore]
  )

  const updatePage = useCallback(
    (pageId, updates) => {
      getStore().updatePage(projectId, pageId, updates)
    },
    [projectId, getStore]
  )

  const deletePage = useCallback(
    (pageId) => {
      getStore().deletePage(projectId, pageId)
    },
    [projectId, getStore]
  )

  // ------ Decisions ------

  const addDecision = useCallback(
    (decision) => {
      return getStore().addDecision(projectId, decision)
    },
    [projectId, getStore]
  )

  const updateDecision = useCallback(
    (decisionId, updates) => {
      getStore().updateDecision(projectId, decisionId, updates)
    },
    [projectId, getStore]
  )

  // ------ Phases (timeline) ------

  const addPhase = useCallback(
    (phase) => {
      return getStore().addPhase(projectId, phase)
    },
    [projectId, getStore]
  )

  const updatePhase = useCallback(
    (phaseId, updates) => {
      getStore().updatePhase(projectId, phaseId, updates)
    },
    [projectId, getStore]
  )

  const deletePhase = useCallback(
    (phaseId) => {
      getStore().deletePhase(projectId, phaseId)
    },
    [projectId, getStore]
  )

  // ------ Milestones (timeline) ------

  const addMilestone = useCallback(
    (milestone) => {
      return getStore().addMilestone(projectId, milestone)
    },
    [projectId, getStore]
  )

  const updateMilestone = useCallback(
    (milestoneId, updates) => {
      getStore().updateMilestone(projectId, milestoneId, updates)
    },
    [projectId, getStore]
  )

  const deleteMilestone = useCallback(
    (milestoneId) => {
      getStore().deleteMilestone(projectId, milestoneId)
    },
    [projectId, getStore]
  )

  // ------ Workflow ------

  const updateWorkflow = useCallback(
    (workflowData) => {
      getStore().updateWorkflow(projectId, workflowData)
    },
    [projectId, getStore]
  )

  // ------ Architecture ------

  const updateArchitecture = useCallback(
    (architectureData) => {
      getStore().updateArchitecture(projectId, architectureData)
    },
    [projectId, getStore]
  )

  // ------ Sprints ------

  const addSprint = useCallback(
    (sprintData) => {
      return getStore().addSprint(projectId, sprintData)
    },
    [projectId, getStore]
  )

  const updateSprint = useCallback(
    (sprintId, updates) => {
      getStore().updateSprint(projectId, sprintId, updates)
    },
    [projectId, getStore]
  )

  const deleteSprint = useCallback(
    (sprintId) => {
      getStore().deleteSprint(projectId, sprintId)
    },
    [projectId, getStore]
  )

  const closeSprint = useCallback(
    (sprintId, moveIncomplete = 'backlog') => {
      getStore().closeSprint(projectId, sprintId, moveIncomplete)
    },
    [projectId, getStore]
  )

  // ------ Board settings ------

  const updateBoardSettings = useCallback(
    (settings) => {
      getStore().updateBoardSettings(projectId, settings)
    },
    [projectId, getStore]
  )

  // ------ Settings ------

  const updateSettings = useCallback(
    (settings) => {
      getStore().updateSettings(projectId, settings)
    },
    [projectId, getStore]
  )

  return useMemo(
    () => ({
      project,
      updateProject,
      updateOverview,
      addIssue,
      updateIssue,
      deleteIssue,
      addPage,
      updatePage,
      deletePage,
      addDecision,
      updateDecision,
      addPhase,
      updatePhase,
      deletePhase,
      addMilestone,
      updateMilestone,
      deleteMilestone,
      updateWorkflow,
      updateArchitecture,
      updateBoardSettings,
      updateSettings,
      addSprint,
      updateSprint,
      deleteSprint,
      closeSprint,
    }),
    [
      project,
      updateProject,
      updateOverview,
      addIssue,
      updateIssue,
      deleteIssue,
      addPage,
      updatePage,
      deletePage,
      addDecision,
      updateDecision,
      addPhase,
      updatePhase,
      deletePhase,
      addMilestone,
      updateMilestone,
      deleteMilestone,
      addSprint,
      updateSprint,
      deleteSprint,
      closeSprint,
      updateWorkflow,
      updateArchitecture,
      updateBoardSettings,
      updateSettings,
    ]
  )
}
