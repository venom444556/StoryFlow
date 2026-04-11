# Code Intelligence Feature Module

Integration layer that composes the four standalone sub-modules in `modules/code-intel/` and wires them into StoryFlow. This is the *feature module* referenced in the spec — everything under this directory is StoryFlow-specific. Everything under `modules/code-intel/` is StoryFlow-agnostic.

## What lives here

```
src/features/code-intelligence/
  index.js                            Public API — imported by everything that integrates with the feature
  module.js                           Feature module singleton (bootstraps sub-modules, holds lifecycle state)
  config.js                           .storyflow/modules/code-intelligence.json loader + schema
  components/
    ImpactBadge.jsx                   Board card badge rendering blast radius
    CodeTab.jsx                       Ticket detail "Code" tab — symbol linking + current impact
  hooks/
    useCodeIntelligence.js            React hook wrapping the singleton for UI components
    useIssueImpact.js                 Batch-fetches impact reports for visible issues
  preflight/
    gate.js                           Pure wrapper around impact-engine preflightGate tuned for StoryFlow issues
    transitionGuard.js                Integration glue that hooks into the issuesStore status transition path
  pages/
    CodebaseMapPage.jsx               Route-mounted page that renders the graph-renderer full-screen
  integrations/
    decisionAttachment.js             Symbol impact report attachment for decision logs
    timelineEvents.js                 Timeline event schemas for index-refresh / blast-radius-warning / change-detection
  __tests__/
    (component and integration tests)
```

## Public API contract

Every other piece of this feature imports from `src/features/code-intelligence/index.js`. Nothing should reach deeper into the module's internals. The public API is defined in `CONTRACTS.md` next to this README.

## Configuration

The feature is opt-in. It reads `.storyflow/modules/code-intelligence.json` at server startup. If the file doesn't exist or `enabled: false`, the entire feature is a no-op — no imports fire, no lifecycle starts, no UI surfaces render. This is how we ship the feature without breaking users who don't want it.

## Safety

The feature module never spawns GitNexus with default config. It requires an explicit `llm.baseUrl` and `llm.apiKey` in the config file. If either is missing, the feature refuses to bootstrap with a clear error logged to the console. This enforces the fail-closed posture from the security audit.
