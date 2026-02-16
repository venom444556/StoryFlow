import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import DashboardPage from './DashboardPage'

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }) => children,
}))

// Mock the useNavigate hook
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Mock the useProjects hook with trash system support
const mockAddProject = vi.fn()
const mockTrashProject = vi.fn()
const mockRestoreProject = vi.fn()
const mockPermanentlyDeleteProject = vi.fn()
const mockEmptyTrash = vi.fn()
let mockProjects = []
let mockTrashedProjects = []

vi.mock('../hooks/useProjects', () => ({
  useProjects: () => ({
    projects: mockProjects,
    trashedProjects: mockTrashedProjects,
    addProject: mockAddProject,
    trashProject: mockTrashProject,
    restoreProject: mockRestoreProject,
    permanentlyDeleteProject: mockPermanentlyDeleteProject,
    emptyTrash: mockEmptyTrash,
  }),
}))

// Sample project data for testing
const createMockProject = (overrides = {}) => ({
  id: `project-${Math.random().toString(36).slice(2)}`,
  name: 'Test Project',
  description: 'A test project',
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
  overview: { goals: '', constraints: '', targetAudience: '' },
  architecture: { components: [] },
  workflow: { nodes: [], connections: [] },
  pages: [],
  timeline: { phases: [], milestones: [] },
  decisions: [],
  settings: {},
  ...overrides,
})

function renderDashboard() {
  return render(
    <MemoryRouter>
      <DashboardPage />
    </MemoryRouter>
  )
}

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockProjects = []
    mockTrashedProjects = []
    mockAddProject.mockReturnValue({ id: 'new-project-id' })
  })

  describe('Basic Rendering', () => {
    it('renders the page title', () => {
      renderDashboard()
      expect(screen.getByText('Projects')).toBeInTheDocument()
    })

    it('renders the search bar', () => {
      renderDashboard()
      expect(screen.getByPlaceholderText('Search projects...')).toBeInTheDocument()
    })

    it('renders the New Project button', () => {
      mockProjects = [createMockProject({ id: '1', name: 'Existing' })]
      renderDashboard()
      expect(screen.getByRole('button', { name: /new project/i })).toBeInTheDocument()
    })

    it('displays correct project count', () => {
      mockProjects = [
        createMockProject({ id: '1', name: 'Project 1' }),
        createMockProject({ id: '2', name: 'Project 2' }),
        createMockProject({ id: '3', name: 'Project 3' }),
      ]
      renderDashboard()
      expect(screen.getByText('3 projects')).toBeInTheDocument()
    })

    it('displays singular "project" when only one exists', () => {
      mockProjects = [createMockProject({ id: '1', name: 'Single Project' })]
      renderDashboard()
      expect(screen.getByText('1 project')).toBeInTheDocument()
    })

    it('shows trash count alongside project count', () => {
      mockProjects = [createMockProject({ id: '1', name: 'Active' })]
      mockTrashedProjects = [
        createMockProject({ id: '2', name: 'Trashed', deletedAt: new Date().toISOString() }),
      ]
      renderDashboard()
      expect(screen.getByText(/1 in trash/)).toBeInTheDocument()
    })
  })

  describe('Empty State', () => {
    it('shows empty state when no projects exist', () => {
      mockProjects = []
      renderDashboard()
      expect(screen.getByText('Create your first project')).toBeInTheDocument()
      expect(screen.getByText(/get started by creating a new project/i)).toBeInTheDocument()
    })

    it('shows "no matching projects" when search has no results', async () => {
      mockProjects = [createMockProject({ id: '1', name: 'Alpha Project' })]
      renderDashboard()

      const searchInput = screen.getByPlaceholderText('Search projects...')
      await userEvent.type(searchInput, 'xyz')

      expect(screen.getByText('No matching projects')).toBeInTheDocument()
      expect(screen.getByText(/try adjusting your search query/i)).toBeInTheDocument()
    })
  })

  describe('Project Cards', () => {
    it('renders project cards with names', () => {
      mockProjects = [
        createMockProject({ id: '1', name: 'My Awesome Project' }),
        createMockProject({ id: '2', name: 'Another Project' }),
      ]
      renderDashboard()

      expect(screen.getByText('My Awesome Project')).toBeInTheDocument()
      expect(screen.getByText('Another Project')).toBeInTheDocument()
    })

    it('displays project status badges', () => {
      mockProjects = [
        createMockProject({ id: '1', name: 'Planning Project', status: 'planning' }),
        createMockProject({ id: '2', name: 'Active Project', status: 'in-progress' }),
        createMockProject({ id: '3', name: 'Done Project', status: 'completed' }),
      ]
      renderDashboard()

      expect(screen.getByText('planning')).toBeInTheDocument()
      expect(screen.getByText('in-progress')).toBeInTheDocument()
      expect(screen.getByText('completed')).toBeInTheDocument()
    })

    it('displays tech stack badges (max 3 visible)', () => {
      mockProjects = [
        createMockProject({
          id: '1',
          name: 'Tech Project',
          techStack: ['React', 'Node.js', 'PostgreSQL', 'Docker', 'Redis'],
        }),
      ]
      renderDashboard()

      expect(screen.getByText('React')).toBeInTheDocument()
      expect(screen.getByText('Node.js')).toBeInTheDocument()
      expect(screen.getByText('PostgreSQL')).toBeInTheDocument()
      expect(screen.getByText('+2 more')).toBeInTheDocument()
    })

    it('displays issue count and open count', () => {
      mockProjects = [
        createMockProject({
          id: '1',
          name: 'Issue Project',
          board: {
            issues: [
              { id: 'i1', status: 'To Do' },
              { id: 'i2', status: 'In Progress' },
              { id: 'i3', status: 'Done' },
            ],
            sprints: [],
            statusColumns: ['To Do', 'In Progress', 'Done'],
            nextIssueNumber: 4,
          },
        }),
      ]
      renderDashboard()

      expect(screen.getByText(/3 issues, 2 open/)).toBeInTheDocument()
    })

    it('navigates to project when card is clicked', async () => {
      mockProjects = [createMockProject({ id: 'test-123', name: 'Clickable Project' })]
      renderDashboard()

      const projectCard = screen.getByText('Clickable Project').closest('[class*="glass"]')
      fireEvent.click(projectCard)

      expect(mockNavigate).toHaveBeenCalledWith('/project/test-123')
    })
  })

  describe('Search Functionality', () => {
    it('filters projects by name', async () => {
      mockProjects = [
        createMockProject({ id: '1', name: 'Alpha Project' }),
        createMockProject({ id: '2', name: 'Beta Project' }),
        createMockProject({ id: '3', name: 'Gamma Project' }),
      ]
      renderDashboard()

      const searchInput = screen.getByPlaceholderText('Search projects...')
      await userEvent.type(searchInput, 'Beta')

      expect(screen.getByText('Beta Project')).toBeInTheDocument()
      expect(screen.queryByText('Alpha Project')).not.toBeInTheDocument()
      expect(screen.queryByText('Gamma Project')).not.toBeInTheDocument()
    })

    it('search is case insensitive', async () => {
      mockProjects = [createMockProject({ id: '1', name: 'MyAwesomeProject' })]
      renderDashboard()

      const searchInput = screen.getByPlaceholderText('Search projects...')
      await userEvent.type(searchInput, 'myawesome')

      expect(screen.getByText('MyAwesomeProject')).toBeInTheDocument()
    })

    it('shows all projects when search is cleared', async () => {
      mockProjects = [
        createMockProject({ id: '1', name: 'Alpha' }),
        createMockProject({ id: '2', name: 'Beta' }),
      ]
      renderDashboard()

      const searchInput = screen.getByPlaceholderText('Search projects...')
      await userEvent.type(searchInput, 'Alpha')

      expect(screen.queryByText('Beta')).not.toBeInTheDocument()

      await userEvent.clear(searchInput)

      expect(screen.getByText('Alpha')).toBeInTheDocument()
      expect(screen.getByText('Beta')).toBeInTheDocument()
    })
  })

  describe('Create New Project', () => {
    function clickNewProject() {
      const buttons = screen.getAllByRole('button', { name: /new project/i })
      return userEvent.click(buttons[0])
    }

    it('opens modal when New Project button is clicked', async () => {
      renderDashboard()
      await clickNewProject()
      expect(screen.getByText('New Project', { selector: 'h2' })).toBeInTheDocument()
    })

    it('creates project with entered name', async () => {
      renderDashboard()
      await clickNewProject()

      const input = screen.getByPlaceholderText('My awesome project')
      await userEvent.type(input, 'My New Project')

      const createBtn = screen.getByRole('button', { name: /create project/i })
      await userEvent.click(createBtn)

      expect(mockAddProject).toHaveBeenCalledWith('My New Project')
      expect(mockNavigate).toHaveBeenCalledWith('/project/new-project-id')
    })

    it('shows error and prevents creation when project name is empty', async () => {
      renderDashboard()
      await clickNewProject()

      const createBtn = screen.getByRole('button', { name: /create project/i })
      expect(createBtn).toBeDisabled()

      expect(mockAddProject).not.toHaveBeenCalled()
    })

    it('creates project on Enter key press', async () => {
      renderDashboard()
      await clickNewProject()

      const input = screen.getByPlaceholderText('My awesome project')
      await userEvent.type(input, 'Enter Project{Enter}')

      expect(mockAddProject).toHaveBeenCalled()
      expect(mockNavigate).toHaveBeenCalledWith('/project/new-project-id')
    })

    it('closes modal without creating project when Cancel is clicked', async () => {
      renderDashboard()
      await clickNewProject()

      const input = screen.getByPlaceholderText('My awesome project')
      await userEvent.type(input, 'Will Not Create')

      const cancelBtn = screen.getByRole('button', { name: /cancel/i })
      await userEvent.click(cancelBtn)

      expect(mockAddProject).not.toHaveBeenCalled()
      expect(screen.queryByText('New Project', { selector: 'h2' })).not.toBeInTheDocument()
    })

    it('clears input when modal is reopened', async () => {
      renderDashboard()
      await clickNewProject()
      const input = screen.getByPlaceholderText('My awesome project')
      await userEvent.type(input, 'Some Text')

      await userEvent.click(screen.getByRole('button', { name: /cancel/i }))

      await clickNewProject()
      const newInput = screen.getByPlaceholderText('My awesome project')
      expect(newInput).toHaveValue('')
    })
  })

  describe('Move to Trash', () => {
    it('shows move-to-trash confirmation dialog', async () => {
      mockProjects = [createMockProject({ id: '1', name: 'Trash Me' })]
      renderDashboard()

      const trashBtn = screen.getByTitle('Move to trash')
      await userEvent.click(trashBtn)

      expect(screen.getByText(/Move "Trash Me" to trash/i)).toBeInTheDocument()
      expect(screen.getByText(/moved to trash.*restore it later/i)).toBeInTheDocument()
    })

    it('moves project to trash when confirmed', async () => {
      mockProjects = [createMockProject({ id: '1', name: 'To Be Trashed' })]
      renderDashboard()

      const trashBtn = screen.getByTitle('Move to trash')
      await userEvent.click(trashBtn)

      // After clicking trash icon, the ConfirmDialog opens with a "Move to Trash" button.
      // Use getAllByRole since the original trash icon button also matches.
      const buttons = screen.getAllByRole('button', { name: /move to trash/i })
      const confirmBtn = buttons[buttons.length - 1] // The dialog confirm button is last
      await userEvent.click(confirmBtn)

      expect(mockTrashProject).toHaveBeenCalledWith('1')
    })

    it('cancels trash when dialog is closed', async () => {
      mockProjects = [createMockProject({ id: '1', name: 'Keep Me' })]
      renderDashboard()

      const trashBtn = screen.getByTitle('Move to trash')
      await userEvent.click(trashBtn)

      const cancelBtn = screen.getByRole('button', { name: /cancel/i })
      await userEvent.click(cancelBtn)

      expect(screen.getByText('Keep Me')).toBeInTheDocument()
      expect(mockTrashProject).not.toHaveBeenCalled()
    })

    it('does not navigate to project when trash button is clicked', async () => {
      mockProjects = [createMockProject({ id: '1', name: 'Dont Navigate' })]
      renderDashboard()

      const trashBtn = screen.getByTitle('Move to trash')
      await userEvent.click(trashBtn)

      expect(mockNavigate).not.toHaveBeenCalled()
    })
  })

  describe('Trash Section', () => {
    it('hides trash button when no projects are trashed', () => {
      mockProjects = [createMockProject({ id: '1', name: 'Active' })]
      mockTrashedProjects = []
      renderDashboard()

      expect(screen.queryByRole('button', { name: /trash \(/i })).not.toBeInTheDocument()
    })

    it('shows trash button with count when projects are trashed', () => {
      mockTrashedProjects = [
        createMockProject({ id: '1', name: 'Trashed 1', deletedAt: new Date().toISOString() }),
        createMockProject({ id: '2', name: 'Trashed 2', deletedAt: new Date().toISOString() }),
      ]
      renderDashboard()

      expect(screen.getByRole('button', { name: /trash \(2\)/i })).toBeInTheDocument()
    })

    it('toggles trash section visibility on button click', async () => {
      mockTrashedProjects = [
        createMockProject({
          id: '1',
          name: 'Trashed Project',
          deletedAt: new Date().toISOString(),
        }),
      ]
      renderDashboard()

      // Trash section not visible initially
      expect(screen.queryByText('Trashed Project')).not.toBeInTheDocument()

      // Click to show
      const trashToggle = screen.getByRole('button', { name: /trash \(1\)/i })
      await userEvent.click(trashToggle)

      // Now visible
      expect(screen.getByText('Trashed Project')).toBeInTheDocument()

      // Click again to hide
      await userEvent.click(trashToggle)

      // Hidden again
      expect(screen.queryByText('Trashed Project')).not.toBeInTheDocument()
    })

    it('restores project when restore button is clicked', async () => {
      mockTrashedProjects = [
        createMockProject({
          id: 'restore-1',
          name: 'Restore Me',
          deletedAt: new Date().toISOString(),
        }),
      ]
      renderDashboard()

      const trashToggle = screen.getByRole('button', { name: /trash \(1\)/i })
      await userEvent.click(trashToggle)

      const restoreBtn = screen.getByTitle('Restore project')
      await userEvent.click(restoreBtn)

      expect(mockRestoreProject).toHaveBeenCalledWith('restore-1')
    })

    it('shows permanent delete confirmation', async () => {
      mockTrashedProjects = [
        createMockProject({ id: '1', name: 'Delete Forever', deletedAt: new Date().toISOString() }),
      ]
      renderDashboard()

      const trashToggle = screen.getByRole('button', { name: /trash \(1\)/i })
      await userEvent.click(trashToggle)

      const deleteBtn = screen.getByTitle('Permanently delete')
      await userEvent.click(deleteBtn)

      expect(screen.getByText(/permanently delete "Delete Forever"/i)).toBeInTheDocument()
      expect(screen.getByText(/cannot be undone/i)).toBeInTheDocument()
    })

    it('permanently deletes when confirmed', async () => {
      mockTrashedProjects = [
        createMockProject({
          id: 'del-1',
          name: 'Gone Forever',
          deletedAt: new Date().toISOString(),
        }),
      ]
      renderDashboard()

      const trashToggle = screen.getByRole('button', { name: /trash \(1\)/i })
      await userEvent.click(trashToggle)

      const deleteBtn = screen.getByTitle('Permanently delete')
      await userEvent.click(deleteBtn)

      const confirmBtn = screen.getByRole('button', { name: /delete forever/i })
      await userEvent.click(confirmBtn)

      expect(mockPermanentlyDeleteProject).toHaveBeenCalledWith('del-1')
    })

    it('shows empty trash confirmation with count', async () => {
      mockTrashedProjects = [
        createMockProject({ id: '1', name: 'T1', deletedAt: new Date().toISOString() }),
        createMockProject({ id: '2', name: 'T2', deletedAt: new Date().toISOString() }),
      ]
      renderDashboard()

      const trashToggle = screen.getByRole('button', { name: /trash \(2\)/i })
      await userEvent.click(trashToggle)

      const emptyBtn = screen.getByRole('button', { name: /empty trash/i })
      await userEvent.click(emptyBtn)

      expect(screen.getByText(/permanently delete 2 projects/i)).toBeInTheDocument()
    })

    it('empties trash when confirmed', async () => {
      mockTrashedProjects = [
        createMockProject({ id: '1', name: 'T1', deletedAt: new Date().toISOString() }),
      ]
      renderDashboard()

      const trashToggle = screen.getByRole('button', { name: /trash \(1\)/i })
      await userEvent.click(trashToggle)

      const emptyBtn = screen.getByRole('button', { name: /empty trash/i })
      await userEvent.click(emptyBtn)

      // Confirm in the dialog — find the confirm button (last "Empty Trash" button)
      const confirmBtns = screen.getAllByRole('button', { name: /empty trash/i })
      await userEvent.click(confirmBtns[confirmBtns.length - 1])

      expect(mockEmptyTrash).toHaveBeenCalled()
    })
  })

  describe('Empty State Actions', () => {
    it('opens new project modal from empty state action', async () => {
      mockProjects = []
      renderDashboard()

      const buttons = screen.getAllByRole('button', { name: /new project/i })
      const emptyStateBtn = buttons[buttons.length - 1]
      await userEvent.click(emptyStateBtn)

      expect(screen.getByText('New Project', { selector: 'h2' })).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles project without techStack', () => {
      mockProjects = [createMockProject({ id: '1', name: 'No Tech', techStack: undefined })]
      renderDashboard()
      expect(screen.getByText('No Tech')).toBeInTheDocument()
    })

    it('handles project without board issues', () => {
      mockProjects = [createMockProject({ id: '1', name: 'No Board', board: undefined })]
      renderDashboard()
      expect(screen.getByText('No Board')).toBeInTheDocument()
      expect(screen.getByText('0 issues')).toBeInTheDocument()
    })

    it('handles project with empty techStack', () => {
      mockProjects = [createMockProject({ id: '1', name: 'Empty Tech', techStack: [] })]
      renderDashboard()
      expect(screen.getByText('Empty Tech')).toBeInTheDocument()
      expect(screen.queryByText('+0 more')).not.toBeInTheDocument()
    })

    it('handles special characters in project name', async () => {
      mockProjects = [
        createMockProject({ id: '1', name: 'Project & <script>alert("xss")</script>' }),
      ]
      renderDashboard()
      expect(screen.getByText('Project & <script>alert("xss")</script>')).toBeInTheDocument()
    })
  })
})
