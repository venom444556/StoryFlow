import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import SprintBoard from './SprintBoard'

// Mock BoardColumn
vi.mock('./BoardColumn', () => ({
  default: ({ title, status, issues, onDrop, onIssueClick, onCreateIssue }) => (
    <div data-testid={`column-${status}`} data-title={title}>
      <span data-testid={`count-${status}`}>{issues.length}</span>
      <div data-testid={`issues-${status}`}>
        {issues.map((issue) => (
          <div key={issue.id} data-testid={`issue-${issue.id}`}>
            {issue.title}
          </div>
        ))}
      </div>
      <button data-testid={`drop-${status}`} onClick={() => onDrop?.('test-issue', status)}>
        Drop
      </button>
      <button data-testid={`click-${status}`} onClick={() => onIssueClick?.(issues[0])}>
        Click
      </button>
      <button
        data-testid={`create-${status}`}
        onClick={() => onCreateIssue?.({ title: 'New', status })}
      >
        Create
      </button>
    </div>
  ),
}))

describe('SprintBoard', () => {
  const mockIssues = [
    { id: '1', title: 'Task 1', status: 'To Do', type: 'task' },
    { id: '2', title: 'Task 2', status: 'To Do', type: 'task' },
    { id: '3', title: 'Task 3', status: 'In Progress', type: 'task' },
    { id: '4', title: 'Task 4', status: 'Done', type: 'task' },
    { id: '5', title: 'Task 5', status: 'Done', type: 'task' },
  ]

  let mockOnUpdateIssue
  let mockOnCreateIssue
  let mockOnIssueClick

  beforeEach(() => {
    mockOnUpdateIssue = vi.fn()
    mockOnCreateIssue = vi.fn()
    mockOnIssueClick = vi.fn()
  })

  describe('Basic Rendering', () => {
    it('renders without crashing', () => {
      render(<SprintBoard issues={mockIssues} />)
      expect(screen.getByTestId('column-To Do')).toBeInTheDocument()
    })

    it('renders default status columns', () => {
      render(<SprintBoard issues={mockIssues} />)

      expect(screen.getByTestId('column-To Do')).toBeInTheDocument()
      expect(screen.getByTestId('column-In Progress')).toBeInTheDocument()
      expect(screen.getByTestId('column-Done')).toBeInTheDocument()
    })

    it('renders custom status columns', () => {
      const customColumns = ['Backlog', 'Ready', 'Working', 'Review', 'Complete']
      render(<SprintBoard issues={[]} statusColumns={customColumns} />)

      customColumns.forEach((status) => {
        expect(screen.getByTestId(`column-${status}`)).toBeInTheDocument()
      })
    })
  })

  describe('Issue Grouping', () => {
    it('groups issues by status', () => {
      render(<SprintBoard issues={mockIssues} />)

      expect(screen.getByTestId('count-To Do')).toHaveTextContent('2')
      expect(screen.getByTestId('count-In Progress')).toHaveTextContent('1')
      expect(screen.getByTestId('count-Done')).toHaveTextContent('2')
    })

    it('displays correct issues in each column', () => {
      render(<SprintBoard issues={mockIssues} />)

      expect(screen.getByTestId('issue-1')).toBeInTheDocument()
      expect(screen.getByTestId('issue-2')).toBeInTheDocument()
      expect(screen.getByTestId('issue-3')).toBeInTheDocument()
      expect(screen.getByTestId('issue-4')).toBeInTheDocument()
      expect(screen.getByTestId('issue-5')).toBeInTheDocument()
    })

    it('handles issues with unknown status', () => {
      const issuesWithUnknown = [
        { id: '1', title: 'Known', status: 'To Do', type: 'task' },
        { id: '2', title: 'Unknown', status: 'Unknown Status', type: 'task' },
      ]
      render(<SprintBoard issues={issuesWithUnknown} />)

      // Unknown status should fall back to first column
      expect(screen.getByTestId('count-To Do')).toHaveTextContent('2')
    })

    it('shows empty columns with zero count', () => {
      const todoOnly = [{ id: '1', title: 'Task 1', status: 'To Do', type: 'task' }]
      render(<SprintBoard issues={todoOnly} />)

      expect(screen.getByTestId('count-To Do')).toHaveTextContent('1')
      expect(screen.getByTestId('count-In Progress')).toHaveTextContent('0')
      expect(screen.getByTestId('count-Done')).toHaveTextContent('0')
    })
  })

  describe('Issue Updates', () => {
    it('calls onUpdateIssue when issue is dropped', () => {
      render(<SprintBoard issues={mockIssues} onUpdateIssue={mockOnUpdateIssue} />)

      screen.getByTestId('drop-In Progress').click()

      expect(mockOnUpdateIssue).toHaveBeenCalledWith('test-issue', {
        status: 'In Progress',
      })
    })

    it('handles drop without onUpdateIssue', () => {
      render(<SprintBoard issues={mockIssues} />)

      // Should not throw
      screen.getByTestId('drop-Done').click()
    })
  })

  describe('Issue Creation', () => {
    it('passes onCreateIssue to columns', () => {
      render(<SprintBoard issues={mockIssues} onCreateIssue={mockOnCreateIssue} />)

      screen.getByTestId('create-Done').click()

      expect(mockOnCreateIssue).toHaveBeenCalledWith({
        title: 'New',
        status: 'Done',
      })
    })
  })

  describe('Issue Click', () => {
    it('passes onIssueClick to columns', () => {
      render(<SprintBoard issues={mockIssues} onIssueClick={mockOnIssueClick} />)

      screen.getByTestId('click-To Do').click()

      expect(mockOnIssueClick).toHaveBeenCalled()
    })
  })

  describe('Edge Cases', () => {
    it('handles empty issues array', () => {
      render(<SprintBoard issues={[]} />)

      expect(screen.getByTestId('count-To Do')).toHaveTextContent('0')
      expect(screen.getByTestId('count-In Progress')).toHaveTextContent('0')
      expect(screen.getByTestId('count-Done')).toHaveTextContent('0')
    })

    it('handles undefined issues prop', () => {
      render(<SprintBoard />)

      expect(screen.getByTestId('column-To Do')).toBeInTheDocument()
    })

    it('handles empty statusColumns array', () => {
      render(<SprintBoard issues={mockIssues} statusColumns={[]} />)

      // No columns should be rendered
      expect(screen.queryByTestId('column-To Do')).not.toBeInTheDocument()
    })

    it('handles single status column', () => {
      render(<SprintBoard issues={mockIssues} statusColumns={['All']} />)

      expect(screen.getByTestId('column-All')).toBeInTheDocument()
    })

    it('handles many status columns', () => {
      const manyColumns = ['Backlog', 'Ready', 'In Progress', 'Review', 'QA', 'Done', 'Archived']
      render(<SprintBoard issues={[]} statusColumns={manyColumns} />)

      manyColumns.forEach((col) => {
        expect(screen.getByTestId(`column-${col}`)).toBeInTheDocument()
      })
    })

    it('maintains issue order within columns', () => {
      const orderedIssues = [
        { id: 'a', title: 'First', status: 'To Do', type: 'task' },
        { id: 'b', title: 'Second', status: 'To Do', type: 'task' },
        { id: 'c', title: 'Third', status: 'To Do', type: 'task' },
      ]
      render(<SprintBoard issues={orderedIssues} />)

      const issuesContainer = screen.getByTestId('issues-To Do')
      const issues = issuesContainer.querySelectorAll('[data-testid^="issue-"]')

      expect(issues[0]).toHaveTextContent('First')
      expect(issues[1]).toHaveTextContent('Second')
      expect(issues[2]).toHaveTextContent('Third')
    })
  })

  describe('Column Configuration', () => {
    it('uses default columns when not provided', () => {
      render(<SprintBoard issues={[]} />)

      expect(screen.getByTestId('column-To Do')).toBeInTheDocument()
      expect(screen.getByTestId('column-In Progress')).toBeInTheDocument()
      expect(screen.getByTestId('column-Done')).toBeInTheDocument()
    })

    it('respects custom column order', () => {
      const customOrder = ['Done', 'In Progress', 'To Do']
      const { container } = render(<SprintBoard issues={[]} statusColumns={customOrder} />)

      const columns = container.querySelectorAll('[data-testid^="column-"]')
      expect(columns[0]).toHaveAttribute('data-testid', 'column-Done')
      expect(columns[1]).toHaveAttribute('data-testid', 'column-In Progress')
      expect(columns[2]).toHaveAttribute('data-testid', 'column-To Do')
    })
  })
})
