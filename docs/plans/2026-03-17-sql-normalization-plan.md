# SQL Normalization Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Migrate StoryFlow from JSON blob storage to normalized SQL tables using parallel-write-swap-read, then refactor frontend to entity-specific stores.

**Architecture:** Four-phase migration (shadow write, verify, swap read, kill blob). Each db.js function gets a dual-mode wrapper that branches on migration_state. Frontend splits from monolithic projectsStore into 8 entity stores. CLI unchanged (API contract preserved).

**Tech Stack:** sql.js (existing), Zustand (existing), Vitest (existing), Express (existing)

---

## Task 1: Create Normalized Schema Tables

**Files:**
- Modify: `server/db.js:26-107` (inside initDb)

**Step 1: Write the failing test**

Add to server/app.test.js:

```javascript
import { describe, it, expect, beforeAll } from 'vitest'

describe('Normalized schema', () => {
  it('creates all normalized tables on init', async () => {
    const tables = db.exec(
      "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
    )
    const tableNames = tables[0].values.map(r => r[0])

    expect(tableNames).toContain('issues')
    expect(tableNames).toContain('comments')
    expect(tableNames).toContain('sprints')
    expect(tableNames).toContain('pages')
    expect(tableNames).toContain('decisions')
    expect(tableNames).toContain('phases')
    expect(tableNames).toContain('milestones')
    expect(tableNames).toContain('workflow_nodes')
    expect(tableNames).toContain('workflow_connections')
    expect(tableNames).toContain('architecture_components')
    expect(tableNames).toContain('architecture_connections')
    expect(tableNames).toContain('migration_state')
  })

  it('migration_state defaults to shadow_write', () => {
    const result = db.exec("SELECT value FROM migration_state WHERE key = 'mode'")
    expect(result[0].values[0][0]).toBe('shadow_write')
  })
})
```

**Step 2: Run test to verify it fails**

Run: `cd server && npm test -- --run`
Expected: FAIL (tables do not exist)

**Step 3: Write the schema creation SQL**

In server/db.js, inside initDb after the existing projects table (after line 61), add all CREATE TABLE IF NOT EXISTS statements from the design doc. Sprints MUST be created before issues (FK dependency). Add migration_state table and seed with shadow_write.

See schema in: docs/plans/2026-03-17-sql-normalization-design.md

**Step 4: Run test to verify it passes**

Run: `cd server && npm test -- --run`
Expected: PASS

**Step 5: Commit**

```
git add -f server/db.js server/app.test.js
git commit -m "feat: create normalized SQL tables alongside existing blob schema"
```

---

## Task 2: Add Migration Mode Helper

**Files:**
- Modify: `server/db.js`

**Step 1: Write the failing test**

```javascript
describe('Migration mode', () => {
  it('getMigrationMode returns shadow_write by default', () => {
    expect(db.getMigrationMode()).toBe('shadow_write')
  })

  it('setMigrationMode changes the mode', () => {
    db.setMigrationMode('read_normalized')
    expect(db.getMigrationMode()).toBe('read_normalized')
    db.setMigrationMode('shadow_write')
  })

  it('rejects invalid modes', () => {
    expect(() => db.setMigrationMode('invalid')).toThrow()
  })
})
```

**Step 2: Run test to verify it fails**

Run: `cd server && npm test -- --run`
Expected: FAIL (functions not defined)

**Step 3: Write the implementation**

In server/db.js, add after the withProjectLock function:

```javascript
const VALID_MIGRATION_MODES = ['shadow_write', 'read_normalized', 'normalized']
let _migrationModeCache = null

export function getMigrationMode() {
  if (_migrationModeCache) return _migrationModeCache
  const result = db.exec("SELECT value FROM migration_state WHERE key = 'mode'")
  _migrationModeCache = result.length > 0 ? result[0].values[0][0] : 'shadow_write'
  return _migrationModeCache
}

export function setMigrationMode(mode) {
  if (!VALID_MIGRATION_MODES.includes(mode)) {
    throw new Error('Invalid migration mode: ' + mode + '. Must be one of: ' + VALID_MIGRATION_MODES.join(', '))
  }
  db.run("UPDATE migration_state SET value = ?, updated_at = ? WHERE key = 'mode'",
    [mode, new Date().toISOString()])
  _migrationModeCache = mode
  scheduleSave()
}
```

**Step 4: Run test to verify it passes**

Run: `cd server && npm test -- --run`
Expected: PASS

**Step 5: Commit**

```
git add server/db.js server/app.test.js
git commit -m "feat: add migration mode getter/setter with validation"
```

---

## Task 3: Backfill Script - Unpack Existing Blobs into Normalized Tables

**Files:**
- Create: `server/migrate.js`

**Step 1: Write the failing test**

```javascript
describe('Blob backfill', () => {
  it('unpacks all blob entities into normalized tables', async () => {
    const projectId = 'test-backfill-' + Date.now()
    db.addProject({
      id: projectId,
      name: 'Backfill Test',
      description: 'Test project',
      board: {
        issues: [{
          id: 'i1', key: 'BF-1', title: 'Issue One', type: 'task',
          status: 'To Do', priority: 'medium',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          comments: [{ id: 'c1', body: 'A comment', author: 'human', createdAt: new Date().toISOString() }]
        }],
        sprints: [{
          id: 's1', name: 'Sprint 1', status: 'planning',
          createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
        }],
        nextIssueNumber: 2
      },
      pages: [{ id: 'p1', title: 'Test Page', content: '# Hello', createdBy: 'system',
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }],
      decisions: [{ id: 'd1', title: 'Use SQL', status: 'accepted', author: 'human',
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }],
      timeline: {
        phases: [{ id: 'ph1', name: 'Phase 1', status: 'active', progress: 50,
          createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }],
        milestones: [{ id: 'm1', name: 'MVP', completed: false, dueDate: '2026-04-01',
          createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }]
      },
      workflow: { nodes: [], connections: [] },
      architecture: { components: [], connections: [] }
    })

    await backfillProject(projectId)

    const issues = db.exec("SELECT id, key, title FROM issues WHERE project_id = '" + projectId + "'")
    expect(issues[0].values.length).toBe(1)
    expect(issues[0].values[0][1]).toBe('BF-1')

    const comments = db.exec("SELECT id, body FROM comments WHERE project_id = '" + projectId + "'")
    expect(comments[0].values.length).toBe(1)

    const sprints = db.exec("SELECT id, name FROM sprints WHERE project_id = '" + projectId + "'")
    expect(sprints[0].values.length).toBe(1)

    const pages = db.exec("SELECT id, title FROM pages WHERE project_id = '" + projectId + "'")
    expect(pages[0].values.length).toBe(1)

    const decisions = db.exec("SELECT id, title FROM decisions WHERE project_id = '" + projectId + "'")
    expect(decisions[0].values.length).toBe(1)

    const phases = db.exec("SELECT id, name FROM phases WHERE project_id = '" + projectId + "'")
    expect(phases[0].values.length).toBe(1)

    const milestones = db.exec("SELECT id, name FROM milestones WHERE project_id = '" + projectId + "'")
    expect(milestones[0].values.length).toBe(1)

    db.deleteProject(projectId)
  })
})
```

**Step 2: Run test - should fail (backfillProject not defined)**

**Step 3: Implement server/migrate.js**

Create backfillProject(db, project) and backfillAll(db, listProjects, getProject). For each entity type: read from blob, INSERT OR REPLACE into SQL table. Handle:
- Sprints before issues (FK dependency)
- Nested workflow node children via recursive flattening to parent_node_id
- JSON.stringify for labels and linked_issue_keys arrays
- Boolean to integer conversion for milestones.completed

**Step 4: Run test - should pass**

**Step 5: Commit**

```
git add server/migrate.js server/app.test.js
git commit -m "feat: add blob-to-SQL backfill for all entity types"
```

---

## Task 4: Run Backfill on Init (One-Time Population)

**Files:**
- Modify: `server/db.js:26-115` (inside initDb)

**Step 1: Write the failing test**

Verify that after initDb, normalized tables contain the same data as existing blobs.

**Step 2: Run - fail**

**Step 3: Add backfill call to end of initDb**

Import backfillAll from migrate.js. After initEvents/initSteering, if getMigrationMode returns shadow_write, run backfillAll. Log count.

**Step 4: Run - pass**

**Step 5: Commit**

```
git add server/db.js
git commit -m "feat: auto-backfill normalized tables on init during shadow_write phase"
```

---

## Task 5: Shadow Write - Issues (Dual-Write on Every Mutation)

**Files:**
- Modify: `server/db.js:415-550` (issue functions)

This is the pattern task. Every subsequent entity follows the same pattern.

**Step 1: Write the failing test**

Test that addIssue, updateIssue, deleteIssue, and addComment all write to BOTH blob AND SQL tables. For each operation, verify the blob via getProject and the SQL via direct query.

**Step 2: Run - fail**

**Step 3: Add shadow writes to each issue function**

After each blob mutation (after upsertProject call), add corresponding SQL write. Pattern:

```javascript
// At end of addIssue, after upsertProject:
const mode = getMigrationMode()
if (mode === 'shadow_write' || mode === 'read_normalized') {
  db.run('INSERT OR REPLACE INTO issues (...) VALUES (...)', [...fields...])
}
```

Apply to: addIssue, updateIssue, updateIssueByKey, deleteIssue, deleteIssueByKey, addComment, addCommentByKey.

For deletes: DELETE FROM issues WHERE id = ? AND project_id = ?
For comments: INSERT INTO comments (id, issue_id, project_id, body, author, created_at) VALUES (...)

**Step 4: Run - pass**

**Step 5: Commit**

```
git add server/db.js server/app.test.js
git commit -m "feat: shadow write issues and comments to normalized SQL tables"
```

---

## Task 6: Shadow Write - Sprints

**Files:**
- Modify: `server/db.js:552-670`

Same dual-write pattern as Task 5 for: addSprint, updateSprint, deleteSprint.

**Step 1-5: Same TDD cycle**

```
git commit -m "feat: shadow write sprints to normalized SQL tables"
```

---

## Task 7: Shadow Write - Pages

**Files:**
- Modify: `server/db.js:593-655`

Same pattern for: addPage, updatePage, deletePage.

```
git commit -m "feat: shadow write pages to normalized SQL tables"
```

---

## Task 8: Shadow Write - Decisions

**Files:**
- Modify: `server/db.js:727-778`

Same pattern for: addDecision, updateDecision, deleteDecision.

```
git commit -m "feat: shadow write decisions to normalized SQL tables"
```

---

## Task 9: Shadow Write - Phases and Milestones

**Files:**
- Modify: `server/db.js:779-884`

Same pattern for: addPhase, updatePhase, deletePhase, addMilestone, updateMilestone, deleteMilestone.

```
git commit -m "feat: shadow write phases and milestones to normalized SQL tables"
```

---

## Task 10: Shadow Write - Workflow Nodes and Connections

**Files:**
- Modify: `server/db.js:885-1010`

Most complex shadow write due to nested child nodes. addWorkflowNode and updateWorkflowNode need special handling for parent_node_id and child status derivation.

Apply to: addWorkflowNode, updateWorkflowNode, deleteWorkflowNode, linkIssueToWorkflowNode, unlinkIssueFromWorkflowNode.

Note: Nested children.nodes in blob maps to parent_node_id in SQL.

```
git commit -m "feat: shadow write workflow nodes and connections to normalized SQL tables"
```

---

## Task 11: Shadow Write - Architecture Components and Connections

**Files:**
- Modify: `server/db.js:1012-1077`

Same pattern for: addArchitectureComponent, updateArchitectureComponent, deleteArchitectureComponent.

```
git commit -m "feat: shadow write architecture components and connections to normalized SQL tables"
```

---

## Task 12: Shadow Write - addProject Auto-Scaffolding

**Files:**
- Modify: `server/db.js:1202-1234`

When addProject creates auto-scaffolded wiki pages, those pages also need SQL writes. Also write next_issue_number to projects table.

```
git commit -m "feat: shadow write auto-scaffolded pages on project creation"
```

---

## Task 13: Verification - Compare Blob vs SQL

**Files:**
- Create: `server/verify.js`
- Modify: `server/app.js` (add /api/migrate/verify endpoint)

**Step 1: Write the test**

Test that verify returns zero discrepancies when blob and SQL are in sync, and reports discrepancies when they are not (delete a SQL row manually, run verify, confirm it detects the gap).

**Step 2: Run - fail**

**Step 3: Implement verify.js**

For each project, for each entity type: build a map from SQL rows, compare against blob array field-by-field. Report: missing_in_sql, missing_in_blob, field_mismatch.

Add API endpoint: GET /api/migrate/verify (or POST with optional projectId filter).

**Step 4: Run - pass**

**Step 5: Commit**

```
git add server/verify.js server/app.js server/app.test.js
git commit -m "feat: add blob vs SQL verification for migration integrity"
```

---

## Task 14: CLI Migration Commands

**Files:**
- Create: `cli/src/commands/migrate.js`
- Modify: `cli/src/index.js`

Add CLI commands that call migration API endpoints:

- `storyflow migrate status` - GET /api/migrate/status
- `storyflow migrate verify` - POST /api/migrate/verify
- `storyflow migrate advance` - POST /api/migrate/advance
- `storyflow migrate rollback` - POST /api/migrate/rollback

Add corresponding API endpoints in server/app.js. advance moves shadow_write to read_normalized to normalized. rollback reverses.

```
git commit -m "feat: add storyflow migrate CLI commands and API endpoints"
```

---

## Task 15: Swap Read - Issues

**Files:**
- Modify: `server/db.js:324-414` (listIssues), `server/db.js:489-496` (getIssueByKey), `server/db.js:674-726` (getBoardSummary)

When getMigrationMode returns read_normalized or normalized, read from SQL instead of blob. Response shape MUST match the blob-era shape exactly (same field names, same structure).

**Step 1: Write test**

Set mode to read_normalized. Call listIssues. Verify response shape matches: { issues: [...], total: N }. Each issue has: id, key, title, status, type, priority, storyPoints, etc. Same for getBoardSummary shape.

**Step 2: Run - fail**

**Step 3: Implement SQL read paths**

Add mode check at top of each read function. If normalized mode, use SQL queries with proper WHERE, ORDER BY, pagination. Map SQL column names (snake_case) to API response names (camelCase).

**Step 4: Run - pass**

**Step 5: Commit**

```
git commit -m "feat: swap read for issues - SQL reads in normalized mode"
```

---

## Task 16: Swap Read - Sprints

Same pattern for listSprints.

```
git commit -m "feat: swap read for sprints - SQL reads in normalized mode"
```

## Task 17: Swap Read - Pages

Same pattern for listPages, getPage.

```
git commit -m "feat: swap read for pages - SQL reads in normalized mode"
```

## Task 18: Swap Read - Decisions

Same pattern for listDecisions.

```
git commit -m "feat: swap read for decisions - SQL reads in normalized mode"
```

## Task 19: Swap Read - Phases and Milestones

Same pattern for listPhases, listMilestones.

```
git commit -m "feat: swap read for phases and milestones - SQL reads in normalized mode"
```

## Task 20: Swap Read - Workflow

Same pattern for listWorkflowNodes, getWorkflowNode. Must reconstruct nested children.nodes structure from flat parent_node_id rows using recursive groupBy.

```
git commit -m "feat: swap read for workflow - SQL reads with tree reconstruction"
```

## Task 21: Swap Read - Architecture

Same pattern for listArchitectureComponents, getArchitectureComponent.

```
git commit -m "feat: swap read for architecture - SQL reads in normalized mode"
```

---

## Task 22: Swap Read - getProject (Reconstruct from Tables)

**Files:**
- Modify: `server/db.js:249-255` (getProject)

In read_normalized mode, getProject must reconstruct the full project object by querying all normalized tables and assembling the blob-compatible shape. This is needed for autoSyncLinkedWorkflowNodes, getBoardSummary, and intelligence.js.

Create internal helper functions (listIssuesRaw, listSprintsRaw, etc.) that return arrays without the API wrapper. Use buildWorkflowTree to reconstruct nested children from flat parent_node_id rows.

```
git commit -m "feat: getProject reconstructs full project from normalized tables"
```

---

## Task 23: Frontend - Create issuesStore.js

**Files:**
- Create: `src/stores/issuesStore.js`
- Create: `src/stores/__tests__/issuesStore.test.js`

**Step 1: Write the test**

Mock fetch. Test fetchIssues populates state. Test createIssue calls API and appends to local state. Test updateIssue calls API and patches local state. Test deleteIssue calls API and removes from local state.

**Step 2: Run - fail**

**Step 3: Implement**

Zustand store with: issues array, loading boolean, error string. Actions: fetchIssues(projectId, filters), createIssue(projectId, issue), updateIssue(projectId, issueKey, updates), deleteIssue(projectId, issueKey), addComment(projectId, issueKey, comment). Each action calls the REST API and updates local state on success.

**Step 4: Run - pass**

**Step 5: Commit**

```
git commit -m "feat: add issuesStore - entity-specific Zustand store"
```

---

## Task 24: Frontend - Create sprintsStore.js

Same pattern as Task 23 for sprints CRUD.

```
git commit -m "feat: add sprintsStore - entity-specific Zustand store"
```

## Task 25: Frontend - Create pagesStore.js

Same pattern for pages CRUD.

```
git commit -m "feat: add pagesStore - entity-specific Zustand store"
```

## Task 26: Frontend - Create decisionsStore.js

Same pattern for decisions CRUD.

```
git commit -m "feat: add decisionsStore - entity-specific Zustand store"
```

## Task 27: Frontend - Create timelineStore.js

Combines phases and milestones in one store (they share the timeline domain).

```
git commit -m "feat: add timelineStore - phases and milestones Zustand store"
```

## Task 28: Frontend - Create workflowStore.js

Nodes and connections. Includes link/unlink issue actions.

```
git commit -m "feat: add workflowStore - nodes and connections Zustand store"
```

## Task 29: Frontend - Create architectureStore.js

Components and connections.

```
git commit -m "feat: add architectureStore - components and connections Zustand store"
```

---

## Task 30: Frontend - Slim Down projectsStore.js

**Files:**
- Modify: `src/stores/projectsStore.js` (1185 lines to approximately 200 lines)

Remove all entity-specific logic. Keep only: project CRUD (list, create, update, delete), active project selection. Remove: syncToServer function, IndexedDB persistence, all issue/page/decision/sprint/phase/milestone/workflow/architecture mutation actions.

This is mechanical: grep for board.issues, board.sprints, project.pages, project.decisions, timeline.phases, timeline.milestones, workflow.nodes, architecture.components and delete those action blocks.

```
git commit -m "refactor: slim projectsStore to project metadata only"
```

---

## Task 31: Frontend - Update Components to Use New Stores

**Files:**
- Modify: All components that access entity data through projectsStore

Find all import sites using grep. Update data access patterns:

- board.issues -> useIssuesStore(s => s.issues)
- board.sprints -> useSprintsStore(s => s.sprints)
- project.pages -> usePagesStore(s => s.pages)
- project.decisions -> useDecisionsStore(s => s.decisions)
- timeline.phases -> useTimelineStore(s => s.phases)
- timeline.milestones -> useTimelineStore(s => s.milestones)
- workflow.nodes -> useWorkflowStore(s => s.nodes)
- architecture.components -> useArchitectureStore(s => s.components)

Add useEffect hooks in container components to call fetchX(activeProjectId) when the active project changes.

```
git commit -m "refactor: update all components to use entity-specific stores"
```

---

## Task 32: Redesign Snapshots for Normalized Tables

**Files:**
- Modify: `server/db.js:1079-1200`

**Step 1: Test**

In read_normalized mode: createSnapshot queries each table and stores per-entity JSON columns. restoreSnapshot deletes existing rows and re-inserts from snapshot within a SQL transaction.

**Step 2: Implement**

Update snapshots table schema (add per-entity columns: issues_data, sprints_data, pages_data, decisions_data, phases_data, milestones_data, workflow_nodes_data, workflow_connections_data, arch_components_data, arch_connections_data).

createSnapshot: SELECT all rows per table for project, JSON.stringify each, store in corresponding column.

restoreSnapshot: BEGIN TRANSACTION, DELETE existing rows per table for project, INSERT rows from snapshot JSON, COMMIT.

**Step 3: Commit**

```
git commit -m "feat: redesign snapshots for normalized tables"
```

---

## Task 33: Kill the Blob - Phase 4

**Files:**
- Modify: `server/db.js` (remove all blob code paths)
- Modify: `server/app.js` (remove /api/sync)
- Delete: `server/migrate.js`
- Delete: `server/verify.js`
- Delete: `cli/src/commands/migrate.js`

Remove from db.js:
- All if (mode === 'shadow_write') blob read paths
- All blob dual-write code (keep only SQL writes)
- withProjectLock function (replace with SQL transactions)
- syncAll function
- data TEXT NOT NULL column from schema
- issue_count and sprint_count denormalized columns

Remove from app.js:
- POST /api/sync endpoint
- Import of withProjectLock

Remove from frontend:
- syncToServer function
- IndexedDB storage config

Remove migration infrastructure:
- server/migrate.js
- server/verify.js
- cli/src/commands/migrate.js

Run full test suite: npm run ci
Expected: All green

```
git commit -m "feat: kill the blob - normalized SQL is the only storage path"
```

---

## Task 34: Final Cleanup and Documentation

**Files:**
- Modify: `CLAUDE.md`
- Modify: `server/db.js`

Update CLAUDE.md architecture section to reflect normalized SQL storage. Remove any remaining dual-mode comments. Run full CI:

```
npm run ci
```

```
git commit -m "chore: post-migration cleanup - update docs, remove migration comments"
```

---

## Execution Summary

| Phase | Tasks | Description |
|-------|-------|-------------|
| Schema | 1-2 | Create tables, migration mode helper |
| Backfill | 3-4 | Unpack blobs, auto-run on init |
| Shadow Write | 5-12 | Dual-write every entity (8 groups) |
| Verification | 13-14 | Blob vs SQL comparison, CLI commands |
| Swap Read | 15-22 | Read from SQL, reconstruct getProject |
| Frontend | 23-31 | 7 new stores, slim projectsStore, update components |
| Snapshots | 32 | Redesign for normalized tables |
| Kill Blob | 33 | Remove all blob code, /api/sync, withProjectLock |
| Cleanup | 34 | Docs, comments, final CI |

**Total: 34 tasks**
