import { generateId } from '../utils/ids'

export const SEED_PROJECT_ID = 'storyflow-seed-00000000-0001'
export const SEED_VERSION = 3

export function createSeedProject() {
  const now = new Date().toISOString()
  const projectId = SEED_PROJECT_ID

  // Pre-generate IDs for cross-referencing
  const epicId = generateId()
  const story1Id = generateId()
  const story2Id = generateId()
  const task1Id = generateId()
  const task2Id = generateId()
  const bugId = generateId()

  // Additional board IDs
  const epic2Id = generateId()
  const epic3Id = generateId()
  const epic4Id = generateId()
  const story3Id = generateId()
  const story4Id = generateId()
  const story5Id = generateId()
  const story6Id = generateId()
  const task3Id = generateId()
  const task4Id = generateId()
  const task5Id = generateId()
  const task6Id = generateId()
  const bug2Id = generateId()
  const sprint1Id = generateId()
  const sprint2Id = generateId()
  const sprint3Id = generateId()

  const page1Id = generateId()
  const page2Id = generateId()
  const page3Id = generateId()
  const page4Id = generateId()
  const page5Id = generateId()
  const page6Id = generateId()

  const phase1Id = generateId()
  const phase2Id = generateId()
  const phase3Id = generateId()
  const phase4Id = generateId()
  const phase5Id = generateId()

  const milestone1Id = generateId()
  const milestone2Id = generateId()
  const milestone3Id = generateId()
  const milestone4Id = generateId()
  const milestone5Id = generateId()
  const milestone6Id = generateId()
  const milestone7Id = generateId()
  const milestone8Id = generateId()
  const phase6Id = generateId()

  const page7Id = generateId()
  const page8Id = generateId()
  const page9Id = generateId()
  const page10Id = generateId()
  const page11Id = generateId()
  const page12Id = generateId()
  const task7Id = generateId()
  const task8Id = generateId()
  const task9Id = generateId()
  const task10Id = generateId()
  const task11Id = generateId()
  const bug3Id = generateId()

  const decisionId = generateId()
  const decision2Id = generateId()
  const decision3Id = generateId()
  const decision4Id = generateId()
  const decision5Id = generateId()
  const decision6Id = generateId()
  const decision7Id = generateId()

  const startNodeId = generateId()
  const wfScaffoldId = generateId()
  const wfStateId = generateId()
  const wfBoardWikiId = generateId()
  const wfWorkflowTimelineId = generateId()
  const wfPolishId = generateId()
  const endNodeId = generateId()

  return {
    id: projectId,
    name: 'StoryFlow Development',
    description: 'A comprehensive project planning and management tool built with React, featuring kanban boards, wiki pages, workflow visualization, and timeline tracking.',
    status: 'in-progress',
    techStack: ['React', 'Vite', 'Tailwind CSS', 'Framer Motion'],
    createdAt: now,
    updatedAt: now,
    isSeed: true,
    seedVersion: SEED_VERSION,

    overview: {
      goals: 'Build a modern, all-in-one project planning tool that combines kanban boards, wiki documentation, workflow visualization, and timeline tracking into a single cohesive interface. The tool should be intuitive enough for solo developers while powerful enough for small teams.',
      constraints: 'Must run entirely in the browser with no backend required for the initial version. Data persistence via localStorage. Bundle size should remain reasonable for fast load times.',
      targetAudience: 'Solo developers and small development teams who need a lightweight project planning tool without the overhead of enterprise solutions like Jira or Azure DevOps.',
    },

    architecture: {
      components: [
        {
          id: generateId(),
          name: 'ProjectsContext',
          description: 'Global state management for all projects using React Context and useReducer',
          type: 'context',
        },
        {
          id: generateId(),
          name: 'Board View',
          description: 'Kanban-style board with drag-and-drop issue management',
          type: 'page',
        },
        {
          id: generateId(),
          name: 'Wiki System',
          description: 'Hierarchical page system with markdown editing and templates',
          type: 'page',
        },
        {
          id: generateId(),
          name: 'Workflow Canvas',
          description: 'Visual node-based workflow editor with execution engine',
          type: 'page',
        },
        {
          id: generateId(),
          name: 'useProject Hook',
          description: 'Per-project CRUD with nested field updaters for all 7 tabs',
          type: 'context',
        },
        {
          id: generateId(),
          name: 'Timeline View',
          description: 'Gantt chart and list view with milestone tracking',
          type: 'page',
        },
        {
          id: generateId(),
          name: 'Decisions Log',
          description: 'Architectural decision records with alternatives and consequences',
          type: 'page',
        },
        {
          id: generateId(),
          name: 'Overview Tab',
          description: 'Project details, goals, constraints, tech stack',
          type: 'page',
        },
        {
          id: generateId(),
          name: 'GlassCard',
          description: 'Glassmorphism card container used across all views',
          type: 'component',
        },
        {
          id: generateId(),
          name: 'Modal',
          description: 'Overlay dialog with backdrop, used for forms and confirmations',
          type: 'component',
        },
        {
          id: generateId(),
          name: 'Tabs',
          description: 'Tab navigation component with animated underline indicator',
          type: 'component',
        },
        {
          id: generateId(),
          name: 'GanttChart',
          description: 'Pure SVG Gantt chart with time axis, bars, milestones, today line',
          type: 'component',
        },
        {
          id: generateId(),
          name: 'localStorage Persistence',
          description: 'Auto-save with debouncing, JSON import/export',
          type: 'service',
        },
        {
          id: generateId(),
          name: 'BFS Execution Engine',
          description: 'Breadth-first workflow traversal with parallel branch support',
          type: 'service',
        },
      ],
    },

    workflow: {
      nodes: [
        {
          id: startNodeId,
          type: 'start',
          title: 'Project Kickoff',
          x: 60,
          y: 250,
          status: 'success',
          config: {},
        },
        // --- Phase 1: Scaffolding ---
        {
          id: wfScaffoldId,
          type: 'phase',
          title: 'Scaffolding',
          x: 260,
          y: 250,
          status: 'success',
          config: { description: 'Vite + React + Tailwind v4 setup, folder structure, routing, glassmorphism theme, core UI components' },
          children: (() => {
            const sId = generateId(), e1 = generateId(), e2 = generateId(), e3 = generateId(), eEnd = generateId()
            return {
              nodes: [
                { id: sId, type: 'start', title: 'Begin Setup', x: 100, y: 200, status: 'success', config: {} },
                { id: e1, type: 'task', title: 'Initialize Vite + React', x: 350, y: 100, status: 'success', config: { assignee: 'claude', notes: 'Vite 6 with React 18 plugin, hot reload, port 3000' } },
                { id: e2, type: 'task', title: 'Configure Tailwind CSS', x: 350, y: 300, status: 'success', config: { assignee: 'claude', notes: '@tailwindcss/vite plugin, @import "tailwindcss" in index.css, @theme for custom properties' } },
                { id: e3, type: 'task', title: 'Build Component Library', x: 600, y: 200, status: 'success', config: { assignee: 'claude', notes: '16 UI components: GlassCard, Button, Modal, Input, Badge, Tabs, ProgressBar, Tooltip, etc.' } },
                { id: eEnd, type: 'end', title: 'Scaffolding Complete', x: 850, y: 200, status: 'success', config: {} },
              ],
              connections: [
                { id: generateId(), from: sId, to: e1 },
                { id: generateId(), from: sId, to: e2 },
                { id: generateId(), from: e1, to: e3 },
                { id: generateId(), from: e2, to: e3 },
                { id: generateId(), from: e3, to: eEnd },
              ],
            }
          })(),
        },
        // --- Phase 2: State & Data Layer ---
        {
          id: wfStateId,
          type: 'phase',
          title: 'State & Data Layer',
          x: 460,
          y: 130,
          status: 'success',
          config: { description: 'ProjectsContext with useReducer, useProject hooks, localStorage persistence, JSON export/import' },
          children: (() => {
            const sId = generateId(), e1 = generateId(), e2 = generateId(), e3 = generateId(), eEnd = generateId()
            return {
              nodes: [
                { id: sId, type: 'start', title: 'Start', x: 100, y: 200, status: 'success', config: {} },
                { id: e1, type: 'task', title: 'ProjectsContext + Reducer', x: 350, y: 120, status: 'success', config: { assignee: 'claude', notes: 'useReducer with immutable state updates, CRUD actions for all 7 project sections' } },
                { id: e2, type: 'task', title: 'useProject Hook', x: 350, y: 280, status: 'success', config: { assignee: 'claude', notes: 'Per-field updaters: updateOverview, addIssue, updatePage, etc.' } },
                { id: e3, type: 'task', title: 'localStorage + Export/Import', x: 600, y: 200, status: 'success', config: { assignee: 'claude', notes: 'useAutoSave with 500ms debounce, schemaVersion 1, JSON CLI bridge' } },
                { id: eEnd, type: 'end', title: 'Data Layer Done', x: 850, y: 200, status: 'success', config: {} },
              ],
              connections: [
                { id: generateId(), from: sId, to: e1 },
                { id: generateId(), from: sId, to: e2 },
                { id: generateId(), from: e1, to: e3 },
                { id: generateId(), from: e2, to: e3 },
                { id: generateId(), from: e3, to: eEnd },
              ],
            }
          })(),
        },
        // --- Phase 3: Board & Wiki ---
        {
          id: wfBoardWikiId,
          type: 'phase',
          title: 'Board & Wiki',
          x: 460,
          y: 370,
          status: 'success',
          config: { description: 'Kanban board with drag-and-drop, sprints, burndown/velocity charts. Wiki with page tree, markdown editor, templates.' },
          children: (() => {
            const sId = generateId(), e1 = generateId(), e2 = generateId(), e3 = generateId(), e4 = generateId(), eEnd = generateId()
            return {
              nodes: [
                { id: sId, type: 'start', title: 'Start', x: 100, y: 200, status: 'success', config: {} },
                { id: e1, type: 'task', title: 'Sprint Board + Drag-Drop', x: 350, y: 80, status: 'success', config: { assignee: 'claude', notes: 'SprintBoard, BoardColumn, IssueCard with DnD, BacklogView' } },
                { id: e2, type: 'task', title: 'Issue Detail + Charts', x: 350, y: 200, status: 'success', config: { assignee: 'claude', notes: 'IssueDetailModal, BurndownChart, VelocityChart (pure SVG)' } },
                { id: e3, type: 'task', title: 'Wiki Page Tree + Editor', x: 350, y: 320, status: 'success', config: { assignee: 'claude', notes: 'PageTree with nested hierarchy, PageEditor with split markdown/preview' } },
                { id: e4, type: 'task', title: 'Templates + Version History', x: 600, y: 200, status: 'success', config: { assignee: 'claude', notes: '6 page templates, version tracking, page status (draft/published/archived)' } },
                { id: eEnd, type: 'end', title: 'Board & Wiki Done', x: 850, y: 200, status: 'success', config: {} },
              ],
              connections: [
                { id: generateId(), from: sId, to: e1 },
                { id: generateId(), from: sId, to: e2 },
                { id: generateId(), from: sId, to: e3 },
                { id: generateId(), from: e1, to: e4 },
                { id: generateId(), from: e2, to: e4 },
                { id: generateId(), from: e3, to: e4 },
                { id: generateId(), from: e4, to: eEnd },
              ],
            }
          })(),
        },
        // --- Phase 4: Workflow & Timeline ---
        {
          id: wfWorkflowTimelineId,
          type: 'phase',
          title: 'Workflow & Timeline',
          x: 710,
          y: 250,
          status: 'success',
          config: { description: 'Visual workflow canvas with BFS engine, sub-workflow overlays. Gantt timeline with milestones and stats.' },
          children: (() => {
            const sId = generateId(), e1 = generateId(), e2 = generateId(), e3 = generateId(), e4 = generateId(), eEnd = generateId()
            return {
              nodes: [
                { id: sId, type: 'start', title: 'Start', x: 100, y: 200, status: 'success', config: {} },
                { id: e1, type: 'task', title: 'Workflow Canvas + Nodes', x: 350, y: 80, status: 'success', config: { assignee: 'claude', notes: 'WorkflowCanvas, WorkflowNode (180px, 6 types), drag-to-move, port connections' } },
                { id: e2, type: 'task', title: 'BFS Engine + Sub-workflows', x: 350, y: 200, status: 'success', config: { assignee: 'claude', notes: 'Queue-based BFS, SubWorkflowOverlay, NodeDetailModal, context menu' } },
                { id: e3, type: 'task', title: 'Gantt Chart (SVG)', x: 350, y: 320, status: 'success', config: { assignee: 'claude', notes: 'GanttChart, GanttBar, GanttTimeAxis, GanttMilestone — pure SVG, scrollable' } },
                { id: e4, type: 'task', title: 'Milestones + Stats', x: 600, y: 200, status: 'success', config: { assignee: 'claude', notes: 'MilestoneForm, MilestoneMarker, TimelineStats, chart/list sub-tabs' } },
                { id: eEnd, type: 'end', title: 'Features Complete', x: 850, y: 200, status: 'success', config: {} },
              ],
              connections: [
                { id: generateId(), from: sId, to: e1 },
                { id: generateId(), from: sId, to: e2 },
                { id: generateId(), from: sId, to: e3 },
                { id: generateId(), from: e1, to: e4 },
                { id: generateId(), from: e2, to: e4 },
                { id: generateId(), from: e3, to: e4 },
                { id: generateId(), from: e4, to: eEnd },
              ],
            }
          })(),
        },
        // --- Phase 5: Polish & Ship ---
        {
          id: wfPolishId,
          type: 'phase',
          title: 'Polish & Ship',
          x: 960,
          y: 250,
          status: 'success',
          config: { description: 'Responsive design, keyboard shortcuts, performance, security hardening, zoom/pan, documentation.' },
          children: (() => {
            const sId = generateId(), e1 = generateId(), e1b = generateId(), e2 = generateId(), e3 = generateId(), e4 = generateId(), e4b = generateId(), e5 = generateId(), eEnd = generateId()
            return {
              nodes: [
                { id: sId, type: 'start', title: 'Start', x: 100, y: 200, status: 'success', config: {} },
                { id: e1, type: 'task', title: 'Keyboard Shortcuts', x: 350, y: 40, status: 'success', config: { assignee: 'claude', notes: 'Alt+1-7 tab switching, ? for shortcuts modal, input-safe plain-key detection, sidebar tooltip hints' } },
                { id: e1b, type: 'task', title: 'Responsive Layout', x: 350, y: 140, status: 'success', config: { assignee: 'claude', notes: '12-file responsive overhaul: hamburger sidebar, bottom tab bar, wiki tree toggle, decisions stacking, md: breakpoint' } },
                { id: e2, type: 'task', title: 'Security Hardening', x: 350, y: 240, status: 'success', config: { assignee: 'claude', notes: 'URL sanitization, color validation, import hardening, audit documentation' } },
                { id: e3, type: 'task', title: 'Zoom & Centering', x: 350, y: 340, status: 'success', config: { assignee: 'claude', notes: 'Workflow canvas zoom/pan with CSS zoom for crisp text, auto-centering, WorkflowZoomControls component' } },
                { id: e4, type: 'task', title: 'Sidebar Cleanup', x: 600, y: 340, status: 'success', config: { assignee: 'claude', notes: 'Removed gradient tab indicator bar and bg-white/10 active highlight — icon color only' } },
                { id: e4b, type: 'task', title: 'Accent Color Expansion', x: 600, y: 140, status: 'success', config: { assignee: 'claude', notes: '~15 components updated: replaced hardcoded purple with var(--accent-active) and rgba(var(--accent-active-rgb)) patterns across tabs, filters, epics, board, cards, timeline, architecture, velocity chart' } },
                { id: e5, type: 'task', title: 'Performance + Docs', x: 800, y: 200, status: 'success', config: { assignee: 'claude', notes: 'React.lazy + Suspense for 7 tabs. manualChunks vendor splitting. 625KB→165KB. 4 new wiki pages. Renamed sampleProject→seedProject with SEED_VERSION auto-migration.' } },
                { id: eEnd, type: 'end', title: 'MVP Ready', x: 950, y: 200, status: 'success', config: {} },
              ],
              connections: [
                { id: generateId(), from: sId, to: e1 },
                { id: generateId(), from: sId, to: e1b },
                { id: generateId(), from: sId, to: e2 },
                { id: generateId(), from: sId, to: e3 },
                { id: generateId(), from: e1, to: e4b },
                { id: generateId(), from: e1b, to: e4b },
                { id: generateId(), from: e2, to: e5 },
                { id: generateId(), from: e3, to: e4 },
                { id: generateId(), from: e4, to: e5 },
                { id: generateId(), from: e4b, to: e5 },
                { id: generateId(), from: e5, to: eEnd },
              ],
            }
          })(),
        },
        {
          id: endNodeId,
          type: 'end',
          title: 'MVP Release',
          x: 1160,
          y: 250,
          status: 'success',
          config: {},
        },
      ],
      connections: [
        { id: generateId(), from: startNodeId, to: wfScaffoldId },
        { id: generateId(), from: wfScaffoldId, to: wfStateId },
        { id: generateId(), from: wfScaffoldId, to: wfBoardWikiId },
        { id: generateId(), from: wfStateId, to: wfWorkflowTimelineId },
        { id: generateId(), from: wfBoardWikiId, to: wfWorkflowTimelineId },
        { id: generateId(), from: wfWorkflowTimelineId, to: wfPolishId },
        { id: generateId(), from: wfPolishId, to: endNodeId },
      ],
    },

    board: {
      sprints: [
        {
          id: sprint1Id,
          name: 'Sprint 1 — Foundation',
          goal: 'Project scaffolding, core UI components, and state management layer',
          startDate: '2026-01-27',
          endDate: '2026-02-01',
          status: 'completed',
        },
        {
          id: sprint2Id,
          name: 'Sprint 2 — Board & Wiki',
          goal: 'Kanban board with drag-and-drop, wiki system with markdown editor and templates',
          startDate: '2026-02-01',
          endDate: '2026-02-03',
          status: 'completed',
        },
        {
          id: sprint3Id,
          name: 'Sprint 3 — Workflow & Timeline',
          goal: 'Visual workflow canvas, BFS execution engine, Gantt timeline with milestones',
          startDate: '2026-02-03',
          endDate: '2026-02-07',
          status: 'completed',
        },
      ],
      issues: [
        // === EPIC: Project Management Core (SF-1) ===
        {
          id: epicId,
          key: 'SF-1',
          type: 'epic',
          title: 'Project Management Core',
          description: 'Implement the core project management features including project CRUD operations, context providers, and data persistence. Covers ProjectsContext with useReducer, useProject hooks for per-field CRUD, useAutoSave for debounced localStorage writes, and the default/sample project data seeds.',
          status: 'Done',
          priority: 'critical',
          points: 13,
          assignee: 'claude',
          labels: ['core', 'architecture'],
          sprintId: sprint1Id,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: story1Id,
          key: 'SF-2',
          type: 'story',
          title: 'As a user, I want to create and manage kanban boards',
          description: 'Built SprintBoard with drag-and-drop columns, IssueCard with type/priority badges, BacklogView for unassigned issues, IssueDetailModal with all fields. Added sprint management (create/edit/complete), status column customization, and board-level filters for type/priority/assignee/labels.',
          status: 'Done',
          priority: 'high',
          points: 8,
          assignee: 'claude',
          labels: ['board', 'ui'],
          parentId: epicId,
          sprintId: sprint2Id,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: story2Id,
          key: 'SF-3',
          type: 'story',
          title: 'As a user, I want to write and organize wiki pages',
          description: 'Built PageTree with nested parent/child hierarchy, PageEditor with split markdown/preview mode, MarkdownRenderer with syntax highlighting, and 6 page templates (blank, meeting notes, technical spec, API docs, retrospective, decision record). Added version history tracking and page status (draft/published/archived).',
          status: 'Done',
          priority: 'high',
          points: 8,
          assignee: 'claude',
          labels: ['wiki', 'ui'],
          parentId: epicId,
          sprintId: sprint2Id,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: task1Id,
          key: 'SF-4',
          type: 'task',
          title: 'Set up project scaffolding with Vite and Tailwind',
          description: 'Initialized Vite 6 with React 18 plugin, configured Tailwind CSS v4 via @tailwindcss/vite (no postcss.config or tailwind.config needed), set up folder structure (components/ui, layout, project, hooks, contexts, utils, data), added react-router-dom routing with Dashboard and ProjectPage, built the glassmorphism theme in index.css with glass, glass-card, glass-sidebar, glass-input classes.',
          status: 'Done',
          priority: 'high',
          points: 3,
          assignee: 'claude',
          labels: ['setup', 'tooling'],
          sprintId: sprint1Id,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: task2Id,
          key: 'SF-5',
          type: 'task',
          title: 'Implement localStorage persistence layer',
          description: 'Built useAutoSave hook with 500ms debounce that serializes the full projects array to localStorage under `storyflow-projects`. Created JSON export format with schemaVersion, exportedAt, and project payload. Added import validation. The ProjectsContext reducer produces immutable state updates that trigger auto-save on every dispatch.',
          status: 'Done',
          priority: 'medium',
          points: 5,
          assignee: 'claude',
          labels: ['data', 'hooks'],
          sprintId: sprint1Id,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: bugId,
          key: 'SF-6',
          type: 'bug',
          title: 'Workflow connections not rendering on initial load',
          description: 'When the workflow canvas first mounts, SVG connections between nodes are not drawn until the user interacts with the canvas. Root cause: node refs not measured yet during first render. Fixed by deferring connection measurement with useLayoutEffect and a requestAnimationFrame callback so DOM measurements happen after layout.',
          status: 'Done',
          priority: 'medium',
          points: 2,
          assignee: 'claude',
          labels: ['workflow', 'bug'],
          sprintId: sprint3Id,
          createdAt: now,
          updatedAt: now,
        },
        // === EPIC: Workflow Engine (SF-7) ===
        {
          id: epic2Id,
          key: 'SF-7',
          type: 'epic',
          title: 'Workflow Engine',
          description: 'Full workflow system: WorkflowCanvas with pan/zoom and grid snapping, WorkflowNode (180px wide, 6 types), WorkflowConnection with SVG bezier curves, NodeContextMenu with viewport bounds detection, NodeDetailModal for config editing. Sub-workflow overlay for phase nodes with breadcrumb navigation. BFS execution engine that traverses the DAG level-by-level.',
          status: 'Done',
          priority: 'critical',
          points: 21,
          assignee: 'claude',
          labels: ['workflow', 'canvas'],
          sprintId: sprint3Id,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: story3Id,
          key: 'SF-8',
          type: 'story',
          title: 'As a user, I want to build visual workflows with draggable nodes',
          description: 'Built WorkflowCanvas with mouse-based panning, WorkflowNode with 6 types (start/end/task/phase/decision/parallel), drag-to-move with grid snapping, port-based connection creation by dragging between output→input ports, SVG bezier curve rendering for connections. Right-click context menu with edit/delete/duplicate actions. Node width is 180px — kept WorkflowConnection NODE_WIDTH in sync.',
          status: 'Done',
          priority: 'high',
          points: 8,
          assignee: 'claude',
          labels: ['workflow', 'canvas', 'ui'],
          parentId: epic2Id,
          sprintId: sprint3Id,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: task3Id,
          key: 'SF-9',
          type: 'task',
          title: 'Implement BFS execution engine for workflow traversal',
          description: 'Built executeWorkflow() in utils/workflow.js. Uses a queue-based BFS that processes nodes level by level. Each node transitions idle→running→success/error. Parallel branches at the same depth execute together. Join nodes wait for all incoming edges to complete. Prevents cycles at connection-creation time to guarantee DAG property. Execution log tracks timestamps and status changes.',
          status: 'Done',
          priority: 'high',
          points: 5,
          assignee: 'claude',
          labels: ['workflow', 'engine'],
          parentId: epic2Id,
          sprintId: sprint3Id,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: task4Id,
          key: 'SF-10',
          type: 'task',
          title: 'Add sub-workflow overlay and node detail modals',
          description: 'Phase nodes have a `children` object with their own nodes/connections arrays. Clicking "Expand" opens a SubWorkflowOverlay that renders the nested graph in a modal-like popup with breadcrumb navigation back to the parent. NodeDetailModal lets you edit title, description, assignee, notes, and status. Status badge shows step counts (e.g. "3/5 steps").',
          status: 'Done',
          priority: 'medium',
          points: 5,
          assignee: 'claude',
          labels: ['workflow', 'ui'],
          parentId: epic2Id,
          sprintId: sprint3Id,
          createdAt: now,
          updatedAt: now,
        },
        // === EPIC: Timeline & Milestones (SF-11) ===
        {
          id: epic3Id,
          key: 'SF-11',
          type: 'epic',
          title: 'Timeline & Milestones',
          description: 'Full Gantt chart implementation: GanttChart container with scrollable SVG, GanttBar for phase rows with progress fill, GanttMilestone as diamond markers, GanttTimeAxis with week/month grid lines and "Today" dashed red line. TimelineStats with 4 stat cards. MilestoneForm modal for CRUD. TimelineView list with chronologically interleaved phases and milestones. Chart/List sub-tab toggle.',
          status: 'Done',
          priority: 'high',
          points: 13,
          assignee: 'claude',
          labels: ['timeline', 'ui'],
          sprintId: sprint3Id,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: story4Id,
          key: 'SF-12',
          type: 'story',
          title: 'As a user, I want to see my project phases on a Gantt chart',
          description: 'Built GanttChart.jsx as the main SVG container. Computes dateToX mapping from phase/milestone date ranges with ±7 day padding. LABEL_WIDTH=160, ROW_HEIGHT=44, HEADER_HEIGHT=36. Date labels centered in header, bars strictly below header border. GanttBar renders background rect at 18% opacity + progress fill at 65% opacity + percentage text. Dynamic chart width = max(800, totalDays*12). Wrapped in overflow-x-auto div for horizontal scrolling.',
          status: 'Done',
          priority: 'high',
          points: 5,
          assignee: 'claude',
          labels: ['timeline', 'chart', 'ui'],
          parentId: epic3Id,
          sprintId: sprint3Id,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: story5Id,
          key: 'SF-13',
          type: 'story',
          title: 'As a user, I want to create and track milestones',
          description: 'Added milestone data model: { id, name, date, completed, color, phaseId }. Built MilestoneForm modal with name, date picker, phase select dropdown, completed toggle, and color picker. GanttMilestone renders as a rotated diamond SVG polygon — filled when completed, hollow when pending. MilestoneMarker in list view shows diamond on timeline spine with GlassCard, hover edit/delete buttons, and click-to-toggle completed. Milestones interleaved chronologically with phases in TimelineView.',
          status: 'Done',
          priority: 'medium',
          points: 3,
          assignee: 'claude',
          labels: ['timeline', 'milestones'],
          parentId: epic3Id,
          sprintId: sprint3Id,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: task5Id,
          key: 'SF-14',
          type: 'task',
          title: 'Build timeline stats dashboard with progress indicators',
          description: 'Built TimelineStats.jsx with 4 GlassCard stat tiles: Overall Progress (weighted average across phases), Phase Count, Milestones Done (completed/total), Days Remaining (until last phase endDate). Each card has a Lucide icon, value, and label. Integrated into TimelineTab above the chart/list toggle. Uses date-fns differenceInDays for the countdown.',
          status: 'Done',
          priority: 'medium',
          points: 3,
          assignee: 'claude',
          labels: ['timeline', 'stats', 'ui'],
          parentId: epic3Id,
          sprintId: sprint3Id,
          createdAt: now,
          updatedAt: now,
        },
        // === EPIC: Polish & Ship (SF-15) ===
        {
          id: epic4Id,
          key: 'SF-15',
          type: 'epic',
          title: 'Polish & Ship',
          description: 'Final sprint before MVP: responsive breakpoints for mobile/tablet, keyboard shortcut system (tab switching, new issue, search focus, save), global search improvements, dark/light theme toggle polish, Lighthouse performance audit, lazy-load heavy components (WorkflowCanvas, GanttChart), bundle size optimization, and documentation cleanup.',
          status: 'Done',
          priority: 'high',
          points: 13,
          assignee: 'claude',
          labels: ['polish', 'release'],
          createdAt: now,
          updatedAt: now,
        },
        {
          id: story6Id,
          key: 'SF-16',
          type: 'story',
          title: 'As a user, I want keyboard shortcuts for common actions',
          description: 'Implemented keyboard shortcuts system. Alt+1-7 switches between the 7 project tabs. "?" opens a ShortcutsModal listing all bindings with platform-aware modifier keys (⌘ on Mac, Ctrl on Windows). Ctrl+/ opens the command palette. Esc closes modals. The useKeyboardShortcuts hook skips plain-key shortcuts when focus is in an input/textarea/contenteditable. Sidebar tooltips now show the shortcut hint alongside the tab name.',
          status: 'Done',
          priority: 'medium',
          points: 5,
          assignee: 'claude',
          labels: ['polish', 'accessibility', 'ui'],
          parentId: epic4Id,
          sprintId: sprint3Id,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: task6Id,
          key: 'SF-17',
          type: 'task',
          title: 'Responsive layout and mobile breakpoints',
          description: 'Implemented responsive layout across 12 files. Sidebar collapses to hamburger overlay on mobile, project tabs become bottom bar, wiki page tree toggles as overlay, decisions tab stacks vertically with back button, architecture tree stacks above detail, board sub-nav scrolls horizontally. All using md: (768px) breakpoint.',
          status: 'Done',
          priority: 'medium',
          points: 5,
          assignee: 'claude',
          labels: ['polish', 'responsive', 'ui'],
          parentId: epic4Id,
          sprintId: sprint3Id,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: bug2Id,
          key: 'SF-18',
          type: 'bug',
          title: 'AnimatePresence mode="wait" causes blank page on route transition',
          description: 'Bug: Wrapping React Router Outlet with AnimatePresence mode="wait" causes exit animations to get stuck — the exiting route stays at opacity:0 and transform at the exit state, blocking the entering route from ever appearing. Result: blank white page. Root cause: Framer Motion\'s exit animation conflicts with React Router\'s unmount timing. Fix: removed mode="wait" from route-level AnimatePresence. Tab-level AnimatePresence (inside ProjectPage) still works fine with mode="wait".',
          status: 'Done',
          priority: 'high',
          points: 2,
          assignee: 'claude',
          labels: ['animation', 'bug', 'routing'],
          sprintId: sprint2Id,
          createdAt: now,
          updatedAt: now,
        },
        // === Security Audit (SF-19) ===
        {
          id: task7Id,
          key: 'SF-19',
          type: 'task',
          title: 'Security audit and hardening',
          description: 'Full security review of the StoryFlow codebase. Found and fixed 3 classes of vulnerability:\n\n**Critical — XSS via markdown URLs (fixed):** The markdown renderer in src/utils/markdown.js injected user-provided URLs directly into href/src attributes via dangerouslySetInnerHTML in MarkdownRenderer.jsx. Markdown like [click](javascript:alert(1)) would execute arbitrary JS. Fixed by adding isSafeUrl() that whitelists http/https/mailto protocols and blocks javascript:/data:/vbscript: schemes.\n\n**Medium — CSS injection via color values (fixed):** User-editable phase.color and milestone.color strings were interpolated into style attributes and SVG fill/stroke props across PhaseCard, GanttBar, GanttMilestone, and MilestoneMarker. A crafted color string could inject arbitrary CSS. Fixed by adding sanitizeColor() in src/utils/sanitize.js that validates against hex/rgb/hsl patterns.\n\n**Medium — Import hardening (fixed):** JSON import had no file size limit and no prototype pollution guard. Added 10MB file size check in Header.jsx and stripDangerousKeys() in exportImport.js that recursively removes __proto__/constructor/prototype keys from imported objects.\n\nAlso created wiki pages documenting the full audit findings and a dependency inventory with all package versions for future CVE tracking.',
          status: 'Done',
          priority: 'critical',
          points: 5,
          assignee: 'claude',
          labels: ['security', 'audit'],
          parentId: epic4Id,
          sprintId: sprint3Id,
          createdAt: now,
          updatedAt: now,
        },
        // === Workflow zoom/centering (SF-20) ===
        {
          id: task8Id,
          key: 'SF-20',
          type: 'task',
          title: 'Workflow canvas zoom, pan, and auto-centering',
          description: 'Added viewport transform system to the workflow canvas:\n\n**Auto-centering:** Nodes are centered in the viewport on load by computing the bounding box and offsetting to viewport center. Each WorkflowCanvas instance (main + sub-workflow overlay) centers independently.\n\n**Zoom:** Controls in bottom-right corner with +/- buttons (10% increments, 25%-200% range), percentage display, and fit-to-view reset. Ctrl/Cmd+scroll zooms toward cursor position.\n\n**Pan:** Middle-mouse-button drag to pan the viewport.\n\n**Crisp rendering:** Uses CSS zoom instead of transform:scale for the scale factor, so text re-renders at native resolution at all zoom levels instead of getting blurry.\n\n**Coordinate transforms:** All mouse handlers (node drag, connection drawing, context menu) convert screen coords to canvas-space via inverse transform.\n\nFiles: WorkflowCanvas.jsx (viewport state, transform wrapper, handlers), WorkflowZoomControls.jsx (new component).',
          status: 'Done',
          priority: 'high',
          points: 5,
          assignee: 'claude',
          labels: ['workflow', 'ux', 'feature'],
          parentId: epic4Id,
          sprintId: sprint3Id,
          createdAt: now,
          updatedAt: now,
        },
        // === Sidebar UI cleanup (SF-21) ===
        {
          id: task9Id,
          key: 'SF-21',
          type: 'task',
          title: 'Sidebar tab indicator cleanup',
          description: 'Simplified the project sidebar active tab indicator. Removed the purple-to-blue gradient bar (motion.div with layoutId) and the bg-white/10 background highlight. Active state is now icon turning white only — cleaner and less cluttered. Also removed the unused framer-motion import from ProjectSidebar.jsx.',
          status: 'Done',
          priority: 'low',
          points: 1,
          assignee: 'claude',
          labels: ['ui', 'cleanup'],
          parentId: epic4Id,
          sprintId: sprint3Id,
          createdAt: now,
          updatedAt: now,
        },
        // === Keyboard shortcuts (SF-22) ===
        {
          id: task10Id,
          key: 'SF-22',
          type: 'task',
          title: 'Keyboard shortcuts system',
          description: 'Added keyboard shortcuts to the app:\n\n**Tab switching:** Alt+1-7 switches between the 7 project tabs (Overview, Architecture, Workflow, Board, Wiki, Timeline, Decisions). Registered in ProjectPage.jsx via useKeyboardShortcuts hook.\n\n**Shortcuts modal:** Press "?" to open a modal listing all available shortcuts. Built ShortcutsModal.jsx with sections for Navigation and General shortcuts, displaying platform-aware modifier keys (⌘ on Mac, Ctrl on Windows).\n\n**Sidebar hints:** Updated ProjectSidebar tooltips to show the keyboard shortcut alongside the tab name (e.g. "Overview (Alt+1)").\n\n**Input safety:** Enhanced useKeyboardShortcuts hook to skip plain-key shortcuts (like "?") when focus is in an input, textarea, or contenteditable element.\n\nFiles: useKeyboardShortcuts.js (SHORTCUTS enum + input guard), ShortcutsModal.jsx (new), ProjectPage.jsx (tab shortcuts), AppLayout.jsx (? shortcut + modal), ProjectSidebar.jsx (tooltip hints).',
          status: 'Done',
          priority: 'medium',
          points: 3,
          assignee: 'claude',
          labels: ['polish', 'accessibility', 'ui'],
          parentId: epic4Id,
          sprintId: sprint3Id,
          createdAt: now,
          updatedAt: now,
        },
        // === Responsive layout (SF-23) ===
        {
          id: task11Id,
          key: 'SF-23',
          type: 'task',
          title: 'Responsive layout with mobile breakpoints',
          description: 'Full responsive overhaul across 12 files using md: (768px) as the single mobile/desktop breakpoint.\n\n**Phase 1 — Core Shell:**\n- AppLayout: mobileMenuOpen state, backdrop overlay, hamburger prop to Header\n- Sidebar: fixed overlay on mobile (z-40), auto-close on nav, X close button, hidden collapse toggle\n- Header: hamburger Menu icon before breadcrumbs (md:hidden)\n\n**Phase 2 — Project Tab Bar:**\n- ProjectSidebar: vertical left sidebar on desktop → fixed bottom horizontal bar on mobile with evenly-spaced icons\n- ProjectPage: bottom padding (pb-20) to clear the fixed tab bar on mobile\n\n**Phase 3 — Tab-Specific:**\n- WikiTab: showTree toggle with overlay backdrop for mobile, auto-close on page select, PanelLeft toggle button\n- TableOfContents: hidden on mobile (hidden md:block)\n- DecisionsTab: flex-col stack on mobile, list hidden when detail selected, full-width detail with back button\n- ArchitectureTab: flex-col stack on mobile, tree panel max-h-64 cap\n- WorkflowTab: log panel defaults to closed\n- BoardTab: overflow-x-auto on sub-nav tab row\n- ProjectHeader: saved-ago text hidden on mobile (hidden sm:inline)',
          status: 'Done',
          priority: 'medium',
          points: 5,
          assignee: 'claude',
          labels: ['polish', 'responsive', 'ui'],
          parentId: epic4Id,
          sprintId: sprint3Id,
          createdAt: now,
          updatedAt: now,
        },
        // === Accent color bug fix (SF-24) ===
        {
          id: bug3Id,
          key: 'SF-24',
          type: 'bug',
          title: 'Accent color picker in Settings has no visual effect',
          description: 'Bug: The accent color picker in Settings set a --accent-active CSS variable on document.documentElement, but nothing in the UI consumed it. Changing accent colors had zero visual effect.\n\nRoot cause: The feature was architecturally complete (SettingsContext, localStorage, picker UI) but functionally disconnected — no CSS rules or components read the variable.\n\nFix:\n- SettingsContext: Also sets --accent-active-rgb (R,G,B triplet) for rgba() usage in CSS\n- index.css: glass-input:focus border/shadow, gradient-text, focus-visible outline, and ::selection now use var(--accent-active) / rgba(var(--accent-active-rgb))\n- Button.jsx: Primary variant gradient uses var(--accent-active) as the start color\n- Sidebar.jsx: New Project button gradient uses var(--accent-active)\n- SettingsPanel.jsx: Toggle switch background uses var(--accent-active); fixed ring-color on picker swatches (ringColor → --tw-ring-color)',
          status: 'Done',
          priority: 'medium',
          points: 3,
          assignee: 'claude',
          labels: ['bug', 'settings', 'ui'],
          parentId: epic4Id,
          sprintId: sprint3Id,
          createdAt: now,
          updatedAt: now,
        },

        // === Accent color expansion (SF-25) ===
        {
          id: generateId(),
          type: 'story',
          key: 'SF-25',
          title: 'Expand accent color to all UI surfaces',
          description: 'Wire the accent color CSS variable into ~15 components: tabs, filters, epics sidebar, board columns, issue cards, quick create, backlog, velocity chart, phase cards, architecture dependency links, overview section icons, project header hover, and issue detail panel. Replace all hardcoded purple with var(--accent-active) and rgba(var(--accent-active-rgb)) patterns.',
          status: 'Done',
          priority: 'medium',
          storyPoints: 5,
          assignee: 'claude',
          labels: ['ui', 'theming', 'settings'],
          parentId: epic4Id,
          sprintId: sprint3Id,
          createdAt: now,
          updatedAt: now,
        },

        // === Performance: lazy loading & bundle splitting (SF-26) ===
        {
          id: generateId(),
          type: 'task',
          key: 'SF-26',
          title: 'Lazy-load tabs and split vendor chunks',
          description: 'React.lazy() + Suspense for all 7 project tab components and ProjectPage route. manualChunks in vite.config.js to split vendor-react, vendor-motion, vendor-utils. Reduced largest chunk from 625KB to 165KB, eliminated chunk size warning.',
          status: 'Done',
          priority: 'medium',
          storyPoints: 3,
          assignee: 'claude',
          labels: ['performance', 'build'],
          parentId: epic4Id,
          sprintId: sprint3Id,
          createdAt: now,
          updatedAt: now,
        },

        // === Wiki documentation cleanup (SF-27) ===
        {
          id: generateId(),
          type: 'task',
          key: 'SF-27',
          title: 'Wiki documentation cleanup for MVP',
          description: 'Add 4 new wiki pages (Keyboard Shortcuts, Responsive Layout, Theming & Accent Colors, Performance & Bundle Splitting). Update Architecture Overview with code splitting, responsive, and theming sections. Close out all tracker items for MVP release.',
          status: 'Done',
          priority: 'medium',
          storyPoints: 3,
          assignee: 'claude',
          labels: ['docs', 'wiki'],
          parentId: epic4Id,
          sprintId: sprint3Id,
          createdAt: now,
          updatedAt: now,
        },

        // === Seed project versioning + rename (SF-28) ===
        {
          id: generateId(),
          type: 'task',
          key: 'SF-28',
          title: 'Seed project auto-update and rename',
          description: 'Rename sampleProject.js to seedProject.js. Add fixed SEED_PROJECT_ID and SEED_VERSION constants. Add migrateSeedProject() to ProjectsContext that auto-updates the seed project when the version is bumped. Existing users get new wiki pages, board issues, workflow updates without clearing localStorage.',
          status: 'Done',
          priority: 'high',
          storyPoints: 5,
          assignee: 'claude',
          labels: ['infrastructure', 'persistence'],
          parentId: epic4Id,
          sprintId: sprint3Id,
          createdAt: now,
          updatedAt: now,
        },

        // === Dead code cleanup (SF-29) ===
        {
          id: generateId(),
          type: 'task',
          key: 'SF-29',
          title: 'Dead code cleanup for UAT',
          description: 'Remove 5 orphaned files (PageTransition, useLocalStorage, useAutoSave, storage.js, issueKeys.js). Trim colors.js to only getPriorityColor. Security audit passed clean. Pre-UAT sweep.',
          status: 'Done',
          priority: 'medium',
          storyPoints: 2,
          assignee: 'claude',
          labels: ['cleanup', 'maintenance'],
          parentId: epic4Id,
          sprintId: sprint3Id,
          createdAt: now,
          updatedAt: now,
        },
      ],
      issueTypes: ['epic', 'story', 'task', 'bug', 'subtask'],
      customFields: [],
      statusColumns: ['To Do', 'In Progress', 'Done'],
      nextIssueNumber: 30,
    },

    pages: [
      {
        id: page1Id,
        title: 'Getting Started',
        content: `# Getting Started with StoryFlow

StoryFlow is a browser-based project planning tool built with React and Vite. No backend required — all data persists in localStorage.

## Quick Start

1. Run \`npm install && npm run dev\` to start on http://localhost:3000
2. Click **New Project** from the dashboard
3. Fill in the **Overview** tab with goals, constraints, and tech stack
4. Use the **Board** tab to create epics, stories, tasks, and bugs
5. Write documentation in the **Wiki** tab using markdown
6. Build visual process flows on the **Workflow Canvas**
7. Track phases and milestones in the **Timeline** view

## The 7 Tabs

| Tab | Purpose |
|-----|---------|
| Overview | Project goals, constraints, target audience |
| Architecture | Component tree with dependency mapping |
| Workflow | Visual node graph with BFS execution engine |
| Board | JIRA-style kanban with sprints and story points |
| Wiki | Confluence-style nested pages with markdown |
| Timeline | Phase-based Gantt chart with milestones |
| Decisions | Architectural decision records (ADRs) |

## Data & Persistence

All project data auto-saves to localStorage under \`storyflow-projects\`. You can also export/import projects as JSON files for Claude CLI bridge integration.
`,
        parentId: null,
        status: 'published',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: page2Id,
        title: 'Architecture Overview',
        content: `# Architecture Overview

## Component Structure

\`\`\`
src/
  components/
    ui/         — 16 shared components (GlassCard, Button, Modal, Badge, etc.)
    layout/     — AppLayout, Sidebar, Header, GradientBackground
    project/    — 9 tab components (OverviewTab, BoardTab, WikiTab, etc.)
    board/      — 12 kanban components (SprintBoard, IssueCard, BacklogView)
    wiki/       — 8 wiki components (PageTree, PageEditor, MarkdownRenderer)
    workflow/   — 7 canvas components (WorkflowCanvas, WorkflowNode)
  hooks/        — 8 custom hooks (useProject, useSearch, useDragAndDrop)
  contexts/     — ProjectsContext (useReducer-based global state)
  utils/        — 8 utility modules
\`\`\`

## State Management

**ProjectsContext** uses \`useReducer\` for all project state. The \`useProject\` hook exposes per-field updaters: \`updateOverview\`, \`addIssue\`, \`updatePage\`, etc.

**Data flow:** User action -> dispatch -> reducer (immutable update) -> useAutoSave -> localStorage

## Tech Stack

| Tech | Version | Why |
|------|---------|-----|
| React | 18+ | Hooks-first UI framework |
| Vite | 6+ | Fast HMR, @tailwindcss/vite plugin |
| Tailwind CSS | 4.0 | \`@import "tailwindcss"\` — no config file needed |
| Framer Motion | 11+ | AnimatePresence for tab/page transitions |
| Lucide React | Latest | Consistent icon set |

## Styling

Glassmorphism theme via custom classes in \`index.css\`: \`glass\`, \`glass-card\`, \`glass-sidebar\`, \`glass-input\`. All use \`backdrop-blur\` + semi-transparent backgrounds.

## Theming

User-selectable accent color via \`--accent-active\` (hex) and \`--accent-active-rgb\` (R,G,B) CSS custom properties. Set by \`SettingsContext\`, consumed across ~15 components using inline styles and \`rgba()\` for alpha variants.

## Responsive Design

Single breakpoint: \`md:\` (768px). Mobile-first approach — bare classes target mobile, \`md:\` overrides for desktop. Hamburger sidebar overlay, fixed bottom tab bar, and per-tab adaptive layouts.

## Code Splitting

All 7 tab components and the ProjectPage route use \`React.lazy()\` + \`Suspense\`. Vendor libraries split via \`manualChunks\` in vite.config.js (vendor-react, vendor-motion, vendor-utils). 27 chunks total, largest 165 KB.
`,
        parentId: page1Id,
        status: 'published',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: page3Id,
        title: 'Board & Sprint Guide',
        content: `# Board & Sprint Guide

The Board tab provides a JIRA-style kanban board for tracking all project work items.

## Issue Types

- **Epic** — Large feature or initiative containing multiple stories
- **Story** — User-facing requirement ("As a user, I want...")
- **Task** — Technical work item (setup, refactoring, etc.)
- **Bug** — Defect report with reproduction steps

## Working with the Board

Create issues from the board toolbar. Each issue has a type, title, description, priority (critical/high/medium/low), story points (Fibonacci scale), labels, and optional assignee.

**Drag and drop** issues between status columns to update their state. Default columns are \`To Do\`, \`In Progress\`, and \`Done\` — you can add custom columns in board settings.

## Sprints

Create sprints with a name, start date, and end date. Drag issues from the **Backlog** into a sprint to plan your iteration. The sprint view shows only issues assigned to the active sprint.

## Charts & Metrics

- **Burndown chart** — Tracks remaining story points over the sprint duration
- **Velocity chart** — Shows points completed per sprint over time
- Story point totals are displayed per column and per sprint
`,
        parentId: page1Id,
        status: 'published',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: page4Id,
        title: 'Workflow Canvas',
        content: `# Workflow Canvas

The Workflow tab is a visual node graph for planning project phases, tasks, and decision points.

## Node Types

| Type | Purpose |
|------|---------|
| **Start** | Entry point — every workflow needs one |
| **End** | Exit point — marks workflow completion |
| **Task** | A single work item or action |
| **Phase** | A group of tasks (can contain a sub-workflow) |
| **Decision** | Branching point with yes/no or multiple paths |
| **Parallel** | Fork/join for concurrent work streams |

## Connecting Nodes

Click a node's output port and drag to another node's input port to create a connection. Connections are rendered as SVG paths. Delete a connection by right-clicking it.

## Sub-Workflows

Phase nodes can contain nested workflows. Double-click a phase to enter its sub-workflow overlay. Add start, task, and end nodes inside to break complex phases into steps.

## BFS Execution Engine

The workflow supports a breadth-first execution model. When triggered, it traverses nodes in BFS order, respecting dependencies. Node statuses update as execution progresses: \`idle\` -> \`running\` -> \`success\` or \`error\`.

## Zoom & Pan

The canvas supports zoom and pan for navigating large workflows:

- **Auto-centering** — Nodes are centered in the viewport on load
- **Zoom controls** — Bottom-right toolbar with +/- buttons (10% steps, 25%-200% range) and fit-to-view reset
- **Scroll zoom** — Ctrl/Cmd + scroll wheel zooms toward cursor position
- **Pan** — Middle-mouse-button drag to pan the viewport
- **Crisp rendering** — Uses CSS \`zoom\` instead of \`transform: scale()\` so text stays sharp at all zoom levels

Each canvas instance (main workflow and sub-workflow overlays) manages its own independent viewport state.

## Context Menu

Right-click any node for options: edit details, change status, delete, or duplicate. The context menu auto-positions to stay within viewport bounds.
`,
        parentId: page1Id,
        status: 'published',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: page5Id,
        title: 'Data Model Reference',
        content: `# Data Model Reference

All project data is stored as JSON in localStorage under the key \`storyflow-projects\`.

## Project Structure

\`\`\`json
{
  "id": "uuid",
  "name": "string",
  "description": "string",
  "status": "planning | in-progress | completed",
  "overview": { "goals", "constraints", "targetAudience" },
  "architecture": { "components": [...] },
  "workflow": { "nodes": [...], "connections": [...] },
  "board": { "issues": [...], "sprints": [...], "statusColumns": [...] },
  "pages": [{ "id", "title", "content", "parentId", "status" }],
  "timeline": { "phases": [...], "milestones": [...] },
  "decisions": [{ "id", "title", "status", "decision", "alternatives" }],
  "settings": { "defaultIssueType", "pointScale", "sprintLength" }
}
\`\`\`

## IDs

All IDs are UUIDs generated via \`crypto.randomUUID()\` (wrapped in \`generateId()\` utility).

## Nested Relationships

- **Board issues** reference parents via \`parentId\` (e.g., story -> epic)
- **Wiki pages** form a tree via \`parentId\` (null = root page)
- **Workflow connections** reference nodes by \`from\`/\`to\` node IDs
- **Timeline milestones** link to phases via \`phaseId\`

## Export Format

Projects export as \`{ schemaVersion: 1, exportedAt, project }\`. Import accepts the same shape. This enables the Claude CLI bridge for programmatic project generation.
`,
        parentId: page2Id,
        status: 'published',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: page6Id,
        title: 'Timeline & Milestones',
        content: `# Timeline & Milestones

The Timeline tab provides a visual overview of your project schedule with phases, milestones, and progress tracking.

## Phases

Each phase represents a major chunk of work with:
- **Name** and **description**
- **Start date** and **end date**
- **Progress** percentage (0-100)
- **Color** for visual distinction on the Gantt chart

Create phases in chronological order. Phases can overlap if work streams run in parallel.

## Milestones

Milestones are key checkpoints within a phase. Each milestone has a name, target date, completion status, and is linked to a parent phase.

Mark milestones as completed to track delivery against your plan.

## Views

- **Gantt Chart** — Horizontal bar chart showing phases as colored bars on a time axis. Milestones appear as diamond markers. Toggle between week/month/quarter time scales.
- **List View** — Table layout showing all phases with their dates, progress bars, and milestone counts.

## Stats Dashboard

The timeline header displays summary stats: total phases, completed milestones, overall progress percentage, and days remaining until the final phase end date.
`,
        parentId: page1Id,
        status: 'published',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: page7Id,
        title: 'Security Audit',
        content: `# Security Audit — February 2026

## Summary

Full security review conducted on Feb 7 2026. Found and patched 3 vulnerability classes. No external API calls, no secrets in code, no eval/Function usage. Attack surface is limited to user-authored content rendered via dangerouslySetInnerHTML and user-editable color values interpolated into CSS.

## Findings

### CRITICAL: XSS via Markdown URL Injection (FIXED)

**Location:** src/utils/markdown.js lines 92, 95-98; src/components/wiki/MarkdownRenderer.jsx line 28

**Problem:** The inlineMarkdown() function inserted user-provided URLs from markdown links and images directly into href and src attributes using regex replacement. The output was rendered with dangerouslySetInnerHTML. A wiki page containing \`[click](javascript:alert('XSS'))\` would execute arbitrary JavaScript. This was stored XSS since wiki content persists in localStorage.

**Fix:** Added isSafeUrl() function that parses the URL and whitelists http:, https:, and mailto: protocols. Relative URLs (starting with /, ./, ../, #) are also allowed. All other protocols (javascript:, data:, vbscript:) are blocked. Unsafe links render as plaintext with "[link blocked: unsafe URL]".

### MEDIUM: CSS Injection via Color Values (FIXED)

**Location:** PhaseCard.jsx, GanttBar.jsx, GanttMilestone.jsx, MilestoneMarker.jsx

**Problem:** User-editable phase.color and milestone.color strings were interpolated directly into style attributes and SVG fill/stroke props. Template literal concatenation like \`\${color}40\` for opacity suffixes does not prevent injection. A malicious color value could inject arbitrary CSS properties.

**Fix:** Created sanitizeColor() in src/utils/sanitize.js. Validates color strings against strict regex patterns for hex (#rgb, #rrggbb, #rrggbbaa), rgb(), rgba(), hsl(), and hsla(). Invalid values fall back to a safe default. Applied to all 4 affected timeline components.

### MEDIUM: Import Hardening (FIXED)

**Location:** src/components/layout/Header.jsx, src/utils/exportImport.js

**Problem:** JSON file import had no file size limit (potential DoS via huge files) and no prototype pollution guard (\`__proto__\` keys in imported JSON could pollute Object.prototype).

**Fix:** Added 10MB file size check before reading imported files. Added stripDangerousKeys() in src/utils/sanitize.js that recursively removes \`__proto__\`, \`constructor\`, and \`prototype\` keys from parsed JSON. Applied in parseProjectJSON() before any data processing.

## Not Vulnerable

- **Routing** — Static React Router paths, no open redirects
- **No external API calls** — Fully client-side, no SSRF surface
- **No eval/Function** — No dynamic code execution
- **No postMessage** — No cross-frame communication
- **Drag-and-drop** — Only transfers issue UUIDs, no file uploads
- **Source maps** — Not included in production builds
- **No secrets** — No API keys or credentials in code
- **Dependencies** — All legitimate, well-maintained packages

## Recommendations for Production

- Add Content-Security-Policy header: \`default-src 'self'; script-src 'self'\`
- Add X-Frame-Options: DENY
- Add X-Content-Type-Options: nosniff
- Consider replacing dangerouslySetInnerHTML with react-markdown + rehype-sanitize for defense-in-depth
`,
        parentId: page2Id,
        status: 'published',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: page8Id,
        title: 'Dependency Inventory',
        content: `# Dependency Inventory

All packages and their exact installed versions as of Feb 7 2026. Track against npm audit and CVE databases for known vulnerabilities.

## Runtime Dependencies

| Package | Version | Purpose | Notes |
|---------|---------|---------|-------|
| react | 18.3.1 | UI framework | Core rendering engine |
| react-dom | 18.3.1 | DOM renderer | Paired with react |
| react-router-dom | 6.30.3 | Client-side routing | Hash/browser router, useParams, Link |
| framer-motion | 11.18.2 | Animations | AnimatePresence, layout animations, motion components |
| lucide-react | 0.469.0 | Icon library | Tree-shakeable SVG icons |
| date-fns | 3.6.0 | Date utilities | parseISO, format, differenceInDays, startOfWeek, addWeeks |
| uuid | 11.1.0 | UUID generation | crypto.randomUUID() wrapper via generateId() |

## Dev Dependencies

| Package | Version | Purpose | Notes |
|---------|---------|---------|-------|
| vite | 6.4.1 | Build tool | Dev server, HMR, production bundling |
| @vitejs/plugin-react | 4.7.0 | React support for Vite | JSX transform, fast refresh |
| tailwindcss | 4.1.18 | Utility-first CSS | v4 uses @import "tailwindcss", no config file |
| @tailwindcss/vite | 4.1.18 | Tailwind Vite plugin | Replaces PostCSS setup from v3 |
| @types/react | 18.3.28 | TypeScript types | Editor intellisense only |
| @types/react-dom | 18.3.7 | TypeScript types | Editor intellisense only |

## Supply Chain Notes

- **No postinstall scripts** in any dependency
- **No native addons** — pure JavaScript/WASM only
- **No network calls at build time** — Vite builds are fully offline after npm install
- **Lock file:** package-lock.json pins exact versions for reproducible builds
- Run \`npm audit\` periodically to check for known CVEs
- Consider \`npm audit signatures\` to verify package provenance
`,
        parentId: page2Id,
        status: 'published',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: page9Id,
        title: 'Keyboard Shortcuts',
        content: `# Keyboard Shortcuts

StoryFlow has a global keyboard shortcut system for fast navigation and common actions.

## Shortcut Reference

| Shortcut | Action |
|----------|--------|
| \`Alt+1\` | Switch to Overview tab |
| \`Alt+2\` | Switch to Architecture tab |
| \`Alt+3\` | Switch to Workflow tab |
| \`Alt+4\` | Switch to Board tab |
| \`Alt+5\` | Switch to Wiki tab |
| \`Alt+6\` | Switch to Timeline tab |
| \`Alt+7\` | Switch to Decisions tab |
| \`Ctrl+N\` | New project |
| \`Ctrl+S\` | Save |
| \`Ctrl+E\` | Export project |
| \`Ctrl+/\` | Focus search |
| \`?\` | Open shortcuts help modal |
| \`Escape\` | Close modal / cancel |
| \`Delete\` | Delete selected item |

## Input Safety

Shortcuts using plain keys (\`?\`, \`Delete\`) are suppressed when the user is typing in an input, textarea, or contentEditable element. Modifier shortcuts (\`Ctrl+\`, \`Alt+\`) always fire regardless of focus.

## Implementation

Shortcuts are defined in \`src/hooks/useKeyboardShortcuts.js\`. The \`SHORTCUTS\` object maps semantic names to key strings. Components register handlers by passing a map to the \`useKeyboardShortcuts\` hook:

\`\`\`js
useKeyboardShortcuts({
  [SHORTCUTS.TAB_OVERVIEW]: () => setActiveTab('overview'),
  [SHORTCUTS.HELP]: () => setShowHelp(true),
})
\`\`\`

The hook attaches a single \`keydown\` listener to \`document\` and matches against registered patterns. Supported modifiers: \`ctrl+\`, \`shift+\`, \`alt+\`.
`,
        parentId: page1Id,
        status: 'published',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: page10Id,
        title: 'Responsive Layout',
        content: `# Responsive Layout

StoryFlow supports mobile and tablet screens using a single \`md:\` (768px) breakpoint. Classes are mobile-first — bare classes target mobile, \`md:\` overrides apply at desktop widths.

## Breakpoint Strategy

- **Mobile** (<768px): stacked layouts, hidden sidebars, bottom tab bar
- **Desktop** (768px+): side-by-side panels, full sidebar, vertical tab bar

## App Shell

**Sidebar** (\`AppLayout > Sidebar\`):
- Mobile: hidden by default, opens as a full-height overlay with backdrop on hamburger tap
- Desktop: always visible at 260px (or 64px collapsed)

**Header**: shows a hamburger menu icon (\`Menu\`) on mobile, hidden on desktop.

## Project Tabs

**ProjectSidebar** (tab navigation):
- Mobile: fixed bottom horizontal bar with evenly spaced icons
- Desktop: static vertical sidebar at 64px width

The content area adds \`pb-20\` on mobile to clear the fixed bottom bar.

## Tab-Specific Adaptations

| Tab | Mobile Behavior |
|-----|----------------|
| Wiki | Page tree hidden; "Pages" toggle button shows it as an overlay |
| Decisions | Detail panel goes full-width with a back button; list hidden when detail is open |
| Architecture | Tree panel stacks above detail instead of side-by-side |
| Board | Filter bar scrolls horizontally; columns already scroll |
| Workflow | Log panel starts closed |

## Key Files

- \`src/components/layout/AppLayout.jsx\` — mobile menu state + backdrop
- \`src/components/layout/Sidebar.jsx\` — fixed overlay on mobile, relative on desktop
- \`src/components/layout/Header.jsx\` — hamburger button
- \`src/components/project/ProjectSidebar.jsx\` — bottom bar vs vertical sidebar
`,
        parentId: page2Id,
        status: 'published',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: page11Id,
        title: 'Theming & Accent Colors',
        content: `# Theming & Accent Colors

StoryFlow uses a user-selectable accent color that propagates across all interactive UI surfaces.

## CSS Custom Properties

The accent color system uses two CSS variables on \`document.documentElement\`:

| Variable | Format | Example |
|----------|--------|---------|
| \`--accent-active\` | Hex | \`#8b5cf6\` |
| \`--accent-active-rgb\` | R, G, B triplet | \`139, 92, 246\` |

These are set by \`SettingsContext\` when the user picks a color from the Settings panel.

## Usage Patterns

**Solid color** (icons, text, borders):
\`\`\`jsx
style={{ color: 'var(--accent-active, #8b5cf6)' }}
\`\`\`

**Transparent variants** (backgrounds, rings, shadows):
\`\`\`jsx
style={{ backgroundColor: 'rgba(var(--accent-active-rgb, 139, 92, 246), 0.15)' }}
\`\`\`

**Hover states** (where Tailwind classes cannot reference CSS vars):
\`\`\`jsx
onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-active, #8b5cf6)'}
onMouseLeave={(e) => e.currentTarget.style.color = ''}
\`\`\`

**Gradients**:
\`\`\`jsx
style={{ backgroundImage: 'linear-gradient(to right, var(--accent-active, #8b5cf6), #3b82f6)' }}
\`\`\`

## What Uses Accent Color

Sidebar brand icon, gradient background orb, active tab indicators, page tree selection, filter bar active states, epic sidebar, board column drop zones, issue card drag states, progress bars, velocity chart bars, quick-create submit, and more (~15 components total).

## What Stays Hardcoded

Badge color variants (purple, red, blue) remain tied to semantic data types (priority, issue type) and do not change with accent color. Avatar gradients and IssueTypeIcon colors are also fixed.
`,
        parentId: page2Id,
        status: 'published',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: page12Id,
        title: 'Performance & Bundle Splitting',
        content: `# Performance & Bundle Splitting

StoryFlow uses React.lazy and Vite manual chunks to keep initial load fast and split code by route and feature.

## Lazy-Loaded Components

All 7 project tab components are loaded on demand:

| Component | Chunk Size |
|-----------|-----------|
| OverviewTab | ~3 KB |
| ArchitectureTab | ~7 KB |
| DecisionsTab | ~13 KB |
| TimelineTab | ~25 KB |
| WikiTab | ~32 KB |
| BoardTab | ~52 KB |
| WorkflowTab | ~54 KB |

\`ProjectPage\` itself is also lazy-loaded at the route level in \`App.jsx\`.

## Suspense Boundaries

Each lazy component is wrapped in \`<Suspense>\`:
- **Route level**: \`fallback={null}\` (instant transition)
- **Tab level**: \`fallback={<TabFallback />}\` (centered spinner)

## Vendor Chunk Splitting

\`vite.config.js\` uses \`manualChunks\` to separate vendor libraries:

| Chunk | Contents | Size |
|-------|----------|------|
| vendor-react | react, react-dom, react-router-dom | ~165 KB |
| vendor-motion | framer-motion | ~115 KB |
| vendor-utils | date-fns, uuid | ~26 KB |

## Results

Before: 1 chunk at 625 KB (triggered Vite size warning).
After: 27 chunks, largest at 165 KB. No warnings.

## Key Files

- \`src/App.jsx\` — route-level lazy loading
- \`src/pages/ProjectPage.jsx\` — tab-level lazy loading with Suspense
- \`vite.config.js\` — manualChunks configuration
`,
        parentId: page2Id,
        status: 'published',
        createdAt: now,
        updatedAt: now,
      },
    ],

    timeline: {
      phases: [
        {
          id: phase1Id,
          name: 'Scaffolding',
          description: 'Vite + React + Tailwind v4 setup, folder structure, routing, glassmorphism theme, core UI components (Button, Modal, GlassCard, Badge, Input, etc.)',
          startDate: '2026-01-27',
          endDate: '2026-01-30',
          progress: 100,
          color: '#10b981',
        },
        {
          id: phase2Id,
          name: 'State & Data Layer',
          description: 'ProjectsContext with useReducer, useProject hooks, localStorage persistence with useAutoSave, default/sample project data, JSON export/import',
          startDate: '2026-01-30',
          endDate: '2026-02-01',
          progress: 100,
          color: '#6366f1',
        },
        {
          id: phase3Id,
          name: 'Board & Wiki',
          description: 'Kanban board with drag-and-drop, issue cards, sprint management, backlog view, burndown/velocity charts. Wiki system with page tree, markdown editor, live preview, templates, version history.',
          startDate: '2026-02-01',
          endDate: '2026-02-03',
          progress: 100,
          color: '#3b82f6',
        },
        {
          id: phase4Id,
          name: 'Workflow & Timeline',
          description: 'Visual workflow canvas with node graph, BFS execution engine, sub-workflow overlays, node detail modals. Gantt timeline with milestones, stats dashboard, chart/list views.',
          startDate: '2026-02-03',
          endDate: '2026-02-07',
          progress: 100,
          color: '#8b5cf6',
        },
        {
          id: phase5Id,
          name: 'Polish & Ship',
          description: 'Security hardening, workflow zoom/pan/centering, sidebar cleanup, keyboard shortcuts, responsive design, accent color theming, performance optimizations, documentation.',
          startDate: '2026-02-07',
          endDate: '2026-02-14',
          progress: 100,
          color: '#f59e0b',
        },
        {
          id: phase6Id,
          name: 'UAT & Production',
          description: 'User acceptance testing on macOS environment (02/18-02/20). Validate all 7 tabs, responsive layout, data persistence, export/import, keyboard shortcuts. Persistent path to production deployment.',
          startDate: '2026-02-18',
          endDate: '2026-02-20',
          progress: 0,
          color: '#ef4444',
        },
      ],
      milestones: [
        {
          id: milestone1Id,
          name: 'Repo & Tooling Ready',
          date: '2026-01-28',
          completed: true,
          color: '#10b981',
          phaseId: phase1Id,
        },
        {
          id: milestone2Id,
          name: '16 UI Components Done',
          date: '2026-01-30',
          completed: true,
          color: '#10b981',
          phaseId: phase1Id,
        },
        {
          id: milestone3Id,
          name: 'Data Persistence Working',
          date: '2026-01-31',
          completed: true,
          color: '#6366f1',
          phaseId: phase2Id,
        },
        {
          id: milestone4Id,
          name: 'Board Drag-and-Drop Live',
          date: '2026-02-02',
          completed: true,
          color: '#3b82f6',
          phaseId: phase3Id,
        },
        {
          id: milestone5Id,
          name: 'Wiki Editor + Templates',
          date: '2026-02-03',
          completed: true,
          color: '#3b82f6',
          phaseId: phase3Id,
        },
        {
          id: milestone6Id,
          name: 'Gantt Chart Shipped',
          date: '2026-02-06',
          completed: true,
          color: '#8b5cf6',
          phaseId: phase4Id,
        },
        {
          id: milestone7Id,
          name: 'MVP Release',
          date: '2026-02-14',
          completed: true,
          color: '#f59e0b',
          phaseId: phase5Id,
        },
        {
          id: milestone8Id,
          name: 'UAT Complete (macOS)',
          date: '2026-02-20',
          completed: false,
          color: '#ef4444',
          phaseId: phase6Id,
        },
      ],
    },

    decisions: [
      {
        id: decisionId,
        title: 'State Management Approach',
        status: 'accepted',
        context: 'We need a state management solution that handles complex nested project data, supports undo-friendly immutable updates, and does not add significant bundle size.',
        decision: 'Use React Context with useReducer for global state management instead of external libraries like Redux or Zustand.',
        alternatives: [
          {
            name: 'Redux Toolkit',
            pros: 'Mature ecosystem, Redux DevTools, middleware support',
            cons: 'Additional dependency, boilerplate overhead for a small app',
          },
          {
            name: 'Zustand',
            pros: 'Minimal API, small bundle size, no providers needed',
            cons: 'Less structured for complex nested state, fewer conventions',
          },
          {
            name: 'useReducer + Context',
            pros: 'Zero dependencies, built into React, familiar patterns, good for nested state',
            cons: 'No DevTools, manual optimization needed for performance',
          },
        ],
        consequences: 'We accept the lack of built-in DevTools and will rely on logging for debugging. Performance optimizations like context splitting or memoization may be needed as the app grows.',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: decision2Id,
        title: 'Styling Approach',
        status: 'accepted',
        context: 'We need a styling solution that supports rapid UI development, works well with a dark glassmorphism theme, and avoids complex configuration. The app has many components with consistent visual patterns.',
        decision: 'Use Tailwind CSS v4 with the @tailwindcss/vite plugin and a custom glassmorphism theme defined in index.css, rather than CSS Modules, Styled Components, or vanilla CSS.',
        alternatives: [
          {
            name: 'CSS Modules',
            pros: 'Scoped styles, no runtime overhead, standard CSS syntax',
            cons: 'Slower iteration for utility patterns, separate files per component, harder to maintain consistent theme',
          },
          {
            name: 'Styled Components',
            pros: 'Co-located styles, dynamic theming, CSS-in-JS flexibility',
            cons: 'Runtime overhead, additional dependency, harder to share utility patterns across components',
          },
          {
            name: 'Vanilla CSS',
            pros: 'No dependencies, full control, no build tooling needed',
            cons: 'No scoping, hard to maintain at scale, repetitive class definitions for consistent patterns',
          },
          {
            name: 'Tailwind CSS v4',
            pros: 'Utility-first for rapid iteration, v4 requires zero config files, CSS custom properties via @theme for glassmorphism, tiny production bundle with purging',
            cons: 'Long class strings in JSX, learning curve for utility-first approach',
          },
        ],
        consequences: 'Class strings in JSX can get lengthy, but the tradeoff is worth it for development speed. The glassmorphism theme is centralized in index.css with custom glass, glass-card, glass-sidebar, and glass-input classes. Tailwind v4 eliminates the need for tailwind.config.js and postcss.config.js entirely.',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: decision3Id,
        title: 'SVG-based Charts over Charting Libraries',
        status: 'accepted',
        context: 'The app needs Gantt charts, burndown charts, and velocity charts for the board and timeline views. We need to decide whether to use a charting library or build custom SVG visualizations.',
        decision: 'Build all charts as pure SVG components rendered directly in React, rather than using Chart.js, Recharts, or D3.',
        alternatives: [
          {
            name: 'Chart.js',
            pros: 'Easy to use, many chart types out of the box, good documentation',
            cons: 'Canvas-based so cannot use CSS theme variables, additional dependency, limited customization for Gantt-style layouts',
          },
          {
            name: 'Recharts',
            pros: 'React-native, declarative API, SVG-based, good for standard charts',
            cons: 'Heavy dependency, limited Gantt support, opinionated styling that conflicts with custom themes',
          },
          {
            name: 'D3',
            pros: 'Extremely powerful, handles any visualization, large community',
            cons: 'Steep learning curve, fights with React over DOM control, massive API surface for simple charts',
          },
          {
            name: 'Pure SVG',
            pros: 'Full control over rendering, supports CSS custom properties and Tailwind classes, zero dependencies, matches React rendering model perfectly',
            cons: 'More code to write from scratch, no built-in animations or interactions',
          },
        ],
        consequences: 'We write more chart code ourselves, but gain full control over styling and theming. SVG elements can use currentColor and CSS variables from the glassmorphism theme. No additional bundle size. Charts are just React components returning SVG markup, making them easy to maintain and test.',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: decision4Id,
        title: 'Flat Data Model for Projects',
        status: 'accepted',
        context: 'Each project contains many related entities — issues, wiki pages, workflow nodes, timeline phases, decisions. We need to decide how to structure this data for localStorage persistence and JSON export.',
        decision: 'Store all project data in a single flat object with arrays for each entity type, rather than using normalized or relational data structures.',
        alternatives: [
          {
            name: 'Normalized (Redux-style)',
            pros: 'Efficient lookups by ID, avoids data duplication, scales well for large datasets',
            cons: 'Complex selectors needed, harder to serialize/deserialize, overkill for localStorage-sized data',
          },
          {
            name: 'Relational / SQL-like',
            pros: 'Strong data integrity, foreign key relationships, query flexibility',
            cons: 'Requires a query layer or ORM-like abstraction, poor fit for JSON/localStorage, heavy setup for a client-side app',
          },
          {
            name: 'Flat object with arrays',
            pros: 'Simple to serialize as JSON, easy localStorage round-trips, straightforward CRUD with array methods, human-readable export files',
            cons: 'Lookups require array scanning, potential data duplication, no referential integrity guarantees',
          },
        ],
        consequences: 'Array lookups use .find() and .filter() which is fine for the expected data sizes (tens to low hundreds of items per project). JSON export/import is trivial since the data model matches the storage format exactly. The useProject hook provides per-field updaters that abstract over the flat structure.',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: decision5Id,
        title: 'BFS Workflow Execution Engine',
        status: 'accepted',
        context: 'The workflow canvas allows users to build directed acyclic graphs of tasks, phases, and decision points. We need an execution strategy that can traverse the graph, respect dependencies, and handle parallel branches with fork/join patterns.',
        decision: 'Use a BFS (breadth-first search) traversal algorithm to execute workflow nodes level by level, rather than event-driven or sequential pipeline approaches.',
        alternatives: [
          {
            name: 'Event-driven execution',
            pros: 'Reactive, handles dynamic workflows, good for long-running async tasks',
            cons: 'Complex event bus needed, harder to reason about execution order, race conditions in parallel branches',
          },
          {
            name: 'Sequential pipeline',
            pros: 'Simple to implement, predictable execution order, easy to debug',
            cons: 'Cannot handle parallel branches or fork/join patterns, bottleneck on serial execution',
          },
          {
            name: 'BFS traversal',
            pros: 'Naturally processes nodes level by level, handles parallel branches by visiting all nodes at the same depth, fork/join patterns work because joins wait for all predecessors',
            cons: 'Requires the graph to be acyclic, all nodes at a level must complete before advancing',
          },
        ],
        consequences: 'The BFS engine processes the workflow graph layer by layer, which visually maps to left-to-right execution on the canvas. Parallel branches at the same depth run together, and join nodes naturally wait for all incoming edges. The graph must remain a DAG — cycles are prevented at the connection creation level.',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: decision6Id,
        title: 'Input Sanitization Strategy',
        status: 'accepted',
        context: 'Security audit revealed that user-provided content (markdown URLs, color values, imported JSON) was rendered without validation, creating XSS and injection risks. We need a sanitization approach that is practical for a client-side app without adding heavy dependencies.',
        decision: 'Use targeted validation functions (isSafeUrl, sanitizeColor, stripDangerousKeys) at the point of use rather than a global sanitization library like DOMPurify.',
        alternatives: [
          {
            name: 'DOMPurify',
            pros: 'Battle-tested HTML sanitizer, handles edge cases we might miss, widely used',
            cons: '60KB+ dependency, sanitizes after rendering rather than preventing bad input, overkill when we control the markdown parser',
          },
          {
            name: 'react-markdown + rehype-sanitize',
            pros: 'Eliminates dangerouslySetInnerHTML entirely, plugin ecosystem, proper AST-based rendering',
            cons: 'Heavy rewrite of markdown system, large dependency tree, may conflict with custom styling approach',
          },
          {
            name: 'Targeted validation at point of use',
            pros: 'Zero dependencies, validates at the source (URL parsing, color regex, key stripping), easy to audit and extend, minimal bundle impact',
            cons: 'Must remember to apply at every injection point, no catch-all safety net, custom code to maintain',
          },
        ],
        consequences: 'We maintain our own sanitization utilities in src/utils/sanitize.js. Each utility is focused: isSafeUrl validates URL protocols, sanitizeColor validates color format, stripDangerousKeys prevents prototype pollution. The tradeoff is manual coverage — any new user-content rendering point must apply the appropriate sanitizer. If the attack surface grows significantly, migrating to DOMPurify or react-markdown should be reconsidered.',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: decision7Id,
        title: 'Seed Project Auto-Update Strategy',
        status: 'accepted',
        context: 'The StoryFlow development tracker (seedProject.js) is updated continuously as features are built — new board issues, workflow nodes, wiki pages, timeline progress. But existing users with localStorage data never see these updates because the seed only runs on empty localStorage.',
        decision: 'Add a SEED_VERSION integer constant and isSeed flag to the seed project. On load, migrateSeedProject() in ProjectsContext compares versions and replaces the seed project wholesale if outdated. A fixed SEED_PROJECT_ID prevents URL breakage across regenerations.',
        alternatives: [
          {
            name: 'Field-by-field merge',
            pros: 'Preserves user edits to the seed project, granular control over what gets updated',
            cons: 'Extremely complex — must diff arrays of objects by ID, handle additions/deletions/modifications, conflict resolution for concurrent edits. Fragile and hard to maintain.',
          },
          {
            name: 'Manual "Reset Sample" button',
            pros: 'Zero automatic behavior, user is in full control, no migration code needed',
            cons: 'Does not solve the core problem — users with stale data never know there are updates. Requires user action.',
          },
          {
            name: 'Wholesale replacement with version stamp',
            pros: 'Simple — one integer comparison, one function, idempotent. Always produces correct latest state. Fixed ID prevents URL breakage.',
            cons: 'User edits to the seed project are lost on version bump. Acceptable since this is a meta-project tracking Claude\'s own work.',
          },
        ],
        consequences: 'Bumping SEED_VERSION after any seedProject.js edit is now a required step. The legacy migration path (finding "StoryFlow Development" by name) handles the one-time upgrade for pre-versioning users. User-created projects are never touched.',
        createdAt: now,
        updatedAt: now,
      },
    ],

    settings: {
      defaultIssueType: 'task',
      pointScale: 'fibonacci',
      sprintLength: 14,
    },
  }
}
