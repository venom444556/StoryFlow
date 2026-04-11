# Usage

Install:

```
npm install
```

Minimal 10-line example:

```js
import { createGitNexusClient } from "@storyflow/code-intel-gitnexus-client";

const client = createGitNexusClient({
  version: "1.5.3",                                  // pinned, no "latest"
  repoPath: process.cwd(),                           // local only
  llm: {
    baseUrl: "https://llm.internal.example.com/v1", // explicit, non-OpenRouter
    apiKey: process.env.MY_LLM_KEY,                 // never logged
  },
});
await client.start();                                // spawns gitnexus@1.5.3 mcp
const impact = await client.impact({ symbol: "auth.verify" });
await client.stop();
```

## Safety behavior (fail-closed)

Construction throws immediately if any of the following are true:

- `version` is missing, `"latest"`, or not a valid semver.
- `llm` block is missing.
- `llm.baseUrl` or `llm.apiKey` is missing.
- `llm.baseUrl` points to `openrouter.ai` (or any `*.openrouter.ai` subdomain)
  and `llm.allowOpenRouter` is not set to `true`.
- `scarfAnalytics` is set to `true`.

## Child process

`start()` spawns:

```
npx -y gitnexus@<version> mcp
```

with the following environment applied on top of `process.env`:

- `SCARF_ANALYTICS=false`
- `GITNEXUS_API_KEY=<llm.apiKey>`
- `GITNEXUS_LLM_BASE_URL=<llm.baseUrl>`
- `GITNEXUS_REPO_PATH=<repoPath>`

The child is spawned `detached: true` with `stdio: 'ignore'` and `unref()`'d
so that it survives the hook that spawned it but remains killable via
`stop()`. `start()` is idempotent — calling it twice returns the same
running process.

## Launch audit log

Every `start()` appends a JSON line to `<repoPath>/.gitnexus/launch.log`
containing the command, args, and a redacted env dump. The `GITNEXUS_API_KEY`
value is always replaced with the literal string `<redacted>` — the real
key is never written to disk by this module.

## Current stubbing (build session note)

The MCP wire protocol between this client and the GitNexus subprocess is
**not yet connected** in this iteration. Methods like `impact()`, `search()`,
`listClusters()`, `queryGraph()`, and `detectChanges()` will throw a clear
"not yet connected" error unless you inject a responder at construction:

```js
const client = createGitNexusClient(cfg, {
  responder: {
    impact: async (input) => fixtureImpactRaw,
    search: async () => [],
    listClusters: async () => [],
    queryGraph: async () => ({}),
    detectChanges: async () => ({ /* ChangeSet */ }),
  },
});
```

The process lifecycle, env sanitization, version pinning, OpenRouter
lockdown, and launch logging are all implemented for real and covered
by the contract tests.
