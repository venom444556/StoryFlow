#!/usr/bin/env bash
# StoryFlow daemon signal writer.
# Invoked by hooks. Appends a JSON event line to the daemon signal log.
# Always exits 0. Always silent. Never blocks, never prints, never prompts.
#
# Usage: signal.sh <event-type> [key=value ...]
# Event types: session-start | file-edit | git-commit | turn-stop

set -e
type="${1:-}"
shift || true
[ -z "$type" ] && exit 0

mkdir -p /tmp/storyflow 2>/dev/null || exit 0
log="/tmp/storyflow/signals.log"

ts=$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")
json="{\"type\":\"$type\",\"at\":\"$ts\""

for arg in "$@"; do
  k="${arg%%=*}"
  v="${arg#*=}"
  v_escaped=$(printf '%s' "$v" | sed 's/\\/\\\\/g; s/"/\\"/g')
  json="${json},\"${k}\":\"${v_escaped}\""
done

json="${json}}"
printf '%s\n' "$json" >> "$log" 2>/dev/null || true
exit 0
