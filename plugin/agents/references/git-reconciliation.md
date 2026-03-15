# Git Reconciliation Playbook

## When to Use
A commit is detected, a PR is created, or a session is ending and you need to catch up the board with actual git activity.

## Commit Matching

When a commit is detected (Bash hook fires on `git commit`):

1. Parse the commit message for issue keys (patterns: `SC-42`, `PRJ-123`, `fixes #42`)
2. Look up each key: `storyflow issues show <key> --json`
3. If the issue is "In Progress", mark it Done:
   ```bash
   storyflow issues done <key>
   storyflow issues comment <key> -m "Completed in commit <hash>"
   ```
4. If no key is found in the commit message, check if the commit message matches any in-progress issue title

## PR Matching

When `gh pr create` is detected:

1. Parse the PR title and body for issue keys
2. Update matched issues — add a comment linking the PR
3. If the PR is merged, mark linked issues as Done

```bash
storyflow issues comment <key> -m "PR #<number>: <title>"
```

## Session-End Reconciliation

At session end, sweep for unmatched work:

1. Get recent commits: check git log since last session
2. Get in-progress issues: `storyflow issues list -s "In Progress" --json`
3. For each in-progress issue, check if its work appears in recent commits
4. Mark completed issues as Done
5. For commits with no matching issue, consider creating retroactive issues

## Unmatched Commits

If a commit doesn't match any issue:
- If the commit is a bug fix → create a bug issue marked Done
- If the commit is a feature → create a story issue marked Done
- If the commit is a refactor/chore → create a task issue marked Done
- Add a comment with the commit hash and message
