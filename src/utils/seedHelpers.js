import { generateId } from './ids'

/**
 * Helper for creating seed project data with lazy ID generation.
 * Instead of pre-generating 80+ IDs upfront, this allows inline generation
 * while still maintaining references between entities.
 */

/**
 * Creates a reusable ID generator that caches IDs by name.
 * Use this to get consistent IDs when the same logical entity
 * is referenced in multiple places.
 *
 * @example
 * const ids = createIdGenerator()
 * const epic1 = ids.get('epic1') // generates new ID
 * const sameId = ids.get('epic1') // returns cached ID
 */
export function createIdGenerator() {
  const cache = new Map()

  return {
    /**
     * Get or create an ID for the given name.
     * Same name always returns same ID within this generator instance.
     */
    get(name) {
      if (!cache.has(name)) {
        cache.set(name, generateId())
      }
      return cache.get(name)
    },

    /**
     * Generate a fresh ID (not cached).
     * Use for entities that don't need to be referenced elsewhere.
     */
    fresh() {
      return generateId()
    },

    /**
     * Check if an ID exists for the given name.
     */
    has(name) {
      return cache.has(name)
    },

    /**
     * Get all cached IDs (for debugging).
     */
    all() {
      return Object.fromEntries(cache)
    },
  }
}

/**
 * Create a simple workflow with start, tasks, and end nodes.
 * Handles ID generation internally.
 */
export function createWorkflowPhase({
  title,
  x,
  y,
  status = 'idle',
  description = '',
  tasks = [],
}) {
  const ids = createIdGenerator()
  const startId = ids.fresh()
  const endId = ids.fresh()

  const nodes = [
    {
      id: startId,
      type: 'start',
      title: 'Start',
      x: 100,
      y: 200,
      status,
      config: {},
    },
    ...tasks.map((task, i) => ({
      id: ids.fresh(),
      type: 'task',
      title: task.title,
      x: 350,
      y: 80 + i * 120,
      status,
      config: { assignee: task.assignee || 'claude', notes: task.notes || '' },
    })),
    {
      id: endId,
      type: 'end',
      title: 'Complete',
      x: 600,
      y: 200,
      status,
      config: {},
    },
  ]

  // Connect start to all tasks, all tasks to end
  const taskNodes = nodes.slice(1, -1)
  const connections = [
    ...taskNodes.map((task) => ({
      id: ids.fresh(),
      from: startId,
      to: task.id,
    })),
    ...taskNodes.map((task) => ({
      id: ids.fresh(),
      from: task.id,
      to: endId,
    })),
  ]

  return {
    id: ids.fresh(),
    type: 'phase',
    title,
    x,
    y,
    status,
    config: { description },
    children: { nodes, connections },
  }
}

/**
 * Create a sprint with default values.
 */
export function createSprint({
  name,
  goal,
  startDate,
  endDate,
  status = 'planned',
}) {
  return {
    id: generateId(),
    name,
    goal,
    startDate,
    endDate,
    status,
  }
}

/**
 * Create an issue with default values.
 */
export function createIssue({
  key,
  type,
  title,
  description = '',
  status = 'backlog',
  priority = 'medium',
  storyPoints,
  epicId = null,
  sprintId = null,
  labels = [],
}) {
  const now = new Date().toISOString()
  return {
    id: generateId(),
    createdAt: now,
    updatedAt: now,
    type,
    key,
    title,
    description,
    status,
    priority,
    storyPoints,
    epicId,
    sprintId,
    assignee: null,
    labels,
    subtasks: [],
    comments: [],
    dependencies: [],
  }
}

/**
 * Create a wiki page with default values.
 */
export function createPage({
  title,
  content = '',
  parentId = null,
  status = 'published',
  icon = '📄',
}) {
  const now = new Date().toISOString()
  return {
    id: generateId(),
    title,
    content,
    parentId,
    status,
    icon,
    createdAt: now,
    updatedAt: now,
  }
}

/**
 * Create an architecture component with default values.
 */
export function createComponent({
  name,
  description = '',
  type = 'component',
  parentId = null,
  dependencies = [],
}) {
  return {
    id: generateId(),
    name,
    description,
    type,
    parentId,
    dependencies,
  }
}
