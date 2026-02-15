---
name: storyflow-tracker
description: >
  Enforces mandatory project tracker workflow with production-grade quality standards.
  Automatically triggers before/after code execution. Plan → Update tracker → Execute
  → Update tracker → Verify build. Every entry meets professional documentation standards.
---

# StoryFlow Tracker

Enforces mandatory project tracker workflow for ANY coding task. The tracker is the single source of truth with production-grade quality standards.

## When to use

**AUTOMATIC TRIGGERS (no user prompt needed):**
- About to write any code or make changes
- Just finished writing code or making changes
- Planning a feature, implementing a feature, fixing a bug
- User says: "update tracker", "add board issue", "track this work", "what's the tracker workflow"

**This skill activates automatically for Claude Code projects. You do not need to be asked.**

## Instructions

**Critical Principle: The Tracker is Law**
Every piece of work MUST be in the tracker. No code without tracker updates. No exceptions.

**Adaptive Principle: Standards Are Evolving**
The tracker structure and fields are still evolving. Always inspect the actual tracker file to understand:
- What sections exist
- What field names are used
- What status values are valid
- What relationships/hierarchies exist

Don't assume a fixed schema - adapt to what the tracker actually contains. If new sections or fields appear, use them.

### The Mandatory 6-Step Workflow

**Step 1: Plan First (before any code)**
- Enter plan mode
- Explore codebase
- Design approach
- Identify which tracker sections will need updates

**Step 2: Get Plan Approved**
- Exit plan mode
- Present plan to user
- Wait for approval (DO NOT proceed without approval)

**Step 3: Update Tracker BEFORE Execution**

Read the tracker file to understand its current structure and fields. The standard is evolving, so adapt to what exists in the file.

**Core update areas (check which ones exist in your tracker):**

1. **Board Issues** (if tracker has issues/board section)
   - Add new issue with the project's prefix
   - Set status: `In Progress`
   - Use whatever field names the tracker uses (check the actual schema)
   - Set parentId/epic if tracker uses hierarchy
   - Assign to current sprint if tracker uses sprints
   - Increment issue counter if present
   
   **PRODUCTION-GRADE DESCRIPTION (Minimum 100 words):**
   - File paths affected: `src/components/Feature.tsx`, `src/hooks/useFeature.ts`
   - Line counts: +45 lines (Feature.tsx), +30 lines (useFeature.ts)
   - Reasoning: Users requested real-time updates; polling creates server load
   - User impact: Updates appear within 2 seconds instead of 30-second delay
   
   **Format:** [Context (why)] → [Changes (what)] → [Impact (so what)]

2. **Workflow Sub-Tasks** (if tracker has workflow/tasks section)
   - Add task node to relevant phase/workflow
   - Set status to `pending` (or whatever "not started" status the tracker uses)
   - Use the tracker's actual node structure (adapt to schema)
   
   **PRODUCTION-GRADE NOTES (Structured format):**
   - What was done: Created WebSocket connection handler
   - Why this approach: Socket.io chosen for reconnection logic  
   - Files touched: `server/websocket.ts` (+120 lines), `client/useSocket.ts` (+45 lines)
   - Decisions made: Used Socket.io over native WebSockets for reliability
   - Problems encountered: CORS issues resolved by adding origin whitelist

3. **Timeline Progress** (if tracker has timeline/phases)
   - Update progress percentage (0-100) for affected phase
   - Use honest percentages (actual completion, not wishful thinking)
   - **ALWAYS include justification:**
     - "75% complete - all features done, polish remaining"
     - "20% complete - scaffolding only, core logic pending"
   - Add milestones if tracker supports them
   - Adjust dates if needed

4. **Wiki/Documentation** (if tracker has wiki/docs section)
   - Update relevant pages when features or architecture change
   - Update Architecture Overview when new directories/components created
   - Remove or update stale content
   - Update timestamps if tracked

5. **Decisions/ADRs** (if tracker has decisions/ADR section)
   - Add decision record for non-trivial architectural choices
   - Use whatever fields the tracker defines
   
   **PRODUCTION-GRADE DECISION (STAR Format):**
   - Situation: Users experiencing 30-second delay for updates
   - Task: Implement real-time communication
   - Action: Evaluated polling vs SSE vs WebSockets; chose Socket.io
   - Result: Sub-2-second updates, 80% reduction in server requests

6. **Architecture Components** (if tracker has architecture/components section)
   - Add new components when modules/files created
   - Include: name, description, type, relationships/dependencies
   - Keep synchronized with actual codebase structure

7. **Version/Metadata** (if tracker has versioning)
   - Bump version constant or increment counter
   - Update last modified timestamp
   - Any other metadata the tracker tracks

**Flexible approach:**
- Inspect the tracker file first to see what sections exist
- Update all relevant sections that apply to your changes
- If the tracker has additional sections not listed above, update those too
- If the tracker is missing sections, focus on what exists
- Adapt field names to match the tracker's actual schema (don't assume)

**Step 4: Execute the Work**
- Write code
- Make changes
- Implement feature/fix

**Step 5: Update Tracker AFTER Execution**

Update the same sections you updated in Step 3, but now reflecting completion:

1. **Board Issues**: Set status to `Done` (or whatever "completed" status the tracker uses)
2. **Workflow Sub-Tasks**: Change status to `success` (or completed equivalent)
3. **Timeline Progress**: Update percentages based on actual completion
4. **Wiki/Architecture/Decisions**: Add any post-execution updates or corrections
5. **Version/Metadata**: Bump version again (if tracker uses versioning)

Adapt to the tracker's actual structure - use the field names and statuses it defines.

**Step 6: Verify Build**
- Run project's build command
- Must pass clean
- If fails, fix and update tracker again

### Production-Grade Quality Standards

**Visual Formatting Guidelines:**

**Issue Titles (Use consistent format):**
```
[TYPE-###] Brief description
- [FEAT-045] Add dark mode toggle to navbar
- [BUG-046] Fix infinite render loop in Dashboard
- [ARCH-047] Create API service layer
```

**Status Badges (Use exact colors if tracker supports):**
```
- In Progress: #3b82f6 (blue)
- Done: #10b981 (green)
- Blocked: #ef4444 (red)
- Review: #f59e0b (orange)
- Pending: #6b7280 (gray)
```

**Progress Bars (Always justify):**
```
Good: "75% - features complete, testing + polish remaining"
Good: "20% - project scaffolding only, core logic pending"
Bad: "50%" (no justification)
Bad: "90%" (when only basic structure exists)
```

### Consistency Validation Checklist

**Before Execution (Step 3):**
- [ ] Version bumped?
- [ ] All affected sections identified?
- [ ] Dependencies mapped in architecture?
- [ ] Status set to "In Progress" or equivalent?
- [ ] Description meets 100-word minimum with file paths?
- [ ] Epic/sprint assigned if tracker uses them?

**After Execution (Step 5):**
- [ ] Status updated to "Done" or equivalent?
- [ ] Version bumped again?
- [ ] Build verified and passing?
- [ ] Cross-references added (decision → issues, workflow → timeline)?
- [ ] Stale docs removed or updated?
- [ ] Progress percentages honest and justified?

### Cross-Tab Consistency Rules

The tracker sections should tell a coherent story. Common relationships:
- Workflow/tasks ↔ Timeline phases (if both exist, keep aligned)
- Board issues ↔ Sprints/milestones (if using agile structure)
- Architecture components ↔ Actual codebase (always keep current)
- Documentation ↔ Current code state (never let docs go stale)
- Decisions ↔ Issues/tasks that implemented them (cross-reference when possible)

**Flexible approach:**
- Inspect which sections exist in your tracker
- Consider how changes to one section might affect others
- When updating a section, think about ripple effects
- Better to over-update than under-update
- Adapt to the specific relationships your tracker uses

### Detail and Transparency Standards

Write every entry as if audited by someone else:

**Board Issue Descriptions:**
- Specific file names and paths
- Line counts added/changed/removed
- WHY the change (reasoning, not just mechanics)
- User experience impact

**Workflow Task Notes:**
- What actually happened (not title restated)
- Decisions made during execution
- Problems encountered and solutions
- Files touched and modifications made

**Decision Context:**
- Problem that prompted the decision
- Constraints and requirements
- Why alternatives were rejected (honest reasoning)

**Wiki Content:**
- Written for first-time codebase readers
- Current, accurate, helpful
- No assumptions about prior knowledge

**Timeline Progress:**
- Honest percentages (actual completion)
- Not optimistic estimates
- Not "touched phase so bump it"
- Always include justification

### Finding the Tracker File

1. Check project config/docs for tracker file path
2. Common locations: `/seed/project-tracker.ts`, `/data/seed.ts`, `/lib/seed-data.ts`
3. Look for file with: board issues, workflow nodes, timeline phases, wiki pages
4. If unsure, ask user: "Where is the tracker file located?"

### Output Format

After each tracker update:
```
Tracker Updated:

✅ Board Issue: [SF-123] Task Title
   Status: In Progress → Done
   Files: src/components/Feature.tsx (+45 lines)
   Description: 120 words with context/changes/impact
   
✅ Workflow: Added task node to Phase 2 (status: pending → success)
   Notes: Structured format with What/Why/Files/Decisions

✅ Timeline: Phase 2 progress: 60% → 75% 
   Justification: "Core features complete, testing + docs remaining"

✅ Architecture: Added FeatureComponent to components group
   Dependencies: [useFeature, FeatureContext]

✅ Decision: WebSocket Implementation (STAR format)
   Situation/Task/Action/Result documented

✅ Version: Bumped to v1.2.3

Build Status: ✅ Passing
```

### Common Mistakes to Avoid

❌ **Updating tracker only when asked** → Should be automatic
❌ **Vague issue descriptions** → Must be 100+ words with files/lines/reasoning
❌ **Status doesn't match reality** → Honest progress only
❌ **Forgetting version bump** → Every change requires bump
❌ **Skipping "pending" status** → Must update before AND after
❌ **Inconsistent cross-tab data** → Keep all sections aligned
❌ **Writing code without tracker update** → Update tracker FIRST
❌ **Stale wiki docs** → Update or remove when code changes
❌ **Progress without justification** → Always explain percentage
❌ **Missing file paths in descriptions** → Production standard requires specifics

**Authority:**
Mandatory - enforces tracker workflow. Cannot be skipped. Architect must comply.

## Examples

**Example 1: Feature Implementation (Production-Grade)**
```
User: "Add dark mode toggle to navbar"

StoryFlow Tracker (BEFORE any code):
  Step 1 - Plan: Analyzing navbar component, theme context, localStorage...
  
  Step 2 - Approval: [presents plan, waits]
  
  User: "Approved"
  
  Step 3 - Update Tracker BEFORE:
    ✅ Board Issue SF-045:
       Title: [FEAT-045] Implement dark mode toggle
       Status: In Progress
       Description (142 words):
       "Users have requested dark mode support for better viewing at night.
       This feature will add a toggle button to the Navbar component that
       switches between light and dark themes. Implementation involves
       creating a ThemeContext for global state management and a useTheme
       hook for components to access theme state. Toggle state will persist
       to localStorage so user preference is remembered across sessions.
       
       Files affected:
       - src/components/Navbar.tsx (~30 lines added for toggle UI)
       - src/hooks/useTheme.ts (~50 lines new file for theme logic)
       - src/contexts/ThemeContext.tsx (~40 lines new file for state)
       
       User impact: Users can switch to dark mode with a single click,
       reducing eye strain during night usage. Preference saves automatically
       and persists across sessions."
       
       Priority: Medium, Points: 3
       Epic: SF-010 (UI Improvements)
       Sprint: Sprint 3
    
    ✅ Workflow Task Node:
       Added to Phase 2 (Feature Development)
       Title: "Dark mode implementation"
       Status: pending
       Notes (Structured):
       "What: Create theme toggle with persistent state management
        Why: User feature request for night-time viewing comfort
        Files: Will modify Navbar.tsx, create useTheme.ts and ThemeContext.tsx
        Approach: Context API for global state, localStorage for persistence
        Decisions: Chose Context over Redux (simpler, no external deps)"
    
    ✅ Timeline: Phase 2 progress 60% → 65%
       Justification: "Starting new feature, 5% allocation reasonable for 3-point story"
    
    ✅ Architecture Components:
       - Added: ThemeContext (type: context, parentId: contexts-group)
       - Added: useTheme (type: hook, parentId: hooks-group)
       - Dependencies: useTheme depends on ThemeContext
    
    ✅ Version: v1.2.0 → v1.2.1
  
  Step 4 - Execute:
    [writes code for Navbar.tsx, useTheme.ts, ThemeContext.tsx]
  
  Step 5 - Update Tracker AFTER:
    ✅ Board Issue SF-045:
       Status: In Progress → Done
       Updated timestamp
    
    ✅ Workflow task:
       Status: pending → success
       Notes updated: "Completed - all files created, localStorage working,
       toggle tested in light and dark modes, no issues"
    
    ✅ Timeline: Phase 2 progress 65% → 75%
       Justification: "Dark mode feature complete and tested, moved 10%
       closer to phase completion"
    
    ✅ Wiki: Updated "UI Components" page
       Added section on theme system and toggle usage
    
    ✅ Decision: Added "Theme Implementation" decision record
       Situation: Users requested dark mode for night viewing
       Task: Implement theme switching with persistence
       Action: Evaluated CSS variables + localStorage vs styled-components
       theming. Chose CSS variables for simplicity and performance.
       Result: 50 lines added, ~5ms localStorage access, no re-renders
       on theme change due to CSS variables
    
    ✅ Version: v1.2.1 → v1.2.2
  
  Step 6 - Verify: npm run build → ✅ Pass

Tracker Updated:
✅ All sections updated with production-grade detail
✅ 142-word description with context/changes/impact
✅ Structured workflow notes with What/Why/Files/Decisions
✅ Progress justified (60% → 65% → 75%)
✅ STAR decision record
✅ Build passing
```

**Example 2: Bug Fix (Production-Grade)**
```
User: "Fix the infinite loop in useEffect"

StoryFlow Tracker:
  [Plan: Identified issue in Dashboard.tsx line 45]
  [Approved]
  
  BEFORE Execution:
    ✅ Board Issue SF-046:
       Title: [BUG-046] Fix infinite render loop in Dashboard
       Status: In Progress
       Description (105 words):
       "Dashboard component enters infinite re-render loop due to missing
       dependency in useEffect hook at line 45-60. The hook fetches user
       data but lacks 'data' in dependency array, causing infinite API calls.
       
       Files affected:
       - src/pages/Dashboard.tsx (line 45-60, dependency array fix)
       
       User impact: Users experience browser freeze when navigating to
       Dashboard page. After fix, dashboard will load correctly without
       performance issues. API calls reduced from infinite to single call
       on mount."
       
       Priority: High (blocking users)
       Points: 1
    
    ✅ Workflow task:
       Status: pending
       Notes: "Fix missing dependency 'data' in useEffect array at line 45"
    
    ✅ Timeline: Phase 4 progress 85% → 87%
       Justification: "Bug fix adds 2% to phase completion"
    
    ✅ Version: v1.3.0 → v1.3.1
  
  [Execute: Fix useEffect dependency array]
  
  AFTER Execution:
    ✅ Board Issue SF-046: Status → Done
    ✅ Workflow task: Status → success
    ✅ Timeline: Phase 4 progress 87% → 90%
       Justification: "Bug fixed and verified, phase 90% complete"
    ✅ Version: v1.3.1 → v1.3.2
  
  [Verify: Build passes]

✅ Tracker updated with production-grade standards
```
