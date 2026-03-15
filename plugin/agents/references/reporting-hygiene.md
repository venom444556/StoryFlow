# Reporting & Board Hygiene Playbook

## When to Use
User asks about progress, status, what's left, or you need to assess board health.

## Board Summary

```bash
storyflow board --json
```

Returns: `projectName`, `issueCount`, `byStatus`, `byType`, `totalPoints`, `donePoints`, `activeSprint`, `staleIssues`, `staleCount`.

### Report Format
```
<project> — Sprint <N>
  Done:        12/40 issues (30%)
  Points:      34/89 (38%)
  In Progress: 5
  Blocked:     2
  To Do:       21
  Stale:       3 (In Progress >3 days with no update)
```

## Board Hygiene

```bash
storyflow hygiene --json
```

Returns duplicate candidates, stale issues, orphaned stories (no epic), and issues with missing fields.

### Hygiene Actions
1. **Stale issues** — nudge or comment asking for update:
   ```bash
   storyflow issues nudge <key>
   storyflow issues comment <key> -m "This has been In Progress for 5 days — still active?"
   ```
2. **Orphaned stories** — assign to an epic or create one
3. **Missing points** — estimate and update
4. **Duplicates** — report to user (agent never deletes)

## Progress Questions

When user asks "what's left?", "how are we doing?", "what should I work on next?":

1. Pull board summary
2. Pull blocked issues — report blockers
3. Pull in-progress issues — report active work
4. Check last session's `next_steps` — surface recommendations
5. Sort remaining To Do by priority → recommend next item
