import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import QuickCreateBar from './QuickCreateBar'

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}))

describe('QuickCreateBar', () => {
  let mockOnCreateIssue

  beforeEach(() => {
    mockOnCreateIssue = vi.fn()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('renders without crashing', () => {
      render(<QuickCreateBar onCreateIssue={mockOnCreateIssue} />)
      expect(screen.getByPlaceholderText('Create issue...')).toBeInTheDocument()
    })

    it('renders input field', () => {
      render(<QuickCreateBar onCreateIssue={mockOnCreateIssue} />)
      const input = screen.getByPlaceholderText('Create issue...')
      expect(input).toBeInTheDocument()
      expect(input).toHaveAttribute('type', 'text')
    })

    it('renders type selector button', () => {
      render(<QuickCreateBar onCreateIssue={mockOnCreateIssue} />)
      // Should show task type icon by default
      expect(screen.getByTitle('Task')).toBeInTheDocument()
    })
  })

  describe('Input Behavior', () => {
    it('updates input value on type', async () => {
      render(<QuickCreateBar onCreateIssue={mockOnCreateIssue} />)
      const input = screen.getByPlaceholderText('Create issue...')

      await userEvent.type(input, 'New issue')
      expect(input).toHaveValue('New issue')
    })

    it('clears input after submission', async () => {
      render(<QuickCreateBar onCreateIssue={mockOnCreateIssue} />)
      const input = screen.getByPlaceholderText('Create issue...')

      await userEvent.type(input, 'New issue{enter}')
      expect(input).toHaveValue('')
    })

    it('clears input on Escape key', async () => {
      render(<QuickCreateBar onCreateIssue={mockOnCreateIssue} />)
      const input = screen.getByPlaceholderText('Create issue...')

      await userEvent.type(input, 'New issue')
      fireEvent.keyDown(input, { key: 'Escape' })
      expect(input).toHaveValue('')
    })
  })

  describe('Issue Creation', () => {
    it('creates issue on Enter key press', async () => {
      render(<QuickCreateBar onCreateIssue={mockOnCreateIssue} />)
      const input = screen.getByPlaceholderText('Create issue...')

      await userEvent.type(input, 'New issue{enter}')

      expect(mockOnCreateIssue).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'New issue',
          type: 'task',
          status: 'To Do',
          priority: 'medium',
        })
      )
    })

    it('does not create issue when input is empty', async () => {
      render(<QuickCreateBar onCreateIssue={mockOnCreateIssue} />)
      const input = screen.getByPlaceholderText('Create issue...')

      fireEvent.keyDown(input, { key: 'Enter' })

      expect(mockOnCreateIssue).not.toHaveBeenCalled()
    })

    it('does not create issue when input is only whitespace', async () => {
      render(<QuickCreateBar onCreateIssue={mockOnCreateIssue} />)
      const input = screen.getByPlaceholderText('Create issue...')

      await userEvent.type(input, '   ')
      fireEvent.keyDown(input, { key: 'Enter' })

      expect(mockOnCreateIssue).not.toHaveBeenCalled()
    })

    it('trims whitespace from issue title', async () => {
      render(<QuickCreateBar onCreateIssue={mockOnCreateIssue} />)
      const input = screen.getByPlaceholderText('Create issue...')

      await userEvent.type(input, '  New issue  {enter}')

      expect(mockOnCreateIssue).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'New issue',
        })
      )
    })

    it('uses defaultStatus prop', async () => {
      render(<QuickCreateBar onCreateIssue={mockOnCreateIssue} defaultStatus="In Progress" />)
      const input = screen.getByPlaceholderText('Create issue...')

      await userEvent.type(input, 'New issue{enter}')

      expect(mockOnCreateIssue).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'In Progress',
        })
      )
    })

    it('includes all default issue properties', async () => {
      render(<QuickCreateBar onCreateIssue={mockOnCreateIssue} />)
      const input = screen.getByPlaceholderText('Create issue...')

      await userEvent.type(input, 'New issue{enter}')

      expect(mockOnCreateIssue).toHaveBeenCalledWith({
        title: 'New issue',
        type: 'task',
        status: 'To Do',
        priority: 'medium',
        description: '',
        storyPoints: null,
        epicId: null,
        sprintId: null,
        assignee: null,
        labels: [],
        subtasks: [],
        comments: [],
        dependencies: [],
      })
    })
  })

  describe('Type Selection', () => {
    it('opens type menu on click', async () => {
      render(<QuickCreateBar onCreateIssue={mockOnCreateIssue} />)

      const typeButton = screen.getByTitle('Task').parentElement
      fireEvent.click(typeButton)

      await waitFor(() => {
        expect(screen.getByText('Epic')).toBeInTheDocument()
        expect(screen.getByText('Story')).toBeInTheDocument()
        expect(screen.getByText('Bug')).toBeInTheDocument()
      })
    })

    it('changes issue type when selecting from menu', async () => {
      render(<QuickCreateBar onCreateIssue={mockOnCreateIssue} />)

      // Open type menu
      const typeButton = screen.getByTitle('Task').parentElement
      fireEvent.click(typeButton)

      // Select bug type
      await waitFor(() => {
        expect(screen.getByText('Bug')).toBeInTheDocument()
      })
      fireEvent.click(screen.getByText('Bug'))

      // Create issue
      const input = screen.getByPlaceholderText('Create issue...')
      await userEvent.type(input, 'Bug issue{enter}')

      expect(mockOnCreateIssue).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'bug',
        })
      )
    })

    it('closes type menu after selection', async () => {
      render(<QuickCreateBar onCreateIssue={mockOnCreateIssue} />)

      const typeButton = screen.getByTitle('Task').parentElement
      fireEvent.click(typeButton)

      await waitFor(() => {
        expect(screen.getByText('Epic')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('Epic'))

      await waitFor(() => {
        // Menu should close, so Story should not be in the list anymore
        expect(screen.queryAllByText('Story')).toHaveLength(0)
      })
    })
  })

  describe('Submit Button', () => {
    it('shows submit button when input has text', async () => {
      render(<QuickCreateBar onCreateIssue={mockOnCreateIssue} />)
      const input = screen.getByPlaceholderText('Create issue...')

      await userEvent.type(input, 'New issue')

      // Submit button should appear (Plus icon button)
      const submitButtons = screen.getAllByRole('button')
      expect(submitButtons.length).toBeGreaterThanOrEqual(2)
    })

    it('creates issue when clicking submit button', async () => {
      render(<QuickCreateBar onCreateIssue={mockOnCreateIssue} />)
      const input = screen.getByPlaceholderText('Create issue...')

      await userEvent.type(input, 'New issue')

      // Find and click the submit button (the one that appears after typing)
      const buttons = screen.getAllByRole('button')
      const submitButton = buttons[buttons.length - 1]
      fireEvent.click(submitButton)

      expect(mockOnCreateIssue).toHaveBeenCalled()
    })
  })

  describe('Focus State', () => {
    it('applies focus styling when input is focused', async () => {
      const { container } = render(<QuickCreateBar onCreateIssue={mockOnCreateIssue} />)
      const input = screen.getByPlaceholderText('Create issue...')

      fireEvent.focus(input)

      // The container should have focus styling applied (border via inline style)
      const wrapper = container.firstChild
      expect(wrapper.style.borderColor).toBeTruthy()
    })

    it('removes focus styling when input is blurred', async () => {
      const { container } = render(<QuickCreateBar onCreateIssue={mockOnCreateIssue} />)
      const input = screen.getByPlaceholderText('Create issue...')

      fireEvent.focus(input)
      fireEvent.blur(input)

      const wrapper = container.firstChild
      expect(wrapper).not.toHaveClass('bg-white/[0.06]')
    })
  })

  describe('Reset After Creation', () => {
    it('resets type to task after creating an issue', async () => {
      render(<QuickCreateBar onCreateIssue={mockOnCreateIssue} />)

      // Change type to epic
      const typeButton = screen.getByTitle('Task').parentElement
      fireEvent.click(typeButton)
      await waitFor(() => {
        expect(screen.getByText('Epic')).toBeInTheDocument()
      })
      fireEvent.click(screen.getByText('Epic'))

      // Create issue
      const input = screen.getByPlaceholderText('Create issue...')
      await userEvent.type(input, 'Epic issue{enter}')

      // Type should reset to task
      expect(screen.getByTitle('Task')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles rapid submissions gracefully', async () => {
      render(<QuickCreateBar onCreateIssue={mockOnCreateIssue} />)
      const input = screen.getByPlaceholderText('Create issue...')

      await userEvent.type(input, 'Issue 1{enter}')
      await userEvent.type(input, 'Issue 2{enter}')
      await userEvent.type(input, 'Issue 3{enter}')

      expect(mockOnCreateIssue).toHaveBeenCalledTimes(3)
    })

    it('handles special characters in title', async () => {
      render(<QuickCreateBar onCreateIssue={mockOnCreateIssue} />)
      const input = screen.getByPlaceholderText('Create issue...')

      await userEvent.type(input, 'Issue with <special> & "chars"{enter}')

      expect(mockOnCreateIssue).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Issue with <special> & "chars"',
        })
      )
    })
  })
})
