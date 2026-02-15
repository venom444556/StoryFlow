import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import NodeProperties from './NodeProperties'

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}))

describe('NodeProperties', () => {
  const defaultNode = {
    id: 'node-1',
    type: 'task',
    title: 'Test Task',
    status: 'idle',
    x: 100,
    y: 100,
    config: {},
    error: null,
  }

  const defaultProps = {
    node: defaultNode,
    onUpdate: vi.fn(),
    onDelete: vi.fn(),
    onClose: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ---------------------------------------------------------------------------
  // Basic Rendering
  // ---------------------------------------------------------------------------

  describe('basic rendering', () => {
    it('renders nothing when node is null', () => {
      const { container } = render(<NodeProperties {...defaultProps} node={null} />)
      expect(container.firstChild).toBeNull()
    })

    it('renders the panel when node exists', () => {
      render(<NodeProperties {...defaultProps} />)
      expect(screen.getByText('Node Properties')).toBeInTheDocument()
    })

    it('displays the node title in an editable input', () => {
      render(<NodeProperties {...defaultProps} />)
      expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument()
    })

    it('displays the Type label', () => {
      render(<NodeProperties {...defaultProps} />)
      expect(screen.getByText('Type')).toBeInTheDocument()
    })

    it('displays the Status label', () => {
      render(<NodeProperties {...defaultProps} />)
      expect(screen.getByText('Status')).toBeInTheDocument()
    })
  })

  // ---------------------------------------------------------------------------
  // Close Button
  // ---------------------------------------------------------------------------

  describe('close button', () => {
    it('renders close button', () => {
      render(<NodeProperties {...defaultProps} />)

      const closeButton = screen.getByRole('button', { name: '' }) // X icon button
      expect(closeButton).toBeInTheDocument()
    })

    it('calls onClose when close button is clicked', () => {
      render(<NodeProperties {...defaultProps} />)

      const buttons = screen.getAllByRole('button')
      const closeButton = buttons[0] // First button is close
      fireEvent.click(closeButton)

      expect(defaultProps.onClose).toHaveBeenCalled()
    })
  })

  // ---------------------------------------------------------------------------
  // Node Type Variations
  // ---------------------------------------------------------------------------

  describe('node type variations', () => {
    it('displays Start badge for start node', () => {
      const node = { ...defaultNode, type: 'start' }
      render(<NodeProperties {...defaultProps} node={node} />)
      expect(screen.getByText('Start')).toBeInTheDocument()
    })

    it('displays End badge for end node', () => {
      const node = { ...defaultNode, type: 'end' }
      render(<NodeProperties {...defaultProps} node={node} />)
      expect(screen.getByText('End')).toBeInTheDocument()
    })

    it('displays Phase badge for phase node', () => {
      const node = { ...defaultNode, type: 'phase' }
      render(<NodeProperties {...defaultProps} node={node} />)
      expect(screen.getByText('Phase')).toBeInTheDocument()
    })

    it('displays Task badge for task node', () => {
      const node = { ...defaultNode, type: 'task' }
      render(<NodeProperties {...defaultProps} node={node} />)
      expect(screen.getByText('Task')).toBeInTheDocument()
    })

    it('displays Decision badge for decision node', () => {
      const node = { ...defaultNode, type: 'decision' }
      render(<NodeProperties {...defaultProps} node={node} />)
      expect(screen.getByText('Decision')).toBeInTheDocument()
    })

    it('displays API Call badge for api node', () => {
      const node = { ...defaultNode, type: 'api' }
      render(<NodeProperties {...defaultProps} node={node} />)
      expect(screen.getByText('API Call')).toBeInTheDocument()
    })

    it('displays Database badge for database node', () => {
      const node = { ...defaultNode, type: 'database' }
      render(<NodeProperties {...defaultProps} node={node} />)
      expect(screen.getByText('Database')).toBeInTheDocument()
    })

    it('displays Code Logic badge for code node', () => {
      const node = { ...defaultNode, type: 'code' }
      render(<NodeProperties {...defaultProps} node={node} />)
      expect(screen.getByText('Code Logic')).toBeInTheDocument()
    })

    it('displays Milestone badge for milestone node', () => {
      const node = { ...defaultNode, type: 'milestone' }
      render(<NodeProperties {...defaultProps} node={node} />)
      expect(screen.getByText('Milestone')).toBeInTheDocument()
    })
  })

  // ---------------------------------------------------------------------------
  // Status Display
  // ---------------------------------------------------------------------------

  describe('status display', () => {
    it('displays Idle status', () => {
      const node = { ...defaultNode, status: 'idle' }
      render(<NodeProperties {...defaultProps} node={node} />)
      expect(screen.getByText('Idle')).toBeInTheDocument()
    })

    it('displays Running status', () => {
      const node = { ...defaultNode, status: 'running' }
      render(<NodeProperties {...defaultProps} node={node} />)
      expect(screen.getByText('Running')).toBeInTheDocument()
    })

    it('displays Success status', () => {
      const node = { ...defaultNode, status: 'success' }
      render(<NodeProperties {...defaultProps} node={node} />)
      expect(screen.getByText('Success')).toBeInTheDocument()
    })

    it('displays Error status', () => {
      const node = { ...defaultNode, status: 'error' }
      render(<NodeProperties {...defaultProps} node={node} />)
      expect(screen.getByText('Error')).toBeInTheDocument()
    })
  })

  // ---------------------------------------------------------------------------
  // Error Display
  // ---------------------------------------------------------------------------

  describe('error display', () => {
    it('shows error message when node has error', () => {
      const node = { ...defaultNode, status: 'error', error: 'Connection failed' }
      render(<NodeProperties {...defaultProps} node={node} />)
      expect(screen.getByText('Connection failed')).toBeInTheDocument()
    })

    it('does not show error section when node has no error', () => {
      render(<NodeProperties {...defaultProps} />)
      expect(screen.queryByText('Connection failed')).not.toBeInTheDocument()
    })
  })

  // ---------------------------------------------------------------------------
  // Title Editing
  // ---------------------------------------------------------------------------

  describe('title editing', () => {
    it('calls onUpdate when title is changed', () => {
      render(<NodeProperties {...defaultProps} />)

      const titleInput = screen.getByDisplayValue('Test Task')
      fireEvent.change(titleInput, { target: { value: 'Updated Title' } })

      expect(defaultProps.onUpdate).toHaveBeenCalledWith('node-1', { title: 'Updated Title' })
    })
  })

  // ---------------------------------------------------------------------------
  // Configuration Fields
  // ---------------------------------------------------------------------------

  describe('configuration fields', () => {
    it('shows API configuration fields for api node', () => {
      const node = { ...defaultNode, type: 'api', config: {} }
      render(<NodeProperties {...defaultProps} node={node} />)

      expect(screen.getByText('Configuration')).toBeInTheDocument()
      expect(screen.getByText('URL')).toBeInTheDocument()
      expect(screen.getByText('Method')).toBeInTheDocument()
      expect(screen.getByText('Timeout (ms)')).toBeInTheDocument()
    })

    it('shows Database configuration fields for database node', () => {
      const node = { ...defaultNode, type: 'database', config: {} }
      render(<NodeProperties {...defaultProps} node={node} />)

      expect(screen.getByText('Query')).toBeInTheDocument()
      expect(screen.getByText('Connection')).toBeInTheDocument()
      expect(screen.getByText('Retries')).toBeInTheDocument()
    })

    it('shows Code configuration fields for code node', () => {
      const node = { ...defaultNode, type: 'code', config: {} }
      render(<NodeProperties {...defaultProps} node={node} />)

      expect(screen.getByText('Script')).toBeInTheDocument()
    })

    it('shows Decision configuration fields for decision node', () => {
      const node = { ...defaultNode, type: 'decision', config: {} }
      render(<NodeProperties {...defaultProps} node={node} />)

      expect(screen.getByText('Condition')).toBeInTheDocument()
    })

    it('shows Phase configuration fields for phase node', () => {
      const node = { ...defaultNode, type: 'phase', config: {} }
      render(<NodeProperties {...defaultProps} node={node} />)

      expect(screen.getByText('Description')).toBeInTheDocument()
    })

    it('shows Task configuration fields for task node', () => {
      const node = { ...defaultNode, type: 'task', config: {} }
      render(<NodeProperties {...defaultProps} node={node} />)

      expect(screen.getByText('Assignee')).toBeInTheDocument()
      expect(screen.getByText('Notes')).toBeInTheDocument()
    })

    it('shows Milestone configuration fields for milestone node', () => {
      const node = { ...defaultNode, type: 'milestone', config: {} }
      render(<NodeProperties {...defaultProps} node={node} />)

      expect(screen.getByText('Due Date')).toBeInTheDocument()
      expect(screen.getByText('Success Criteria')).toBeInTheDocument()
    })

    it('does not show configuration for start node', () => {
      const node = { ...defaultNode, type: 'start', config: {} }
      render(<NodeProperties {...defaultProps} node={node} />)

      expect(screen.queryByText('Configuration')).not.toBeInTheDocument()
    })

    it('does not show configuration for end node', () => {
      const node = { ...defaultNode, type: 'end', config: {} }
      render(<NodeProperties {...defaultProps} node={node} />)

      expect(screen.queryByText('Configuration')).not.toBeInTheDocument()
    })
  })

  // ---------------------------------------------------------------------------
  // Configuration Editing
  // ---------------------------------------------------------------------------

  describe('configuration editing', () => {
    it('calls onUpdate with merged config when field is changed', () => {
      const node = { ...defaultNode, type: 'api', config: { method: 'POST' } }
      render(<NodeProperties {...defaultProps} node={node} />)

      const urlInput = screen.getByPlaceholderText('https://api.example.com/...')
      fireEvent.change(urlInput, { target: { value: 'https://test.com' } })

      expect(defaultProps.onUpdate).toHaveBeenCalledWith('node-1', {
        config: { method: 'POST', url: 'https://test.com' },
      })
    })

    it('preserves existing config values when updating', () => {
      const node = {
        ...defaultNode,
        type: 'api',
        config: { url: 'https://old.com', method: 'GET', timeout: '5000' },
      }
      render(<NodeProperties {...defaultProps} node={node} />)

      const urlInput = screen.getByDisplayValue('https://old.com')
      fireEvent.change(urlInput, { target: { value: 'https://new.com' } })

      expect(defaultProps.onUpdate).toHaveBeenCalledWith('node-1', {
        config: { url: 'https://new.com', method: 'GET', timeout: '5000' },
      })
    })
  })

  // ---------------------------------------------------------------------------
  // Delete Functionality
  // ---------------------------------------------------------------------------

  describe('delete functionality', () => {
    it('shows delete button', () => {
      render(<NodeProperties {...defaultProps} />)
      expect(screen.getByText('Delete Node')).toBeInTheDocument()
    })

    it('calls onDelete when delete button is clicked', () => {
      render(<NodeProperties {...defaultProps} />)

      fireEvent.click(screen.getByText('Delete Node'))

      expect(defaultProps.onDelete).toHaveBeenCalledWith('node-1')
    })
  })

  // ---------------------------------------------------------------------------
  // Edge Cases
  // ---------------------------------------------------------------------------

  describe('edge cases', () => {
    it('handles undefined config gracefully', () => {
      const node = { ...defaultNode, type: 'api', config: undefined }
      render(<NodeProperties {...defaultProps} node={node} />)

      expect(screen.getByText('URL')).toBeInTheDocument()
      // Input should be empty
      const urlInput = screen.getByPlaceholderText('https://api.example.com/...')
      expect(urlInput).toHaveValue('')
    })

    it('handles unknown node type gracefully', () => {
      const node = { ...defaultNode, type: 'unknown-type' }
      render(<NodeProperties {...defaultProps} node={node} />)

      expect(screen.getByText('Node Properties')).toBeInTheDocument()
      expect(screen.getByText('unknown-type')).toBeInTheDocument()
    })

    it('handles undefined onUpdate gracefully', () => {
      render(<NodeProperties {...defaultProps} onUpdate={undefined} />)

      const titleInput = screen.getByDisplayValue('Test Task')
      // Should not throw
      fireEvent.change(titleInput, { target: { value: 'New Title' } })
    })

    it('handles undefined onDelete gracefully', () => {
      render(<NodeProperties {...defaultProps} onDelete={undefined} />)

      // Should not throw
      fireEvent.click(screen.getByText('Delete Node'))
    })

    it('handles undefined onClose gracefully', () => {
      render(<NodeProperties {...defaultProps} onClose={undefined} />)

      const buttons = screen.getAllByRole('button')
      // Should not throw
      fireEvent.click(buttons[0])
    })

    it('handles empty string status', () => {
      const node = { ...defaultNode, status: '' }
      render(<NodeProperties {...defaultProps} node={node} />)

      // Should capitalize and display (empty string becomes empty but doesn't crash)
      expect(screen.getByText('Status')).toBeInTheDocument()
    })

    it('handles very long title', () => {
      const node = { ...defaultNode, title: 'A'.repeat(500) }
      render(<NodeProperties {...defaultProps} node={node} />)

      expect(screen.getByDisplayValue('A'.repeat(500))).toBeInTheDocument()
    })

    it('handles special characters in title', () => {
      const node = { ...defaultNode, title: '<script>alert("xss")</script>' }
      render(<NodeProperties {...defaultProps} node={node} />)

      expect(screen.getByDisplayValue('<script>alert("xss")</script>')).toBeInTheDocument()
    })
  })
})
