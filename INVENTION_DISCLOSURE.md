# Invention Disclosure — StoryFlow

**Inventor:** Sheldon Spence
**Date of Conception:** February 7, 2026
**Earliest Provable Date:** February 7, 2026 (git commit `1bf243f`)
**Repository:** https://github.com/venom444556/StoryFlow

---

## 1. Summary of Invention

StoryFlow is a unified visual project planning tool that combines seven distinct project management domains (board, wiki, workflow canvas, architecture view, timeline, decisions log, overview) into a single glassmorphic interface with shared state, designed specifically for AI-assisted software development workflows.

---

## 2. Novel Elements

### 2.1 Unified Seven-Domain Project Model

**What:** A single project data model that integrates Kanban board, wiki documentation, visual workflow canvas, architecture component tree, timeline phases, architectural decision records, and project overview into one localStorage-persisted JSON structure with cross-referencing between domains.

**Why novel:** Existing tools (JIRA, Confluence, Miro, Lucidchart) each cover one or two domains and require separate accounts, data models, and sync mechanisms. StoryFlow unifies all seven into a single JSON-serializable project that can be read, written, and manipulated by AI agents as a single artifact.

**Conception date:** February 7, 2026

**Prior art considered:**
- JIRA (Atlassian) — board and sprint management only
- Confluence (Atlassian) — wiki only, separate from board
- Notion — pages and databases, no visual workflow canvas or architecture tree
- Linear — board-focused, no wiki or workflow canvas
- Miro — canvas only, no structured board or wiki
- Monday.com — board and timeline, no architecture view or decision records

### 2.2 AI-Native Project Interchange Format

**What:** Projects are designed as JSON-serializable artifacts with a schema version, enabling AI agents (Claude, GPT, etc.) to generate, read, modify, and export complete project plans including all seven domains. The CLI bridge pattern allows AI to write project JSON to a `projects/` directory that the UI imports.

**Why novel:** Existing project management tools treat AI as an add-on feature. StoryFlow's data model was designed from the ground up to be readable and writable by AI — every field is JSON-serializable, there is no UI-only state, and the schema is documented for machine consumption.

**Conception date:** February 7, 2026

**Prior art considered:**
- GitHub Projects — API-accessible but limited to board view
- Linear API — programmatic access but single-domain (issues)
- No known tool provides a complete seven-domain project as a single AI-readable/writable artifact

### 2.3 Visual Workflow Canvas with BFS Execution Engine

**What:** A drag-and-drop node graph for planning project phases and dependencies, with a built-in breadth-first search execution engine that can traverse the workflow graph, execute nodes in dependency order, and track execution state. Supports sub-workflows (nested canvases), custom node types, and real-time pan/zoom via CSS `zoom` property for crisp text rendering.

**Why novel:** Workflow tools (n8n, Zapier) focus on automation execution. Project planning tools (JIRA, Asana) use linear lists. StoryFlow combines visual workflow planning with a traversal engine in the browser, using CSS zoom (not transform:scale) for sharp text at all zoom levels.

**Conception date:** February 7, 2026

**Prior art considered:**
- n8n, Zapier, Make — automation-focused, not project planning
- Miro, FigJam — visual canvases without execution engines
- draw.io — diagramming without execution semantics

### 2.4 Architecture Component Tree with Cycle Detection

**What:** A visual component hierarchy planner that models software architecture as a tree with typed nodes (component, service, page, hook, utility, context, store), dependency edges, and real-time cycle detection using graph traversal. Enables planning system architecture before writing code.

**Why novel:** Architecture diagramming tools (draw.io, Lucidchart) are general-purpose and don't enforce software component semantics. StoryFlow's architecture view understands component types, validates dependency graphs, and prevents circular dependencies at design time.

**Conception date:** February 7, 2026

**Prior art considered:**
- Lucidchart, draw.io — general diagramming, no component type system
- Storybook — component documentation, not architecture planning
- No known tool combines typed component trees with dependency cycle detection for pre-code architecture planning

### 2.5 Semantic Design Token Architecture with Dual-Theme Glassmorphism

**What:** A CSS custom property system (`tokens.css`) that defines all visual properties (colors, spacing, typography, radii, shadows, z-indices) as semantic tokens (e.g., `--color-fg-default`, `--color-bg-panel`) with two complete theme definitions (Obsidian dark, Warm Linen light) and glassmorphic panel effects using backdrop-filter compositing. All 80+ components consume tokens exclusively — no hardcoded colors.

**Why novel:** While design tokens exist in design systems (Material, Chakra), the specific combination of: (a) comprehensive semantic naming covering all UI concerns, (b) dual glassmorphic themes with frosted-glass depth layering, and (c) complete migration of 80+ components to token-only styling represents a novel design system implementation.

**Conception date:** February 7, 2026 (initial), February 15, 2026 (Warm Linen theme)

### 2.6 Self-Tracking Project Seed with Version Migration

**What:** StoryFlow uses itself as its own project tracker via a seed project (`storyflow.js`) with an auto-incrementing `SEED_VERSION` constant. When the version changes, the app's store detects the mismatch and rehydrates the seed data, ensuring the tracker always reflects the latest development state. This creates a self-documenting development history inside the application's own data.

**Why novel:** No known project management tool ships with its own development tracker as seed data that auto-migrates on version bumps. This pattern creates a living development log that users see on first launch and that developers maintain as part of the codebase.

**Conception date:** February 7, 2026

---

## 3. Potential Patent Claims

The following combinations may be eligible for utility patent protection:

1. A method for unifying seven project management domains into a single JSON-serializable data model designed for AI agent read/write access
2. A system for visual workflow planning with integrated BFS graph execution in a browser environment
3. A method for architecture planning using typed component trees with real-time dependency cycle detection
4. A self-tracking application pattern using versioned seed data with automatic migration

**Note:** Patent filing should be evaluated by a registered patent attorney. This disclosure documents conception for priority date purposes.

---

## 4. Witnesses and Evidence

- **Git history:** Complete development history from February 7, 2026 to present
- **Commit hashes:** All changes are cryptographically signed via git SHA-1
- **GitHub hosting:** Repository hosted at https://github.com/venom444556/StoryFlow with timestamped commits

---

*This document was created on February 15, 2026 to memorialize the invention and establish priority dates.*
