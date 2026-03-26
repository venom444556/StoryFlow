# StoryFlow

StoryFlow is a local-first project operating system for AI-assisted software delivery. It ships three things together:

- a React + Express app for boards, docs, workflow, architecture, timeline, decisions, and oversight
- a terminal CLI for every major StoryFlow workflow
- a packaged StoryFlow Agent care package that can be dropped into a workspace and operated by an LLM

StoryFlow is not “an app plus some prompts.” The app is the tool substrate and system of record. The agent package is the operating shell that uses it.

## What Ships Today

### Core product surfaces

- Dashboard with operational project summaries
- Overview with project operations, gates, activity feed, session history, analytics, and agent health
- Board with epics, backlog, kanban lanes, sprints, blockers, and hygiene checks
- Wiki with templates, core-page auditing, and required-page enforcement
- Workflow graph with first-class connections
- Architecture map with first-class dependency edges
- Timeline with phases, milestones, hot wash reports, and lessons learned rollup
- Decisions log with immutable ADR sequence numbers

### Agent operating surfaces

- `storyflow context boot --json` for single-call project boot
- cross-entity `search` and `resolve`
- session save with richer reporting fields
- phase hot wash generation, finalization, and project-level lessons rollup
- wiki audit and required core-page creation
- workspace-scoped packaged agent install, doctor, hook install, and status

### Safety and truth

- hybrid gate enforcement for AI mutations
- low-confidence auto-gating
- snapshots and restore
- event provenance and session history
- server-backed analytics, gates, and operational summaries

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

The CLI lives in [`cli/`](./cli) and now exposes both `storyflow` and `storyflow-cli` as binaries. The examples below use `storyflow`.

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
storyflow search "stale preview" --json
storyflow resolve issue S-305 --json
storyflow issues batch-done S-301 S-302
storyflow pages audit --json
storyflow phases hot-wash lessons --json
```

### Major command groups

- `projects`, `issues`, `sprints`, `board`, `hygiene`
- `pages`, `decisions`
- `phases`, `milestones`
- `workflow`, `architecture`
- `events`, `sessions`, `ai-status`, `gates`, `snapshots`, `steer`
- `context`, `search`, `resolve`
- `agent`

## StoryFlow Agent Care Package

StoryFlow now includes a packaged agent scaffold in [`agent/`](./agent). This is the downloadable “care package” layer: the app stays the system of record, and the agent package carries the operating behavior.

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
├── CLAUDE.md
├── SKILL.md
├── config.json
├── hooks/
│   ├── session-start.sh
│   ├── session-stop.sh
│   ├── pre-mutation.sh
│   └── post-mutation.sh
├── kb/
├── memory.db
└── state/
```

### What the care package does

- defines the agent’s operating rules and command path
- boots from `storyflow context boot --json`
- installs Claude-compatible hooks into `.claude/settings.local.json`
- persists local runtime memory in `agent/memory.db`
- runs readiness diagnostics with `storyflow agent doctor`

## Hot Wash And Lessons Learned

StoryFlow now treats retrospectives as first-class project artifacts.

- per-phase hot wash reports can be generated, edited, finalized, and listed
- project-level lessons learned roll up from hot wash evidence
- a dedicated `Lessons Learned` page is available in the Insights area
- the CLI exposes `storyflow phases hot-wash lessons --json`
- lessons rollup is part of the agent operating loop, not a manual afterthought

## Wiki Accountability

Wiki discipline is now enforced with product primitives instead of prompt reminders.

- `storyflow pages audit --json` detects stale or missing core documentation
- `storyflow pages ensure-core` creates missing required backbone pages
- required core pages are shared via [`shared/wikiCorePages.js`](./shared/wikiCorePages.js)
- context boot surfaces wiki freshness and missing core pages to the agent

## Architecture Overview

### App and API

- frontend: React 18, Vite 6, Tailwind CSS 4, Zustand, Framer Motion
- backend: Express, SQLite via `sql.js`, WebSocket updates
- server is the system of record for project truth

### Agent and plugin

- packaged local agent scaffold in [`agent/`](./agent)
- Claude integration assets in [`plugin/`](./plugin)
- workspace-scoped agent API:
  - `GET /api/agent/status`
  - `GET /api/agent/doctor`
  - `POST /api/agent/init`
  - `POST /api/agent/install-hooks`

### Project truth endpoints

- `GET /api/projects/:id/context`
- `GET /api/projects/:id/operational`
- `GET /api/projects/:id/analytics`
- `GET /api/projects/:id/gates`
- `GET /api/projects/:id/wiki-audit`
- `GET /api/projects/:id/lessons-learned`
- `POST/GET/PUT/finalize /api/projects/:id/phases/:phaseId/hot-wash`

## Repository Map

```text
agent/      Packaged StoryFlow Agent scaffold
cli/        StoryFlow CLI package
plugin/     Claude plugin assets, skills, and hooks
server/     Express API and SQLite data layer
shared/     Shared product contracts
src/        React app
docs/       Product docs and screenshots
```

## Scripts

```bash
npm run dev
npm run build
npm run test
npm run test:run
npm run lint
npm run ci
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
