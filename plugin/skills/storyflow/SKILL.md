---
name: StoryFlow Project Management
description: Use when managing project boards, creating or updating issues, planning sprints, tracking progress, or writing wiki documentation in StoryFlow. Activates when the user mentions StoryFlow, project boards, issue tracking, sprint planning, or wiki pages in the context of project management.
version: 4.0.0
---

# StoryFlow Project Management

All interaction happens through the `storyflow` CLI via Bash. Every command supports `--json` for structured output. If StoryFlow is not configured, run `/storyflow:setup`.

## CLI Surface

| Category | Commands |
|----------|----------|
| **Context** | `storyflow context boot` — single-call agent boot (replaces multi-call bootstrap) |
| **Search** | `storyflow search <query>` — cross-entity search (issues, pages, decisions, nodes, components) |
| **Resolve** | `storyflow resolve <type> <ref>` — fuzzy entity resolution (issue, page, sprint, node, component, decision) |
| **Connection** | `storyflow status`, `storyflow config show/set-url/set-token/set-default` |
| **Projects** | `storyflow projects list/show/create/update/delete` |
| **Issues** | `storyflow issues list/show/create/update/done/block/comment/delete/nudge/batch-update/batch-done` |
| **Board** | `storyflow board [project]`, `storyflow hygiene [project]` |
| **Sprints** | `storyflow sprints list/create/update/delete` |
| **Wiki** | `storyflow pages list/show/create/update/delete/templates` (create supports `--icon`) |
| **Decisions** | `storyflow decisions list/show/create/update/delete` |
| **Phases** | `storyflow phases list/create/update/delete` |
| **Milestones** | `storyflow milestones list/create/update/toggle/delete` |
| **Workflow** | `storyflow workflow list/show/create/update/delete/link/unlink` |
| **Architecture** | `storyflow architecture list/show/create/update/delete` |
| **Events** | `storyflow events list/create/respond/cleanup` |
| **Sessions** | `storyflow sessions list/latest/save` (save supports `--work-done --learnings --wiki-pages-updated --issues-created --issues-updated --events-recorded`) |
| **AI Status** | `storyflow ai-status show/set/acknowledge` |
| **Safety** | `storyflow gates`, `storyflow snapshots list/restore`, `storyflow steer "message"` |

## Agent Operating Path

**Session start:** Use `storyflow context boot --json` — returns project state, AI status, gates, directives, board summary, last session, agent wiki pages, and hygiene in one atomic call.

**Finding things:** Use `storyflow search "query" --json` to search across all entity types, or `storyflow resolve <type> <ref> --json` to resolve a fuzzy reference to a canonical ID.

**Batch operations:** Use `storyflow issues batch-done SC-1 SC-2 SC-3` to mark multiple issues Done, or `storyflow issues batch-update --updates '[...]'` for arbitrary batch updates.

**Session end:** Use `storyflow sessions save -s "..." --next-steps "..." --key-decisions "..." --work-done "..." --learnings "..."` — include all fields, not just the summary.

## Data Model

See `references/data-model.md` for complete field reference. Key rules:

- **Issue types**: `epic`, `story`, `task`, `bug` (lowercase)
- **Statuses**: `To Do`, `In Progress`, `Blocked`, `Done` (title-case, exact strings)
- **Priorities**: `critical`, `high`, `medium`, `low`
- **Story points**: Fibonacci only — 1, 2, 3, 5, 8, 13
- **Field names**: `storyPoints` (not `points`), `epicId` (not `parentId`), comment `body` (not `text`)

## Wiki Templates

When creating pages, use `--template <id>`: `blank`, `meeting-notes`, `technical-spec`, `requirements-doc`, `api-documentation`, `retrospective`, `adr`

## The StoryFlow Agent

Board sync is handled by the **storyflow-agent** — an autonomous AI PM dispatched by hooks. See `agents/storyflow-agent.md` for its genesis document and `agents/references/` for operational playbooks.
