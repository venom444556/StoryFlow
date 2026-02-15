import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import NodeDetailModal from './NodeDetailModal'

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}))

// Mock Modal component
vi.mock('../ui/Modal', () => ({
  default: ({ children, isOpen, onClose }) =>
    isOpen ? (
      <div data-testid="modal" onClick={(e) => e.target === e.currentTarget && onClose?.()}>
        {children}
      </div>
    ) : null,
}))

describe('NodeDetailModal', () => {
  const defaultNode = {
    id: 'node-1',
    type: 'task',
    title: 'Test Task',
    description: 'A test task description',
    status: 'idle',
    x: 100,
    y: 100,
    config: {},
    error: null,
  }

  const defaultProps = {
    node: defaultNode,
    isOpen: true,
    onClose: vi.fn(),
    onUpdate: vi.fn(),
    onDelete: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ---------------------------------------------------------------------------
  // Basic Rendering
  // ---------------------------------------------------------------------------

  describe('basic rendering', () => {
    it('renders nothing when node is null', () => {
      const { container } = render(<NodeDetailModal {...defaultProps} node={null} />)
      expect(container.firstChild).toBeNull()
    })

    it('renders nothing when isOpen is false', () => {
      render(<NodeDetailModal {...defaultProps} isOpen={false} />)
      expect(screen.queryByTestId('modal')).not.toBeInTheDocument()
    })

    it('renders modal when isOpen is true and node exists', () => {
      render(<NodeDetailModal {...defaultProps} />)
      expect(screen.getByTestId('modal')).toBeInTheDocument()
    })

    it('displays the node title in an editable input', () => {
      render(<NodeDetailModal {...defaultProps} />)
      const titleInput = screen.getByDisplayValue('Test Task')
      expect(titleInput).toBeInTheDocument()
    })

    it('displays node type badge', () => {
      render(<NodeDetailModal {...defaultProps} />)
      expect(screen.getByText('Task')).toBeInTheDocument()
    })

    it('displays node status badge', () => {
      render(<NodeDetailModal {...defaultProps} />)
      expect(screen.getByText('Not Started')).toBeInTheDocument()
    })

    it('displays description section', () => {
      render(<NodeDetailModal {...defaultProps} />)
      expect(screen.getByText('Description')).toBeInTheDocument()
    })
  })

  // ---------------------------------------------------------------------------
  // Node Type Variations
  // ---------------------------------------------------------------------------

  describe('node type variations', () => {
    it('renders start node with correct type badge', () => {
      const node = { ...defaultNode, type: 'start' }
      render(<NodeDetailModal {...defaultProps} node={node} />)
      expect(screen.getByText('Start')).toBeInTheDocument()
    })

    it('renders end node with correct type badge', () => {
      const node = { ...defaultNode, type: 'end' }
      render(<NodeDetailModal {...defaultProps} node={node} />)
      expect(screen.getByText('End')).toBeInTheDocument()
    })

    it('renders phase node with correct type badge', () => {
      const node = { ...defaultNode, type: 'phase' }
      render(<NodeDetailModal {...defaultProps} node={node} />)
      expect(screen.getByText('Phase')).toBeInTheDocument()
    })

    it('renders decision node with correct type badge', () => {
      const node = { ...defaultNode, type: 'decision' }
      render(<NodeDetailModal {...defaultProps} node={node} />)
      expect(screen.getByText('Decision')).toBeInTheDocument()
    })

    it('renders api node with correct type badge', () => {
      const node = { ...defaultNode, type: 'api' }
      render(<NodeDetailModal {...defaultProps} node={node} />)
      expect(screen.getByText('API Call')).toBeInTheDocument()
    })

    it('renders database node with correct type badge', () => {
      const node = { ...defaultNode, type: 'database' }
      render(<NodeDetailModal {...defaultProps} node={node} />)
      expect(screen.getByText('Database')).toBeInTheDocument()
    })

    it('renders code node with correct type badge', () => {
      const node = { ...defaultNode, type: 'code' }
      render(<NodeDetailModal {...defaultProps} node={node} />)
      expect(screen.getByText('Code Logic')).toBeInTheDocument()
    })

    it('renders milestone node with correct type badge', () => {
      const node = { ...defaultNode, type: 'milestone' }
      render(<NodeDetailModal {...defaultProps} node={node} />)
      expect(screen.getByText('Milestone')).toBeInTheDocument()
    })
  })

  // ---------------------------------------------------------------------------
  // Node Status Variations
  // ---------------------------------------------------------------------------

  describe('node status variations', () => {
    it('displays "Not Started" for idle status', () => {
      const node = { ...defaultNode, status: 'idle' }
      render(<NodeDetailModal {...defaultProps} node={node} />)
      expect(screen.getByText('Not Started')).toBeInTheDocument()
    })

    it('displays "Running" for running status', () => {
      const node = { ...defaultNode, status: 'running' }
      render(<NodeDetailModal {...defaultProps} node={node} />)
      expect(screen.getByText('Running')).toBeInTheDocument()
    })

    it('displays "Completed" for success status', () => {
      const node = { ...defaultNode, status: 'success' }
      render(<NodeDetailModal {...defaultProps} node={node} />)
      expect(screen.getByText('Completed')).toBeInTheDocument()
    })

    it('displays "Failed" for error status', () => {
      const node = { ...defaultNode, status: 'error' }
      render(<NodeDetailModal {...defaultProps} node={node} />)
      expect(screen.getByText('Failed')).toBeInTheDocument()
    })
  })

  // ---------------------------------------------------------------------------
  // Configuration Fields
  // ---------------------------------------------------------------------------

  describe('configuration fields', () => {
    it('shows URL, Method, Timeout fields for API node', () => {
      const node = { ...defaultNode, type: 'api', config: { url: 'https://api.test.com', method: 'GET' } }
      render(<NodeDetailModal {...defaultProps} node={node} />)

      expect(screen.getByText('Configuration')).toBeInTheDocument()
      expect(screen.getByText('URL')).toBeInTheDocument()
      expect(screen.getByText('Method')).toBeInTheDocument()
      expect(screen.getByText('Timeout (ms)')).toBeInTheDocument()
    })

    it('shows Query, Connection, Retries fields for database node', () => {
      const node = { ...defaultNode, type: 'database', config: {} }
      render(<NodeDetailModal {...defaultProps} node={node} />)

      expect(screen.getByText('Query')).toBeInTheDocument()
      expect(screen.getByText('Connection')).toBeInTheDocument()
      expect(screen.getByText('Retries')).toBeInTheDocument()
    })

    it('shows Script field for code node', () => {
      const node = { ...defaultNode, type: 'code', config: {} }
      render(<NodeDetailModal {...defaultProps} node={node} />)

      expect(screen.getByText('Script')).toBeInTheDocument()
    })

    it('shows Condition field for decision node', () => {
      const node = { ...defaultNode, type: 'decision', config: {} }
      render(<NodeDetailModal {...defaultProps} node={node} />)

      expect(screen.getByText('Condition')).toBeInTheDocument()
    })

    it('shows Description field for phase node', () => {
      const node = { ...defaultNode, type: 'phase', config: {} }
      render(<NodeDetailModal {...defaultProps} node={node} />)

      // Phase has a config description field separate from the main description
      const descriptions = screen.getAllByText('Description')
      expect(descriptions.length).toBeGreaterThanOrEqual(1)
    })

    it('shows Assignee and Notes fields for task node', () => {
      const node = { ...defaultNode, type: 'task', config: {} }
      render(<NodeDetailModal {...defaultProps} node={node} />)

      expect(screen.getByText('Assignee')).toBeInTheDocument()
      expect(screen.getByText('Notes')).toBeInTheDocument()
    })

    it('shows Due Date and Success Criteria fields for milestone node', () => {
      const node = { ...defaultNode, type: 'milestone', config: {} }
      render(<NodeDetailModal {...defaultProps} node={node} />)

      expect(screen.getByText('Due Date')).toBeInTheDocument()
      expect(screen.getByText('Success Criteria')).toBeInTheDocument()
    })

    it('does not show configuration section for start node', () => {
      const node = { ...defaultNode, type: 'start', config: {} }
      render(<NodeDetailModal {...defaultProps} node={node} />)

      expect(screen.queryByText('Configuration')).not.toBeInTheDocument()
    })

    it('does not show configuration section for end node', () => {
      const node = { ...defaultNode, type: 'end', config: {} }
      render(<NodeDetailModal {...defaultProps} node={node} />)

      expect(screen.queryByText('Configuration')).not.toBeInTheDocument()
    })
  })

  // ---------------------------------------------------------------------------
  // Title Editing
  // ---------------------------------------------------------------------------

  describe('title editing', () => {
    it('calls onUpdate when title is changed', () => {
      render(<NodeDetailModal {...defaultProps} />)

      const titleInput = screen.getByDisplayValue('Test Task')
      fireEvent.change(titleInput, { target: { value: 'Updated Title' } })

      expect(defaultProps.onUpdate).toHaveBeenCalledWith('node-1', { title: 'Updated Title' })
    })
  })

  // ---------------------------------------------------------------------------
  // Description Editing
  // ---------------------------------------------------------------------------

  describe('description editing', () => {
    it('calls onUpdate when description is changed', () => {
      render(<NodeDetailModal {...defaultProps} />)

      const descriptionTextarea = screen.getByPlaceholderText('Add a description of what this node does...')
      fireEvent.change(descriptionTextarea, { target: { value: 'New description' } })

      expect(defaultProps.onUpdate).toHaveBeenCalledWith('node-1', { description: 'New description' })
    })
  })

  // ---------------------------------------------------------------------------
  // Config Editing
  // ---------------------------------------------------------------------------

  describe('config editing', () => {
    it('calls onUpdate with merged config when config field is changed', () => {
      const node = { ...defaultNode, type: 'api', config: { method: 'GET' } }
      render(<NodeDetailModal {...defaultProps} node={node} />)

      const urlInput = screen.getByPlaceholderText('https://api.example.com/...')
      fireEvent.change(urlInput, { target: { value: 'https://new-api.com' } })

      expect(defaultProps.onUpdate).toHaveBeenCalledWith('node-1', {
        config: { method: 'GET', url: 'https://new-api.com' },
      })
    })
  })

  // ---------------------------------------------------------------------------
  // Delete Functionality
  // ---------------------------------------------------------------------------

  describe('delete functionality', () => {
    it('shows delete button for non-terminal nodes', () => {
      render(<NodeDetailModal {...defaultProps} />)
      expect(screen.getByText('Delete Node')).toBeInTheDocument()
    })

    it('hides delete button for start node', () => {
      const node = { ...defaultNode, type: 'start' }
      render(<NodeDetailModal {...defaultProps} node={node} />)
      expect(screen.queryByText('Delete Node')).not.toBeInTheDocument()
    })

    it('hides delete button for end node', () => {
      const node = { ...defaultNode, type: 'end' }
      render(<NodeDetailModal {...defaultProps} node={node} />)
      expect(screen.queryByText('Delete Node')).not.toBeInTheDocument()
    })

    it('calls onDelete and onClose when delete button is clicked', () => {
      render(<NodeDetailModal {...defaultProps} />)

      fireEvent.click(screen.getByText('Delete Node'))

      expect(defaultProps.onDelete).toHaveBeenCalledWith('node-1')
      expect(defaultProps.onClose).toHaveBeenCalled()
    })
  })

  // ---------------------------------------------------------------------------
  // Close Functionality
  // ---------------------------------------------------------------------------

  describe('close functionality', () => {
    it('calls onClose when Done button is clicked', () => {
      render(<NodeDetailModal {...defaultProps} />)

      fireEvent.click(screen.getByText('Done'))

      expect(defaultProps.onClose).toHaveBeenCalled()
    })
  })

  // ---------------------------------------------------------------------------
  // Execution Results Display
  // ---------------------------------------------------------------------------

  describe('execution results display', () => {
    it('shows success message for completed nodes', () => {
      const node = { ...defaultNode, status: 'success' }
      render(<NodeDetailModal {...defaultProps} node={node} />)

      expect(screen.getByText('Completed successfully')).toBeInTheDocument()
      expect(screen.getByText('Node executed without errors.')).toBeInTheDocument()
    })

    it('shows error message for failed nodes', () => {
      const node = { ...defaultNode, status: 'error', error: 'Connection timeout' }
      render(<NodeDetailModal {...defaultProps} node={node} />)

      expect(screen.getByText('Execution failed')).toBeInTheDocument()
      expect(screen.getByText('Connection timeout')).toBeInTheDocument()
    })

    it('does not show execution results for idle nodes', () => {
      const node = { ...defaultNode, status: 'idle' }
      render(<NodeDetailModal {...defaultProps} node={node} />)

      expect(screen.queryByText('Last Execution')).not.toBeInTheDocument()
    })

    it('does not show execution results for running nodes', () => {
      const node = { ...defaultNode, status: 'running' }
      render(<NodeDetailModal {...defaultProps} node={node} />)

      expect(screen.queryByText('Last Execution')).not.toBeInTheDocument()
    })
  })

  // ---------------------------------------------------------------------------
  // Sub-workflow Progress Display
  // ---------------------------------------------------------------------------

  describe('sub-workflow progress display', () => {
    it('shows sub-workflow progress for nodes with children', () => {
      const node = {
        ...defaultNode,
        children: {
          nodes: [
            { id: 'child-1', type: 'start', title: 'Start', status: 'success' },
            { id: 'child-2', type: 'task', title: 'Child Task', status: 'idle' },
            { id: 'child-3', type: 'end', title: 'End', status: 'idle' },
          ],
          connections: [],
        },
      }
      render(<NodeDetailModal {...defaultProps} node={node} />)

      expect(screen.getByText('Sub-Workflow Progress')).toBeInTheDocument()
      expect(screen.getByText('1 sub-steps')).toBeInTheDocument() // Only task, not start/end
    })

    it('calculates progress percentage correctly', () => {
      const node = {
        ...defaultNode,
        children: {
          nodes: [
            { id: 'child-1', type: 'start', title: 'Start', status: 'success' },
            { id: 'child-2', type: 'task', title: 'Task 1', status: 'success' },
            { id: 'child-3', type: 'task', title: 'Task 2', status: 'idle' },
            { id: 'child-4', type: 'end', title: 'End', status: 'idle' },
          ],
          connections: [],
        },
      }
      render(<NodeDetailModal {...defaultProps} node={node} />)

      expect(screen.getByText('50% Complete')).toBeInTheDocument()
      expect(screen.getByText('1 of 2 steps done')).toBeInTheDocument()
    })

    it('displays child nodes list', () => {
      const node = {
        ...defaultNode,
        children: {
          nodes: [
            { id: 'child-1', type: 'start', title: 'Start', status: 'success' },
            { id: 'child-2', type: 'task', title: 'Process Data', status: 'running', config: { assignee: 'John' } },
            { id: 'child-3', type: 'end', title: 'End', status: 'idle' },
          ],
          connections: [],
        },
      }
      render(<NodeDetailModal {...defaultProps} node={node} />)

      expect(screen.getByText('Process Data')).toBeInTheDocument()
      expect(screen.getByText('John')).toBeInTheDocument()
    })

    it('shows error for failed child nodes', () => {
      const node = {
        ...defaultNode,
        children: {
          nodes: [
            { id: 'child-1', type: 'start', title: 'Start', status: 'success' },
            { id: 'child-2', type: 'task', title: 'Failed Task', status: 'error', error: 'Task error' },
            { id: 'child-3', type: 'end', title: 'End', status: 'idle' },
          ],
          connections: [],
        },
      }
      render(<NodeDetailModal {...defaultProps} node={node} />)

      expect(screen.getByText('Task error')).toBeInTheDocument()
    })

    it('does not show sub-workflow section when no children', () => {
      render(<NodeDetailModal {...defaultProps} />)
      expect(screen.queryByText('Sub-Workflow Progress')).not.toBeInTheDocument()
    })
  })

  // ---------------------------------------------------------------------------
  // Type Description Display
  // ---------------------------------------------------------------------------

  describe('type description display', () => {
    it('shows type description for non-terminal nodes', () => {
      const node = { ...defaultNode, type: 'task' }
      render(<NodeDetailModal {...defaultProps} node={node} />)

      expect(screen.getByText('An individual unit of work to be completed.')).toBeInTheDocument()
    })

    it('does not show type description for start node', () => {
      const node = { ...defaultNode, type: 'start' }
      render(<NodeDetailModal {...defaultProps} node={node} />)

      // Type description info box should not be shown for terminal nodes
      expect(screen.queryByText('Entry point for the workflow')).not.toBeInTheDocument()
    })
  })

  // ---------------------------------------------------------------------------
  // Edge Cases
  // ---------------------------------------------------------------------------

  describe('edge cases', () => {
    it('handles node with undefined config', () => {
      const node = { ...defaultNode, config: undefined }
      render(<NodeDetailModal {...defaultProps} node={node} />)

      expect(screen.getByTestId('modal')).toBeInTheDocument()
    })

    it('handles node with undefined description', () => {
      const node = { ...defaultNode, description: undefined }
      render(<NodeDetailModal {...defaultProps} node={node} />)

      expect(screen.getByTestId('modal')).toBeInTheDocument()
    })

    it('handles node with very long title', () => {
      const node = { ...defaultNode, title: 'A'.repeat(200) }
      render(<NodeDetailModal {...defaultProps} node={node} />)

      expect(screen.getByDisplayValue('A'.repeat(200))).toBeInTheDocument()
    })

    it('handles node with special characters in title', () => {
      const node = { ...defaultNode, title: '<script>alert("xss")</script>' }
      render(<NodeDetailModal {...defaultProps} node={node} />)

      expect(screen.getByDisplayValue('<script>alert("xss")</script>')).toBeInTheDocument()
    })

    it('handles unknown node type gracefully', () => {
      const node = { ...defaultNode, type: 'unknown-type' }
      render(<NodeDetailModal {...defaultProps} node={node} />)

      expect(screen.getByTestId('modal')).toBeInTheDocument()
      expect(screen.getByText('unknown-type')).toBeInTheDocument()
    })
  })
})
