/**
 * Code Intelligence feature module — public API.
 *
 * Everything that integrates with this feature imports from here. Nothing
 * should reach deeper into the module's internals. See `CONTRACTS.md` next to
 * this file for the full interface specification.
 *
 * @typedef {Object} CodeIntelligenceModule
 * @property {import('./config.js').CodeIntelligenceConfig} config
 * @property {boolean} enabled
 * @property {Promise<void>} ready
 * @property {(symbols: string[]) => Promise<any[]>} analyzeSymbols
 * @property {(ticket: { title: string, description: string, key?: string }) => Promise<any[]>} resolveTicket
 * @property {(issue: any) => Promise<{ outcome: 'allow'|'block', reason: string, reports: any[] }>} runPreflight
 * @property {() => Promise<{ clusters: any[], stats: Object }>} fetchClusterSummary
 * @property {() => Promise<{ nodes: any[], edges: any[], clusters: any[] }>} fetchGraphData
 * @property {() => Promise<void>} shutdown
 */

export { getCodeIntelligenceModule } from './module.js'
export { useCodeIntelligence } from './hooks/useCodeIntelligence.js'
export { isCodeIntelligenceEnabled } from './config.js'
