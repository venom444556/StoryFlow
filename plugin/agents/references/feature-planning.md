# Feature Planning Playbook

## When to Use
User mentions a feature, idea, or initiative — even casually ("let's do auth", "we need search").

## Procedure

### 1. Decompose into Epic + Stories

Every feature becomes an epic with child stories. Never create loose stories without an epic parent.

```bash
# Create epic
storyflow issues create --title "P1: Authentication" --type epic --priority high --points 13 --json

# Create stories under it (use the epic's ID from the response)
storyflow issues create --title "Login form with email/password" --type story --priority high --points 5 --epic <epicId> --json
storyflow issues create --title "Session management and token refresh" --type story --priority high --points 8 --json
```

### 2. Story Point Estimation

Fibonacci only: 1, 2, 3, 5, 8, 13

| Points | Meaning |
|--------|---------|
| 1 | Trivial — config change, copy fix |
| 2 | Small — single function, simple component |
| 3 | Medium — full component, API endpoint |
| 5 | Large — multi-file feature, integration |
| 8 | Very large — cross-cutting concern |
| 13 | Epic-level — should probably be decomposed further |

### 3. Acceptance Criteria

Write acceptance criteria in the issue description. Use the format:
```
**Acceptance Criteria:**
- [ ] User can log in with email and password
- [ ] Invalid credentials show error message
- [ ] Session persists across page refresh
```

### 4. Sprint Assignment

If an active sprint exists, assign new stories to it:
```bash
storyflow issues update <key> --sprint <sprintId> --json
```

### 5. Dedup Check

**Always** check existing issues before creating:
```bash
storyflow issues list -q "auth" --json
```
Match by title (case-insensitive, trimmed). If a matching issue exists, update it instead.

## Epic Naming Convention

Use shorthand prefixes: `P0:`, `P1:`, `P2:`, etc.
- "P1: Authentication" — correct
- "Phase 1: Authentication" — wrong
