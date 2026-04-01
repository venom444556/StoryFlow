# StoryFlow

StoryFlow is a local-first project operating system for AI-assisted software delivery. It ships three things together:

- a React + Express app for boards, docs, workflow, architecture, timeline, decisions, and oversight
- a terminal CLI with 60+ commands for every major StoryFlow workflow
- a packaged StoryFlow Agent care package that can be dropped into a workspace and operated by an LLM

StoryFlow is not "an app plus some prompts." The app is the tool substrate and system of record. The agent package is the operating shell that uses it.

## What Ships Today

### Core product surfaces

- Dashboard with operational project summaries
- Overview with project operations, gates, activity feed, session history, analytics, and agent health
- Board with epics, backlog, kanban lanes, sprints, blockers, and hygiene checks
- Wiki with Lucide vector icons, templates, core-page auditing, and required-page enforcement
- Workflow graph with draggable nodes, persistent positions, tidy auto-layout, and connection lines behind nodes
- Architecture graph with dependency edges, auto-layout, draggable components, and tree view with detail slide-in
- Timeline with phases, milestones, hot wash reports, and lessons learned rollup
- Decisions log with immutable ADR sequence numbers and status-colored cards
- Floating steering chat for issuing directives to the agent without blocking the viewport

### Agent operating surfaces

- `storyflow context boot --json` for single-call project boot with hygiene, lessons, wiki audit
- cross-entity `search` and `resolve` with fuzzy matching
- `storyflow reconcile git` for automatic board reconciliation from commit history
- session save with all reporting fields (summary, work-done, learnings, key-decisions, next-steps)
- batch operations: `batch-done`, `batch-update`
- phase hot wash generation, editing, finalization, deletion, and project-level lessons rollup
- wiki audit and required core-page creation
- workspace-scoped packaged agent install, doctor, hook install, and status
- full event provenance: reasoning, confidence, parent-event-id, entity-id, session-id

### Agent delegation model

StoryFlow enforces autonomous PM behavior from both ends:

- **Claude pushes:** dispatches the storyflow-agent when it sees work that needs tracking
- **Hooks pull:** trigger automatically on commits, file edits, session start/end

The overlap is intentional. Neither side assumes the other handled it. CLAUDE.md and the agent prompt both encode this rule.

### Safety and truth

- hybrid gate enforcement for AI mutations
- low-confidence auto-gating
- snapshots and restore
- event provenance with causal chains (parent_event_id)
- session history with full context
- server-backed analytics, gates, and operational summaries
- database durability: debounced save on every mutation, periodic auto-save every 30s, awaited flush on shutdown, launchd ExitTimeOut protection

## Quick Start

```bash
git clone https://github.com/venom444556/StoryFlow.git
cd StoryFlow
npm install
npm run dev
```

Open [http://127.0.0.1:3001](http://127.0.0.1:3001).

`npm run dev` starts the StoryFlow server, API, and Vite-backed UI on port `3001`.

## CLI

The CLI lives in [`cli/`](./cli) and exposes both `storyflow` and `storyflow-cli` as binaries. 60+ commands, every one supports `--json`.

### Local install from this repo

```bash
npm install -g ./cli
storyflow status
```

### Example workflow

```bash
storyflow config set-url http://127.0.0.1:3001
storyflow config set-default saucier

storyflow context boot --json
storyflow search "auth" --json
storyflow resolve issue S-42 --json
storyflow issues create --title "Fix login" --type bug --priority high --labels "backend,auth" --json
storyflow issues done S-42 --json
storyflow issues batch-done S-43 S-44 --json
storyflow issues comment S-42 --body "Fixed in commit abc123" --json
storyflow reconcile git --json
storyflow pages audit --json
storyflow phases hot-wash lessons --json
storyflow sessions save -s "Session summary" --work-done "Fixed auth" --learnings "Token refresh needed" --json
```

### Major command groups

- `projects`, `issues`, `sprints`, `board`, `hygiene`
- `pages`, `decisions`
- `phases`, `milestones`
- `workflow`, `architecture`
- `events`, `sessions`, `ai-status`, `gates`, `snapshots`, `steer`
- `context`, `search`, `resolve`, `reconcile`
- `agent`

## StoryFlow Agent Care Package

StoryFlow includes a packaged agent scaffold in [`agent/`](./agent). The app stays the system of record, and the agent package carries the operating behavior.

### Bootstrap the agent package

```bash
storyflow agent init
storyflow agent doctor --json
storyflow agent install-hooks
storyflow agent status --json
```

### Generated scaffold

```text
agent/
  CLAUDE.md
  SKILL.md
  config.json
  hooks/
    session-start.sh
    session-stop.sh
    pre-mutation.sh
    post-mutation.sh
  kb/
  memory.db
  state/
```

### What the care package does

- defines the agent's operating rules, delegation model, and command path
- boots from `storyflow context boot --json`
- installs Claude-compatible hooks into `.claude/settings.local.json`
- persists local runtime memory in `agent/memory.db`
- runs readiness diagnostics with `storyflow agent doctor`
- dual-ended delegation: agent handles PM work, hooks enforce if agent misses

## Hot Wash And Lessons Learned

StoryFlow treats retrospectives as first-class project artifacts.

- per-phase hot wash reports can be generated, edited, finalized, deleted, and listed
- phase name resolution: reference phases by name, not just UUID
- project-level lessons learned roll up from hot wash evidence
- a dedicated Lessons Learned page is available in the Insights area
- the CLI exposes `storyflow phases hot-wash lessons --json`
- lessons rollup is part of the agent operating loop, not a manual afterthought

## Wiki Accountability

Wiki discipline is enforced with product primitives instead of prompt reminders.

- `storyflow pages audit --json` detects stale or missing core documentation
- `storyflow pages ensure-core` creates missing required backbone pages
- required core pages are shared via [`shared/wikiCorePages.js`](./shared/wikiCorePages.js)
- context boot surfaces wiki freshness and missing core pages to the agent
- all page icons use Lucide vector icons, not emojis

## Architecture Overview

### App and API

- frontend: React 18, Vite 6, Tailwind CSS 4, Zustand
- backend: Express, SQLite via `sql.js`, WebSocket updates
- database durability: debounced save on every mutation, periodic auto-save every 30s, awaited flush on shutdown
- server is the system of record for project truth
- position-only updates exempt from rate limiting for smooth canvas drag

### Agent and plugin

- packaged local agent scaffold in [`agent/`](./agent)
- Claude integration assets in [`plugin/`](./plugin)
- dual-ended delegation model: Claude pushes, hooks pull
- workspace-scoped agent API:
  - `GET /api/agent/status`
  - `GET /api/agent/doctor`
  - `POST /api/agent/init`
  - `POST /api/agent/install-hooks`

### Project truth endpoints

- `GET /api/projects/:id/context` (agent boot contract)
- `GET /api/projects/:id/operational` (UI operational summary)
- `GET /api/projects/:id/analytics`
- `GET /api/projects/:id/gates`
- `GET /api/projects/:id/wiki-audit`
- `GET /api/projects/:id/lessons-learned`
- `POST/GET/PUT/DELETE/finalize /api/projects/:id/phases/:phaseId/hot-wash`

### Canvas features

- Workflow and architecture graphs with draggable nodes
- Node positions persist to SQLite (x/y columns on workflow_nodes and architecture_components)
- Tidy Layout button auto-arranges nodes (Sugiyama-style for architecture, BFS-layered for workflow)
- Connection lines render behind nodes (opaque `--color-bg-node` backgrounds)
- Infinite canvas — no drag boundaries
- Auto-spread when all nodes start at (0,0)
- Debounced position persistence with rate limit exemption

## Repository Map

```text
agent/      Packaged StoryFlow Agent scaffold
cli/        StoryFlow CLI package (60+ commands)
plugin/     Claude plugin assets, skills, and hooks
server/     Express API and SQLite data layer
shared/     Shared product contracts
src/        React app
docs/       Product docs and screenshots
```

## Scripts

```bash
npm run dev          # Express + Vite on localhost:3001
npm run build        # Production build
npm run test         # Tests in watch mode
npm run test:run     # Tests single run
npm run lint         # ESLint
npm run ci           # Full pipeline: format + lint + typecheck + test + build
```

## Local-First Security Model

StoryFlow is designed for local or controlled-network operation.

- loopback-first server defaults
- optional API token support
- gate enforcement for AI mutations
- snapshots before destructive changes
- inspectable event and session history

See [SECURITY.md](./SECURITY.md) for the security policy.

## License

Copyright (c) 2026 Sheldon Spence. See [LICENSE](./LICENSE).
