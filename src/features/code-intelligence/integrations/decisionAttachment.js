/**
 * Decision log attachment for Code Intelligence symbol impact reports.
 *
 * Pure module — no React, no DOM, no I/O. Defines the schema and construction
 * logic for attaching an impact report to a decision entry.
 *
 * Types `SymbolRef` and `ImpactReport` are documented in
 * `modules/code-intel/CONTRACTS.md`. We do not redefine them here.
 *
 * @typedef {Object} ImpactAttachment
 * @property {"code-impact-report"} type
 * @property {string} capturedAt            ISO 8601 timestamp
 * @property {import('../../../../modules/code-intel/CONTRACTS.md').SymbolRef} targetSymbol
 * @property {import('../../../../modules/code-intel/CONTRACTS.md').ImpactReport} report
 * @property {string} [note]                Optional author note
 */

export const IMPACT_ATTACHMENT_TYPE = 'code-impact-report'

/**
 * Creates a new ImpactAttachment from an analyzed symbol.
 * The returned object is frozen — callers should store it verbatim.
 *
 * @param {import('../../../../modules/code-intel/CONTRACTS.md').SymbolRef} symbol
 * @param {import('../../../../modules/code-intel/CONTRACTS.md').ImpactReport} report
 * @param {string} [note]
 * @returns {ImpactAttachment}
 */
export function createImpactAttachment(symbol, report, note) {
  if (!symbol || typeof symbol !== 'object') {
    throw new TypeError('createImpactAttachment: symbol is required')
  }
  if (!report || typeof report !== 'object') {
    throw new TypeError('createImpactAttachment: report is required')
  }

  /** @type {ImpactAttachment} */
  const attachment = {
    type: IMPACT_ATTACHMENT_TYPE,
    capturedAt: new Date().toISOString(),
    targetSymbol: symbol,
    report,
  }

  if (typeof note === 'string' && note.trim().length > 0) {
    attachment.note = note.trim()
  }

  return Object.freeze(attachment)
}

/**
 * Type guard for ImpactAttachment.
 * @param {unknown} obj
 * @returns {boolean}
 */
export function isImpactAttachment(obj) {
  if (!obj || typeof obj !== 'object') return false
  const a = /** @type {Record<string, unknown>} */ (obj)
  if (a.type !== IMPACT_ATTACHMENT_TYPE) return false
  if (typeof a.capturedAt !== 'string') return false
  if (!a.targetSymbol || typeof a.targetSymbol !== 'object') return false
  if (!a.report || typeof a.report !== 'object') return false
  return true
}

/**
 * Renders a compact summary string for display in a decision card row.
 * Shape: "<symbolName> — <BLAST> (<callsites> callsites, <clusters> clusters)"
 *
 * @param {ImpactAttachment} att
 * @returns {string}
 */
export function summarizeAttachment(att) {
  if (!isImpactAttachment(att)) return 'Invalid impact attachment'
  const name = att.targetSymbol?.name || 'unknown symbol'
  const blast = att.report?.blastRadius || 'UNKNOWN'
  const callsites = Number(att.report?.callsiteCount ?? 0)
  const clusters = Array.isArray(att.report?.affectedClusterIds)
    ? att.report.affectedClusterIds.length
    : 0
  return `${name} — ${blast} (${callsites} callsite${callsites === 1 ? '' : 's'}, ${clusters} cluster${clusters === 1 ? '' : 's'})`
}
