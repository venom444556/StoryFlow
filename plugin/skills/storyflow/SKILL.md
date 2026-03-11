---
name: StoryFlow Project Management
description: Use when managing project boards, creating or updating issues, planning sprints, tracking progress, or writing wiki documentation in StoryFlow. Activates when the user mentions StoryFlow, project boards, issue tracking, sprint planning, or wiki pages in the context of project management.
version: 3.0.0
---

# StoryFlow Project Management

StoryFlow provides a visual board (like JIRA), wiki documentation (like Confluence), AI transparency (event log, steering, gates), and agent memory (sessions, self-knowledge wiki) — all via the `storyflow` CLI.

## Configuration

StoryFlow must be running and configured. If not set up, run `/storyflow:setup`.
Config stored globally at `~/.config/storyflow/config.json`.

## CLI Commands

All interaction happens through the `storyflow` CLI via Bash. Every command supports `--json` for structured output.

| Category | Commands |
|----------|----------|
| **Connection** | `storyflow status` |
| **Projects** | `storyflow projects list/show/create/update` |
| **Issues** | `storyflow issues list/show/create/update/done/block/comment` |
| **Board** | `storyflow board [project]`, `storyflow hygiene [project]` |
| **Sprints** | `storyflow sprints list/create/update` |
| **Wiki** | `storyflow pages list/show/create/update` |
| **Events** | `storyflow events list` |
| **AI** | `storyflow ai-status`, `storyflow steer "message"` |
| **Safety** | `storyflow gates`, `storyflow snapshots` |

### Quick Examples

```bash
# Board summary
storyflow board --json

# Create a story
storyflow issues create --title "Add login page" --type story --points 5 --priority high --json

# Mark issue done
storyflow issues done SC-42

# List wiki pages
storyflow pages list --json

# Check board health
storyflow hygiene --json
```

### REST API (for operations without CLI commands)

Sessions, event recording, and AI status updates use the REST API directly:

```bash
# Save session
curl -s -X POST http://localhost:3001/api/projects/<pid>/sessions \
  -H 'Content-Type: application/json' -d '{"summary":"...","next_steps":"..."}'

# Set AI status
curl -s -X POST http://localhost:3001/api/projects/<pid>/ai-status \
  -H 'Content-Type: application/json' -d '{"status":"working"}'

# Get last session
curl -s http://localhost:3001/api/projects/<pid>/sessions/latest
```

## Data Model Quick Reference

See `references/data-model.md` for full field details.

- **Issue types**: `epic`, `story`, `task`, `bug` (lowercase)
- **Statuses**: `To Do` -> `In Progress` -> `Blocked` -> `Done` (title-case)
- **Priorities**: `critical`, `high`, `medium`, `low`
- **Key fields**: `epicId` (parent epic), `sprintId` (sprint), `storyPoints` (effort)
- **Story points**: Fibonacci only — 1, 2, 3, 5, 8, 13

## The StoryFlow Agent

Board sync is handled by the **storyflow-agent** — an autonomous AI PM dispatched automatically by hooks. See `agents/storyflow-agent.md` for its genesis document. The agent handles:

1. Feature planning (epics, stories, story points)
2. Board lifecycle sync (hook-driven status updates)
3. Sprint management (creation, metrics, velocity)
4. Wiki & documentation (decisions, agent knowledge)
5. Progress reporting & board hygiene
6. Bug filing (auto-detect from errors/crashes)
7. Git reconciliation (catch missed commits/PRs)
