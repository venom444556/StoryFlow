/**
 * Timeline event factories for Code Intelligence.
 *
 * Pure module — no React, no DOM, no I/O. Defines the schemas and factory
 * functions for the three new timeline event types emitted by the feature
 * module, plus a `renderMeta` helper that returns icon/color/label hints for
 * UI display (consumed by TimelineView).
 *
 * @typedef {"code-intel-index-refreshed"} IndexRefreshType
 * @typedef {"code-intel-blast-radius-warning"} BlastRadiusWarningType
 * @typedef {"code-intel-change-detected"} ChangeDetectedType
 * @typedef {IndexRefreshType | BlastRadiusWarningType | ChangeDetectedType} CodeIntelEventType
 *
 * @typedef {Object} IndexRefreshedEvent
 * @property {IndexRefreshType} type
 * @property {string} at
 * @property {number} symbolCount
 * @property {number} clusterCount
 * @property {string} headSha
 * @property {string} headMessage
 *
 * @typedef {Object} BlastRadiusWarningEvent
 * @property {BlastRadiusWarningType} type
 * @property {string} at
 * @property {string} issueKey
 * @property {number} callsites
 * @property {string[]} affectedClusters
 * @property {string} reportSnapshot
 *
 * @typedef {Object} ChangeDetectedEvent
 * @property {ChangeDetectedType} type
 * @property {string} at
 * @property {number} changedFileCount
 * @property {string[]} affectedClusters
 * @property {string} recommendation
 */

export const INDEX_REFRESHED = 'code-intel-index-refreshed'
export const BLAST_RADIUS_WARNING = 'code-intel-blast-radius-warning'
export const CHANGE_DETECTED = 'code-intel-change-detected'

const CODE_INTEL_TYPES = new Set([INDEX_REFRESHED, BLAST_RADIUS_WARNING, CHANGE_DETECTED])

function nowIso() {
  return new Date().toISOString()
}

/**
 * @param {{ symbolCount: number, clusterCount: number, headSha: string, headMessage: string, at?: string }} params
 * @returns {IndexRefreshedEvent}
 */
export function createIndexRefreshedEvent(params) {
  const { symbolCount, clusterCount, headSha, headMessage, at } = params || {}
  return {
    type: INDEX_REFRESHED,
    at: at || nowIso(),
    symbolCount: Number(symbolCount) || 0,
    clusterCount: Number(clusterCount) || 0,
    headSha: String(headSha || ''),
    headMessage: String(headMessage || ''),
  }
}

/**
 * @param {{ issueKey: string, callsites: number, affectedClusters: string[], reportSnapshot: unknown, at?: string }} params
 * @returns {BlastRadiusWarningEvent}
 */
export function createBlastRadiusWarningEvent(params) {
  const { issueKey, callsites, affectedClusters, reportSnapshot, at } = params || {}
  const snapshot =
    typeof reportSnapshot === 'string' ? reportSnapshot : JSON.stringify(reportSnapshot ?? null)
  return {
    type: BLAST_RADIUS_WARNING,
    at: at || nowIso(),
    issueKey: String(issueKey || ''),
    callsites: Number(callsites) || 0,
    affectedClusters: Array.isArray(affectedClusters) ? [...affectedClusters] : [],
    reportSnapshot: snapshot,
  }
}

/**
 * @param {{ changedFileCount: number, affectedClusters: string[], recommendation: string, at?: string }} params
 * @returns {ChangeDetectedEvent}
 */
export function createChangeDetectedEvent(params) {
  const { changedFileCount, affectedClusters, recommendation, at } = params || {}
  return {
    type: CHANGE_DETECTED,
    at: at || nowIso(),
    changedFileCount: Number(changedFileCount) || 0,
    affectedClusters: Array.isArray(affectedClusters) ? [...affectedClusters] : [],
    recommendation: String(recommendation || ''),
  }
}

/**
 * @param {unknown} event
 * @returns {boolean}
 */
export function isCodeIntelEvent(event) {
  if (!event || typeof event !== 'object') return false
  const t = /** @type {{type?: unknown}} */ (event).type
  return typeof t === 'string' && CODE_INTEL_TYPES.has(t)
}

/**
 * Returns display metadata (icon name, color token, label) for a Code
 * Intelligence timeline event. Icon names are lucide-react identifiers so
 * consumers can map them to imported components.
 *
 * @param {{type: string}} event
 * @returns {{icon: string, color: string, label: string}}
 */
export function renderMeta(event) {
  switch (event?.type) {
    case INDEX_REFRESHED:
      return {
        icon: 'RefreshCw',
        color: 'var(--color-accent)',
        label: 'Code index refreshed',
      }
    case BLAST_RADIUS_WARNING:
      return {
        icon: 'AlertTriangle',
        color: 'var(--color-danger)',
        label: 'Blast radius warning',
      }
    case CHANGE_DETECTED:
      return {
        icon: 'GitCommit',
        color: 'var(--color-warning)',
        label: 'Code change detected',
      }
    default:
      return {
        icon: 'Circle',
        color: 'var(--color-fg-muted)',
        label: 'Code intelligence event',
      }
  }
}
