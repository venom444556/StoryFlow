# StoryFlow

Project management tool with autonomous AI agent. React + Vite frontend, Express + SQLite backend, Agent CLI.

## Quick Start
- `npm run dev` — Express + Vite on single port (http://localhost:3001)
- `npm run lint` / `npm run build`

## Architecture
- `server/` — Express API + SQLite via sql.js (`db.js` data layer, `events.js` transparency, `intelligence.js` steering)
- `src/` — React frontend, Zustand stores, Tailwind with design tokens
- `cli/` — Agent CLI (`storyflow-cli` npm package) — all agent interaction goes through this
- `plugin/` — Claude Code plugin: agent prompt (`plugin/agents/`), hooks (`plugin/hooks/`), skills (`plugin/skills/`)

## AI Agent
The StoryFlow agent is self-documenting. All project knowledge, conventions, architecture decisions, and session history live inside StoryFlow itself (wiki pages, events, sessions). On startup, the agent reads its own wiki pages prefixed with "Agent:" to restore context. Do not duplicate agent knowledge in this file.

## Conventions
- Issue fields: `epicId`, `storyPoints` (Fibonacci: 1,2,3,5,8,13)
- Statuses: "To Do", "In Progress", "Blocked", "Done"
- Types: "epic", "story", "task", "bug"
- Priorities: "critical", "high", "medium", "low"
