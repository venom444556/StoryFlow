#!/usr/bin/env bash
# session-boot.sh — SessionStart enforcement hook
# Fetches real StoryFlow context and sets AI status.
# Outputs data, not reminders. The agent gets context it can act on.
# Graceful: if StoryFlow is offline or CLI missing, says so and exits.

set -euo pipefail

# Drain stdin
cat > /dev/null

# Reset PM counter
echo '{"counter":0,"nudged":false}' > /tmp/storyflow-pm-state.json

# Check CLI
if ! command -v storyflow &>/dev/null; then
  echo "StoryFlow CLI not installed. Skipping session boot."
  exit 0
fi

# Check connectivity
if ! storyflow status &>/dev/null 2>&1; then
  echo "StoryFlow offline. Skipping session boot."
  exit 0
fi

# Set AI status to working
storyflow ai-status set working &>/dev/null 2>&1 || true

# Fetch last session context
session=$(storyflow sessions latest --json 2>/dev/null) || session='{}'

# Fetch in-progress issues
in_progress=$(storyflow issues list -s "In Progress" --json 2>/dev/null) || in_progress='[]'

# Fetch blocked issues
blocked=$(storyflow issues list -s "Blocked" --json 2>/dev/null) || blocked='[]'

# Format output concisely — real data, not reminders
echo "StoryFlow session boot complete. AI status: working."

# Last session next steps
echo "$session" | python3 -c "
import json, sys
try:
    d = json.load(sys.stdin)
    ns = d.get('next_steps', d.get('nextSteps', ''))
    if ns:
        print(f'Last session next steps: {ns}')
    else:
        print('No previous session context.')
except:
    print('No previous session context.')
" 2>/dev/null || echo "No previous session context."

# In Progress summary
echo "$in_progress" | python3 -c "
import json, sys
try:
    d = json.load(sys.stdin)
    items = d.get('issues', d) if isinstance(d, dict) else d
    if not items:
        print('In Progress: none')
    else:
        print(f'In Progress ({len(items)}):')
        for i in items:
            key = i.get('key', '?')
            title = i.get('title', '?')
            print(f'  {key}: {title}')
except:
    print('In Progress: unknown')
" 2>/dev/null || echo "In Progress: unknown"

# Blocked summary
echo "$blocked" | python3 -c "
import json, sys
try:
    d = json.load(sys.stdin)
    items = d.get('issues', d) if isinstance(d, dict) else d
    if not items:
        print('Blocked: none')
    else:
        print(f'Blocked ({len(items)}):')
        for i in items:
            key = i.get('key', '?')
            title = i.get('title', '?')
            reason = i.get('blockedReason', '')
            line = f'  {key}: {title}'
            if reason:
                line += f' — {reason}'
            print(line)
except:
    print('Blocked: unknown')
" 2>/dev/null || echo "Blocked: unknown"

# --- A-GRADE: Agent:* wiki pages ---
pages=$(storyflow pages list --json 2>/dev/null) || pages='[]'
echo "$pages" | python3 -c "
import json, sys
try:
    d = json.load(sys.stdin)
    items = d.get('pages', d) if isinstance(d, dict) else d
    agent = [p for p in items if p.get('title', '').startswith('Agent:')]
    if agent:
        print(f'Agent wiki pages ({len(agent)}):')
        for p in agent:
            print(f'  [{p.get(\"id\", \"?\")}] {p[\"title\"]}')
    else:
        print('Agent wiki pages: none')
except:
    print('Agent wiki pages: unknown')
" 2>/dev/null || echo "Agent wiki pages: unknown"

# --- A-GRADE: Board hygiene ---
hygiene=$(storyflow hygiene --json 2>/dev/null) || hygiene='{}'
echo "$hygiene" | python3 -c "
import json, sys
try:
    d = json.load(sys.stdin)
    stale = d.get('staleIssues', d.get('stale', []))
    orphans = d.get('orphanedStories', d.get('orphans', []))
    dupes = d.get('duplicateCandidates', d.get('duplicates', []))
    problems = []
    if stale:
        problems.append(f'{len(stale)} stale (In Progress >3 days)')
        for s in stale[:3]:
            problems.append(f'  {s.get(\"key\", \"?\")}: {s.get(\"title\", \"?\")}')
    if orphans:
        problems.append(f'{len(orphans)} orphaned stories (no epic)')
        for o in orphans[:3]:
            problems.append(f'  {o.get(\"key\", \"?\")}: {o.get(\"title\", \"?\")}')
    if dupes:
        problems.append(f'{len(dupes)} possible duplicates')
    if problems:
        print('HYGIENE ISSUES:')
        for p in problems:
            print(f'  {p}')
    else:
        print('HYGIENE: Board is clean.')
except:
    print('HYGIENE: Could not run check.')
" 2>/dev/null || echo "HYGIENE: Could not run check."

# --- A-GRADE: Git cross-reference — auto-close stale To Do items ---
recent_keys=$(git log --oneline -20 2>/dev/null | grep -oE '\b[A-Z]{1,5}-[0-9]{1,4}\b' | sort -u) || recent_keys=''

if [ -n "$recent_keys" ]; then
  for key in $recent_keys; do
    status=$(storyflow issues show "$key" --json 2>/dev/null | python3 -c "
import json, sys
try:
    print(json.load(sys.stdin).get('status', ''))
except:
    pass
" 2>/dev/null) || status=''
    if [ "$status" = "To Do" ]; then
      storyflow issues done "$key" 2>/dev/null && echo "AUTO-FIX: $key was To Do but already in git history -> Done"
    fi
  done
fi

exit 0
