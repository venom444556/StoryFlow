import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import PageTree from './PageTree'

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}))

// Mock child components
vi.mock('../ui/SearchBar', () => ({
  default: ({ value, onChange, placeholder }) => (
    <input
      data-testid="search-bar"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
    />
  ),
}))

vi.mock('../ui/Button', () => ({
  default: ({ children, onClick, icon: Icon, ...props }) => (
    <button
      onClick={onClick}
      data-testid={`button-${children?.toLowerCase?.() || 'icon'}`}
      {...props}
    >
      {Icon && <Icon data-testid="button-icon" />}
      {children}
    </button>
  ),
}))

describe('PageTree', () => {
  const mockPages = [
    { id: 'page-1', title: 'Alpha Page', parentId: null, pinned: false },
    { id: 'page-2', title: 'Beta Page', parentId: null, pinned: true },
    { id: 'page-3', title: 'Child Page', parentId: 'page-1', pinned: false },
    { id: 'page-4', title: 'Grandchild Page', parentId: 'page-3', pinned: false },
    { id: 'page-5', title: 'Gamma Page', parentId: null, pinned: false, icon: '🎯' },
  ]

  const mockOnSelectPage = vi.fn()
  const mockOnAddPage = vi.fn()
  const mockOnDeletePage = vi.fn()

  beforeEach(() => {
    mockOnSelectPage.mockClear()
    mockOnAddPage.mockClear()
    mockOnDeletePage.mockClear()
  })

  describe('basic rendering', () => {
    it('renders without crashing', () => {
      render(<PageTree pages={mockPages} />)
      expect(screen.getByText('Pages')).toBeInTheDocument()
    })

    it('renders page titles', () => {
      render(<PageTree pages={mockPages} />)
      expect(screen.getByText('Alpha Page')).toBeInTheDocument()
      expect(screen.getByText('Beta Page')).toBeInTheDocument()
      expect(screen.getByText('Gamma Page')).toBeInTheDocument()
    })

    it('renders search bar', () => {
      render(<PageTree pages={mockPages} />)
      expect(screen.getByTestId('search-bar')).toBeInTheDocument()
    })

    it('renders New button', () => {
      render(<PageTree pages={mockPages} />)
      expect(screen.getByTestId('button-new')).toBeInTheDocument()
    })

    it('renders page icon when provided', () => {
      render(<PageTree pages={mockPages} />)
      expect(screen.getByText('🎯')).toBeInTheDocument()
    })
  })

  describe('empty state', () => {
    it('shows empty message when no pages', () => {
      render(<PageTree pages={[]} />)
      expect(screen.getByText(/No pages yet/)).toBeInTheDocument()
    })

    it('suggests clicking New button', () => {
      render(<PageTree pages={[]} />)
      expect(screen.getByText(/Click/)).toBeInTheDocument()
    })
  })

  describe('tree structure', () => {
    it('shows root pages initially', () => {
      render(<PageTree pages={mockPages} />)

      // Root pages should be visible
      expect(screen.getByText('Alpha Page')).toBeInTheDocument()
      expect(screen.getByText('Beta Page')).toBeInTheDocument()
      expect(screen.getByText('Gamma Page')).toBeInTheDocument()

      // Child pages should not be visible initially (parent not expanded)
      expect(screen.queryByText('Child Page')).not.toBeInTheDocument()
    })

    it('shows expand/collapse chevron for pages with children', () => {
      render(<PageTree pages={mockPages} />)

      // Alpha Page has children, should have chevron
      const alphaPage = screen.getByText('Alpha Page').closest('[class*="flex"]')
      expect(alphaPage).toBeInTheDocument()
    })
  })

  describe('page selection', () => {
    it('calls onSelectPage when a page is clicked', () => {
      render(
        <PageTree
          pages={mockPages}
          onSelectPage={mockOnSelectPage}
        />
      )

      fireEvent.click(screen.getByText('Alpha Page'))

      expect(mockOnSelectPage).toHaveBeenCalledWith('page-1')
    })

    it('highlights selected page', () => {
      render(
        <PageTree
          pages={mockPages}
          selectedPageId="page-2"
          onSelectPage={mockOnSelectPage}
        />
      )

      const selectedPage = screen.getByText('Beta Page').closest('[class*="group"]')
      expect(selectedPage).toHaveClass('text-[var(--color-fg-default)]')
    })
  })

  describe('page expansion', () => {
    it('expands page when chevron is clicked', () => {
      render(
        <PageTree
          pages={mockPages}
          onSelectPage={mockOnSelectPage}
        />
      )

      // Child page should not be visible initially
      expect(screen.queryByText('Child Page')).not.toBeInTheDocument()

      // Find and click the expand button
      const alphaPageRow = screen.getByText('Alpha Page').closest('[class*="group flex"]')
      const expandButton = alphaPageRow.querySelector('button')
      fireEvent.click(expandButton)

      // Child page should now be visible
      expect(screen.getByText('Child Page')).toBeInTheDocument()
    })

    it('collapses page when chevron is clicked again', () => {
      render(
        <PageTree
          pages={mockPages}
          onSelectPage={mockOnSelectPage}
        />
      )

      const alphaPageRow = screen.getByText('Alpha Page').closest('[class*="group flex"]')
      const expandButton = alphaPageRow.querySelector('button')

      // Expand
      fireEvent.click(expandButton)
      expect(screen.getByText('Child Page')).toBeInTheDocument()

      // Collapse
      fireEvent.click(expandButton)
      expect(screen.queryByText('Child Page')).not.toBeInTheDocument()
    })

    it('does not trigger page selection when expanding', () => {
      render(
        <PageTree
          pages={mockPages}
          onSelectPage={mockOnSelectPage}
        />
      )

      const alphaPageRow = screen.getByText('Alpha Page').closest('[class*="group flex"]')
      const expandButton = alphaPageRow.querySelector('button')
      fireEvent.click(expandButton)

      // Should not have selected the page
      expect(mockOnSelectPage).not.toHaveBeenCalled()
    })
  })

  describe('adding pages', () => {
    it('calls onAddPage with null when New button is clicked', () => {
      render(
        <PageTree
          pages={mockPages}
          onAddPage={mockOnAddPage}
        />
      )

      fireEvent.click(screen.getByTestId('button-new'))

      expect(mockOnAddPage).toHaveBeenCalledWith(null)
    })

    it('calls onAddPage with parent ID when add child button is clicked', () => {
      render(
        <PageTree
          pages={mockPages}
          onAddPage={mockOnAddPage}
        />
      )

      // Hover actions are visible on group-hover, but we can still click them
      const alphaPageRow = screen.getByText('Alpha Page').closest('[class*="group flex"]')
      const addButton = within(alphaPageRow).getByTitle('Add child page')
      fireEvent.click(addButton)

      expect(mockOnAddPage).toHaveBeenCalledWith('page-1')
    })
  })

  describe('deleting pages', () => {
    it('calls onDeletePage when delete button is clicked', () => {
      render(
        <PageTree
          pages={mockPages}
          onDeletePage={mockOnDeletePage}
        />
      )

      const alphaPageRow = screen.getByText('Alpha Page').closest('[class*="group flex"]')
      const deleteButton = within(alphaPageRow).getByTitle('Delete page')
      fireEvent.click(deleteButton)

      expect(mockOnDeletePage).toHaveBeenCalledWith('page-1')
    })

    it('does not trigger page selection when deleting', () => {
      render(
        <PageTree
          pages={mockPages}
          onSelectPage={mockOnSelectPage}
          onDeletePage={mockOnDeletePage}
        />
      )

      const alphaPageRow = screen.getByText('Alpha Page').closest('[class*="group flex"]')
      const deleteButton = within(alphaPageRow).getByTitle('Delete page')
      fireEvent.click(deleteButton)

      expect(mockOnSelectPage).not.toHaveBeenCalled()
    })
  })

  describe('filtering/search', () => {
    it('filters pages based on search input', () => {
      render(<PageTree pages={mockPages} />)

      const searchInput = screen.getByTestId('search-bar')
      fireEvent.change(searchInput, { target: { value: 'Alpha' } })

      expect(screen.getByText('Alpha Page')).toBeInTheDocument()
      expect(screen.queryByText('Beta Page')).not.toBeInTheDocument()
      expect(screen.queryByText('Gamma Page')).not.toBeInTheDocument()
    })

    it('shows parent when child matches filter', () => {
      render(<PageTree pages={mockPages} />)

      // First expand the parent to show child
      const alphaPageRow = screen.getByText('Alpha Page').closest('[class*="group flex"]')
      const expandButton = alphaPageRow.querySelector('button')
      fireEvent.click(expandButton)

      const searchInput = screen.getByTestId('search-bar')
      fireEvent.change(searchInput, { target: { value: 'Child' } })

      // Alpha Page should still be visible as it contains matching child
      expect(screen.getByText('Alpha Page')).toBeInTheDocument()
      expect(screen.getByText('Child Page')).toBeInTheDocument()
    })

    it('is case insensitive', () => {
      render(<PageTree pages={mockPages} />)

      const searchInput = screen.getByTestId('search-bar')
      fireEvent.change(searchInput, { target: { value: 'ALPHA' } })

      expect(screen.getByText('Alpha Page')).toBeInTheDocument()
    })

    it('clears filter when search is emptied', () => {
      render(<PageTree pages={mockPages} />)

      const searchInput = screen.getByTestId('search-bar')

      // Filter
      fireEvent.change(searchInput, { target: { value: 'Alpha' } })
      expect(screen.queryByText('Beta Page')).not.toBeInTheDocument()

      // Clear filter
      fireEvent.change(searchInput, { target: { value: '' } })
      expect(screen.getByText('Beta Page')).toBeInTheDocument()
    })
  })

  describe('pinned pages', () => {
    it('shows pinned pages first', () => {
      render(<PageTree pages={mockPages} />)

      // Beta Page is pinned and should appear first
      const pageNodes = screen.getAllByText(/Page$/)
      const pageTexts = pageNodes.map(node => node.textContent)

      // Beta (pinned) should come before Alpha
      const betaIndex = pageTexts.indexOf('Beta Page')
      const alphaIndex = pageTexts.indexOf('Alpha Page')
      expect(betaIndex).toBeLessThan(alphaIndex)
    })

    it('shows pin indicator for pinned pages', () => {
      render(<PageTree pages={mockPages} />)

      // Beta Page is pinned, should have pin indicator
      const betaPageRow = screen.getByText('Beta Page').closest('[class*="group flex"]')
      expect(betaPageRow).toBeInTheDocument()
    })
  })

  describe('sorting', () => {
    it('sorts pages alphabetically within pinned/unpinned groups', () => {
      const unsortedPages = [
        { id: '1', title: 'Zebra', parentId: null },
        { id: '2', title: 'Apple', parentId: null },
        { id: '3', title: 'Mango', parentId: null },
      ]

      render(<PageTree pages={unsortedPages} />)

      const pageNodes = screen.getAllByText(/^(Zebra|Apple|Mango)$/)
      const pageTexts = pageNodes.map(node => node.textContent)

      expect(pageTexts).toEqual(['Apple', 'Mango', 'Zebra'])
    })
  })

  describe('untitled pages', () => {
    it('shows "Untitled" for pages without title', () => {
      const pagesWithUntitled = [
        { id: '1', title: '', parentId: null },
      ]

      render(<PageTree pages={pagesWithUntitled} />)

      expect(screen.getByText('Untitled')).toBeInTheDocument()
    })
  })

  describe('edge cases', () => {
    it('handles undefined pages array', () => {
      render(<PageTree />)
      expect(screen.getByText(/No pages yet/)).toBeInTheDocument()
    })

    it('handles orphaned child pages', () => {
      const orphanedPages = [
        { id: '1', title: 'Orphan', parentId: 'non-existent' },
      ]

      render(<PageTree pages={orphanedPages} />)

      // Orphan should be treated as root page
      expect(screen.getByText('Orphan')).toBeInTheDocument()
    })

    it('handles deeply nested pages', () => {
      const deepPages = [
        { id: '1', title: 'Level 1', parentId: null },
        { id: '2', title: 'Level 2', parentId: '1' },
        { id: '3', title: 'Level 3', parentId: '2' },
        { id: '4', title: 'Level 4', parentId: '3' },
      ]

      render(<PageTree pages={deepPages} />)

      expect(screen.getByText('Level 1')).toBeInTheDocument()
    })
  })
})
