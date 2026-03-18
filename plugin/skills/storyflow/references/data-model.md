# StoryFlow Data Model Reference

## Storage

All entities are stored in **normalized SQL tables** (SQLite via sql.js) with foreign keys, indexes, and CASCADE deletes. Each entity type has its own table. The API returns camelCase JSON — the field names below are API-level, not SQL column names.

## Project

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Slug-based ID (e.g. `"my-app"`) |
| `name` | string | Display name |
| `description` | string | Project description |
| `status` | enum | `planning`, `in-progress`, `completed`, `on-hold` |
| `nextIssueNumber` | number | Counter for generating issue keys |
| `createdAt` | ISO string | Creation timestamp |
| `updatedAt` | ISO string | Last modified timestamp |

## Issue

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID | auto | Unique identifier |
| `key` | string | auto | Human-readable key (e.g. `SF-42`) |
| `title` | string | yes | Issue title |
| `type` | enum | yes | `epic`, `story`, `task`, `bug` |
| `status` | enum | yes | `To Do`, `In Progress`, `Blocked`, `Done` |
| `priority` | enum | no | `critical`, `high`, `medium`, `low` |
| `description` | string | no | Markdown description |
| `storyPoints` | number | no | Effort estimate (**NOT** `points`) |
| `epicId` | UUID | no | Parent epic ID (**NOT** `parentId`) |
| `sprintId` | UUID | no | Assigned sprint |
| `assignee` | string | no | Assignee name |
| `labels` | string[] | no | Tags/labels |
| `dependencies` | UUID[] | no | Blocked-by issue IDs |
| `comments` | Comment[] | no | Array of comments |
| `blockedAt` | ISO string | auto | When moved to Blocked |
| `todoAt` | ISO string | auto | When moved to To Do |
| `inProgressAt` | ISO string | auto | When moved to In Progress |
| `doneAt` | ISO string | auto | When moved to Done |
| `createdAt` | ISO string | auto | Creation timestamp |
| `updatedAt` | ISO string | auto | Last modified |

### Comment

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Unique identifier |
| `body` | string | Markdown comment body (**NOT** `text`) |
| `author` | string | `"agent"`, `"system"`, or username |
| `createdAt` | ISO string | When the comment was added |

### Critical Field Rules

- **`epicId`** links an issue to its parent epic — **never use `parentId`** for board issues
- **`storyPoints`** is the correct field — **never use `points`**
- **`status`** values are title-case: `"To Do"`, `"In Progress"`, `"Blocked"`, `"Done"`
- **`Blocked`** means work cannot proceed — always add a comment explaining why
- Comments use `body` field (not `text`) for both create and display

### CLI Flag Mapping (API field → CLI flag)

| API Field | CLI Flag | Notes |
|-----------|----------|-------|
| `epicId` | `--epic` | NOT `--epicId` |
| `storyPoints` | `--points` | NOT `--storyPoints` |
| `sprintId` | `--sprint` | |
| `parentId` (arch) | `--parent` | NOT `--parentId` |
| `dependencies` (arch) | `--deps` | Comma-separated IDs |
| `label` (workflow) | `--title` | NOT `--label` |
| Workflow statuses | `idle`, `running`, `success`, `error` | Different from issue statuses |
| Sprint dates | `--start`, `--end` | NOT `--startDate`, `--endDate` |
| `pages create` | No `--json` support | Returns text confirmation |

## Sprint

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Unique identifier |
| `name` | string | Sprint name |
| `goal` | string | Sprint goal |
| `startDate` | string | Start date (YYYY-MM-DD) |
| `endDate` | string | End date |
| `status` | enum | `planning`, `active`, `completed` |

## Wiki Page

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Unique identifier |
| `title` | string | Page title |
| `content` | string | Markdown content |
| `parentId` | UUID | Parent page for nesting (wiki uses `parentId`) |
| `icon` | string | Emoji icon for the page |

## Decision (ADR)

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Unique identifier |
| `title` | string | Decision title |
| `status` | enum | `proposed`, `accepted`, `deprecated`, `superseded` |
| `context` | string | Why this decision was needed |
| `decision` | string | What was decided |
| `consequences` | string | Impact of the decision |
| `alternatives` | array | Other options considered |
| `createdAt` | ISO string | Creation timestamp |

## Phase (Timeline)

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Unique identifier |
| `name` | string | Phase name |
| `description` | string | Phase description |
| `startDate` | string | Start date (YYYY-MM-DD) |
| `endDate` | string | End date |
| `progress` | number | Completion percentage (0-100) |
| `status` | enum | `upcoming`, `in-progress`, `completed` |
| `color` | string | Hex color for Gantt chart |
| `deliverables` | string[] | List of deliverables |

## Milestone (Timeline)

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Unique identifier |
| `name` | string | Milestone name |
| `date` | string | Target date (YYYY-MM-DD) |
| `completed` | boolean | Whether milestone is reached |
| `phaseId` | UUID | Associated phase (optional) |
| `color` | string | Hex color |

## Workflow Node

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Unique identifier |
| `label` | string | Node label |
| `type` | enum | `task`, `decision`, `milestone`, `start`, `end` |
| `status` | enum | `pending`, `active`, `success`, `failed`, `skipped` |
| `description` | string | Node description |
| `x` | number | Canvas X position |
| `y` | number | Canvas Y position |
| `linkedIssues` | string[] | Linked issue keys |

## Architecture Component

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Unique identifier |
| `name` | string | Component name |
| `type` | enum | `service`, `library`, `database`, `api`, `ui`, `external` |
| `description` | string | Component description |
| `parentId` | UUID | Parent component for nesting |
| `dependencies` | UUID[] | Component dependencies |

## Board Summary (read-only)

| Field | Type | Description |
|-------|------|-------------|
| `projectName` | string | Project name |
| `projectStatus` | string | Project status |
| `issueCount` | number | Total issues (**NOT** `total`) |
| `byStatus` | object | `{ "To Do": n, "In Progress": n, "Blocked": n, "Done": n }` |
| `byType` | object | `{ "epic": n, "story": n, "task": n, "bug": n }` |
| `totalPoints` | number | Total story points |
| `donePoints` | number | Points completed |
| `activeSprint` | object | Active sprint details or null |
| `staleIssues` | Issue[] | Issues stuck "In Progress" with no recent updates |
| `staleCount` | number | Count of stale issues |

## Agent Session

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Session identifier |
| `project_id` | string | Associated project |
| `work_done` | string | Summary of what was accomplished |
| `key_decisions` | string | Important decisions made |
| `next_steps` | string | Recommended actions for next session |
| `issues_created` | number | Count of issues created |
| `issues_updated` | number | Count of issues updated |
| `created_at` | ISO string | Session timestamp |

## Transparency Event

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Event identifier |
| `project_id` | string | Associated project |
| `actor` | string | `"agent"`, `"human"`, or `"system"` |
| `action` | string | What happened (e.g. `"create_issue"`) |
| `entity_type` | string | `"issue"`, `"sprint"`, `"page"`, etc. |
| `entity_id` | string | ID of the affected entity |
| `category` | string | `"mutation"`, `"query"`, `"system"`, `"decision"` |
| `confidence` | number | Agent confidence score (0-1) |
| `reasoning` | string | Why the agent took this action |
| `parent_event_id` | UUID | Causal chain — links to triggering event |
| `metadata` | JSON | Additional context |
| `created_at` | ISO string | Event timestamp |
