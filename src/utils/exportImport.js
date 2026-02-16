// ---------------------------------------------------------------------------
// Export / Import utilities for StoryFlow projects
// Supports schema versioning and CLI bridge via the projects/ directory
// ---------------------------------------------------------------------------

import { stripDangerousKeys } from './sanitize'

const CURRENT_SCHEMA_VERSION = 1

// Required top-level fields on a project object
const REQUIRED_FIELDS = ['name']

// Default values used to fill missing fields on import
const FIELD_DEFAULTS = {
  description: '',
  status: 'planning',
  techStack: [],
  overview: { goals: '', constraints: '', targetAudience: '' },
  architecture: { components: [] },
  workflow: { nodes: [], connections: [] },
  board: {
    sprints: [],
    issues: [],
    issueTypes: ['epic', 'story', 'task', 'bug', 'subtask'],
    customFields: [],
    statusColumns: ['To Do', 'In Progress', 'Done'],
    nextIssueNumber: 1,
  },
  pages: [],
  timeline: { phases: [] },
  decisions: [],
  settings: {
    defaultIssueType: 'task',
    pointScale: 'fibonacci',
    sprintLength: 14,
  },
}

/**
 * Serialise a project into a versioned JSON string suitable for file export.
 */
export function exportProjectJSON(project) {
  return JSON.stringify(
    {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      project,
    },
    null,
    2
  )
}

/**
 * Export every project in the array into a single JSON document.
 */
export function exportAllProjectsJSON(projects) {
  return JSON.stringify(
    {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      projects,
    },
    null,
    2
  )
}

/**
 * Parse and validate a JSON string that was previously exported.
 *
 * @param {string} jsonString  Raw JSON text
 * @returns {{ success: boolean, project?: object, projects?: object[], error?: string }}
 */
export function parseProjectJSON(jsonString) {
  try {
    const data = stripDangerousKeys(JSON.parse(jsonString))

    // Validate schema version
    if (data.schemaVersion && data.schemaVersion > CURRENT_SCHEMA_VERSION) {
      return {
        success: false,
        error: `Unsupported schema version ${data.schemaVersion}. Please update StoryFlow.`,
      }
    }

    // Multi-project export
    if (Array.isArray(data.projects)) {
      const filled = data.projects.map(fillDefaults)
      return { success: true, projects: filled }
    }

    // Single project export
    if (data.project) {
      const project = fillDefaults(data.project)
      const missing = REQUIRED_FIELDS.filter((f) => !project[f])
      if (missing.length > 0) {
        return {
          success: false,
          error: `Missing required fields: ${missing.join(', ')}`,
        }
      }
      return { success: true, project }
    }

    // Bare project object (no wrapper)
    if (data.name) {
      return { success: true, project: fillDefaults(data) }
    }

    return { success: false, error: 'Unrecognised file format.' }
  } catch (err) {
    return { success: false, error: `Invalid JSON: ${err.message}` }
  }
}

/**
 * Trigger a browser download of a JSON string as a .json file.
 */
export function downloadJSON(content, filename) {
  const blob = new Blob([content], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Read a File object as text. Returns a Promise<string>.
 */
export function readFileAsJSON(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fillDefaults(project) {
  const filled = { ...project }

  for (const [key, defaultValue] of Object.entries(FIELD_DEFAULTS)) {
    if (filled[key] === undefined || filled[key] === null) {
      filled[key] =
        typeof defaultValue === 'object' && !Array.isArray(defaultValue)
          ? { ...defaultValue }
          : Array.isArray(defaultValue)
            ? [...defaultValue]
            : defaultValue
    }
  }

  // Ensure board sub-fields exist
  if (filled.board && typeof filled.board === 'object') {
    const boardDefaults = FIELD_DEFAULTS.board
    for (const [key, defaultValue] of Object.entries(boardDefaults)) {
      if (filled.board[key] === undefined || filled.board[key] === null) {
        filled.board[key] = Array.isArray(defaultValue) ? [...defaultValue] : defaultValue
      }
    }
  }

  return filled
}
