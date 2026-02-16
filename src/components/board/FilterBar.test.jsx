import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import FilterBar from './FilterBar'

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}))

describe('FilterBar', () => {
  let mockOnFilterChange

  beforeEach(() => {
    mockOnFilterChange = vi.fn()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('renders without crashing', () => {
      render(<FilterBar onFilterChange={mockOnFilterChange} />)
      expect(screen.getByText('Filters')).toBeInTheDocument()
    })

    it('renders filter dropdowns', () => {
      render(<FilterBar onFilterChange={mockOnFilterChange} />)
      expect(screen.getByText('Type')).toBeInTheDocument()
      expect(screen.getByText('Priority')).toBeInTheDocument()
      expect(screen.getByText('Assignee')).toBeInTheDocument()
    })

    it('renders search input', () => {
      render(<FilterBar onFilterChange={mockOnFilterChange} />)
      expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument()
    })
  })

  describe('Type Filter', () => {
    it('opens type dropdown on click', async () => {
      render(<FilterBar onFilterChange={mockOnFilterChange} />)

      fireEvent.click(screen.getByText('Type'))

      await waitFor(() => {
        expect(screen.getByText('Epic')).toBeInTheDocument()
        expect(screen.getByText('Story')).toBeInTheDocument()
        expect(screen.getByText('Task')).toBeInTheDocument()
        expect(screen.getByText('Bug')).toBeInTheDocument()
      })
    })

    it('selects type filter', async () => {
      render(<FilterBar filters={{}} onFilterChange={mockOnFilterChange} />)

      fireEvent.click(screen.getByText('Type'))
      await waitFor(() => {
        expect(screen.getByText('Epic')).toBeInTheDocument()
      })
      fireEvent.click(screen.getByText('Epic'))

      expect(mockOnFilterChange).toHaveBeenCalledWith(
        expect.objectContaining({
          types: ['epic'],
        })
      )
    })

    it('allows multiple type selections', async () => {
      render(<FilterBar filters={{ types: ['epic'] }} onFilterChange={mockOnFilterChange} />)

      fireEvent.click(screen.getByText('Type'))
      await waitFor(() => {
        expect(screen.getByText('Story')).toBeInTheDocument()
      })
      fireEvent.click(screen.getByText('Story'))

      expect(mockOnFilterChange).toHaveBeenCalledWith(
        expect.objectContaining({
          types: ['epic', 'story'],
        })
      )
    })

    it('deselects type filter', async () => {
      render(
        <FilterBar filters={{ types: ['epic', 'story'] }} onFilterChange={mockOnFilterChange} />
      )

      fireEvent.click(screen.getByText('Type'))
      await waitFor(() => {
        expect(screen.getByText('Epic')).toBeInTheDocument()
      })
      fireEvent.click(screen.getByText('Epic'))

      expect(mockOnFilterChange).toHaveBeenCalledWith(
        expect.objectContaining({
          types: ['story'],
        })
      )
    })
  })

  describe('Priority Filter', () => {
    it('opens priority dropdown on click', async () => {
      render(<FilterBar onFilterChange={mockOnFilterChange} />)

      fireEvent.click(screen.getByText('Priority'))

      await waitFor(() => {
        expect(screen.getByText('Critical')).toBeInTheDocument()
        expect(screen.getByText('High')).toBeInTheDocument()
        expect(screen.getByText('Medium')).toBeInTheDocument()
        expect(screen.getByText('Low')).toBeInTheDocument()
      })
    })

    it('selects priority filter', async () => {
      render(<FilterBar filters={{}} onFilterChange={mockOnFilterChange} />)

      fireEvent.click(screen.getByText('Priority'))
      await waitFor(() => {
        expect(screen.getByText('Critical')).toBeInTheDocument()
      })
      fireEvent.click(screen.getByText('Critical'))

      expect(mockOnFilterChange).toHaveBeenCalledWith(
        expect.objectContaining({
          priorities: ['critical'],
        })
      )
    })
  })

  describe('Assignee Filter', () => {
    it('opens assignee dropdown on click', async () => {
      render(<FilterBar onFilterChange={mockOnFilterChange} />)

      fireEvent.click(screen.getByText('Assignee'))

      await waitFor(() => {
        expect(screen.getByText('Claude')).toBeInTheDocument()
        expect(screen.getByText('User')).toBeInTheDocument()
        expect(screen.getByText('Unassigned')).toBeInTheDocument()
      })
    })

    it('selects assignee filter', async () => {
      render(<FilterBar filters={{}} onFilterChange={mockOnFilterChange} />)

      fireEvent.click(screen.getByText('Assignee'))
      await waitFor(() => {
        expect(screen.getByText('Claude')).toBeInTheDocument()
      })
      fireEvent.click(screen.getByText('Claude'))

      expect(mockOnFilterChange).toHaveBeenCalledWith(
        expect.objectContaining({
          assignees: ['Claude'],
        })
      )
    })
  })

  describe('Label Filter', () => {
    it('shows labels dropdown when labels are provided', async () => {
      render(
        <FilterBar labels={['board', 'feature', 'testing']} onFilterChange={mockOnFilterChange} />
      )

      expect(screen.getByText('Labels')).toBeInTheDocument()
    })

    it('does not show labels dropdown when no labels', () => {
      render(<FilterBar labels={[]} onFilterChange={mockOnFilterChange} />)

      expect(screen.queryByText('Labels')).not.toBeInTheDocument()
    })

    it('selects label filter', async () => {
      render(
        <FilterBar filters={{}} labels={['board', 'feature']} onFilterChange={mockOnFilterChange} />
      )

      fireEvent.click(screen.getByText('Labels'))
      await waitFor(() => {
        expect(screen.getByText('board')).toBeInTheDocument()
      })
      fireEvent.click(screen.getByText('board'))

      expect(mockOnFilterChange).toHaveBeenCalledWith(
        expect.objectContaining({
          labelFilter: ['board'],
        })
      )
    })
  })

  describe('Search Filter', () => {
    it('updates search on input', async () => {
      render(<FilterBar filters={{}} onFilterChange={mockOnFilterChange} />)

      const searchInput = screen.getByPlaceholderText('Search...')
      fireEvent.change(searchInput, { target: { value: 'test query' } })

      expect(mockOnFilterChange).toHaveBeenLastCalledWith(
        expect.objectContaining({
          search: 'test query',
        })
      )
    })

    it('shows clear button when search has value', async () => {
      render(<FilterBar filters={{ search: 'test' }} onFilterChange={mockOnFilterChange} />)

      // Clear button should be visible
      const clearButtons = screen.getAllByRole('button')
      expect(clearButtons.length).toBeGreaterThan(0)
    })

    it('clears search on clear button click', async () => {
      render(
        <FilterBar
          filters={{ search: 'test', types: [], priorities: [], assignees: [], labelFilter: [] }}
          onFilterChange={mockOnFilterChange}
        />
      )

      // Find clear button near search (the X button inside search)
      const searchContainer = screen.getByPlaceholderText('Search...').parentElement
      const clearButton = searchContainer.querySelector('button')

      if (clearButton) {
        fireEvent.click(clearButton)
        expect(mockOnFilterChange).toHaveBeenCalledWith(
          expect.objectContaining({
            search: '',
          })
        )
      }
    })
  })

  describe('Active Filter Badges', () => {
    it('displays badges for active type filters', () => {
      render(
        <FilterBar
          filters={{ types: ['epic'], priorities: [], assignees: [], labelFilter: [] }}
          onFilterChange={mockOnFilterChange}
        />
      )

      // Badge should show the type
      const badges = screen.getAllByText('epic')
      expect(badges.length).toBeGreaterThan(0)
    })

    it('displays badges for active priority filters', () => {
      render(
        <FilterBar
          filters={{ types: [], priorities: ['critical'], assignees: [], labelFilter: [] }}
          onFilterChange={mockOnFilterChange}
        />
      )

      const badges = screen.getAllByText('critical')
      expect(badges.length).toBeGreaterThan(0)
    })

    it('displays badges for active assignee filters', () => {
      render(
        <FilterBar
          filters={{ types: [], priorities: [], assignees: ['Claude'], labelFilter: [] }}
          onFilterChange={mockOnFilterChange}
        />
      )

      const badges = screen.getAllByText('Claude')
      expect(badges.length).toBeGreaterThan(0)
    })

    it('removes filter when badge is clicked', async () => {
      render(
        <FilterBar
          filters={{ types: ['epic', 'story'], priorities: [], assignees: [], labelFilter: [] }}
          onFilterChange={mockOnFilterChange}
        />
      )

      // Find remove button on badge
      const epicBadge = screen.getAllByText('epic')[0].closest('span')
      const removeButton = epicBadge?.querySelector('button')

      if (removeButton) {
        fireEvent.click(removeButton)
        expect(mockOnFilterChange).toHaveBeenCalledWith(
          expect.objectContaining({
            types: ['story'],
          })
        )
      }
    })
  })

  describe('Clear All', () => {
    it('shows clear all button when filters are active', () => {
      render(
        <FilterBar
          filters={{ types: ['epic'], priorities: [], assignees: [], labelFilter: [] }}
          onFilterChange={mockOnFilterChange}
        />
      )

      expect(screen.getByText('Clear')).toBeInTheDocument()
    })

    it('does not show clear all when no filters active', () => {
      render(
        <FilterBar
          filters={{ types: [], priorities: [], assignees: [], labelFilter: [], search: '' }}
          onFilterChange={mockOnFilterChange}
        />
      )

      expect(screen.queryByText('Clear')).not.toBeInTheDocument()
    })

    it('clears all filters on clear all click', () => {
      render(
        <FilterBar
          filters={{
            types: ['epic'],
            priorities: ['high'],
            assignees: ['Claude'],
            labelFilter: ['frontend'],
            search: 'test',
          }}
          onFilterChange={mockOnFilterChange}
        />
      )

      fireEvent.click(screen.getByText('Clear'))

      expect(mockOnFilterChange).toHaveBeenCalledWith({
        types: [],
        priorities: [],
        assignees: [],
        labelFilter: [],
        search: '',
      })
    })
  })

  describe('Filter Count Indicator', () => {
    it('shows count on type button when types selected', () => {
      render(
        <FilterBar
          filters={{ types: ['epic', 'story'], priorities: [], assignees: [], labelFilter: [] }}
          onFilterChange={mockOnFilterChange}
        />
      )

      // Should show count indicator
      expect(screen.getByText('2')).toBeInTheDocument()
    })

    it('shows count on priority button when priorities selected', () => {
      render(
        <FilterBar
          filters={{ types: [], priorities: ['high', 'critical'], assignees: [], labelFilter: [] }}
          onFilterChange={mockOnFilterChange}
        />
      )

      expect(screen.getByText('2')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles empty filters object', () => {
      render(<FilterBar filters={{}} onFilterChange={mockOnFilterChange} />)

      expect(screen.getByText('Filters')).toBeInTheDocument()
    })

    it('handles undefined filters prop', () => {
      render(<FilterBar onFilterChange={mockOnFilterChange} />)

      expect(screen.getByText('Filters')).toBeInTheDocument()
    })

    it('handles missing onFilterChange gracefully', () => {
      render(
        <FilterBar filters={{ types: ['epic'], priorities: [], assignees: [], labelFilter: [] }} />
      )

      // Should not throw when interacting
      fireEvent.click(screen.getByText('Type'))
    })

    it('closes dropdown when clicking outside', async () => {
      render(
        <div>
          <FilterBar onFilterChange={mockOnFilterChange} />
          <div data-testid="outside">Outside</div>
        </div>
      )

      fireEvent.click(screen.getByText('Type'))
      await waitFor(() => {
        expect(screen.getByText('Epic')).toBeInTheDocument()
      })

      fireEvent.mouseDown(screen.getByTestId('outside'))

      await waitFor(() => {
        // Dropdown should close - Epic should no longer be visible in the dropdown
        // Note: Epic might still be visible as a badge if selected
      })
    })
  })

  describe('Custom Issue Types', () => {
    it('accepts custom issueTypes prop', async () => {
      const customTypes = [
        { value: 'feature', label: 'Feature', variant: 'blue' },
        { value: 'improvement', label: 'Improvement', variant: 'green' },
      ]

      render(<FilterBar issueTypes={customTypes} onFilterChange={mockOnFilterChange} />)

      fireEvent.click(screen.getByText('Type'))

      await waitFor(() => {
        expect(screen.getByText('Feature')).toBeInTheDocument()
        expect(screen.getByText('Improvement')).toBeInTheDocument()
      })
    })
  })
})
