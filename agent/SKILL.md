# StoryFlow Agent Skills

All interaction through `storyflow` CLI. Every command supports `--json`.

## Core Primitives

| Command | Purpose |
|---------|---------|
| `storyflow context boot --json` | Single-call agent boot |
| `storyflow search <query>` | Cross-entity search |
| `storyflow resolve <type> <ref>` | Fuzzy entity resolution |
| `storyflow issues batch-done <keys>` | Mark multiple issues Done |
| `storyflow sessions save ...` | Save session with all fields |
| `storyflow phases hot-wash generate` | Generate phase retrospective |
| `storyflow pages audit --json` | Check wiki completeness |
| `storyflow agent doctor --json` | Self-diagnostics |

## Entity Types

Issues: epic, story, task, bug | Statuses: To Do, In Progress, Blocked, Done
Priorities: critical, high, medium, low | Points: Fibonacci (1,2,3,5,8,13)
Fields: `storyPoints` (not points), `epicId` (not parentId), comment `body` (not text)
