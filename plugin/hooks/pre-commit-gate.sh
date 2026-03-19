#!/usr/bin/env bash
# pre-commit-gate.sh — PreToolUse enforcement hook
# Blocks git commit if no StoryFlow issue is "In Progress".
# Exit 0 = allow, Exit 2 = block.
# Graceful: if StoryFlow is offline or CLI missing, allows the commit.

set -euo pipefail

# Drain stdin (hook input)
input=$(cat)

# Only gate git commit commands
if ! echo "$input" | grep -qE 'git commit'; then
  exit 0
fi

# Check CLI availability — don't break workflow if not installed
if ! command -v storyflow &>/dev/null; then
  exit 0
fi

# Check StoryFlow connectivity — don't block if server is down
if ! storyflow status &>/dev/null 2>&1; then
  exit 0
fi

# Query for In Progress issues
result=$(storyflow issues list -s "In Progress" --json 2>/dev/null) || exit 0

# Count issues — handle both {issues: [...]} and bare array formats
count=$(echo "$result" | python3 -c "
import json, sys
try:
    d = json.load(sys.stdin)
    items = d.get('issues', d) if isinstance(d, dict) else d
    print(len(items) if isinstance(items, list) else 0)
except:
    print(0)
" 2>/dev/null) || count=0

if [ "$count" -eq 0 ] || [ -z "$count" ]; then
  cat >&2 <<'BLOCK'
BLOCKED: No StoryFlow issue is "In Progress".
Create and activate an issue before committing:
  storyflow issues create --title "..." --type story --priority medium
  storyflow issues update <key> --status "In Progress"
Then retry the commit.
BLOCK
  exit 2
fi

exit 0
