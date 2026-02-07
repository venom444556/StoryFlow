import { useCallback, useMemo } from 'react'
import { generateId } from '../utils/ids'
import { useProjectsContext } from '../contexts/ProjectsContext'

export function useProject(projectId) {
  const { getProject, updateProject: ctxUpdateProject } = useProjectsContext()

  const project = getProject(projectId)

  // ------ Generic project updater ------

  const updateProject = useCallback(
    (updates) => {
      ctxUpdateProject(projectId, updates)
    },
    [projectId, ctxUpdateProject]
  )

  // ------ Overview ------

  const updateOverview = useCallback(
    (data) => {
      if (!project) return
      updateProject({
        overview: { ...project.overview, ...data },
      })
    },
    [project, updateProject]
  )

  // ------ Issues ------

  const addIssue = useCallback(
    (issue) => {
      if (!project) return
      const nextNumber = project.board.nextIssueNumber || 1
      const newIssue = {
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...issue,
      }
      updateProject({
        board: {
          ...project.board,
          issues: [...project.board.issues, newIssue],
          nextIssueNumber: nextNumber + 1,
        },
      })
      return newIssue
    },
    [project, updateProject]
  )

  const updateIssue = useCallback(
    (issueId, updates) => {
      if (!project) return
      updateProject({
        board: {
          ...project.board,
          issues: project.board.issues.map((issue) =>
            issue.id === issueId
              ? { ...issue, ...updates, updatedAt: new Date().toISOString() }
              : issue
          ),
        },
      })
    },
    [project, updateProject]
  )

  const deleteIssue = useCallback(
    (issueId) => {
      if (!project) return
      updateProject({
        board: {
          ...project.board,
          issues: project.board.issues.filter((issue) => issue.id !== issueId),
        },
      })
    },
    [project, updateProject]
  )

  // ------ Pages ------

  const addPage = useCallback(
    (page) => {
      if (!project) return
      const newPage = {
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'draft',
        parentId: null,
        ...page,
      }
      updateProject({
        pages: [...project.pages, newPage],
      })
      return newPage
    },
    [project, updateProject]
  )

  const updatePage = useCallback(
    (pageId, updates) => {
      if (!project) return
      updateProject({
        pages: project.pages.map((page) =>
          page.id === pageId
            ? { ...page, ...updates, updatedAt: new Date().toISOString() }
            : page
        ),
      })
    },
    [project, updateProject]
  )

  const deletePage = useCallback(
    (pageId) => {
      if (!project) return
      // Also remove any child pages that reference this page as parent
      updateProject({
        pages: project.pages.filter(
          (page) => page.id !== pageId && page.parentId !== pageId
        ),
      })
    },
    [project, updateProject]
  )

  // ------ Decisions ------

  const addDecision = useCallback(
    (decision) => {
      if (!project) return
      const newDecision = {
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'proposed',
        alternatives: [],
        ...decision,
      }
      updateProject({
        decisions: [...project.decisions, newDecision],
      })
      return newDecision
    },
    [project, updateProject]
  )

  const updateDecision = useCallback(
    (decisionId, updates) => {
      if (!project) return
      updateProject({
        decisions: project.decisions.map((d) =>
          d.id === decisionId
            ? { ...d, ...updates, updatedAt: new Date().toISOString() }
            : d
        ),
      })
    },
    [project, updateProject]
  )

  // ------ Phases (timeline) ------

  const addPhase = useCallback(
    (phase) => {
      if (!project) return
      const newPhase = {
        id: generateId(),
        progress: 0,
        ...phase,
      }
      updateProject({
        timeline: {
          ...project.timeline,
          phases: [...project.timeline.phases, newPhase],
        },
      })
      return newPhase
    },
    [project, updateProject]
  )

  const updatePhase = useCallback(
    (phaseId, updates) => {
      if (!project) return
      updateProject({
        timeline: {
          ...project.timeline,
          phases: project.timeline.phases.map((phase) =>
            phase.id === phaseId ? { ...phase, ...updates } : phase
          ),
        },
      })
    },
    [project, updateProject]
  )

  const deletePhase = useCallback(
    (phaseId) => {
      if (!project) return
      updateProject({
        timeline: {
          ...project.timeline,
          phases: project.timeline.phases.filter((phase) => phase.id !== phaseId),
        },
      })
    },
    [project, updateProject]
  )

  // ------ Milestones (timeline) ------

  const addMilestone = useCallback(
    (milestone) => {
      if (!project) return
      const milestones = project.timeline?.milestones || []
      const newMilestone = {
        id: generateId(),
        completed: false,
        ...milestone,
      }
      updateProject({
        timeline: {
          ...project.timeline,
          milestones: [...milestones, newMilestone],
        },
      })
      return newMilestone
    },
    [project, updateProject]
  )

  const updateMilestone = useCallback(
    (milestoneId, updates) => {
      if (!project) return
      const milestones = project.timeline?.milestones || []
      updateProject({
        timeline: {
          ...project.timeline,
          milestones: milestones.map((m) =>
            m.id === milestoneId ? { ...m, ...updates } : m
          ),
        },
      })
    },
    [project, updateProject]
  )

  const deleteMilestone = useCallback(
    (milestoneId) => {
      if (!project) return
      const milestones = project.timeline?.milestones || []
      updateProject({
        timeline: {
          ...project.timeline,
          milestones: milestones.filter((m) => m.id !== milestoneId),
        },
      })
    },
    [project, updateProject]
  )

  // ------ Workflow ------

  const updateWorkflow = useCallback(
    (workflowData) => {
      if (!project) return
      updateProject({
        workflow: { ...project.workflow, ...workflowData },
      })
    },
    [project, updateProject]
  )

  // ------ Architecture ------

  const updateArchitecture = useCallback(
    (architectureData) => {
      if (!project) return
      updateProject({
        architecture: { ...project.architecture, ...architectureData },
      })
    },
    [project, updateProject]
  )

  // ------ Board settings ------

  const updateBoardSettings = useCallback(
    (settings) => {
      if (!project) return
      updateProject({
        board: { ...project.board, ...settings },
      })
    },
    [project, updateProject]
  )

  // ------ Settings ------

  const updateSettings = useCallback(
    (settings) => {
      if (!project) return
      updateProject({
        settings: { ...project.settings, ...settings },
      })
    },
    [project, updateProject]
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
      updateWorkflow,
      updateArchitecture,
      updateBoardSettings,
      updateSettings,
    ]
  )
}
