---
description: Show a board summary for a StoryFlow project
argument-hint: "[project]"
---

# /storyflow:board

Show a board summary for a StoryFlow project.

## Instructions

1. If not configured, tell the user to run `/storyflow:setup` first
2. If no project argument given, list all projects and ask which one
3. Call the `storyflow_get_board_summary` MCP tool with the project ID
4. Format the output as a readable summary:

```
Board Summary — <Project Name>
Status: <project status>

Issues: <total>
  To Do:        <count>
  In Progress:  <count>
  Done:         <count>

Story Points: <done>/<total> (<percent>%)
Active Sprint: <name> (<start> -> <end>)
```

## Arguments

- `[project]` — Optional project ID or name. If omitted, lists projects to choose from.

## Examples

```
> /storyflow:board my-app

Board Summary — My App
Status: in-progress

Issues: 47
  To Do:        12
  In Progress:   8
  Done:         27

Story Points: 89/134 (66%)
Active Sprint: Sprint 3 — Auth & Roles (Feb 10 -> Feb 17)
```
