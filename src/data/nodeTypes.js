// ---------------------------------------------------------------------------
// Workflow node type definitions
// ---------------------------------------------------------------------------
// Each entry describes a node type available in the workflow canvas.
// `icon` is a string matching the Lucide React export name so consumer
// components can do a dynamic lookup (e.g. import * as Icons from 'lucide-react').
// ---------------------------------------------------------------------------

const NODE_TYPES = [
  {
    type: 'start',
    label: 'Start',
    icon: 'Play',
    color: '#22c55e',
    description: 'Entry point for the workflow. Every workflow needs one.',
  },
  {
    type: 'end',
    label: 'End',
    icon: 'Square',
    color: '#ef4444',
    description: 'Marks the successful completion of a workflow path.',
  },
  {
    type: 'phase',
    label: 'Phase',
    icon: 'Layers',
    color: '#6366f1',
    description: 'A high-level phase grouping multiple tasks together.',
  },
  {
    type: 'task',
    label: 'Task',
    icon: 'CheckSquare',
    color: '#3b82f6',
    description: 'An individual unit of work to be completed.',
  },
  {
    type: 'milestone',
    label: 'Milestone',
    icon: 'Flag',
    color: '#f59e0b',
    description: 'A key checkpoint or deliverable in the workflow.',
  },
  {
    type: 'decision',
    label: 'Decision',
    icon: 'GitBranch',
    color: '#8b5cf6',
    description: 'Conditional branching point with if/else logic.',
  },
  {
    type: 'api',
    label: 'API Call',
    icon: 'Globe',
    color: '#0ea5e9',
    description: 'Execute an HTTP request to an external service.',
  },
  {
    type: 'database',
    label: 'Database',
    icon: 'Database',
    color: '#14b8a6',
    description: 'Read or write data to a database.',
  },
  {
    type: 'code',
    label: 'Code Logic',
    icon: 'Code',
    color: '#a855f7',
    description: 'Run custom data transformation or business logic.',
  },
];

export default NODE_TYPES;

/**
 * Look up a single node type definition by its `type` key.
 * @param {string} type
 * @returns {object|undefined}
 */
export function getNodeType(type) {
  return NODE_TYPES.find((nt) => nt.type === type);
}
