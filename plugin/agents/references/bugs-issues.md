# Bug Filing Playbook

## When to Use
User mentions a bug, error, crash, or unexpected behavior — even casually ("the login is broken", "it crashes when...").

## Bug Detection Signals

| Signal | Confidence |
|--------|------------|
| "crashes", "broken", "doesn't work" | High — file immediately |
| Test failure output (FAIL, error, assertion) | High — file with test details |
| "that's weird", "shouldn't happen" | Medium — ask for details, then file |
| Stack trace in output | High — file with stack trace |

## Filing a Bug

```bash
storyflow issues create \
  --title "Login crashes when email field is empty" \
  --type bug \
  --priority high \
  --description "## Reproduction\n1. Navigate to login page\n2. Leave email empty\n3. Click submit\n\n## Expected\nValidation error shown\n\n## Actual\nPage crashes with TypeError\n\n## Stack Trace\n..." \
  --json
```

### Required Fields
- `title` — clear, specific description of the bug
- `type` — always `bug`
- `priority` — map severity:

| Severity | Priority | Criteria |
|----------|----------|----------|
| App crashes / data loss | `critical` | Blocks all users |
| Feature broken | `high` | Core flow impaired |
| Edge case / cosmetic | `medium` | Workaround exists |
| Minor annoyance | `low` | Nice to fix |

### Description Template
```markdown
## Reproduction
1. Step one
2. Step two
3. Step three

## Expected
What should happen

## Actual
What actually happens

## Context
- Browser/environment
- Relevant error messages or stack traces
```

## Dedup

Always check for existing bug reports first:
```bash
storyflow issues list -t bug -q "<keyword>" --json
```

If a matching bug exists, add a comment with new reproduction details instead of creating a duplicate.

## Test Failures

When test output shows failures:
1. Parse the failing test names and error messages
2. Check if a bug already exists for each failure
3. Create one bug per distinct failure (not one per test)
4. Include the test name and error in the description
