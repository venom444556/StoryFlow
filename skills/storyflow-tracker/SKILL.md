---
name: storyflow-tracker
description: >
  Enforces mandatory project tracker workflow for ANY coding task. Automatically
  triggers before/after code execution to maintain the tracker as the single source
  of truth. Plan → Update tracker → Execute → Update tracker → Verify build.
---

# StoryFlow Tracker

Enforces mandatory project tracker workflow for ANY coding task. The tracker is the single source of truth for what has been planned, what is in progress, and what is done. **Every piece of work must be reflected in the tracker. This is non-negotiable and must happen automatically without the user asking. There are no exceptions.**

## When to use

**AUTOMATIC TRIGGERS (no user prompt needed):**
- About to write any code or make changes
- Just finished writing code or making changes
- Planning a feature, implementing a feature, fixing a bug
- User says: "update tracker", "add board issue", "track this work"

**This skill activates automatically. You do not need to be asked.**

## Instructions

### The Mandatory 6-Step Workflow

Always follow this exact order:

**Step 1: Plan First** (before any code)
- Enter plan mode
- Explore the codebase
- Design the approach
- Identify which tracker sections will need updates

**Step 2: Get Plan Approved**
- Exit plan mode
- Present plan to user
- Wait for approval (DO NOT proceed without it)

**Step 3: Update Tracker BEFORE Execution**

Add the planned work to all relevant sections:

1. **Board Issues** (ALWAYS — no exceptions)
   - Add a new issue for every feature, fix, or task
   - Required fields: `id, type, key, title, description, status, priority, storyPoints, assignee, labels, parentId, sprintId, createdAt, updatedAt`
   - Set status to `In Progress`
   - Set `parentId` to the relevant epic
   - Assign to the current sprint
   - Increment the issue counter after adding
   - **Descriptions must be detailed for transparency and audit:**
     - What files were created, modified, or deleted
     - How many lines were added/changed/removed
     - WHY the change was made (motivation, not just mechanics)
     - What the user will see or experience differently
   - **Format:** [Context (why)] → [Changes (what)] → [Impact (so what)]

2. **Workflow Sub-Tasks** (when work falls under an existing phase)
   - Add a task node to the relevant phase's sub-workflow (`children.nodes[]`)
   - Set node `status` to `'pending'`
   - Add connections from/to adjacent nodes
   - Node structure: `{ id, type: 'task', title, x, y, status, config: { assignee, notes } }`
   - **Notes must serve as an audit trail** — describe what was actually done in enough detail that someone reading the tracker 6 months later understands what happened

3. **Timeline Progress** (when work affects a tracked phase)
   - Update the relevant phase's `progress` percentage (0-100)
   - Use honest percentages — actual completion, not optimistic estimates
   - Always include justification for the percentage
   - Add milestones if a new milestone was reached
   - Adjust `endDate` if work extends beyond the original plan

4. **Decisions** (when an architectural choice was made)
   - Add a decision record for non-trivial technical choices
   - Required fields: `id, title, status, context, decision, alternatives[], consequences, createdAt, updatedAt`
   - Context must explain the problem, not just the solution
   - Alternatives must include 2-3 genuinely considered options with honest pros/cons
   - Consequences must describe real trade-offs

5. **Architecture Components** (when new modules are created)
   - Add new components, hooks, contexts, services, or utilities to the architecture array
   - Every component: `id, name, description, type, parentId, dependencies[]`
   - Set `parentId` to the appropriate group node
   - Remove deleted components

6. **Wiki Documentation** (when features or architecture change)
   - Update relevant wiki pages when documented features change
   - Mandatory when new directories/components are created
   - Remove or update stale content — stale docs are worse than no docs

7. **Version Constant** (ALWAYS — no exceptions)
   - Bump `SEED_VERSION` after every change
   - The migration function auto-replaces tracker data when the version is outdated

**Step 4: Execute the Work**
- Write the code, make the changes

**Step 5: Update Tracker AFTER Execution**

Reflect completed work:
- Board issues: status → `Done`
- Workflow sub-tasks: status → `success`
- Timeline: adjust progress percentages
- Wiki/Architecture/Decisions: post-execution updates or corrections
- Version: bump again

**Step 6: Verify Build**
- Run `npm run build`
- Must pass clean
- If it fails, fix and update tracker again

---

### Cross-Tab Consistency (CRITICAL)

The 7 tabs share the same project and must tell a coherent story:
- Workflow nodes should mirror timeline phases
- Board sprints should match timeline dates
- Architecture components should reflect the actual codebase
- Wiki docs should match the current state of the code
- Decisions should reference the board issues that implemented them
- **Never update one section in isolation** — always consider ripple effects across all 7 tabs

---

### Detail and Transparency Standards

Write every entry as if someone else will audit it:

- **Board issue descriptions:** Specific file names, line counts, what was added/changed/removed, and reasoning
- **Workflow task notes:** What actually happened, decisions made during execution, problems encountered
- **Decision context:** Problem that prompted it, constraints, why alternatives were rejected
- **Wiki content:** Written for a developer encountering the codebase for the first time
- **Timeline progress:** Honest percentages with justification

---

### Finding the Tracker File

For StoryFlow: `src/data/seedProject.js`

For other projects:
1. Check project config/docs for tracker file path
2. Common locations: seed files, data directories
3. Look for file containing board issues, workflow nodes, timeline phases, wiki pages
4. If unsure, ask: "Where is the tracker file located?"

---

### Output Format

After each tracker update, report:
```
Tracker Updated:

  Board Issue: [SF-###] Task Title
   Status: In Progress → Done
   Files: src/components/Feature.jsx (+45 lines)

  Workflow: Added task node to Phase N (status: pending → success)

  Timeline: Phase N progress: 60% → 75%
   Justification: "Core features complete, testing remaining"

  Architecture: Added FeatureComponent to components group

  Decision: Implementation Choice (if applicable)

  Version: SEED_VERSION N → N+1

Build Status: Passing
```

---

### Common Mistakes to Avoid

- Updating tracker only when asked → Should be automatic
- Vague issue descriptions → Must include files/lines/reasoning
- Status doesn't match reality → Honest progress only
- Forgetting version bump → Every change requires it
- Skipping "pending" status → Must update before AND after
- Inconsistent cross-tab data → Keep all sections aligned
- Writing code without tracker update → Update tracker FIRST
- Stale wiki docs → Update or remove when code changes
- Progress without justification → Always explain the percentage

**Authority:** Mandatory — enforces tracker workflow. Cannot be skipped.

## Examples

**Example: Feature Implementation**
```
User: "Add dark mode toggle"

Step 1-2: Plan and get approval

Step 3 (BEFORE code):
  Board Issue SF-045: [FEAT] Dark mode toggle — Status: In Progress
  Workflow: Task node added to Phase 2, status: pending
  Timeline: Phase 2 progress 60% → 65% ("starting new feature")
  Architecture: Added ThemeContext, useTheme hook
  Version: v45 → v46

Step 4: Write code

Step 5 (AFTER code):
  Board Issue SF-045: Status → Done
  Workflow: Task status → success
  Timeline: Phase 2 progress 65% → 75% ("feature complete and tested")
  Wiki: Updated UI Components page with theme system docs
  Version: v46 → v47

Step 6: npm run build → Pass
```

**Example: Bug Fix**
```
User: "Fix infinite loop in useEffect"

Step 3 (BEFORE):
  Board Issue SF-046: [BUG] Fix infinite render loop — Status: In Progress
  Workflow: Task node, status: pending
  Timeline: Phase 4 progress 85% → 87%
  Version: v47 → v48

Step 4: Fix dependency array

Step 5 (AFTER):
  Board Issue SF-046: Status → Done
  Workflow: Task status → success
  Timeline: Phase 4 progress 87% → 90% ("bug fixed and verified")
  Version: v48 → v49

Step 6: Build passes
```
