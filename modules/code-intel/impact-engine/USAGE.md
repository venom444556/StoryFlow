# Usage — @storyflow/code-intel-impact-engine

A pure-logic module. Two functions, zero side effects.

## End-to-end example

```js
import {
  analyzeImpact,
  preflightGate,
  DEFAULT_THRESHOLDS,
} from '@storyflow/code-intel-impact-engine';

// 1. Raw GitNexus response (from gitnexus-client#impact)
const raw = {
  target: {
    name: 'auth.middleware.verify',
    file: 'src/auth/middleware.js',
    line: 42,
    kind: 'function',
  },
  callers: [
    {
      from: { name: 'api.routes.login',   file: 'src/api/routes/login.js' },
      to:   { name: 'auth.middleware.verify', file: 'src/auth/middleware.js' },
    },
    {
      from: { name: 'api.routes.profile', file: 'src/api/routes/profile.js' },
      to:   { name: 'auth.middleware.verify', file: 'src/auth/middleware.js' },
      via:  'src/api/guard.js',
    },
  ],
  callsiteCount: 34,
  affectedClusters: ['cluster-auth', 'cluster-api'],
  affectedServices: 3,
};

// 2. Classify the blast radius. Thresholds are optional; DEFAULT_THRESHOLDS
//    is used if you omit the second argument.
const report = analyzeImpact(raw);
// report.blastRadius    === 'HIGH'
// report.rationale      === 'HIGH — 34 callsites meets or exceeds high_minCallsites threshold of 21, spans 3 services.'

// 3. Feed one or more reports to the pre-flight gate. The gate blocks a
//    ticket from entering In Progress if the WORST linked symbol meets or
//    exceeds the configured severity.
const decision = preflightGate([report], 'HIGH');
// decision.outcome === 'block'
// decision.reason  mentions the target and the rationale.

if (decision.outcome === 'block') {
  console.warn(decision.reason);
}
```

## Customizing thresholds

```js
import { analyzeImpact, DEFAULT_THRESHOLDS } from '@storyflow/code-intel-impact-engine';

const strict = {
  ...DEFAULT_THRESHOLDS,
  low_maxCallsites: 2,
  critical_minCallsites: 30,
};

const report = analyzeImpact(raw, strict);
```

Only the fields you override are replaced; the rest fall back to the
defaults defined in `CONTRACTS.md`.

## Purity guarantees

- `analyzeImpact` and `preflightGate` perform no I/O, network, timing, or
  randomness. Same input, same output, forever.
- They do not mutate their inputs. Callers can share raw objects between
  calls without defensive cloning.
- The module has zero runtime dependencies.

## Interpretation notes

The contract in `CONTRACTS.md` specifies default thresholds but leaves a
few gaps that this implementation fills with the simplest possible
interpretation:

1. **Boundary behavior.** Thresholds named `*_max*` are inclusive upper
   bounds; thresholds named `*_min*` are inclusive lower bounds. So
   `callsiteCount === 5` is still LOW, and `callsiteCount === 21` is
   HIGH.
2. **Service spread overrides callsite count upward, never downward.**
   A symbol with 2 callsites spread across 3 services is HIGH, because
   cross-service spread is a stronger signal than raw callsite count.
   This preserves monotonicity in both dimensions.
3. **Top callers ranking.** `ImpactRaw` does not carry call frequency,
   so "top callers" is ordered by direct-before-transitive (anything
   with a `via` link ranks lower) and then by original array order.
   The list is capped at 10. See `TOP_CALLERS_CAP` in `src/analyze.js`.
4. **Empty `preflightGate` input.** Returns `allow` with the exact
   rationale `"no linked symbols."` — this is the contract-test
   requirement.
