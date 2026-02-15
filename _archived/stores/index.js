// Centralized store exports
export {
  useProjectsStore,
  useProjectStore,
  selectProjects,
  selectProject,
  selectProjectCount,
  selectIssues,
  selectIssueById,
  selectPages,
  selectDecisions,
} from './projectsStore'

export {
  useUIStore,
  selectSidebarCollapsed,
  selectCommandPaletteOpen,
  selectActiveModal,
  selectActiveDrawer,
  selectToasts,
  selectConfirmDialog,
} from './uiStore'

export {
  useActivityStore,
  ACTIVITY_TYPES,
  selectProjectActivities,
  selectRecentActivities,
  createIssueActivity,
  createPageActivity,
  createDecisionActivity,
  createPhaseActivity,
  getActivityDescription,
} from './activityStore'
