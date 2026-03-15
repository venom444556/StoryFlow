#!/usr/bin/env bash
# pm-check.sh — Autonomous PM intervention counter for StoryFlow hooks.
# Tracks file-change events; after THRESHOLD changes with no plan, nudges once.
#
# Usage: pm-check.sh increment | reset

set -euo pipefail

THRESHOLD=5
STATE_FILE="/tmp/storyflow-pm-state.json"

# Drain stdin so piped hook input doesn't block
cat > /dev/null &

# Ensure state file exists with defaults
init_state() {
  if [ ! -f "$STATE_FILE" ]; then
    printf '{"counter":0,"nudged":false}' > "$STATE_FILE"
  fi
}

read_state() {
  local raw
  raw=$(<"$STATE_FILE")
  counter=$(echo "$raw" | sed -n 's/.*"counter":\([0-9]*\).*/\1/p')
  nudged=$(echo "$raw" | sed -n 's/.*"nudged":\([a-z]*\).*/\1/p')
  counter=${counter:-0}
  nudged=${nudged:-false}
}

write_state() {
  printf '{"counter":%d,"nudged":%s}' "$counter" "$nudged" > "$STATE_FILE"
}

cmd_increment() {
  init_state
  read_state
  counter=$((counter + 1))

  if [ "$counter" -ge "$THRESHOLD" ] && [ "$nudged" = "false" ]; then
    nudged=true
    write_state
    cat <<'NUDGE'
PM Check-in: You've made 5+ file changes this session with no active plan or StoryFlow tracking. Want me to organize this work into a StoryFlow plan? I'll create an epic and issues from what you've been working on. Invoke the storyflow-agent with the PM intervention reference if the user accepts. (Say "yes" or keep going — I won't ask again until the next cycle.)
NUDGE
  else
    write_state
  fi
}

cmd_reset() {
  counter=0
  nudged=false
  write_state
}

case "${1:-}" in
  increment) cmd_increment ;;
  reset)     cmd_reset ;;
  *)         echo "Usage: pm-check.sh increment|reset" >&2; exit 1 ;;
esac
