#!/usr/bin/env bash
# StoryFlow Agent — pre-mutation gate check
set -euo pipefail
INPUT=$(cat)
COMMAND=$(echo "$INPUT" | grep -o 'git commit' 2>/dev/null) || COMMAND=""
if [ "$COMMAND" = "git commit" ]; then
  IN_PROGRESS=$(storyflow issues list -s "In Progress" --json 2>/dev/null | python3 -c "
import json, sys
try:
    d = json.load(sys.stdin)
    items = d.get('issues', d) if isinstance(d, dict) else d
    print(len(items))
except:
    print(0)
" 2>/dev/null) || IN_PROGRESS="0"
  if [ "$IN_PROGRESS" = "0" ]; then
    echo "No issues In Progress. Create or move an issue to In Progress before committing."
    exit 2
  fi
fi
exit 0
