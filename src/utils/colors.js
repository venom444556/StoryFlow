// ---------------------------------------------------------------------------
// Priority colors
// ---------------------------------------------------------------------------
const PRIORITY_COLORS = {
  critical: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300', dot: 'bg-red-500' },
  high: {
    bg: 'bg-orange-100',
    text: 'text-orange-700',
    border: 'border-orange-300',
    dot: 'bg-orange-500',
  },
  medium: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-700',
    border: 'border-yellow-300',
    dot: 'bg-yellow-500',
  },
  low: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300', dot: 'bg-blue-500' },
}

const DEFAULT_PRIORITY = {
  bg: 'bg-gray-100',
  text: 'text-gray-700',
  border: 'border-gray-300',
  dot: 'bg-gray-500',
}

/**
 * Return Tailwind color classes for a priority level.
 * @param {string} priority
 * @returns {{ bg: string, text: string, border: string, dot: string }}
 */
export const getPriorityColor = (priority) => PRIORITY_COLORS[priority] ?? DEFAULT_PRIORITY
