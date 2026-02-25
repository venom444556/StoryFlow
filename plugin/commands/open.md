---
description: Open the StoryFlow UI in your browser
allowed-tools: ["Bash", "Read"]
argument-hint: "[project]"
---

# /storyflow:open

Open the StoryFlow UI in the user's browser.

## Instructions

1. Read the StoryFlow URL from `~/.config/storyflow/config.json` or `$STORYFLOW_URL`
2. If not configured, tell the user to run `/storyflow:setup` first
3. Open the URL in the default browser:
   - On macOS: `open <url>`
   - On Windows: `start <url>`
   - On Linux: `xdg-open <url>`
4. If a project ID argument is provided, open directly to that project: `<url>/project/<id>`

## Arguments

- `[project]` — Optional project ID or name. If provided, navigates directly to that project.

## Examples

```
> /storyflow:open
Opening StoryFlow at http://localhost:3001...

> /storyflow:open my-app
Opening StoryFlow project "my-app" at http://localhost:3001/project/my-app...
```
