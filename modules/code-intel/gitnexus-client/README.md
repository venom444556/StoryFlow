# gitnexus-client

Sandboxed wrapper around the GitNexus MCP server. The only sub-module that spawns or talks to GitNexus directly. Everything else consumes this module's interface.

## Responsibilities

1. Spawn the GitNexus process at a pinned version with sanitized environment (scarf disabled, LLM endpoint locked to the caller-provided value, repo path bound to the caller's working directory).
2. Enforce fail-closed LLM configuration. Reject construction if no `llm` block is provided. Reject OpenRouter routing unless `allowOpenRouter: true` is explicitly set.
3. Expose typed async methods for every GitNexus MCP tool call the rest of the feature needs: `impact`, `search`, `listClusters`, `queryGraph`, `detectChanges`.
4. Handle lifecycle: `start()`, `stop()`, `health()`. All idempotent.
5. Log sanitized launch arguments to a local log file for audit purposes. Never log the LLM API key.

## Non-goals

- No business logic. Raw GitNexus responses are returned as-is; interpretation belongs to `impact-engine`.
- No ticket or symbol knowledge. This module never mentions StoryFlow.
- No caching. That's a higher-layer concern.

## Acceptance criteria

1. All contract tests in `CONTRACTS.md > gitnexus-client` pass.
2. A smoke test demonstrates the client can start a real GitNexus instance against a small fixture repo and return a real `impact()` response (documented as a manual test if automated is not feasible in the first iteration).
3. Construction fails loudly and clearly when the safety rules are violated (bad version, missing LLM, OpenRouter without opt-in).

## Tooling expectations

- `package.json` with its own dependencies — do not hoist to the StoryFlow root.
- ESM only.
- Vitest for tests.
- A `tests/` directory with unit tests for every contract item.
- A short `USAGE.md` with a 10-line example of creating and using the client.
