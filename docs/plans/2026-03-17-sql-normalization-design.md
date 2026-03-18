# SQL Normalization: Blob to Normalized Tables

**Date:** 2026-03-17
**Status:** Approved
**Scope:** Full-stack migration — schema, data layer, API internals, frontend stores, snapshot system

## Context

StoryFlow stores all project data in a single JSON blob (`data TEXT` column in the `projects` table). Every entity (issues, sprints, pages, decisions, phases, milestones, workflow nodes, architecture components) is nested inside this blob. All mutations require deserializing the entire blob, modifying it, and writing it back — serialized by `withProjectLock()`.

This design was the right call for v1 (fast iteration, no migrations, simple mental model) but it has reached its ceiling:

- No cross-project queries (load every blob to filter)
- No partial reads (want one issue? Load the whole project)
- No referential integrity (orphaned FKs are silent bugs)
- Every write touches the entire project (read-modify-write cycle)
- `withProjectLock()` serializes ALL writes per project (concurrency bottleneck)
- No SQL indexing on entity fields
- Upcoming features (Lessons Learned, Hot Wash, cross-project analytics) need structured querying

## Decision

Migrate from JSON blob to fully normalized SQL tables using a parallel-write-swap-read strategy. Refactor the frontend from a monolithic project store to entity-specific Zustand stores. Kill the blob, `/api/sync`, and `withProjectLock()`.

## Normalized Schema

### Projects (slimmed)

```sql
CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'planning',
  is_seed INTEGER DEFAULT 0,
  seed_version INTEGER,
  next_issue_number INTEGER DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT
);
```

### Issues

```sql
CREATE TABLE issues (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'task',
  status TEXT NOT NULL DEFAULT 'To Do',
  priority TEXT DEFAULT 'medium',
  story_points INTEGER,
  assignee TEXT,
  epic_id TEXT REFERENCES issues(id) ON DELETE SET NULL,
  sprint_id TEXT REFERENCES sprints(id) ON DELETE SET NULL,
  labels TEXT,                          -- JSON array
  linked_issue_keys TEXT,               -- JSON array
  created_by TEXT,
  created_by_reasoning TEXT,
  created_by_confidence REAL,
  todo_at TEXT,
  in_progress_at TEXT,
  blocked_at TEXT,
  done_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(project_id, key)
);
CREATE INDEX idx_issues_project ON issues(project_id);
CREATE INDEX idx_issues_status ON issues(project_id, status);
CREATE INDEX idx_issues_sprint ON issues(sprint_id);
CREATE INDEX idx_issues_epic ON issues(epic_id);
```

### Comments

```sql
CREATE TABLE comments (
  id TEXT PRIMARY KEY,
  issue_id TEXT NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  author TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX idx_comments_issue ON comments(issue_id);
```

### Sprints

```sql
CREATE TABLE sprints (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  goal TEXT,
  start_date TEXT,
  end_date TEXT,
  status TEXT DEFAULT 'planning',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX idx_sprints_project ON sprints(project_id);
```

### Pages (Wiki)

```sql
CREATE TABLE pages (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  parent_id TEXT REFERENCES pages(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'draft',
  created_by TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX idx_pages_project ON pages(project_id);
```

### Decisions

```sql
CREATE TABLE decisions (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  rationale TEXT,
  status TEXT,
  author TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX idx_decisions_project ON decisions(project_id);
```

### Phases

```sql
CREATE TABLE phases (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT,
  progress INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX idx_phases_project ON phases(project_id);
```

### Milestones

```sql
CREATE TABLE milestones (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  due_date TEXT,
  completed INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX idx_milestones_project ON milestones(project_id);
```

### Workflow Nodes

```sql
CREATE TABLE workflow_nodes (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  parent_node_id TEXT REFERENCES workflow_nodes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT,
  status TEXT DEFAULT 'idle',
  linked_issue_keys TEXT,               -- JSON array
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX idx_workflow_nodes_project ON workflow_nodes(project_id);
CREATE INDEX idx_workflow_nodes_parent ON workflow_nodes(parent_node_id);
```

### Workflow Connections

```sql
CREATE TABLE workflow_connections (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  from_node_id TEXT NOT NULL REFERENCES workflow_nodes(id) ON DELETE CASCADE,
  to_node_id TEXT NOT NULL REFERENCES workflow_nodes(id) ON DELETE CASCADE,
  type TEXT
);
CREATE INDEX idx_workflow_connections_project ON workflow_connections(project_id);
```

### Architecture Components

```sql
CREATE TABLE architecture_components (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT,
  tech TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX idx_arch_components_project ON architecture_components(project_id);
```

### Architecture Connections

```sql
CREATE TABLE architecture_connections (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  from_component_id TEXT NOT NULL REFERENCES architecture_components(id) ON DELETE CASCADE,
  to_component_id TEXT NOT NULL REFERENCES architecture_components(id) ON DELETE CASCADE,
  type TEXT
);
CREATE INDEX idx_arch_connections_project ON architecture_connections(project_id);
```

### Migration State

```sql
CREATE TABLE migration_state (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

### Snapshots (redesigned)

```sql
CREATE TABLE snapshots (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  trigger_action TEXT,
  trigger_entity TEXT,
  trigger_actor TEXT,
  project_data TEXT,
  issues_data TEXT,
  sprints_data TEXT,
  pages_data TEXT,
  decisions_data TEXT,
  phases_data TEXT,
  milestones_data TEXT,
  workflow_nodes_data TEXT,
  workflow_connections_data TEXT,
  arch_components_data TEXT,
  arch_connections_data TEXT,
  created_at TEXT NOT NULL
);
```

## Migration Strategy: Parallel Write, Swap Read

### Phase 1: Shadow Write

- Blob remains source of truth for all reads
- Every mutation writes to BOTH blob and normalized tables
- `migration_state` row: `{ key: 'mode', value: 'shadow_write' }`
- App behavior is unchanged from the outside
- Existing data is backfilled: one-time script unpacks all blobs into tables

### Phase 2: Verification

- CLI command `storyflow migrate verify` compares blob vs SQL for every project
- Reports discrepancies field-by-field
- Fix shadow write bugs until verification passes with zero discrepancies
- Run multiple times over days to catch edge cases

### Phase 3: Swap Read

- `migration_state.mode` -> `'read_normalized'`
- All reads come from SQL tables
- All writes still go to BOTH blob and tables (safety net)
- Rollback: flip mode back to `'shadow_write'` — instant, no redeployment
- Monitor for any behavioral differences

### Phase 4: Kill the Blob

- `migration_state.mode` -> `'normalized'`
- Remove all blob write paths from db.js
- Drop `data` column from projects table
- Remove `withProjectLock()` — replaced by SQL transactions
- Remove `/api/sync` endpoint
- Remove `syncAll()` from db.js
- Delete migration scaffolding code
- Remove migration_state table

## db.js Rewrite

During Phases 1-3, every function branches on `getMigrationMode()`:

- **Reads:** `shadow_write` -> blob, `read_normalized`/`normalized` -> SQL
- **Writes:** `shadow_write`/`read_normalized` -> both, `normalized` -> SQL only

After Phase 4, all blob code is deleted. Functions become clean SQL queries. `withProjectLock()` is replaced by `db.run('BEGIN TRANSACTION')` / `COMMIT`.

## Frontend Refactoring

Monolithic `projectsStore.js` splits into entity-specific stores:

```
src/stores/
  projectsStore.js       -- slimmed: project metadata only
  issuesStore.js         -- NEW: issues CRUD via /api/projects/:id/issues
  sprintsStore.js        -- NEW: sprints CRUD
  pagesStore.js          -- NEW: wiki pages CRUD
  decisionsStore.js      -- NEW: decisions CRUD
  timelineStore.js       -- NEW: phases + milestones
  workflowStore.js       -- NEW: nodes + connections
  architectureStore.js   -- NEW: components + connections
```

Each store:
- Fetches from its dedicated API endpoint
- No IndexedDB persistence (server is source of truth)
- Mutations call REST endpoint, update local state on success
- Optimistic updates with rollback on server error

Removed:
- `/api/sync` endpoint and all sync logic
- IndexedDB project persistence
- Full-project push on every change

## Snapshot System

Snapshots switch from storing the full JSON blob to storing per-table JSON arrays. Each column holds a serialized snapshot of that table's rows for the project.

Creation: query each table, serialize to JSON, store per column.
Restore: parse each column, DELETE existing rows, INSERT snapshot rows — wrapped in a transaction.

Enables future partial restores (e.g., restore just issues without touching pages).

## CLI Impact

No changes to existing CLI commands (they talk to the REST API, not the database).

Temporary migration commands added:
- `storyflow migrate status` — show current phase
- `storyflow migrate verify` — run blob vs SQL comparison
- `storyflow migrate advance` — move to next phase
- `storyflow migrate rollback` — move to previous phase

Removed after Phase 4 completes.

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Data loss | Phases 1-3 always write blob — rollback = read blob |
| Performance regression | Indexes on every FK; SQL replaces O(n) blob scans |
| Frontend breaks | Entity stores are isolated — one broken store doesn't cascade |
| Snapshot restore breaks | Transaction-wrapped restore; tested per entity |
| Race conditions during transition | `withProjectLock` stays active through Phase 3 |
| Foreign key violations | Sprints created before issues (issues FK -> sprints) |

## What Dies

| Removed | Replaced By |
|---------|-------------|
| `projects.data` column | Normalized tables |
| `withProjectLock()` | SQL transactions |
| `/api/sync` endpoint | Entity-specific REST endpoints |
| `projectsStore.js` IndexedDB | Server as source of truth |
| `syncAll()` | Individual entity mutations |
| Migration scaffolding | Deleted after Phase 4 |

## Future: Lessons Learned + Hot Wash

This migration unblocks the Lessons Learned feature. Post-migration, lessons and hot washes become normalized tables with proper indexes, queryable across projects, with foreign keys to phases, issues, and events. The structured hot wash with scored dimensions becomes a natural SQL query over the lessons and metrics tables.
