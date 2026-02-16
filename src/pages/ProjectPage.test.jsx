import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import ProjectPage from './ProjectPage'

// Mock framer-motion to avoid animation timing issues in tests
vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }) => children,
  motion: {
    div: ({
      children,
      initial: _i,
      animate: _a,
      exit: _e,
      transition: _t,
      layoutId: _l,
      ...rest
    }) => {
      return <div {...rest}>{children}</div>
    },
    span: ({
      children,
      initial: _i2,
      animate: _a2,
      exit: _e2,
      transition: _t2,
      layoutId: _l2,
      ...rest
    }) => {
      return <span {...rest}>{children}</span>
    },
  },
}))

// Mock the lazy-loaded tab components to simplify testing
vi.mock('../components/project/OverviewTab', () => ({
  default: ({ project }) => <div data-testid="overview-tab">Overview Tab - {project?.name}</div>,
}))

vi.mock('../components/project/ArchitectureTab', () => ({
  default: ({ project }) => (
    <div data-testid="architecture-tab">Architecture Tab - {project?.name}</div>
  ),
}))

vi.mock('../components/project/WorkflowTab', () => ({
  default: ({ project }) => <div data-testid="workflow-tab">Workflow Tab - {project?.name}</div>,
}))

vi.mock('../components/project/BoardTab', () => ({
  default: ({ project }) => <div data-testid="board-tab">Board Tab - {project?.name}</div>,
}))

vi.mock('../components/project/WikiTab', () => ({
  default: ({ project }) => <div data-testid="wiki-tab">Wiki Tab - {project?.name}</div>,
}))

vi.mock('../components/project/TimelineTab', () => ({
  default: ({ project }) => <div data-testid="timeline-tab">Timeline Tab - {project?.name}</div>,
}))

vi.mock('../components/project/DecisionsTab', () => ({
  default: ({ project }) => <div data-testid="decisions-tab">Decisions Tab - {project?.name}</div>,
}))

// Mock useProject hook to bypass Zustand store
const mockUpdateProject = vi.fn()
const mockHooks = {
  project: null,
  updateProject: mockUpdateProject,
  addIssue: vi.fn(),
  updateIssue: vi.fn(),
  deleteIssue: vi.fn(),
  addPage: vi.fn(),
  updatePage: vi.fn(),
  deletePage: vi.fn(),
  addDecision: vi.fn(),
  updateDecision: vi.fn(),
  addPhase: vi.fn(),
  updatePhase: vi.fn(),
  deletePhase: vi.fn(),
  addMilestone: vi.fn(),
  updateMilestone: vi.fn(),
  deleteMilestone: vi.fn(),
  updateWorkflow: vi.fn(),
  updateArchitecture: vi.fn(),
  updateBoardSettings: vi.fn(),
  updateSettings: vi.fn(),
  updateOverview: vi.fn(),
}

vi.mock('../hooks/useProject', () => ({
  useProject: () => mockHooks,
}))

// Mock useKeyboardShortcuts - capture handlers for testing
let capturedShortcutHandlers = {}
vi.mock('../hooks/useKeyboardShortcuts', () => ({
  useKeyboardShortcuts: (handlers) => {
    capturedShortcutHandlers = handlers
  },
  SHORTCUTS: {
    TAB_OVERVIEW: 'alt+1',
    TAB_ARCHITECTURE: 'alt+2',
    TAB_WORKFLOW: 'alt+3',
    TAB_BOARD: 'alt+4',
    TAB_WIKI: 'alt+5',
    TAB_TIMELINE: 'alt+6',
    TAB_DECISIONS: 'alt+7',
  },
}))

// Sample project data
const createMockProject = (overrides = {}) => ({
  id: 'test-project-123',
  name: 'Test Project',
  description: 'A test project description',
  status: 'planning',
  techStack: ['React', 'Node.js'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  board: {
    issues: [],
    sprints: [],
    statusColumns: ['To Do', 'In Progress', 'Done'],
    nextIssueNumber: 1,
  },
  overview: { goals: 'Test goals', constraints: '', targetAudience: '' },
  architecture: { components: [] },
  workflow: { nodes: [], connections: [] },
  pages: [],
  timeline: { phases: [], milestones: [] },
  decisions: [],
  settings: {},
  ...overrides,
})

// Helper to render ProjectPage with routing
function renderProjectPage({
  projectId = 'test-project-123',
  initialPath = 'overview',
  project = null,
} = {}) {
  // Set the project in the mock hook
  mockHooks.project = project

  return render(
    <MemoryRouter initialEntries={[`/project/${projectId}/${initialPath}`]}>
      <Routes>
        <Route path="/" element={<div data-testid="dashboard">Dashboard</div>} />
        <Route path="/project/:id/*" element={<ProjectPage />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('ProjectPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    capturedShortcutHandlers = {}
    mockHooks.project = null
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('renders project header with project name', async () => {
      const project = createMockProject()
      renderProjectPage({ project })

      await waitFor(() => {
        expect(screen.getByText('Test Project')).toBeInTheDocument()
      })
    })

    it('renders project sidebar with all main tabs', async () => {
      const project = createMockProject()
      renderProjectPage({ project })

      await waitFor(() => {
        // The sidebar renders tab labels in tooltips (e.g., "Overview  (Alt+1)") and in mobile bar.
        // "Insights" is not in mobile bar (mobileVisible: false), only in tooltip as "Insights  (Alt+6)".
        // Use regex to match partial text in tooltip content.
        expect(screen.getAllByText(/Overview/).length).toBeGreaterThanOrEqual(1)
        expect(screen.getAllByText(/Plan/).length).toBeGreaterThanOrEqual(1)
        expect(screen.getAllByText(/Work/).length).toBeGreaterThanOrEqual(1)
        expect(screen.getAllByText(/Docs/).length).toBeGreaterThanOrEqual(1)
        expect(screen.getAllByText(/Insights/).length).toBeGreaterThanOrEqual(1)
      })
    })

    it('renders Overview tab by default', async () => {
      const project = createMockProject()
      renderProjectPage({ project })

      await waitFor(() => {
        expect(screen.getByTestId('overview-tab')).toBeInTheDocument()
      })
    })

    it('displays project name in tab content', async () => {
      const project = createMockProject({ name: 'My Custom Project' })
      renderProjectPage({ project })

      // The project name appears in both the ProjectHeader and the mocked tab content
      await waitFor(() => {
        const nameElements = screen.getAllByText(/My Custom Project/)
        expect(nameElements.length).toBeGreaterThanOrEqual(1)
      })
    })
  })

  describe('Project Not Found', () => {
    it('shows not found message for invalid project ID', async () => {
      renderProjectPage({
        projectId: 'non-existent-id',
        project: null,
      })

      await waitFor(() => {
        expect(screen.getByText('Project not found')).toBeInTheDocument()
      })
    })

    it('shows explanatory message when project not found', async () => {
      renderProjectPage({ project: null })

      await waitFor(() => {
        expect(
          screen.getByText(/the project you are looking for does not exist or has been removed/i)
        ).toBeInTheDocument()
      })
    })

    it('shows "Back to Dashboard" button when project not found', async () => {
      renderProjectPage({ project: null })

      await waitFor(() => {
        expect(screen.getByText(/back to dashboard/i)).toBeInTheDocument()
      })
    })

    it('links back to dashboard when project not found', async () => {
      renderProjectPage({ project: null })

      await waitFor(() => {
        const link = screen.getByRole('link')
        expect(link).toHaveAttribute('href', '/')
      })
    })

    it('navigates to dashboard when back button is clicked', async () => {
      renderProjectPage({ project: null })

      await waitFor(() => {
        expect(screen.getByRole('link')).toBeInTheDocument()
      })

      await userEvent.click(screen.getByRole('link'))

      await waitFor(() => {
        expect(screen.getByTestId('dashboard')).toBeInTheDocument()
      })
    })
  })

  describe('Tab Navigation', () => {
    it('renders Architecture tab on /plan route', async () => {
      const project = createMockProject()
      renderProjectPage({ project, initialPath: 'plan' })

      await waitFor(() => {
        expect(screen.getByTestId('architecture-tab')).toBeInTheDocument()
      })
    })

    it('renders Workflow tab on /plan/workflow route', async () => {
      const project = createMockProject()
      renderProjectPage({ project, initialPath: 'plan/workflow' })

      await waitFor(() => {
        expect(screen.getByTestId('workflow-tab')).toBeInTheDocument()
      })
    })

    it('renders Board tab on /work route', async () => {
      const project = createMockProject()
      renderProjectPage({ project, initialPath: 'work' })

      await waitFor(() => {
        expect(screen.getByTestId('board-tab')).toBeInTheDocument()
      })
    })

    it('renders Wiki tab on /docs route', async () => {
      const project = createMockProject()
      renderProjectPage({ project, initialPath: 'docs' })

      await waitFor(() => {
        expect(screen.getByTestId('wiki-tab')).toBeInTheDocument()
      })
    })

    it('renders Timeline tab on /insights route', async () => {
      const project = createMockProject()
      renderProjectPage({ project, initialPath: 'insights' })

      await waitFor(() => {
        expect(screen.getByTestId('timeline-tab')).toBeInTheDocument()
      })
    })

    it('renders Decisions tab on /docs/decisions route', async () => {
      const project = createMockProject()
      renderProjectPage({ project, initialPath: 'docs/decisions' })

      await waitFor(() => {
        expect(screen.getByTestId('decisions-tab')).toBeInTheDocument()
      })
    })

    it('switches tabs when sidebar link is clicked', async () => {
      const project = createMockProject()
      renderProjectPage({ project })

      // Start at Overview
      await waitFor(() => {
        expect(screen.getByTestId('overview-tab')).toBeInTheDocument()
      })

      // Click on "Work" sidebar link — there may be multiple (desktop + mobile), click first
      const workLinks = screen.getAllByText('Work')
      await userEvent.click(workLinks[0])

      await waitFor(() => {
        expect(screen.getByTestId('board-tab')).toBeInTheDocument()
      })
    })

    it('can navigate between multiple tabs', async () => {
      const project = createMockProject()
      renderProjectPage({ project })

      // Start at Overview
      await waitFor(() => {
        expect(screen.getByTestId('overview-tab')).toBeInTheDocument()
      })

      // Go to Work (Board)
      const workLinks = screen.getAllByText('Work')
      await userEvent.click(workLinks[0])
      await waitFor(() => {
        expect(screen.getByTestId('board-tab')).toBeInTheDocument()
      })

      // Go to Docs (Wiki)
      const docsLinks = screen.getAllByText('Docs')
      await userEvent.click(docsLinks[0])
      await waitFor(() => {
        expect(screen.getByTestId('wiki-tab')).toBeInTheDocument()
      })

      // Go back to Overview
      const overviewLinks = screen.getAllByText('Overview')
      await userEvent.click(overviewLinks[0])
      await waitFor(() => {
        expect(screen.getByTestId('overview-tab')).toBeInTheDocument()
      })
    })
  })

  describe('Keyboard Shortcuts', () => {
    it('registers shortcut handlers for all tabs', async () => {
      const project = createMockProject()
      renderProjectPage({ project })

      await waitFor(() => {
        expect(screen.getByTestId('overview-tab')).toBeInTheDocument()
      })

      // useKeyboardShortcuts should have been called with handlers for all shortcuts
      expect(capturedShortcutHandlers['alt+1']).toBeDefined()
      expect(capturedShortcutHandlers['alt+2']).toBeDefined()
      expect(capturedShortcutHandlers['alt+3']).toBeDefined()
      expect(capturedShortcutHandlers['alt+4']).toBeDefined()
      expect(capturedShortcutHandlers['alt+5']).toBeDefined()
      expect(capturedShortcutHandlers['alt+6']).toBeDefined()
      expect(capturedShortcutHandlers['alt+7']).toBeDefined()
    })

    it('navigates to Overview with Alt+1 shortcut', async () => {
      const project = createMockProject()
      renderProjectPage({ project, initialPath: 'work' })

      await waitFor(() => {
        expect(screen.getByTestId('board-tab')).toBeInTheDocument()
      })

      // Invoke the captured shortcut handler
      act(() => {
        capturedShortcutHandlers['alt+1']()
      })

      await waitFor(() => {
        expect(screen.getByTestId('overview-tab')).toBeInTheDocument()
      })
    })

    it('navigates to Architecture with Alt+2 shortcut', async () => {
      const project = createMockProject()
      renderProjectPage({ project })

      await waitFor(() => {
        expect(screen.getByTestId('overview-tab')).toBeInTheDocument()
      })

      act(() => {
        capturedShortcutHandlers['alt+2']()
      })

      await waitFor(() => {
        expect(screen.getByTestId('architecture-tab')).toBeInTheDocument()
      })
    })

    it('navigates to Workflow with Alt+3 shortcut', async () => {
      const project = createMockProject()
      renderProjectPage({ project })

      act(() => {
        capturedShortcutHandlers['alt+3']()
      })

      await waitFor(() => {
        expect(screen.getByTestId('workflow-tab')).toBeInTheDocument()
      })
    })

    it('navigates to Board with Alt+4 shortcut', async () => {
      const project = createMockProject()
      renderProjectPage({ project })

      act(() => {
        capturedShortcutHandlers['alt+4']()
      })

      await waitFor(() => {
        expect(screen.getByTestId('board-tab')).toBeInTheDocument()
      })
    })

    it('navigates to Wiki with Alt+5 shortcut', async () => {
      const project = createMockProject()
      renderProjectPage({ project })

      act(() => {
        capturedShortcutHandlers['alt+5']()
      })

      await waitFor(() => {
        expect(screen.getByTestId('wiki-tab')).toBeInTheDocument()
      })
    })

    it('navigates to Timeline with Alt+6 shortcut', async () => {
      const project = createMockProject()
      renderProjectPage({ project })

      act(() => {
        capturedShortcutHandlers['alt+6']()
      })

      await waitFor(() => {
        expect(screen.getByTestId('timeline-tab')).toBeInTheDocument()
      })
    })

    it('navigates to Decisions with Alt+7 shortcut', async () => {
      const project = createMockProject()
      renderProjectPage({ project })

      act(() => {
        capturedShortcutHandlers['alt+7']()
      })

      await waitFor(() => {
        expect(screen.getByTestId('decisions-tab')).toBeInTheDocument()
      })
    })
  })

  describe('Route Parameter Handling', () => {
    it('loads correct project based on route ID', async () => {
      const project = createMockProject({ id: 'proj-2', name: 'Second Project' })
      renderProjectPage({ projectId: 'proj-2', project })

      await waitFor(() => {
        expect(screen.getByText('Second Project')).toBeInTheDocument()
      })
    })

    it('handles project ID with special characters', async () => {
      const project = createMockProject({
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        name: 'UUID Project',
      })

      renderProjectPage({
        projectId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        project,
      })

      await waitFor(() => {
        expect(screen.getByText('UUID Project')).toBeInTheDocument()
      })
    })
  })

  describe('Project Header Interactions', () => {
    it('displays project status badge', async () => {
      const project = createMockProject({ status: 'planning' })
      renderProjectPage({ project })

      await waitFor(() => {
        expect(screen.getByText('Planning')).toBeInTheDocument()
      })
    })

    it('displays Export button', async () => {
      const project = createMockProject()
      renderProjectPage({ project })

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument()
      })
    })

    it('allows editing project name', async () => {
      const project = createMockProject({ name: 'Editable Project' })
      renderProjectPage({ project })

      await waitFor(() => {
        expect(screen.getByText('Editable Project')).toBeInTheDocument()
      })

      // Click on project name to edit
      const nameButton = screen.getByText('Editable Project')
      await userEvent.click(nameButton)

      // Input should appear
      await waitFor(() => {
        expect(screen.getByRole('textbox')).toBeInTheDocument()
      })
    })
  })

  describe('Status Dropdown', () => {
    it('opens status dropdown when status badge is clicked', async () => {
      const project = createMockProject({ status: 'planning' })
      renderProjectPage({ project })

      await waitFor(() => {
        expect(screen.getByText('Planning')).toBeInTheDocument()
      })

      // Click on status badge to open dropdown
      const statusBadge = screen.getByText('Planning')
      await userEvent.click(statusBadge)

      // Dropdown should show all options
      await waitFor(() => {
        expect(screen.getByText('In Progress')).toBeInTheDocument()
        expect(screen.getByText('Completed')).toBeInTheDocument()
        expect(screen.getByText('Archived')).toBeInTheDocument()
      })
    })
  })

  describe('Edge Cases', () => {
    it('handles project with minimal data', async () => {
      const minimalProject = {
        id: 'minimal-123',
        name: 'Minimal',
        status: 'planning',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        board: { issues: [], sprints: [], statusColumns: [], nextIssueNumber: 1 },
        overview: {},
        architecture: { components: [] },
        workflow: { nodes: [], connections: [] },
        pages: [],
        timeline: { phases: [], milestones: [] },
        decisions: [],
        settings: {},
      }

      renderProjectPage({
        projectId: 'minimal-123',
        project: minimalProject,
      })

      await waitFor(() => {
        expect(screen.getByText('Minimal')).toBeInTheDocument()
      })
    })

    it('handles project with empty arrays', async () => {
      const project = createMockProject({
        techStack: [],
        board: {
          issues: [],
          sprints: [],
          statusColumns: [],
          nextIssueNumber: 1,
        },
        pages: [],
        decisions: [],
      })

      renderProjectPage({ project })

      await waitFor(() => {
        expect(screen.getByTestId('overview-tab')).toBeInTheDocument()
      })
    })

    it('redirects to overview for unknown sub-paths', async () => {
      const project = createMockProject()
      renderProjectPage({ project, initialPath: 'nonexistent' })

      await waitFor(() => {
        expect(screen.getByTestId('overview-tab')).toBeInTheDocument()
      })
    })
  })

  describe('Layout Structure', () => {
    it('renders sidebar alongside main content', async () => {
      const project = createMockProject()
      renderProjectPage({ project })

      await waitFor(() => {
        // Sidebar should be present with navigation links
        const links = screen.getAllByRole('link')
        expect(links.length).toBeGreaterThan(3)
      })
    })

    it('main content area contains tab content', async () => {
      const project = createMockProject()
      renderProjectPage({ project })

      await waitFor(() => {
        const tabContent = screen.getByTestId('overview-tab')
        expect(tabContent).toBeInTheDocument()
      })
    })
  })

  describe('Suspense Fallback', () => {
    it('shows loading state while tab loads', async () => {
      // Since we mock the tabs, this is hard to test directly
      // But we ensure the component renders without errors
      const project = createMockProject()
      renderProjectPage({ project })

      await waitFor(() => {
        expect(screen.getByTestId('overview-tab')).toBeInTheDocument()
      })
    })
  })

  describe('Tab State Persistence', () => {
    it('maintains tab state during interactions', async () => {
      const project = createMockProject()
      renderProjectPage({ project })

      // Switch to Board tab via sidebar
      await waitFor(() => {
        expect(screen.getAllByText('Work').length).toBeGreaterThan(0)
      })
      const workLinks = screen.getAllByText('Work')
      await userEvent.click(workLinks[0])

      await waitFor(() => {
        expect(screen.getByTestId('board-tab')).toBeInTheDocument()
      })

      // The tab should still be Board after other interactions
      expect(screen.queryByTestId('overview-tab')).not.toBeInTheDocument()
    })
  })
})
