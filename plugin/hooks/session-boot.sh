#!/usr/bin/env bash
# session-boot.sh — SessionStart enforcement hook
# Single-call context boot via `storyflow context boot --json`.
# Outputs structured data the agent can act on immediately.
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

# --- Single-call context boot ---
ctx=$(storyflow context boot --json 2>/dev/null) || ctx=''

if [ -z "$ctx" ]; then
  echo "StoryFlow session boot complete. AI status: working."
  echo "Context boot returned empty — falling back to basic mode."
  exit 0
fi

# Parse and format context output
echo "$ctx" | python3 -c "
import json, sys

try:
    d = json.load(sys.stdin)
except:
    print('StoryFlow session boot complete. AI status: working.')
    print('Context parse failed — falling back to basic mode.')
    sys.exit(0)

print('StoryFlow session boot complete. AI status: working.')

# Last session next steps
session = d.get('lastSession')
if session and session.get('nextSteps'):
    print(f'Last session next steps: {session[\"nextSteps\"]}')
else:
    print('No previous session context.')

# In Progress / Blocked from board counts
board = d.get('board', {})
by_status = board.get('byStatus', {})
in_prog = by_status.get('In Progress', 0)
blocked_count = by_status.get('Blocked', 0)
print(f'In Progress: {\"none\" if in_prog == 0 else in_prog}')
print(f'Blocked: {\"none\" if blocked_count == 0 else blocked_count}')

# Active blockers with details
blockers = d.get('activeBlockers', [])
if blockers:
    for b in blockers:
        print(f'  {b.get(\"key\", \"?\")}: {b.get(\"title\", \"?\")}')

# Pending gates
gates = d.get('pendingGates', [])
gate_count = d.get('pendingGatesCount', 0)
if gate_count > 0:
    print(f'GATES: {gate_count} pending')
    for g in gates:
        print(f'  {g.get(\"entityTitle\", g.get(\"entityType\", \"?\"))} — {g.get(\"reasoning\", \"\")}')

# Steering directives
directives = d.get('directives', [])
dir_count = d.get('directivesCount', 0)
if dir_count > 0:
    print(f'DIRECTIVES: {dir_count} pending')
    for dr in directives:
        pri = dr.get('priority', 'normal')
        print(f'  [{pri}] {dr.get(\"text\", \"\")}')

# Agent wiki pages
pages = d.get('agentPages', [])
if pages:
    print(f'Agent wiki pages ({len(pages)}):')
    for p in pages:
        print(f'  [{p.get(\"id\", \"?\")}] {p[\"title\"]}')

# Wiki audit
wiki = d.get('wiki', {})
missing_core = wiki.get('missingCorePages', [])
stale_core = wiki.get('staleCorePages', [])
if missing_core or stale_core:
    print(f'WIKI: {wiki.get(\"findings\", len(missing_core) + len(stale_core))} documentation finding(s)')
    if missing_core:
        print('  Missing core pages:')
        for p in missing_core:
            print(f'    - {p.get(\"title\", \"?\")}')
    if stale_core:
        print('  Stale core pages:')
        for p in stale_core:
            print(f'    - {p.get(\"title\", \"?\")} ({p.get(\"daysStale\", \"?\")}d stale)')
else:
    print('WIKI: Core documentation is current.')

# Lessons learned rollup
lessons = d.get('lessons', {})
lesson_summary = lessons.get('summary', {})
reports_count = lesson_summary.get('reportsCount', 0)
lessons_count = lesson_summary.get('lessonsCount', 0)
follow_up_count = lesson_summary.get('followUpActionsCount', 0)
draft_count = lesson_summary.get('draftCount', 0)
if reports_count > 0:
    print(
        f'LESSONS: {reports_count} report(s), {lessons_count} lesson(s), {follow_up_count} follow-up action(s)'
        + (f', {draft_count} draft(s)' if draft_count else '')
    )
else:
    print('LESSONS: No project-level lessons captured yet.')

# Hygiene
hygiene = d.get('hygiene', {})
findings = hygiene.get('findings', 0)
if findings > 0:
    problems = []
    missing = hygiene.get('missingEstimates', [])
    orphans = hygiene.get('orphanedStories', [])
    stuck = hygiene.get('stuckIssues', [])
    sprints = hygiene.get('completableSprints', [])
    if missing:
        problems.append(f'{len(missing)} missing estimates')
    if orphans:
        problems.append(f'{len(orphans)} orphaned stories')
    if stuck:
        problems.append(f'{len(stuck)} stuck 7+ days')
    if sprints:
        problems.append(f'{len(sprints)} completable sprint(s)')
    print(f'HYGIENE: {\"  \".join(problems)}')
else:
    print('HYGIENE: Board is clean.')
" 2>/dev/null || echo "StoryFlow session boot complete. AI status: working."

# --- Git cross-reference — auto-close stale To Do items ---
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
