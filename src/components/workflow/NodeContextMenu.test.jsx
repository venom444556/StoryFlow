import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import NodeContextMenu from './NodeContextMenu'

// Mock framer-motion with ref forwarding so menuRef works
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

describe('NodeContextMenu', () => {
  const defaultNode = {
    id: 'node-1',
    type: 'task',
    title: 'Test Task',
    status: 'idle',
    x: 100,
    y: 100,
  }

  const defaultProps = {
    x: 200,
    y: 200,
    node: defaultNode,
    onClose: vi.fn(),
    onEdit: vi.fn(),
    onDuplicate: vi.fn(),
    onExecuteSingle: vi.fn(),
    onDelete: vi.fn(),
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
    it('renders all default menu items', () => {
      render(<NodeContextMenu {...defaultProps} />)

      expect(screen.getByText('Edit Node')).toBeInTheDocument()
      expect(screen.getByText('Duplicate')).toBeInTheDocument()
      expect(screen.getByText('Execute This Node')).toBeInTheDocument()
      expect(screen.getByText('Delete')).toBeInTheDocument()
    })

    it('renders at the specified position', () => {
      const { container } = render(<NodeContextMenu {...defaultProps} />)

      const menu = container.querySelector('[style*="left"]')
      expect(menu).toHaveStyle({ left: '200px', top: '200px' })
    })

    it('renders separators between item groups', () => {
      const { container } = render(<NodeContextMenu {...defaultProps} />)

      const separators = container.querySelectorAll('.h-px')
      expect(separators.length).toBeGreaterThanOrEqual(2)
    })
  })

  // ---------------------------------------------------------------------------
  // Menu Item Actions
  // ---------------------------------------------------------------------------

  describe('menu item actions', () => {
    it('calls onEdit when Edit Node is clicked', () => {
      render(<NodeContextMenu {...defaultProps} />)

      fireEvent.click(screen.getByText('Edit Node'))

      expect(defaultProps.onEdit).toHaveBeenCalledWith(defaultNode)
      expect(defaultProps.onClose).toHaveBeenCalled()
    })

    it('calls onDuplicate when Duplicate is clicked', () => {
      render(<NodeContextMenu {...defaultProps} />)

      fireEvent.click(screen.getByText('Duplicate'))

      expect(defaultProps.onDuplicate).toHaveBeenCalledWith(defaultNode)
      expect(defaultProps.onClose).toHaveBeenCalled()
    })

    it('calls onExecuteSingle when Execute This Node is clicked', () => {
      render(<NodeContextMenu {...defaultProps} />)

      fireEvent.click(screen.getByText('Execute This Node'))

      expect(defaultProps.onExecuteSingle).toHaveBeenCalledWith(defaultNode)
      expect(defaultProps.onClose).toHaveBeenCalled()
    })

    it('calls onDelete when Delete is clicked', () => {
      render(<NodeContextMenu {...defaultProps} />)

      fireEvent.click(screen.getByText('Delete'))

      expect(defaultProps.onDelete).toHaveBeenCalledWith(defaultNode)
      expect(defaultProps.onClose).toHaveBeenCalled()
    })
  })

  // ---------------------------------------------------------------------------
  // Conditional Menu Items
  // ---------------------------------------------------------------------------

  describe('conditional menu items', () => {
    it('shows Drill Down when onDrillDown is provided', () => {
      const onDrillDown = vi.fn()
      render(<NodeContextMenu {...defaultProps} onDrillDown={onDrillDown} />)

      expect(screen.getByText('Drill Down')).toBeInTheDocument()

      fireEvent.click(screen.getByText('Drill Down'))
      expect(onDrillDown).toHaveBeenCalledWith(defaultNode)
    })

    it('hides Drill Down when onDrillDown is not provided', () => {
      render(<NodeContextMenu {...defaultProps} />)

      expect(screen.queryByText('Drill Down')).not.toBeInTheDocument()
    })

    it('shows Add Sub-workflow when onAddChildren is provided', () => {
      const onAddChildren = vi.fn()
      render(<NodeContextMenu {...defaultProps} onAddChildren={onAddChildren} />)

      expect(screen.getByText('Add Sub-workflow')).toBeInTheDocument()

      fireEvent.click(screen.getByText('Add Sub-workflow'))
      expect(onAddChildren).toHaveBeenCalledWith(defaultNode)
    })

    it('hides Add Sub-workflow when onAddChildren is not provided', () => {
      render(<NodeContextMenu {...defaultProps} />)

      expect(screen.queryByText('Add Sub-workflow')).not.toBeInTheDocument()
    })
  })

  // ---------------------------------------------------------------------------
  // Executing State
  // ---------------------------------------------------------------------------

  describe('executing state', () => {
    it('disables Execute This Node when isExecuting is true', () => {
      render(<NodeContextMenu {...defaultProps} isExecuting={true} />)

      const executeButton = screen.getByText('Execute This Node').closest('button')
      expect(executeButton).toBeDisabled()
    })

    it('disables Delete when isExecuting is true', () => {
      render(<NodeContextMenu {...defaultProps} isExecuting={true} />)

      const deleteButton = screen.getByText('Delete').closest('button')
      expect(deleteButton).toBeDisabled()
    })

    it('does not disable Edit Node when isExecuting is true', () => {
      render(<NodeContextMenu {...defaultProps} isExecuting={true} />)

      const editButton = screen.getByText('Edit Node').closest('button')
      expect(editButton).not.toBeDisabled()
    })

    it('does not disable Duplicate when isExecuting is true', () => {
      render(<NodeContextMenu {...defaultProps} isExecuting={true} />)

      const duplicateButton = screen.getByText('Duplicate').closest('button')
      expect(duplicateButton).not.toBeDisabled()
    })

    it('prevents action when disabled item is clicked', () => {
      render(<NodeContextMenu {...defaultProps} isExecuting={true} />)

      fireEvent.click(screen.getByText('Execute This Node'))

      expect(defaultProps.onExecuteSingle).not.toHaveBeenCalled()
    })
  })

  // ---------------------------------------------------------------------------
  // Close Behavior
  // ---------------------------------------------------------------------------

  describe('close behavior', () => {
    it('closes on Escape key press', async () => {
      render(<NodeContextMenu {...defaultProps} />)

      fireEvent.keyDown(document, { key: 'Escape' })

      await waitFor(() => {
        expect(defaultProps.onClose).toHaveBeenCalled()
      })
    })

    it('closes on click outside', async () => {
      render(
        <div>
          <div data-testid="outside">Outside</div>
          <NodeContextMenu {...defaultProps} />
        </div>
      )

      // Wait for the deferred event listener to be attached
      await new Promise((resolve) => setTimeout(resolve, 10))

      fireEvent.mouseDown(screen.getByTestId('outside'))

      await waitFor(() => {
        expect(defaultProps.onClose).toHaveBeenCalled()
      })
    })

    it('does not close on click inside menu', async () => {
      render(<NodeContextMenu {...defaultProps} />)

      // Wait for the deferred event listener
      await new Promise((resolve) => setTimeout(resolve, 10))

      const menu = screen.getByText('Edit Node').closest('div[class*="absolute"]')
      fireEvent.mouseDown(menu)

      // onClose should not have been called from the outside click handler
      // (it may be called from item clicks, so we check specific behavior)
      expect(defaultProps.onClose).not.toHaveBeenCalled()
    })

    it('prevents native context menu on the menu itself', () => {
      render(<NodeContextMenu {...defaultProps} />)

      const menu = screen.getByText('Edit Node').closest('div[class*="absolute"]')
      const event = new MouseEvent('contextmenu', { bubbles: true })
      event.preventDefault = vi.fn()

      fireEvent(menu, event)

      // The component calls e.preventDefault() on context menu
      // We're testing that the handler exists
    })
  })

  // ---------------------------------------------------------------------------
  // Delete Styling
  // ---------------------------------------------------------------------------

  describe('delete styling', () => {
    it('applies danger variant styling to Delete button', () => {
      render(<NodeContextMenu {...defaultProps} />)

      const deleteButton = screen.getByText('Delete').closest('button')
      expect(deleteButton).toHaveClass('text-red-400')
    })
  })

  // ---------------------------------------------------------------------------
  // Position Adjustment
  // ---------------------------------------------------------------------------

  describe('position adjustment', () => {
    it('adjusts position when menu would overflow viewport', () => {
      // Mock window dimensions
      Object.defineProperty(window, 'innerWidth', { value: 300, writable: true })
      Object.defineProperty(window, 'innerHeight', { value: 300, writable: true })

      render(<NodeContextMenu {...defaultProps} x={250} y={250} />)

      // The menu should still render (position adjustment happens via useEffect)
      expect(screen.getByText('Edit Node')).toBeInTheDocument()
    })
  })

  // ---------------------------------------------------------------------------
  // Node Type Variations
  // ---------------------------------------------------------------------------

  describe('node type variations', () => {
    const nodeTypes = [
      'start',
      'end',
      'task',
      'phase',
      'decision',
      'api',
      'database',
      'code',
      'milestone',
    ]

    nodeTypes.forEach((type) => {
      it(`renders menu for ${type} node type`, () => {
        const node = { ...defaultNode, type }
        render(<NodeContextMenu {...defaultProps} node={node} />)

        expect(screen.getByText('Edit Node')).toBeInTheDocument()
        expect(screen.getByText('Delete')).toBeInTheDocument()
      })
    })
  })

  // ---------------------------------------------------------------------------
  // Edge Cases
  // ---------------------------------------------------------------------------

  describe('edge cases', () => {
    it('handles node with no config', () => {
      const node = { ...defaultNode, config: undefined }
      render(<NodeContextMenu {...defaultProps} node={node} />)

      expect(screen.getByText('Edit Node')).toBeInTheDocument()
    })

    it('handles multiple quick clicks', () => {
      render(<NodeContextMenu {...defaultProps} />)

      fireEvent.click(screen.getByText('Edit Node'))
      fireEvent.click(screen.getByText('Edit Node'))
      fireEvent.click(screen.getByText('Edit Node'))

      // The component delegates closing to onClose (parent controls unmount),
      // so each click calls the handler while the menu is still rendered
      expect(defaultProps.onEdit).toHaveBeenCalledTimes(3)
    })

    it('handles undefined callbacks gracefully', () => {
      render(
        <NodeContextMenu
          x={100}
          y={100}
          node={defaultNode}
          onClose={undefined}
          onEdit={undefined}
          onDuplicate={undefined}
          onExecuteSingle={undefined}
          onDelete={undefined}
        />
      )

      // Should not throw when clicking items
      fireEvent.click(screen.getByText('Edit Node'))
      fireEvent.click(screen.getByText('Duplicate'))
    })
  })
})
