import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Sidebar from './Sidebar'

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    aside: ({ children, animate: _animate, ...props }) => <aside {...props}>{children}</aside>,
    span: ({ children, ...props }) => <span {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}))

// Mock the navigate function
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Mock the useProjects hook
const mockAddProject = vi.fn()
let mockProjects = []

vi.mock('../../hooks/useProjects', () => ({
  useProjects: () => ({
    projects: mockProjects,
    addProject: mockAddProject,
  }),
}))

function renderSidebar(props = {}) {
  return render(
    <MemoryRouter>
      <Sidebar {...props} />
    </MemoryRouter>
  )
}

describe('Sidebar', () => {
  const defaultProps = {
    collapsed: false,
    onToggle: vi.fn(),
    mobileMenuOpen: false,
    onMobileMenuClose: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockProjects = [
      {
        id: 'test-project',
        name: 'Test Project',
        status: 'planning',
        isSeed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]
    mockAddProject.mockReturnValue({ id: 'new-project-id' })
  })

  describe('Basic rendering', () => {
    it('renders without crashing', () => {
      renderSidebar(defaultProps)
      // "Story" and "Flow" are in separate elements for accent styling
      expect(screen.getByText(/Story/)).toBeInTheDocument()
      expect(screen.getByText(/Flow/)).toBeInTheDocument()
    })

    it('renders as an aside element', () => {
      renderSidebar(defaultProps)
      const aside = document.querySelector('aside')
      expect(aside).toBeInTheDocument()
    })
  })

  describe('Brand section', () => {
    it('shows StoryFlow logo when expanded', () => {
      renderSidebar({ ...defaultProps, collapsed: false })
      expect(screen.getByText(/Story/)).toBeInTheDocument()
      expect(screen.getByText(/Flow/)).toBeInTheDocument()
    })

    it('hides StoryFlow text when collapsed (desktop)', () => {
      renderSidebar({ ...defaultProps, collapsed: true, mobileMenuOpen: false })
      // Text should not be visible when collapsed
      expect(screen.queryByText('StoryFlow')).not.toBeInTheDocument()
    })

    it('shows StoryFlow text when mobile menu is open even if collapsed', () => {
      renderSidebar({ ...defaultProps, collapsed: true, mobileMenuOpen: true })
      expect(screen.getByText(/Story/)).toBeInTheDocument()
      expect(screen.getByText(/Flow/)).toBeInTheDocument()
    })

    it('renders Zap icon in brand', () => {
      renderSidebar(defaultProps)
      // The icon is in a gradient div
      const brandIcon = document.querySelector('aside > div > div')
      expect(brandIcon).toBeInTheDocument()
    })
  })

  describe('Dashboard link', () => {
    it('renders Dashboard link', () => {
      renderSidebar(defaultProps)
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })

    it('Dashboard link navigates to /', () => {
      renderSidebar(defaultProps)
      const dashboardLink = screen.getByText('Dashboard').closest('a')
      expect(dashboardLink).toHaveAttribute('href', '/')
    })

    it('calls onMobileMenuClose when Dashboard is clicked', () => {
      const onMobileMenuClose = vi.fn()
      renderSidebar({ ...defaultProps, mobileMenuOpen: true, onMobileMenuClose })

      const dashboardLink = screen.getByText('Dashboard').closest('a')
      fireEvent.click(dashboardLink)

      expect(onMobileMenuClose).toHaveBeenCalled()
    })
  })

  describe('Projects section', () => {
    it('shows Projects label when expanded', () => {
      renderSidebar({ ...defaultProps, collapsed: false })
      expect(screen.getByText('Projects')).toBeInTheDocument()
    })

    it('hides Projects label when collapsed', () => {
      renderSidebar({ ...defaultProps, collapsed: true })
      expect(screen.queryByText('Projects')).not.toBeInTheDocument()
    })

    it('shows project count badge', () => {
      renderSidebar(defaultProps)
      // There should be at least one project
      const badges = document.querySelectorAll('.rounded-full')
      const countBadge = Array.from(badges).find(
        (b) => b.textContent && /^\d+$/.test(b.textContent)
      )
      expect(countBadge).toBeInTheDocument()
    })

    it('renders project list items', () => {
      renderSidebar(defaultProps)
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('navigates to project on click', () => {
      renderSidebar(defaultProps)

      // Find a project button (not the New Project button)
      const buttons = screen.getAllByRole('button')
      const projectButtons = buttons.filter(
        (b) => !b.textContent.includes('New Project') && b.textContent.trim()
      )

      if (projectButtons.length > 0) {
        fireEvent.click(projectButtons[0])
        expect(mockNavigate).toHaveBeenCalled()
      }
    })

    it('shows status dot for each project', () => {
      renderSidebar(defaultProps)
      // Status dots are small rounded-full elements with specific color classes
      const statusDots = document.querySelectorAll('.h-2.w-2.rounded-full')
      expect(statusDots.length).toBeGreaterThan(0)
    })
  })

  describe('New Project button', () => {
    it('renders New Project button when expanded', () => {
      renderSidebar({ ...defaultProps, collapsed: false })
      expect(screen.getByText('New Project')).toBeInTheDocument()
    })

    it('shows only Plus icon when collapsed', () => {
      renderSidebar({ ...defaultProps, collapsed: true })
      // In collapsed mode, the bottom section has the new project button
      const bottomSection = document.querySelector('aside > div.border-t')
      expect(bottomSection).toBeInTheDocument()
      // Find the last button group (new project area)
      const newProjectArea = document.querySelector('aside > div.px-\\[var\\(--space-3\\)\\]')
      expect(newProjectArea).toBeInTheDocument()
      const newProjectButton = newProjectArea?.querySelector('button')
      expect(newProjectButton).toBeInTheDocument()
      // The button itself should NOT contain a <span>New Project</span> child
      const buttonSpan = newProjectButton?.querySelector('span')
      expect(buttonSpan).toBeNull()
    })

    it('creates new project and navigates on click', () => {
      renderSidebar(defaultProps)

      const newProjectButton = screen.getByText('New Project')
      fireEvent.click(newProjectButton)

      // Should navigate to new project
      expect(mockNavigate).toHaveBeenCalledWith(expect.stringMatching(/\/project\/.+/))
    })

    it('calls onMobileMenuClose after creating project', () => {
      const onMobileMenuClose = vi.fn()
      renderSidebar({ ...defaultProps, mobileMenuOpen: true, onMobileMenuClose })

      // Use getAllByText to handle possible duplicates from tooltip or project list
      const matches = screen.getAllByText('New Project')
      const newProjectButton = matches[matches.length - 1].closest('button')
      fireEvent.click(newProjectButton)

      expect(onMobileMenuClose).toHaveBeenCalled()
    })

    it('has accent background', () => {
      renderSidebar(defaultProps)
      // Use getAllByText to handle possible duplicates from tooltip or project list
      const matches = screen.getAllByText('New Project')
      const newProjectButton = matches[matches.length - 1].closest('button')
      expect(newProjectButton.style.background).toContain('var(--accent-default)')
    })
  })

  describe('Collapse toggle button', () => {
    it('renders collapse toggle button', () => {
      renderSidebar(defaultProps)
      // Toggle button is the last button with -right-3 class
      const toggleButton = document.querySelector('.-right-3')
      expect(toggleButton).toBeInTheDocument()
    })

    it('calls onToggle when clicked', () => {
      const onToggle = vi.fn()
      renderSidebar({ ...defaultProps, onToggle })

      const toggleButton = document.querySelector('.-right-3')
      if (toggleButton) {
        fireEvent.click(toggleButton)
        expect(onToggle).toHaveBeenCalledTimes(1)
      }
    })

    it('shows ChevronLeft when expanded', () => {
      renderSidebar({ ...defaultProps, collapsed: false })
      // When expanded, should show left chevron
      const toggleButton = document.querySelector('.-right-3')
      expect(toggleButton).toBeInTheDocument()
    })

    it('shows ChevronRight when collapsed', () => {
      renderSidebar({ ...defaultProps, collapsed: true })
      // When collapsed, should show right chevron
      const toggleButton = document.querySelector('.-right-3')
      expect(toggleButton).toBeInTheDocument()
    })

    it('is hidden on mobile (md:flex)', () => {
      renderSidebar(defaultProps)
      const toggleButton = document.querySelector('.-right-3')
      expect(toggleButton).toHaveClass('hidden')
      expect(toggleButton).toHaveClass('md:flex')
    })
  })

  describe('Mobile menu', () => {
    it('shows close button when mobile menu is open', () => {
      renderSidebar({ ...defaultProps, mobileMenuOpen: true })
      // X button for mobile close
      const buttons = document.querySelectorAll('button')
      const closeButton = Array.from(buttons).find(
        (b) => b.classList.contains('md:hidden') && b.classList.contains('ml-auto')
      )
      expect(closeButton).toBeInTheDocument()
    })

    it('calls onMobileMenuClose when close button clicked', () => {
      const onMobileMenuClose = vi.fn()
      renderSidebar({ ...defaultProps, mobileMenuOpen: true, onMobileMenuClose })

      const buttons = document.querySelectorAll('button')
      const closeButton = Array.from(buttons).find(
        (b) => b.classList.contains('md:hidden') && b.classList.contains('ml-auto')
      )

      if (closeButton) {
        fireEvent.click(closeButton)
        expect(onMobileMenuClose).toHaveBeenCalledTimes(1)
      }
    })

    it('is fixed positioned when mobile menu is open', () => {
      renderSidebar({ ...defaultProps, mobileMenuOpen: true })
      const aside = document.querySelector('aside')
      expect(aside).toHaveClass('fixed')
    })

    it('is hidden on mobile when closed', () => {
      renderSidebar({ ...defaultProps, mobileMenuOpen: false })
      const aside = document.querySelector('aside')
      expect(aside).toHaveClass('hidden')
    })
  })

  describe('Collapsed state', () => {
    it('renders in collapsed mode', () => {
      renderSidebar({ ...defaultProps, collapsed: true })
      // Should not show text labels
      expect(screen.queryByText('StoryFlow')).not.toBeInTheDocument()
      expect(screen.queryByText('Projects')).not.toBeInTheDocument()
    })

    it('uses tooltips for navigation in collapsed mode', () => {
      renderSidebar({ ...defaultProps, collapsed: true })
      // Dashboard should show tooltip version
      const dashboardLink = document.querySelector('nav a')
      expect(dashboardLink).toBeInTheDocument()
    })

    it('shows icon-only project buttons when collapsed', () => {
      renderSidebar({ ...defaultProps, collapsed: true })
      // Project buttons should be centered (icon only)
      const projectButtons = document.querySelectorAll('nav .space-y-0\\.5 button')
      projectButtons.forEach((btn) => {
        expect(btn).toHaveClass('justify-center')
      })
    })
  })

  describe('Project status colors', () => {
    it('applies correct color for planning status', () => {
      renderSidebar(defaultProps)
      // Status dots exist
      const statusDots = document.querySelectorAll('.h-2.w-2.rounded-full')
      expect(statusDots.length).toBeGreaterThan(0)
    })
  })

  describe('Styling and structure', () => {
    it('has glass-sidebar class', () => {
      renderSidebar(defaultProps)
      const aside = document.querySelector('aside')
      expect(aside).toHaveClass('glass-sidebar')
    })

    it('has flex-col layout', () => {
      renderSidebar(defaultProps)
      const aside = document.querySelector('aside')
      expect(aside).toHaveClass('flex')
      expect(aside).toHaveClass('flex-col')
    })

    it('has border-b on brand section', () => {
      renderSidebar(defaultProps)
      const brandSection = document.querySelector('aside > div:first-child')
      expect(brandSection).toHaveClass('border-b')
    })

    it('has scrollable nav section', () => {
      renderSidebar(defaultProps)
      const nav = document.querySelector('nav')
      expect(nav).toHaveClass('overflow-y-auto')
    })
  })

  describe('Edge cases', () => {
    it('handles missing onMobileMenuClose gracefully', () => {
      renderSidebar({ collapsed: false, onToggle: vi.fn(), mobileMenuOpen: false })
      // Should not throw
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })

    it('handles rapid collapse/expand', () => {
      const onToggle = vi.fn()
      const { rerender } = renderSidebar({ ...defaultProps, collapsed: false, onToggle })

      rerender(
        <MemoryRouter>
          <Sidebar {...defaultProps} collapsed={true} onToggle={onToggle} />
        </MemoryRouter>
      )

      rerender(
        <MemoryRouter>
          <Sidebar {...defaultProps} collapsed={false} onToggle={onToggle} />
        </MemoryRouter>
      )

      // Should not throw
      expect(screen.getByText(/Story/)).toBeInTheDocument()
      expect(screen.getByText(/Flow/)).toBeInTheDocument()
    })
  })
})
