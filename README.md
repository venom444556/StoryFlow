# StoryFlow

A visual project planning and management tool built for AI-assisted software development. StoryFlow combines the best of JIRA, Confluence, and visual workflow tools into a single glassmorphic interface.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-06B6D4?logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

## Features

### Board
Full Kanban board with epics, stories, tasks, and bugs. Includes sprint management, backlog grooming, story point estimation, burndown charts, and velocity tracking.

![Board](docs/screenshots/board.gif)

### Wiki
Nested documentation pages with a markdown editor, live preview, page templates, version history, and table of contents generation.

![Wiki](docs/screenshots/wiki.gif)

### Workflow Canvas
Visual node graph for planning project phases, dependencies, and execution flow. Supports sub-workflows, pan/zoom, and a BFS execution engine.

![Workflow Canvas](docs/screenshots/workflow.gif)

### Architecture View
Component tree visualization with dependency mapping, cycle detection, and type-based filtering. Plan your system architecture before writing code.

![Architecture View](docs/screenshots/architecture.gif)

### Timeline
Phase-based progress tracking with milestone markers, date ranges, and completion percentages.

### Decisions Log
Architectural decision records with alternatives analysis, consequences tracking, and status management.

### Overview
Project dashboard with goals, constraints, tech stack summary, activity feed, and quick stats.

## Design

StoryFlow uses a custom design token system with two themes:

- **Obsidian** -- dark glassmorphic theme with frosted glass panels and depth layering
- **Warm Linen** -- light theme with a warm bone/eggshell palette

All components use semantic CSS variable tokens (`--color-fg-default`, `--color-bg-panel`, etc.) for consistent theming across 80+ components.

## Quick Start

```bash
npm install          # Installs client + server dependencies
npm run dev:full     # Starts Express server + Vite dev server
```

This starts two processes:

- **Vite dev server** on [http://localhost:3000](http://localhost:3000) -- open this in your browser
- **Express API server** on port 3001 -- Vite proxies `/api` requests automatically

In production, only the Express server runs (on port 3001) and serves both the API and the built frontend.

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

## Tech Stack

### Client

| Technology | Purpose |
|-----------|---------|
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
|-----------|---------|
| Express 4 | HTTP API server |
| sql.js | SQLite database (pure JS, no native deps) |
| ws | WebSocket server for real-time sync |

## Architecture

```
Development:
  Vite (:3000) ──proxy /api──> Express (:3001) ──> SQLite (data/storyflow.db)
       ↑                            ↕ WebSocket
       └── Browser (React + Zustand + IndexedDB)

Production:
  Express (:3001) ──> serves dist/ + API + WebSocket ──> SQLite
```

The client stores data in IndexedDB for fast access. The Express server persists data in SQLite for durability. WebSocket notifications keep them in sync -- changes from one source propagate to the other automatically.

## Project Structure

```
src/
  components/
    ui/            Shared components (Button, Modal, Badge, Input, etc.)
    layout/        App shell (Sidebar, Header, Settings, ErrorBoundary)
    project/       Tab components (Board, Wiki, Workflow, Architecture, etc.)
    board/         Kanban board (SprintBoard, BacklogView, IssueCard, etc.)
    wiki/          Documentation (PageTree, PageEditor, MarkdownRenderer)
    workflow/      Visual canvas (WorkflowCanvas, WorkflowNode, NodePalette)
    architecture/  Component tree (ComponentDetail, DependencyGraph)
    timeline/      Phase tracking (PhaseCard, MilestoneMarker)
    decisions/     Decision records (DecisionCard, DecisionForm)
    activity/      Activity feed
  pages/           Dashboard, Project, 404
  hooks/           Custom hooks (useProject, useDragAndDrop, useCanvasPan, etc.)
  contexts/        ProjectsContext (React Context + Zustand)
  stores/          Zustand stores (projects, activity, UI)
  styles/          Design tokens (tokens.css)
  utils/           Helpers (markdown, sanitize, graph, colors, export/import)
  data/            Seed data, defaults, templates, node types
  server/          Express backend (app.js, db.js, ws.js, index.js)
data/              SQLite database (auto-created on first run, gitignored)
```

## Data Model

Projects are persisted in both IndexedDB (client) and SQLite (server). The server is the source of truth -- data survives browser clears and server restarts. Each project contains:

- **Overview** -- goals, constraints, tech stack, target audience
- **Architecture** -- component tree with types and dependencies
- **Workflow** -- visual node graph with execution engine
- **Board** -- issues (epics/stories/tasks/bugs), sprints, status columns
- **Wiki** -- nested pages with markdown content and version history
- **Timeline** -- phases with progress tracking and milestones
- **Decisions** -- architectural decisions with alternatives and consequences

## Deployment

StoryFlow requires the Express server for data persistence. Build the client and run the server:

```bash
npm run build        # Produces dist/
npm run server       # Express serves dist/ + API on port 3001
```

The server auto-detects `dist/` and serves it as static files alongside the API. Open [http://localhost:3001](http://localhost:3001) in production mode.

To change the server port, set the `STORYFLOW_PORT` environment variable:

```bash
STORYFLOW_PORT=8080 npm run server
```

## License

MIT
