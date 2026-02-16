import { generateId } from '../utils/ids'

export const SEED_PROJECT_ID = 'storyflow-seed-00000000-0001'
export const SEED_VERSION = 60

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
  const decision8Id = generateId()
  const task12Id = generateId()
  const task13Id = generateId()
  const task14Id = generateId()
  const task15Id = generateId()
  const task16Id = generateId()

  // Quality Infrastructure IDs (v13)
  const epic5Id = generateId()
  const story7Id = generateId()
  const story8Id = generateId()
  const task17Id = generateId()
  const task18Id = generateId()
  const task19Id = generateId()
  const task20Id = generateId()
  const task21Id = generateId()
  const task22Id = generateId()
  const sprint4Id = generateId()
  const phase7Id = generateId()
  const milestone9Id = generateId()
  const decision9Id = generateId()
  const page13Id = generateId()

  // Market-Ready Completion IDs (v14)
  const task23Id = generateId()
  const task24Id = generateId()
  const task25Id = generateId()
  const story9Id = generateId()

  // StoryFlow 2.0 Overhaul IDs (v15)
  const sprint5Id = generateId()
  const epic6Id = generateId()
  const story10Id = generateId()
  const story11Id = generateId()
  const story12Id = generateId()
  const task26Id = generateId()
  const task27Id = generateId()
  const task28Id = generateId()
  const task29Id = generateId()
  const task30Id = generateId()
  const bug4Id = generateId()
  const bug5Id = generateId()
  const bug6Id = generateId()
  const feat1Id = generateId()
  const bug7Id = generateId()
  const bug8Id = generateId()
  const bug9Id = generateId()
  const bug10Id = generateId()
  const bug11Id = generateId()
  const task31Id = generateId()
  const task32Id = generateId()
  const task33Id = generateId()
  const task34Id = generateId()
  const task35Id = generateId()
  const task36Id = generateId()
  const task37Id = generateId()
  const task38Id = generateId()
  const task39Id = generateId()
  const task40Id = generateId()
  const task41Id = generateId()
  const bug12Id = generateId()
  const bug13Id = generateId()
  const bug14Id = generateId()
  const page14Id = generateId()
  const phase8Id = generateId()
  const decision10Id = generateId()

  // Architecture filter bar replacement (v40)
  const task42Id = generateId()

  // Warm Linen light mode redesign (v42)
  const task43Id = generateId()

  // Light mode visual fix pass (v43)
  const task44Id = generateId()
  const task45Id = generateId()

  // Go-live audit (v51)
  const epic7Id = generateId()
  const audit1Id = generateId()
  const audit2Id = generateId()
  const audit3Id = generateId()
  const audit4Id = generateId()
  const audit5Id = generateId()
  const audit6Id = generateId()
  const audit7Id = generateId()
  const audit8Id = generateId()
  const audit9Id = generateId()
  const audit10Id = generateId()
  const audit11Id = generateId()
  const audit12Id = generateId()
  const decision11Id = generateId()

  // Full Quality Pass (v54)
  const epic8Id = generateId()
  const qp1Id = generateId()
  const qp2Id = generateId()
  const qp3Id = generateId()
  const qp4Id = generateId()
  const qp5Id = generateId()
  const qp6Id = generateId()
  const qp7Id = generateId()
  const qp8Id = generateId()
  const qp9Id = generateId()
  const qp10Id = generateId()
  const qp11Id = generateId()
  const qp12Id = generateId()

  // Board consolidation (v56)
  const epic9Id = generateId()
  const bc1Id = generateId()
  const bc2Id = generateId()
  const bc3Id = generateId()

  // Seed data cleanup + naming convention (v57)
  const sprint6Id = generateId()
  const epic10Id = generateId()
  const dc1Id = generateId()
  const dc2Id = generateId()
  const dc3Id = generateId()

  // New architecture component IDs (v13)
  const archErrorBoundaryId = generateId()
  const archGraphUtilsId = generateId()
  const archVirtualListId = generateId()
  const archLoadingStateId = generateId()
  const archErrorStateId = generateId()
  const archCanvasHooksId = generateId()
  const archGroupTestingId = generateId()

  // Architecture component IDs (stable for cross-referencing dependencies)
  const archContextId = generateId()
  const archBoardId = generateId()
  const archWikiId = generateId()
  const archWorkflowId = generateId()
  const archHookId = generateId()
  const archTimelineId = generateId()
  const archDecisionsId = generateId()
  const archOverviewId = generateId()
  const archGlassCardId = generateId()
  const archModalId = generateId()
  const archTabsId = generateId()
  const archGanttId = generateId()
  const archStorageId = generateId()
  const archBfsId = generateId()
  const archArchitectureId = generateId()
  const archGroupAppId = generateId()
  const archGroupUiId = generateId()
  const archGroupDataId = generateId()
  const archGroupServicesId = generateId()

  const startNodeId = generateId()
  const wfScaffoldId = generateId()
  const wfStateId = generateId()
  const wfBoardWikiId = generateId()
  const wfWorkflowTimelineId = generateId()
  const wfPolishId = generateId()
  const endNodeId = generateId()

  return {
    id: projectId,
    name: 'StoryFlow',
    description:
      'A visual project planning and management tool built with React — kanban boards, wiki documentation, workflow canvas, timeline tracking, architecture mapping, and decision logs in one cohesive interface.',
    status: 'in-progress',
    techStack: ['React', 'Vite', 'Tailwind CSS', 'Framer Motion'],
    createdAt: now,
    updatedAt: now,
    isSeed: true,
    seedVersion: SEED_VERSION,

    overview: {
      goals:
        'Build a modern, all-in-one project planning tool that combines kanban boards, wiki documentation, workflow visualization, and timeline tracking into a single cohesive interface. The tool should be intuitive enough for solo developers while powerful enough for small teams.',
      constraints:
        'Must run entirely in the browser with no backend required for the initial version. Data persistence via localStorage. Bundle size should remain reasonable for fast load times.',
      targetAudience:
        'Solo developers and small development teams who need a lightweight project planning tool without the overhead of enterprise solutions like Jira or Azure DevOps.',
    },

    architecture: {
      components: [
        // --- Group nodes (tree structure parents) ---
        {
          id: archGroupAppId,
          name: 'App Shell',
          description: 'Top-level application with routing, layout, and 7 project tabs',
          type: 'component',
          parentId: null,
          dependencies: [archGroupDataId, archGroupUiId],
        },
        {
          id: archGroupUiId,
          name: 'UI Components',
          description: 'Shared glassmorphism component library (16 components)',
          type: 'component',
          parentId: null,
          dependencies: [],
        },
        {
          id: archGroupDataId,
          name: 'Data Layer',
          description: 'State management, hooks, and persistence',
          type: 'context',
          parentId: null,
          dependencies: [archGroupServicesId],
        },
        {
          id: archGroupServicesId,
          name: 'Services',
          description: 'Background services and engines',
          type: 'service',
          parentId: null,
          dependencies: [],
        },
        // --- UI Components (children of UI Components group) ---
        {
          id: archGlassCardId,
          name: 'GlassCard',
          description: 'Glassmorphism card container used across all views',
          type: 'component',
          parentId: archGroupUiId,
          dependencies: [],
        },
        {
          id: archModalId,
          name: 'Modal',
          description: 'Overlay dialog with backdrop, used for forms and confirmations',
          type: 'component',
          parentId: archGroupUiId,
          dependencies: [],
        },
        {
          id: archTabsId,
          name: 'Tabs',
          description: 'Tab navigation component with animated underline indicator',
          type: 'component',
          parentId: archGroupUiId,
          dependencies: [],
        },
        {
          id: archGanttId,
          name: 'GanttChart',
          description: 'Pure SVG Gantt chart with time axis, bars, milestones, today line',
          type: 'component',
          parentId: archGroupUiId,
          dependencies: [],
        },
        // --- Data Layer (children of Data Layer group) ---
        {
          id: archContextId,
          name: 'ProjectsContext',
          description:
            'Global state management for all projects using React Context and useReducer',
          type: 'context',
          parentId: archGroupDataId,
          dependencies: [archStorageId],
        },
        {
          id: archHookId,
          name: 'useProject Hook',
          description: 'Per-project CRUD with nested field updaters for all 7 tabs',
          type: 'hook',
          parentId: archGroupDataId,
          dependencies: [archContextId],
        },
        // --- Services (children of Services group) ---
        {
          id: archStorageId,
          name: 'IndexedDB Persistence (Dexie.js)',
          description:
            'Crash-safe persistence via IndexedDB with Dexie.js. Custom Zustand storage adapter, automatic localStorage migration, fallback support.',
          type: 'service',
          parentId: archGroupServicesId,
          dependencies: [],
        },
        {
          id: archBfsId,
          name: 'BFS Execution Engine',
          description: 'Breadth-first workflow traversal with parallel branch support',
          type: 'service',
          parentId: archGroupServicesId,
          dependencies: [],
        },
        // --- Tab Views (children of App Shell) ---
        {
          id: archOverviewId,
          name: 'Overview Tab',
          description: 'Project details, goals, constraints, tech stack',
          type: 'page',
          parentId: archGroupAppId,
          dependencies: [archHookId, archGlassCardId],
        },
        {
          id: archBoardId,
          name: 'Board View',
          description: 'Kanban-style board with drag-and-drop issue management',
          type: 'page',
          parentId: archGroupAppId,
          dependencies: [archHookId, archGlassCardId, archModalId],
        },
        {
          id: archWikiId,
          name: 'Wiki System',
          description: 'Hierarchical page system with markdown editing and templates',
          type: 'page',
          parentId: archGroupAppId,
          dependencies: [archHookId, archGlassCardId, archModalId],
        },
        {
          id: archWorkflowId,
          name: 'Workflow Canvas',
          description: 'Visual node-based workflow editor with execution engine',
          type: 'page',
          parentId: archGroupAppId,
          dependencies: [archHookId, archBfsId, archGlassCardId],
        },
        {
          id: archTimelineId,
          name: 'Timeline View',
          description: 'Gantt chart and list view with milestone tracking',
          type: 'page',
          parentId: archGroupAppId,
          dependencies: [archHookId, archGanttId, archGlassCardId, archTabsId],
        },
        {
          id: archDecisionsId,
          name: 'Decisions Log',
          description: 'Architectural decision records with alternatives and consequences',
          type: 'page',
          parentId: archGroupAppId,
          dependencies: [archHookId, archGlassCardId, archModalId],
        },
        {
          id: archArchitectureId,
          name: 'Architecture View',
          description: 'Component dependency graph with interactive visualization',
          type: 'page',
          parentId: archGroupAppId,
          dependencies: [archHookId, archGlassCardId, archTabsId, archModalId],
        },
        // --- Quality Infrastructure (v13) ---
        {
          id: archGroupTestingId,
          name: 'Testing & Quality',
          description: 'Testing infrastructure, error handling, and code quality tooling',
          type: 'service',
          parentId: null,
          dependencies: [],
        },
        {
          id: archErrorBoundaryId,
          name: 'ErrorBoundary',
          description: 'React error boundary with fallback UI, error details, and recovery options',
          type: 'component',
          parentId: archGroupAppId,
          dependencies: [],
        },
        {
          id: archGraphUtilsId,
          name: 'Graph Utilities',
          description:
            'Cycle detection, topological sort, dependency validation for architecture components',
          type: 'utility',
          parentId: archGroupTestingId,
          dependencies: [],
        },
        {
          id: archLoadingStateId,
          name: 'LoadingState',
          description: 'Animated loading indicator with spinner and optional message',
          type: 'component',
          parentId: archGroupUiId,
          dependencies: [],
        },
        {
          id: archErrorStateId,
          name: 'ErrorState',
          description: 'Error display with retry button for failed operations',
          type: 'component',
          parentId: archGroupUiId,
          dependencies: [],
        },
        {
          id: archVirtualListId,
          name: 'VirtualList',
          description: 'Virtualized scrolling for large lists with overscan buffer',
          type: 'component',
          parentId: archGroupUiId,
          dependencies: [],
        },
        {
          id: archCanvasHooksId,
          name: 'Canvas Hooks',
          description:
            'Extracted hooks: useCanvasViewport, useCanvasDrag, useCanvasPan, useCanvasConnection',
          type: 'hook',
          parentId: archGroupDataId,
          dependencies: [],
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
          config: {
            description:
              'Vite + React + Tailwind v4 setup, folder structure, routing, glassmorphism theme, core UI components',
          },
          children: (() => {
            const sId = generateId(),
              e1 = generateId(),
              e2 = generateId(),
              e3 = generateId(),
              eEnd = generateId()
            return {
              nodes: [
                {
                  id: sId,
                  type: 'start',
                  title: 'Begin Setup',
                  x: 100,
                  y: 200,
                  status: 'success',
                  config: {},
                },
                {
                  id: e1,
                  type: 'task',
                  title: 'Initialize Vite + React',
                  x: 350,
                  y: 100,
                  status: 'success',
                  config: {
                    assignee: 'claude',
                    notes: 'Vite 6 with React 18 plugin, hot reload, port 3000',
                  },
                },
                {
                  id: e2,
                  type: 'task',
                  title: 'Configure Tailwind CSS',
                  x: 350,
                  y: 300,
                  status: 'success',
                  config: {
                    assignee: 'claude',
                    notes:
                      '@tailwindcss/vite plugin, @import "tailwindcss" in index.css, @theme for custom properties',
                  },
                },
                {
                  id: e3,
                  type: 'task',
                  title: 'Build Component Library',
                  x: 600,
                  y: 200,
                  status: 'success',
                  config: {
                    assignee: 'claude',
                    notes:
                      '16 UI components: GlassCard, Button, Modal, Input, Badge, Tabs, ProgressBar, Tooltip, etc.',
                  },
                },
                {
                  id: eEnd,
                  type: 'end',
                  title: 'Scaffolding Complete',
                  x: 850,
                  y: 200,
                  status: 'success',
                  config: {},
                },
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
          config: {
            description:
              'ProjectsContext with useReducer, useProject hooks, localStorage persistence, JSON export/import',
          },
          children: (() => {
            const sId = generateId(),
              e1 = generateId(),
              e2 = generateId(),
              e3 = generateId(),
              eEnd = generateId()
            return {
              nodes: [
                {
                  id: sId,
                  type: 'start',
                  title: 'Start',
                  x: 100,
                  y: 200,
                  status: 'success',
                  config: {},
                },
                {
                  id: e1,
                  type: 'task',
                  title: 'ProjectsContext + Reducer',
                  x: 350,
                  y: 120,
                  status: 'success',
                  config: {
                    assignee: 'claude',
                    notes:
                      'useReducer with immutable state updates, CRUD actions for all 7 project sections',
                  },
                },
                {
                  id: e2,
                  type: 'task',
                  title: 'useProject Hook',
                  x: 350,
                  y: 280,
                  status: 'success',
                  config: {
                    assignee: 'claude',
                    notes: 'Per-field updaters: updateOverview, addIssue, updatePage, etc.',
                  },
                },
                {
                  id: e3,
                  type: 'task',
                  title: 'localStorage + Export/Import',
                  x: 600,
                  y: 200,
                  status: 'success',
                  config: {
                    assignee: 'claude',
                    notes: 'useAutoSave with 500ms debounce, schemaVersion 1, JSON CLI bridge',
                  },
                },
                {
                  id: eEnd,
                  type: 'end',
                  title: 'Data Layer Done',
                  x: 850,
                  y: 200,
                  status: 'success',
                  config: {},
                },
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
          config: {
            description:
              'Kanban board with drag-and-drop, sprints, burndown/velocity charts. Wiki with page tree, markdown editor, templates.',
          },
          children: (() => {
            const sId = generateId(),
              e1 = generateId(),
              e2 = generateId(),
              e3 = generateId(),
              e4 = generateId(),
              eEnd = generateId()
            return {
              nodes: [
                {
                  id: sId,
                  type: 'start',
                  title: 'Start',
                  x: 100,
                  y: 200,
                  status: 'success',
                  config: {},
                },
                {
                  id: e1,
                  type: 'task',
                  title: 'Sprint Board + Drag-Drop',
                  x: 350,
                  y: 80,
                  status: 'success',
                  config: {
                    assignee: 'claude',
                    notes: 'SprintBoard, BoardColumn, IssueCard with DnD, BacklogView',
                  },
                },
                {
                  id: e2,
                  type: 'task',
                  title: 'Issue Detail + Charts',
                  x: 350,
                  y: 200,
                  status: 'success',
                  config: {
                    assignee: 'claude',
                    notes: 'IssueDetailModal, BurndownChart, VelocityChart (pure SVG)',
                  },
                },
                {
                  id: e3,
                  type: 'task',
                  title: 'Wiki Page Tree + Editor',
                  x: 350,
                  y: 320,
                  status: 'success',
                  config: {
                    assignee: 'claude',
                    notes: 'PageTree with nested hierarchy, PageEditor with split markdown/preview',
                  },
                },
                {
                  id: e4,
                  type: 'task',
                  title: 'Templates + Version History',
                  x: 600,
                  y: 200,
                  status: 'success',
                  config: {
                    assignee: 'claude',
                    notes:
                      '6 page templates, version tracking, page status (draft/published/archived)',
                  },
                },
                {
                  id: eEnd,
                  type: 'end',
                  title: 'Board & Wiki Done',
                  x: 850,
                  y: 200,
                  status: 'success',
                  config: {},
                },
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
          config: {
            description:
              'Visual workflow canvas with BFS engine, sub-workflow overlays. Gantt timeline with milestones and stats.',
          },
          children: (() => {
            const sId = generateId(),
              e1 = generateId(),
              e2 = generateId(),
              e3 = generateId(),
              e4 = generateId(),
              eEnd = generateId()
            return {
              nodes: [
                {
                  id: sId,
                  type: 'start',
                  title: 'Start',
                  x: 100,
                  y: 200,
                  status: 'success',
                  config: {},
                },
                {
                  id: e1,
                  type: 'task',
                  title: 'Workflow Canvas + Nodes',
                  x: 350,
                  y: 80,
                  status: 'success',
                  config: {
                    assignee: 'claude',
                    notes:
                      'WorkflowCanvas, WorkflowNode (180px, 6 types), drag-to-move, port connections',
                  },
                },
                {
                  id: e2,
                  type: 'task',
                  title: 'BFS Engine + Sub-workflows',
                  x: 350,
                  y: 200,
                  status: 'success',
                  config: {
                    assignee: 'claude',
                    notes: 'Queue-based BFS, SubWorkflowOverlay, NodeDetailModal, context menu',
                  },
                },
                {
                  id: e3,
                  type: 'task',
                  title: 'Gantt Chart (SVG)',
                  x: 350,
                  y: 320,
                  status: 'success',
                  config: {
                    assignee: 'claude',
                    notes:
                      'GanttChart, GanttBar, GanttTimeAxis, GanttMilestone — pure SVG, scrollable',
                  },
                },
                {
                  id: e4,
                  type: 'task',
                  title: 'Milestones + Stats',
                  x: 600,
                  y: 200,
                  status: 'success',
                  config: {
                    assignee: 'claude',
                    notes: 'MilestoneForm, MilestoneMarker, TimelineStats, chart/list sub-tabs',
                  },
                },
                {
                  id: eEnd,
                  type: 'end',
                  title: 'Features Complete',
                  x: 850,
                  y: 200,
                  status: 'success',
                  config: {},
                },
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
          config: {
            description:
              'Responsive design, keyboard shortcuts, performance, security hardening, zoom/pan, documentation.',
          },
          children: (() => {
            const sId = generateId(),
              e1 = generateId(),
              e1b = generateId(),
              e2 = generateId(),
              e3 = generateId(),
              e4 = generateId(),
              e4b = generateId(),
              e5 = generateId(),
              eEnd = generateId()
            return {
              nodes: [
                {
                  id: sId,
                  type: 'start',
                  title: 'Start',
                  x: 100,
                  y: 200,
                  status: 'success',
                  config: {},
                },
                {
                  id: e1,
                  type: 'task',
                  title: 'Keyboard Shortcuts',
                  x: 350,
                  y: 40,
                  status: 'success',
                  config: {
                    assignee: 'claude',
                    notes:
                      'Alt+1-7 tab switching, ? for shortcuts modal, input-safe plain-key detection, sidebar tooltip hints',
                  },
                },
                {
                  id: e1b,
                  type: 'task',
                  title: 'Responsive Layout',
                  x: 350,
                  y: 140,
                  status: 'success',
                  config: {
                    assignee: 'claude',
                    notes:
                      '12-file responsive overhaul: hamburger sidebar, bottom tab bar, wiki tree toggle, decisions stacking, md: breakpoint',
                  },
                },
                {
                  id: e2,
                  type: 'task',
                  title: 'Security Hardening',
                  x: 350,
                  y: 240,
                  status: 'success',
                  config: {
                    assignee: 'claude',
                    notes:
                      'URL sanitization, color validation, import hardening, audit documentation',
                  },
                },
                {
                  id: e3,
                  type: 'task',
                  title: 'Zoom & Centering',
                  x: 350,
                  y: 340,
                  status: 'success',
                  config: {
                    assignee: 'claude',
                    notes:
                      'Workflow canvas zoom/pan with CSS zoom for crisp text, auto-centering, WorkflowZoomControls component',
                  },
                },
                {
                  id: e4,
                  type: 'task',
                  title: 'Sidebar Cleanup',
                  x: 600,
                  y: 340,
                  status: 'success',
                  config: {
                    assignee: 'claude',
                    notes:
                      'Removed gradient tab indicator bar and bg-white/10 active highlight — icon color only',
                  },
                },
                {
                  id: e4b,
                  type: 'task',
                  title: 'Accent Color Expansion',
                  x: 600,
                  y: 140,
                  status: 'success',
                  config: {
                    assignee: 'claude',
                    notes:
                      '~15 components updated: replaced hardcoded purple with var(--accent-active) and rgba(var(--accent-active-rgb)) patterns across tabs, filters, epics, board, cards, timeline, architecture, velocity chart',
                  },
                },
                {
                  id: e5,
                  type: 'task',
                  title: 'Performance + Docs',
                  x: 800,
                  y: 200,
                  status: 'success',
                  config: {
                    assignee: 'claude',
                    notes:
                      'React.lazy + Suspense for 7 tabs. manualChunks vendor splitting. 625KB→165KB. 4 new wiki pages. Renamed sampleProject→seedProject with SEED_VERSION auto-migration.',
                  },
                },
                {
                  id: eEnd,
                  type: 'end',
                  title: 'MVP Ready',
                  x: 950,
                  y: 200,
                  status: 'success',
                  config: {},
                },
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
        {
          id: sprint4Id,
          name: 'Sprint 4 — Quality Infrastructure',
          goal: 'Error boundaries, testing infrastructure, accessibility, code quality tooling, refactoring',
          startDate: '2026-02-12',
          endDate: '2026-02-14',
          status: 'completed',
        },
        {
          id: sprint5Id,
          name: 'Sprint 5 — StoryFlow 2.0 Overhaul',
          goal: 'Design token consolidation, Zustand migration, URL routing, tab consolidation (7→5), activity feed',
          startDate: '2026-02-13',
          endDate: '2026-02-15',
          status: 'completed',
        },
        {
          id: sprint6Id,
          name: 'Sprint 6 — Production Hardening',
          goal: 'Go-live audit fixes, full quality pass, board consolidation, seed data cleanup, naming conventions',
          startDate: '2026-02-15',
          endDate: '2026-02-16',
          status: 'active',
        },
      ],
      issues: [
        // === EPIC: Project Management Core (SF-1) ===
        {
          id: epicId,
          key: 'SF-1',
          type: 'epic',
          title: 'Project Management Core',
          description:
            'Implement the core project management features including project CRUD operations, context providers, and data persistence. Covers ProjectsContext with useReducer, useProject hooks for per-field CRUD, useAutoSave for debounced localStorage writes, and the default/sample project data seeds.',
          status: 'Done',
          priority: 'critical',
          storyPoints: 13,
          assignee: 'claude',
          labels: ['architecture'],
          sprintId: sprint1Id,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: story1Id,
          key: 'SF-2',
          type: 'story',
          title: 'As a user, I want to create and manage kanban boards',
          description:
            'Built SprintBoard with drag-and-drop columns, IssueCard with type/priority badges, BacklogView for unassigned issues, IssueDetailModal with all fields. Added sprint management (create/edit/complete), status column customization, and board-level filters for type/priority/assignee/labels.',
          status: 'Done',
          priority: 'high',
          storyPoints: 8,
          assignee: 'claude',
          labels: ['board', 'ui'],
          epicId: epicId,
          sprintId: sprint2Id,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: story2Id,
          key: 'SF-3',
          type: 'story',
          title: 'As a user, I want to write and organize wiki pages',
          description:
            'Built PageTree with nested parent/child hierarchy, PageEditor with split markdown/preview mode, MarkdownRenderer with syntax highlighting, and 6 page templates (blank, meeting notes, technical spec, API docs, retrospective, decision record). Added version history tracking and page status (draft/published/archived).',
          status: 'Done',
          priority: 'high',
          storyPoints: 8,
          assignee: 'claude',
          labels: ['wiki', 'ui'],
          epicId: epicId,
          sprintId: sprint2Id,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: task1Id,
          key: 'SF-4',
          type: 'task',
          title: 'Set up project scaffolding with Vite and Tailwind',
          description:
            'Initialized Vite 6 with React 18 plugin, configured Tailwind CSS v4 via @tailwindcss/vite (no postcss.config or tailwind.config needed), set up folder structure (components/ui, layout, project, hooks, contexts, utils, data), added react-router-dom routing with Dashboard and ProjectPage, built the glassmorphism theme in index.css with glass, glass-card, glass-sidebar, glass-input classes.',
          status: 'Done',
          priority: 'high',
          storyPoints: 3,
          assignee: 'claude',
          labels: ['setup', 'tooling'],
          epicId: epicId,
          sprintId: sprint1Id,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: task2Id,
          key: 'SF-5',
          type: 'task',
          title: 'Implement localStorage persistence layer',
          description:
            'Built useAutoSave hook with 500ms debounce that serializes the full projects array to localStorage under `storyflow-projects`. Created JSON export format with schemaVersion, exportedAt, and project payload. Added import validation. The ProjectsContext reducer produces immutable state updates that trigger auto-save on every dispatch.',
          status: 'Done',
          priority: 'medium',
          storyPoints: 5,
          assignee: 'claude',
          labels: ['data', 'state'],
          epicId: epicId,
          sprintId: sprint1Id,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: bugId,
          key: 'SF-6',
          type: 'bug',
          title: 'Workflow connections not rendering on initial load',
          description:
            'When the workflow canvas first mounts, SVG connections between nodes are not drawn until the user interacts with the canvas. Root cause: node refs not measured yet during first render. Fixed by deferring connection measurement with useLayoutEffect and a requestAnimationFrame callback so DOM measurements happen after layout.',
          status: 'Done',
          priority: 'medium',
          storyPoints: 2,
          assignee: 'claude',
          labels: ['workflow', 'bug'],
          epicId: epicId,
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
          description:
            'Full workflow system: WorkflowCanvas with pan/zoom and grid snapping, WorkflowNode (180px wide, 6 types), WorkflowConnection with SVG bezier curves, NodeContextMenu with viewport bounds detection, NodeDetailModal for config editing. Sub-workflow overlay for phase nodes with breadcrumb navigation. BFS execution engine that traverses the DAG level-by-level.',
          status: 'Done',
          priority: 'critical',
          storyPoints: 21,
          assignee: 'claude',
          labels: ['workflow'],
          sprintId: sprint3Id,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: story3Id,
          key: 'SF-8',
          type: 'story',
          title: 'As a user, I want to build visual workflows with draggable nodes',
          description:
            'Built WorkflowCanvas with mouse-based panning, WorkflowNode with 6 types (start/end/task/phase/decision/parallel), drag-to-move with grid snapping, port-based connection creation by dragging between output→input ports, SVG bezier curve rendering for connections. Right-click context menu with edit/delete/duplicate actions. Node width is 180px — kept WorkflowConnection NODE_WIDTH in sync.',
          status: 'Done',
          priority: 'high',
          storyPoints: 8,
          assignee: 'claude',
          labels: ['workflow', 'ui'],
          epicId: epic2Id,
          sprintId: sprint3Id,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: task3Id,
          key: 'SF-9',
          type: 'task',
          title: 'Implement BFS execution engine for workflow traversal',
          description:
            'Built executeWorkflow() in utils/workflow.js. Uses a queue-based BFS that processes nodes level by level. Each node transitions idle→running→success/error. Parallel branches at the same depth execute together. Join nodes wait for all incoming edges to complete. Prevents cycles at connection-creation time to guarantee DAG property. Execution log tracks timestamps and status changes.',
          status: 'Done',
          priority: 'high',
          storyPoints: 5,
          assignee: 'claude',
          labels: ['workflow'],
          epicId: epic2Id,
          sprintId: sprint3Id,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: task4Id,
          key: 'SF-10',
          type: 'task',
          title: 'Add sub-workflow overlay and node detail modals',
          description:
            'Phase nodes have a `children` object with their own nodes/connections arrays. Clicking "Expand" opens a SubWorkflowOverlay that renders the nested graph in a modal-like popup with breadcrumb navigation back to the parent. NodeDetailModal lets you edit title, description, assignee, notes, and status. Status badge shows step counts (e.g. "3/5 steps").',
          status: 'Done',
          priority: 'medium',
          storyPoints: 5,
          assignee: 'claude',
          labels: ['workflow', 'ui'],
          epicId: epic2Id,
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
          description:
            'Full Gantt chart implementation: GanttChart container with scrollable SVG, GanttBar for phase rows with progress fill, GanttMilestone as diamond markers, GanttTimeAxis with week/month grid lines and "Today" dashed red line. TimelineStats with 4 stat cards. MilestoneForm modal for CRUD. TimelineView list with chronologically interleaved phases and milestones. Chart/List sub-tab toggle.',
          status: 'Done',
          priority: 'high',
          storyPoints: 13,
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
          description:
            'Built GanttChart.jsx as the main SVG container. Computes dateToX mapping from phase/milestone date ranges with ±7 day padding. LABEL_WIDTH=160, ROW_HEIGHT=44, HEADER_HEIGHT=36. Date labels centered in header, bars strictly below header border. GanttBar renders background rect at 18% opacity + progress fill at 65% opacity + percentage text. Dynamic chart width = max(800, totalDays*12). Wrapped in overflow-x-auto div for horizontal scrolling.',
          status: 'Done',
          priority: 'high',
          storyPoints: 5,
          assignee: 'claude',
          labels: ['timeline', 'ui'],
          epicId: epic3Id,
          sprintId: sprint3Id,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: story5Id,
          key: 'SF-13',
          type: 'story',
          title: 'As a user, I want to create and track milestones',
          description:
            'Added milestone data model: { id, name, date, completed, color, phaseId }. Built MilestoneForm modal with name, date picker, phase select dropdown, completed toggle, and color picker. GanttMilestone renders as a rotated diamond SVG polygon — filled when completed, hollow when pending. MilestoneMarker in list view shows diamond on timeline spine with GlassCard, hover edit/delete buttons, and click-to-toggle completed. Milestones interleaved chronologically with phases in TimelineView.',
          status: 'Done',
          priority: 'medium',
          storyPoints: 3,
          assignee: 'claude',
          labels: ['timeline'],
          epicId: epic3Id,
          sprintId: sprint3Id,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: task5Id,
          key: 'SF-14',
          type: 'task',
          title: 'Build timeline stats dashboard with progress indicators',
          description:
            'Built TimelineStats.jsx with 4 GlassCard stat tiles: Overall Progress (weighted average across phases), Phase Count, Milestones Done (completed/total), Days Remaining (until last phase endDate). Each card has a Lucide icon, value, and label. Integrated into TimelineTab above the chart/list toggle. Uses date-fns differenceInDays for the countdown.',
          status: 'Done',
          priority: 'medium',
          storyPoints: 3,
          assignee: 'claude',
          labels: ['timeline', 'ui'],
          epicId: epic3Id,
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
          description:
            'Final sprint before MVP: responsive breakpoints for mobile/tablet, keyboard shortcut system (tab switching, new issue, search focus, save), global search improvements, dark/light theme toggle polish, Lighthouse performance audit, lazy-load heavy components (WorkflowCanvas, GanttChart), bundle size optimization, and documentation cleanup.',
          status: 'Done',
          priority: 'high',
          storyPoints: 13,
          assignee: 'claude',
          labels: ['polish', 'release'],
          sprintId: sprint3Id,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: story6Id,
          key: 'SF-16',
          type: 'story',
          title: 'As a user, I want keyboard shortcuts for common actions',
          description:
            'Implemented keyboard shortcuts system. Alt+1-7 switches between the 7 project tabs. "?" opens a ShortcutsModal listing all bindings with platform-aware modifier keys (⌘ on Mac, Ctrl on Windows). Ctrl+/ opens the command palette. Esc closes modals. The useKeyboardShortcuts hook skips plain-key shortcuts when focus is in an input/textarea/contenteditable. Sidebar tooltips now show the shortcut hint alongside the tab name.',
          status: 'Done',
          priority: 'medium',
          storyPoints: 5,
          assignee: 'claude',
          labels: ['polish', 'accessibility', 'ui'],
          epicId: epic4Id,
          sprintId: sprint3Id,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: task6Id,
          key: 'SF-17',
          type: 'task',
          title: 'Responsive layout and mobile breakpoints',
          description:
            'Implemented responsive layout across 12 files. Sidebar collapses to hamburger overlay on mobile, project tabs become bottom bar, wiki page tree toggles as overlay, decisions tab stacks vertically with back button, architecture tree stacks above detail, board sub-nav scrolls horizontally. All using md: (768px) breakpoint.',
          status: 'Done',
          priority: 'medium',
          storyPoints: 5,
          assignee: 'claude',
          labels: ['polish', 'ui'],
          epicId: epic4Id,
          sprintId: sprint3Id,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: bug2Id,
          key: 'SF-18',
          type: 'bug',
          title: 'AnimatePresence mode="wait" causes blank page on route transition',
          description:
            'Bug: Wrapping React Router Outlet with AnimatePresence mode="wait" causes exit animations to get stuck — the exiting route stays at opacity:0 and transform at the exit state, blocking the entering route from ever appearing. Result: blank white page. Root cause: Framer Motion\'s exit animation conflicts with React Router\'s unmount timing. Fix: removed mode="wait" from route-level AnimatePresence. Tab-level AnimatePresence (inside ProjectPage) still works fine with mode="wait".',
          status: 'Done',
          priority: 'high',
          storyPoints: 2,
          assignee: 'claude',
          labels: ['ui', 'bug', 'navigation'],
          epicId: epicId,
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
          description:
            'Full security review of the StoryFlow codebase. Found and fixed 3 classes of vulnerability:\n\n**Critical — XSS via markdown URLs (fixed):** The markdown renderer in src/utils/markdown.js injected user-provided URLs directly into href/src attributes via dangerouslySetInnerHTML in MarkdownRenderer.jsx. Markdown like [click](javascript:alert(1)) would execute arbitrary JS. Fixed by adding isSafeUrl() that whitelists http/https/mailto protocols and blocks javascript:/data:/vbscript: schemes.\n\n**Medium — CSS injection via color values (fixed):** User-editable phase.color and milestone.color strings were interpolated into style attributes and SVG fill/stroke props across PhaseCard, GanttBar, GanttMilestone, and MilestoneMarker. A crafted color string could inject arbitrary CSS. Fixed by adding sanitizeColor() in src/utils/sanitize.js that validates against hex/rgb/hsl patterns.\n\n**Medium — Import hardening (fixed):** JSON import had no file size limit and no prototype pollution guard. Added 10MB file size check in Header.jsx and stripDangerousKeys() in exportImport.js that recursively removes __proto__/constructor/prototype keys from imported objects.\n\nAlso created wiki pages documenting the full audit findings and a dependency inventory with all package versions for future CVE tracking.',
          status: 'Done',
          priority: 'critical',
          storyPoints: 5,
          assignee: 'claude',
          labels: ['security', 'tooling'],
          epicId: epic4Id,
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
          description:
            'Added viewport transform system to the workflow canvas:\n\n**Auto-centering:** Nodes are centered in the viewport on load by computing the bounding box and offsetting to viewport center. Each WorkflowCanvas instance (main + sub-workflow overlay) centers independently.\n\n**Zoom:** Controls in bottom-right corner with +/- buttons (10% increments, 25%-200% range), percentage display, and fit-to-view reset. Ctrl/Cmd+scroll zooms toward cursor position.\n\n**Pan:** Middle-mouse-button drag to pan the viewport.\n\n**Crisp rendering:** Uses CSS zoom instead of transform:scale for the scale factor, so text re-renders at native resolution at all zoom levels instead of getting blurry.\n\n**Coordinate transforms:** All mouse handlers (node drag, connection drawing, context menu) convert screen coords to canvas-space via inverse transform.\n\nFiles: WorkflowCanvas.jsx (viewport state, transform wrapper, handlers), WorkflowZoomControls.jsx (new component).',
          status: 'Done',
          priority: 'high',
          storyPoints: 5,
          assignee: 'claude',
          labels: ['workflow', 'ui', 'feature'],
          epicId: epic4Id,
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
          description:
            'Simplified the project sidebar active tab indicator. Removed the purple-to-blue gradient bar (motion.div with layoutId) and the bg-white/10 background highlight. Active state is now icon turning white only — cleaner and less cluttered. Also removed the unused framer-motion import from ProjectSidebar.jsx.',
          status: 'Done',
          priority: 'low',
          storyPoints: 1,
          assignee: 'claude',
          labels: ['ui', 'refactor'],
          epicId: epic4Id,
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
          description:
            'Added keyboard shortcuts to the app:\n\n**Tab switching:** Alt+1-7 switches between the 7 project tabs (Overview, Architecture, Workflow, Board, Wiki, Timeline, Decisions). Registered in ProjectPage.jsx via useKeyboardShortcuts hook.\n\n**Shortcuts modal:** Press "?" to open a modal listing all available shortcuts. Built ShortcutsModal.jsx with sections for Navigation and General shortcuts, displaying platform-aware modifier keys (⌘ on Mac, Ctrl on Windows).\n\n**Sidebar hints:** Updated ProjectSidebar tooltips to show the keyboard shortcut alongside the tab name (e.g. "Overview (Alt+1)").\n\n**Input safety:** Enhanced useKeyboardShortcuts hook to skip plain-key shortcuts (like "?") when focus is in an input, textarea, or contenteditable element.\n\nFiles: useKeyboardShortcuts.js (SHORTCUTS enum + input guard), ShortcutsModal.jsx (new), ProjectPage.jsx (tab shortcuts), AppLayout.jsx (? shortcut + modal), ProjectSidebar.jsx (tooltip hints).',
          status: 'Done',
          priority: 'medium',
          storyPoints: 3,
          assignee: 'claude',
          labels: ['polish', 'accessibility', 'ui'],
          epicId: epic4Id,
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
          description:
            'Full responsive overhaul across 12 files using md: (768px) as the single mobile/desktop breakpoint.\n\n**Phase 1 — Core Shell:**\n- AppLayout: mobileMenuOpen state, backdrop overlay, hamburger prop to Header\n- Sidebar: fixed overlay on mobile (z-40), auto-close on nav, X close button, hidden collapse toggle\n- Header: hamburger Menu icon before breadcrumbs (md:hidden)\n\n**Phase 2 — Project Tab Bar:**\n- ProjectSidebar: vertical left sidebar on desktop → fixed bottom horizontal bar on mobile with evenly-spaced icons\n- ProjectPage: bottom padding (pb-20) to clear the fixed tab bar on mobile\n\n**Phase 3 — Tab-Specific:**\n- WikiTab: showTree toggle with overlay backdrop for mobile, auto-close on page select, PanelLeft toggle button\n- TableOfContents: hidden on mobile (hidden md:block)\n- DecisionsTab: flex-col stack on mobile, list hidden when detail selected, full-width detail with back button\n- ArchitectureTab: flex-col stack on mobile, tree panel max-h-64 cap\n- WorkflowTab: log panel defaults to closed\n- BoardTab: overflow-x-auto on sub-nav tab row\n- ProjectHeader: saved-ago text hidden on mobile (hidden sm:inline)',
          status: 'Done',
          priority: 'medium',
          storyPoints: 5,
          assignee: 'claude',
          labels: ['polish', 'ui'],
          epicId: epic4Id,
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
          description:
            'Bug: The accent color picker in Settings set a --accent-active CSS variable on document.documentElement, but nothing in the UI consumed it. Changing accent colors had zero visual effect.\n\nRoot cause: The feature was architecturally complete (SettingsContext, localStorage, picker UI) but functionally disconnected — no CSS rules or components read the variable.\n\nFix:\n- SettingsContext: Also sets --accent-active-rgb (R,G,B triplet) for rgba() usage in CSS\n- index.css: glass-input:focus border/shadow, gradient-text, focus-visible outline, and ::selection now use var(--accent-active) / rgba(var(--accent-active-rgb))\n- Button.jsx: Primary variant gradient uses var(--accent-active) as the start color\n- Sidebar.jsx: New Project button gradient uses var(--accent-active)\n- SettingsPanel.jsx: Toggle switch background uses var(--accent-active); fixed ring-color on picker swatches (ringColor → --tw-ring-color)',
          status: 'Done',
          priority: 'medium',
          storyPoints: 3,
          assignee: 'claude',
          labels: ['bug', 'ui'],
          epicId: epic4Id,
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
          description:
            'Wire the accent color CSS variable into ~15 components: tabs, filters, epics sidebar, board columns, issue cards, quick create, backlog, velocity chart, phase cards, architecture dependency links, overview section icons, project header hover, and issue detail panel. Replace all hardcoded purple with var(--accent-active) and rgba(var(--accent-active-rgb)) patterns.',
          status: 'Done',
          priority: 'medium',
          storyPoints: 5,
          assignee: 'claude',
          labels: ['ui', 'theming'],
          epicId: epic4Id,
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
          description:
            'React.lazy() + Suspense for all 7 project tab components and ProjectPage route. manualChunks in vite.config.js to split vendor-react, vendor-motion, vendor-utils. Reduced largest chunk from 625KB to 165KB, eliminated chunk size warning.',
          status: 'Done',
          priority: 'medium',
          storyPoints: 3,
          assignee: 'claude',
          labels: ['performance', 'infrastructure'],
          epicId: epic4Id,
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
          description:
            'Add 4 new wiki pages (Keyboard Shortcuts, Responsive Layout, Theming & Accent Colors, Performance & Bundle Splitting). Update Architecture Overview with code splitting, responsive, and theming sections. Close out all tracker items for MVP release.',
          status: 'Done',
          priority: 'medium',
          storyPoints: 3,
          assignee: 'claude',
          labels: ['docs', 'wiki'],
          epicId: epic4Id,
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
          description:
            'Rename sampleProject.js to seedProject.js. Add fixed SEED_PROJECT_ID and SEED_VERSION constants. Add migrateSeedProject() to ProjectsContext that auto-updates the seed project when the version is bumped. Existing users get new wiki pages, board issues, workflow updates without clearing localStorage.',
          status: 'Done',
          priority: 'high',
          storyPoints: 5,
          assignee: 'claude',
          labels: ['infrastructure'],
          epicId: epic4Id,
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
          description:
            'Remove 5 orphaned files (PageTransition, useLocalStorage, useAutoSave, storage.js, issueKeys.js). Trim colors.js to only getPriorityColor. Security audit passed clean. Pre-UAT sweep.',
          status: 'Done',
          priority: 'medium',
          storyPoints: 2,
          assignee: 'claude',
          labels: ['refactor'],
          epicId: epic4Id,
          sprintId: sprint3Id,
          createdAt: now,
          updatedAt: now,
        },

        // === Architecture Tab Upgrade (SF-30) ===
        {
          id: task12Id,
          type: 'story',
          key: 'SF-30',
          title: 'Architecture tab upgrade — dependency graph + multi-view',
          description:
            'Major upgrade to Architecture tab: decomposed 471-line monolith into 7 sub-components. Added interactive dependency graph visualization (SVG canvas with zoom/pan/drag), Graph/Tree sub-tabs, ArchitectureStats (4 stat cards), ComponentForm modal, enhanced ComponentDetail with mini dep viz and "Used by" section. 8 files total.',
          status: 'Done',
          priority: 'high',
          storyPoints: 8,
          assignee: 'claude',
          labels: ['feature', 'architecture', 'ui'],
          epicId: epic4Id,
          sprintId: sprint3Id,
          createdAt: now,
          updatedAt: now,
        },
        // === Seed Data Audit & Fix (SF-31) ===
        {
          id: task13Id,
          type: 'bug',
          key: 'SF-31',
          title: 'Seed data audit — fix flat architecture tree and storyPoints field name',
          description:
            'Architecture tree was completely flat (all components at root level with no parentId). Added 4 group nodes (App Shell, UI Components, Data Layer, Services) with proper parent-child hierarchy. Also fixed field name inconsistency: 24 board issues used `points` instead of `storyPoints`, causing story point badges and velocity chart to show 0.',
          status: 'Done',
          priority: 'high',
          storyPoints: 2,
          assignee: 'claude',
          labels: ['bug', 'data'],
          epicId: epic4Id,
          sprintId: sprint3Id,
          createdAt: now,
          updatedAt: now,
        },
        // === Generic Tracker Workflow Documentation (SF-32) ===
        {
          id: task14Id,
          type: 'task',
          key: 'SF-32',
          title: 'Rewrite tracker workflow as generic global instructions',
          description:
            'Rewrote the Project Tracker Workflow section in MEMORY.md to be project-agnostic — removed all StoryFlow-specific literals (SF-##, seedProject.js, SEED_VERSION). Uses generic language ("the project\'s issue prefix", "the tracker/seed file", "the version constant") so the same instructions apply to any project tracked via StoryFlow. Added: explicit two-phase update pattern (before/after execution), audit trail standards for workflow notes, honest percentage guidance for timeline progress, mandatory wiki updates when new dirs/components created, strawman-free decision alternatives requirement, cross-tab consistency rules. Portability note marks section for future move to ~/.claude/CLAUDE.md on macOS. Also added 2 new lessons learned entries (storyPoints field name, architecture parentId/dependencies requirement). File: ~/.claude/projects/.../memory/MEMORY.md, ~145 lines.',
          status: 'Done',
          priority: 'medium',
          storyPoints: 1,
          assignee: 'claude',
          labels: ['docs', 'process'],
          epicId: epic4Id,
          sprintId: sprint3Id,
          createdAt: now,
          updatedAt: now,
        },
        // === Claude Code Skill for Tracker Workflow (SF-33) ===
        {
          id: task15Id,
          type: 'story',
          key: 'SF-33',
          title: 'Create Claude Code skill for global tracker workflow persistence',
          description:
            'Created a Claude Code skill for global tracker workflow persistence. Initially placed at ~/.claude/skills/storyflow-tracker/ (user-level), then moved into the StoryFlow project repo at skills/storyflow-tracker/ so the skill travels with the codebase and will be accessible when StoryFlow runs as a persistent service post-migration. See SF-34 for the relocation.',
          status: 'Done',
          priority: 'high',
          storyPoints: 3,
          assignee: 'claude',
          labels: ['feature', 'process', 'infrastructure'],
          epicId: epic4Id,
          sprintId: sprint3Id,
          createdAt: now,
          updatedAt: now,
        },
        // === Move Skill Files Into Project Repo (SF-34) ===
        {
          id: task16Id,
          type: 'task',
          key: 'SF-34',
          title: 'Relocate tracker skill from user-level to project repo',
          description:
            'Moved 3 skill/command files from ~/.claude/skills/storyflow-tracker/ and ~/.claude/commands/ into the StoryFlow project at skills/storyflow-tracker/ and skills/commands/. Reason: user-level skills are machine-local and would not be accessible to Claude on other environments (e.g. macOS unified server). By storing them in the project repo, the skill definition travels with the codebase via git. Post-migration TODO: when StoryFlow runs as a persistent service with a real URL, Claude will need to be configured to access that service endpoint. Files moved: SKILL.md (~72 lines), references/update-areas.md (~114 lines), commands/update-tracker.md (~27 lines). Deleted: ~/.claude/skills/storyflow-tracker/ directory and ~/.claude/commands/update-tracker.md.',
          status: 'Done',
          priority: 'medium',
          storyPoints: 1,
          assignee: 'claude',
          labels: ['infrastructure'],
          epicId: epic4Id,
          sprintId: sprint3Id,
          createdAt: now,
          updatedAt: now,
        },

        // === EPIC: Quality & Testing Infrastructure (SF-35) ===
        {
          id: epic5Id,
          key: 'SF-35',
          type: 'epic',
          title: 'Quality & Testing Infrastructure',
          description:
            'Comprehensive quality infrastructure: ErrorBoundary for crash recovery, Vitest testing framework with 54 tests (graph utilities + useProject + ProjectsContext), ESLint/Prettier/Husky for code quality, TypeScript config for incremental adoption, Modal accessibility improvements (ARIA, focus trap), LoadingState/ErrorState UI feedback components, Suspense fallback fix, cycle detection UI integration, WorkflowCanvas refactoring into 4 extracted hooks, VirtualList for large lists, and reference validation in useProject.',
          status: 'Done',
          priority: 'critical',
          storyPoints: 27,
          assignee: 'claude',
          labels: ['tooling', 'infrastructure', 'testing'],
          sprintId: sprint4Id,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: story7Id,
          key: 'SF-36',
          type: 'story',
          title: 'As a user, I want the app to recover gracefully from errors',
          description:
            'Created ErrorBoundary component (src/components/layout/ErrorBoundary.jsx) that catches React render errors and displays a friendly fallback UI with error details, "Try Again" and "Go to Dashboard" buttons, and expandable technical details. Wraps entire app in App.jsx. Prevents full app crashes from component errors.',
          status: 'Done',
          priority: 'critical',
          storyPoints: 3,
          assignee: 'claude',
          labels: ['infrastructure', 'ui'],
          epicId: epic5Id,
          sprintId: sprint4Id,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: story8Id,
          key: 'SF-37',
          type: 'story',
          title: 'As a developer, I want cycle detection in architecture dependencies',
          description:
            "Created src/utils/graph.js with 6 functions: wouldCreateCycle() for pre-validation, findCycles() using Tarjan's algorithm, findMissingDependencies() and findOrphanedComponents() for reference validation, topologicalSort() for dependency ordering, and cleanupInvalidReferences() for repair. Added 15 unit tests in graph.test.js covering all functions.",
          status: 'Done',
          priority: 'high',
          storyPoints: 5,
          assignee: 'claude',
          labels: ['architecture', 'data', 'infrastructure'],
          epicId: epic5Id,
          sprintId: sprint4Id,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: task17Id,
          key: 'SF-38',
          type: 'task',
          title: 'Fix milestone cleanup on phase deletion',
          description:
            'Updated useProject.js deletePhase() to also remove milestones that reference the deleted phase via phaseId. Prevents orphaned milestone data. Single-line change: filter milestones where m.phaseId !== phaseId.',
          status: 'Done',
          priority: 'high',
          storyPoints: 1,
          assignee: 'claude',
          labels: ['bug', 'data'],
          epicId: epic5Id,
          sprintId: sprint4Id,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: task18Id,
          key: 'SF-39',
          type: 'task',
          title: 'Add epic/dependency cleanup on issue deletion',
          description:
            'Updated useProject.js deleteIssue() to: (1) clear epicId from child issues when deleting an epic, (2) remove deleted issue from dependencies arrays of other issues. Prevents orphaned references that could cause UI bugs.',
          status: 'Done',
          priority: 'high',
          storyPoints: 2,
          assignee: 'claude',
          labels: ['bug', 'data'],
          epicId: epic5Id,
          sprintId: sprint4Id,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: task19Id,
          key: 'SF-40',
          type: 'task',
          title: 'Fix Modal accessibility (ARIA, focus trap)',
          description:
            'Rewrote Modal.jsx with full accessibility: role="dialog", aria-modal="true", aria-labelledby with dynamic ID, focus trap (Tab cycles through focusable elements), Escape key closes, focus restoration on close, body scroll lock when open. Close button has aria-label.',
          status: 'Done',
          priority: 'medium',
          storyPoints: 3,
          assignee: 'claude',
          labels: ['accessibility', 'ui'],
          epicId: epic5Id,
          sprintId: sprint4Id,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: task20Id,
          key: 'SF-41',
          type: 'task',
          title: 'Setup Vitest testing infrastructure',
          description:
            'Added Vitest test framework: vitest.config.js with jsdom environment, src/test/setup.js with @testing-library/jest-dom and mocks for localStorage and crypto.randomUUID. Added 15 tests for graph utilities. All tests pass. Updated package.json with test/test:run/test:coverage scripts.',
          status: 'Done',
          priority: 'high',
          storyPoints: 3,
          assignee: 'claude',
          labels: ['testing', 'infrastructure'],
          epicId: epic5Id,
          sprintId: sprint4Id,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: task21Id,
          key: 'SF-42',
          type: 'task',
          title: 'Setup ESLint, Prettier, and TypeScript config',
          description:
            'Added code quality tooling: eslint.config.js with react-hooks and react-refresh plugins, .prettierrc with project style settings, tsconfig.json for incremental TypeScript adoption (allowJs, checkJs off, strict off). Added husky and lint-staged for pre-commit hooks. Updated package.json with lint/format/typecheck scripts.',
          status: 'Done',
          priority: 'medium',
          storyPoints: 2,
          assignee: 'claude',
          labels: ['tooling'],
          epicId: epic5Id,
          sprintId: sprint4Id,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: task22Id,
          key: 'SF-43',
          type: 'task',
          title: 'Refactor WorkflowCanvas into extracted hooks',
          description:
            'Decomposed 625-line WorkflowCanvas.jsx into main component (393 lines) plus 4 extracted hooks: useCanvasViewport.js (zoom/pan/centering, 130 lines), useCanvasDrag.js (node dragging with threshold, 95 lines), useCanvasPan.js (middle-mouse panning, 50 lines), useCanvasConnection.js (connection drawing, 80 lines). Also added LoadingState.jsx, ErrorState.jsx, and VirtualList.jsx UI components.',
          status: 'Done',
          priority: 'medium',
          storyPoints: 5,
          assignee: 'claude',
          labels: ['refactor', 'workflow', 'state'],
          epicId: epic5Id,
          sprintId: sprint4Id,
          createdAt: now,
          updatedAt: now,
        },
        // === Market-Ready Completion (v14) ===
        {
          id: task23Id,
          key: 'SF-44',
          type: 'task',
          title: 'Fix Suspense fallback in App.jsx',
          description:
            'Fixed <Suspense fallback={null}> in App.jsx line 23. Previously showed nothing during lazy load of ProjectPage route. Now uses LoadingState component with "Loading project..." message. Proper user feedback during code splitting.',
          status: 'Done',
          priority: 'high',
          storyPoints: 1,
          assignee: 'claude',
          labels: ['ui'],
          epicId: epic5Id,
          sprintId: sprint4Id,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: task24Id,
          key: 'SF-45',
          type: 'task',
          title: 'Integrate cycle detection in ComponentDetail.jsx',
          description:
            'Integrated wouldCreateCycle() from utils/graph.js into ComponentDetail.jsx DependencyList component. Available dependencies are now filtered to exclude those that would create circular dependencies. Uses useMemo for efficiency. Prevents users from adding dependencies that would create cycles in the architecture graph.',
          status: 'Done',
          priority: 'high',
          storyPoints: 2,
          assignee: 'claude',
          labels: ['architecture', 'data', 'ui'],
          epicId: epic5Id,
          sprintId: sprint4Id,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: task25Id,
          key: 'SF-46',
          type: 'task',
          title: 'Add useProject and ProjectsContext unit tests',
          description:
            'Created two test files: src/hooks/useProject.test.jsx (19 tests covering hook API, null project guards for all CRUD operations) and src/contexts/ProjectsContext.test.jsx (20 tests covering context provider, addProject, getProject, updateProject, deleteProject, importProject, localStorage persistence, reducer actions). Total: 54 passing tests across 3 test files. All tests pass with npm run test:run.',
          status: 'Done',
          priority: 'high',
          storyPoints: 3,
          assignee: 'claude',
          labels: ['testing', 'state'],
          epicId: epic5Id,
          sprintId: sprint4Id,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: story9Id,
          key: 'SF-47',
          type: 'story',
          title: 'Fix light mode theme — comprehensive component audit',
          description:
            "Light mode is visually broken despite theming infrastructure being in place. The issue: ~104 instances of hardcoded `text-white` across 48 files, plus `bg-slate-800`, `bg-slate-700`, and other dark-mode-specific Tailwind classes that override the CSS variable-based theme system.\n\n**Root cause:** Components use hardcoded Tailwind color classes instead of CSS variables. The `index.css` has ~80 light mode overrides but they don't cover all cases, and specificity issues prevent some overrides from working.\n\n**Fix approach:**\n1. Audit all components using dark-mode hardcoded classes\n2. Replace with CSS variable equivalents (e.g., `text-white` → `text-[var(--text-primary)]`)\n3. Or extend index.css overrides with higher specificity selectors\n4. Test each component in both themes\n\n**Files to audit:** Header, Sidebar, all Board components (12), Wiki components (8), Workflow components (7), Timeline components (4), Decisions components (3), Architecture components (7), UI components (16).",
          status: 'Done',
          priority: 'medium',
          storyPoints: 5,
          assignee: 'claude',
          labels: ['theming', 'ui', 'polish', 'accessibility'],
          epicId: epic5Id,
          sprintId: sprint4Id,
          createdAt: now,
          updatedAt: now,
        },
        // === EPIC: StoryFlow 2.0 Overhaul (SF-48) ===
        {
          id: epic6Id,
          key: 'SF-48',
          type: 'epic',
          title: 'StoryFlow 2.0 Overhaul',
          description:
            'Major architectural overhaul to transform StoryFlow from a 75% production-quality MVP into a tier-1 project planning tool. Includes: unified design token system, Zustand state migration, URL routing with deep linking, tab consolidation (7→5), activity feed, and comprehensive semantic token adoption across all components.',
          status: 'In Progress',
          priority: 'critical',
          storyPoints: 34,
          assignee: 'claude',
          labels: ['architecture', 'feature', 'refactor'],
          sprintId: sprint5Id,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: story10Id,
          key: 'SF-49',
          type: 'story',
          title: 'Design Token Consolidation',
          description:
            'Consolidated 3 competing token systems + 200 lines of light mode hacks into a single unified semantic token system. New structure: `--color-bg-*`, `--color-fg-*`, `--color-border-*`, `--color-accent-*`. Updated all 60+ components to use semantic tokens.',
          status: 'Done',
          priority: 'critical',
          storyPoints: 8,
          assignee: 'claude',
          labels: ['theming'],
          epicId: epic6Id,
          sprintId: sprint5Id,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: story11Id,
          key: 'SF-50',
          type: 'story',
          title: 'Zustand State Management Migration',
          description:
            'Migrated from React Context + useReducer to Zustand with sliced stores. Created projectsStore.js with immer middleware for immutable updates, persist middleware for localStorage. Added activityStore.js for audit logging. Fixed selector patterns to prevent infinite re-render loops.',
          status: 'Done',
          priority: 'critical',
          storyPoints: 8,
          assignee: 'claude',
          labels: ['state', 'architecture'],
          epicId: epic6Id,
          sprintId: sprint5Id,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: story12Id,
          key: 'SF-51',
          type: 'story',
          title: 'Tab Consolidation (7 → 5)',
          description:
            'Consolidated 7 tabs into 5 tabs with sub-navigation: Overview, Plan (Architecture + Workflow), Work (Board), Docs (Wiki + Decisions), Insights (Timeline). Updated ProjectSidebar with new tab structure and mobile "More" menu. Fixed tab key mapping for navigation.',
          status: 'Done',
          priority: 'high',
          storyPoints: 5,
          assignee: 'claude',
          labels: ['navigation', 'ui'],
          epicId: epic6Id,
          sprintId: sprint5Id,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: task26Id,
          key: 'SF-52',
          type: 'task',
          title: 'URL Routing & Deep Linking',
          description:
            'Added full URL structure with react-router-dom: /project/:id/overview, /project/:id/plan, /project/:id/plan/workflow, /project/:id/work, /project/:id/work/issue/:issueId, /project/:id/docs, /project/:id/docs/page/:pageId, /project/:id/docs/decisions, /project/:id/insights. Routes are shareable and bookmarkable.',
          status: 'Done',
          priority: 'high',
          storyPoints: 3,
          assignee: 'claude',
          labels: ['navigation', 'ui'],
          epicId: epic6Id,
          sprintId: sprint5Id,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: task27Id,
          key: 'SF-53',
          type: 'task',
          title: 'Activity Feed / Audit Log',
          description:
            'Created activityStore.js with activity logging for all mutations. Added ActivityPanel and ActivityItem components. Activity shows on Overview tab. Tracks issue, page, and decision CRUD with timestamps and change details.',
          status: 'Done',
          priority: 'medium',
          storyPoints: 3,
          assignee: 'claude',
          labels: ['feature', 'tooling'],
          epicId: epic6Id,
          sprintId: sprint5Id,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: task28Id,
          key: 'SF-54',
          type: 'task',
          title: 'Update all UI components to semantic tokens',
          description:
            'Batch updated 16 UI components (Button, Badge, Input, Modal, GlassCard, Select, TextArea, TagInput, Tabs, ProgressBar, Tooltip, ConfirmDialog, DropdownMenu, EmptyState, SearchBar, Avatar) to use semantic CSS variable tokens instead of hardcoded colors.',
          status: 'Done',
          priority: 'medium',
          storyPoints: 2,
          assignee: 'claude',
          labels: ['theming', 'ui'],
          epicId: epic6Id,
          sprintId: sprint5Id,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: task29Id,
          key: 'SF-55',
          type: 'task',
          title: 'Update board/layout/project components to semantic tokens',
          description:
            'Batch updated all board components (12), layout components (5), and project tab components (9) to use semantic CSS variable tokens. Components now properly support both dark and light themes.',
          status: 'Done',
          priority: 'medium',
          storyPoints: 2,
          assignee: 'claude',
          labels: ['theming'],
          epicId: epic6Id,
          sprintId: sprint5Id,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: task30Id,
          key: 'SF-56',
          type: 'task',
          title: 'Update wiki/workflow/timeline/decisions components',
          description:
            'Batch updated wiki components (8), workflow components (7), timeline components (4), and decisions components (3) to use semantic CSS variable tokens.',
          status: 'Done',
          priority: 'medium',
          storyPoints: 2,
          assignee: 'claude',
          labels: ['theming'],
          epicId: epic6Id,
          sprintId: sprint5Id,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: bug4Id,
          key: 'SF-57',
          type: 'bug',
          title: 'Fix infinite re-render loop in ActivityPanel',
          description:
            'Maximum update depth exceeded error caused by Zustand selector factory pattern creating new function references each render. Fixed by subscribing to parent `state.activities` object instead of using dynamic `selectProjectActivities(projectId)` selector. Also fixed similar issues in useProject.js and ProjectsContext.jsx.',
          status: 'Done',
          priority: 'critical',
          storyPoints: 2,
          assignee: 'claude',
          labels: ['bug', 'state', 'performance'],
          epicId: epic6Id,
          sprintId: sprint5Id,
          createdAt: now,
          updatedAt: now,
        },
        // === Fix sidebar icon spacing (SF-58) ===
        {
          id: bug5Id,
          key: 'SF-58',
          type: 'bug',
          title: 'Fix project sidebar tab icon spacing — icons visually merge',
          description:
            'The vertical tab icon strip in ProjectSidebar.jsx renders the 5 main tab icons (Overview/FileText, Plan/Network, Work/Columns3, Docs/BookOpen, Insights/BarChart3) with only 4px gap (Tailwind md:gap-1). This is too tight for 18px icons inside aspect-square buttons. The Overview (FileText) and Plan (Network) icons are so close they appear as a single compound icon — a document with a network diagram hanging beneath it. Fix: increase gap from gap-1 (4px) to gap-2 (8px) in the desktop sidebar container class on line 115 of ProjectSidebar.jsx. One-line change, purely visual spacing fix. No functional impact.',
          status: 'Done',
          priority: 'medium',
          storyPoints: 1,
          assignee: 'claude',
          labels: ['bug', 'ui'],
          epicId: epic6Id,
          sprintId: sprint5Id,
          createdAt: now,
          updatedAt: now,
        },
        // === Fix sidebar icon mismatches (SF-59) ===
        {
          id: bug6Id,
          key: 'SF-59',
          type: 'bug',
          title:
            'Fix project sidebar icon mismatches — wrong icons for Plan, Work, and Workflow tabs',
          description:
            'The 2.0 tab consolidation introduced semantically wrong icons in ProjectSidebar.jsx for 3 of the 5 main/sub tabs. (1) Work tab uses Columns3 (three vertical bars) which suggests a generic column layout, not a Kanban board — the BoardTab component itself uses LayoutGrid internally, creating inconsistency. (2) Plan tab uses Network which means "networking" not "planning" — and the Architecture sub-tab also uses a network-like icon (Box), causing visual confusion between parent and child. (3) Workflow sub-tab uses GitBranch which means "git branches" not "workflow execution". Fix: swap 3 icon imports in ProjectSidebar.jsx — Network→Compass for Plan, Columns3→LayoutGrid for Work, GitBranch→Workflow for Workflow sub-tab. Purely import + reference changes in MAIN_TABS array. Files affected: src/components/project/ProjectSidebar.jsx (~3 import swaps, ~3 icon references). User impact: sidebar icons now semantically match their tab content, improving navigation clarity.',
          status: 'Done',
          priority: 'medium',
          storyPoints: 1,
          assignee: 'claude',
          labels: ['bug', 'ui'],
          epicId: epic6Id,
          sprintId: sprint5Id,
          createdAt: now,
          updatedAt: now,
        },
        // === Move sub-tab navigation from sidebar to content area (SF-60) ===
        {
          id: feat1Id,
          key: 'SF-60',
          type: 'story',
          title: 'Move sub-tab navigation from sidebar icons to inline content-area tabs',
          description:
            'The ProjectSidebar renders sub-tab icons (Architecture/Workflow under Plan, Wiki/Decisions under Docs) below a divider line at the bottom of the icon strip. This looks unprofessional — tiny unlabeled icons dangling below a hairline, disconnected from the main navigation. Professional tools like Linear, Notion, and Figma keep the sidebar clean with only top-level icons and handle sub-navigation inside the content area. Fix: (1) Add a sub-navigation bar using the existing Tabs component in ProjectPage.jsx, rendered between the ProjectHeader and the route content when the active tab has sub-views (Plan or Docs). (2) Remove the entire sub-tab section from ProjectSidebar.jsx — the divider, the sub-tab icon buttons, the hasSubTabs logic, and the mobile More menu sub-tab entries. (3) Clean up unused imports (Box, FileEdit, Scale, isPathActive). Files affected: src/pages/ProjectPage.jsx (+25 lines for SUB_NAV config and Tabs rendering), src/components/project/ProjectSidebar.jsx (-60 lines removing sub-tab blocks). User impact: sidebar is now a clean 5-icon strip; sub-navigation appears as labeled pill tabs in the content header, matching industry-standard patterns.',
          status: 'Done',
          priority: 'high',
          storyPoints: 3,
          assignee: 'claude',
          labels: ['feature', 'ui', 'navigation'],
          epicId: epic6Id,
          sprintId: sprint5Id,
          createdAt: now,
          updatedAt: now,
        },
        // === Fix tab navigation unreliable after second click (SF-61) ===
        {
          id: bug7Id,
          key: 'SF-61',
          type: 'bug',
          title:
            'Fix tab navigation unreliable after second click — AnimatePresence + pushState race condition',
          description:
            'Two bugs cause tab navigation to go blank or get stuck on repeated clicks. (1) AnimatePresence mode="wait" with React Router causes exit animations to block new content from mounting. (2) All navigation uses manual pushState/popstate instead of React Router useNavigate(). Fix applied in two passes: First pass replaced all pushState/popstate with useNavigate() and removed mode="wait". Second pass removed AnimatePresence entirely — even without mode="wait", exit animations cause dual-render overlap/jank. Final solution: enter-only motion.div with opacity fade (0.12s), no exit animation, no AnimatePresence wrapper. Single file: src/pages/ProjectPage.jsx.',
          status: 'Done',
          priority: 'critical',
          storyPoints: 2,
          assignee: 'claude',
          labels: ['bug', 'navigation', 'ui'],
          epicId: epic6Id,
          sprintId: sprint5Id,
          createdAt: now,
          updatedAt: now,
        },

        // === Fix epic progress showing 0/0 for most epics (SF-62) ===
        {
          id: bug8Id,
          key: 'SF-62',
          type: 'bug',
          title: 'Fix epic progress showing 0/0 — seed data uses parentId instead of epicId',
          description:
            'Epic sidebar showed "0/0 done 0%" for epics 1-4 and 6 because seed data linked child issues via parentId (an architecture concept) instead of epicId (the board concept). EpicSidebar.jsx filters on i.epicId === epic.id. Only epic 5 (Quality & Testing) was correct. Fix: replaced all parentId: epicXId with epicId: epicXId for board issues across all 6 epics (51 total occurrences). Single file: src/data/seedProject.js.',
          status: 'Done',
          priority: 'high',
          storyPoints: 1,
          assignee: 'claude',
          labels: ['bug', 'board', 'data'],
          epicId: epic6Id,
          sprintId: sprint5Id,
          createdAt: now,
          updatedAt: now,
        },

        // === Fix mini dependency graph too small in architecture detail panel (SF-63) ===
        {
          id: bug9Id,
          key: 'SF-63',
          type: 'bug',
          title: 'Fix mini dependency graph too small and unreadable in architecture detail panel',
          description:
            'MiniDepGraph in ComponentDetail.jsx rendered with 100x28px nodes and 9px font in a 360px SVG viewBox — illegibly small in the 320px detail panel. Fix: enlarged nodes to 120x32, fonts to 11-12px, viewBox to 420px, increased gapY to 40, stroke widths to 1-2px, edge opacity to 0.65. Both Graph and Tree views now show readable dependency previews.',
          status: 'Done',
          priority: 'high',
          storyPoints: 2,
          assignee: 'claude',
          labels: ['bug', 'architecture', 'ui'],
          epicId: epic6Id,
          sprintId: sprint5Id,
          createdAt: now,
          updatedAt: now,
        },

        // === Fix filter dropdown unreadable due to glass blur (SF-64) ===
        {
          id: bug10Id,
          key: 'SF-64',
          type: 'bug',
          title: 'Fix board filter dropdown text unreadable — glass-card blur washes out text',
          description:
            'MultiSelectDropdown used glass-card class (backdrop-filter:blur(24px) + 5% opacity bg) making text invisible. Root cause: kanban columns painted on top of dropdown due to DOM order. Fix: (1) replaced glass-card with opaque #0f172a bg + isolation:isolate, (2) added relative z-40 to FilterBar container so dropdown stacks above columns, (3) upgraded text to --color-fg-default for contrast, (4) upgraded checkbox border to --color-fg-muted.',
          status: 'Done',
          priority: 'high',
          storyPoints: 1,
          assignee: 'claude',
          labels: ['bug', 'board', 'ui'],
          epicId: epic6Id,
          sprintId: sprint5Id,
          createdAt: now,
          updatedAt: now,
        },

        // === Fix sub-workflow overlay centering & blank area (SF-65) ===
        {
          id: bug11Id,
          key: 'SF-65',
          type: 'bug',
          title: 'Fix sub-workflow overlay — nodes off-center with large blank area on left',
          description:
            'Sub-workflow overlay had nodes clustered to the right with a huge blank area on the left. Three root causes: (1) centerOnNodes() fired before overlay scale-in animation finished so container had wrong dimensions — fixed with 280ms delay + dimension guard. (2) No auto-fit scaling — small sub-workflows (5 nodes, ~930px content) stayed at scale 1.0 in a ~2100px overlay — added FIT_MAX=1.5 so content scales up. (3) Static canvasId="sub-workflow" meant re-opening different sub-workflows kept stale viewport — switched to dynamic ID based on parentNode.id + viewStack.',
          status: 'Done',
          priority: 'high',
          storyPoints: 3,
          assignee: 'claude',
          labels: ['bug', 'workflow', 'ui'],
          epicId: epic6Id,
          sprintId: sprint5Id,
          createdAt: now,
          updatedAt: now,
        },

        // === Fix dot grid not filling entire canvas area (SF-66) ===
        {
          id: task31Id,
          key: 'SF-66',
          type: 'task',
          title: 'Move workflow canvas dot grid from SVG pattern to CSS radial-gradient',
          description:
            'The dot grid was an SVG <pattern> inside the transform wrapper div. When the wrapper translated right/down to center content, the left/top area of the container had no grid — just empty dark space. Fix: moved to CSS radial-gradient background on the container div itself. Grid offset and size computed from viewport.offsetX/offsetY/scale so dots track correctly with pan/zoom. Fills 100% of visible area regardless of transform state. Removed old SVG pattern defs and rect. Also rewrote handleCanvasClick to use data-workflow-node closest check instead of tagName matching.',
          status: 'Done',
          priority: 'medium',
          storyPoints: 2,
          assignee: 'claude',
          labels: ['workflow', 'ui', 'refactor'],
          epicId: epic6Id,
          sprintId: sprint5Id,
          createdAt: now,
          updatedAt: now,
        },

        // === Redesign architecture ComponentDetail panel (SF-67) ===
        {
          id: task32Id,
          key: 'SF-67',
          type: 'task',
          title: 'Redesign architecture ComponentDetail panel for density',
          description:
            'ComponentDetail panel looked cramped with oversized elements in a narrow w-80 panel. Redesigned: card padding to !p-3, collapsed header to single inline row (h-6 w-6 icon, xs type badge, text-sm truncated name), always grid-cols-2 with gap-3, description reduced to 2 rows text-xs, all dependency/used-by badges to size xs with gap-1, section labels to text-xs. MiniDepGraph rewritten with dynamic column positioning (leftX/centerX/rightX computed based on which sides have nodes) to prevent right-side clipping.',
          status: 'Done',
          priority: 'medium',
          storyPoints: 2,
          assignee: 'claude',
          labels: ['architecture', 'ui', 'polish'],
          epicId: epic6Id,
          sprintId: sprint5Id,
          createdAt: now,
          updatedAt: now,
        },

        // === Badge uniformity audit across all views (SF-68) ===
        {
          id: task33Id,
          key: 'SF-68',
          type: 'task',
          title: 'Standardize Badge sizing across entire app — xs/sm two-tier system',
          description:
            'Badges were inconsistently sized across views (some sm, some md, some using old CSS variable spacing). Added xs size tier (px-1.5 py-px text-[10px]). Tightened sm (px-2 py-0.5 text-[11px]) and md (px-2.5 py-1 text-xs). Applied uniform rules: xs for dense/inline contexts (backlog rows, kanban cards, filter chips, tree nodes, decision tags, wiki labels, tag inputs, component detail), sm for standard card contexts (dashboard, column headers, epic sidebar, phase cards, decision status, node modal/properties, project header). Eliminated all md usages. Updated 13+ component files. Also tightened TagInput container from CSS variable spacing to direct Tailwind (px-2 py-1.5 gap-1.5).',
          status: 'Done',
          priority: 'medium',
          storyPoints: 3,
          assignee: 'claude',
          labels: ['ui', 'polish', 'refactor'],
          epicId: epic6Id,
          sprintId: sprint5Id,
          createdAt: now,
          updatedAt: now,
        },

        // ============================================================
        // TO DO — Next session tasks
        // ============================================================

        // === Test sub-workflow overlay end-to-end (SF-69) ===
        {
          id: task34Id,
          key: 'SF-69',
          type: 'task',
          title:
            'Test sub-workflow overlay — verify auto-fit zoom, dot grid coverage, and pan/zoom',
          description:
            'Open each sub-workflow in the seed project. Verify: (1) nodes fill the overlay space (auto-fit up to 1.5x), (2) dot grid covers the entire background with no blank areas, (3) pan and zoom work correctly, (4) re-opening different sub-workflows re-centers properly. Test on both small (5-node) and larger sub-workflows.',
          status: 'In Progress',
          priority: 'high',
          storyPoints: 2,
          assignee: 'claude',
          labels: ['testing', 'workflow'],
          epicId: epic6Id,
          sprintId: sprint5Id,
          createdAt: now,
          updatedAt: now,
        },

        // === Test main workflow canvas grid + click handler (SF-70) ===
        {
          id: task35Id,
          key: 'SF-70',
          type: 'task',
          title: 'Test main workflow canvas — CSS grid background, click-to-deselect, pan/zoom',
          description:
            'The main workflow canvas was changed: (1) dot grid moved from SVG pattern to CSS radial-gradient on container, (2) click handler rewritten to use data-workflow-node closest check instead of tagName. Verify: grid fills entire canvas during pan/zoom, clicking empty space deselects nodes, clicking nodes does not deselect, connections still render correctly at all zoom levels.',
          status: 'To Do',
          priority: 'high',
          storyPoints: 2,
          assignee: 'claude',
          labels: ['testing', 'workflow'],
          epicId: epic6Id,
          sprintId: sprint5Id,
          createdAt: now,
          updatedAt: now,
        },

        // === Visual pass on badge sizes across all views (SF-71) ===
        {
          id: task36Id,
          key: 'SF-71',
          type: 'task',
          title: 'Visual audit — verify badge sizes look correct across all 7 tabs',
          description:
            'Quick visual pass through every tab to confirm the xs/sm badge sizing looks uniform and not too small: Board (kanban cards + backlog rows + filter chips), Architecture (tree + detail panel), Decisions (card tags + status), Timeline (phase status), Wiki (page labels + status), Dashboard (project cards). Also verify TagInput padding in IssueDetail and DecisionDetail forms.',
          status: 'To Do',
          priority: 'high',
          storyPoints: 1,
          assignee: 'claude',
          labels: ['testing', 'ui'],
          epicId: epic6Id,
          sprintId: sprint5Id,
          createdAt: now,
          updatedAt: now,
        },

        // === Commit all uncommitted changes (SF-72) ===
        {
          id: task37Id,
          key: 'SF-72',
          type: 'task',
          title: 'Commit all changes — 79+ modified files across multiple sessions',
          description:
            'Large batch of uncommitted work since last commit (1bf243f). 79 modified files + 100+ new files. Either break into logical commits by feature area or do one well-documented commit. Includes: sub-workflow overlay fixes, canvas grid refactor, ComponentDetail redesign, badge uniformity, skills system, test files, linting config, and seed data updates through v31.',
          status: 'To Do',
          priority: 'high',
          storyPoints: 2,
          assignee: 'claude',
          labels: ['infrastructure', 'process'],
          epicId: epic6Id,
          sprintId: sprint5Id,
          createdAt: now,
          updatedAt: now,
        },

        // === Run test suite and fix failures (SF-73) ===
        {
          id: task38Id,
          key: 'SF-73',
          type: 'task',
          title: 'Run vitest suite — fix any failures from recent canvas and badge changes',
          description:
            '30+ test files exist but have not been run since the canvas grid refactor (SVG to CSS), click handler rewrite (data-workflow-node), and badge size changes (xs/sm tiers). Run vitest, review failures, fix broken tests. Particularly check Badge.test.jsx for size tier changes and any workflow canvas tests.',
          status: 'To Do',
          priority: 'medium',
          storyPoints: 3,
          assignee: 'claude',
          labels: ['testing', 'infrastructure'],
          epicId: epic6Id,
          sprintId: sprint5Id,
          createdAt: now,
          updatedAt: now,
        },

        // === Add Lessons Learned wiki page (SF-74) ===
        {
          id: task39Id,
          key: 'SF-74',
          type: 'task',
          title: 'Add categorized Lessons Learned wiki page to tracker',
          description:
            'Created a structured wiki page under Getting Started with 6 categories: CSS & Styling (4 entries), Architecture & Components (5 entries), Data Model (5 entries), Security (2 entries), Process & Workflow (4 entries), Performance (2 entries). Each lesson is in a table with Lesson + Context columns. Replaces the flat bullet list in MEMORY.md as the canonical source visible in the StoryFlow UI. Added as page14Id, child of page1Id (Getting Started).',
          status: 'Done',
          priority: 'medium',
          storyPoints: 2,
          assignee: 'claude',
          labels: ['docs', 'process'],
          epicId: epic6Id,
          sprintId: sprint5Id,
          createdAt: now,
          updatedAt: now,
        },

        // === Backlog view — status-grouped sections (SF-75) ===
        {
          id: task40Id,
          key: 'SF-75',
          type: 'task',
          title: 'Backlog view — organize into status-grouped glass card sections',
          description:
            'Redesigned the BacklogView from a flat list into collapsible glass-card sections grouped by status (To Do, In Progress, Done). Each section has a header with status dot, title, issue count badge, and collapse chevron. Mirrors the BoardColumn visual language in a vertical stacked layout. Also upgraded EpicGroupedList with the same card treatment. Added STATUS_ACCENT and STATUS_NAMES constants. Handles unknown statuses with an "Other" fallback section.',
          status: 'Done',
          priority: 'medium',
          storyPoints: 3,
          assignee: 'claude',
          labels: ['ui', 'feature'],
          epicId: epic6Id,
          sprintId: sprint5Id,
          createdAt: now,
          updatedAt: now,
        },

        // === Verify backlog sections (SF-76) ===
        {
          id: task41Id,
          key: 'SF-76',
          type: 'task',
          title: 'Verify backlog sections — collapse/expand, sort, epic grouping, create',
          description:
            'Test the new backlog status-grouped sections end-to-end: (1) Three sections visible with correct status dots and counts, (2) Collapse/expand each section, (3) Sort within sections works, (4) Group by Epic toggle shows epic cards with same card treatment, (5) Quick create adds to To Do section, (6) Issue click opens detail panel, (7) Delete from dropdown updates counts.',
          status: 'To Do',
          priority: 'medium',
          storyPoints: 1,
          assignee: null,
          labels: ['testing', 'ui'],
          epicId: epic6Id,
          sprintId: sprint5Id,
          createdAt: now,
          updatedAt: now,
        },

        // === Fix canvas content bleeding under sidebar (SF-77) ===
        {
          id: bug12Id,
          key: 'SF-77',
          type: 'bug',
          title: 'Fix workflow canvas content bleeding under sidebar',
          description:
            'Sub-workflow overlay header/toolbar were visually bleeding behind the sidebar. Root cause: SubWorkflowOverlay used createPortal to document.body with z-40, but sidebar had z-index 200 (--z-sticky). Since #root has no z-index, the sidebar at z-200 painted above the z-40 overlay backdrop but the overlay panel content still showed through. Fix: bumped overlay z-index to var(--z-drawer, 400) so it properly layers above the sidebar. Also changed <main> overflow-auto to overflow-hidden and added overflow-auto to DashboardPage root as defense-in-depth.',
          status: 'Done',
          priority: 'high',
          storyPoints: 1,
          assignee: 'claude',
          labels: ['bug', 'ui', 'layout'],
          epicId: epic6Id,
          sprintId: sprint5Id,
          createdAt: now,
          updatedAt: now,
        },
        // === Fix invisible dot grid + slim node color bars (SF-78) ===
        {
          id: bug13Id,
          key: 'SF-78',
          type: 'bug',
          title: 'Fix invisible dot grid + remove gaudy node color bars',
          description:
            'Workflow canvas dot grid was invisible because radial-gradient used var(--th-border) — a CSS variable that was NEVER DEFINED in any stylesheet. Fix: replaced with var(--color-border-emphasis) (rgba(255,255,255,0.12)). Also removed the node top color bar entirely — it was a gaudy racing stripe adding visual noise. Type color is already communicated through the icon background and type label badge. Verified in both main canvas and sub-workflow overlay.',
          status: 'Done',
          priority: 'medium',
          storyPoints: 1,
          assignee: 'claude',
          labels: ['bug', 'ui', 'workflow'],
          epicId: epic6Id,
          sprintId: sprint5Id,
          createdAt: now,
          updatedAt: now,
        },
        // === Fix workflow execution animation — read-only state mutation (SF-79) ===
        {
          id: bug14Id,
          key: 'SF-79',
          type: 'bug',
          title: 'Fix workflow execution broken by read-only state mutation',
          description:
            'BFS workflow execution was crashing with "Cannot assign to read only property status" because onNodeStart/onNodeComplete/onNodeError callbacks directly mutated objects that had been committed to React state via saveNodes(). Once in the reducer, objects are frozen. Fix: create a separate mutable working copy via resetNodes.map(n => ({...n})) that is never passed to React state directly — only spread copies are saved.',
          status: 'Done',
          priority: 'critical',
          storyPoints: 1,
          assignee: 'claude',
          labels: ['bug', 'workflow', 'execution'],
          epicId: epic6Id,
          sprintId: sprint5Id,
          createdAt: now,
          updatedAt: now,
        },
        // === Replace Architecture stats bar with proper filter bar (SF-80) ===
        {
          id: task42Id,
          key: 'SF-80',
          type: 'task',
          title: 'Replace Architecture stats bar with proper filter bar',
          description:
            "The ArchitectureStats component showed 4 vanity metric cards (Components, Types Used, Dependencies, Orphans) that were secretly clickable filters with zero discoverability. Replaced with ArchitectureFilterBar — an explicit filter bar matching Board tab's FilterBar pattern: Filter icon, Type multi-select dropdown (with colored icons, only types present in data), Connections single-select dropdown (Has dependencies / Has dependents / Orphans), active filter badges with remove buttons, and Clear all. Deleted ArchitectureStats.jsx and its test.",
          status: 'Done',
          priority: 'medium',
          storyPoints: 2,
          assignee: 'claude',
          labels: ['ux', 'architecture', 'refactor'],
          epicId: epic6Id,
          sprintId: sprint5Id,
          createdAt: now,
          updatedAt: now,
        },
        // === Redesign light mode — "Warm Linen" color scheme (SF-81) ===
        {
          id: task43Id,
          key: 'SF-81',
          type: 'task',
          title: 'Redesign light mode with "Warm Linen" color scheme',
          description:
            'Complete light mode redesign replacing cold Slate blue-grays with warm Stone/Bone palette. Base: #F9F7F4 (bone), subtle: #F3F0EB (eggshell), muted: #EBE7E0 (linen), emphasis: #DDD8CF (warm stone). Text shifted from cold #1e293b to warm #2C2825 charcoal scale. Glass effects warm-tinted. Gradient orbs shifted to amber/rose/gold. Shadows warm-tinted. Hardcoded bg-[#0f172a] in dropdown panels replaced with theme-aware var(--color-bg-inverse). Files: tokens.css (.theme-light block), index.css (glass overrides), ArchitectureFilterBar.jsx, FilterBar.jsx.',
          status: 'Done',
          priority: 'medium',
          storyPoints: 3,
          assignee: 'claude',
          labels: ['ux', 'theme', 'design'],
          epicId: epic6Id,
          sprintId: sprint5Id,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: task44Id,
          number: 82,
          type: 'bug',
          title:
            'SF-82: Fix light mode visual issues — undefined --th-* vars, hardcoded colors, poor contrast',
          description:
            'The Warm Linen token redesign (SF-81) only updated tokens.css and index.css, but dozens of components use --th-* CSS variables that are NEVER DEFINED in any stylesheet. These silently fall back to dark-mode hardcoded values (#1e293b, rgba(255,255,255,0.06)) which look terrible in light mode. Also: Dashboard uses hardcoded text-white/text-slate-*, Badge component uses -300 color variants designed for dark backgrounds, DependencyGraph nodes use var(--th-panel) for backgroundColor. Fix: define all --th-* variables in both theme blocks mapping to semantic tokens, replace all hardcoded Slate/white colors with theme-aware equivalents.',
          status: 'Done',
          priority: 'high',
          storyPoints: 5,
          assignee: 'claude',
          labels: ['bug', 'ux', 'theme'],
          epicId: epic6Id,
          sprintId: sprint5Id,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: task45Id,
          number: 83,
          type: 'task',
          title: 'SF-83: Compact Backlog header — merge QuickCreateBar into toolbar row',
          description:
            'The Backlog view had two separate glass panels stacked vertically: a QuickCreateBar wrapper and a sort/group toolbar. This wasted significant vertical space for just a create input. Fix: remove the QuickCreateBar wrapper panel and place the create bar inline within the toolbar row between sort buttons and the Group by Epic toggle.',
          status: 'Done',
          priority: 'medium',
          storyPoints: 1,
          assignee: 'claude',
          labels: ['ux', 'board'],
          epicId: epic6Id,
          sprintId: sprint5Id,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: generateId(),
          key: 'SF-84',
          type: 'task',
          title: 'SF-84: Archive unused modules to _archived/',
          description:
            'Identified 33 unused source files across ai, comments, customfields, presence, 11 UI components, 2 hooks, 2 utils, stores barrel, and skills directory. Moved all to _archived/ to declutter the repo. Build output is identical (same chunk hashes). Transitively unused files (Switch, DatePicker only imported by unused customfields) also archived.',
          status: 'Done',
          priority: 'low',
          storyPoints: 1,
          assignee: 'claude',
          labels: ['cleanup', 'dx'],
          epicId: epic6Id,
          sprintId: sprint5Id,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: generateId(),
          type: 'task',
          title: 'SF-85: Convert TRACKER_WORKFLOW.md to Claude skill',
          description:
            'Moved TRACKER_WORKFLOW.md from repo root into skills/storyflow-tracker/SKILL.md as a proper Claude Code skill. Added YAML frontmatter (name, description), structured with When to use / Instructions / Examples sections following the established skill format. Updated CLAUDE.md skills section to reflect only active skills (other 7 skills remain in _archived/). Updated MEMORY.md reference. Removed old file via git rm.',
          status: 'Done',
          priority: 'low',
          storyPoints: 1,
          assignee: 'claude',
          labels: ['dx', 'skills'],
          epicId: epic6Id,
          sprintId: sprint5Id,
          createdAt: now,
          updatedAt: now,
        },
        // === Production Hardening (SF-86) ===
        {
          id: generateId(),
          type: 'story',
          title: 'SF-86: Production hardening — CI gate, repo hygiene, pre-commit hooks',
          description:
            'Full production hardening workflow: (1) Fix all quality gate failures — Prettier format ~40 files, ESLint 12 errors + 120 warnings, TypeScript parse error in MarkdownRenderer.test.jsx line 126, 15 failing test files (46 tests). (2) Add unified npm run ci script chaining format:check → lint → typecheck → test:run → build. (3) Create .github/workflows/ci.yml — push+PR trigger, Node 20, npm cache. (4) Add SECURITY.md and CONTRIBUTING.md. (5) Fix broken Husky pre-commit hook — .husky/pre-commit missing, lint-staged never runs. (6) Release candidate simulation from clean state. License: All Rights Reserved (no MIT), COPYRIGHT.txt stays as-is.',
          status: 'Done',
          priority: 'high',
          storyPoints: 8,
          assignee: 'claude',
          labels: ['dx', 'ci', 'production'],
          epicId: epic6Id,
          sprintId: sprint5Id,
          createdAt: now,
          updatedAt: now,
        },
        // === Follow-up: Lint Warnings Cleanup (SF-87) ===
        {
          id: generateId(),
          type: 'task',
          title: 'SF-87: Clean up ESLint warnings to zero',
          description:
            'Cleaned up all 127 ESLint warnings to reach a zero-warning baseline. Removed unused React imports (52 files), unused variables/imports in test files, added useMemo wrapping for react-hooks/exhaustive-deps in WorkflowTab and ActivityPanel, added eslint-disable comments for intentional patterns (react-refresh/only-export-components in contexts, PageEditor useEffect sync). ESLint now reports 0 problems.',
          status: 'Done',
          priority: 'low',
          storyPoints: 3,
          assignee: 'claude',
          labels: ['dx', 'cleanup'],
          epicId: epic6Id,
          sprintId: sprint6Id,
          createdAt: now,
          updatedAt: now,
        },
        // === Follow-up: npm audit vulnerabilities (SF-88) ===
        {
          id: generateId(),
          type: 'task',
          title: 'SF-88: Investigate 6 moderate npm audit vulnerabilities',
          description:
            'All 6 moderate vulnerabilities are in devDependencies only: esbuild (via vitest/vite-node) — development server request vulnerability (GHSA-67mh-4wv8-2f99). Does NOT affect production builds. Accepted risk. Will resolve naturally when vitest upgrades.',
          status: 'Done',
          priority: 'medium',
          storyPoints: 2,
          assignee: 'claude',
          labels: ['security', 'dx'],
          epicId: epic6Id,
          sprintId: sprint6Id,
          createdAt: now,
          updatedAt: now,
        },

        // =====================================================================
        // GO-LIVE AUDIT (v51) — SF-89 through SF-100
        // =====================================================================

        // === Epic: Go-Live Audit (SF-89) ===
        {
          id: epic7Id,
          type: 'epic',
          title: 'SF-89: Go-Live Audit — Security, Accessibility, Persistence',
          description:
            'Comprehensive go-live audit covering security (sanitizeColor gaps), accessibility (ARIA, keyboard), data safety (NaN guards, epic self-ref), form validation, and IndexedDB migration via Dexie.js. All findings tracked as sub-issues.',
          status: 'In Progress',
          priority: 'high',
          storyPoints: 21,
          assignee: 'claude',
          labels: ['audit', 'go-live'],
          epicId: null,
          sprintId: sprint6Id,
          createdAt: now,
          updatedAt: now,
        },

        // === H1: Unsanitized color injection (SF-90) ===
        {
          id: audit1Id,
          type: 'bug',
          title: 'SF-90: sanitizeColor() not applied in 8+ component files',
          description:
            'sanitizeColor() exists in src/utils/sanitize.js but is NOT used in WorkflowNode.jsx (3 sites), DependencyGraph.jsx, ComponentDetail.jsx, ArchitectureFilterBar.jsx, BacklogView.jsx:135, FilterBar.jsx (lines 215, 421), NodeDetailModal.jsx, NodePalette.jsx, SubWorkflowOverlay.jsx. User-editable color fields could inject CSS expressions. Fix: wrap every user-supplied color in sanitizeColor() before style={} rendering.',
          status: 'Done',
          priority: 'high',
          storyPoints: 3,
          assignee: 'claude',
          labels: ['security', 'audit'],
          epicId: epic7Id,
          sprintId: sprint6Id,
          createdAt: now,
          updatedAt: now,
        },

        // === H2: Accessibility gaps (SF-91) ===
        {
          id: audit2Id,
          type: 'story',
          title: 'SF-91: Add ARIA attributes to interactive elements',
          description:
            'Workflow nodes lack aria-label, architecture tree nodes missing aria-expanded, kanban columns missing role=listbox. Add tabIndex, role, aria-label, aria-expanded where needed. Defer full keyboard workflow canvas to post-launch.',
          status: 'Done',
          priority: 'high',
          storyPoints: 3,
          assignee: 'claude',
          labels: ['accessibility', 'audit'],
          epicId: epic7Id,
          sprintId: sprint6Id,
          createdAt: now,
          updatedAt: now,
        },

        // === H3: IndexedDB migration (SF-92) ===
        {
          id: audit3Id,
          type: 'story',
          title: 'SF-92: Migrate persistence from localStorage to IndexedDB (Dexie.js)',
          description:
            'localStorage is not crash-safe, caps at 5MB, and writes synchronously on every mutation. Migrated to Dexie.js (~33KB): (1) Created src/db/storyflowDb.js key-value schema, (2) Created src/db/indexedDbStorage.js Zustand persist adapter, (3) Created src/db/migrateFromLocalStorage.js one-time migration, (4) Wired all 3 stores (projects, activity, ui) to IndexedDB via createJSONStorage, (5) Added auto-migration in App.jsx on mount, (6) Fallback to localStorage if IndexedDB unavailable.',
          status: 'Done',
          priority: 'high',
          storyPoints: 8,
          assignee: 'claude',
          labels: ['persistence', 'audit', 'architecture'],
          epicId: epic7Id,
          sprintId: sprint6Id,
          createdAt: now,
          updatedAt: now,
        },

        // === M4: WorkflowCanvas NaN coordinate risk (SF-93) ===
        {
          id: audit4Id,
          type: 'bug',
          title: 'SF-93: WorkflowCanvas + DependencyGraph NaN coordinate guard',
          description:
            'If a node has undefined x/y coordinates, the canvas renders NaN in transform, causing invisible nodes. Added Number.isFinite() guard in both WorkflowCanvas (safeNodes useMemo) and DependencyGraph (positionedComponents). Defaults to { x: 0, y: 0 } when coordinates are missing.',
          status: 'Done',
          priority: 'medium',
          storyPoints: 1,
          assignee: 'claude',
          labels: ['bug', 'audit'],
          epicId: epic7Id,
          sprintId: sprint6Id,
          createdAt: now,
          updatedAt: now,
        },

        // === M5: PageEditor title validation (SF-94) ===
        {
          id: audit5Id,
          type: 'bug',
          title: 'SF-94: PageEditor allows saving with empty title',
          description:
            'PageEditor handleSave() does not validate that title is non-empty before calling onSave(). QuickCreateBar and DecisionForm already validate. Added: if (!title.trim()) return before onSave call.',
          status: 'Done',
          priority: 'medium',
          storyPoints: 1,
          assignee: 'claude',
          labels: ['validation', 'audit'],
          epicId: epic7Id,
          sprintId: sprint6Id,
          createdAt: now,
          updatedAt: now,
        },

        // === M6: Large list virtualization (SF-95) ===
        {
          id: audit6Id,
          type: 'story',
          title: 'SF-95: Add virtualization for large lists (react-window)',
          description:
            'Board kanban columns, backlog list, and wiki page tree render all items in DOM. With 100+ issues this causes jank. Deferred to post-launch. If needed, add react-window for the backlog list only (highest item count).',
          status: 'To Do',
          priority: 'low',
          storyPoints: 3,
          assignee: 'claude',
          labels: ['performance', 'audit', 'post-launch'],
          epicId: epic7Id,
          sprintId: sprint6Id,
          createdAt: now,
          updatedAt: now,
        },

        // === L1: Toast ID collision (SF-96) ===
        {
          id: audit7Id,
          type: 'bug',
          title: 'SF-96: Toast ID collision — use crypto.randomUUID()',
          description:
            'uiStore.addToast() used Date.now() + Math.random() for IDs. Replaced with crypto.randomUUID() to match the createToast() helper pattern. Zero collision risk.',
          status: 'Done',
          priority: 'low',
          storyPoints: 1,
          assignee: 'claude',
          labels: ['bug', 'audit'],
          epicId: epic7Id,
          sprintId: sprint6Id,
          createdAt: now,
          updatedAt: now,
        },

        // === L2: Firefox CSS zoom (SF-97) ===
        {
          id: audit8Id,
          type: 'task',
          title: 'SF-97: Test workflow canvas CSS zoom on Firefox',
          description:
            'Workflow canvas uses CSS zoom which Firefox handles differently. Test on Firefox and add -moz-transform: scale() fallback if broken.',
          status: 'To Do',
          priority: 'low',
          storyPoints: 1,
          assignee: 'claude',
          labels: ['compatibility', 'audit'],
          epicId: epic7Id,
          sprintId: sprint6Id,
          createdAt: now,
          updatedAt: now,
        },

        // === L3: Memory leak — event listeners (SF-98) ===
        {
          id: audit9Id,
          type: 'bug',
          title: 'SF-98: useCanvasViewport pointerup listener cleanup',
          description:
            'Verified: useCanvasViewport only uses wheel event listener with proper cleanup in useEffect return. No pointerup/pointermove listeners exist — the original concern was about an older implementation. Already clean.',
          status: 'Done',
          priority: 'low',
          storyPoints: 1,
          assignee: 'claude',
          labels: ['bug', 'audit'],
          epicId: epic7Id,
          sprintId: sprint6Id,
          createdAt: now,
          updatedAt: now,
        },

        // === L4: Hardcoded NODE_WIDTH (SF-99) ===
        {
          id: audit10Id,
          type: 'task',
          title: 'SF-99: Extract NODE_WIDTH to shared canvasConstants.js',
          description:
            'Created src/utils/canvasConstants.js with NODE_WIDTH=180 and NODE_HEIGHT_ESTIMATE=80. Updated 6 files: WorkflowCanvas, WorkflowConnection, DependencyGraph, DependencyEdge, archLayout, useCanvasViewport — all now import from the shared constant.',
          status: 'Done',
          priority: 'low',
          storyPoints: 1,
          assignee: 'claude',
          labels: ['refactor', 'audit'],
          epicId: epic7Id,
          sprintId: sprint6Id,
          createdAt: now,
          updatedAt: now,
        },

        // === Graph pattern consistency: DependencyGraph → WorkflowCanvas grid (SF-101) ===
        {
          id: audit12Id,
          type: 'task',
          title: 'SF-101: Apply WorkflowCanvas CSS grid pattern to DependencyGraph',
          description:
            'DependencyGraph used a static SVG <pattern> for the dot grid while WorkflowCanvas used a CSS radial-gradient background that moves with pan/zoom. Updated DependencyGraph to use the same CSS backgroundImage grid pattern, removed the old SVG pattern/rect elements, and cleaned up redundant || 0 fallbacks since the NaN guard already ensures valid coordinates.',
          status: 'Done',
          priority: 'medium',
          storyPoints: 1,
          assignee: 'claude',
          labels: ['ui', 'audit', 'architecture'],
          epicId: epic7Id,
          sprintId: sprint6Id,
          createdAt: now,
          updatedAt: now,
        },
        // === M2: Export size warning (SF-100) ===
        {
          id: audit11Id,
          type: 'task',
          title: 'SF-100: Show export size warning for large projects',
          description:
            'Projects with many issues (100+) create large JSON exports. Show estimated export size in the Export button. Consider optional gzip for large projects.',
          status: 'To Do',
          priority: 'low',
          storyPoints: 1,
          assignee: 'claude',
          labels: ['dx', 'audit'],
          epicId: epic7Id,
          sprintId: sprint6Id,
          createdAt: now,
          updatedAt: now,
        },

        // =====================================================================
        // FULL QUALITY PASS (v54) — SF-102 through SF-114
        // =====================================================================
        {
          id: epic8Id,
          type: 'epic',
          title: 'SF-102: Full Quality Pass — User Readiness',
          description:
            'Comprehensive quality pass to make StoryFlow production-ready for end users. Covers P0 blockers (version history, sprints, cross-tab sync), P1 first-experience improvements (onboarding, confirmations, empty states), P2 quality upgrades (validation, sanitization, virtualization), and elevation of all Good-rated areas to Excellent.',
          status: 'Done',
          priority: 'critical',
          storyPoints: 0,
          assignee: 'claude',
          labels: ['quality', 'ux'],
          epicId: null,
          sprintId: sprint6Id,
          createdAt: now,
          updatedAt: now,
        },
        // === P0: Wiki version history (SF-103) ===
        {
          id: qp1Id,
          type: 'story',
          title: 'SF-103: Implement wiki page version history backend',
          description:
            'VersionHistory.jsx shows restore UI but store never saves snapshots. Fix: auto-create version entries on manual save in updatePage(), cap at 50 versions per page (FIFO), wire onRestore in WikiTab.',
          status: 'Done',
          priority: 'critical',
          storyPoints: 3,
          assignee: 'claude',
          labels: ['p0', 'wiki', 'data'],
          epicId: epic8Id,
          sprintId: sprint6Id,
          createdAt: now,
          updatedAt: now,
        },
        // === P0: Sprint management (SF-104) ===
        {
          id: qp2Id,
          type: 'story',
          title: 'SF-104: Implement sprint CRUD and board integration',
          description:
            'board.sprints initialized but never used. Implement: addSprint/updateSprint/closeSprint/deleteSprint actions, SprintModal for create/edit, sprint selector in SprintBoard, assign-to-sprint in backlog, wire BurndownChart/VelocityChart to real sprint data.',
          status: 'Done',
          priority: 'critical',
          storyPoints: 8,
          assignee: 'claude',
          labels: ['p0', 'board', 'feature'],
          epicId: epic8Id,
          sprintId: sprint6Id,
          createdAt: now,
          updatedAt: now,
        },
        // === P0: Cross-tab sync (SF-105) ===
        {
          id: qp3Id,
          type: 'story',
          title: 'SF-105: Add cross-tab sync via BroadcastChannel',
          description:
            'Two browser tabs editing same project causes silent overwrites. Fix: BroadcastChannel wrapper, broadcast on Zustand persist write, re-hydrate on receive, stale-data toast warning. Fallback to storage events.',
          status: 'Done',
          priority: 'critical',
          storyPoints: 3,
          assignee: 'claude',
          labels: ['p0', 'data', 'infrastructure'],
          epicId: epic8Id,
          sprintId: sprint6Id,
          createdAt: now,
          updatedAt: now,
        },
        // === P1: Onboarding modal (SF-106) ===
        {
          id: qp4Id,
          type: 'story',
          title: 'SF-106: Add first-run welcome/onboarding modal',
          description:
            'First-time users see pre-loaded project with no context. Add WelcomeModal explaining 7 tabs, show on first visit, "Don\'t show again" checkbox, help button in sidebar to re-open.',
          status: 'Done',
          priority: 'high',
          storyPoints: 3,
          assignee: 'claude',
          labels: ['p1', 'ux', 'onboarding'],
          epicId: epic8Id,
          sprintId: sprint6Id,
          createdAt: now,
          updatedAt: now,
        },
        // === P1: Wire confirmation dialogs (SF-107) ===
        {
          id: qp5Id,
          type: 'task',
          title: 'SF-107: Wire ConfirmDialog to all delete actions',
          description:
            'ConfirmDialog exists but only used for project/wiki deletion. Wire to: BacklogView issue delete, IssueDetail delete, WorkflowCanvas node delete, DependencyGraph edge delete, TimelineTab phase/milestone delete, DecisionsTab decision delete. Respect "Confirm on Delete" setting.',
          status: 'Done',
          priority: 'high',
          storyPoints: 3,
          assignee: 'claude',
          labels: ['p1', 'ux', 'safety'],
          epicId: epic8Id,
          sprintId: sprint6Id,
          createdAt: now,
          updatedAt: now,
        },
        // === P1: Empty states (SF-108) ===
        {
          id: qp6Id,
          type: 'task',
          title: 'SF-108: Add consistent empty states across all tabs',
          description:
            "Dashboard/Wiki have empty states but Architecture, Timeline, Board columns, WorkflowCanvas don't. Add EmptyState with contextual icons and CTAs to all empty views.",
          status: 'Done',
          priority: 'high',
          storyPoints: 2,
          assignee: 'claude',
          labels: ['p1', 'ux'],
          epicId: epic8Id,
          sprintId: sprint6Id,
          createdAt: now,
          updatedAt: now,
        },
        // === P2: Form validation (SF-109) ===
        {
          id: qp7Id,
          type: 'task',
          title: 'SF-109: Add form validation to all creation flows',
          description:
            "Issue/page/decision titles can be blank. Input components have error props but forms don't use them. Add required field validation with inline error states and * indicators to QuickCreateBar, PageEditor, DecisionForm, SprintModal.",
          status: 'Done',
          priority: 'medium',
          storyPoints: 2,
          assignee: 'claude',
          labels: ['p2', 'ux', 'validation'],
          epicId: epic8Id,
          sprintId: sprint6Id,
          createdAt: now,
          updatedAt: now,
        },
        // === P2: Markdown sanitization (SF-110) ===
        {
          id: qp8Id,
          type: 'task',
          title: 'SF-110: Sanitize wiki markdown on import with DOMPurify',
          description:
            'Imported wiki content rendered via dangerouslySetInnerHTML. Parser escapes HTML but imported projects could contain pre-rendered HTML. Install dompurify, sanitize in MarkdownRenderer and on import.',
          status: 'Done',
          priority: 'medium',
          storyPoints: 2,
          assignee: 'claude',
          labels: ['p2', 'security', 'wiki'],
          epicId: epic8Id,
          sprintId: sprint6Id,
          createdAt: now,
          updatedAt: now,
        },
        // === P2: IndexedDB migration robustness (SF-111) ===
        {
          id: qp9Id,
          type: 'task',
          title: 'SF-111: Add IndexedDB migration failure toast + retry',
          description:
            'Migration catches errors silently. Return detailed status object, show error toast on failure with "Data migration failed" message and retry button.',
          status: 'Done',
          priority: 'medium',
          storyPoints: 1,
          assignee: 'claude',
          labels: ['p2', 'data', 'dx'],
          epicId: epic8Id,
          sprintId: sprint6Id,
          createdAt: now,
          updatedAt: now,
        },
        // === P2: Virtualization (SF-112) ===
        {
          id: qp10Id,
          type: 'task',
          title: 'SF-112: Add virtualization to BacklogView for large lists',
          description:
            'Install @tanstack/react-virtual, wrap BacklogView issue list with virtualizer. Only virtualize when issue count > 50. Keep Framer Motion animations on visible items.',
          status: 'Done',
          priority: 'medium',
          storyPoints: 3,
          assignee: 'claude',
          labels: ['p2', 'performance', 'board'],
          epicId: epic8Id,
          sprintId: sprint6Id,
          createdAt: now,
          updatedAt: now,
        },
        // === Elevation: Good → Excellent (SF-113) ===
        {
          id: qp11Id,
          type: 'story',
          title: 'SF-113: Elevate Good-rated areas to Excellent',
          description:
            'Responsive: full-screen mobile modals, touch targets. Export/Import: preview modal, drag-drop import. Drag&Drop: ghost preview, touch long-press. CommandPalette: fuzzy match, category filters. Security: CSP meta tag, noopener links, debounce saves. Confirm: undo-toast pattern.',
          status: 'Done',
          priority: 'medium',
          storyPoints: 8,
          assignee: 'claude',
          labels: ['polish', 'ux', 'elevation'],
          epicId: epic8Id,
          sprintId: sprint6Id,
          createdAt: now,
          updatedAt: now,
        },
        // === Tracker + verification (SF-114) ===
        {
          id: qp12Id,
          type: 'task',
          title: 'SF-114: Final verification pass + tracker completion',
          description:
            'Run all verification checks from the plan. Verify build, test all new features, confirm tracker is complete.',
          status: 'Done',
          priority: 'high',
          storyPoints: 1,
          assignee: 'claude',
          labels: ['meta', 'verification'],
          epicId: epic8Id,
          sprintId: sprint6Id,
          createdAt: now,
          updatedAt: now,
        },
        // BOARD CONSOLIDATION + LIGHT MODE FIX (v56) — SF-115 through SF-118
        // === Epic: Board Consolidation (SF-115) ===
        {
          id: epic9Id,
          type: 'epic',
          title: 'SF-115: Consolidate Board sub-tabs into unified view',
          description:
            'Board tab had 4 redundant sub-tabs. Consolidated into 2-mode switcher (Board|Epics) with charts as slide-out panel. Removed Table/Backlog view. Fixed epic sidebar filter not populating sprint board. Fixed filter dropdown light mode bug.',
          status: 'Done',
          priority: 'high',
          storyPoints: 13,
          assignee: 'claude',
          labels: ['refactor', 'ux', 'board'],
          epicId: null,
          sprintId: sprint6Id,
          createdAt: now,
          updatedAt: now,
        },
        // === Fix filter dropdown light mode (SF-116) ===
        {
          id: bc1Id,
          type: 'bug',
          title: 'SF-116: Fix filter dropdown background in light mode',
          description:
            'FilterBar and ArchitectureFilterBar use bg-[var(--color-bg-inverse)] for dropdown backgrounds. In light mode, --color-bg-inverse is dark charcoal (#2c2825), making dropdowns unreadable. Add --color-dropdown-bg token with proper light/dark values.',
          status: 'Done',
          priority: 'high',
          storyPoints: 1,
          assignee: 'claude',
          labels: ['bug', 'light-mode', 'filter'],
          epicId: epic9Id,
          sprintId: sprint6Id,
          createdAt: now,
          updatedAt: now,
        },
        // === Board tab view-mode consolidation (SF-117) ===
        {
          id: bc2Id,
          type: 'story',
          title: 'SF-117: Merge Board/Backlog/Epics into unified view-mode switcher',
          description:
            'Replaced 4 sub-tabs with 2-mode segmented control (Board|Epics). Removed Table view. Created EpicsView with epic cards + expandable child issues. Created ChartsPanel slide-out. Ungated EpicSidebar for all modes. Fixed epic filter bypassing sprint filter in SprintBoard.',
          status: 'Done',
          priority: 'high',
          storyPoints: 8,
          assignee: 'claude',
          labels: ['refactor', 'ux', 'board'],
          epicId: epic9Id,
          sprintId: sprint6Id,
          createdAt: now,
          updatedAt: now,
        },
        // === Final verification (SF-118) ===
        {
          id: bc3Id,
          type: 'task',
          title: 'SF-118: Board consolidation verification + tracker',
          description:
            'Verify all 3 view modes render correctly, charts panel toggles, EpicSidebar works in all modes, filter dropdowns look correct in light mode, IssueDetail works from all views. Build clean.',
          status: 'Done',
          priority: 'medium',
          storyPoints: 1,
          assignee: 'claude',
          labels: ['meta', 'verification'],
          epicId: epic9Id,
          sprintId: sprint6Id,
          createdAt: now,
          updatedAt: now,
        },

        // =====================================================================
        // SEED DATA CLEANUP + NAMING CONVENTION (v57) — SF-119 through SF-123
        // =====================================================================

        // === Epic: Data Quality & Naming (SF-119) ===
        {
          id: epic10Id,
          type: 'epic',
          title: 'SF-119: Seed Data Cleanup & Project Naming Convention',
          description:
            'Fix seed project data relationships (orphan issues, missing sprintId/epicId), rename project from "StoryFlow Development" to "StoryFlow", add Sprint 6 for production hardening work, implement project naming convention for new projects, and update Lessons Learned wiki.',
          status: 'Done',
          priority: 'high',
          storyPoints: 8,
          assignee: 'claude',
          labels: ['data', 'quality', 'process'],
          epicId: null,
          sprintId: sprint6Id,
          createdAt: now,
          updatedAt: now,
        },
        // === Wire up sprint/epic assignments (SF-120) ===
        {
          id: dc1Id,
          type: 'task',
          title: 'SF-120: Fix 30+ issues missing sprintId and 4 orphan issues missing epicId',
          description:
            'Audit found: SF-89 epic (14 children, 0 with sprintId), SF-102 epic (13 children, 0 with sprintId), SF-115 epic (3 children, 0 with sprintId), SF-4/SF-5/SF-6 missing epicId, SF-18 missing epicId, SF-15 epic missing sprintId. Created Sprint 6 (Production Hardening) and assigned all backlog epics + children. Fixed orphan issues with proper epicId. Sprint 5 marked completed.',
          status: 'Done',
          priority: 'high',
          storyPoints: 3,
          assignee: 'claude',
          labels: ['data', 'quality', 'board'],
          epicId: epic10Id,
          sprintId: sprint6Id,
          createdAt: now,
          updatedAt: now,
        },
        // === Rename project + naming convention (SF-121) ===
        {
          id: dc2Id,
          type: 'story',
          title: 'SF-121: Rename seed project and establish naming convention',
          description:
            'Renamed seed project from "StoryFlow Development" to "StoryFlow" — it is no longer a POC. Updated description to reflect current scope. Made project name a required field: disabled Create button when empty, inline validation error, duplicate name detection (case-insensitive). Updated test.',
          status: 'Done',
          priority: 'medium',
          storyPoints: 2,
          assignee: 'claude',
          labels: ['ux', 'naming', 'process'],
          epicId: epic10Id,
          sprintId: sprint6Id,
          createdAt: now,
          updatedAt: now,
        },
        // === Lessons Learned update (SF-122) ===
        {
          id: dc3Id,
          type: 'task',
          title: 'SF-122: Update Lessons Learned wiki with seed data and naming insights',
          description:
            'Document the seed data consistency lesson: always assign both sprintId AND epicId when adding new issues. Document project naming convention. Proactive — user requested lessons learned be kept current.',
          status: 'Done',
          priority: 'medium',
          storyPoints: 1,
          assignee: 'claude',
          labels: ['docs', 'process'],
          epicId: epic10Id,
          sprintId: sprint6Id,
          createdAt: now,
          updatedAt: now,
        },
        // === Fix WelcomeModal tooltip hover effects (SF-123) ===
        {
          id: generateId(),
          type: 'bug',
          title: 'SF-123: Remove hover effects from non-interactive WelcomeModal tab buttons',
          description:
            'The Welcome to StoryFlow modal shows tab descriptions with hover effects (cursor, background highlight) but the buttons are purely informational — clicking them does nothing. Removed transition-colors and hover:bg-[...] from feature card divs.',
          status: 'Done',
          priority: 'medium',
          storyPoints: 1,
          assignee: 'claude',
          labels: ['bug', 'ux', 'onboarding'],
          epicId: epic10Id,
          sprintId: sprint6Id,
          createdAt: now,
          updatedAt: now,
        },
        // === Soft-Delete / Trash System (SF-124) ===
        {
          id: generateId(),
          type: 'story',
          title: 'SF-124: Add soft-delete / trash system for projects',
          description:
            'Implemented soft-delete for projects. Deleting a project now moves it to trash (sets deletedAt timestamp) instead of permanent removal. Dashboard shows a collapsible Trash section with restore and permanent delete options, plus Empty Trash. Store adds trashProject, restoreProject, permanentlyDeleteProject, emptyTrash actions. selectActiveProjects/selectTrashedProjects selectors filter by deletedAt. Legacy deleteProject maps to trashProject for backward compat.',
          status: 'Done',
          priority: 'medium',
          storyPoints: 5,
          assignee: 'claude',
          labels: ['feature', 'ux', 'safety'],
          epicId: epic8Id,
          sprintId: sprint6Id,
          createdAt: now,
          updatedAt: now,
        },
        // === SF-97: Firefox CSS zoom test ===
        {
          id: generateId(),
          type: 'task',
          title: 'SF-97: Test workflow canvas CSS zoom on Firefox',
          description:
            'Firefox handles CSS zoom differently from Chromium browsers. Need to verify that the workflow canvas (which uses CSS zoom for crisp text) renders correctly in Firefox, including node positioning, connection paths, and zoom controls.',
          status: 'To Do',
          priority: 'low',
          storyPoints: 2,
          assignee: 'claude',
          labels: ['testing', 'browser-compat'],
          epicId: epic7Id,
          sprintId: sprint6Id,
          createdAt: now,
          updatedAt: now,
        },
        // === SF-126: Lessons Learned wiki update (v60) ===
        {
          id: generateId(),
          type: 'task',
          title:
            'SF-126: Update Lessons Learned wiki with ESLint patterns and soft-delete architecture',
          description:
            'Added 6 new lessons across 3 new sections: ESLint Patterns (useMemo for hook deps, _ prefix scope, react-refresh suppression, background agent limitations), Data Patterns (deletedAt soft-delete, store-level selector filtering), and a Claude Failures entry (over-removed imports). v60.',
          status: 'Done',
          priority: 'low',
          storyPoints: 1,
          assignee: 'claude',
          labels: ['docs', 'process'],
          epicId: epic10Id,
          sprintId: sprint6Id,
          createdAt: now,
          updatedAt: now,
        },
        // === SF-127: Update DashboardPage tests for trash system ===
        {
          id: generateId(),
          type: 'task',
          title: 'SF-127: Update DashboardPage.test.jsx for trash system UI',
          description:
            'DashboardPage.test.jsx needs updating for the new trash system. Tests should cover: trash toggle button visibility, trash section expand/collapse, restore project flow, permanent delete confirmation, empty trash confirmation. The existing delete test should be updated to test "move to trash" flow instead of permanent delete.',
          status: 'To Do',
          priority: 'medium',
          storyPoints: 3,
          assignee: 'claude',
          labels: ['testing', 'trash'],
          epicId: epic8Id,
          sprintId: sprint6Id,
          createdAt: now,
          updatedAt: now,
        },
      ],
      issueTypes: ['epic', 'story', 'task', 'bug', 'subtask'],
      customFields: [],
      statusColumns: ['To Do', 'In Progress', 'Done'],
      nextIssueNumber: 128,
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
    ui/           — 16 shared components (GlassCard, Button, Modal, Badge, etc.)
    layout/       — AppLayout, Sidebar, Header, GradientBackground
    project/      — 9 tab components (OverviewTab, BoardTab, WikiTab, etc.)
    architecture/ — 7 components (DependencyGraph, ComponentTree, ComponentDetail, etc.)
    board/        — 12 kanban components (SprintBoard, IssueCard, BacklogView)
    wiki/         — 8 wiki components (PageTree, PageEditor, MarkdownRenderer)
    workflow/     — 7 canvas components (WorkflowCanvas, WorkflowNode)
  hooks/          — 8 custom hooks (useProject, useSearch, useDragAndDrop)
  contexts/       — ProjectsContext (useReducer-based global state)
  utils/          — 8 utility modules
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
      {
        id: page13Id,
        title: 'Testing & Quality Infrastructure',
        content: `# Testing & Quality Infrastructure

StoryFlow includes comprehensive testing and code quality tooling added in v13.

## Testing with Vitest

\`\`\`bash
npm test           # Watch mode
npm run test:run   # Single run
npm run test:coverage  # With coverage report
\`\`\`

### Test Setup

- **vitest.config.js** — Configures jsdom environment and setup file
- **src/test/setup.js** — Global mocks for localStorage, crypto.randomUUID, and @testing-library/jest-dom matchers

### Current Test Coverage

| Module | Tests | Coverage |
|--------|-------|----------|
| src/utils/graph.js | 15 | Cycle detection, dependency validation, topological sort |

## Code Quality Tools

\`\`\`bash
npm run lint       # ESLint check
npm run lint:fix   # Auto-fix linting issues
npm run format     # Prettier format
npm run typecheck  # TypeScript type check (no emit)
\`\`\`

### Configuration Files

- **eslint.config.js** — React hooks, react-refresh rules, no-console warnings
- **.prettierrc** — Semi-free, single quotes, 100 char width
- **tsconfig.json** — Relaxed settings for incremental adoption (allowJs, no strict)

### Pre-commit Hooks

Husky + lint-staged run ESLint and Prettier on staged files before each commit.

## Error Handling

### ErrorBoundary

Wraps the entire app in \`App.jsx\`. Catches React render errors and displays:
- Friendly error message
- "Try Again" button (resets boundary state)
- "Go to Dashboard" button (full navigation)
- Expandable technical details (component stack)

### LoadingState & ErrorState

Reusable feedback components in \`src/components/ui/\`:

\`\`\`jsx
<LoadingState message="Loading..." size="md" />
<ErrorState title="Failed" message="..." onRetry={handleRetry} />
\`\`\`

## Graph Utilities

\`src/utils/graph.js\` provides dependency graph validation:

| Function | Purpose |
|----------|---------|
| wouldCreateCycle() | Pre-validates if adding a dependency creates a cycle |
| findCycles() | Finds all cycles using Tarjan's algorithm |
| findMissingDependencies() | Finds references to non-existent components |
| findOrphanedComponents() | Finds components with invalid parentId |
| topologicalSort() | Returns dependency-ordered list (null if cyclic) |
| cleanupInvalidReferences() | Removes invalid parentId/dependency refs |

## Accessibility Improvements

### Modal (v13)

- \`role="dialog"\`, \`aria-modal="true"\`
- \`aria-labelledby\` linked to title
- Focus trap (Tab cycles through focusable elements)
- Escape key closes
- Focus restoration on close
- Body scroll lock when open
`,
        parentId: page2Id,
        status: 'published',
        createdAt: now,
        updatedAt: now,
      },

      // === Lessons Learned ===
      {
        id: page14Id,
        title: 'Lessons Learned',
        content: `# Lessons Learned

A living record of hard-won knowledge from building StoryFlow. Categorized for quick reference.

---

## CSS & Styling

| Lesson | Context |
|--------|---------|
| Tailwind v4 + \`@tailwindcss/vite\` needs no \`postcss.config\` or \`tailwind.config\` | Use \`@import "tailwindcss"\` in CSS, custom properties via \`@theme {}\` |
| Workflow canvas uses CSS \`zoom\` (not \`transform:scale\`) for crisp text at all zoom levels | \`transform:scale\` causes blurry text. CSS \`zoom\` is non-standard but works in all Chromium browsers. |
| Dot grid moved from SVG \`<pattern>\` to CSS \`radial-gradient\` on the container | SVG pattern inside a transform wrapper left blank areas when the wrapper translated. CSS background on the parent fills 100% of the visible area regardless of child transforms. |
| Badge sizing: \`xs\` (10px) for dense/inline, \`sm\` (11px) for standard cards | Established in v30. No \`md\` usages remain. Consistent two-tier system across all 13+ components. |
| \`createPortal\` to \`document.body\` breaks z-index expectations | Portaled elements are siblings of \`#root\`, not children. A sidebar with \`z-200\` inside \`#root\` competes at the body stacking level against a portal with \`z-40\`. Use \`--z-drawer: 400\` or higher for portaled overlays that must cover sticky elements. |
| Undefined CSS variables in \`var()\` silently fail — no error, no visual | \`var(--th-border)\` was used in \`radial-gradient\` but never defined anywhere. The dots were invisible with zero console errors. Always grep the codebase for a custom property before using it. After any refactor that renames/removes CSS variables, search for all usages. |
| Never use raw Tailwind color shades, hardcoded hex, or undefined CSS vars for themed colors | \`text-purple-300\`, \`fill="#94a3b8"\`, \`bg-slate-400\`, \`text-white\` all break in the opposite theme. Always use semantic tokens (\`--color-fg-muted\`) or theme-bridge vars (\`--th-panel\`, \`--badge-purple-fg\`) defined in both \`.theme-dark\` and \`.theme-light\`. The Warm Linen redesign (v43) required fixing ~20 files because the original dark-mode build hardcoded colors everywhere. |
| Markdown renderer (\`markdown.js\`) is a stealth theme offender | It generates raw HTML strings with Tailwind classes baked in (\`text-slate-300\`, \`bg-slate-800\`, \`border-white/10\`). These can't be overridden by CSS variables after render. Fix: use \`var()\` references inside the class strings themselves (\`text-[var(--color-fg-muted)]\`). |

---

## Architecture & Components

| Lesson | Context |
|--------|---------|
| AnimatePresence + React Router = blank pages and jank | Even without \`mode="wait"\`, exit animations cause dual-render overlap. Removed AnimatePresence entirely from ProjectPage.jsx. Use enter-only motion.div with 0.12s opacity fade. **Never re-add AnimatePresence for route transitions.** |
| Workflow node width is 180px — keep \`WorkflowConnection NODE_WIDTH\` in sync | Was 160px, caused connection endpoint misalignment when changed. |
| NodeContextMenu uses viewport bounds detection | Prevents context menu from overflowing off-screen edges. |
| Pass full \`useProject()\` hooks object to ProjectPage | Cleaner tab wiring than passing individual updaters. |
| Canvas auto-fit uses \`FIT_MAX = 1.5\` | Allows small sub-workflows to scale up and fill the overlay, but caps zoom so nodes don't look comically large. |
| Never mutate objects after passing to \`saveNodes()\` / React state | Objects committed to a reducer become read-only (frozen in dev mode). The execution engine had \`workingNodes = resetNodes\` then mutated \`wn.status = 'running'\` — crashed with "Cannot assign to read only property." Always create a separate mutable copy: \`resetNodes.map(n => ({...n}))\`. |

---

## Data Model

| Lesson | Context |
|--------|---------|
| Board issues use \`epicId\` — **not** \`parentId\` | The UI (EpicSidebar, BacklogView) filters on \`issue.epicId === epic.id\`. Using \`parentId\` silently breaks epic progress counts. |
| Wiki pages use \`parentId\` for parent-child | Different from board issues. Don't mix conventions across domains. |
| Architecture components use \`parentId\` + \`dependencies[]\` | Always include \`dependencies\` array, even if empty. |
| Story points field is \`storyPoints\` — not \`points\` | Board UI reads \`issue.storyPoints\`. Wrong field name = invisible points. |
| Check CLAUDE.md "Field Conventions by Domain" before writing project JSON | The canonical reference for which fields each domain uses. |
| Every issue needs BOTH \`epicId\` AND \`sprintId\` | v57 audit found 30+ issues missing \`sprintId\` and 4 missing \`epicId\`. Orphan issues break epic progress counts and sprint board filtering. When adding issues, always assign both fields — even if the value is the "backlog" sprint. Epics themselves need \`sprintId\` too. |
| Seed project naming: "StoryFlow" (not "StoryFlow Development") | Renamed in v57. The project is no longer a POC — use the product name directly. |

---

## Security

| Lesson | Context |
|--------|---------|
| \`src/utils/sanitize.js\` has \`sanitizeColor()\` and \`stripDangerousKeys()\` | Always use when rendering user-provided content. |
| \`src/utils/markdown.js\` has \`isSafeUrl()\` | Validates URLs in markdown rendering to prevent XSS. |

---

## Process & Workflow

| Lesson | Context |
|--------|---------|
| Parallel agent strategy: launch 3-5 agents for independent component sets | Significantly faster for multi-file work. Always verify builds after — import mismatches are common. |
| \`SEED_VERSION\` bump triggers auto-migration on next app load | The store's \`onRehydrateStorage\` replaces the seed project when version is outdated. Fixed project ID prevents URL breakage. |
| New project naming convention: auto-increment "Untitled Project N" | When user clicks "New Project" with no name, DashboardPage checks existing project names and picks the next available number. Avoids collision. |
| Composable filtering: epic sidebar + sprint tab are independent dimensions | BoardTab epic filter passes filtered issues to SprintBoard, which further filters by sprint. Auto-switches to "All" on epic activation (transition detection via useRef), then user freely picks any sprint. Don't force-override — compose. |

---

## Claude Failures

Systematic log of Claude agent failures. Each entry must include root cause and a concrete remediation (skill, plugin, gate, or process fix) to prevent recurrence.

| Failure | Root Cause | Remediation |
|---------|-----------|-------------|
| Completed 4 tasks without updating seedProject.js (v30) | Tracker update treated as a follow-up step, not part of the work itself | Added HARD GATE #2 to MEMORY.md — board issues required before saying "done" |
| Added board issues as \\\`Done\\\` but no \\\`To Do\\\` items for next session | Only logged completed work, didn't think ahead to what's next | Added HARD GATE #6 — next-step tasks proactively added as \\\`To Do\\\` status |
| User asked to "launch tracker" — Claude opened browser instead of updating seed data | Interpreted "launch" literally as "open the app" rather than "make data visible in the tracker" | When user says "launch tracker" they mean ensure the data is present and fresh — bump SEED_VERSION so migration runs |
| Discovered gotchas during reasoning (SVG clipping, CSS zoom math) but didn't log them until asked | No habit of writing down non-obvious findings in the moment | Added HARD GATE #8 — annotate gotchas immediately during reasoning, don't rely on remembering next session |
| Claimed "fixed" for sidebar bleed bug without visually verifying in browser | Applied \\\`overflow-hidden\\\` on \\\`<main>\\\` but never checked the actual page. The real issue was a \\\`createPortal\\\` z-index conflict (z-40 overlay vs z-200 sidebar at different DOM levels). | Gate: always visually verify UI bug fixes in the browser before claiming done. Use MCP browser tools to screenshot and confirm. |
| Tracker update was last todo item, only started after user asked "did you update the tracker?" (v40) | HARD GATE checklist exists but was sequenced as final step in todo list rather than integrated into execution flow. User had to prompt. | The tracker update must happen inline — immediately after the code change, before moving to the next task. Never defer it to "the last step." |
| Light mode redesign (v42) only updated token files, not the ~20 components with hardcoded colors | Treated the theme system as "just change the tokens" without auditing all consumers. 11 undefined \`--th-*\` vars, hardcoded Tailwind shades (\`-300\` for dark), \`fill="#94a3b8"\`, \`text-white\`, \`bg-slate-*\` in Badge, Dashboard, markdown.js, charts, graph, workflow — all silently broke in light mode. User called it a "dumpster fire." | Gate: any theme change requires a full grep audit of ALL color references: (1) \`--th-*\` and custom CSS vars, (2) Tailwind shade classes (\`-300\`, \`-400\`), (3) hardcoded hex in JSX (\`fill=\`, \`bg-[#\`), (4) \`text-white\`/\`text-black\` outside accent backgrounds. Fix every hit before claiming done. |
| Backlog compact fix (v45): coded the change before creating tracker issue | Jumped straight to editing BacklogView.jsx without first adding an "In Progress" issue to seedProject.js. Tracker was only updated after the code was done — violating the mandatory 6-step workflow (step 3: update tracker BEFORE execution). | The tracker issue must be the FIRST thing created — before touching any component file. Sequence: (1) add issue as "In Progress" + bump SEED_VERSION, (2) write code, (3) mark issue "Done" + bump again. Never code-first-track-later. |
| Parallel test agents introduced \\\`react/display-name\\\` lint errors (v49) | 3 agents independently added \\\`React.forwardRef()\\\` mocks for framer-motion without \\\`displayName\\\`. Lint passed in agent scope but failed in CI gate (eslint \\\`react/display-name\\\` rule). | When mocking with \\\`React.forwardRef()\\\`, always assign \\\`displayName\\\`: \\\`const MotionDiv = React.forwardRef(...); MotionDiv.displayName = 'MotionDiv'\\\`. Add to parallel-agent post-merge checklist: run full lint before declaring done. |
| Repeated tracker update failure — go-live audit (v51) | Despite HARD GATE, started Batch 1 (sanitizeColor fixes) without updating seedProject.js first. User had to ask "where are my tracker updates" — the same failure as v30, v40, v45. Four prior remediations (HARD GATE checklist, MEMORY.md, inline tracking, sequence enforcement) all failed to prevent recurrence. | Root cause: tracker update is mentally categorized as "administrative overhead" rather than "the first line of code I write." New rule: the VERY FIRST edit in any session must be seedProject.js. No grep, no file reads for other files, no "let me understand the code first" — open seedProject.js and add the issue BEFORE doing anything else. If the issue description is incomplete, write a placeholder and refine later. The tracker is the work. |
| Over-removed imports in NotFoundPage.test.jsx (v59) | Removed \`userEvent\` and \`BrowserRouter\` imports along with truly unused \`vi\` and \`fireEvent\` — but userEvent (line 88) and BrowserRouter (line 167) were actually used. Caused 2 ESLint errors (\`no-undef\`, \`jsx-no-undef\`). | When removing "unused" imports flagged by ESLint, grep the file for actual usages of each import before deleting. ESLint warns on \`vi\` and \`fireEvent\` specifically — don't assume neighboring imports are also unused. Remove only what ESLint explicitly flags. |

---

## Performance

| Lesson | Context |
|--------|---------|
| CSS \`radial-gradient\` grid repaints on every pan frame | Monitor for performance regressions vs old SVG pattern approach. Consider tiling CSS background-image if janky. |
| \`centerOnNodes()\` needs 280ms delay after overlay mount | Framer Motion scale-in animation takes ~250ms. Measuring container dimensions before animation completes gives wrong values. Added dimension guard (\`rect.width < 10\`). |

---

## ESLint Patterns

| Lesson | Context |
|--------|---------|
| Logical expressions (\`??\`, \`\\|\\|\`) in hook deps create new refs every render | \`const nodes = workflow.nodes ?? []\` creates a new array every render if \`workflow.nodes\` is undefined. Wrap in \`useMemo()\`: \`const nodes = useMemo(() => workflow.nodes ?? [], [workflow.nodes])\`. Fixed 12 warnings in WorkflowTab.jsx alone. |
| \`_\` prefix for unused vars only works on function parameters | ESLint \`no-unused-vars\` with \`argsIgnorePattern: "^_"\` only applies to function args, not assigned \`const\` variables. For unused destructured values use omission (\`const { used } = obj\`) or restructure the code. |
| \`react-refresh/only-export-components\` is structural — suppress, don't fix | Context files that export both a Provider component and a \`useXxx\` hook trigger this. The alternative (separate files) adds complexity for no benefit. Use \`// eslint-disable-next-line react-refresh/only-export-components\`. |
| Background agents cannot Edit/Write files | Task agents have tool permissions denied for Edit and Write. Never delegate file edits to background agents — use them only for research/exploration. Do file edits in the main thread. |

---

## Data Patterns

| Lesson | Context |
|--------|---------|
| Soft-delete uses \`deletedAt\` timestamp, not status field | \`deletedAt\` is orthogonal to project status (a project can be "in-progress" and trashed). Enables "deleted N ago" display. \`selectActiveProjects\` filters \`!p.deletedAt\`. Legacy \`deleteProject()\` now maps to \`trashProject()\` for backward compatibility. |
| Zustand selectors filter at the store level, not the component | \`selectActiveProjects\` and \`selectTrashedProjects\` are store-level selectors. Components never see trashed projects unless they explicitly use \`selectTrashedProjects\`. This means Sidebar, search, etc. automatically exclude trashed items with zero code changes. |
`,
        parentId: page1Id,
        status: 'published',
        labels: ['process', 'docs'],
        createdAt: now,
        updatedAt: now,
      },
    ],

    timeline: {
      phases: [
        {
          id: phase1Id,
          name: 'Scaffolding',
          description:
            'Vite + React + Tailwind v4 setup, folder structure, routing, glassmorphism theme, core UI components (Button, Modal, GlassCard, Badge, Input, etc.)',
          startDate: '2026-01-27',
          endDate: '2026-01-30',
          progress: 100,
          color: '#10b981',
        },
        {
          id: phase2Id,
          name: 'State & Data Layer',
          description:
            'ProjectsContext with useReducer, useProject hooks, localStorage persistence with useAutoSave, default/sample project data, JSON export/import',
          startDate: '2026-01-30',
          endDate: '2026-02-01',
          progress: 100,
          color: '#6366f1',
        },
        {
          id: phase3Id,
          name: 'Board & Wiki',
          description:
            'Kanban board with drag-and-drop, issue cards, sprint management, backlog view, burndown/velocity charts. Wiki system with page tree, markdown editor, live preview, templates, version history.',
          startDate: '2026-02-01',
          endDate: '2026-02-03',
          progress: 100,
          color: '#3b82f6',
        },
        {
          id: phase4Id,
          name: 'Workflow & Timeline',
          description:
            'Visual workflow canvas with node graph, BFS execution engine, sub-workflow overlays, node detail modals. Gantt timeline with milestones, stats dashboard, chart/list views.',
          startDate: '2026-02-03',
          endDate: '2026-02-07',
          progress: 100,
          color: '#8b5cf6',
        },
        {
          id: phase5Id,
          name: 'Polish & Ship',
          description:
            'Security hardening, workflow zoom/pan/centering, sidebar cleanup, keyboard shortcuts, responsive design, accent color theming, performance optimizations, documentation.',
          startDate: '2026-02-07',
          endDate: '2026-02-14',
          progress: 100,
          color: '#f59e0b',
        },
        {
          id: phase6Id,
          name: 'UAT & Production',
          description:
            'User acceptance testing on macOS environment (02/18-02/20). Validate all 7 tabs, responsive layout, data persistence, export/import, keyboard shortcuts. Persistent path to production deployment.',
          startDate: '2026-02-18',
          endDate: '2026-02-20',
          progress: 0,
          color: '#ef4444',
        },
        {
          id: phase7Id,
          name: 'Quality Infrastructure',
          description:
            'Comprehensive quality improvements: ErrorBoundary for crash recovery, Vitest testing with 54 tests (graph utils + useProject + ProjectsContext), ESLint/Prettier/Husky tooling, TypeScript config, Modal accessibility (ARIA/focus trap), Suspense fallback fix, cycle detection UI integration, reference validation (milestone/epic cleanup), WorkflowCanvas refactoring into 4 hooks, LoadingState/ErrorState/VirtualList components.',
          startDate: '2026-02-12',
          endDate: '2026-02-14',
          progress: 100,
          color: '#06b6d4',
        },
        {
          id: phase8Id,
          name: 'StoryFlow 2.0 Overhaul',
          description:
            'Major architectural upgrade: unified semantic token system replacing 3 competing systems + 200 light mode hacks, Zustand migration for optimized state management, URL routing with deep linking, tab consolidation (7→5 tabs with sub-navigation), activity feed/audit log, comprehensive component updates to semantic tokens.',
          startDate: '2026-02-13',
          endDate: '2026-02-15',
          progress: 85,
          color: '#ec4899',
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
        {
          id: milestone9Id,
          name: 'Quality Infrastructure Complete',
          date: '2026-02-12',
          completed: true,
          color: '#06b6d4',
          phaseId: phase7Id,
        },
      ],
    },

    decisions: [
      {
        id: decisionId,
        title: 'State Management Approach',
        status: 'superseded',
        context:
          'We need a state management solution that handles complex nested project data, supports undo-friendly immutable updates, and does not add significant bundle size.',
        decision:
          '[SUPERSEDED by SF-50] Originally used React Context with useReducer. Migrated to Zustand in StoryFlow 2.0 due to re-render performance issues and need for optimized selectors.',
        alternatives: [
          {
            name: 'Redux Toolkit',
            pros: 'Mature ecosystem, Redux DevTools, middleware support',
            cons: 'Additional dependency, boilerplate overhead for a small app',
          },
          {
            name: 'Zustand',
            pros: 'Minimal API, small bundle size, no providers needed, optimized selectors prevent unnecessary re-renders',
            cons: 'Less structured for complex nested state, fewer conventions',
          },
          {
            name: 'useReducer + Context',
            pros: 'Zero dependencies, built into React, familiar patterns, good for nested state',
            cons: 'No DevTools, full re-renders on state change without careful memoization, selector factories can cause infinite loops',
          },
        ],
        consequences:
          'Zustand with immer middleware provides immutable updates with minimal boilerplate. Persist middleware handles localStorage. Selector patterns require careful attention to avoid creating new function references that trigger re-renders.',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: decision2Id,
        title: 'Styling Approach',
        status: 'accepted',
        context:
          'We need a styling solution that supports rapid UI development, works well with a dark glassmorphism theme, and avoids complex configuration. The app has many components with consistent visual patterns.',
        decision:
          'Use Tailwind CSS v4 with the @tailwindcss/vite plugin and a custom glassmorphism theme defined in index.css, rather than CSS Modules, Styled Components, or vanilla CSS.',
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
        consequences:
          'Class strings in JSX can get lengthy, but the tradeoff is worth it for development speed. The glassmorphism theme is centralized in index.css with custom glass, glass-card, glass-sidebar, and glass-input classes. Tailwind v4 eliminates the need for tailwind.config.js and postcss.config.js entirely.',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: decision3Id,
        title: 'SVG-based Charts over Charting Libraries',
        status: 'accepted',
        context:
          'The app needs Gantt charts, burndown charts, and velocity charts for the board and timeline views. We need to decide whether to use a charting library or build custom SVG visualizations.',
        decision:
          'Build all charts as pure SVG components rendered directly in React, rather than using Chart.js, Recharts, or D3.',
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
        consequences:
          'We write more chart code ourselves, but gain full control over styling and theming. SVG elements can use currentColor and CSS variables from the glassmorphism theme. No additional bundle size. Charts are just React components returning SVG markup, making them easy to maintain and test.',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: decision4Id,
        title: 'Flat Data Model for Projects',
        status: 'accepted',
        context:
          'Each project contains many related entities — issues, wiki pages, workflow nodes, timeline phases, decisions. We need to decide how to structure this data for localStorage persistence and JSON export.',
        decision:
          'Store all project data in a single flat object with arrays for each entity type, rather than using normalized or relational data structures.',
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
        consequences:
          'Array lookups use .find() and .filter() which is fine for the expected data sizes (tens to low hundreds of items per project). JSON export/import is trivial since the data model matches the storage format exactly. The useProject hook provides per-field updaters that abstract over the flat structure.',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: decision5Id,
        title: 'BFS Workflow Execution Engine',
        status: 'accepted',
        context:
          'The workflow canvas allows users to build directed acyclic graphs of tasks, phases, and decision points. We need an execution strategy that can traverse the graph, respect dependencies, and handle parallel branches with fork/join patterns.',
        decision:
          'Use a BFS (breadth-first search) traversal algorithm to execute workflow nodes level by level, rather than event-driven or sequential pipeline approaches.',
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
        consequences:
          'The BFS engine processes the workflow graph layer by layer, which visually maps to left-to-right execution on the canvas. Parallel branches at the same depth run together, and join nodes naturally wait for all incoming edges. The graph must remain a DAG — cycles are prevented at the connection creation level.',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: decision6Id,
        title: 'Input Sanitization Strategy',
        status: 'accepted',
        context:
          'Security audit revealed that user-provided content (markdown URLs, color values, imported JSON) was rendered without validation, creating XSS and injection risks. We need a sanitization approach that is practical for a client-side app without adding heavy dependencies.',
        decision:
          'Use targeted validation functions (isSafeUrl, sanitizeColor, stripDangerousKeys) at the point of use rather than a global sanitization library like DOMPurify.',
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
        consequences:
          'We maintain our own sanitization utilities in src/utils/sanitize.js. Each utility is focused: isSafeUrl validates URL protocols, sanitizeColor validates color format, stripDangerousKeys prevents prototype pollution. The tradeoff is manual coverage — any new user-content rendering point must apply the appropriate sanitizer. If the attack surface grows significantly, migrating to DOMPurify or react-markdown should be reconsidered.',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: decision7Id,
        title: 'Seed Project Auto-Update Strategy',
        status: 'accepted',
        context:
          'The StoryFlow development tracker (seedProject.js) is updated continuously as features are built — new board issues, workflow nodes, wiki pages, timeline progress. But existing users with localStorage data never see these updates because the seed only runs on empty localStorage.',
        decision:
          'Add a SEED_VERSION integer constant and isSeed flag to the seed project. On load, migrateSeedProject() in ProjectsContext compares versions and replaces the seed project wholesale if outdated. A fixed SEED_PROJECT_ID prevents URL breakage across regenerations.',
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
            cons: "User edits to the seed project are lost on version bump. Acceptable since this is a meta-project tracking Claude's own work.",
          },
        ],
        consequences:
          'Bumping SEED_VERSION after any seedProject.js edit is now a required step. The legacy migration path (finding "StoryFlow Development" by name) handles the one-time upgrade for pre-versioning users. User-created projects are never touched.',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: decision8Id,
        title: 'Architecture Graph Visualization',
        status: 'accepted',
        context:
          "The Architecture tab was the weakest of StoryFlow's 7 tabs — a 471-line monolith with zero sub-components, no visualization, and no sub-views. Other tabs have 3-11 sub-components, rich visualizations (kanban, Gantt, workflow canvas), and multiple views. Architecture needed a major upgrade to reach parity.",
        decision:
          'Decompose into 7 sub-components in src/components/architecture/. Add an interactive SVG dependency graph (adapted from WorkflowCanvas patterns — CSS zoom, dot grid, drag/pan/zoom). Use HTML-over-SVG hybrid for nodes (consistent with workflow). Add Graph/Tree sub-tabs, stat cards, enhanced detail panel with mini dep viz and "Used by" section.',
        alternatives: [
          {
            name: 'Pure SVG nodes',
            pros: 'Simpler coordinate math, no HTML-over-SVG complexity',
            cons: 'Loses Tailwind classes, glass-card styling, backdrop-blur, and Framer Motion animations. Inconsistent with WorkflowCanvas pattern.',
          },
          {
            name: 'External graph library (dagre, vis.js)',
            pros: 'Auto-layout included, edge routing, tested at scale',
            cons: 'Heavy dependency, inconsistent visual style, loses the hand-rolled glassmorphism aesthetic that defines StoryFlow.',
          },
          {
            name: 'HTML-over-SVG hybrid (adapted from WorkflowCanvas)',
            pros: 'Consistent with existing codebase patterns, reuses zoom/pan/drag code, supports Tailwind + glass-card styling, crisp text via CSS zoom.',
            cons: 'More complex than pure SVG, but the pattern is already proven in WorkflowCanvas.',
          },
        ],
        consequences:
          'Architecture tab now has 7 sub-components (ComponentTree, ComponentDetail, DependencyGraph, DependencyEdge, ArchitectureStats, ComponentForm, archLayout.js) plus constants.js. Components gain optional x/y fields for graph positioning. The auto-layout uses a layered topological sort algorithm.',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: decision9Id,
        title: 'Extracted Canvas Hooks over Monolith Component',
        status: 'accepted',
        context:
          'WorkflowCanvas.jsx had grown to 625 lines with multiple concerns: viewport state, zoom/pan, node dragging, connection drawing, context menus. Analysis recommended refactoring to reduce complexity and improve testability.',
        decision:
          'Extract 4 custom hooks (useCanvasViewport, useCanvasDrag, useCanvasPan, useCanvasConnection) that each own a single concern, keeping WorkflowCanvas as a thin orchestration layer.',
        alternatives: [
          {
            name: 'Keep monolith, add comments',
            pros: 'No breaking changes, faster to implement',
            cons: 'Does not reduce complexity, testing remains difficult, new contributors have steeper learning curve',
          },
          {
            name: 'Split into sub-components',
            pros: 'Clear visual hierarchy, component-level testing',
            cons: 'Canvas interactions tightly coupled — props/callbacks would proliferate. Hooks share state more naturally than sibling components.',
          },
          {
            name: 'Extract custom hooks by concern',
            pros: 'Each hook is testable in isolation, main component becomes declarative composition, hooks reusable for other canvas-based features (Architecture graph)',
            cons: 'Requires careful hook dependency management, slightly more files',
          },
        ],
        consequences:
          "WorkflowCanvas reduced to 393 lines. Four hooks total ~355 lines. Each hook can be unit tested or reused. Pattern established for future canvas components. The same hooks could power ArchitectureTab's DependencyGraph.",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: decision10Id,
        title: 'Zustand Migration for StoryFlow 2.0',
        status: 'accepted',
        context:
          'StoryFlow 2.0 overhaul revealed performance issues with React Context: full component tree re-renders on every state change, complex memoization required, selector factory patterns causing infinite loops. The Activity Feed feature required cross-cutting state that did not fit cleanly into the single ProjectsContext.',
        decision:
          'Migrate from React Context + useReducer to Zustand with sliced stores (projectsStore, activityStore, uiStore). Use immer middleware for immutable updates and persist middleware for localStorage.',
        alternatives: [
          {
            name: 'Keep React Context with optimization',
            pros: 'No new dependency, familiar patterns',
            cons: 'Requires extensive useMemo/useCallback, still causes cascading re-renders, selector factories fundamentally broken',
          },
          {
            name: 'Redux Toolkit',
            pros: 'Mature, DevTools, middleware ecosystem',
            cons: 'Heavy for this app size, more boilerplate, unfamiliar to some contributors',
          },
          {
            name: 'Zustand',
            pros: 'Tiny bundle (1KB), simple selector API, subscribeWithSelector prevents unnecessary renders, works outside React components, persist middleware built-in',
            cons: 'Less prescriptive structure, requires discipline for selector patterns',
          },
        ],
        consequences:
          'State management is now split across focused stores. Components subscribe to specific slices via selectors, eliminating cascading re-renders. The old ProjectsContext is kept as a thin wrapper for backwards compatibility. Critical lesson learned: never create selector functions inside render — use stable references with useCallback or subscribe to parent objects.',
        createdAt: now,
        updatedAt: now,
      },

      // === IndexedDB Migration Decision Record (v51) ===
      {
        id: decision11Id,
        title: 'Migrate Persistence from localStorage to IndexedDB (Dexie.js)',
        status: 'proposed',
        context:
          'Go-live audit revealed localStorage is not crash-safe (synchronous writes, no transaction safety), caps at 5MB (seed project alone is ~175KB), and has no per-entity querying. Every mutation serializes the entire projects array. A crash mid-write can corrupt the JSON blob.',
        decision:
          'Migrate to Dexie.js (~33KB IndexedDB wrapper) with entity-indexed schema. Use useLiveQuery for reactive reads. Keep Zustand for in-memory UI state, delegate persistence to Dexie adapter. Auto-migrate existing localStorage data on first load.',
        alternatives: [
          {
            name: 'idb (tiny IndexedDB wrapper)',
            pros: '~1.3KB, minimal API',
            cons: 'No reactive queries, manual state lifting required, too minimal for our schema',
          },
          {
            name: 'localForage',
            pros: '~8KB, familiar key-value API',
            cons: 'Key-value only, no indexes or queries, not much better than localStorage for structured data',
          },
          {
            name: 'PouchDB',
            pros: '~100KB, sync capability, offline-first',
            cons: 'Sync not needed, massive bundle, overkill for client-only app',
          },
          {
            name: 'Dexie.js',
            pros: '~33KB, ORM-like API, useLiveQuery for React, entity-indexed schema, transactions for crash safety, strong community',
            cons: 'Requires schema migration planning, adds async to reads',
          },
        ],
        consequences:
          'All persistence moves to IndexedDB via Dexie.js. Writes are transactional — a crash mid-write rolls back cleanly. Storage limit goes from 5MB to ~50% of disk free. New files: src/db/storyflowDb.js (schema), src/db/persistenceAdapter.js (normalize/denormalize), src/db/migrateFromLocalStorage.js (one-time migration). Zustand stores drop persist middleware, delegate to Dexie adapter.',
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
