import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
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

// Mock the useProjects hook directly (no need for full Zustand setup)
const mockAddProject = vi.fn()
const mockDeleteProject = vi.fn()
let mockProjects = []

vi.mock('../hooks/useProjects', () => ({
  useProjects: () => ({
    projects: mockProjects,
    addProject: mockAddProject,
    deleteProject: mockDeleteProject,
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
      // When projects exist, only the action bar "New Project" button is shown (not empty state)
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
    // Helper: when mockProjects is empty, both action bar and empty state render "New Project" buttons.
    // Use getAllByRole and pick the first one (the action bar button).
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

      // Input component renders label without htmlFor, find by placeholder
      const input = screen.getByPlaceholderText('My awesome project')
      await userEvent.type(input, 'My New Project')

      const createBtn = screen.getByRole('button', { name: /create project/i })
      await userEvent.click(createBtn)

      expect(mockAddProject).toHaveBeenCalledWith('My New Project')
      expect(mockNavigate).toHaveBeenCalledWith('/project/new-project-id')
    })

    it('creates project with default name when input is empty', async () => {
      renderDashboard()

      await clickNewProject()

      const createBtn = screen.getByRole('button', { name: /create project/i })
      await userEvent.click(createBtn)

      expect(mockAddProject).toHaveBeenCalledWith('Untitled Project')
      expect(mockNavigate).toHaveBeenCalledWith('/project/new-project-id')
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
      expect(mockNavigate).not.toHaveBeenCalled()
      expect(screen.queryByText('New Project', { selector: 'h2' })).not.toBeInTheDocument()
    })

    it('clears input when modal is reopened', async () => {
      renderDashboard()

      // Open modal and type something
      await clickNewProject()
      const input = screen.getByPlaceholderText('My awesome project')
      await userEvent.type(input, 'Some Text')

      // Cancel
      await userEvent.click(screen.getByRole('button', { name: /cancel/i }))

      // Reopen
      await clickNewProject()
      const newInput = screen.getByPlaceholderText('My awesome project')

      expect(newInput).toHaveValue('')
    })
  })

  describe('Delete Project', () => {
    it('shows delete confirmation dialog', async () => {
      mockProjects = [createMockProject({ id: '1', name: 'Delete Me' })]
      renderDashboard()

      // Find and click the delete button (trash icon)
      const deleteBtn = screen.getByTitle('Delete project')
      await userEvent.click(deleteBtn)

      expect(screen.getByText(/delete "Delete Me"/i)).toBeInTheDocument()
      expect(screen.getByText(/this will permanently remove/i)).toBeInTheDocument()
    })

    it('deletes project when confirmed', async () => {
      mockProjects = [createMockProject({ id: '1', name: 'To Be Deleted' })]
      renderDashboard()

      // Click delete button
      const deleteBtn = screen.getByTitle('Delete project')
      await userEvent.click(deleteBtn)

      // Confirm deletion — use exact text to avoid matching the trash icon button (title="Delete project")
      const confirmBtn = screen.getByText('Delete Project').closest('button')
      await userEvent.click(confirmBtn)

      expect(mockDeleteProject).toHaveBeenCalledWith('1')
    })

    it('cancels delete when dialog is closed', async () => {
      mockProjects = [createMockProject({ id: '1', name: 'Keep Me' })]
      renderDashboard()

      // Click delete button
      const deleteBtn = screen.getByTitle('Delete project')
      await userEvent.click(deleteBtn)

      // Cancel via cancel button
      const cancelBtn = screen.getByRole('button', { name: /cancel/i })
      await userEvent.click(cancelBtn)

      // Project should still exist
      expect(screen.getByText('Keep Me')).toBeInTheDocument()
      expect(mockDeleteProject).not.toHaveBeenCalled()
    })

    it('does not navigate to project when delete button is clicked', async () => {
      mockProjects = [createMockProject({ id: '1', name: 'Dont Navigate' })]
      renderDashboard()

      const deleteBtn = screen.getByTitle('Delete project')
      await userEvent.click(deleteBtn)

      // Should not navigate - click was stopped
      expect(mockNavigate).not.toHaveBeenCalled()
    })
  })

  describe('Empty State Actions', () => {
    it('opens new project modal from empty state action', async () => {
      mockProjects = []
      renderDashboard()

      // Both action bar and empty state have "New Project" buttons. Pick the empty state one (last).
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
      // Should not render tech badges container
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
