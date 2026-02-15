# Project Tracker Workflow (MANDATORY — all projects)

> **This file is the canonical source of truth for how Claude tracks work across ALL projects that use StoryFlow.** It is version-controlled in git and intended to be portable — copy it to `~/.claude/CLAUDE.md` or any new project's root to enforce the same workflow.

The project's seed/tracker file is the single source of truth for what has been planned, what is in progress, and what is done. **Every piece of work must be reflected in the tracker. This is non-negotiable and must happen automatically without the user asking. There are no exceptions.**

---

## The Workflow (always follow this exact order)

1. **Plan first** — Enter plan mode, explore the codebase, design the approach
2. **Get plan approved** — Exit plan mode, wait for user approval
3. **Update tracker BEFORE execution** — Add the planned work:
   - Add board issue(s) with the project's issue prefix and status `In Progress`
   - Add/update workflow sub-task nodes for the relevant phase (status: `pending`)
   - Update timeline phase progress to reflect the new work starting
   - Add a decision record if an architectural choice was made during planning
   - Bump the version constant in the tracker file
4. **Execute the work** — Write the code, make the changes
5. **Update tracker AFTER execution** — Reflect completed work:
   - Set board issue status to `Done`
   - Update workflow sub-task node status to `success`
   - Adjust timeline phase progress percentages
   - Update wiki documentation if the change affects documented features or architecture
   - Add new architecture components if new modules/directories were created
   - Bump the version constant again
6. **Verify build** — The project's build command must pass clean

---

## What to Update (all 7 areas — check every one, every time)

### 1. Board Issues (ALWAYS — no exceptions)
- Add a new issue for every feature, fix, or task
- Required fields: `id, type, key, title, description, status, priority, storyPoints, assignee, labels, parentId, sprintId, createdAt, updatedAt`
- **Descriptions must be detailed for transparency and audit purposes:**
  - What files were created, modified, or deleted
  - How many lines were added/changed/removed
  - WHY the change was made (the motivation, not just the mechanics)
  - What the user will see or experience differently
- Use the correct field name for story points (check the project's UI components to confirm)
- Set `parentId` to the relevant epic
- Assign to the current sprint
- Increment the issue counter after adding

### 2. Workflow Sub-Tasks (when the work falls under an existing phase)
- Add a task node to the relevant phase's sub-workflow (`children.nodes[]` array)
- Set node `status` to `'pending'` before execution, `'success'` after
- Add connections from/to adjacent nodes in the sub-workflow
- Use consistent node structure: `{ id, type: 'task', title, x, y, status, config: { assignee, notes } }`
- **Notes must serve as an audit trail** — describe what was actually done in enough detail that someone reading the tracker 6 months later can understand what happened, which files were touched, and why
- Position nodes logically relative to existing nodes in the sub-workflow (consistent x/y spacing)

### 3. Timeline Progress (when the work affects a tracked phase)
- Update the relevant phase's `progress` percentage (0-100)
- **Use honest percentages** — progress should reflect actual completion, not optimistic estimates or "I touched this phase so I'll bump it"
- If a new milestone was reached, add it to the phase's milestones array
- Keep phase dates accurate — adjust `endDate` if work extends beyond the original plan
- If all work in a phase is complete, set progress to 100 and ensure the phase status reflects that

### 4. Wiki Documentation (when features or architecture change)
- If a feature changes documented architecture, update the relevant wiki page content
- **Mandatory when new directories or components are created** — update the Architecture Overview page to reflect the current file structure
- If a new pattern was established, document it in the relevant wiki page
- If existing documentation becomes stale due to the change, update or remove it — stale docs are worse than no docs
- Update `updatedAt` on any modified pages

### 5. Decisions (when an architectural choice was made)
- Add a decision record any time a non-trivial technical choice was made (layout algorithm, rendering strategy, data model change, library selection, etc.)
- Required fields: `id, title, status, context, decision, alternatives[], consequences, createdAt, updatedAt`
- **Context must explain the problem** that prompted the decision, not just the solution chosen
- **Alternatives must include at least 2-3 options** that were genuinely considered, with honest pros and cons — no strawman arguments designed to make the chosen option look good
- **Consequences must describe the real impact** — what trade-offs were accepted, what technical debt was introduced, what future work is enabled or blocked

### 6. Architecture Components (when new modules are created)
- If new components, hooks, contexts, services, or utilities were created, add them to the architecture components array
- Every component must have: `id, name, description, type, parentId, dependencies[]`
- Set `parentId` to the appropriate group node — components should never be orphaned at root level
- Set `dependencies` to reference the IDs of other components this one imports from or depends on
- If a component was deleted, remove it from the array
- Keep the architecture tree accurate — it should reflect the actual codebase, not an aspirational design

### 7. Version Constant (ALWAYS — no exceptions)
- Bump the version constant in the tracker/seed file after every change
- The project's migration function auto-replaces the tracker data when the version is outdated
- The project's fixed ID prevents URL breakage across version bumps

---

## Cross-Tab Consistency (CRITICAL)

The 7 tabs share the same project and must tell a coherent, consistent story:
- Workflow nodes should mirror timeline phases
- Board sprints should match timeline dates
- Architecture components should reflect the actual codebase at this point in time
- Wiki docs should match the current state of the code, not a previous version
- Decisions should reference the board issues and workflow tasks that implemented them
- **Never update one section in isolation** — always consider the ripple effects across all 7 tabs
- If you're unsure whether a change affects another tab, check — it's better to over-update than under-update

---

## Detail and Transparency Standards

Every tracker entry should be written as if someone else will audit it:
- **Board issue descriptions:** Specific file names, line counts, what was added/changed/removed, and the reasoning behind the change
- **Workflow task notes:** Describe the actual work done — not just the title restated, but what happened, what decisions were made in the moment, what problems were encountered
- **Decision context:** Explain the problem or need that prompted the decision, the constraints that shaped it, and why the alternatives were rejected
- **Wiki content:** Written for a developer encountering the codebase for the first time — current, accurate, and helpful
- **Timeline progress:** Honest percentages based on actual completion, not wishful thinking
