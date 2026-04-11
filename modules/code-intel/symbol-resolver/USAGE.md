# symbol-resolver — Usage

`@storyflow/code-intel-symbol-resolver` maps a StoryFlow ticket to a ranked list of
candidate code symbols. It does **not** talk to GitNexus directly. You inject a
`GitNexusClient` (real or fake) and the resolver calls its `search()` method.

## Install

This package lives inside the StoryFlow monorepo and is consumed by the
`storyflow-plugin` integration layer. From within the sub-module directory:

```bash
npm install
npm test
```

## Wire in a real client

```js
import { createGitNexusClient } from '@storyflow/code-intel-gitnexus-client';
import { createSymbolResolver } from '@storyflow/code-intel-symbol-resolver';

const client = createGitNexusClient({
  version: '1.5.3',
  repoPath: process.cwd(),
  llm: {
    baseUrl: process.env.GITNEXUS_LLM_BASE_URL,
    apiKey: process.env.GITNEXUS_API_KEY,
  },
});
await client.start();

const resolver = createSymbolResolver(client, {
  topK: 5,
  minConfidence: 0.35,
});

const candidates = await resolver.resolveTicket({
  key: 'SC-42',
  title: 'Fix auth.verify on expired tokens',
  description: 'Expired JWTs should be rejected cleanly in `src/auth/middleware.js`.',
});

for (const c of candidates) {
  console.log(`${c.confidence.toFixed(2)}  ${c.symbol.name}  — ${c.reason}`);
}

await client.stop();
```

## Wire in a fake client (tests)

Every test in this package uses a fake client. The resolver only ever calls
`client.search(query, { topK })`.

```js
import { vi } from 'vitest';
import { createSymbolResolver } from '@storyflow/code-intel-symbol-resolver';

const fakeClient = {
  search: vi.fn().mockResolvedValue([
    {
      symbol: { name: 'auth.verify', file: 'src/auth/middleware.js', kind: 'function' },
      score: 0.85,
      snippet: 'export function verify(token) { ... }',
    },
  ]),
};

const resolver = createSymbolResolver(fakeClient);
const candidates = await resolver.resolveTicket({
  title: 'Fix auth.verify on expired tokens',
  description: '',
});
```

## Heuristic boosts

The resolver starts from the raw semantic search score and then applies
additive boosts (clamped to 1.0) when it sees direct evidence:

| Signal | Boost | Example |
|---|---|---|
| Explicit `[[Symbol:foo.bar]]` marker in ticket text | +0.50 | `[[Symbol:auth.verify]]` |
| Candidate symbol name appears in the ticket **title** | +0.25 | title: "Fix verify() on expired tokens" |
| Candidate symbol name appears in the **description** | +0.10 | description: "verify throws undefined" |
| Candidate file path referenced in ticket text | +0.15 | backtick path `src/auth/middleware.js` |
| Candidate is a function/method (small tie-breaker) | +0.02 | |

Every candidate's `reason` field concatenates the signals that fired, so
reviewers can see exactly why a symbol ranked where it did.

## Determinism

Given the same ticket and the same fake search results, the resolver returns
byte-identical output. Ties are broken by symbol name, ascending.

## Error handling

| Situation | Behavior |
|---|---|
| `client` missing `search` | throws at `createSymbolResolver` |
| Ticket with no title **and** no description | throws `non-empty title or description` |
| Empty description, valid title | searches on title alone |
| `client.search` returns `[]` | returns `[]` (no throw) |
| `client.search` throws | rethrown wrapped with context + `cause` |
