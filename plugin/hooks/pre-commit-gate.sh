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

# --- PROJECT SCOPING GUARD (2026-09-08) ---
# Resolve the board bound to THIS working tree via the CLI's single resolver:
#   env STORYFLOW_PROJECT > .storyflow.json or .claude/settings.json in the repo
#   > projectsByPath in the global config.
# --require-explicit refuses the machine-wide defaultProject on purpose. Without
# this, every call below fell through to that one board regardless of which repo
# the session was in -- which is how one project's issues collected three months
# of another project's commit and test-failure writes.
# This gate only READS, but it BLOCKS commits, so unscoped it gated on another
# project's In Progress count. It fails OPEN -- refusing to commit because no
# board is bound would trap the session behind a policy that cannot apply. Safe
# precisely because this hook never writes.
SF_PROJECT="$(storyflow config project --require-explicit 2>/dev/null)" || SF_PROJECT=""
if [ -z "$SF_PROJECT" ]; then
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
result=$(storyflow issues list "$SF_PROJECT" -s "In Progress" --json 2>/dev/null) || exit 0

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
