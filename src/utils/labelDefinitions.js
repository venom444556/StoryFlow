// ---------------------------------------------------------------------------
// Label Definitions — single source of truth for project labels
// ---------------------------------------------------------------------------
// Curated registry of ~20 canonical labels organized into color-coded
// categories. Replaces the previous ungoverned free-form system.
// ---------------------------------------------------------------------------

export const LABEL_CATEGORIES = {
  area: { name: 'Feature Area', color: '#3b82f6' },
  type: { name: 'Work Type', color: '#8b5cf6' },
  quality: { name: 'Quality', color: '#22c55e' },
  technical: { name: 'Technical', color: '#f59e0b' },
  process: { name: 'Process', color: '#ec4899' },
}

export const LABEL_REGISTRY = {
  // Feature Area (blue)
  board: { category: 'area', label: 'board' },
  wiki: { category: 'area', label: 'wiki' },
  workflow: { category: 'area', label: 'workflow' },
  timeline: { category: 'area', label: 'timeline' },
  architecture: { category: 'area', label: 'architecture' },
  ui: { category: 'area', label: 'ui' },
  navigation: { category: 'area', label: 'navigation' },

  // Work Type (purple)
  feature: { category: 'type', label: 'feature' },
  bug: { category: 'type', label: 'bug' },
  refactor: { category: 'type', label: 'refactor' },
  docs: { category: 'type', label: 'docs' },
  polish: { category: 'type', label: 'polish' },

  // Quality (green)
  testing: { category: 'quality', label: 'testing' },
  accessibility: { category: 'quality', label: 'accessibility' },
  performance: { category: 'quality', label: 'performance' },
  security: { category: 'quality', label: 'security' },

  // Technical (amber)
  infrastructure: { category: 'technical', label: 'infrastructure' },
  data: { category: 'technical', label: 'data' },
  theming: { category: 'technical', label: 'theming' },
  state: { category: 'technical', label: 'state' },

  // Process (pink)
  setup: { category: 'process', label: 'setup' },
  release: { category: 'process', label: 'release' },
  tooling: { category: 'process', label: 'tooling' },
}

// Map old/redundant labels to canonical names
const LABEL_MERGE_MAP = {
  // Quality merges
  a11y: 'accessibility',

  // Work type merges
  refactoring: 'refactor',
  cleanup: 'refactor',
  maintenance: 'refactor',

  // Area merges
  canvas: 'workflow',
  engine: 'workflow',
  milestones: 'timeline',
  routing: 'navigation',
  'react-router': 'navigation',
  settings: 'ui',

  // UI catch-all merges
  ux: 'ui',
  responsive: 'ui',
  animation: 'ui',
  chart: 'ui',
  stats: 'ui',
  sidebar: 'ui',
  loading: 'ui',
  suspense: 'ui',
  icons: 'ui',
  visualization: 'ui',

  // Technical merges
  build: 'infrastructure',
  persistence: 'infrastructure',
  'migration-prep': 'infrastructure',
  utilities: 'infrastructure',
  validation: 'data',
  'data-integrity': 'data',
  seed: 'data',
  tokens: 'theming',
  css: 'theming',
  zustand: 'state',
  hooks: 'state',
  context: 'state',
  'error-handling': 'infrastructure',

  // Process merges
  'code-quality': 'tooling',
  audit: 'tooling',
  quality: 'tooling',

  // Type merges
  activity: 'feature',
  '2.0': 'feature',
}

/**
 * Canonicalize a label — map old/redundant names to the canonical registry name.
 * If the label is already canonical or unknown, it passes through unchanged.
 */
export function canonicalizeLabel(label) {
  if (!label) return label
  const lower = label.toLowerCase().trim()
  return LABEL_MERGE_MAP[lower] || lower
}

/**
 * Canonicalize an array of labels, deduplicating after merge.
 */
export function canonicalizeLabels(labels) {
  if (!labels || !Array.isArray(labels)) return []
  const seen = new Set()
  const result = []
  for (const label of labels) {
    const canonical = canonicalizeLabel(label)
    if (canonical && !seen.has(canonical)) {
      seen.add(canonical)
      result.push(canonical)
    }
  }
  return result
}

/**
 * Get a label definition from the registry.
 * Returns { category, label, color } or null for unknown labels.
 */
export function getLabel(name) {
  const entry = LABEL_REGISTRY[name]
  if (!entry) return null
  return {
    ...entry,
    color: LABEL_CATEGORIES[entry.category]?.color || '#6b7280',
  }
}

/**
 * Get all registry labels grouped by category.
 * Returns [{ categoryKey, categoryName, color, labels: string[] }]
 */
export function getLabelsByCategory() {
  const groups = {}

  for (const [key, cat] of Object.entries(LABEL_CATEGORIES)) {
    groups[key] = { categoryKey: key, categoryName: cat.name, color: cat.color, labels: [] }
  }

  for (const [name, entry] of Object.entries(LABEL_REGISTRY)) {
    if (groups[entry.category]) {
      groups[entry.category].labels.push(name)
    }
  }

  return Object.values(groups)
}

/**
 * Get flat sorted array of all registry label names — for use as suggestions.
 */
export function getSuggestions() {
  return Object.keys(LABEL_REGISTRY).sort()
}
