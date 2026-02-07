// ---------------------------------------------------------------------------
// Project-level statuses
// ---------------------------------------------------------------------------
export const PROJECT_STATUSES = {
  PLANNING: 'planning',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  ARCHIVED: 'archived',
};

// ---------------------------------------------------------------------------
// Issue types
// ---------------------------------------------------------------------------
export const ISSUE_TYPES = {
  EPIC: 'epic',
  STORY: 'story',
  TASK: 'task',
  BUG: 'bug',
  SUBTASK: 'subtask',
};

// ---------------------------------------------------------------------------
// Issue statuses
// ---------------------------------------------------------------------------
export const ISSUE_STATUSES = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  DONE: 'Done',
  BLOCKED: 'Blocked',
};

// ---------------------------------------------------------------------------
// Priorities
// ---------------------------------------------------------------------------
export const PRIORITIES = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
};

// ---------------------------------------------------------------------------
// Sprint statuses
// ---------------------------------------------------------------------------
export const SPRINT_STATUSES = {
  PLANNING: 'planning',
  ACTIVE: 'active',
  COMPLETED: 'completed',
};

// ---------------------------------------------------------------------------
// Wiki / page statuses
// ---------------------------------------------------------------------------
export const PAGE_STATUSES = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
};

// ---------------------------------------------------------------------------
// Decision statuses
// ---------------------------------------------------------------------------
export const DECISION_STATUSES = {
  PROPOSED: 'proposed',
  ACCEPTED: 'accepted',
  SUPERSEDED: 'superseded',
};

// ---------------------------------------------------------------------------
// Workflow node types
// ---------------------------------------------------------------------------
export const NODE_TYPES = [
  { type: 'phase', label: 'Phase', icon: 'Layers', color: '#6366f1' },
  { type: 'task', label: 'Task', icon: 'CheckSquare', color: '#3b82f6' },
  { type: 'milestone', label: 'Milestone', icon: 'Flag', color: '#f59e0b' },
  { type: 'decision', label: 'Decision', icon: 'GitBranch', color: '#8b5cf6' },
  { type: 'start', label: 'Start', icon: 'Play', color: '#22c55e' },
  { type: 'end', label: 'End', icon: 'Square', color: '#ef4444' },
  { type: 'api', label: 'API Call', icon: 'Globe', color: '#0ea5e9' },
  { type: 'database', label: 'Database', icon: 'Database', color: '#14b8a6' },
  { type: 'code', label: 'Code Logic', icon: 'Code', color: '#a855f7' },
];

// ---------------------------------------------------------------------------
// Default board columns
// ---------------------------------------------------------------------------
export const DEFAULT_STATUS_COLUMNS = ['To Do', 'In Progress', 'Done'];

// ---------------------------------------------------------------------------
// Point estimation scales
// ---------------------------------------------------------------------------
export const POINT_SCALES = {
  FIBONACCI: [1, 2, 3, 5, 8, 13, 21],
  LINEAR: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  TSHIRT: ['XS', 'S', 'M', 'L', 'XL'],
};

// ---------------------------------------------------------------------------
// Navigation tab keys
// ---------------------------------------------------------------------------
export const TAB_KEYS = {
  OVERVIEW: 'overview',
  ARCHITECTURE: 'architecture',
  WORKFLOW: 'workflow',
  BOARD: 'board',
  WIKI: 'wiki',
  TIMELINE: 'timeline',
  DECISIONS: 'decisions',
};
