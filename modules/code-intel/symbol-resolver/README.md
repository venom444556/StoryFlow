# symbol-resolver

Maps a StoryFlow ticket (title + description) to candidate symbols in the codebase via GitNexus semantic search. Returns ranked candidates with confidence scores and human-readable rationale.

## Responsibilities

1. Accept a `TicketInput` and return a ranked `SymbolCandidate[]` via dependency-injected `GitNexusClient.search()`.
2. Combine search scores with simple heuristics: direct symbol name mentions in the ticket title, file path references, explicit `[[Symbol:name]]` markers.
3. Filter candidates below a configurable confidence floor.
4. Cap output at a configurable `topK`.
5. Handle empty descriptions, no-result searches, and malformed tickets gracefully.

## Non-goals

- Does not call GitNexus directly. Takes the client as a constructor argument.
- Does not maintain ticket state. Every call is stateless.
- Does not persist anything.

## Acceptance criteria

1. All contract tests in `CONTRACTS.md > symbol-resolver` pass using a **mocked** `GitNexusClient`.
2. Confidence scores are deterministic given the same input.
3. A real-data smoke test (documented, may be manual) resolves at least one sample Saucier ticket to a plausible symbol.

## Tooling expectations

- `package.json` with zero runtime dependencies on GitNexus or StoryFlow (only on the interface types).
- ESM only.
- Vitest for tests. Every test uses a fake `GitNexusClient` implementing only the methods the resolver actually calls.
- A `USAGE.md` showing how to construct the resolver and resolve a ticket.
