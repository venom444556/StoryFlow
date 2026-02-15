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
- **IDs:** UUIDs via crypto.randomUUID()
- **Updates:** useProject hook returns per-field updaters (updateOverview, addIssue, etc.)
- **Animations:** Framer Motion for page transitions, tab switches, layout animations

## Commands

```bash
npm run dev      # Dev server on port 3000
npm run build    # Production build to dist/
npm run preview  # Preview production build
```

---

## Claude Skills System

This project includes a governance framework of 8 specialized skills that activate automatically during development work. Skills are located in `/skills/` and define Claude's behavior for different aspects of software development.

### Core Execution Engine

| Skill | Purpose | Activation |
|-------|---------|------------|
| **CAOS** | Claude Agentic Operating System — 8-step execution loop with Planner, Executor, Critic, Validator roles. Production-grade SDLC enforcement. | Auto-activates for any code writing, feature building, or system modification |
| **StoryFlow Tracker** | Enforces mandatory tracker workflow. Every piece of work MUST be in the tracker. | Auto-triggers before/after code execution |

### Quality & Governance

| Skill | Purpose | Activation |
|-------|---------|------------|
| **Quality Control** | SDLC enforcement, security validation, production readiness checks | Via CAOS Validator role |
| **On Brand** | Enforce consistent naming, tone, and design tokens | During feature implementation, code reviews |
| **Agent Safety Controls** | Circuit breakers, kill switches, version rollback for autonomous agents | When building agentic systems with autonomous execution |

### Strategic & Design

| Skill | Purpose | Activation |
|-------|---------|------------|
| **Vibe Check** | Production-grade UI/UX design matching Vibecode, Bevel, UX Pilot quality | When designing features, screens, or applications |
| **Secret Sauce** | Define strategic differentiation — unique wedge, sticky loop, defensibility | During product planning and feature prioritization |

### Efficiency & Cost

| Skill | Purpose | Activation |
|-------|---------|------------|
| **Work Smarter Not Harder** | Library recommendations with quality gates, automation opportunities, MVP slicing | During planning when choosing implementation approaches |
| **Penny Pincher** | Cost optimization — free tier maximization, environment-aware spending | During architecture decisions with cost implications |

### The CAOS 8-Step Execution Loop

Every code change follows this loop:

```
0. CONTEXT RESTORATION — Load StoryFlow context (previous executions, decisions, constraints)
1. DEFINE OBJECTIVE — Restate goal, identify success criteria
2. TASK DECOMPOSITION — Break into ordered sub-tasks with dependency graph
3. EXECUTION PLAN — Choose approach, estimate cost, get approval
4. EXECUTE — Complete tasks, track progress, create rollback points
5. EVALUATE (Critic) — Review output, generate alternatives, identify risks
6. IMPROVE ONCE — Apply feedback, security scan, performance benchmark
7. VALIDATE — SDLC checklist, quality gates, approval or blocker
```

### StoryFlow Tracker Workflow

The mandatory 6-step workflow for any coding task:

```
1. Plan First → Enter plan mode, explore codebase
2. Get Approval → Present plan, wait for user approval
3. Update Tracker BEFORE → Add board issue, workflow task, update timeline
4. Execute Work → Write code, implement feature
5. Update Tracker AFTER → Mark complete, update progress, add decisions
6. Verify Build → Run build command, must pass clean
```

### Skill Invocation

Skills activate automatically based on context. Manual invocation:
- `/storyflow-tracker` or `/update-tracker` — Run full tracker update
- CAOS activates with: "execute", "CAOS mode", "systematic approach", "plan and build"
- Exit CAOS with: "exit CAOS mode", "chat mode"

### Skill Hierarchy

```
CAOS (Supreme - Operating System)
├── Executor (Primary agent)
│   ├── Vibe Check (design)
│   ├── Penny Pincher (cost)
│   ├── Work Smarter Not Harder (efficiency)
│   ├── Agent Safety Controls (safety)
│   ├── On Brand (consistency)
│   └── Secret Sauce (strategy)
├── Critic (Anti-Groupthink, Devil's Advocate)
├── Validator (Quality Control, No BS)
└── StoryFlow Tracker (Documentation)
