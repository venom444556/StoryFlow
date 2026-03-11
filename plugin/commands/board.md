---
description: Show a board summary for a StoryFlow project
argument-hint: "[project]"
---

# /storyflow:board

Show a board summary for a StoryFlow project.

## Instructions

1. If not configured, tell the user to run `/storyflow:setup` first
2. Run `storyflow board --json` (or `storyflow board <project> --json` if a project argument is given) via Bash
3. Format the output as a readable summary:

```
Board Summary — <Project Name>
Status: <project status>

Issues: <total>
  To Do:        <count>
  In Progress:  <count>
  Blocked:      <count>
  Done:         <count>

Story Points: <done>/<total> (<percent>%)
Active Sprint: <name> (<start> -> <end>)
Stale Issues: <staleCount>
```

## Arguments

- `[project]` — Optional project name or ID. If omitted, uses default project.

## Examples

```
> /storyflow:board my-app

Board Summary — My App
Status: in-progress

Issues: 47
  To Do:        12
  In Progress:   6
  Blocked:       2
  Done:         27

Story Points: 89/134 (66%)
Active Sprint: Sprint 3 — Auth & Roles (Feb 10 -> Feb 17)
Stale Issues: 3
```
