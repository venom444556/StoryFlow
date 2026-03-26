#!/usr/bin/env bash
# StoryFlow Agent — session start hook
set -euo pipefail
cat > /dev/null

if ! command -v storyflow &>/dev/null; then echo "CLI not found"; exit 0; fi
if ! storyflow status &>/dev/null 2>&1; then echo "StoryFlow offline"; exit 0; fi

storyflow ai-status set working &>/dev/null 2>&1 || true
storyflow context boot --json 2>/dev/null || echo '{"error":"context boot failed"}'
exit 0
