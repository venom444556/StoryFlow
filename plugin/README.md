# StoryFlow Plugin for Claude Code

Integrate Claude Code with [StoryFlow](https://github.com/venom444556/StoryFlow) project management. Create issues, track sprints, update boards, and manage wiki docs from any codebase.

## Prerequisites

- StoryFlow server running locally (default: `http://localhost:3001`)
- Node.js 18+

## Security Note

When installing, Claude Code will show a warning: **"This plugin includes local MCP servers — Installing will grant access to everything on your computer."** This is a standard warning for all plugins that include MCP servers.

What the StoryFlow MCP server actually does:

- Runs a lightweight Node.js process that makes HTTP requests **only** to your local StoryFlow server (`localhost:3001` by default)
- Does **not** access your filesystem, shell, or any external services
- Source code is fully auditable in `server/index.js` and `server/storyflow-client.js`

## Installation

### As a Claude Code plugin

```bash
claude plugin add /path/to/StoryFlow/plugin
```

### Manual installation

Copy the `plugin/` directory to your Claude Code plugins folder, or reference it directly:

```bash
claude --plugin-dir /path/to/StoryFlow/plugin
```

## Setup

After installation, install the MCP server dependencies:

```bash
cd plugin/server && npm install
```

Then configure the StoryFlow URL:

```
/storyflow:setup
```

This saves the URL to `~/.config/storyflow/config.json` for all future sessions.

## Commands

| Command | Description |
|---------|-------------|
| `/storyflow:setup` | Configure StoryFlow URL |
| `/storyflow:open [project]` | Open StoryFlow UI in browser |
| `/storyflow:sync` | Check connectivity status |
| `/storyflow:board [project]` | Show board summary |

## MCP Tools

The plugin provides 17 MCP tools for full CRUD operations:

**Projects**: list, get, create, update
**Issues**: list, create, update, delete
**Sprints**: list, create, delete
**Pages**: list, create, update, delete
**Utilities**: board-summary, check-connection

## Agents

- **project-planner** — Decomposes feature requests into structured epics, stories, and tasks with story point estimates

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `STORYFLOW_URL` | `http://localhost:3001` | StoryFlow server URL |
| `STORYFLOW_MCP_TOKEN` | — | Optional auth token |
| `STORYFLOW_TIMEOUT_MS` | `15000` | Request timeout in ms |

### Config File

`~/.config/storyflow/config.json`:

```json
{
  "url": "http://localhost:3001",
  "token": "optional-auth-token",
  "configuredAt": "2026-02-25T00:00:00.000Z"
}
```

## License

Apache-2.0
