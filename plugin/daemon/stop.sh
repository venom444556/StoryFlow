#!/usr/bin/env bash
# Graceful stopper for the StoryFlow daemon. Manual use or CI teardown.
set -e
PID_FILE="/tmp/storyflow/storyflowd.pid"
[ -f "$PID_FILE" ] || exit 0
pid=$(cat "$PID_FILE" 2>/dev/null || true)
[ -z "$pid" ] && exit 0
kill -TERM "$pid" 2>/dev/null || true
sleep 1
kill -KILL "$pid" 2>/dev/null || true
: > "$PID_FILE"
exit 0
