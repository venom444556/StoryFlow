# storyflow-cli

Lightweight CLI for [StoryFlow](https://github.com/venom444556/StoryFlow) — AI-native project management from the terminal.

Built for agents. No MCP overhead. No JSON-RPC. Just shell commands that talk directly to the StoryFlow API.

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

## Commands

### Projects

```bash
storyflow-cli projects list              # List all projects
storyflow-cli projects show my-project   # Project details (resolves by name)
storyflow-cli projects create my-app -n "My App"
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
storyflow-cli issues done PRJ-42         # Quick-mark as Done
storyflow-cli issues block PRJ-43 -r "Waiting on API"
storyflow-cli issues comment PRJ-42 -m "Deployed to staging"
```

### Sprints

```bash
storyflow-cli sprints list
storyflow-cli sprints create -n "Sprint 3" -g "Ship auth feature" -s active
```

### Wiki Pages

```bash
storyflow-cli pages list
storyflow-cli pages show <pageId>
storyflow-cli pages create --title "Architecture" -c "# System Design\n..."
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

## Why CLI Over MCP?

StoryFlow originally used an MCP (Model Context Protocol) plugin with 68 tool definitions. The CLI replaces it entirely:

| | MCP Plugin | CLI |
|---|---|---|
| **Lines of code** | 3,071 | ~800 |
| **Dependencies** | MCP SDK + runtime | commander + chalk |
| **Token overhead** | ~6,800 tokens/turn for tool descriptions | 0 |
| **Composability** | Isolated tool calls | Full shell piping |
| **Portability** | Requires Claude Code host | Runs anywhere |
| **Latency** | JSON-RPC round-trip per call | Direct HTTP |

For AI agents, the CLI is a single Bash call instead of 68 individual MCP tool approvals. The agent gets full project management through the same tool it uses for `git` and `npm`.

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
- `STORYFLOW_MCP_TOKEN` — Auth token
- `STORYFLOW_PROJECT` — Default project
- `STORYFLOW_TIMEOUT_MS` — Request timeout (default: 15000)

## Requirements

- Node.js 18+
- A running [StoryFlow](https://github.com/venom444556/StoryFlow) server

## License

MIT
