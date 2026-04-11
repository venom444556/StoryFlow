# Code Intelligence — Module Contracts

All sub-modules must conform to the interfaces below. These are JSDoc-typed JavaScript interfaces (ESM) consumable from plain JS. TypeScript implementations are fine as long as compiled output matches these shapes.

## Shared types

```js
/**
 * @typedef {Object} SymbolRef
 * @property {string} name         - Fully qualified symbol name (e.g. "auth.middleware.verify").
 * @property {string} file         - File path relative to repo root.
 * @property {number} [line]       - Line number if known.
 * @property {string} [kind]       - "function" | "class" | "method" | "module" | "const".
 */

/**
 * @typedef {Object} Caller
 * @property {SymbolRef} from      - Calling symbol.
 * @property {SymbolRef} to        - Called symbol.
 * @property {string} [via]        - Intermediate link if transitive.
 */

/**
 * @typedef {Object} Cluster
 * @property {string} id           - Stable cluster identity (see graph-renderer spec for stability rules).
 * @property {string} name         - Human-facing cluster name (graph community label or human override).
 * @property {SymbolRef[]} symbols - Members of this cluster.
 * @property {number} callsiteCount
 */

/**
 * @typedef {"LOW"|"MEDIUM"|"HIGH"|"CRITICAL"} BlastRadius
 */
```

## gitnexus-client

The only module that knows how to spawn and talk to the GitNexus MCP server. Everything else consumes this interface; nothing else touches GitNexus directly.

```js
/**
 * @typedef {Object} GitNexusConfig
 * @property {string} version                  - Must be a pinned semver (e.g. "1.5.3"). Fail if "latest" or omitted.
 * @property {string} repoPath                  - Absolute path to the repo to index.
 * @property {Object} llm                       - REQUIRED. No default.
 * @property {string} llm.baseUrl                - Explicit LLM base URL. Cannot be OpenRouter unless explicitly opted in.
 * @property {string} llm.apiKey                 - Explicit API key. May come from env indirection.
 * @property {boolean} [llm.allowOpenRouter=false] - Must be set to true to permit OpenRouter. Defaults closed.
 * @property {boolean} [scarfAnalytics=false]     - Always false in StoryFlow use.
 */

/**
 * @typedef {Object} ImpactRaw
 * @property {SymbolRef} target
 * @property {Caller[]} callers
 * @property {number} callsiteCount
 * @property {string[]} affectedClusters
 * @property {number} affectedServices
 */

/**
 * @typedef {Object} SearchHit
 * @property {SymbolRef} symbol
 * @property {number} score         - 0-1.
 * @property {string} snippet       - Matched code excerpt.
 */

/**
 * @typedef {Object} ChangeSet
 * @property {string[]} changedFiles
 * @property {SymbolRef[]} changedSymbols
 * @property {string[]} affectedClusterIds
 * @property {string} fromSha
 * @property {string} toSha
 */

/**
 * @interface GitNexusClient
 */
/**
 * @function
 * @name GitNexusClient#start
 * @returns {Promise<void>}     Spawns the pinned MCP server process with sanitized env. Idempotent.
 */
/**
 * @function
 * @name GitNexusClient#stop
 * @returns {Promise<void>}     Graceful shutdown.
 */
/**
 * @function
 * @name GitNexusClient#health
 * @returns {Promise<"ok"|"down">}
 */
/**
 * @function
 * @name GitNexusClient#impact
 * @param {{ symbol?: string, file?: string }} input
 * @returns {Promise<ImpactRaw>}
 */
/**
 * @function
 * @name GitNexusClient#search
 * @param {string} query
 * @param {{ topK?: number }} [opts]
 * @returns {Promise<SearchHit[]>}
 */
/**
 * @function
 * @name GitNexusClient#listClusters
 * @returns {Promise<Cluster[]>}
 */
/**
 * @function
 * @name GitNexusClient#queryGraph
 * @param {string} cypher
 * @returns {Promise<unknown>}
 */
/**
 * @function
 * @name GitNexusClient#detectChanges
 * @returns {Promise<ChangeSet>}
 */

/**
 * @function createGitNexusClient
 * @param {GitNexusConfig} cfg
 * @returns {GitNexusClient}
 * @throws if cfg.version is "latest" or missing; if cfg.llm is missing; if cfg.llm.baseUrl points to OpenRouter and allowOpenRouter is not true.
 */
```

### Contract tests gitnexus-client must pass

1. Rejects `version: "latest"` with a clear error at construction time.
2. Rejects config with no `llm` block.
3. Rejects `llm.baseUrl` matching OpenRouter host unless `allowOpenRouter: true`.
4. `start()` launches GitNexus with `SCARF_ANALYTICS=false` in env (verify via process env inspection or launch-arg capture).
5. `start()` launches GitNexus with the pinned version, not `@latest` (verify via args).
6. `impact({ symbol })` returns an `ImpactRaw` with correctly typed fields against a fixture response.
7. `health()` returns "down" when the process is not running, "ok" when it is.
8. `stop()` is idempotent and never throws if called twice.

## impact-engine

Pure-logic module. No I/O. No network. Composes on top of `gitnexus-client`'s output types.

```js
/**
 * @typedef {Object} ImpactReport
 * @property {SymbolRef} target
 * @property {BlastRadius} blastRadius
 * @property {number} callsiteCount
 * @property {string[]} affectedClusterIds
 * @property {number} affectedServiceCount
 * @property {Caller[]} topCallers   - Ranked, capped.
 * @property {string} rationale      - One-sentence human-readable explanation of the blast radius classification.
 */

/**
 * @typedef {Object} BlastRadiusThresholds
 * @property {number} low_maxCallsites          - Default 5.
 * @property {number} medium_maxCallsites       - Default 20.
 * @property {number} medium_maxServices        - Default 1.
 * @property {number} high_minCallsites         - Default 21.
 * @property {number} high_minServices          - Default 2.
 * @property {number} critical_minCallsites     - Default 50.
 */

/**
 * @typedef {Object} PreflightGateDecision
 * @property {"allow"|"block"} outcome
 * @property {string} reason
 * @property {ImpactReport[]} reports
 */

/**
 * @function analyzeImpact
 * @param {ImpactRaw} raw
 * @param {BlastRadiusThresholds} [thresholds]
 * @returns {ImpactReport}
 */

/**
 * @function preflightGate
 * @param {ImpactReport[]} reports   - One per linked symbol on the ticket.
 * @param {"MEDIUM"|"HIGH"|"CRITICAL"} blockAt - Severity that triggers a block.
 * @returns {PreflightGateDecision}
 */
```

### Contract tests impact-engine must pass

1. `analyzeImpact` correctly classifies LOW/MEDIUM/HIGH/CRITICAL against a fixture with known callsite counts.
2. `analyzeImpact` is deterministic — same input, same output, no hidden randomness.
3. `analyzeImpact` populates `rationale` with a string referencing the specific thresholds that triggered the classification.
4. `preflightGate` returns `"block"` when any report equals or exceeds the threshold.
5. `preflightGate` returns `"allow"` when all reports are below the threshold.
6. `preflightGate` on empty array returns `"allow"` with a rationale of "no linked symbols."
7. All functions are pure — calling them twice with the same input returns the same output and produces no side effects.

## symbol-resolver

Consumes `gitnexus-client` through dependency injection. Never imports it directly.

```js
/**
 * @typedef {Object} TicketInput
 * @property {string} title
 * @property {string} description
 * @property {string} [key]   - StoryFlow issue key, opaque to resolver.
 */

/**
 * @typedef {Object} SymbolCandidate
 * @property {SymbolRef} symbol
 * @property {number} confidence     - 0-1, derived from search score + heuristics.
 * @property {string} reason         - Human-readable explanation of why this symbol matched.
 */

/**
 * @typedef {Object} SymbolResolverConfig
 * @property {number} [topK=5]       - Max candidates returned per ticket.
 * @property {number} [minConfidence=0.3]  - Filter floor.
 */

/**
 * @function createSymbolResolver
 * @param {GitNexusClient} client
 * @param {SymbolResolverConfig} [config]
 * @returns {{ resolveTicket(t: TicketInput): Promise<SymbolCandidate[]> }}
 */
```

### Contract tests symbol-resolver must pass

1. `resolveTicket` is called with a mocked `GitNexusClient` whose `search()` returns a fixture — resolver transforms fixture hits into `SymbolCandidate[]`.
2. Candidates are sorted by confidence descending.
3. Candidates below `minConfidence` are filtered out.
4. `resolveTicket` with an empty description still attempts resolution against the title alone.
5. `resolveTicket` handles the case where `search()` returns zero hits by returning an empty array, not throwing.

## graph-renderer

React component. Standalone, visual reference is the GitNexus production UI. Dense force-directed graph with cluster coloring, file tree sidebar, and filter controls.

```js
/**
 * @typedef {Object} GraphNode
 * @property {string} id
 * @property {string} label
 * @property {string} clusterId
 * @property {number} [size]      - Node radius hint (default derived from in-degree).
 * @property {SymbolRef} symbol
 */

/**
 * @typedef {Object} GraphEdge
 * @property {string} source      - GraphNode.id
 * @property {string} target      - GraphNode.id
 * @property {number} [weight]    - Rendering hint for edge thickness.
 */

/**
 * @typedef {Object} GraphFilter
 * @property {string[]} [clusterIds]      - Show only nodes in these clusters.
 * @property {string[]} [ticketKeys]      - Highlight nodes linked to these tickets.
 * @property {BlastRadius[]} [blastRadius] - Highlight nodes at this blast radius.
 * @property {string} [searchTerm]        - Free-text filter.
 */

/**
 * @typedef {Object} GraphRendererProps
 * @property {GraphNode[]} nodes
 * @property {GraphEdge[]} edges
 * @property {Cluster[]} clusters
 * @property {GraphFilter} [filter]
 * @property {(node: GraphNode) => void} [onNodeClick]
 * @property {(clusterId: string) => void} [onClusterClick]
 * @property {Object} [theme]
 * @property {"obsidian-dark"|"warm-linen"} [theme.name="obsidian-dark"]
 */

/**
 * Default export: React component.
 *
 * Performance requirements:
 * - Must render 300 nodes + 600 edges at 60fps on a 2020 MacBook Air.
 * - Initial layout converges in < 2 seconds for 300 nodes.
 * - Uses canvas or WebGL rendering. SVG is disallowed for the main graph surface.
 */
```

### Contract tests graph-renderer must pass

1. Renders without crashing given a minimal props fixture (3 nodes, 2 edges, 1 cluster).
2. Renders 300 nodes without throwing or losing more than 10fps in the first 2 seconds (benchmark test, recorded via Playwright or equivalent).
3. `onNodeClick` fires with the correct `GraphNode` when a node is clicked.
4. Filter by `clusterIds` hides nodes outside the filter set.
5. Theme switch between `obsidian-dark` and `warm-linen` applies the correct token values without re-mounting.

## storyflow-plugin

The integration layer. Composed from the four sub-modules above. Not in scope for the parallel build — this gets built after all four sub-modules are green.
