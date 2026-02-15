import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { generateId } from '../utils/ids'

// ---------------------------------------------------------------------------
// Activity Types
// ---------------------------------------------------------------------------
export const ACTIVITY_TYPES = {
  // Project
  PROJECT_CREATED: 'project_created',
  PROJECT_UPDATED: 'project_updated',
  PROJECT_DELETED: 'project_deleted',

  // Issues
  ISSUE_CREATED: 'issue_created',
  ISSUE_UPDATED: 'issue_updated',
  ISSUE_DELETED: 'issue_deleted',
  ISSUE_STATUS_CHANGED: 'issue_status_changed',
  ISSUE_ASSIGNED: 'issue_assigned',
  ISSUE_PRIORITY_CHANGED: 'issue_priority_changed',

  // Pages
  PAGE_CREATED: 'page_created',
  PAGE_UPDATED: 'page_updated',
  PAGE_DELETED: 'page_deleted',
  PAGE_PUBLISHED: 'page_published',

  // Decisions
  DECISION_CREATED: 'decision_created',
  DECISION_UPDATED: 'decision_updated',
  DECISION_STATUS_CHANGED: 'decision_status_changed',

  // Timeline
  PHASE_CREATED: 'phase_created',
  PHASE_UPDATED: 'phase_updated',
  PHASE_DELETED: 'phase_deleted',
  MILESTONE_CREATED: 'milestone_created',
  MILESTONE_COMPLETED: 'milestone_completed',

  // Workflow
  WORKFLOW_UPDATED: 'workflow_updated',
  WORKFLOW_EXECUTED: 'workflow_executed',

  // Comments
  COMMENT_ADDED: 'comment_added',
  COMMENT_EDITED: 'comment_edited',
  COMMENT_DELETED: 'comment_deleted',
}

// ---------------------------------------------------------------------------
// Activity Store
// ---------------------------------------------------------------------------
const MAX_ACTIVITIES_PER_PROJECT = 500

export const useActivityStore = create(
  persist(
    (set, get) => ({
      // Activities keyed by projectId
      activities: {}, // { [projectId]: Activity[] }

      // ---------------------------------------------------------------------------
      // Actions
      // ---------------------------------------------------------------------------
      logActivity: (projectId, activity) => {
        const newActivity = {
          id: generateId(),
          timestamp: new Date().toISOString(),
          actor: 'user', // In future, could be 'claude' or specific user
          ...activity,
        }

        set((state) => {
          const projectActivities = state.activities[projectId] || []
          const updatedActivities = [newActivity, ...projectActivities].slice(
            0,
            MAX_ACTIVITIES_PER_PROJECT
          )

          return {
            activities: {
              ...state.activities,
              [projectId]: updatedActivities,
            },
          }
        })

        return newActivity
      },

      // Batch log multiple activities
      logActivities: (projectId, activities) => {
        const newActivities = activities.map((activity) => ({
          id: generateId(),
          timestamp: new Date().toISOString(),
          actor: 'user',
          ...activity,
        }))

        set((state) => {
          const projectActivities = state.activities[projectId] || []
          const updatedActivities = [...newActivities, ...projectActivities].slice(
            0,
            MAX_ACTIVITIES_PER_PROJECT
          )

          return {
            activities: {
              ...state.activities,
              [projectId]: updatedActivities,
            },
          }
        })
      },

      // Get activities for a project
      getActivities: (projectId, options = {}) => {
        const { limit = 50, offset = 0, type, entityType, entityId } = options
        let activities = get().activities[projectId] || []

        // Filter by type
        if (type) {
          activities = activities.filter((a) => a.type === type)
        }

        // Filter by entity
        if (entityType) {
          activities = activities.filter((a) => a.entityType === entityType)
        }

        if (entityId) {
          activities = activities.filter((a) => a.entityId === entityId)
        }

        return activities.slice(offset, offset + limit)
      },

      // Get activities for a specific entity (issue, page, etc.)
      getEntityActivities: (projectId, entityType, entityId) => {
        const activities = get().activities[projectId] || []
        return activities.filter(
          (a) => a.entityType === entityType && a.entityId === entityId
        )
      },

      // Clear activities for a project
      clearProjectActivities: (projectId) => {
        set((state) => {
          const { [projectId]: removed, ...rest } = state.activities
          return { activities: rest }
        })
      },

      // Clear all activities
      clearAllActivities: () => {
        set({ activities: {} })
      },
    }),
    {
      name: 'storyflow-activity',
      version: 1,
    }
  )
)

// ---------------------------------------------------------------------------
// Selectors
// ---------------------------------------------------------------------------
export const selectProjectActivities = (projectId) => (state) =>
  state.activities[projectId] || []

export const selectRecentActivities = (projectId, limit = 10) => (state) =>
  (state.activities[projectId] || []).slice(0, limit)

// ---------------------------------------------------------------------------
// Activity Helpers
// ---------------------------------------------------------------------------
export function createIssueActivity(type, issue, changes = {}) {
  return {
    type,
    entityType: 'issue',
    entityId: issue.id,
    metadata: {
      issueKey: issue.key,
      issueTitle: issue.title,
      issueType: issue.type,
      ...changes,
    },
  }
}

export function createPageActivity(type, page, changes = {}) {
  return {
    type,
    entityType: 'page',
    entityId: page.id,
    metadata: {
      pageTitle: page.title,
      ...changes,
    },
  }
}

export function createDecisionActivity(type, decision, changes = {}) {
  return {
    type,
    entityType: 'decision',
    entityId: decision.id,
    metadata: {
      decisionTitle: decision.title,
      ...changes,
    },
  }
}

export function createPhaseActivity(type, phase, changes = {}) {
  return {
    type,
    entityType: 'phase',
    entityId: phase.id,
    metadata: {
      phaseName: phase.name,
      ...changes,
    },
  }
}

// ---------------------------------------------------------------------------
// Activity Description Generator
// ---------------------------------------------------------------------------
export function getActivityDescription(activity) {
  const { type, metadata = {} } = activity

  switch (type) {
    case ACTIVITY_TYPES.ISSUE_CREATED:
      return `Created ${metadata.issueType} "${metadata.issueTitle}"`
    case ACTIVITY_TYPES.ISSUE_UPDATED:
      return `Updated ${metadata.issueType} "${metadata.issueTitle}"`
    case ACTIVITY_TYPES.ISSUE_DELETED:
      return `Deleted ${metadata.issueType} "${metadata.issueTitle}"`
    case ACTIVITY_TYPES.ISSUE_STATUS_CHANGED:
      return `Moved "${metadata.issueTitle}" from ${metadata.from} to ${metadata.to}`
    case ACTIVITY_TYPES.ISSUE_ASSIGNED:
      return `Assigned "${metadata.issueTitle}" to ${metadata.assignee || 'Unassigned'}`
    case ACTIVITY_TYPES.ISSUE_PRIORITY_CHANGED:
      return `Changed priority of "${metadata.issueTitle}" to ${metadata.priority}`

    case ACTIVITY_TYPES.PAGE_CREATED:
      return `Created page "${metadata.pageTitle}"`
    case ACTIVITY_TYPES.PAGE_UPDATED:
      return `Updated page "${metadata.pageTitle}"`
    case ACTIVITY_TYPES.PAGE_DELETED:
      return `Deleted page "${metadata.pageTitle}"`
    case ACTIVITY_TYPES.PAGE_PUBLISHED:
      return `Published page "${metadata.pageTitle}"`

    case ACTIVITY_TYPES.DECISION_CREATED:
      return `Created decision "${metadata.decisionTitle}"`
    case ACTIVITY_TYPES.DECISION_UPDATED:
      return `Updated decision "${metadata.decisionTitle}"`
    case ACTIVITY_TYPES.DECISION_STATUS_CHANGED:
      return `Changed decision "${metadata.decisionTitle}" status to ${metadata.status}`

    case ACTIVITY_TYPES.PHASE_CREATED:
      return `Created phase "${metadata.phaseName}"`
    case ACTIVITY_TYPES.PHASE_UPDATED:
      return `Updated phase "${metadata.phaseName}"`
    case ACTIVITY_TYPES.PHASE_DELETED:
      return `Deleted phase "${metadata.phaseName}"`

    case ACTIVITY_TYPES.MILESTONE_CREATED:
      return `Created milestone "${metadata.milestoneName}"`
    case ACTIVITY_TYPES.MILESTONE_COMPLETED:
      return `Completed milestone "${metadata.milestoneName}"`

    case ACTIVITY_TYPES.COMMENT_ADDED:
      return `Commented on ${metadata.entityType} "${metadata.entityTitle}"`

    default:
      return `Activity: ${type}`
  }
}
