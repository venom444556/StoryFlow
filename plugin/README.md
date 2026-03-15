# StoryFlow Plugin for Claude Code

Integrate Claude Code with [StoryFlow](https://github.com/venom444556/StoryFlow) project management. Automatic board sync, sprint management, wiki docs, and progress tracking — driven by hooks and the storyflow-agent.

## Prerequisites

- [StoryFlow](https://github.com/venom444556/StoryFlow) server running locally (default: `http://localhost:3001`)
- [storyflow-cli](https://www.npmjs.com/package/storyflow-cli) installed (`npm i -g storyflow-cli`)
- Claude Code CLI installed

## Installation

### From the cloned repo

```bash
claude plugin add ./plugin
```

### Reference directly (development)

```bash
claude --plugin-dir /path/to/StoryFlow/plugin
```

## Setup

Configure the CLI to point at your StoryFlow server:

```bash
storyflow-cli config set-url http://localhost:3001
storyflow-cli config set-default my-project
storyflow-cli status   # Verify connection
```

## Quick Start

Once installed and configured:

```
/storyflow:board              # View your project board
/storyflow:open               # Open StoryFlow UI in your browser
/storyflow:sync               # Check connectivity

# Or just talk to Claude naturally:
"Create an epic for user authentication with 3 stories"
"Move issue SF-12 to In Progress"
"Create a wiki page documenting the API endpoints"
```

## Commands

| Command | Description |
|---------|-------------|
| `/storyflow:setup` | Configure StoryFlow URL |
| `/storyflow:open [project]` | Open StoryFlow UI in browser |
| `/storyflow:sync` | Check connectivity status |
| `/storyflow:board [project]` | Show board summary |

## Automatic Board Sync (Hooks + Agent)

StoryFlow includes plugin hooks that dispatch the **storyflow-agent** to keep the board in sync with your actual work — no manual updates needed:

| Hook | Fires When | Agent Action |
|------|-----------|--------------|
| **PostToolUse** → `ExitPlanMode` | Plan is approved | Creates issues from plan, sets **In Progress** |
| **PostToolUse** → `Bash` | `git commit` detected | Completed issues move to **Done** |
| **PostToolUse** → `Write` | Markdown file written | Syncs to StoryFlow wiki if applicable |
| **SessionStart** | Session begins | Restores context from last session |
| **Stop** | Session is ending | Full reconciliation — fixes stale statuses |

The storyflow-agent communicates with StoryFlow exclusively via the `storyflow` CLI. All operations go through shell commands — `storyflow board`, `storyflow issues create`, etc.

## Agent

- **storyflow-agent** — Autonomous AI project manager. Interprets casual developer language into professional PM structure — planning features, syncing the board, managing sprints, writing wiki docs, filing bugs, and reporting progress. Dispatched automatically by hooks or invoked manually ("plan auth", "what's left?", "the login is broken", "sync the board").

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `STORYFLOW_URL` | `http://localhost:3001` | StoryFlow server URL |
| `STORYFLOW_TOKEN` | -- | Optional auth token |
| `STORYFLOW_TIMEOUT_MS` | `15000` | Request timeout in ms |

### Config File

`~/.config/storyflow/config.json`:

```json
{
  "url": "http://localhost:3001",
  "token": "your-token",
  "defaultProject": "your-project-name"
}
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Cannot reach StoryFlow" | Make sure StoryFlow is running: `npm run dev:full` |
| CLI not found | Run `npm i -g storyflow-cli` or use `npx storyflow-cli` |
| Permission denied | Check that Node.js 18+ is installed and accessible |
| Agent not syncing | Check `storyflow status` — server must be reachable |

## License

Apache-2.0
