# PM Intervention — Organizing Unstructured Work

Triggered when: the PM check-in hook fired and the user accepted the offer to organize work.

## Procedure

1. **Check server**
   ```bash
   storyflow status
   ```
   If unreachable, start the server from the StoryFlow project root:
   ```bash
   npm run dev &
   sleep 3
   storyflow status
   ```
   If still unreachable after boot attempt, report the error and stop.

2. **Resolve project** — use standard boot step 2 logic (match repo name to project list).

3. **Scan recent work** — read the conversation context for file paths from recent Edit/Write tool calls. Group them by directory or feature area to identify logical units of work.

4. **Check existing board** — `storyflow issues list --json` and dedup. Don't create issues for files already covered by in-progress issues.

5. **Create structure**:
   - One epic named after the detected theme (e.g., "CLI Contract Fixes", "Auth Refactor")
   - Child stories/tasks for each logical unit — title from file/feature, 1-3 story points each
   - Use standard conventions: Fibonacci points, lowercase types, title-case statuses

6. **Assign sprint** — `storyflow sprints list --json`. If an active sprint exists, assign all new issues to it.

7. **Set in-progress** — all new issues go to "In Progress" immediately (this is active work).

8. **Report** — use standard storyflow-agent output format.
