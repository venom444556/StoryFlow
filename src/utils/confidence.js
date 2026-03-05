/** Map a confidence score (0-1) to a semantic level */
export function getConfidenceLevel(confidence) {
  if (confidence === undefined || confidence === null) return null
  if (confidence >= 0.8) return 'high'
  if (confidence >= 0.5) return 'medium'
  return 'low'
}

export const CONFIDENCE_STYLES = {
  high: {
    color: 'var(--color-confidence-high)',
    label: 'High',
  },
  medium: {
    color: 'var(--color-confidence-medium)',
    label: 'Medium',
  },
  low: {
    color: 'var(--color-confidence-low)',
    label: 'Low',
  },
}
