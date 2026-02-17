import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import BoardColumn from './BoardColumn'

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}))

// Mock child components
vi.mock('./IssueCard', () => ({
  default: ({ issue, onClick, onDragStart, onDragEnd, isDragging }) => (
    <div
      data-testid={`issue-card-${issue.id}`}
      data-dragging={isDragging}
      onClick={() => onClick?.(issue)}
      draggable
      onDragStart={() => onDragStart?.(issue)}
      onDragEnd={() => onDragEnd?.(issue)}
    >
      {issue.title}
    </div>
  ),
}))

describe('BoardColumn', () => {
  const mockIssues = [
    {
      id: 'issue-1',
      key: 'SF-1',
      title: 'First Issue',
      type: 'task',
      status: 'To Do',
      priority: 'high',
    },
    {
      id: 'issue-2',
      key: 'SF-2',
      title: 'Second Issue',
      type: 'bug',
      status: 'To Do',
      priority: 'medium',
    },
  ]

  let mockOnDrop
  let mockOnIssueClick
  let mockOnCreateIssue

  beforeEach(() => {
    mockOnDrop = vi.fn()
    mockOnIssueClick = vi.fn()
    mockOnCreateIssue = vi.fn()
  })

  describe('Basic Rendering', () => {
    it('renders without crashing', () => {
      render(
        <BoardColumn
          title="To Do"
          status="To Do"
          issues={mockIssues}
          onDrop={mockOnDrop}
          onIssueClick={mockOnIssueClick}
          onCreateIssue={mockOnCreateIssue}
        />
      )
      expect(screen.getByText('To Do')).toBeInTheDocument()
    })

    it('displays column title', () => {
      render(
        <BoardColumn title="In Progress" status="In Progress" issues={[]} onDrop={mockOnDrop} />
      )
      expect(screen.getByText('In Progress')).toBeInTheDocument()
    })

    it('displays issue count badge', () => {
      render(<BoardColumn title="To Do" status="To Do" issues={mockIssues} onDrop={mockOnDrop} />)
      expect(screen.getByText('2')).toBeInTheDocument()
    })

    it('renders all issues', () => {
      render(
        <BoardColumn
          title="To Do"
          status="To Do"
          issues={mockIssues}
          onDrop={mockOnDrop}
          onIssueClick={mockOnIssueClick}
        />
      )
      expect(screen.getByText('First Issue')).toBeInTheDocument()
      expect(screen.getByText('Second Issue')).toBeInTheDocument()
    })
  })

  describe('Empty State', () => {
    it('shows empty state when no issues', () => {
      render(<BoardColumn title="Done" status="Done" issues={[]} onDrop={mockOnDrop} />)
      expect(screen.getByText('No issues in Done')).toBeInTheDocument()
    })

    it('shows zero in badge when no issues', () => {
      render(<BoardColumn title="Done" status="Done" issues={[]} onDrop={mockOnDrop} />)
      expect(screen.getByText('0')).toBeInTheDocument()
    })
  })

  describe('Status Styling', () => {
    it('applies To Do status styling', () => {
      const { container } = render(
        <BoardColumn title="To Do" status="To Do" issues={[]} onDrop={mockOnDrop} />
      )
      // Check for status dot — uses CSS variable token now
      const dot = container.querySelector('.bg-\\[var\\(--color-fg-faint\\)\\]')
      expect(dot).toBeInTheDocument()
    })

    it('applies In Progress status styling', () => {
      const { container } = render(
        <BoardColumn title="In Progress" status="In Progress" issues={[]} onDrop={mockOnDrop} />
      )
      const dot = container.querySelector('.bg-blue-400')
      expect(dot).toBeInTheDocument()
    })

    it('applies Done status styling', () => {
      const { container } = render(
        <BoardColumn title="Done" status="Done" issues={[]} onDrop={mockOnDrop} />
      )
      const dot = container.querySelector('.bg-green-400')
      expect(dot).toBeInTheDocument()
    })
  })

  describe('Drag and Drop', () => {
    it('calls onDrop when issue is dropped', () => {
      const { container } = render(
        <BoardColumn title="To Do" status="To Do" issues={[]} onDrop={mockOnDrop} />
      )

      const column = container.firstChild

      const dataTransferMock = {
        getData: vi.fn().mockReturnValue('issue-1'),
        setData: vi.fn(),
        dropEffect: '',
      }

      fireEvent.dragOver(column, { dataTransfer: dataTransferMock })
      fireEvent.drop(column, { dataTransfer: dataTransferMock })

      expect(mockOnDrop).toHaveBeenCalledWith('issue-1', 'To Do')
    })

    it('shows drop indicator on drag over', () => {
      const { container } = render(
        <BoardColumn title="To Do" status="To Do" issues={[]} onDrop={mockOnDrop} />
      )

      const column = container.firstChild

      const dataTransferMock = {
        getData: vi.fn(),
        dropEffect: '',
      }

      fireEvent.dragOver(column, { dataTransfer: dataTransferMock })

      expect(screen.getByText('Drop here')).toBeInTheDocument()
    })

    it('removes drop indicator on drag leave', () => {
      const { container } = render(
        <BoardColumn title="To Do" status="To Do" issues={[]} onDrop={mockOnDrop} />
      )

      const column = container.firstChild

      const dataTransferMock = {
        getData: vi.fn(),
        dropEffect: '',
      }

      fireEvent.dragOver(column, { dataTransfer: dataTransferMock })
      expect(screen.getByText('Drop here')).toBeInTheDocument()

      fireEvent.dragLeave(column, { relatedTarget: null })
      expect(screen.queryByText('Drop here')).not.toBeInTheDocument()
    })

    it('applies drag-over styling when dragging over', () => {
      const { container } = render(
        <BoardColumn title="To Do" status="To Do" issues={[]} onDrop={mockOnDrop} />
      )

      const column = container.firstChild

      const dataTransferMock = {
        getData: vi.fn(),
        dropEffect: '',
      }

      fireEvent.dragOver(column, { dataTransfer: dataTransferMock })

      expect(column).toHaveClass('ring-2')
    })
  })

  describe('Issue Interactions', () => {
    it('calls onIssueClick when issue is clicked', () => {
      render(
        <BoardColumn
          title="To Do"
          status="To Do"
          issues={mockIssues}
          onDrop={mockOnDrop}
          onIssueClick={mockOnIssueClick}
        />
      )

      fireEvent.click(screen.getByTestId('issue-card-issue-1'))

      expect(mockOnIssueClick).toHaveBeenCalledWith(mockIssues[0])
    })
  })

  describe('Add Issue Button', () => {
    it('renders add issue button in header', () => {
      render(
        <BoardColumn
          title="To Do"
          status="To Do"
          issues={[]}
          onDrop={mockOnDrop}
          onCreateIssue={mockOnCreateIssue}
        />
      )

      const addButton = screen.getByTitle('Add issue')
      expect(addButton).toBeInTheDocument()
    })

    it('creates default issue when add button clicked', () => {
      render(
        <BoardColumn
          title="To Do"
          status="To Do"
          issues={[]}
          onDrop={mockOnDrop}
          onCreateIssue={mockOnCreateIssue}
        />
      )

      fireEvent.click(screen.getByTitle('Add issue'))

      expect(mockOnCreateIssue).toHaveBeenCalledWith({
        title: 'New Issue',
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

  describe('Edge Cases', () => {
    it('handles empty issues array', () => {
      render(<BoardColumn title="To Do" status="To Do" issues={[]} onDrop={mockOnDrop} />)
      expect(screen.getByText('No issues in To Do')).toBeInTheDocument()
    })

    it('handles undefined issues prop', () => {
      render(<BoardColumn title="To Do" status="To Do" onDrop={mockOnDrop} />)
      expect(screen.getByText('0')).toBeInTheDocument()
    })

    it('handles missing onDrop gracefully', () => {
      const { container } = render(<BoardColumn title="To Do" status="To Do" issues={[]} />)

      const column = container.firstChild
      const dataTransferMock = {
        getData: vi.fn().mockReturnValue('issue-1'),
        dropEffect: '',
      }

      // Should not throw
      fireEvent.drop(column, { dataTransfer: dataTransferMock })
    })

    it('handles unknown status with default styling', () => {
      const { container } = render(
        <BoardColumn title="Unknown" status="Unknown" issues={[]} onDrop={mockOnDrop} />
      )
      // Should fall back to To Do styling — uses CSS variable token
      const dot = container.querySelector('.bg-\\[var\\(--color-fg-faint\\)\\]')
      expect(dot).toBeInTheDocument()
    })
  })
})
