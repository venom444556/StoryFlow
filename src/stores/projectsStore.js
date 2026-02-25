import { useCallback } from 'react'
import { create } from 'zustand'
import { createJSONStorage, persist, subscribeWithSelector } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { generateId, generateProjectId } from '../utils/ids'
import { validateConnections } from '../utils/workflow'
import indexedDbStorage from '../db/indexedDbStorage'
import { broadcastUpdate, onCrossTabUpdate, setRehydrating } from '../utils/crossTabSync'
import { createDefaultProject } from '../data/defaultProject'
// Seed project support (optional — loaded dynamically if src/data/storyflow.js exists)
let _createSeedProject = null
let _SEED_VERSION = 0
const SEED_PROJECT_ID = 'storyflow'
const LEGACY_SEED_PROJECT_ID = 'storyflow-seed-00000000-0001'

// Eagerly start loading seed data (non-blocking, optional file)
// import.meta.glob returns {} if the file doesn't exist — no build error
const _seedModules = import.meta.glob('../data/storyflow.js')
const _seedReady = _seedModules['../data/storyflow.js']
  ? _seedModules['../data/storyflow.js']().then((seed) => {
      _createSeedProject = seed.createSeedProject
      _SEED_VERSION = seed.SEED_VERSION
    })
  : Promise.resolve()
import {
  useActivityStore,
  ACTIVITY_TYPES,
  createIssueActivity,
  createPageActivity,
  createDecisionActivity,
  createPhaseActivity,
} from './activityStore'

const STORAGE_KEY = 'storyflow-projects'

// ---------------------------------------------------------------------------
// Server sync: push client state to REST API (debounced)
// ---------------------------------------------------------------------------
let _syncTimer = null
let _isSyncing = false

/** Push all projects to the server-side JSON store */
function syncToServer(projects) {
  // Don't sync during rehydration (prevents loops)
  if (_isSyncing) return
  clearTimeout(_syncTimer)
  _syncTimer = setTimeout(async () => {
    try {
      await fetch('/api/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Confirm': 'overwrite-all',
        },
        body: JSON.stringify({ projects }),
      })
    } catch {
      // Server may not be running (production build, etc.) — silently ignore
    }
  }, 500)
}

// ---------------------------------------------------------------------------
// Migrate seed project if a new version is available
// ---------------------------------------------------------------------------
function migrateSeedProject(projects) {
  // Skip seed migration if no seed data is available
  if (!_createSeedProject) return projects

  // Find seed project by isSeed flag, new ID, or legacy ID
  let seedIndex = projects.findIndex((p) => p.isSeed === true)

  if (seedIndex === -1) {
    // Check for legacy ID (pre-slug naming convention)
    seedIndex = projects.findIndex((p) => p.id === LEGACY_SEED_PROJECT_ID)
  }

  if (seedIndex === -1) {
    // Check for new slug-based ID
    seedIndex = projects.findIndex((p) => p.id === SEED_PROJECT_ID)
  }

  if (seedIndex === -1) {
    // Oldest legacy: pre-versioning seed project matched by name
    const legacyIndex = projects.findIndex(
      (p) => p.name === 'StoryFlow Development' && p.isSeed === undefined
    )
    if (legacyIndex !== -1) {
      const updated = [...projects]
      updated[legacyIndex] = _createSeedProject()
      return updated
    }
    return projects
  }

  // Check version — replace if outdated (also handles ID migration from legacy → slug)
  if ((projects[seedIndex].seedVersion || 0) < _SEED_VERSION) {
    const updated = [...projects]
    updated[seedIndex] = _createSeedProject()
    return updated
  }

  return projects
}

// ---------------------------------------------------------------------------
// Projects Store
// ---------------------------------------------------------------------------
export const useProjectsStore = create(
  subscribeWithSelector(
    persist(
      immer((set, get) => ({
        // State
        projects: [],

        // Computed selectors (use these for memoized reads)
        getProject: (id) => {
          const project = get().projects.find((p) => p.id === id)
          if (project) return project
          // Fallback: handle legacy seed project ID
          if (id === LEGACY_SEED_PROJECT_ID) {
            return get().projects.find((p) => p.id === SEED_PROJECT_ID && p.isSeed) || null
          }
          return null
        },

        getProjectsByStatus: (status) => get().projects.filter((p) => p.status === status),

        // Actions
        setProjects: (projects) => set({ projects }),

        addProject: (name) => {
          const trimmed = (name || '').trim()
          if (!trimmed) {
            throw new Error('Project name is required')
          }
          const active = get().projects.filter((p) => !p.deletedAt)
          if (active.some((p) => p.name.toLowerCase() === trimmed.toLowerCase())) {
            throw new Error(`A project named "${trimmed}" already exists`)
          }
          const existingIds = get().projects.map((p) => p.id)
          const id = generateProjectId(trimmed, existingIds)
          const project = createDefaultProject(trimmed, id)
          set((state) => {
            state.projects.push(project)
          })
          return project
        },

        updateProject: (id, updates) => {
          set((state) => {
            const index = state.projects.findIndex((p) => p.id === id)
            if (index !== -1) {
              state.projects[index] = {
                ...state.projects[index],
                ...updates,
                updatedAt: new Date().toISOString(),
              }
            }
          })
        },

        // Soft-delete: moves project to trash (recoverable)
        trashProject: (id) => {
          set((state) => {
            const project = state.projects.find((p) => p.id === id)
            if (project) {
              project.deletedAt = new Date().toISOString()
              project.updatedAt = new Date().toISOString()
            }
          })
        },

        // Restore a trashed project (with unique-name check)
        restoreProject: (id) => {
          const state = get()
          const project = state.projects.find((p) => p.id === id)
          if (!project) return

          // Check for name conflict with active projects
          const active = state.projects.filter((p) => !p.deletedAt)
          const nameConflict = active.some(
            (p) => p.name.toLowerCase() === project.name.toLowerCase()
          )

          set((draft) => {
            const target = draft.projects.find((p) => p.id === id)
            if (!target) return
            // If name conflicts, auto-suffix with "(restored)"
            if (nameConflict) {
              let suffix = '(restored)'
              const allNames = new Set(active.map((p) => p.name.toLowerCase()))
              if (allNames.has(`${target.name} ${suffix}`.toLowerCase())) {
                let counter = 2
                while (allNames.has(`${target.name} (restored ${counter})`.toLowerCase())) {
                  counter++
                }
                suffix = `(restored ${counter})`
              }
              target.name = `${target.name} ${suffix}`
            }
            delete target.deletedAt
            target.updatedAt = new Date().toISOString()
          })
        },

        // Permanently delete (no recovery)
        permanentlyDeleteProject: (id) => {
          set((state) => {
            state.projects = state.projects.filter((p) => p.id !== id)
          })
        },

        // Empty all trashed projects
        emptyTrash: () => {
          set((state) => {
            state.projects = state.projects.filter((p) => !p.deletedAt)
          })
        },

        // Legacy alias — maps to soft delete for backward compatibility
        deleteProject: (id) => {
          get().trashProject(id)
        },

        importProject: (data) => {
          let name = (data.name || '').trim()
          if (!name) {
            throw new Error('Imported project must have a name')
          }
          // Auto-suffix if name already exists (imports are copies, not rejects)
          const active = get().projects.filter((p) => !p.deletedAt)
          const lowerNames = new Set(active.map((p) => p.name.toLowerCase()))
          if (lowerNames.has(name.toLowerCase())) {
            let counter = 2
            while (lowerNames.has(`${name} (${counter})`.toLowerCase())) {
              counter++
            }
            name = `${name} (${counter})`
          }
          const existingIds = get().projects.map((p) => p.id)
          const imported = {
            ...data,
            name,
            id: generateProjectId(name, existingIds),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
          set((state) => {
            state.projects.push(imported)
          })
          return imported
        },

        // ---------------------------------------------------------------------------
        // Issue Actions
        // ---------------------------------------------------------------------------
        addIssue: (projectId, issue) => {
          let newIssue = null
          set((state) => {
            const project = state.projects.find((p) => p.id === projectId)
            if (!project) return

            const nextNumber = project.board.nextIssueNumber || 1
            // Derive a key prefix from the project name (e.g. "StoryFlow" → "SF",
            // "My App" → "MA"). Falls back to "IS" if no words found.
            const prefix =
              project.name
                .split(/[\s-]+/)
                .filter(Boolean)
                .map((w) => w[0].toUpperCase())
                .join('')
                .slice(0, 3) || 'IS'
            const now = new Date().toISOString()
            newIssue = {
              ...issue,
              id: generateId(),
              key: issue.key || `${prefix}-${nextNumber}`,
              createdAt: now,
              updatedAt: now,
            }
            // Set initial phase timestamp based on starting status
            if (newIssue.status === 'To Do' && !newIssue.todoAt) {
              newIssue.todoAt = now
            } else if (newIssue.status === 'In Progress' && !newIssue.inProgressAt) {
              newIssue.inProgressAt = now
            } else if (newIssue.status === 'Done' && !newIssue.doneAt) {
              newIssue.doneAt = now
            }
            project.board.issues.push(newIssue)
            project.board.nextIssueNumber = nextNumber + 1
            project.updatedAt = new Date().toISOString()
          })

          // Log activity
          if (newIssue) {
            useActivityStore
              .getState()
              .logActivity(projectId, createIssueActivity(ACTIVITY_TYPES.ISSUE_CREATED, newIssue))
          }

          return newIssue
        },

        updateIssue: (projectId, issueId, updates) => {
          let oldIssue = null
          set((state) => {
            const project = state.projects.find((p) => p.id === projectId)
            if (!project) return

            const issueIndex = project.board.issues.findIndex((i) => i.id === issueId)
            if (issueIndex !== -1) {
              oldIssue = { ...project.board.issues[issueIndex] }
              const now = new Date().toISOString()
              project.board.issues[issueIndex] = {
                ...project.board.issues[issueIndex],
                ...updates,
                updatedAt: now,
              }
              // Auto-set phase timestamps on status change
              if (updates.status && updates.status !== oldIssue.status) {
                if (updates.status === 'To Do') {
                  project.board.issues[issueIndex].todoAt = now
                } else if (updates.status === 'In Progress') {
                  project.board.issues[issueIndex].inProgressAt = now
                } else if (updates.status === 'Done') {
                  project.board.issues[issueIndex].doneAt = now
                }
              }
              project.updatedAt = now
            }
          })

          // Log specific activity types based on what changed
          if (oldIssue) {
            const updatedIssue = { ...oldIssue, ...updates }

            if (updates.status && updates.status !== oldIssue.status) {
              useActivityStore.getState().logActivity(
                projectId,
                createIssueActivity(ACTIVITY_TYPES.ISSUE_STATUS_CHANGED, updatedIssue, {
                  from: oldIssue.status,
                  to: updates.status,
                })
              )
            } else if (updates.priority && updates.priority !== oldIssue.priority) {
              useActivityStore.getState().logActivity(
                projectId,
                createIssueActivity(ACTIVITY_TYPES.ISSUE_PRIORITY_CHANGED, updatedIssue, {
                  priority: updates.priority,
                })
              )
            } else if (updates.assignee !== undefined && updates.assignee !== oldIssue.assignee) {
              useActivityStore.getState().logActivity(
                projectId,
                createIssueActivity(ACTIVITY_TYPES.ISSUE_ASSIGNED, updatedIssue, {
                  assignee: updates.assignee,
                })
              )
            } else {
              useActivityStore
                .getState()
                .logActivity(
                  projectId,
                  createIssueActivity(ACTIVITY_TYPES.ISSUE_UPDATED, updatedIssue)
                )
            }
          }
        },

        deleteIssue: (projectId, issueId) => {
          let deletedIssue = null
          set((state) => {
            const project = state.projects.find((p) => p.id === projectId)
            if (!project) return

            deletedIssue = project.board.issues.find((i) => i.id === issueId)
            const isEpic = deletedIssue?.type === 'epic'

            project.board.issues = project.board.issues
              .filter((issue) => issue.id !== issueId)
              .map((issue) => {
                if (isEpic && issue.epicId === issueId) {
                  return { ...issue, epicId: null }
                }
                if (issue.dependencies?.includes(issueId)) {
                  return {
                    ...issue,
                    dependencies: issue.dependencies.filter((d) => d !== issueId),
                  }
                }
                return issue
              })
            project.updatedAt = new Date().toISOString()
          })

          // Log activity
          if (deletedIssue) {
            useActivityStore
              .getState()
              .logActivity(
                projectId,
                createIssueActivity(ACTIVITY_TYPES.ISSUE_DELETED, deletedIssue)
              )
          }
        },

        // ---------------------------------------------------------------------------
        // Page Actions
        // ---------------------------------------------------------------------------
        addPage: (projectId, page) => {
          let newPage = null
          set((state) => {
            const project = state.projects.find((p) => p.id === projectId)
            if (!project) return

            newPage = {
              id: generateId(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              status: 'draft',
              parentId: null,
              ...page,
            }
            project.pages.push(newPage)
            project.updatedAt = new Date().toISOString()
          })

          // Log activity
          if (newPage) {
            useActivityStore
              .getState()
              .logActivity(projectId, createPageActivity(ACTIVITY_TYPES.PAGE_CREATED, newPage))
          }

          return newPage
        },

        updatePage: (projectId, pageId, updates) => {
          let oldPage = null
          set((state) => {
            const project = state.projects.find((p) => p.id === projectId)
            if (!project) return

            const pageIndex = project.pages.findIndex((p) => p.id === pageId)
            if (pageIndex !== -1) {
              oldPage = { ...project.pages[pageIndex] }
              project.pages[pageIndex] = {
                ...project.pages[pageIndex],
                ...updates,
                updatedAt: new Date().toISOString(),
              }
              project.updatedAt = new Date().toISOString()
            }
          })

          // Log activity
          if (oldPage) {
            const updatedPage = { ...oldPage, ...updates }
            if (updates.status === 'published' && oldPage.status !== 'published') {
              useActivityStore
                .getState()
                .logActivity(
                  projectId,
                  createPageActivity(ACTIVITY_TYPES.PAGE_PUBLISHED, updatedPage)
                )
            } else {
              useActivityStore
                .getState()
                .logActivity(
                  projectId,
                  createPageActivity(ACTIVITY_TYPES.PAGE_UPDATED, updatedPage)
                )
            }
          }
        },

        deletePage: (projectId, pageId) => {
          let deletedPage = null
          set((state) => {
            const project = state.projects.find((p) => p.id === projectId)
            if (!project) return

            deletedPage = project.pages.find((p) => p.id === pageId)
            project.pages = project.pages.filter(
              (page) => page.id !== pageId && page.parentId !== pageId
            )
            project.updatedAt = new Date().toISOString()
          })

          // Log activity
          if (deletedPage) {
            useActivityStore
              .getState()
              .logActivity(projectId, createPageActivity(ACTIVITY_TYPES.PAGE_DELETED, deletedPage))
          }
        },

        // ---------------------------------------------------------------------------
        // Decision Actions
        // ---------------------------------------------------------------------------
        addDecision: (projectId, decision) => {
          let newDecision = null
          set((state) => {
            const project = state.projects.find((p) => p.id === projectId)
            if (!project) return

            newDecision = {
              id: generateId(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              status: 'proposed',
              alternatives: [],
              ...decision,
            }
            project.decisions.push(newDecision)
            project.updatedAt = new Date().toISOString()
          })

          // Log activity
          if (newDecision) {
            useActivityStore
              .getState()
              .logActivity(
                projectId,
                createDecisionActivity(ACTIVITY_TYPES.DECISION_CREATED, newDecision)
              )
          }

          return newDecision
        },

        updateDecision: (projectId, decisionId, updates) => {
          let oldDecision = null
          set((state) => {
            const project = state.projects.find((p) => p.id === projectId)
            if (!project) return

            const decisionIndex = project.decisions.findIndex((d) => d.id === decisionId)
            if (decisionIndex !== -1) {
              oldDecision = { ...project.decisions[decisionIndex] }
              project.decisions[decisionIndex] = {
                ...project.decisions[decisionIndex],
                ...updates,
                updatedAt: new Date().toISOString(),
              }
              project.updatedAt = new Date().toISOString()
            }
          })

          // Log activity
          if (oldDecision) {
            const updatedDecision = { ...oldDecision, ...updates }
            if (updates.status && updates.status !== oldDecision.status) {
              useActivityStore.getState().logActivity(
                projectId,
                createDecisionActivity(ACTIVITY_TYPES.DECISION_STATUS_CHANGED, updatedDecision, {
                  status: updates.status,
                })
              )
            } else {
              useActivityStore
                .getState()
                .logActivity(
                  projectId,
                  createDecisionActivity(ACTIVITY_TYPES.DECISION_UPDATED, updatedDecision)
                )
            }
          }
        },

        // ---------------------------------------------------------------------------
        // Phase Actions
        // ---------------------------------------------------------------------------
        addPhase: (projectId, phase) => {
          let newPhase = null
          set((state) => {
            const project = state.projects.find((p) => p.id === projectId)
            if (!project) return

            newPhase = {
              id: generateId(),
              progress: 0,
              ...phase,
            }
            project.timeline.phases.push(newPhase)
            project.updatedAt = new Date().toISOString()
          })

          // Log activity
          if (newPhase) {
            useActivityStore
              .getState()
              .logActivity(projectId, createPhaseActivity(ACTIVITY_TYPES.PHASE_CREATED, newPhase))
          }

          return newPhase
        },

        updatePhase: (projectId, phaseId, updates) => {
          let oldPhase = null
          set((state) => {
            const project = state.projects.find((p) => p.id === projectId)
            if (!project) return

            const phaseIndex = project.timeline.phases.findIndex((p) => p.id === phaseId)
            if (phaseIndex !== -1) {
              oldPhase = { ...project.timeline.phases[phaseIndex] }
              project.timeline.phases[phaseIndex] = {
                ...project.timeline.phases[phaseIndex],
                ...updates,
              }
              project.updatedAt = new Date().toISOString()
            }
          })

          // Log activity
          if (oldPhase) {
            useActivityStore
              .getState()
              .logActivity(
                projectId,
                createPhaseActivity(ACTIVITY_TYPES.PHASE_UPDATED, { ...oldPhase, ...updates })
              )
          }
        },

        deletePhase: (projectId, phaseId) => {
          let deletedPhase = null
          set((state) => {
            const project = state.projects.find((p) => p.id === projectId)
            if (!project) return

            deletedPhase = project.timeline.phases.find((p) => p.id === phaseId)
            project.timeline.phases = project.timeline.phases.filter((p) => p.id !== phaseId)
            if (project.timeline.milestones) {
              project.timeline.milestones = project.timeline.milestones.filter(
                (m) => m.phaseId !== phaseId
              )
            }
            project.updatedAt = new Date().toISOString()
          })

          // Log activity
          if (deletedPhase) {
            useActivityStore
              .getState()
              .logActivity(
                projectId,
                createPhaseActivity(ACTIVITY_TYPES.PHASE_DELETED, deletedPhase)
              )
          }
        },

        // ---------------------------------------------------------------------------
        // Milestone Actions
        // ---------------------------------------------------------------------------
        addMilestone: (projectId, milestone) => {
          let newMilestone = null
          set((state) => {
            const project = state.projects.find((p) => p.id === projectId)
            if (!project) return

            if (!project.timeline.milestones) {
              project.timeline.milestones = []
            }

            newMilestone = {
              id: generateId(),
              completed: false,
              ...milestone,
            }
            project.timeline.milestones.push(newMilestone)
            project.updatedAt = new Date().toISOString()
          })
          return newMilestone
        },

        updateMilestone: (projectId, milestoneId, updates) => {
          set((state) => {
            const project = state.projects.find((p) => p.id === projectId)
            if (!project?.timeline?.milestones) return

            const milestoneIndex = project.timeline.milestones.findIndex(
              (m) => m.id === milestoneId
            )
            if (milestoneIndex !== -1) {
              project.timeline.milestones[milestoneIndex] = {
                ...project.timeline.milestones[milestoneIndex],
                ...updates,
              }
              project.updatedAt = new Date().toISOString()
            }
          })
        },

        deleteMilestone: (projectId, milestoneId) => {
          set((state) => {
            const project = state.projects.find((p) => p.id === projectId)
            if (!project?.timeline?.milestones) return

            project.timeline.milestones = project.timeline.milestones.filter(
              (m) => m.id !== milestoneId
            )
            project.updatedAt = new Date().toISOString()
          })
        },

        // ---------------------------------------------------------------------------
        // Workflow Actions
        // ---------------------------------------------------------------------------
        updateWorkflow: (projectId, workflowData) => {
          set((state) => {
            const project = state.projects.find((p) => p.id === projectId)
            if (!project) return

            const sanitized = { ...workflowData }
            if (sanitized.connections) {
              sanitized.connections = validateConnections(sanitized.connections)
            }
            project.workflow = { ...project.workflow, ...sanitized }
            project.updatedAt = new Date().toISOString()
          })
        },

        // ---------------------------------------------------------------------------
        // Architecture Actions
        // ---------------------------------------------------------------------------
        updateArchitecture: (projectId, architectureData) => {
          set((state) => {
            const project = state.projects.find((p) => p.id === projectId)
            if (!project) return

            project.architecture = { ...project.architecture, ...architectureData }
            project.updatedAt = new Date().toISOString()
          })
        },

        // ---------------------------------------------------------------------------
        // Sprint Actions
        // ---------------------------------------------------------------------------
        addSprint: (projectId, sprintData) => {
          const now = new Date().toISOString()
          const newSprint = {
            id: sprintData.id || crypto.randomUUID(),
            name: sprintData.name || 'New Sprint',
            goal: sprintData.goal || '',
            startDate: sprintData.startDate || null,
            endDate: sprintData.endDate || null,
            status: sprintData.status || 'planning',
            createdAt: now,
            updatedAt: now,
          }
          set((state) => {
            const project = state.projects.find((p) => p.id === projectId)
            if (!project) return
            if (!project.board.sprints) project.board.sprints = []
            project.board.sprints.push(newSprint)
            project.updatedAt = now
          })
          return newSprint
        },

        updateSprint: (projectId, sprintId, updates) => {
          set((state) => {
            const project = state.projects.find((p) => p.id === projectId)
            if (!project) return
            const sprint = (project.board.sprints || []).find((s) => s.id === sprintId)
            if (!sprint) return
            Object.assign(sprint, updates, { updatedAt: new Date().toISOString() })
            project.updatedAt = new Date().toISOString()
          })
        },

        deleteSprint: (projectId, sprintId) => {
          set((state) => {
            const project = state.projects.find((p) => p.id === projectId)
            if (!project) return
            project.board.sprints = (project.board.sprints || []).filter((s) => s.id !== sprintId)
            // Unassign issues from deleted sprint
            project.board.issues.forEach((issue) => {
              if (issue.sprintId === sprintId) {
                issue.sprintId = null
              }
            })
            project.updatedAt = new Date().toISOString()
          })
        },

        closeSprint: (projectId, sprintId, moveIncomplete = 'backlog') => {
          set((state) => {
            const project = state.projects.find((p) => p.id === projectId)
            if (!project) return
            const sprint = (project.board.sprints || []).find((s) => s.id === sprintId)
            if (!sprint) return
            sprint.status = 'completed'
            sprint.updatedAt = new Date().toISOString()

            // Handle incomplete issues
            if (moveIncomplete === 'backlog') {
              project.board.issues.forEach((issue) => {
                if (issue.sprintId === sprintId && issue.status !== 'Done') {
                  issue.sprintId = null
                }
              })
            }
            // If moveIncomplete is a sprint ID, move to that sprint
            else if (moveIncomplete && moveIncomplete !== 'backlog') {
              project.board.issues.forEach((issue) => {
                if (issue.sprintId === sprintId && issue.status !== 'Done') {
                  issue.sprintId = moveIncomplete
                }
              })
            }

            project.updatedAt = new Date().toISOString()
          })
        },

        // ---------------------------------------------------------------------------
        // Board Settings
        // ---------------------------------------------------------------------------
        updateBoardSettings: (projectId, settings) => {
          set((state) => {
            const project = state.projects.find((p) => p.id === projectId)
            if (!project) return

            project.board = { ...project.board, ...settings }
            project.updatedAt = new Date().toISOString()
          })
        },

        // ---------------------------------------------------------------------------
        // Project Settings
        // ---------------------------------------------------------------------------
        updateSettings: (projectId, settings) => {
          set((state) => {
            const project = state.projects.find((p) => p.id === projectId)
            if (!project) return

            project.settings = { ...project.settings, ...settings }
            project.updatedAt = new Date().toISOString()
          })
        },
      })),
      {
        name: STORAGE_KEY,
        version: 1,
        storage: createJSONStorage(() => indexedDbStorage),
        onRehydrateStorage: () => (state) => {
          if (state) {
            // Wait for seed data to load, then migrate if needed
            _seedReady.then(() => {
              const store = useProjectsStore.getState()
              const migrated = migrateSeedProject(store.projects)
              if (migrated !== store.projects) {
                useProjectsStore.setState({ projects: migrated })
              }
              // Seed with project if empty (only if seed data is available)
              if (store.projects.length === 0 && _createSeedProject) {
                useProjectsStore.setState({ projects: [_createSeedProject()] })
              }
            })

            // Seed initial activities for the seed project if activity store is empty
            const seedProject = state.projects.find((p) => p.isSeed)
            if (seedProject) {
              // Use setTimeout to ensure activity store has rehydrated from localStorage
              setTimeout(() => {
                const activityState = useActivityStore.getState()
                const existing = activityState.activities[seedProject.id]
                if (existing && existing.length > 0) return

                const now = new Date()
                const activities = []

                // Pull a few real entities from the seed project for realistic activities
                const epics = (seedProject.board?.issues || []).filter((i) => i.type === 'epic')
                const stories = (seedProject.board?.issues || []).filter((i) => i.type === 'story')
                const pages = seedProject.pages || []
                const decisions = seedProject.decisions || []
                const phases = seedProject.timeline?.phases || []

                // Oldest first — logActivity prepends, so last logged = newest at top
                // 1. Project created
                activities.push({
                  type: ACTIVITY_TYPES.PROJECT_CREATED,
                  entityType: 'project',
                  entityId: seedProject.id,
                  actor: 'system',
                  metadata: { projectName: seedProject.name },
                })

                // 2. First epic created
                if (epics[0]) {
                  activities.push(createIssueActivity(ACTIVITY_TYPES.ISSUE_CREATED, epics[0]))
                }

                // 3. A page created
                if (pages[0]) {
                  activities.push(createPageActivity(ACTIVITY_TYPES.PAGE_CREATED, pages[0]))
                }

                // 4. Second epic created
                if (epics[1]) {
                  activities.push(createIssueActivity(ACTIVITY_TYPES.ISSUE_CREATED, epics[1]))
                }

                // 5. A decision created
                if (decisions[0]) {
                  activities.push(
                    createDecisionActivity(ACTIVITY_TYPES.DECISION_CREATED, decisions[0])
                  )
                }

                // 6. A phase created
                if (phases[0]) {
                  activities.push(createPhaseActivity(ACTIVITY_TYPES.PHASE_CREATED, phases[0]))
                }

                // 7. A story created
                if (stories[0]) {
                  activities.push(createIssueActivity(ACTIVITY_TYPES.ISSUE_CREATED, stories[0]))
                }

                // 8. A story status changed to in-progress
                if (stories[1]) {
                  activities.push(
                    createIssueActivity(ACTIVITY_TYPES.ISSUE_STATUS_CHANGED, stories[1], {
                      from: 'todo',
                      to: stories[1].status || 'in-progress',
                    })
                  )
                }

                // Log oldest first so newest ends up at top of the feed
                activities.forEach((activity, i) => {
                  activityState.logActivity(seedProject.id, {
                    ...activity,
                    actor: 'system',
                    timestamp: new Date(
                      now.getTime() - (activities.length - i) * 60000
                    ).toISOString(),
                  })
                })
              }, 100)
            }
          }
        },
      }
    )
  )
)

// ---------------------------------------------------------------------------
// Selectors (for optimized component subscriptions)
// ---------------------------------------------------------------------------
// All projects (including trashed) — use selectActiveProjects for normal views
export const selectProjects = (state) => state.projects
// Active projects (excludes trashed)
export const selectActiveProjects = (state) => state.projects.filter((p) => !p.deletedAt)
// Trashed projects only
export const selectTrashedProjects = (state) => state.projects.filter((p) => !!p.deletedAt)
export const selectProject = (id) => (state) => state.projects.find((p) => p.id === id)
export const selectProjectCount = (state) => state.projects.filter((p) => !p.deletedAt).length
export const selectTrashCount = (state) => state.projects.filter((p) => !!p.deletedAt).length

// Issue selectors
export const selectIssues = (projectId) => (state) => {
  const project = state.projects.find((p) => p.id === projectId)
  return project?.board?.issues || []
}

export const selectIssueById = (projectId, issueId) => (state) => {
  const project = state.projects.find((p) => p.id === projectId)
  return project?.board?.issues?.find((i) => i.id === issueId)
}

// Page selectors
export const selectPages = (projectId) => (state) => {
  const project = state.projects.find((p) => p.id === projectId)
  return project?.pages || []
}

// Decision selectors
export const selectDecisions = (projectId) => (state) => {
  const project = state.projects.find((p) => p.id === projectId)
  return project?.decisions || []
}

// ---------------------------------------------------------------------------
// Hook for backward compatibility with existing useProject hook pattern
// ---------------------------------------------------------------------------
export function useProjectStore(projectId) {
  // Use stable selector to avoid infinite loops
  const projectSelector = useCallback(
    (state) => state.projects.find((p) => p.id === projectId),
    [projectId]
  )
  const project = useProjectsStore(projectSelector)

  // Get stable reference to store actions
  const store = useProjectsStore.getState()

  return {
    project,
    updateProject: (updates) => store.updateProject(projectId, updates),
    addIssue: (issue) => store.addIssue(projectId, issue),
    updateIssue: (issueId, updates) => store.updateIssue(projectId, issueId, updates),
    deleteIssue: (issueId) => store.deleteIssue(projectId, issueId),
    addPage: (page) => store.addPage(projectId, page),
    updatePage: (pageId, updates) => store.updatePage(projectId, pageId, updates),
    deletePage: (pageId) => store.deletePage(projectId, pageId),
    addDecision: (decision) => store.addDecision(projectId, decision),
    updateDecision: (decisionId, updates) => store.updateDecision(projectId, decisionId, updates),
    addPhase: (phase) => store.addPhase(projectId, phase),
    updatePhase: (phaseId, updates) => store.updatePhase(projectId, phaseId, updates),
    deletePhase: (phaseId) => store.deletePhase(projectId, phaseId),
    addMilestone: (milestone) => store.addMilestone(projectId, milestone),
    updateMilestone: (milestoneId, updates) =>
      store.updateMilestone(projectId, milestoneId, updates),
    deleteMilestone: (milestoneId) => store.deleteMilestone(projectId, milestoneId),
    updateWorkflow: (data) => store.updateWorkflow(projectId, data),
    updateArchitecture: (data) => store.updateArchitecture(projectId, data),
    updateBoardSettings: (settings) => store.updateBoardSettings(projectId, settings),
    updateSettings: (settings) => store.updateSettings(projectId, settings),
  }
}

// ---------------------------------------------------------------------------
// Cross-Tab Sync: broadcast updates and re-hydrate on remote changes
// ---------------------------------------------------------------------------
useProjectsStore.subscribe(
  (state) => state.projects,
  () => broadcastUpdate('projects')
)

// Sync activity store across tabs
useActivityStore.subscribe(
  (state) => state.activities,
  () => broadcastUpdate('activity')
)

onCrossTabUpdate(({ store: storeName }) => {
  if (storeName === 'projects') {
    // Suppress broadcasts during rehydration to prevent cross-tab ping-pong
    setRehydrating(true)
    useProjectsStore.persist.rehydrate().finally(() => {
      setRehydrating(false)
    })
  } else if (storeName === 'activity') {
    setRehydrating(true)
    useActivityStore.persist.rehydrate().finally(() => {
      setRehydrating(false)
    })
  }
})

// ---------------------------------------------------------------------------
// Server Sync: push local changes to REST API + listen for external writes
// ---------------------------------------------------------------------------

// Push to server on every local state change (debounced 500ms)
useProjectsStore.subscribe(
  (state) => state.projects,
  (projects) => syncToServer(projects)
)

// Listen for external writes via WebSocket (replaces Vite HMR)
// Also called on startup when IndexedDB is empty (no browser tab was open during
// prior MCP / REST writes), so the client hydrates from the server on first load.
export function reloadFromServer() {
  _isSyncing = true
  fetch('/api/projects')
    .then((res) => (res.ok ? res.json() : null))
    .then(async (summaries) => {
      if (!summaries || summaries.length === 0) return
      // Fetch full project data for each project
      const fullProjects = await Promise.all(
        summaries.map((s) =>
          fetch(`/api/projects/${s.id}`)
            .then((r) => (r.ok ? r.json() : null))
            .catch(() => null)
        )
      )
      const projects = fullProjects.filter(Boolean)
      if (projects.length > 0) {
        // Merge: keep client-only projects, update/add server projects
        const currentProjects = useProjectsStore.getState().projects
        const serverIds = new Set(projects.map((p) => p.id))
        const clientOnly = currentProjects.filter((p) => !serverIds.has(p.id))
        useProjectsStore.setState({ projects: [...clientOnly, ...projects] })
      }
    })
    .catch(() => {
      // Server unavailable — ignore
    })
    .finally(() => {
      _isSyncing = false
    })
}

let _ws = null
let _wsReconnectTimer = null

function connectWebSocket() {
  // Determine WebSocket URL from current page origin
  const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const wsUrl = `${wsProtocol}//localhost:3001`

  try {
    _ws = new WebSocket(wsUrl)
  } catch {
    // WebSocket constructor can throw in some environments
    return
  }

  _ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data)
      if (msg.type === 'sync') {
        reloadFromServer()
      }
    } catch {
      // Ignore malformed messages
    }
  }

  _ws.onclose = () => {
    // Auto-reconnect after 3 seconds
    clearTimeout(_wsReconnectTimer)
    _wsReconnectTimer = setTimeout(connectWebSocket, 3000)
  }

  _ws.onerror = () => {
    // Error triggers close, which triggers reconnect
  }
}

// Initial sync: pull latest from server + connect WebSocket
//
// Always pull from server on startup so that a browser refresh picks up any
// changes written by MCP tools or REST calls while the tab was away.
// Merge strategy: server wins for shared project IDs; client-only projects
// (IDs not on the server) are preserved.  Real-time push for user changes
// during the session is handled by the projects subscribe() listener below.
{
  const unsub = useProjectsStore.persist.onFinishHydration(() => {
    reloadFromServer()
    connectWebSocket()
    unsub()
  })
}
