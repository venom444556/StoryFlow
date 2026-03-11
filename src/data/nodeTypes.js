// ---------------------------------------------------------------------------
// Workflow node type definitions
// ---------------------------------------------------------------------------
// Each entry describes a node type available in the workflow canvas.
// `icon` is a string matching the Lucide React export name so consumer
// components can do a dynamic lookup (e.g. import * as Icons from 'lucide-react').
//
// Colors are tuned for the Neptune charcoal palette — muted but visible
// against #0f1117 / #161922 backgrounds with clear differentiation.
// ---------------------------------------------------------------------------

const NODE_TYPES = [
  {
    type: 'start',
    label: 'Start',
    icon: 'Play',
    color: '#34d399',
    description: 'Entry point for the workflow. Every workflow needs one.',
  },
  {
    type: 'end',
    label: 'End',
    icon: 'Square',
    color: '#f87171',
    description: 'Marks the successful completion of a workflow path.',
  },
  {
    type: 'phase',
    label: 'Phase',
    icon: 'Layers',
    color: '#818cf8',
    description: 'A high-level phase grouping multiple tasks together.',
  },
  {
    type: 'task',
    label: 'Task',
    icon: 'CheckSquare',
    color: '#60a5fa',
    description: 'An individual unit of work to be completed.',
  },
  {
    type: 'milestone',
    label: 'Milestone',
    icon: 'Flag',
    color: '#fbbf24',
    description: 'A key checkpoint or deliverable in the workflow.',
  },
  {
    type: 'decision',
    label: 'Decision',
    icon: 'GitBranch',
    color: '#fb923c',
    description: 'Conditional branching point with if/else logic.',
  },
  {
    type: 'api',
    label: 'API Call',
    icon: 'Globe',
    color: '#22d3ee',
    description: 'Execute an HTTP request to an external service.',
  },
  {
    type: 'database',
    label: 'Database',
    icon: 'Database',
    color: '#2dd4bf',
    description: 'Read or write data to a database.',
  },
  {
    type: 'code',
    label: 'Code Logic',
    icon: 'Code',
    color: '#c084fc',
    description: 'Run custom data transformation or business logic.',
  },
]

export default NODE_TYPES

/**
 * Look up a single node type definition by its `type` key.
 * @param {string} type
 * @returns {object|undefined}
 */
export function getNodeType(type) {
  return NODE_TYPES.find((nt) => nt.type === type)
}
