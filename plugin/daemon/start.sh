#!/usr/bin/env bash
# Idempotent launcher for the StoryFlow daemon.
# Called by the SessionStart hook. Exits 0 silently in all failure modes —
# the daemon is a nice-to-have, not a hard dependency.

set -e

ROOT="/tmp/storyflow"
PID_FILE="$ROOT/storyflowd.pid"
DAEMON="${CLAUDE_PLUGIN_ROOT:-$(dirname "$0")/..}/daemon/storyflowd.mjs"

mkdir -p "$ROOT" 2>/dev/null || exit 0

if [ -f "$PID_FILE" ]; then
  pid=$(cat "$PID_FILE" 2>/dev/null || true)
  if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
    exit 0
  fi
fi

if ! command -v node >/dev/null 2>&1; then
  exit 0
fi

if [ ! -f "$DAEMON" ]; then
  exit 0
fi

nohup node "$DAEMON" >/dev/null 2>&1 &
disown 2>/dev/null || true
exit 0
