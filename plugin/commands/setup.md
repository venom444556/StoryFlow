---
description: Configure the StoryFlow URL for this and all future Claude Code sessions
allowed-tools: ["Bash", "Write", "Read"]
argument-hint: "[url]"
---

# /storyflow:setup

Configure the StoryFlow URL for this and all future Claude Code sessions.

## Instructions

Ask the user for their StoryFlow instance URL. Default is `http://localhost:3001`.

Once you have the URL:

1. Test connectivity by calling the `storyflow_check_connection` MCP tool (or fetching `<url>/api/projects`)
2. If reachable, save the configuration:
   - Create directory `~/.config/storyflow/` if it doesn't exist
   - Write `~/.config/storyflow/config.json` with:
     ```json
     {
       "url": "<the-url>",
       "configuredAt": "<ISO timestamp>"
     }
     ```
3. Confirm success: "StoryFlow configured at `<url>` — found N projects."
4. If unreachable, show the error and ask the user to check that StoryFlow is running.

## Example

```
> /storyflow:setup
What's your StoryFlow URL? (default: http://localhost:3001)
> http://localhost:3001
Connected to StoryFlow at http://localhost:3001 — found 2 projects.
  Configuration saved to ~/.config/storyflow/config.json
```
