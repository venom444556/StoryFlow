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

### Delegation model — daemon + push

StoryFlow PM work runs in two layers. Neither layer nags Claude or injects prompts mid-turn.

**Background daemon (`plugin/daemon/storyflowd.mjs`):** Long-running Node process launched silently on SessionStart. Consumes signals written by hooks, watches git activity, and performs deterministic PM work autonomously via the storyflow CLI: auto-closes issues referenced in commits, tracks file edits for session summaries, refreshes boot context, saves a templated session record on idle timeout or SIGTERM. The daemon never calls Claude and never injects prompts. Logs to `/tmp/storyflow/daemon.log`.

**Hooks (signal producers only):** SessionStart launches the daemon and writes a `session-start` signal; PostToolUse Edit|Write writes a `file-edit` signal; Stop writes a `turn-stop` signal. The only non-signal hooks that remain are `pre-commit-gate.sh` (blocks commits with no In Progress issue — real safety gate, not a nag) and `post-commit-sync.sh` (auto-closes issues referenced in commit messages with immediate feedback). Hooks never inject prompts, never gate Stop, never run the storyflow-agent.

**Claude's responsibility (push):** When you see work happening that needs reasoning — writing real session summaries, creating stories with context, updating wiki pages, drafting decisions — dispatch the storyflow-agent. The daemon handles the mechanical layer; the subagent handles the reasoning layer. Don't do PM work yourself inline; delegate to the subagent when it matters.

### CLI is the interface

All agent interaction with StoryFlow goes through the `storyflow` CLI via Bash. One command = one operation. Never use MCP tools — they don't exist anymore.

```bash
storyflow context boot --json             # Single-call agent boot (preferred)
storyflow search "auth" --json            # Cross-entity search
storyflow resolve issue "SC-42" --json    # Fuzzy entity resolution
storyflow status                          # Connection check
storyflow board                           # Visual board summary
storyflow issues list --json              # All issues (parseable)
storyflow issues create --title "..." --type story --points 3 --priority medium
storyflow issues done SC-42               # Mark done
storyflow issues batch-done SC-42 SC-43   # Mark multiple done
storyflow issues block SC-42 -r "reason"  # Mark blocked with reason
storyflow pages show <id>                 # Read wiki page
storyflow pages create --title "..." --icon "pencil"  # Create with icon
storyflow pages audit --json             # Missing/stale core wiki pages
storyflow pages ensure-core              # Create required core pages
storyflow phases hot-wash generate <phase-ref>   # Generate phase hot wash
storyflow phases hot-wash show <phase-ref>       # View hot wash report
storyflow phases hot-wash finalize <phase-ref>   # Lock as final
storyflow phases hot-wash lessons                # Project-level lessons learned rollup
storyflow sessions latest --json          # Last session context
storyflow steer "message"                 # Steering directive
storyflow ai-status set working           # Signal agent is active
```

Every read command supports `--json`. Smart project resolution — type a name prefix, not a UUID.

### Self-documenting

All project knowledge lives inside StoryFlow: wiki pages, events, sessions. On startup, read wiki pages prefixed with "Agent:" to restore context. Never store agent knowledge in external files.

### Boot sequence

1. `storyflow status` — if offline, stop
2. `storyflow context boot --json` — single atomic call returning project state, AI status, gates, directives, board summary, last session, agent wiki pages, wiki audit, lessons learned rollup, and hygiene
3. `storyflow ai-status set working`

The session-boot hook handles this automatically. If `context boot` fails, fall back to individual calls.

### Session end

1. `storyflow sessions save --summary "..." --next-steps "..." --key-decisions "..." --work-done "..." --learnings "..."` — include all applicable fields
2. Reconcile board: `storyflow issues batch-done <key1> <key2>` for completed work
3. If any phase was completed this session, check hot wash: `storyflow phases hot-wash generate <phase-ref>`
4. Review project-level lessons learned when hot washes changed: `storyflow phases hot-wash lessons --json`
5. Run `storyflow pages audit --json`
6. If required core pages are missing, run `storyflow pages ensure-core`
7. Update stale or impacted wiki pages in the same session as the change
8. Update "Agent:*" wiki pages with new knowledge
9. `storyflow ai-status set idle`

### Finding things

- `storyflow search "query" --json` — cross-entity search (issues, pages, decisions, nodes, components)
- `storyflow resolve issue "SC-42" --json` — fuzzy resolution by key, title prefix, or UUID

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
- Treat wiki freshness as a real operating responsibility, not a cleanup chore. Missing or stale core pages are agent failures.
- When an issue moves to Done, update any linked workflow node to `success`
- Comments use `body` field (not `text`)
- Board summary uses `issueCount` (not `total`)
- Issues list returns `{ issues: [...] }` wrapper (not bare array)
- **StoryFlow operations belong to the StoryFlow agent.** Wiki pages, board updates, session saves, sprint management, and all project management tasks must be dispatched to the storyflow-agent — not executed directly by the main Claude instance. Claude's job is engineering. The agent's job is PM. Don't do the agent's work.
- **All StoryFlow data operations go through the CLI.** Never write JSON, manually construct API calls, or build workarounds for what the CLI already does. If the CLI can't do it, that's a capability gap to fix — not a reason to work around it.

## Safety

- **Gates:** AI mutations on gated entities blocked until human approves
- **Auto-gating:** Confidence < 0.5 → auto-creates pending gate
- **Snapshots:** Auto-snapshot before destructive mutations, 20-cap LRU, per-entity restore
- **Agent pause:** Escalations block all AI writes until human responds
- **Causal chains:** `parent_event_id` links every action to its trigger
