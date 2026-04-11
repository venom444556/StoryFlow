# Code Intelligence Feature Module — Integration Contracts

This file is the shared API between the seven parallel build agents. Each agent builds one piece of the feature module. They all import from `src/features/code-intelligence/index.js` using the interface defined below. Do not reach into internals.

## Public API (exported from `src/features/code-intelligence/index.js`)

```js
/**
 * Returns the feature module singleton. Lazy: first call bootstraps it.
 * If the feature is disabled via config, returns a no-op stub with the same shape but every method resolves to empty results.
 * @returns {CodeIntelligenceModule}
 */
export function getCodeIntelligenceModule()

/**
 * React hook. Subscribes to feature module state (enabled, ready, error).
 * @returns {{
 *   enabled: boolean,
 *   ready: boolean,
 *   error: Error|null,
 *   module: CodeIntelligenceModule|null
 * }}
 */
export function useCodeIntelligence()

/**
 * Synchronous check for whether the feature is enabled. Reads cached config.
 * @returns {boolean}
 */
export function isCodeIntelligenceEnabled()
```

## CodeIntelligenceModule shape

```js
/**
 * @typedef {Object} CodeIntelligenceModule
 * @property {Object} config              - Parsed module config (schema below)
 * @property {Promise<void>} ready         - Resolves when all sub-modules have booted
 * @property {(symbols: string[]) => Promise<ImpactReport[]>} analyzeSymbols
 * @property {(ticket: { title: string, description: string, key?: string }) => Promise<SymbolCandidate[]>} resolveTicket
 * @property {(issue: Issue) => Promise<PreflightGateDecision>} runPreflight
 * @property {() => Promise<ClusterSummary>} fetchClusterSummary
 * @property {() => Promise<{ nodes: GraphNode[], edges: GraphEdge[], clusters: Cluster[] }>} fetchGraphData
 * @property {() => Promise<void>} shutdown
 */
```

The types `ImpactReport`, `SymbolCandidate`, `PreflightGateDecision`, `GraphNode`, `GraphEdge`, `Cluster` all come from `modules/code-intel/CONTRACTS.md`. Do not redefine them here.

## Config schema

```js
/**
 * @typedef {Object} CodeIntelligenceConfig
 * @property {boolean} enabled                                         - Default false
 * @property {string} gitnexusVersion                                  - Pinned semver, required if enabled
 * @property {string} repoPath                                         - Absolute path, defaults to process.cwd()
 * @property {Object} llm                                              - REQUIRED if enabled
 * @property {string} llm.baseUrl
 * @property {string} llm.apiKey
 * @property {boolean} [llm.allowOpenRouter=false]
 * @property {Object} features                                         - Feature flags per surface
 * @property {boolean} features.impactBadges
 * @property {boolean} features.preflightHook
 * @property {boolean} features.codebaseMap
 * @property {boolean} features.codeTab
 * @property {boolean} features.decisionAttachment
 * @property {boolean} features.timelineEvents
 * @property {Object} thresholds
 * @property {"LOW"|"MEDIUM"|"HIGH"|"CRITICAL"} thresholds.preflightBlockAt
 */
```

Loaded from `.storyflow/modules/code-intelligence.json` at server startup via `loadConfig()` in `config.js`.

## Sub-module composition

The feature module singleton composes these four standalone packages (built earlier by other agents):

- `@storyflow/code-intel-gitnexus-client` — constructed via `createGitNexusClient(cfg)` imported from `../../../modules/code-intel/gitnexus-client/src/index.js`
- `@storyflow/code-intel-impact-engine` — pure functions `analyzeImpact`, `preflightGate` imported from `../../../modules/code-intel/impact-engine/src/index.js`
- `@storyflow/code-intel-symbol-resolver` — factory `createSymbolResolver(client, config)` imported from `../../../modules/code-intel/symbol-resolver/src/index.js`
- `@storyflow/code-intel-graph-renderer` — default-export React component imported from `../../../modules/code-intel/graph-renderer/src/index.js`

During development these are imported via relative path. If we later publish them to the npm registry, the imports become `@storyflow/code-intel-*`.

## Disabled-feature behavior

When `config.enabled === false`, every method on the singleton must still return cleanly:

- `analyzeSymbols([])` → `[]`
- `resolveTicket(t)` → `[]`
- `runPreflight(issue)` → `{ outcome: 'allow', reason: 'code-intelligence disabled', reports: [] }`
- `fetchClusterSummary()` → `{ clusters: [], stats: {} }`
- `fetchGraphData()` → `{ nodes: [], edges: [], clusters: [] }`
- `ready` → `Promise.resolve()`

This lets UI components call the module unconditionally without null-checking everywhere. Every surface should render gracefully with empty data when the feature is off.

## Rules of engagement for build agents

1. **Do not redefine types.** If you need `ImpactReport`, import its JSDoc shape from `modules/code-intel/CONTRACTS.md`. Do not inline a copy.
2. **Do not reach into another agent's files.** You touch only the files listed in your brief.
3. **Edits to existing StoryFlow files must be surgical.** Exactly the lines your brief specifies. No "while I'm here" refactoring.
4. **Every new component has tests.** Vitest + React Testing Library. Tests go under `src/features/code-intelligence/__tests__/` or colocated as `*.test.jsx`.
5. **No direct imports of sub-modules from existing StoryFlow code.** Only the feature module singleton knows about `modules/code-intel/`. Everything else goes through `src/features/code-intelligence/index.js`.
6. **The feature must be off-by-default.** New UI surfaces render nothing if `useCodeIntelligence().enabled === false`.
7. **Do not modify `modules/code-intel/` at all.** Those sub-modules are frozen for the duration of this integration pass.
