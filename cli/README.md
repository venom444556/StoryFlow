# storyflow-cli

Lightweight CLI for [StoryFlow](https://github.com/venom444556/StoryFlow) — AI-native project management from the terminal.

Built for agents. Shell commands that talk directly to the StoryFlow API.

## Install

```bash
npm i -g storyflow-cli
```

Or run without installing:

```bash
npx storyflow-cli status
```

## Quick Start

```bash
# Connect to your StoryFlow server
storyflow-cli config set-url http://your-server:3001

# Set a default project (by name — no UUIDs needed)
storyflow-cli config set-default my-project

# Check the board
storyflow-cli board
```

Output:

```
My Project — Board
───────────────────

  To Do                  ████████░░░░░░░░░░░░ 12
  In Progress            ████░░░░░░░░░░░░░░░░ 5
  Blocked                ░░░░░░░░░░░░░░░░░░░░ 1
  Done                   ██████████████░░░░░░ 22
  ────────────────────────────────────────
  Total                  40
  Points                 89/134 (66%)
```

## Commands — 49 Total

### Projects

```bash
storyflow-cli projects list              # List all projects
storyflow-cli projects show my-project   # Project details (resolves by name)
storyflow-cli projects create my-app --name "My App"
storyflow-cli projects update my-app --status in-progress
```

### Board & Hygiene

```bash
storyflow-cli board                      # Board summary (uses default project)
storyflow-cli board my-project           # Specify project by name prefix
storyflow-cli hygiene                    # Detect duplicates, stale issues, orphans
```

### Issues

```bash
storyflow-cli issues list                # All issues
storyflow-cli issues list -s "Blocked"   # Filter by status
storyflow-cli issues list -t bug         # Filter by type
storyflow-cli issues list -q "auth"      # Search by title
storyflow-cli issues show PRJ-42         # Full issue detail
storyflow-cli issues create --title "Fix login" -t bug -p high --points 3
storyflow-cli issues update PRJ-42 -s "In Progress"
storyflow-cli issues update PRJ-42 --epic <epicId>    # Link to epic
storyflow-cli issues done PRJ-42         # Quick-mark as Done
storyflow-cli issues block PRJ-43 -r "Waiting on API"
storyflow-cli issues comment PRJ-42 -m "Deployed to staging"
storyflow-cli issues nudge PRJ-42        # Nudge a stale issue
```

### Sprints

```bash
storyflow-cli sprints list
storyflow-cli sprints create --name "Sprint 3" --start 2026-03-10 --end 2026-03-24 --status active
storyflow-cli sprints update <id> --status completed
```

### Wiki Pages

```bash
storyflow-cli pages list
storyflow-cli pages show <pageId>
storyflow-cli pages create --title "Architecture" -c "# System Design"
storyflow-cli pages create --title "Spec" --template technical-spec
storyflow-cli pages update <pageId> -c "Updated content"
storyflow-cli pages templates            # List available templates
```

### Workflow Canvas

```bash
storyflow-cli workflow list              # List workflow nodes
storyflow-cli workflow show <nodeId>     # Node detail
storyflow-cli workflow create --title "Build API" -t task
storyflow-cli workflow update <nodeId> -s success
storyflow-cli workflow link <nodeId> PRJ-42    # Link issue to node
storyflow-cli workflow unlink <nodeId> PRJ-42
```

### Architecture

```bash
storyflow-cli architecture list          # List components
storyflow-cli architecture show <id>     # Component detail
storyflow-cli architecture create --name "Auth Service" -t service
storyflow-cli architecture create --name "Data Layer" -t library --parent <parentId>
storyflow-cli architecture update <id> --deps <id1>,<id2>
```

### Decisions (ADRs)

```bash
storyflow-cli decisions list
storyflow-cli decisions show <id>
storyflow-cli decisions create --title "Use PostgreSQL" --status proposed
storyflow-cli decisions update <id> --status accepted
```

### Timeline — Phases

```bash
storyflow-cli phases list
storyflow-cli phases create --name "Phase 1" --start 2026-03-01 --end 2026-03-14
storyflow-cli phases update <id> --progress 50
```

### Timeline — Milestones

```bash
storyflow-cli milestones list
storyflow-cli milestones create --name "MVP Ship" --date 2026-03-15
storyflow-cli milestones toggle <id>     # Toggle completion
```

### Events & Transparency

```bash
storyflow-cli events list                # Recent event stream
storyflow-cli events list --actor ai     # Filter by actor
storyflow-cli events list --category board
```

### AI Agent Control

```bash
storyflow-cli ai-status                  # Check if the AI agent is working/idle/blocked
storyflow-cli steer "Focus on the auth feature"           # Send steering directive
storyflow-cli steer "Stop all work" -p critical            # Critical priority
storyflow-cli gates                      # Check pending approval gates
storyflow-cli snapshots                  # List undo snapshots
```

### Sessions

```bash
storyflow-cli sessions list              # List past sessions
storyflow-cli sessions latest            # Most recent session
storyflow-cli sessions save --summary "..." --next-steps "..."
```

### Configuration

```bash
storyflow-cli config show                # Show current config
storyflow-cli config set-url <url>       # Set server URL
storyflow-cli config set-token <token>   # Set auth token
storyflow-cli config set-default <name>  # Set default project
storyflow-cli status                     # Test connection
```

## Smart Project Resolution

No UUIDs required. The CLI resolves projects by name:

```bash
storyflow-cli board my-project           # Exact name match
storyflow-cli board my                   # Prefix match → "My Project"
```

If a prefix matches multiple projects, the CLI lists them and asks you to be more specific.

Set a default project to skip the argument entirely:

```bash
storyflow-cli config set-default my-project
storyflow-cli board                      # Uses default
storyflow-cli issues list -s "Blocked"   # Uses default
```

## JSON Output

Every command supports `--json` for piping to `jq` or scripting:

```bash
storyflow-cli issues list --json | jq '.[].key'
storyflow-cli board --json | jq '.byStatus'
```

## Configuration

Config is stored at `~/.config/storyflow/config.json`:

```json
{
  "url": "http://your-server:3001",
  "token": "your-auth-token",
  "defaultProject": "your-project-id"
}
```

Environment variables override the config file:

- `STORYFLOW_URL` — Server URL
- `STORYFLOW_TOKEN` — Auth token
- `STORYFLOW_PROJECT` — Default project
- `STORYFLOW_TIMEOUT_MS` — Request timeout (default: 15000)

## Requirements

- Node.js 18+
- A running [StoryFlow](https://github.com/venom444556/StoryFlow) server

## License

MIT
