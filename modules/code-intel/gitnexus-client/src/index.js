/**
 * @storyflow/code-intel-gitnexus-client
 *
 * Public entrypoint. See CONTRACTS.md in the parent module for the
 * typed interface this module implements.
 *
 * --- Shared types (mirrored from CONTRACTS.md) ---
 *
 * @typedef {Object} SymbolRef
 * @property {string} name
 * @property {string} file
 * @property {number} [line]
 * @property {string} [kind]
 *
 * @typedef {Object} Caller
 * @property {SymbolRef} from
 * @property {SymbolRef} to
 * @property {string} [via]
 *
 * @typedef {Object} Cluster
 * @property {string} id
 * @property {string} name
 * @property {SymbolRef[]} symbols
 * @property {number} callsiteCount
 *
 * --- gitnexus-client types ---
 *
 * @typedef {Object} GitNexusLLMConfig
 * @property {string} baseUrl
 * @property {string} apiKey
 * @property {boolean} [allowOpenRouter]
 *
 * @typedef {Object} GitNexusConfig
 * @property {string} version
 * @property {string} repoPath
 * @property {GitNexusLLMConfig} llm
 * @property {boolean} [scarfAnalytics]
 *
 * @typedef {Object} ImpactRaw
 * @property {SymbolRef} target
 * @property {Caller[]} callers
 * @property {number} callsiteCount
 * @property {string[]} affectedClusters
 * @property {number} affectedServices
 *
 * @typedef {Object} SearchHit
 * @property {SymbolRef} symbol
 * @property {number} score
 * @property {string} snippet
 *
 * @typedef {Object} ChangeSet
 * @property {string[]} changedFiles
 * @property {SymbolRef[]} changedSymbols
 * @property {string[]} affectedClusterIds
 * @property {string} fromSha
 * @property {string} toSha
 *
 * @typedef {Object} GitNexusClient
 * @property {() => Promise<void>} start
 * @property {() => Promise<void>} stop
 * @property {() => Promise<"ok"|"down">} health
 * @property {(input: { symbol?: string, file?: string }) => Promise<ImpactRaw>} impact
 * @property {(query: string, opts?: { topK?: number }) => Promise<SearchHit[]>} search
 * @property {() => Promise<Cluster[]>} listClusters
 * @property {(cypher: string) => Promise<unknown>} queryGraph
 * @property {() => Promise<ChangeSet>} detectChanges
 */

export { createGitNexusClient } from './client.js'
export { validateConfig, isOpenRouterUrl } from './config.js'
export { buildLaunchArgs, buildLaunchEnv, redactEnvForLog } from './lifecycle.js'
