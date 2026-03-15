# Board Sync Playbook

## When to Use
Work is completed, a plan is approved, a commit is made, or a session is ending. Any event that means board state should change.

## Status Transitions

```
To Do → In Progress → Done
                   → Blocked → In Progress → Done
```

Exact strings, title-case: `"To Do"`, `"In Progress"`, `"Blocked"`, `"Done"`

## Hook-Triggered Sync

### Plan Approved (ExitPlanMode)
1. Parse the plan for deliverables
2. Create issues for each deliverable (dedup first)
3. Set all new issues to "In Progress"
```bash
storyflow issues create --title "..." --type story --status "In Progress" --json
```

### Commit Detected (Bash → git commit)
1. Parse the commit message for issue keys (e.g., "Fix SC-42")
2. Match against known in-progress issues
3. Mark matched issues as Done
```bash
storyflow issues done SC-42
storyflow issues comment SC-42 -m "Completed in commit abc123"
```

### Task Completed (TaskUpdate → completed)
1. Match task subject to an existing issue by title
2. Mark as Done
```bash
storyflow issues done <key>
```

### Session Ending (Stop hook)
Full reconciliation:
1. `storyflow issues list --json` — snapshot current state
2. Check for issues marked "In Progress" that were actually completed (match against git log)
3. Check for new work done that has no issue — create retroactively
4. Save session: `storyflow sessions save --summary "..." --next-steps "..." --key-decisions "..."`
5. Set AI status to idle: `storyflow ai-status set idle`

## Workflow Node Sync

When an issue moves to Done and is linked to a workflow node, update the node:
```bash
storyflow workflow update <nodeId> --status success --json
```

## Blocked Issues

When marking an issue as blocked, always provide a reason:
```bash
storyflow issues block <key> -r "Waiting on API response from third-party"
```

## Dedup Rules

Before creating any issue:
1. `storyflow issues list -q "<title keywords>" --json`
2. Compare titles case-insensitively
3. If match found: update the existing issue instead of creating a duplicate
