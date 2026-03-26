#!/usr/bin/env bash
# StoryFlow Agent — session stop hook
set -euo pipefail
cat > /dev/null
storyflow ai-status set idle &>/dev/null 2>&1 || true
exit 0
