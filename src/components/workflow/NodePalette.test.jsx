import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import NodePalette from './NodePalette'

// Mock framer-motion with ref forwarding so panelRef works
vi.mock('framer-motion', async () => {
  const React = await import('react')
  const MotionDiv = React.forwardRef(({ children, ...props }, ref) => (
    <div ref={ref} {...props}>
      {children}
    </div>
  ))
  MotionDiv.displayName = 'MotionDiv'
  return {
    motion: { div: MotionDiv },
    AnimatePresence: ({ children }) => <>{children}</>,
  }
})

describe('NodePalette', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onSelect: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // ---------------------------------------------------------------------------
  // Basic Rendering
  // ---------------------------------------------------------------------------

  describe('basic rendering', () => {
    it('renders nothing when isOpen is false', () => {
      render(<NodePalette {...defaultProps} isOpen={false} />)
      expect(screen.queryByText('Choose a Node Type')).not.toBeInTheDocument()
    })

    it('renders the palette when isOpen is true', () => {
      render(<NodePalette {...defaultProps} />)
      expect(screen.getByText('Choose a Node Type')).toBeInTheDocument()
    })

    it('renders all node types', () => {
      render(<NodePalette {...defaultProps} />)

      expect(screen.getByText('Start')).toBeInTheDocument()
      expect(screen.getByText('End')).toBeInTheDocument()
      expect(screen.getByText('Phase')).toBeInTheDocument()
      expect(screen.getByText('Task')).toBeInTheDocument()
      expect(screen.getByText('Milestone')).toBeInTheDocument()
      expect(screen.getByText('Decision')).toBeInTheDocument()
      expect(screen.getByText('API Call')).toBeInTheDocument()
      expect(screen.getByText('Database')).toBeInTheDocument()
      expect(screen.getByText('Code Logic')).toBeInTheDocument()
    })

    it('displays descriptions for each node type', () => {
      render(<NodePalette {...defaultProps} />)

      expect(
        screen.getByText('Entry point for the workflow. Every workflow needs one.')
      ).toBeInTheDocument()
      expect(
        screen.getByText('Marks the successful completion of a workflow path.')
      ).toBeInTheDocument()
      expect(
        screen.getByText('A high-level phase grouping multiple tasks together.')
      ).toBeInTheDocument()
      expect(screen.getByText('An individual unit of work to be completed.')).toBeInTheDocument()
      expect(
        screen.getByText('A key checkpoint or deliverable in the workflow.')
      ).toBeInTheDocument()
      expect(
        screen.getByText('Conditional branching point with if/else logic.')
      ).toBeInTheDocument()
      expect(
        screen.getByText('Execute an HTTP request to an external service.')
      ).toBeInTheDocument()
      expect(screen.getByText('Read or write data to a database.')).toBeInTheDocument()
      expect(
        screen.getByText('Run custom data transformation or business logic.')
      ).toBeInTheDocument()
    })
  })

  // ---------------------------------------------------------------------------
  // Selection Behavior
  // ---------------------------------------------------------------------------

  describe('selection behavior', () => {
    it('calls onSelect with node type definition when Start is clicked', () => {
      render(<NodePalette {...defaultProps} />)

      fireEvent.click(screen.getByText('Start'))

      expect(defaultProps.onSelect).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'start',
          label: 'Start',
          icon: 'Play',
          color: '#22c55e',
        })
      )
    })

    it('calls onSelect with node type definition when End is clicked', () => {
      render(<NodePalette {...defaultProps} />)

      fireEvent.click(screen.getByText('End'))

      expect(defaultProps.onSelect).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'end',
          label: 'End',
          icon: 'Square',
          color: '#ef4444',
        })
      )
    })

    it('calls onSelect with node type definition when Phase is clicked', () => {
      render(<NodePalette {...defaultProps} />)

      fireEvent.click(screen.getByText('Phase'))

      expect(defaultProps.onSelect).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'phase',
          label: 'Phase',
          icon: 'Layers',
          color: '#6366f1',
        })
      )
    })

    it('calls onSelect with node type definition when Task is clicked', () => {
      render(<NodePalette {...defaultProps} />)

      fireEvent.click(screen.getByText('Task'))

      expect(defaultProps.onSelect).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'task',
          label: 'Task',
          icon: 'CheckSquare',
          color: '#3b82f6',
        })
      )
    })

    it('calls onSelect with node type definition when Milestone is clicked', () => {
      render(<NodePalette {...defaultProps} />)

      fireEvent.click(screen.getByText('Milestone'))

      expect(defaultProps.onSelect).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'milestone',
          label: 'Milestone',
          icon: 'Flag',
          color: '#f59e0b',
        })
      )
    })

    it('calls onSelect with node type definition when Decision is clicked', () => {
      render(<NodePalette {...defaultProps} />)

      fireEvent.click(screen.getByText('Decision'))

      expect(defaultProps.onSelect).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'decision',
          label: 'Decision',
          icon: 'GitBranch',
          color: '#8b5cf6',
        })
      )
    })

    it('calls onSelect with node type definition when API Call is clicked', () => {
      render(<NodePalette {...defaultProps} />)

      fireEvent.click(screen.getByText('API Call'))

      expect(defaultProps.onSelect).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'api',
          label: 'API Call',
          icon: 'Globe',
          color: '#0ea5e9',
        })
      )
    })

    it('calls onSelect with node type definition when Database is clicked', () => {
      render(<NodePalette {...defaultProps} />)

      fireEvent.click(screen.getByText('Database'))

      expect(defaultProps.onSelect).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'database',
          label: 'Database',
          icon: 'Database',
          color: '#14b8a6',
        })
      )
    })

    it('calls onSelect with node type definition when Code Logic is clicked', () => {
      render(<NodePalette {...defaultProps} />)

      fireEvent.click(screen.getByText('Code Logic'))

      expect(defaultProps.onSelect).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'code',
          label: 'Code Logic',
          icon: 'Code',
          color: '#a855f7',
        })
      )
    })
  })

  // ---------------------------------------------------------------------------
  // Close Behavior
  // ---------------------------------------------------------------------------

  describe('close behavior', () => {
    it('closes on click outside', async () => {
      render(
        <div>
          <div data-testid="outside">Outside</div>
          <NodePalette {...defaultProps} />
        </div>
      )

      // Wait for the deferred event listener to be attached
      await new Promise((resolve) => setTimeout(resolve, 10))

      fireEvent.mouseDown(screen.getByTestId('outside'))

      await waitFor(() => {
        expect(defaultProps.onClose).toHaveBeenCalled()
      })
    })

    it('does not close when clicking inside palette', async () => {
      render(<NodePalette {...defaultProps} />)

      // Wait for the deferred event listener
      await new Promise((resolve) => setTimeout(resolve, 10))

      const palette = screen.getByText('Choose a Node Type').closest('div[class*="absolute"]')
      fireEvent.mouseDown(palette)

      // onClose should not have been called from outside click handler
      expect(defaultProps.onClose).not.toHaveBeenCalled()
    })
  })

  // ---------------------------------------------------------------------------
  // Layout
  // ---------------------------------------------------------------------------

  describe('layout', () => {
    it('renders node types in a grid layout', () => {
      const { container } = render(<NodePalette {...defaultProps} />)

      const grid = container.querySelector('.grid-cols-3')
      expect(grid).toBeInTheDocument()
    })

    it('renders 9 node type buttons', () => {
      render(<NodePalette {...defaultProps} />)

      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBe(9)
    })
  })

  // ---------------------------------------------------------------------------
  // Edge Cases
  // ---------------------------------------------------------------------------

  describe('edge cases', () => {
    it('handles undefined onSelect gracefully', () => {
      render(<NodePalette isOpen={true} onClose={vi.fn()} onSelect={undefined} />)

      // Should not throw when clicking
      fireEvent.click(screen.getByText('Start'))
    })

    it('handles undefined onClose gracefully', () => {
      render(<NodePalette isOpen={true} onClose={undefined} onSelect={vi.fn()} />)

      // Component should still render
      expect(screen.getByText('Choose a Node Type')).toBeInTheDocument()
    })

    it('handles rapid clicks', () => {
      render(<NodePalette {...defaultProps} />)

      fireEvent.click(screen.getByText('Start'))
      fireEvent.click(screen.getByText('End'))
      fireEvent.click(screen.getByText('Task'))

      expect(defaultProps.onSelect).toHaveBeenCalledTimes(3)
    })
  })

  // ---------------------------------------------------------------------------
  // Accessibility
  // ---------------------------------------------------------------------------

  describe('accessibility', () => {
    it('uses buttons for node type selection', () => {
      render(<NodePalette {...defaultProps} />)

      const buttons = screen.getAllByRole('button')
      buttons.forEach((button) => {
        expect(button.tagName).toBe('BUTTON')
      })
    })
  })
})
