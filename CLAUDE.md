# StoryFlow

**Claude's Project Planning & Management Tool**

## Quick Start

```bash
npm install
npm run dev    # Opens http://localhost:3000
```

## What This Is

StoryFlow is a visual project planning tool that Claude uses to architect, decompose, and track coding projects. It combines:

- **JIRA-style Board** — Kanban board with epics, stories, tasks, bugs, sprints, story points, burndown/velocity charts
- **Confluence-style Wiki** — Nested documentation pages with markdown editor, live preview, templates, version history
- **Workflow Canvas** — Visual node graph for planning phases, dependencies, and execution flow (with BFS execution engine)
- **Timeline** — Phase-based progress tracking with milestones
- **Decisions Log** — Architectural decision records with alternatives and consequences
- **Architecture View** — Component tree planning with dependency mapping

## Tech Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18+ | UI framework |
| Vite | 6+ | Build tool |
| Tailwind CSS | 4.0 | Styling (via @tailwindcss/vite) |
| Framer Motion | 11+ | Animations |
| Lucide React | Latest | Icons |
| react-router-dom | 6+ | Routing |
| date-fns | 3+ | Date formatting |
| uuid | 11+ | ID generation |

## Project Structure

```
src/
  components/
    ui/           16 shared components (GlassCard, Button, Modal, Input, Badge, etc.)
    layout/       5 layout components (AppLayout, Sidebar, Header, GradientBackground, etc.)
    project/      9 tab components (OverviewTab, BoardTab, WikiTab, WorkflowTab, etc.)
    board/        12 JIRA components (SprintBoard, IssueCard, BacklogView, etc.)
    wiki/         8 Confluence components (PageTree, PageEditor, MarkdownRenderer, etc.)
    workflow/     7 canvas components (WorkflowCanvas, WorkflowNode, etc.)
    timeline/     4 timeline components
    decisions/    3 decision components
  pages/          3 pages (Dashboard, Project, 404)
  hooks/          8 custom hooks (useProject, useSearch, useDragAndDrop, etc.)
  contexts/       1 context (ProjectsContext with useReducer)
  utils/          8 utility modules
  data/           4 data files (defaults, sample, templates, node types)
```

## Data Model

Projects are stored in localStorage under `storyflow-projects`. Each project contains:

- **overview** — goals, constraints, tech stack, target audience
- **architecture** — component tree with types and dependencies
- **workflow** — visual node graph with BFS execution engine
- **board** — issues (epics/stories/tasks/bugs), sprints, status columns
- **pages** — nested wiki pages with markdown content and version history
- **timeline** — phases with progress tracking and milestones
- **decisions** — architectural decisions with alternatives and consequences

### Field Conventions by Domain

Each domain uses different fields for parent-child relationships. **Never mix these across domains.**

| Domain | Parent Link Field | Other Required Fields |
|--------|------------------|----------------------|
| **Architecture** components | `parentId` (group node ID or `null`) | `dependencies[]` — always include, even if empty |
| **Board** issues | `epicId` (links issue to parent epic) | `sprintId`, `storyPoints` (NOT `points`) |
| **Wiki** pages | `parentId` (parent page ID or `null`) | — |

**Critical:** Board issues use `epicId` to link to their parent epic — **not** `parentId`. The UI (EpicSidebar, BacklogView) filters on `issue.epicId === epic.id`. Using `parentId` will silently break epic progress counts and grouping.

## Claude CLI Bridge

Claude can read/write project data directly:

1. Export: Projects export as JSON with `{ schemaVersion: 1, exportedAt, project }`
2. Import: Import JSON files via the UI or write to `projects/` directory
3. All project fields are JSON-serializable — no UI-only state

### Claude Workflow
```
User asks to plan a project
  → Claude generates project JSON with all fields populated
  → User opens StoryFlow in browser to review
  → User modifies via UI
  → Claude reads back changes for follow-up work
```

## Key Patterns

- **State:** ProjectsContext (useReducer) → localStorage auto-persist
- **Styling:** Tailwind v4 + custom glassmorphism classes in index.css
- **IDs:** Project IDs are slug-based (`generateProjectId("My App")` → `"my-app"`); internal entity IDs use UUIDs via `generateId()` (crypto.randomUUID)
- **Updates:** useProject hook returns per-field updaters (updateOverview, addIssue, etc.)
- **Animations:** Framer Motion for page transitions, tab switches, layout animations

## Commands

```bash
npm run dev      # Dev server on port 3000
npm run build    # Production build to dist/
npm run preview  # Preview production build
```

