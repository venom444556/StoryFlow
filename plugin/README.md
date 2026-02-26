# StoryFlow Plugin for Claude Code

Integrate Claude Code with [StoryFlow](https://github.com/venom444556/StoryFlow) project management. Create issues, track sprints, update boards, and manage wiki docs from any codebase.

## Prerequisites

- [StoryFlow](https://github.com/venom444556/StoryFlow) server running locally (default: `http://localhost:3001`)
- Claude Code CLI installed
- Node.js 18+

## Security & Trust

During installation, Claude Code will display this warning:

> **"This plugin includes local MCP servers — Installing will grant access to everything on your computer."**

**This is safe to accept.** The warning is a standard Claude Code notice that appears for every plugin with an MCP server. Here's what the StoryFlow MCP server actually does and does not do:

| | Details |
|---|---|
| **Does** | Make HTTP requests to your local StoryFlow server (`localhost:3001`) |
| **Does not** | Access your filesystem, run shell commands, or connect to external services |
| **Does not** | Send data anywhere outside your machine |
| **Does not** | Require internet access |

The MCP server is two small files (`server/index.js` and `server/storyflow-client.js`) totaling ~400 lines of JavaScript. The source is fully auditable, open-source under Apache-2.0, and contains no obfuscation.

Click **Continue** to install.

## Installation

### Option 1: From the cloned repo

If you've cloned the StoryFlow repository:

```bash
# 1. Install MCP server dependencies
cd plugin/server && npm install && cd ../..

# 2. Add the plugin to Claude Code
claude plugin add ./plugin
```

### Option 2: From the plugin zip

If you downloaded `plugin.zip` from a release:

```bash
# 1. Unzip
unzip plugin.zip

# 2. Install MCP server dependencies
cd plugin/server && npm install && cd ../..

# 3. Add the plugin to Claude Code
claude plugin add ./plugin
```

### Option 3: Reference directly (development)

```bash
claude --plugin-dir /path/to/StoryFlow/plugin
```

## Setup

After installation, configure your StoryFlow URL inside a Claude Code session:

```
/storyflow:setup
```

This tests the connection and saves the URL to `~/.config/storyflow/config.json`, which persists across all future sessions.

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

## MCP Tools (17)

The plugin provides full CRUD access to all StoryFlow resources:

| Category | Tools |
|----------|-------|
| **Projects** | list, get, create, update |
| **Issues** | list, create, update, delete |
| **Sprints** | list, create, delete |
| **Pages** | list, create, update, delete |
| **Utilities** | board-summary, check-connection |

## Automatic Board Sync (Hooks)

StoryFlow includes plugin hooks that keep the board in sync with your actual work — no manual updates needed:

| Hook | Fires When | Board Action |
|------|-----------|--------------|
| **PostToolUse** → `ExitPlanMode` | Plan is approved | Creates issues from plan, sets **In Progress** |
| **PostToolUse** → `TodoWrite` | Todos created/updated | Syncs new todos as issues, matches status changes |
| **PostToolUse** → `Bash` | `git commit` detected | Completed issues move to **Done** |
| **Stop** | Session is ending | Reconciles all issues, creates missing ones |

The cadence is: **Plan → Approved → Board updated → Work done → Commit → Board updated → Session ends → Final reconciliation.**

These hooks are non-blocking — if StoryFlow is unreachable or unconfigured, they skip silently and never interrupt your workflow.

## Agents

- **project-planner** -- Decomposes feature requests into structured epics, stories, and tasks with story point estimates. Triggered when you ask Claude to "plan a feature" or "break down work into issues."

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `STORYFLOW_URL` | `http://localhost:3001` | StoryFlow server URL |
| `STORYFLOW_MCP_TOKEN` | -- | Optional auth token for MCP |
| `STORYFLOW_TIMEOUT_MS` | `15000` | Request timeout in ms |

### Config File

`~/.config/storyflow/config.json` (created by `/storyflow:setup`):

```json
{
  "url": "http://localhost:3001",
  "configuredAt": "2026-02-25T00:00:00.000Z"
}
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| MCP server won't start | Run `cd plugin/server && npm install` |
| "Cannot reach StoryFlow" | Make sure StoryFlow is running: `npm run dev:full` |
| Tools not appearing | Restart Claude Code or reconnect the MCP server |
| Permission denied | Check that Node.js 18+ is installed and accessible |

## License

Apache-2.0
