# StoryFlow

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-Source%20Available-red)](./LICENSE.md)

![StoryFlow Banner](./docs/Storyflow%20project%20management%20in%20pixel%20art.png)

**Built for vibecoders, by a vibecoder. No templates. No SaaS. No compromises.**

> **Project management tools were built for humans. StoryFlow is built for agents.**

---

## The Problem

Your AI coding assistant can write code — but it can't see your project.

Backlogs, sprint state, architecture decisions, workflow dependencies, docs — they all live in a browser tab the agent can't touch. So you copy-paste context into prompts. Sessions are stateless relative to your roadmap. Tickets lag behind code. The project drifts.

And if you're vibecoding — it's worse. You're six hours deep, Claude's touched 30 files, you've pivoted twice, and now you can't remember what's done, what's broken, or what the plan even was. You're prompting about what you prompted about. That's prompt inception, and it's not a tooling problem — it's an organizational one.

That's friction in AI-assisted development. StoryFlow removes it.

---

## The Solution

**StoryFlow is a local-first project system that treats AI agents as first-class collaborators.**

Every board, sprint, wiki page, and workflow is exposed as an MCP tool — a callable interface Claude Code (or any MCP-compatible agent) can read and write directly while it works alongside you. No copy-pasting context. No tab switching. No drift.

The agent reads your backlog. Creates issues while coding. Updates sprint progress. Writes docs in the right place. Maintains workflow state. Autonomously.

It's also the project tool you'd want even without AI: Kanban with sprints and burndown charts, a wiki with live markdown preview, a visual workflow canvas, architecture diagrams, decision logs, and timeline tracking — all in one local app with a glassmorphic UI.

Think JIRA + Confluence + Miro, minus the SaaS bill and the latency.

Your data stays on your machine in SQLite and IndexedDB. No accounts. No cloud sync. No telemetry.

---

## MCP Integration

This is the whole point.

StoryFlow includes a Claude Code plugin that exposes your entire project state as structured MCP tools. Claude can call these automatically during development — no prompting required.

### Install

```bash
claude plugin add /path/to/StoryFlow/plugin
```

### Setup

```bash
/storyflow:setup     # Configure the StoryFlow URL (default: http://localhost:3001)
```

### What Claude Can Do

| Tool | What it does |
|------|-------------|
| `storyflow_list_projects` | List all projects |
| `storyflow_create_project` | Create a new project |
| `storyflow_list_issues` | List and filter issues |
| `storyflow_create_issue` | Create an epic, story, task, or bug |
| `storyflow_update_issue` | Update any issue field |
| `storyflow_get_board_summary` | Get board overview with counts and progress |
| `storyflow_list_sprints` | List sprints |
| `storyflow_create_sprint` | Create a sprint |
| `storyflow_list_pages` | List wiki pages |
| `storyflow_create_page` | Create a wiki page |
| `storyflow_update_page` | Update page content |
| `storyflow_check_connection` | Verify connectivity |

### Example Session

Here's what it actually looks like when Claude works inside StoryFlow:

```
Developer: "Fix the auth bug and track it properly."

Claude calls → storyflow_list_projects()
Claude calls → storyflow_create_issue({ type: "bug", title: "Auth token not refreshing on expiry", sprint: "current" })
[Claude fixes the bug]
Claude calls → storyflow_update_issue({ id: "BUG-42", status: "done" })
Claude calls → storyflow_update_page({ id: "auth-docs", content: "Updated token refresh behavior..." })

Done. Backlog updated. Docs current. No copy-paste.
```

### Commands

| Command | Description |
|---------|-------------|
| `/storyflow:setup` | Configure StoryFlow URL |
| `/storyflow:sync` | Check connectivity and sync status |
| `/storyflow:open` | Open StoryFlow UI in browser |
| `/storyflow:board [project]` | Show board summary for a project |

---

## Quick Start

```bash
npm install          # Installs client + server dependencies
npm run dev:full     # Starts Express server + Vite dev server
```

Two processes start:

- **Vite dev server** on http://localhost:3000 — open this in your browser
- **Express API server** on port 3001 — Vite proxies `/api` requests automatically

In production, only the Express server runs (on port 3001) and serves both the API and the built frontend.

---

## Features

### Board

Full Kanban board with epics, stories, tasks, and bugs. Sprint management, backlog grooming, story point estimation, burndown charts, and velocity tracking.

![Board](./docs/screenshots/board.gif)

### Wiki

Nested documentation pages with a markdown editor, live preview, page templates, version history, and table of contents generation.

![Wiki](./docs/screenshots/wiki.gif)

### Workflow Canvas

Visual node graph for planning project phases, dependencies, and execution flow. Supports sub-workflows, pan/zoom, and a BFS execution engine.

![Workflow Canvas](./docs/screenshots/workflow.gif)

### Architecture View

Component tree visualization with dependency mapping, cycle detection, and type-based filtering. Plan your system architecture before writing code.

![Architecture View](./docs/screenshots/architecture.gif)

### Timeline

Phase-based progress tracking with milestone markers, date ranges, and completion percentages.

### Decisions Log

Architectural decision records with alternatives analysis, consequences tracking, and status management.

### Overview

Project dashboard with goals, constraints, tech stack summary, activity feed, and quick stats.

---

## Design

StoryFlow uses a custom design token system with two themes:

- **Obsidian** — dark glassmorphic theme with frosted glass panels and depth layering
- **Warm Linen** — light theme with a warm bone/eggshell palette

All components use semantic CSS variable tokens (`--color-fg-default`, `--color-bg-panel`, etc.) for consistent theming across 80+ components.

---

## Tech Stack

### Client

| Technology | Purpose |
|------------|---------|
| React 18 | UI framework |
| Vite 6 | Build tool + dev server |
| Tailwind CSS 4.0 | Styling via `@tailwindcss/vite` |
| Framer Motion | Animations |
| Zustand + Dexie | State management with IndexedDB persistence |
| Lucide React | Icons |
| date-fns | Date formatting |
| Vitest | Testing |

### Server

| Technology | Purpose |
|------------|---------|
| Express 4 | HTTP API server |
| sql.js | SQLite database (pure JS, no native deps) |
| ws | WebSocket server for real-time sync |

---

## Architecture

```
Development:
  Vite (:3000) ──proxy /api──> Express (:3001) ──> SQLite (data/storyflow.db)
       ↑                            ↕ WebSocket
       └── Browser (React + Zustand + IndexedDB)

Production:
  Express (:3001) ──> serves dist/ + API + WebSocket ──> SQLite
```

**Write path:** UI → API → SQLite → WebSocket → UI

The client stores data in IndexedDB for fast access. The Express server persists to SQLite for durability. WebSocket keeps them in sync — changes propagate automatically. SQLite is source of truth; data survives browser clears and server restarts.

---

## Project Structure

```
plugin/              Claude Code plugin (MCP server, commands, skills)
server/              Express backend (app.js, db.js, ws.js, index.js)
src/
  components/
    ui/              Shared components (Button, Modal, Badge, Input, etc.)
    layout/          App shell (Sidebar, Header, Settings, ErrorBoundary)
    project/         Tab components (Board, Wiki, Workflow, Architecture, etc.)
    board/           Kanban board (SprintBoard, BacklogView, IssueCard, etc.)
    wiki/            Documentation (PageTree, PageEditor, MarkdownRenderer)
    workflow/        Visual canvas (WorkflowCanvas, WorkflowNode, NodePalette)
    architecture/    Component tree (ComponentDetail, DependencyGraph)
    timeline/        Phase tracking (PhaseCard, MilestoneMarker)
    decisions/       Decision records (DecisionCard, DecisionForm)
    activity/        Activity feed
  pages/             Dashboard, Project, 404
  hooks/             Custom hooks (useProject, useDragAndDrop, useCanvasPan, etc.)
  contexts/          ProjectsContext (React Context + Zustand)
  stores/            Zustand stores (projects, activity, UI)
  styles/            Design tokens (tokens.css)
  utils/             Helpers (markdown, sanitize, graph, colors, export/import)
  data/              Seed data, defaults, templates, node types
data/                SQLite database (auto-created on first run, gitignored)
```

---

## Data Model

Each project contains:

- **Overview** — goals, constraints, tech stack, target audience
- **Architecture** — component tree with types and dependencies
- **Workflow** — visual node graph with execution engine
- **Board** — issues (epics/stories/tasks/bugs), sprints, status columns
- **Wiki** — nested pages with markdown content and version history
- **Timeline** — phases with progress tracking and milestones
- **Decisions** — architectural decisions with alternatives and consequences

---

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev:full` | Start server + client together |
| `npm run dev` | Start Vite dev server only (client) |
| `npm run server` | Start Express API server only |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run test` | Run vitest in watch mode |
| `npm run test:run` | Run tests once |
| `npm run lint` | Lint with ESLint |
| `npm run format` | Format with Prettier |

---

## Security

StoryFlow is designed for **local single-user use only**. It is not hardened for multi-user or public-facing deployments.

### Threat Model

The primary threat StoryFlow guards against is **unauthorized tool access** — preventing untrusted MCP clients or rogue processes from reading and modifying your project data through the API.

**Protected:**
- MCP tool calls require a shared secret (`MCP_AUTH_TOKEN`) passed as a Bearer token. All tool requests without it are rejected with `401 Unauthorized`.
- Token is validated using constant-time comparison to prevent timing attacks.

**Out of scope:**
- **Network-level security.** Server binds to `127.0.0.1` by default. If you expose the port externally, add your own controls (firewall, reverse proxy with TLS, VPN).
- **Encryption at rest.** SQLite is stored unencrypted. Protect with filesystem permissions.
- **Multi-user access control.** No user accounts, roles, or per-user permissions. Anyone with the token has full access.

### Recommendations

- Set `MCP_AUTH_TOKEN` to a strong random value: `openssl rand -hex 32`
- Never commit the token to version control — use a `.env` file
- Do not expose the server port to untrusted networks without additional safeguards

---

## Deployment

```bash
npm run build        # Produces dist/
npm run server       # Express serves dist/ + API on port 3001
```

Open http://localhost:3001 in production mode.

To change the server port:

```bash
STORYFLOW_PORT=8080 npm run server
```

### Running as a Background Service

#### macOS (launchd)

Create `~/Library/LaunchAgents/com.storyflow.server.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.storyflow.server</string>
  <key>ProgramArguments</key>
  <array>
    <string>/usr/local/bin/node</string>
    <string>server/index.js</string>
  </array>
  <key>WorkingDirectory</key>
  <string>/path/to/StoryFlow</string>
  <key>RunAtLoad</key>
  <true/>
  <key>KeepAlive</key>
  <true/>
  <key>StandardOutPath</key>
  <string>/tmp/storyflow.log</string>
  <key>StandardErrorPath</key>
  <string>/tmp/storyflow.err</string>
</dict>
</plist>
```

```bash
launchctl load ~/Library/LaunchAgents/com.storyflow.server.plist
```

#### Linux (systemd)

Create `/etc/systemd/system/storyflow.service`:

```ini
[Unit]
Description=StoryFlow Server
After=network.target

[Service]
Type=simple
WorkingDirectory=/path/to/StoryFlow
ExecStart=/usr/bin/node server/index.js
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable storyflow
sudo systemctl start storyflow
```

#### Windows (Task Scheduler)

```powershell
$action = New-ScheduledTaskAction -Execute "node" -Argument "server/index.js" -WorkingDirectory "C:\path\to\StoryFlow"
$trigger = New-ScheduledTaskTrigger -AtStartup
$settings = New-ScheduledTaskSettingsSet -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 1)
Register-ScheduledTask -TaskName "StoryFlow" -Action $action -Trigger $trigger -Settings $settings -RunLevel Highest
```

---

## License

Source available. Free for personal use, non-commercial self-hosting, and educational purposes. See [LICENSE.md](./LICENSE.md) for full terms.

Commercial licensing: sasdevworks@gmail.com

---

Created by [Sheldon Spence](https://github.com/venom444556) using [Claude Code](https://claude.ai/claude-code)
