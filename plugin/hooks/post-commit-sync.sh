#!/usr/bin/env bash
# post-commit-sync.sh — PostToolUse enforcement hook for all Bash events
# Handles: git commit (auto-Done), gh pr create (auto-link), test failures (auto-comment).
# Executes directly — no suggestions, no agent involvement.
# Graceful: if StoryFlow is offline or CLI missing, silently exits.

set -euo pipefail

# Read hook input
input=$(cat)

# --- Prerequisite checks (shared across all handlers) ---
sf_ready() {
  command -v storyflow &>/dev/null || return 1
  storyflow status &>/dev/null 2>&1 || return 1
}

# Extract issue keys from text: 1-5 uppercase letters + dash + 1-4 digits
extract_keys() {
  echo "$1" | grep -oE '\b[A-Z]{1,5}-[0-9]{1,4}\b' | sort -u || true
}

# ============================================================
# HANDLER 1: git commit — auto-mark referenced issues as Done
# ============================================================
if echo "$input" | grep -qE 'git commit'; then

  # Skip if commit failed
  if echo "$input" | grep -qiE '(fatal:|error:|nothing to commit|no changes added|aborting commit)'; then
    exit 0
  fi

  sf_ready || exit 0

  keys=$(extract_keys "$input")

  if [ -z "$keys" ]; then
    echo "StoryFlow: No issue key in commit message. Reference issues (e.g. SC-42) in commits for auto-tracking."
    exit 0
  fi

  synced=0
  for key in $keys; do
    if storyflow issues done "$key" 2>/dev/null; then
      echo "StoryFlow: $key -> Done"
      synced=$((synced + 1))
    fi
  done

  if [ "$synced" -eq 0 ]; then
    echo "StoryFlow: No matching issues found for keys in commit."
  fi

  exit 0
fi

# ============================================================
# HANDLER 2: gh pr create — auto-comment PR link on issues
# ============================================================
if echo "$input" | grep -qE 'gh pr create'; then

  # Skip if PR creation failed
  if echo "$input" | grep -qiE '(error|fatal|failed to create)'; then
    exit 0
  fi

  sf_ready || exit 0

  # Extract PR URL from output
  pr_url=$(echo "$input" | grep -oE 'https://github\.com/[^[:space:]]*/pull/[0-9]+' | head -1) || pr_url=''

  if [ -z "$pr_url" ]; then
    exit 0
  fi

  keys=$(extract_keys "$input")

  if [ -n "$keys" ]; then
    for key in $keys; do
      if storyflow issues comment "$key" -m "PR created: $pr_url" 2>/dev/null; then
        echo "StoryFlow: Linked $key to $pr_url"
      fi
    done
  fi

  exit 0
fi

# ============================================================
# HANDLER 3: Test failures — auto-comment on In Progress issue
# ============================================================
if echo "$input" | grep -qiE '(npm test|npx vitest|vitest run|jest|pytest|cargo test)'; then

  # Only act on failures
  if ! echo "$input" | grep -qiE '(FAIL|Tests:.*failed|AssertionError|test.*failed|Error.*test)'; then
    exit 0
  fi

  sf_ready || exit 0

  # Get first In Progress issue key
  ip_key=$(storyflow issues list -s "In Progress" --json 2>/dev/null | python3 -c "
import json, sys
try:
    d = json.load(sys.stdin)
    items = d.get('issues', d) if isinstance(d, dict) else d
    if items:
        print(items[0].get('key', ''))
except:
    pass
" 2>/dev/null) || ip_key=''

  if [ -n "$ip_key" ]; then
    storyflow issues comment "$ip_key" -m "Test failure detected during implementation." 2>/dev/null \
      && echo "StoryFlow: Test failure logged on $ip_key"
  fi

  exit 0
fi

exit 0
