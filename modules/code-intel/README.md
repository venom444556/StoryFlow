# Code Intelligence Module

Feature module that connects a codebase's knowledge graph to the StoryFlow project board. Powered by a locally-sandboxed GitNexus MCP server. Surfaces blast radius, execution flows, and semantic search inside StoryFlow tickets, wiki, architecture, timeline, and decisions.

## Modularity Contract

This feature is a two-level modular system:

1. **Sub-modules** — each of the five sub-modules in this directory is independently functional, independently testable, and has its own `package.json`, `src/`, and `tests/`. A sub-module ships green on its own test suite before it is allowed to integrate with anything else.

2. **Feature module** — the `storyflow-plugin/` sub-directory is the integration layer that composes the other four into a StoryFlow plugin. It is the only piece that knows about StoryFlow's internals. Everything else is StoryFlow-agnostic and could in principle power a different PM tool.

No sub-module imports another sub-module directly. They communicate exclusively through the interfaces defined in `CONTRACTS.md`. This keeps the boundary clean and means any sub-module can be replaced without touching the others.

## Sub-modules

| Directory | Purpose | Status |
|---|---|---|
| `gitnexus-client/` | Sandboxed wrapper around the GitNexus MCP server. Handles lifecycle, version pinning, LLM endpoint lockdown, scarf disable. Exposes typed calls to `impact`, `search`, `list_clusters`, `query_graph`, `detect_changes`. | scaffold |
| `impact-engine/` | Pure-logic module. Takes raw GitNexus impact responses and produces structured `ImpactReport` objects with blast radius classification. Includes the pre-flight gate policy engine. | scaffold |
| `symbol-resolver/` | Maps a ticket (title + description) to candidate symbols in the codebase via GitNexus semantic search. Ranked output with confidence scores. | scaffold |
| `graph-renderer/` | Canvas/WebGL force-directed graph React component. Handles hundreds of nodes at interactive framerates. Cluster-based coloring, file-tree sidebar, filter controls. Visual reference: GitNexus production UI. | scaffold |
| `storyflow-plugin/` | Integration layer. Wires the four sub-modules above into StoryFlow as a proper Claude Code plugin with its own hooks, commands, and UI surfaces. | pending sub-module completion |

## Safety & Sanitization

GitNexus is adopted under a locked-down configuration derived from a security audit. These rules are enforced by `gitnexus-client/` at runtime:

1. **Version pinned** to `gitnexus@1.5.3`. No `@latest`.
2. **LLM endpoint lockdown.** `GITNEXUS_API_KEY` and `GITNEXUS_LLM_BASE_URL` must be explicitly set by the caller. If not set, any operation that would call the LLM fails closed with a clear error. The default OpenRouter route is never used.
3. **Scarf telemetry disabled.** `SCARF_ANALYTICS=false` is set in the process environment before spawning GitNexus.
4. **Local only.** `repoPath` is always the current working directory. No remote indexing. No cross-repo state.

Any change to these rules requires an explicit decision log entry in StoryFlow.

## Read next

- `CONTRACTS.md` — the interface every sub-module builds against.
- Each sub-module's `README.md` — the spec for that sub-module.
