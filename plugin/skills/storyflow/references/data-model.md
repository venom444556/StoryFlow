# StoryFlow Data Model Reference

## Project

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Slug-based ID (e.g. `"my-app"`) |
| `name` | string | Display name |
| `description` | string | Project description |
| `status` | enum | `planning`, `in-progress`, `completed`, `on-hold` |
| `overview` | object | Goals, constraints, tech stack, target audience |
| `board` | object | Contains `issues[]`, `sprints[]`, `nextIssueNumber` |
| `pages` | array | Wiki pages |
| `timeline` | object | Contains `phases[]`, `milestones[]` |
| `decisions` | array | Architecture decision records |
| `architecture` | object | Component tree with dependencies |
| `workflow` | object | Visual node graph |
| `createdAt` | ISO string | Creation timestamp |
| `updatedAt` | ISO string | Last modified timestamp |

## Issue

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID | auto | Unique identifier |
| `key` | string | auto | Human-readable key (e.g. `SF-42`) |
| `title` | string | yes | Issue title |
| `type` | enum | yes | `epic`, `story`, `task`, `bug` |
| `status` | enum | yes | `To Do`, `In Progress`, `Done` |
| `priority` | enum | no | `critical`, `high`, `medium`, `low` |
| `description` | string | no | Markdown description |
| `storyPoints` | number | no | Effort estimate (**NOT** `points`) |
| `epicId` | UUID | no | Parent epic ID (**NOT** `parentId`) |
| `sprintId` | UUID | no | Assigned sprint |
| `assignee` | string | no | Assignee name |
| `labels` | string[] | no | Tags/labels |
| `dependencies` | UUID[] | no | Blocked-by issue IDs |
| `todoAt` | ISO string | auto | When moved to To Do |
| `inProgressAt` | ISO string | auto | When moved to In Progress |
| `doneAt` | ISO string | auto | When moved to Done |
| `createdAt` | ISO string | auto | Creation timestamp |
| `updatedAt` | ISO string | auto | Last modified |

### Critical Field Rules

- **`epicId`** links an issue to its parent epic — **never use `parentId`** for board issues
- **`storyPoints`** is the correct field — **never use `points`**
- **`status`** values are title-case: `"To Do"`, `"In Progress"`, `"Done"`

## Sprint

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Unique identifier |
| `name` | string | Sprint name |
| `goal` | string | Sprint goal |
| `startDate` | string | Start date (ISO or YYYY-MM-DD) |
| `endDate` | string | End date |
| `status` | enum | `planning`, `active`, `completed` |

## Wiki Page

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Unique identifier |
| `title` | string | Page title |
| `content` | string | Markdown content |
| `parentId` | UUID | Parent page for nesting (wiki uses `parentId`) |
| `status` | enum | `draft`, `published` |

## Board Summary (read-only)

| Field | Type | Description |
|-------|------|-------------|
| `projectName` | string | Project name |
| `projectStatus` | string | Project status |
| `issueCount` | number | Total issues |
| `byStatus` | object | `{ "To Do": n, "In Progress": n, "Done": n }` |
| `byType` | object | `{ "epic": n, "story": n, "task": n, "bug": n }` |
| `totalPoints` | number | Total story points |
| `donePoints` | number | Points completed |
| `sprintCount` | number | Total sprints |
| `activeSprint` | object | Active sprint details or null |
