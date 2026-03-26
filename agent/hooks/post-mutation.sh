#!/usr/bin/env bash
# StoryFlow Agent — post-mutation sync
set -euo pipefail
INPUT=$(cat)
COMMIT_MSG=$(echo "$INPUT" | grep -o 'git commit' 2>/dev/null) || COMMIT_MSG=""
if [ -n "$COMMIT_MSG" ]; then
  KEYS=$(git log --oneline -1 2>/dev/null | grep -oE '\b[A-Z]{1,5}-[0-9]{1,4}\b' | sort -u) || KEYS=""
  for key in $KEYS; do
    storyflow issues done "$key" 2>/dev/null && echo "AUTO: $key -> Done" || true
  done
fi
exit 0
