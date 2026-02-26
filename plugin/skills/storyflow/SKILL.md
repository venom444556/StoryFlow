---
name: StoryFlow Project Management
description: Use when managing project boards, creating or updating issues, planning sprints, tracking progress, or writing wiki documentation in StoryFlow. Activates when the user mentions StoryFlow, project boards, issue tracking, sprint planning, or wiki pages in the context of project management.
version: 1.0.0
---

# StoryFlow Project Management

Use StoryFlow to plan, track, and manage coding projects. StoryFlow provides a visual board (like JIRA), wiki documentation (like Confluence), and more — all accessible via MCP tools.

## When to Use

- **Starting a new feature**: Create epics and stories in StoryFlow to plan the work
- **During development**: Update issue statuses, add notes, track progress
- **After completing work**: Mark issues as Done, update sprint progress
- **Documenting decisions**: Add architecture decisions, create wiki pages
- **Planning sprints**: Create sprints, assign issues, set story points

## Configuration

StoryFlow must be running and configured. If not set up, run `/storyflow:setup`.

Configuration is stored globally at `~/.config/storyflow/config.json` and persists across all Claude Code projects.

## Available MCP Tools

| Tool | Purpose |
|------|---------|
| `storyflow_list_projects` | List all projects |
| `storyflow_get_project` | Get full project data |
| `storyflow_create_project` | Create new project |
| `storyflow_update_project` | Update project fields |
| `storyflow_list_issues` | List/filter issues |
| `storyflow_create_issue` | Create issue (epic/story/task/bug) |
| `storyflow_update_issue` | Update issue fields |
| `storyflow_delete_issue` | Delete issue |
| `storyflow_get_board_summary` | Board overview with counts and progress |
| `storyflow_list_sprints` | List sprints |
| `storyflow_create_sprint` | Create sprint |
| `storyflow_delete_sprint` | Delete sprint |
| `storyflow_list_pages` | List wiki pages |
| `storyflow_create_page` | Create wiki page |
| `storyflow_update_page` | Update page content |
| `storyflow_delete_page` | Delete wiki page |
| `storyflow_check_connection` | Verify connectivity |

## Workflow: Planning a Feature

1. **Check for existing project**: `storyflow_list_projects`
2. **Create project if needed**: `storyflow_create_project`
3. **Create an epic** for the feature: `storyflow_create_issue` with `type: "epic"`
4. **Break into stories/tasks**: Create child issues with `epic_id` set to the epic
5. **Assign to sprint**: Set `sprint_id` on each issue
6. **Track progress**: Update `status` as work progresses

## Development Cadence (Closed Loop)

StoryFlow enforces a board-sync cadence via plugin hooks. The board stays in sync automatically:

```
Plan → Plan Approved → Board Updated (In Progress) → Work Executed → Work Complete → Board Updated (Done)
```

| Phase | Trigger | Board Action |
|-------|---------|--------------|
| Plan approved | `ExitPlanMode` hook fires | Creates issues from plan, sets **In Progress** |
| Todos updated | `TodoWrite` hook fires | Syncs new/changed todos as issues |
| Code committed | `Bash` hook detects `git commit` | Completed issues → **Done** |
| Session ending | `Stop` hook fires | Reconcile all issues, create any missing |

**You do not need to remember to update the board** — the hooks will remind you. When prompted by a hook, use the MCP tools to update issue statuses.

### Manual sync during development

If working without the hooks (or need a mid-session sync):

1. **Find your issue**: `storyflow_list_issues` with status filter
2. **Move to In Progress**: `storyflow_update_issue` with `status: "In Progress"`
3. **Add notes**: Update the issue description with implementation details
4. **Mark Done**: `storyflow_update_issue` with `status: "Done"`

## Data Model Quick Reference

See `references/data-model.md` for full field details.

### Issue Types
- **epic** — Large feature container (other issues link to it via `epicId`)
- **story** — User-facing feature
- **task** — Technical/internal work
- **bug** — Defect to fix

### Statuses
`To Do` -> `In Progress` -> `Done`

### Priorities
`critical` | `high` | `medium` | `low`

### Key Fields
- `epicId` — Links issue to parent epic (NOT `parentId`)
- `sprintId` — Assigns issue to a sprint
- `storyPoints` — Effort estimate (NOT `points`)
- `labels` — Array of string tags
