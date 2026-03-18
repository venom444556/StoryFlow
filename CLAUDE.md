# StoryFlow

AI-native project management. The agent runs autonomously — the human monitors, steers, and intervenes only when needed.

## Run

```
npm install && npm run dev    # Express + Vite on http://localhost:3001
npm run lint                  # ESLint
npm run build                 # Production build
npm run test:run              # Vitest
npm run ci                    # Full pipeline: format + lint + typecheck + test + build
```

## Architecture

```
server/
  db.js              SQLite data layer — 12 normalized tables, direct SQL per entity
  app.js             Express REST API
  events.js          Transparency event stream, causal chains (parent_event_id)
  intelligence.js    Steering directives, board hygiene, confidence scoring
  ws.js              WebSocket for real-time updates
src/
  stores/            Entity-specific Zustand stores (issues, sprints, pages, decisions,
                     timeline, workflow, architecture) — server is source of truth
  components/        React UI — board, wiki, workflow canvas, architecture, timeline
  styles/tokens.css  Design tokens (Obsidian dark, Warm Linen light)
cli/                 Agent CLI (storyflow-cli npm package)
plugin/              Claude Code plugin — agent prompt, hooks, skills
```

### Data Model

12 normalized SQL tables with foreign keys, indexes, CASCADE deletes:

**projects** — metadata, status, next_issue_number
**issues** — board items with status timestamps, FK to sprints and self-ref FK for epics
**comments** — FK to issues (extracted from nesting)
**sprints** — planning, active, completed
**pages** — wiki with parent hierarchy (self-ref FK)
**decisions** — architecture decision records
**phases** — timeline phases with progress tracking
**milestones** — timeline milestones with due dates
**workflow_nodes** — canvas nodes with nested children (self-ref FK via parent_node_id)
**workflow_connections** — node-to-node edges
**architecture_components** — system components with tech stack
**architecture_connections** — component dependencies

Plus: events, steering_directives, agent_sessions, snapshots (all separate SQL tables).

## Agent Behavior

### CLI is the interface

All agent interaction with StoryFlow goes through the `storyflow` CLI via Bash. One command = one operation. Never use MCP tools — they don't exist anymore.

```bash
storyflow status                          # Connection check
storyflow board                           # Visual board summary
storyflow issues list --json              # All issues (parseable)
storyflow issues create --title "..." --type story --points 3 --priority medium
storyflow issues done SC-42               # Mark done
storyflow issues block SC-42 -r "reason"  # Mark blocked with reason
storyflow pages show <id>                 # Read wiki page
storyflow sessions latest --json          # Last session context
storyflow steer "message"                 # Steering directive
storyflow ai-status set working           # Signal agent is active
```

Every read command supports `--json`. Smart project resolution — type a name prefix, not a UUID.

### Self-documenting

All project knowledge lives inside StoryFlow: wiki pages, events, sessions. On startup, read wiki pages prefixed with "Agent:" to restore context. Never store agent knowledge in external files.

### Boot sequence

1. `storyflow status` — if offline, stop
2. `storyflow projects list --json` — match project to current repo
3. `storyflow sessions latest --json` — read next_steps from last session
4. Read "Agent:*" wiki pages for persistent context
5. `storyflow gates --json` — check pending approval gates
6. `storyflow ai-status set working`

### Session end

1. `storyflow sessions save --summary "..." --next-steps "..." --key-decisions "..."`
2. Update "Agent:*" wiki pages with new knowledge
3. `storyflow ai-status set idle`

## Conventions

### Issues
- **Types:** epic, story, task, bug (lowercase)
- **Statuses:** "To Do", "In Progress", "Blocked", "Done" (exact title-case strings)
- **Priorities:** critical, high, medium, low
- **Story points:** Fibonacci only — 1, 2, 3, 5, 8, 13
- **Epic naming:** "P0: Foundation", "P1: Core Product" — never "Phase 0:", "Phase 1:"
- **Fields:** `epicId` (not parentId), `storyPoints` (not points)

### CLI flags (API field → CLI flag)
- epicId → `--epic`
- storyPoints → `--points`
- sprintId → `--sprint`
- parentId (arch) → `--parent`
- dependencies (arch) → `--deps` (comma-separated)
- Workflow statuses: `idle`, `running`, `success`, `error` (different from issue statuses)

### Rules
- Always dedup: check existing issues before creating (match by title, case-insensitive)
- Never delete issues — only humans delete
- Always provide confidence (0-1) and reasoning when recording events
- Use `--template` when creating wiki pages that match a template (technical-spec, adr, retrospective)
- When an issue moves to Done, update any linked workflow node to `success`
- Comments use `body` field (not `text`)
- Board summary uses `issueCount` (not `total`)
- Issues list returns `{ issues: [...] }` wrapper (not bare array)

## Safety

- **Gates:** AI mutations on gated entities blocked until human approves
- **Auto-gating:** Confidence < 0.5 → auto-creates pending gate
- **Snapshots:** Auto-snapshot before destructive mutations, 20-cap LRU, per-entity restore
- **Agent pause:** Escalations block all AI writes until human responds
- **Causal chains:** `parent_event_id` links every action to its trigger
