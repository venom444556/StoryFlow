import { useCallback, useMemo } from 'react'
import { useProjectsStore } from '../stores/projectsStore'
// New entity stores — API-backed, will replace blob-based actions in Task 33
import { useIssuesStore } from '../stores/issuesStore'
import { useSprintsStore } from '../stores/sprintsStore'
import { usePagesStore } from '../stores/pagesStore'
import { useDecisionsStore } from '../stores/decisionsStore'
import { useTimelineStore } from '../stores/timelineStore'
import { useWorkflowStore } from '../stores/workflowStore'
import { useArchitectureStore } from '../stores/architectureStore'

/**
 * Hook for working with a single project
 * Now powered by Zustand for optimized re-renders
 *
 * Migration note (Task 31): This hook currently delegates entity mutations to
 * the monolithic projectsStore (blob-based, in-memory). The new entity stores
 * are imported and available via the `stores` property for components that want
 * to start using API-backed mutations. In Task 33, all blob-based actions will
 * be replaced with entity store actions.
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

      // -----------------------------------------------------------------------
      // New entity stores (API-backed) — migration prep for Task 33
      // -----------------------------------------------------------------------
      // Components can start using these directly for reads/mutations.
      // Each store talks to per-entity REST endpoints and manages its own state.
      // Usage: const { stores } = useProject(id)
      //        stores.issues.fetchIssues(id)
      //        stores.pages.createPage(id, { title: '...' })
      stores: {
        issues: useIssuesStore,
        sprints: useSprintsStore,
        pages: usePagesStore,
        decisions: useDecisionsStore,
        timeline: useTimelineStore,
        workflow: useWorkflowStore,
        architecture: useArchitectureStore,
      },
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
