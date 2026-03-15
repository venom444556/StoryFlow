# Sprint Management Playbook

## When to Use
User mentions sprints, timelines, velocity, or asks "when will X be done?"

## Creating a Sprint

```bash
storyflow sprints create --name "Sprint 4" --goal "Ship authentication feature" \
  --start 2026-03-10 --end 2026-03-24 --status active --json
```

- Sprint names: "Sprint N" (sequential)
- Duration: typically 2 weeks
- Only one sprint should be `active` at a time
- Set previous sprint to `completed` before activating a new one

## Sprint Metrics

Pull from board summary:
```bash
storyflow board --json
```

Response includes `activeSprint`, `totalPoints`, `donePoints`. Calculate:
- **Velocity**: `donePoints` per sprint
- **Burndown**: `totalPoints - donePoints` remaining
- **Completion %**: `donePoints / totalPoints * 100`

## Assigning Issues to Sprints

```bash
storyflow issues update <key> --sprint <sprintId> --json
```

## Sprint Lifecycle

1. `planning` → Sprint is being scoped (issues assigned, points estimated)
2. `active` → Sprint is in progress (work happening)
3. `completed` → Sprint is done (run retrospective)

```bash
# Activate sprint
storyflow sprints update <id> --status active --json

# Complete sprint
storyflow sprints update <id> --status completed --json
```

## Sprint Reports

When asked "what's left?" or "how are we doing?":
1. `storyflow board --json` — get summary
2. `storyflow issues list -s "In Progress" --json` — active work
3. `storyflow issues list -s "Blocked" --json` — blockers
4. Report: points done/total, blocked count, remaining issues
