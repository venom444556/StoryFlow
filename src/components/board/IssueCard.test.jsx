import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import IssueCard from './IssueCard'

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}))

// Mock SettingsContext — IssueCard uses useSettings for staleness threshold
vi.mock('../../contexts/SettingsContext', () => ({
  useSettings: () => ({ settings: { staleThresholdMinutes: 120 } }),
}))

describe('IssueCard', () => {
  const mockIssue = {
    id: 'issue-1',
    key: 'SF-1',
    title: 'Test Issue Title',
    type: 'task',
    status: 'To Do',
    priority: 'medium',
    storyPoints: 5,
    assignee: 'Claude',
    labels: ['frontend', 'urgent'],
    description: 'Test description',
  }

  let mockOnClick
  let mockOnDragStart
  let mockOnDragEnd

  beforeEach(() => {
    mockOnClick = vi.fn()
    mockOnDragStart = vi.fn()
    mockOnDragEnd = vi.fn()
  })

  describe('Basic Rendering', () => {
    it('renders without crashing', () => {
      render(<IssueCard issue={mockIssue} />)
      expect(screen.getByText('Test Issue Title')).toBeInTheDocument()
    })

    it('displays issue key', () => {
      render(<IssueCard issue={mockIssue} />)
      expect(screen.getByText('SF-1')).toBeInTheDocument()
    })

    it('displays issue title', () => {
      render(<IssueCard issue={mockIssue} />)
      expect(screen.getByText('Test Issue Title')).toBeInTheDocument()
    })

    it('renders type icon', () => {
      render(<IssueCard issue={mockIssue} />)
      expect(screen.getByTitle('Task')).toBeInTheDocument()
    })
  })

  describe('Priority Display', () => {
    it('displays priority badge for critical', () => {
      render(<IssueCard issue={{ ...mockIssue, priority: 'critical' }} />)
      expect(screen.getByText('critical')).toBeInTheDocument()
    })

    it('displays priority badge for high', () => {
      render(<IssueCard issue={{ ...mockIssue, priority: 'high' }} />)
      expect(screen.getByText('high')).toBeInTheDocument()
    })

    it('displays priority badge for medium', () => {
      render(<IssueCard issue={{ ...mockIssue, priority: 'medium' }} />)
      expect(screen.getByText('medium')).toBeInTheDocument()
    })

    it('displays priority badge for low', () => {
      render(<IssueCard issue={{ ...mockIssue, priority: 'low' }} />)
      expect(screen.getByText('low')).toBeInTheDocument()
    })

    it('does not display priority badge when priority is missing', () => {
      render(<IssueCard issue={{ ...mockIssue, priority: null }} />)
      expect(screen.queryByText('medium')).not.toBeInTheDocument()
    })
  })

  describe('Story Points Display', () => {
    it('displays story points when present', () => {
      render(<IssueCard issue={mockIssue} />)
      expect(screen.getByText('5')).toBeInTheDocument()
    })

    it('does not display story points when null', () => {
      render(<IssueCard issue={{ ...mockIssue, storyPoints: null }} />)
      const pointsElements = screen.queryAllByText('5')
      expect(pointsElements).toHaveLength(0)
    })

    it('displays zero story points', () => {
      render(<IssueCard issue={{ ...mockIssue, storyPoints: 0 }} />)
      expect(screen.getByText('0')).toBeInTheDocument()
    })
  })

  describe('Assignee Display', () => {
    it('displays assignee avatar when assignee is present', () => {
      render(<IssueCard issue={mockIssue} />)
      // Avatar component should be rendered with assignee name
      const avatar = screen.getByText('C') // First letter of 'Claude'
      expect(avatar).toBeInTheDocument()
    })

    it('does not display avatar when assignee is missing', () => {
      render(<IssueCard issue={{ ...mockIssue, assignee: null }} />)
      expect(screen.queryByText('C')).not.toBeInTheDocument()
    })
  })

  describe('Labels Display', () => {
    it('displays label count when labels are present', () => {
      render(<IssueCard issue={mockIssue} />)
      expect(screen.getByText('2')).toBeInTheDocument() // 2 labels
    })

    it('does not display label count when no labels', () => {
      render(<IssueCard issue={{ ...mockIssue, labels: [] }} />)
      // The labels count of 2 should not be present
      expect(screen.queryByTitle('frontend, urgent')).not.toBeInTheDocument()
    })

    it('handles missing labels array', () => {
      render(<IssueCard issue={{ ...mockIssue, labels: undefined }} />)
      expect(screen.getByText('Test Issue Title')).toBeInTheDocument()
    })
  })

  describe('Click Interactions', () => {
    it('calls onClick when card is clicked', () => {
      render(<IssueCard issue={mockIssue} onClick={mockOnClick} />)
      fireEvent.click(screen.getByText('Test Issue Title'))
      expect(mockOnClick).toHaveBeenCalledWith(mockIssue)
    })

    it('does not crash when onClick is not provided', () => {
      render(<IssueCard issue={mockIssue} />)
      fireEvent.click(screen.getByText('Test Issue Title'))
      // No error should be thrown
    })
  })

  describe('Drag and Drop', () => {
    it('is draggable', () => {
      const { container } = render(<IssueCard issue={mockIssue} />)
      const card = container.firstChild
      expect(card).toHaveAttribute('draggable', 'true')
    })

    it('calls onDragStart when drag begins', () => {
      const { container } = render(
        <IssueCard issue={mockIssue} onDragStart={mockOnDragStart} onDragEnd={mockOnDragEnd} />
      )
      const card = container.firstChild

      const dataTransferMock = {
        setData: vi.fn(),
        effectAllowed: '',
      }

      fireEvent.dragStart(card, { dataTransfer: dataTransferMock })

      expect(mockOnDragStart).toHaveBeenCalledWith(mockIssue)
      expect(dataTransferMock.setData).toHaveBeenCalledWith('text/plain', 'issue-1')
    })

    it('calls onDragEnd when drag ends', () => {
      const { container } = render(
        <IssueCard issue={mockIssue} onDragStart={mockOnDragStart} onDragEnd={mockOnDragEnd} />
      )
      const card = container.firstChild

      fireEvent.dragEnd(card)

      expect(mockOnDragEnd).toHaveBeenCalledWith(mockIssue)
    })
  })

  describe('Dragging State', () => {
    it('applies dragging styles when isDragging is true', () => {
      const { container } = render(<IssueCard issue={mockIssue} isDragging={true} />)
      const card = container.firstChild
      expect(card).toHaveClass('ring-2')
    })

    it('does not apply dragging styles when isDragging is false', () => {
      const { container } = render(<IssueCard issue={mockIssue} isDragging={false} />)
      const card = container.firstChild
      expect(card).not.toHaveClass('ring-2')
    })
  })

  describe('Issue Types', () => {
    it('renders epic type icon', () => {
      render(<IssueCard issue={{ ...mockIssue, type: 'epic' }} />)
      expect(screen.getByTitle('Epic')).toBeInTheDocument()
    })

    it('renders story type icon', () => {
      render(<IssueCard issue={{ ...mockIssue, type: 'story' }} />)
      expect(screen.getByTitle('Story')).toBeInTheDocument()
    })

    it('renders bug type icon', () => {
      render(<IssueCard issue={{ ...mockIssue, type: 'bug' }} />)
      expect(screen.getByTitle('Bug')).toBeInTheDocument()
    })

    it('renders subtask type icon', () => {
      render(<IssueCard issue={{ ...mockIssue, type: 'subtask' }} />)
      expect(screen.getByTitle('Subtask')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles very long title with truncation', () => {
      const longTitle = 'A'.repeat(200)
      render(<IssueCard issue={{ ...mockIssue, title: longTitle }} />)
      expect(screen.getByText(longTitle)).toBeInTheDocument()
    })

    it('handles minimal issue data', () => {
      const minimalIssue = {
        id: 'min-1',
        key: 'MIN-1',
        title: 'Minimal',
        type: 'task',
      }
      render(<IssueCard issue={minimalIssue} />)
      expect(screen.getByText('Minimal')).toBeInTheDocument()
    })

    it('handles empty labels array gracefully', () => {
      render(<IssueCard issue={{ ...mockIssue, labels: [] }} />)
      expect(screen.getByText('Test Issue Title')).toBeInTheDocument()
    })
  })
})
