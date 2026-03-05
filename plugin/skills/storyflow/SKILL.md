---
name: StoryFlow Project Management
description: Use when managing project boards, creating or updating issues, planning sprints, tracking progress, or writing wiki documentation in StoryFlow. Activates when the user mentions StoryFlow, project boards, issue tracking, sprint planning, or wiki pages in the context of project management.
version: 2.0.0
---

# StoryFlow Project Management

Use StoryFlow to plan, track, and manage coding projects. StoryFlow provides a visual board (like JIRA), wiki documentation (like Confluence), AI transparency (event log, steering, gates), and agent memory (sessions, self-knowledge wiki) — all accessible via MCP tools.

## When to Use

- **Starting a new feature**: Create epics and stories in StoryFlow to plan the work
- **During development**: Update issue statuses, add comments, track progress
- **After completing work**: Mark issues as Done, update sprint progress
- **Documenting decisions**: Add architecture decisions, create wiki pages
- **Planning sprints**: Create sprints, assign issues, set story points
- **Reviewing AI activity**: Query events, check gates, review steering inputs
- **Cross-session continuity**: Save/restore session summaries, read agent wiki pages

## Configuration

StoryFlow must be running and configured. If not set up, run `/storyflow:setup`.

Configuration is stored globally at `~/.config/storyflow/config.json` and persists across all Claude Code projects.

## Available MCP Tools (37)

### Core — Projects & Connection

| Tool | Purpose |
|------|---------|
| `storyflow_check_connection` | Health check — verify server is reachable |
| `storyflow_list_projects` | List all projects |
| `storyflow_get_project` | Get project details |
| `storyflow_create_project` | Create a new project |
| `storyflow_update_project` | Update project fields |
| `storyflow_advance_phase` | Advance project phase (planning → in-progress → completed) |

### Issues

| Tool | Purpose |
|------|---------|
| `storyflow_list_issues` | List/filter issues (supports `status`, `type`, `priority`, `sprint_id` filters) |
| `storyflow_create_issue` | Create an issue (epic/story/task/bug) |
| `storyflow_update_issue` | Update issue fields by `issue_id` or `issue_key` |
| `storyflow_delete_issue` | Delete issue by `issue_id` or `issue_key` |
| `storyflow_batch_update_issues` | Bulk-update up to 50 issues in one call |
| `storyflow_add_comment` | Add comment to issue by `issue_id` or `issue_key` |
| `storyflow_nudge_issue` | Reset staleness timestamp on an issue |

### Sprints

| Tool | Purpose |
|------|---------|
| `storyflow_list_sprints` | List all sprints |
| `storyflow_create_sprint` | Create a sprint |
| `storyflow_update_sprint` | Update sprint fields (name, goal, status, dates) |
| `storyflow_delete_sprint` | Delete a sprint |
| `storyflow_sprint_metrics` | Velocity, cycle time, lead time, throughput, scope creep analysis |

### Board

| Tool | Purpose |
|------|---------|
| `storyflow_get_board_summary` | Board overview — counts by status (incl. Blocked), stale issues, total points |
| `storyflow_run_hygiene` | Detect stale/orphan/duplicate/unestimated issues + optional auto-fix |

### Wiki

| Tool | Purpose |
|------|---------|
| `storyflow_list_pages` | List wiki pages (id, title, parentId, updatedAt) |
| `storyflow_get_page` | Get full wiki page content by page ID |
| `storyflow_create_page` | Create a wiki page |
| `storyflow_update_page` | Update a wiki page |
| `storyflow_delete_page` | Delete a wiki page |

### Agent Memory — Sessions

| Tool | Purpose |
|------|---------|
| `storyflow_save_session_summary` | Save end-of-session summary for cross-session memory |
| `storyflow_get_last_session` | Retrieve most recent session summary |
| `storyflow_list_sessions` | List recent sessions (with limit param) |

### AI Transparency — Events & Steering

| Tool | Purpose |
|------|---------|
| `storyflow_record_event` | Record a transparency event |
| `storyflow_query_events` | Query events with filters (actor, category, entity_type, limit) |
| `storyflow_update_ai_status` | Set AI status (working/idle/blocked) |
| `storyflow_get_steering_inputs` | Check for human directives (optional `consume: true`) |
| `storyflow_acknowledge_directive` | Acknowledge a steering directive |
| `storyflow_respond_to_human` | Respond to a human escalation event |
| `storyflow_check_gates` | Check approval gates (pending/approved/rejected) |
| `storyflow_escalate` | Escalate to human — sets AI to blocked, records event |

### Git Integration

| Tool | Purpose |
|------|---------|
| `storyflow_sync_from_git` | Inspect local git repo, cross-reference commits with board issues |

## Workflow: Planning a Feature

1. **Check for existing project**: `storyflow_list_projects`
2. **Create project if needed**: `storyflow_create_project`
3. **Create an epic** for the feature: `storyflow_create_issue` with `type: "epic"`
4. **Break into stories/tasks**: Create child issues with `epic_id` set to the epic
5. **Assign to sprint**: Set `sprint_id` on each issue
6. **Track progress**: Update `status` as work progresses
7. **Add comments**: Leave context on issues via `storyflow_add_comment`

## The StoryFlow Agent — Autonomous AI PM

StoryFlow includes a **storyflow-agent** — an autonomous AI project manager that keeps the board in sync with your actual work. You don't need to speak PM jargon; the agent interprets casual developer language into professional PM structure.

### What the Agent Does

| You say | Agent does |
|---------|-----------|
| "let's work on auth" | Creates epic + stories, starts sprint, assigns issues |
| "I finished the login page" | Moves issue to Done, checks sprint progress |
| "what's left?" | Pulls board summary, reports burndown |
| "we decided to use JWT" | Creates architecture decision wiki page |
| "the login crashes on empty email" | Files a bug issue with reproduction steps |
| "this is blocked on the API" | Sets status to Blocked, adds comment explaining why |
| *(test failure or error)* | Creates bug issue automatically |
| *(commits code)* | Matches commit to issues, marks Done |
| *(session starting)* | Syncs from git, restores context from last session |
| *(session ending)* | Reconciles entire board, saves session summary, flags drift |

### Agent Capabilities

1. **Feature Planning** — Epics, stories, tasks, story points, priorities, acceptance criteria
2. **Board Lifecycle Sync** — Automatic status updates from hooks (plan approved, todos changed, commits, session end)
3. **Sprint Management** — Auto-create sprints, assign issues, close completed sprints, velocity metrics
4. **Wiki & Documentation** — Architecture decisions, API docs, retro notes, agent self-knowledge pages
5. **Progress Reporting** — Board summary, burndown, blocked items, "what's next?", event history
6. **Board Hygiene** — Duplicate detection, stale issue alerts, orphan cleanup, batch fixes
7. **Bug & Issue Reporting** — Automatically files bugs when errors, crashes, or test failures are encountered
8. **Git Reconciliation** — Sync from git to catch commits and PRs from outside StoryFlow-aware sessions
9. **Issue Comments** — Leave contextual notes on issues like a PM commenting in Jira

### Development Cadence (Closed Loop)

The board stays in sync automatically via plugin hooks that dispatch the storyflow-agent:

```
Plan → Plan Approved → Board Updated (In Progress) → Work Executed → Work Complete → Board Updated (Done)
```

| Phase | Trigger | Agent Action |
|-------|---------|--------------|
| Plan approved | `ExitPlanMode` hook dispatches agent | Creates issues from plan, sets **In Progress** |
| Todos updated | `TodoWrite` hook dispatches agent | Syncs new/changed todos as issues |
| Code committed | `Bash` hook dispatches agent | Completed issues → **Done** |
| Markdown written | `Write` hook dispatches agent | Syncs .md content to wiki if relevant |
| Tests pass | `Bash` hook dispatches agent | Nudges In Progress issues with milestone |
| PR created | `Bash` hook dispatches agent | Links issues, updates statuses |
| Session starting | `SessionStart` hook dispatches agent | Syncs from git, restores context |
| Session ending | `Stop` hook dispatches agent | Full reconciliation sweep, saves session |

**You do not need to remember to update the board** — the hooks dispatch the agent automatically. If StoryFlow is unreachable, the agent skips silently and never blocks your workflow.

### AI Transparency

StoryFlow v2 provides full visibility into agent behavior:

- **Event Log** — Every agent action is recorded as a transparency event (`storyflow_record_event` / `storyflow_query_events`)
- **AI Status** — Real-time status indicator: working, idle, or blocked (`storyflow_update_ai_status`)
- **Steering Directives** — Humans can inject directives the agent picks up mid-session (`storyflow_get_steering_inputs`)
- **Approval Gates** — Critical actions require human approval before proceeding (`storyflow_check_gates`)
- **Escalation** — Agent can flag uncertainty and pause for human input (`storyflow_escalate`)
- **Confidence Scores** — Every mutation includes confidence (0-1) and reasoning

### Agent Memory

The agent maintains cross-session continuity:

- **Session Summaries** — End-of-session snapshots: what was done, key decisions, next steps
- **Self-Knowledge Wiki** — Agent-maintained wiki pages prefixed with "Agent:" (Architecture, Conventions, Tech Debt, Goals)
- **Bootstrap Protocol** — On session start, reads last session + wiki pages to restore full context

### Manual Operations

You can also invoke the agent directly:

- "sync the board" — triggers a full reconciliation
- "create an epic for user auth" — plans and creates issues
- "what's our sprint progress?" — pulls a summary report
- "document the API decisions" — writes wiki pages
- "the search is broken" — files a bug issue with context from the session
- "show me what the agent has been doing" — queries the event log

## Data Model Quick Reference

See `references/data-model.md` for full field details.

### Issue Types
- **epic** — Large feature container (other issues link to it via `epicId`)
- **story** — User-facing feature
- **task** — Technical/internal work
- **bug** — Defect to fix

### Statuses
`To Do` -> `In Progress` -> `Blocked` -> `Done`

### Priorities
`critical` | `high` | `medium` | `low`

### Key Fields
- `epicId` — Links issue to parent epic (NOT `parentId`)
- `sprintId` — Assigns issue to a sprint
- `storyPoints` — Effort estimate (NOT `points`)
- `labels` — Array of string tags
- `comments` — Array of comment objects (added via `storyflow_add_comment`)
