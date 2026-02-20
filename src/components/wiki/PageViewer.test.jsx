import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import PageViewer from './PageViewer'

// Mock utils
vi.mock('../../utils/dates', () => ({
  formatRelative: vi.fn((_date) => 'just now'),
}))

// Mock child components
vi.mock('./MarkdownRenderer', () => ({
  default: ({ content }) => <div data-testid="markdown-renderer">{content}</div>,
}))

vi.mock('../ui/Button', () => ({
  default: ({ children, onClick, icon: Icon, className, title, ...props }) => (
    <button
      onClick={onClick}
      data-testid={`button-${children?.toLowerCase?.() || 'icon'}`}
      className={className}
      title={title}
      {...props}
    >
      {Icon && <Icon data-testid="button-icon" />}
      {children}
    </button>
  ),
}))

vi.mock('../ui/Badge', () => ({
  default: ({ children, variant, size }) => (
    <span data-testid={`badge-${children}`} data-variant={variant} data-size={size}>
      {children}
    </span>
  ),
}))

describe('PageViewer', () => {
  const mockPage = {
    id: 'page-1',
    title: 'Test Page',
    content: '# Hello World\n\nThis is content.',
    icon: '📝',
    status: 'published',
    labels: ['documentation', 'api'],
    updatedAt: '2024-01-15T10:30:00Z',
    pinned: false,
    versions: [
      { id: 'v1', content: 'Old content', editedAt: '2024-01-14T10:00:00Z' },
      { id: 'v2', content: 'Older content', editedAt: '2024-01-13T10:00:00Z' },
    ],
  }

  const mockOnEdit = vi.fn()
  const mockOnDelete = vi.fn()
  const mockOnTogglePin = vi.fn()
  const mockOnShowVersions = vi.fn()

  beforeEach(() => {
    mockOnEdit.mockClear()
    mockOnDelete.mockClear()
    mockOnTogglePin.mockClear()
    mockOnShowVersions.mockClear()
  })

  describe('basic rendering', () => {
    it('renders without crashing', () => {
      render(<PageViewer page={mockPage} />)
      expect(screen.getByText('Test Page')).toBeInTheDocument()
    })

    it('renders page title', () => {
      render(<PageViewer page={mockPage} />)
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Test Page')
    })

    it('renders page icon when provided', () => {
      render(<PageViewer page={mockPage} />)
      expect(screen.getByText('📝')).toBeInTheDocument()
    })

    it('renders page content via MarkdownRenderer', () => {
      render(<PageViewer page={mockPage} />)
      expect(screen.getByTestId('markdown-renderer')).toHaveTextContent('# Hello World')
    })

    it('renders status badge', () => {
      render(<PageViewer page={mockPage} />)
      expect(screen.getByTestId('badge-published')).toBeInTheDocument()
    })

    it('renders labels as badges', () => {
      render(<PageViewer page={mockPage} />)
      expect(screen.getByTestId('badge-documentation')).toBeInTheDocument()
      expect(screen.getByTestId('badge-api')).toBeInTheDocument()
    })

    it('renders updated timestamp', () => {
      render(<PageViewer page={mockPage} />)
      expect(screen.getByText(/Updated/)).toBeInTheDocument()
      expect(screen.getByText(/just now/)).toBeInTheDocument()
    })
  })

  describe('null page handling', () => {
    it('returns null when page is null', () => {
      const { container } = render(<PageViewer page={null} />)
      expect(container).toBeEmptyDOMElement()
    })

    it('returns null when page is undefined', () => {
      const { container } = render(<PageViewer />)
      expect(container).toBeEmptyDOMElement()
    })
  })

  describe('action buttons', () => {
    it('renders Edit button', () => {
      render(<PageViewer page={mockPage} onEdit={mockOnEdit} />)
      expect(screen.getByTestId('button-edit')).toBeInTheDocument()
    })

    it('renders Delete button', () => {
      render(<PageViewer page={mockPage} onDelete={mockOnDelete} />)
      // Delete button is icon-only with red text styling
      const buttons = screen.getAllByRole('button')
      const deleteButton = buttons.find(
        (btn) => typeof btn.className === 'string' && btn.className.includes('text-red')
      )
      expect(deleteButton).toBeInTheDocument()
    })

    it('calls onEdit when Edit button is clicked', () => {
      render(<PageViewer page={mockPage} onEdit={mockOnEdit} />)
      fireEvent.click(screen.getByTestId('button-edit'))
      expect(mockOnEdit).toHaveBeenCalled()
    })

    it('calls onDelete when Delete button is clicked', () => {
      render(<PageViewer page={mockPage} onDelete={mockOnDelete} />)
      // Find the delete button (ghost variant with red text)
      const buttons = screen.getAllByRole('button')
      const deleteButton = buttons.find((btn) => btn.className.includes('text-red'))
      fireEvent.click(deleteButton)
      expect(mockOnDelete).toHaveBeenCalled()
    })
  })

  describe('pin functionality', () => {
    it('shows Pin button when onTogglePin is provided and page is not pinned', () => {
      render(<PageViewer page={mockPage} onTogglePin={mockOnTogglePin} />)
      const pinButton = screen.getByTitle('Pin page')
      expect(pinButton).toBeInTheDocument()
    })

    it('shows Unpin button when page is pinned', () => {
      const pinnedPage = { ...mockPage, pinned: true }
      render(<PageViewer page={pinnedPage} onTogglePin={mockOnTogglePin} />)
      const unpinButton = screen.getByTitle('Unpin page')
      expect(unpinButton).toBeInTheDocument()
    })

    it('calls onTogglePin with page ID when clicked', () => {
      render(<PageViewer page={mockPage} onTogglePin={mockOnTogglePin} />)
      const pinButton = screen.getByTitle('Pin page')
      fireEvent.click(pinButton)
      expect(mockOnTogglePin).toHaveBeenCalledWith('page-1')
    })

    it('does not show pin button when onTogglePin is not provided', () => {
      render(<PageViewer page={mockPage} />)
      expect(screen.queryByTitle('Pin page')).not.toBeInTheDocument()
    })
  })

  describe('version history', () => {
    it('shows History button when versions exist and onShowVersions is provided', () => {
      render(<PageViewer page={mockPage} onShowVersions={mockOnShowVersions} />)
      expect(screen.getByText(/History/)).toBeInTheDocument()
    })

    it('displays version count', () => {
      render(<PageViewer page={mockPage} onShowVersions={mockOnShowVersions} />)
      expect(screen.getByText('History (2)')).toBeInTheDocument()
    })

    it('calls onShowVersions when History button is clicked', () => {
      render(<PageViewer page={mockPage} onShowVersions={mockOnShowVersions} />)
      fireEvent.click(screen.getByText('History (2)'))
      expect(mockOnShowVersions).toHaveBeenCalled()
    })

    it('does not show History button when no versions', () => {
      const pageNoVersions = { ...mockPage, versions: [] }
      render(<PageViewer page={pageNoVersions} onShowVersions={mockOnShowVersions} />)
      expect(screen.queryByText(/History/)).not.toBeInTheDocument()
    })

    it('does not show History button when onShowVersions is not provided', () => {
      render(<PageViewer page={mockPage} />)
      expect(screen.queryByText(/History/)).not.toBeInTheDocument()
    })
  })

  describe('status variants', () => {
    it('uses green variant for published status', () => {
      render(<PageViewer page={mockPage} />)
      const badge = screen.getByTestId('badge-published')
      expect(badge).toHaveAttribute('data-variant', 'green')
    })

    it('uses yellow variant for draft status', () => {
      const draftPage = { ...mockPage, status: 'draft' }
      render(<PageViewer page={draftPage} />)
      const badge = screen.getByTestId('badge-draft')
      expect(badge).toHaveAttribute('data-variant', 'yellow')
    })

    it('defaults to draft when no status', () => {
      const noStatusPage = { ...mockPage, status: undefined }
      render(<PageViewer page={noStatusPage} />)
      expect(screen.getByTestId('badge-draft')).toBeInTheDocument()
    })
  })

  describe('edge cases', () => {
    it('shows Untitled when title is empty', () => {
      const untitledPage = { ...mockPage, title: '' }
      render(<PageViewer page={untitledPage} />)
      expect(screen.getByText('Untitled')).toBeInTheDocument()
    })

    it('handles page without icon', () => {
      const noIconPage = { ...mockPage, icon: undefined }
      render(<PageViewer page={noIconPage} />)
      expect(screen.getByText('Test Page')).toBeInTheDocument()
      expect(screen.queryByText('📝')).not.toBeInTheDocument()
    })

    it('handles page without labels', () => {
      const noLabelsPage = { ...mockPage, labels: undefined }
      render(<PageViewer page={noLabelsPage} />)
      // Should not crash and should render page title
      expect(screen.getByText('Test Page')).toBeInTheDocument()
    })

    it('handles empty labels array', () => {
      const emptyLabelsPage = { ...mockPage, labels: [] }
      render(<PageViewer page={emptyLabelsPage} />)
      expect(screen.getByText('Test Page')).toBeInTheDocument()
    })

    it('handles page without content', () => {
      const noContentPage = { ...mockPage, content: '' }
      render(<PageViewer page={noContentPage} />)
      expect(screen.getByTestId('markdown-renderer')).toBeInTheDocument()
    })

    it('handles very long title', () => {
      const longTitlePage = { ...mockPage, title: 'A'.repeat(200) }
      render(<PageViewer page={longTitlePage} />)
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('A'.repeat(200))
    })
  })

  describe('label badge styling', () => {
    it('uses purple variant for labels', () => {
      render(<PageViewer page={mockPage} />)
      const labelBadge = screen.getByTestId('badge-documentation')
      expect(labelBadge).toHaveAttribute('data-variant', 'purple')
    })

    it('uses xs size for label badges', () => {
      render(<PageViewer page={mockPage} />)
      const labelBadge = screen.getByTestId('badge-api')
      expect(labelBadge).toHaveAttribute('data-size', 'xs')
    })
  })
})
