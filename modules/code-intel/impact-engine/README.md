# impact-engine

Pure-logic module. Takes raw GitNexus impact responses and produces structured `ImpactReport` objects with blast radius classification. Also contains the pre-flight gate policy engine that decides whether a ticket is safe to start.

## Responsibilities

1. `analyzeImpact(raw, thresholds?)` — classify blast radius as LOW/MEDIUM/HIGH/CRITICAL based on callsite count and cross-service distribution. Default thresholds defined in `CONTRACTS.md`. Thresholds are configurable.
2. `preflightGate(reports, blockAt)` — decide whether to block a ticket from entering In Progress based on the worst linked symbol's report.
3. Provide a human-readable rationale for every classification. The rationale must reference the specific threshold that triggered it so humans can trust and debug the result.
4. Be entirely pure. No I/O, no network, no timers, no mutable module state, no `Date.now()`, no randomness.

## Non-goals

- Does not call GitNexus directly. Consumes `ImpactRaw` from `gitnexus-client`.
- Does not know about tickets, sprints, or StoryFlow. Operates on symbols and reports only.
- Does not render anything.

## Acceptance criteria

1. All contract tests in `CONTRACTS.md > impact-engine` pass.
2. Property-based tests demonstrate that classification is monotonic — increasing callsite count never moves a report to a lower blast radius.
3. 100% branch coverage on the pure logic (easy because the module is small and pure).

## Tooling expectations

- `package.json` with zero runtime dependencies (except types if using TypeScript).
- ESM only.
- Vitest for tests. Include property-based tests via `fast-check` if helpful.
- A `USAGE.md` showing a simple end-to-end: raw GitNexus response → `analyzeImpact` → `preflightGate`.
