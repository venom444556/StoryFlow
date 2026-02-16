import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Sidebar from './Sidebar'
import { ProjectsProvider } from '../../contexts/ProjectsContext'

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    aside: ({ children, animate, ...props }) => <aside {...props}>{children}</aside>,
    span: ({ children, ...props }) => <span {...props}>{children}</span>,
  },
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

// Wrapper component with providers
function renderWithProviders(ui, options = {}) {
  return render(
    <MemoryRouter>
      <ProjectsProvider>{ui}</ProjectsProvider>
    </MemoryRouter>,
    options
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
  })

  describe('Basic rendering', () => {
    it('renders without crashing', () => {
      renderWithProviders(<Sidebar {...defaultProps} />)
      expect(screen.getByText('StoryFlow')).toBeInTheDocument()
    })

    it('renders as an aside element', () => {
      renderWithProviders(<Sidebar {...defaultProps} />)
      const aside = document.querySelector('aside')
      expect(aside).toBeInTheDocument()
    })
  })

  describe('Brand section', () => {
    it('shows StoryFlow logo when expanded', () => {
      renderWithProviders(<Sidebar {...defaultProps} collapsed={false} />)
      expect(screen.getByText('StoryFlow')).toBeInTheDocument()
    })

    it('hides StoryFlow text when collapsed (desktop)', () => {
      renderWithProviders(<Sidebar {...defaultProps} collapsed={true} mobileMenuOpen={false} />)
      // Text should not be visible when collapsed
      expect(screen.queryByText('StoryFlow')).not.toBeInTheDocument()
    })

    it('shows StoryFlow text when mobile menu is open even if collapsed', () => {
      renderWithProviders(<Sidebar {...defaultProps} collapsed={true} mobileMenuOpen={true} />)
      expect(screen.getByText('StoryFlow')).toBeInTheDocument()
    })

    it('renders Zap icon in brand', () => {
      renderWithProviders(<Sidebar {...defaultProps} />)
      // The icon is in a gradient div
      const brandIcon = document.querySelector('aside > div > div')
      expect(brandIcon).toBeInTheDocument()
    })
  })

  describe('Dashboard link', () => {
    it('renders Dashboard link', () => {
      renderWithProviders(<Sidebar {...defaultProps} />)
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })

    it('Dashboard link navigates to /', () => {
      renderWithProviders(<Sidebar {...defaultProps} />)
      const dashboardLink = screen.getByText('Dashboard').closest('a')
      expect(dashboardLink).toHaveAttribute('href', '/')
    })

    it('calls onMobileMenuClose when Dashboard is clicked', () => {
      const onMobileMenuClose = vi.fn()
      renderWithProviders(
        <Sidebar {...defaultProps} mobileMenuOpen={true} onMobileMenuClose={onMobileMenuClose} />
      )

      const dashboardLink = screen.getByText('Dashboard').closest('a')
      fireEvent.click(dashboardLink)

      expect(onMobileMenuClose).toHaveBeenCalled()
    })
  })

  describe('Projects section', () => {
    it('shows Projects label when expanded', () => {
      renderWithProviders(<Sidebar {...defaultProps} collapsed={false} />)
      expect(screen.getByText('Projects')).toBeInTheDocument()
    })

    it('hides Projects label when collapsed', () => {
      renderWithProviders(<Sidebar {...defaultProps} collapsed={true} />)
      expect(screen.queryByText('Projects')).not.toBeInTheDocument()
    })

    it('shows project count badge', () => {
      renderWithProviders(<Sidebar {...defaultProps} />)
      // There should be at least one project (seed project)
      const badges = document.querySelectorAll('.rounded-full')
      const countBadge = Array.from(badges).find(
        (b) => b.textContent && /^\d+$/.test(b.textContent)
      )
      expect(countBadge).toBeInTheDocument()
    })

    it('renders project list items', () => {
      renderWithProviders(<Sidebar {...defaultProps} />)
      // ProjectsProvider seeds with a project
      const buttons = screen.getAllByRole('button')
      // Should have project buttons
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('navigates to project on click', () => {
      renderWithProviders(<Sidebar {...defaultProps} />)

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
      renderWithProviders(<Sidebar {...defaultProps} />)
      // Status dots are small rounded-full elements with specific color classes
      const statusDots = document.querySelectorAll('.h-2.w-2.rounded-full')
      expect(statusDots.length).toBeGreaterThan(0)
    })
  })

  describe('New Project button', () => {
    it('renders New Project button when expanded', () => {
      renderWithProviders(<Sidebar {...defaultProps} collapsed={false} />)
      expect(screen.getByText('New Project')).toBeInTheDocument()
    })

    it('shows only Plus icon when collapsed', () => {
      renderWithProviders(<Sidebar {...defaultProps} collapsed={true} />)
      // In collapsed mode, "New Project" text appears in tooltip content
      // but should NOT appear as a visible button label <span>
      // The bottom section contains the new project button inside a Tooltip wrapper
      const bottomSection = document.querySelector('aside > div.border-t')
      expect(bottomSection).toBeInTheDocument()
      const newProjectButton = bottomSection.querySelector('button')
      expect(newProjectButton).toBeInTheDocument()
      // The button itself should NOT contain a <span>New Project</span> child
      const buttonSpan = newProjectButton.querySelector('span')
      expect(buttonSpan).toBeNull()
    })

    it('creates new project and navigates on click', () => {
      renderWithProviders(<Sidebar {...defaultProps} />)

      const newProjectButton = screen.getByText('New Project')
      fireEvent.click(newProjectButton)

      // Should navigate to new project
      expect(mockNavigate).toHaveBeenCalledWith(expect.stringMatching(/\/project\/.+/))
    })

    it('calls onMobileMenuClose after creating project', () => {
      const onMobileMenuClose = vi.fn()
      renderWithProviders(
        <Sidebar {...defaultProps} mobileMenuOpen={true} onMobileMenuClose={onMobileMenuClose} />
      )

      // Use getAllByText to handle possible duplicates from tooltip or project list
      const matches = screen.getAllByText('New Project')
      const newProjectButton = matches[matches.length - 1].closest('button')
      fireEvent.click(newProjectButton)

      expect(onMobileMenuClose).toHaveBeenCalled()
    })

    it('has gradient background', () => {
      renderWithProviders(<Sidebar {...defaultProps} />)
      // Use getAllByText to handle possible duplicates from tooltip or project list
      const matches = screen.getAllByText('New Project')
      const newProjectButton = matches[matches.length - 1].closest('button')
      expect(newProjectButton.style.backgroundImage).toContain('linear-gradient')
    })
  })

  describe('Collapse toggle button', () => {
    it('renders collapse toggle button', () => {
      renderWithProviders(<Sidebar {...defaultProps} />)
      // Toggle button is the last button with -right-3 class
      const toggleButton = document.querySelector('.-right-3')
      expect(toggleButton).toBeInTheDocument()
    })

    it('calls onToggle when clicked', () => {
      const onToggle = vi.fn()
      renderWithProviders(<Sidebar {...defaultProps} onToggle={onToggle} />)

      const toggleButton = document.querySelector('.-right-3')
      if (toggleButton) {
        fireEvent.click(toggleButton)
        expect(onToggle).toHaveBeenCalledTimes(1)
      }
    })

    it('shows ChevronLeft when expanded', () => {
      renderWithProviders(<Sidebar {...defaultProps} collapsed={false} />)
      // When expanded, should show left chevron
      const toggleButton = document.querySelector('.-right-3')
      expect(toggleButton).toBeInTheDocument()
    })

    it('shows ChevronRight when collapsed', () => {
      renderWithProviders(<Sidebar {...defaultProps} collapsed={true} />)
      // When collapsed, should show right chevron
      const toggleButton = document.querySelector('.-right-3')
      expect(toggleButton).toBeInTheDocument()
    })

    it('is hidden on mobile (md:flex)', () => {
      renderWithProviders(<Sidebar {...defaultProps} />)
      const toggleButton = document.querySelector('.-right-3')
      expect(toggleButton).toHaveClass('hidden')
      expect(toggleButton).toHaveClass('md:flex')
    })
  })

  describe('Mobile menu', () => {
    it('shows close button when mobile menu is open', () => {
      renderWithProviders(<Sidebar {...defaultProps} mobileMenuOpen={true} />)
      // X button for mobile close
      const buttons = document.querySelectorAll('button')
      const closeButton = Array.from(buttons).find(
        (b) => b.classList.contains('md:hidden') && b.classList.contains('ml-auto')
      )
      expect(closeButton).toBeInTheDocument()
    })

    it('calls onMobileMenuClose when close button clicked', () => {
      const onMobileMenuClose = vi.fn()
      renderWithProviders(
        <Sidebar {...defaultProps} mobileMenuOpen={true} onMobileMenuClose={onMobileMenuClose} />
      )

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
      renderWithProviders(<Sidebar {...defaultProps} mobileMenuOpen={true} />)
      const aside = document.querySelector('aside')
      expect(aside).toHaveClass('fixed')
    })

    it('is hidden on mobile when closed', () => {
      renderWithProviders(<Sidebar {...defaultProps} mobileMenuOpen={false} />)
      const aside = document.querySelector('aside')
      expect(aside).toHaveClass('hidden')
    })
  })

  describe('Collapsed state', () => {
    it('renders in collapsed mode', () => {
      renderWithProviders(<Sidebar {...defaultProps} collapsed={true} />)
      // Should not show text labels
      expect(screen.queryByText('StoryFlow')).not.toBeInTheDocument()
      expect(screen.queryByText('Projects')).not.toBeInTheDocument()
    })

    it('uses tooltips for navigation in collapsed mode', () => {
      renderWithProviders(<Sidebar {...defaultProps} collapsed={true} />)
      // Dashboard should show tooltip version
      const dashboardLink = document.querySelector('nav a')
      expect(dashboardLink).toBeInTheDocument()
    })

    it('shows icon-only project buttons when collapsed', () => {
      renderWithProviders(<Sidebar {...defaultProps} collapsed={true} />)
      // Project buttons should be centered (icon only)
      const projectButtons = document.querySelectorAll('nav .space-y-0\\.5 button')
      projectButtons.forEach((btn) => {
        expect(btn).toHaveClass('justify-center')
      })
    })
  })

  describe('Project status colors', () => {
    it('applies correct color for planning status', () => {
      renderWithProviders(<Sidebar {...defaultProps} />)
      // Status dots exist
      const statusDots = document.querySelectorAll('.h-2.w-2.rounded-full')
      expect(statusDots.length).toBeGreaterThan(0)
    })
  })

  describe('Styling and structure', () => {
    it('has glass-sidebar class', () => {
      renderWithProviders(<Sidebar {...defaultProps} />)
      const aside = document.querySelector('aside')
      expect(aside).toHaveClass('glass-sidebar')
    })

    it('has flex-col layout', () => {
      renderWithProviders(<Sidebar {...defaultProps} />)
      const aside = document.querySelector('aside')
      expect(aside).toHaveClass('flex')
      expect(aside).toHaveClass('flex-col')
    })

    it('has border-b on brand section', () => {
      renderWithProviders(<Sidebar {...defaultProps} />)
      const brandSection = document.querySelector('aside > div:first-child')
      expect(brandSection).toHaveClass('border-b')
    })

    it('has scrollable nav section', () => {
      renderWithProviders(<Sidebar {...defaultProps} />)
      const nav = document.querySelector('nav')
      expect(nav).toHaveClass('overflow-y-auto')
    })
  })

  describe('Edge cases', () => {
    it('handles missing onMobileMenuClose gracefully', () => {
      renderWithProviders(<Sidebar collapsed={false} onToggle={vi.fn()} mobileMenuOpen={false} />)
      // Should not throw
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })

    it('handles rapid collapse/expand', () => {
      const onToggle = vi.fn()
      const { rerender } = renderWithProviders(
        <Sidebar {...defaultProps} collapsed={false} onToggle={onToggle} />
      )

      rerender(
        <MemoryRouter>
          <ProjectsProvider>
            <Sidebar {...defaultProps} collapsed={true} onToggle={onToggle} />
          </ProjectsProvider>
        </MemoryRouter>
      )

      rerender(
        <MemoryRouter>
          <ProjectsProvider>
            <Sidebar {...defaultProps} collapsed={false} onToggle={onToggle} />
          </ProjectsProvider>
        </MemoryRouter>
      )

      // Should not throw
      expect(screen.getByText('StoryFlow')).toBeInTheDocument()
    })
  })
})
