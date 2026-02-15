import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PageEditor from './PageEditor'

// Mock the markdown utility
vi.mock('../../utils/markdown', () => ({
  renderMarkdown: vi.fn((content) => content || ''),
  wordCount: vi.fn((text) => (text ? text.split(/\s+/).filter(Boolean).length : 0)),
  readingTime: vi.fn((text) => {
    const words = text ? text.split(/\s+/).filter(Boolean).length : 0
    return Math.max(1, Math.ceil(words / 200))
  }),
}))

// Mock child components
vi.mock('./MarkdownRenderer', () => ({
  default: ({ content }) => <div data-testid="markdown-preview">{content}</div>,
}))

vi.mock('../ui/Button', () => ({
  default: ({ children, onClick, icon: Icon, ...props }) => (
    <button onClick={onClick} data-testid={`button-${children?.toLowerCase?.() || 'unknown'}`} {...props}>
      {Icon && <Icon data-testid="button-icon" />}
      {children}
    </button>
  ),
}))

vi.mock('../ui/TagInput', () => ({
  default: ({ tags, onChange, placeholder }) => (
    <div data-testid="tag-input">
      {tags.map((tag, i) => (
        <span key={i} data-testid={`tag-${tag}`}>{tag}</span>
      ))}
      <input
        placeholder={placeholder}
        onChange={(e) => {
          if (e.target.value.endsWith(',')) {
            onChange([...tags, e.target.value.slice(0, -1)])
            e.target.value = ''
          }
        }}
      />
    </div>
  ),
}))

describe('PageEditor', () => {
  const mockPage = {
    id: 'page-1',
    title: 'Test Page',
    content: 'Test content',
    labels: ['label1', 'label2'],
    icon: '📝',
  }

  const mockOnSave = vi.fn()
  const mockOnCancel = vi.fn()

  beforeEach(() => {
    vi.useFakeTimers()
    mockOnSave.mockClear()
    mockOnCancel.mockClear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('basic rendering', () => {
    it('renders without crashing', () => {
      render(<PageEditor page={mockPage} onSave={mockOnSave} onCancel={mockOnCancel} />)
      expect(screen.getByPlaceholderText('Page title...')).toBeInTheDocument()
    })

    it('displays page title', () => {
      render(<PageEditor page={mockPage} onSave={mockOnSave} onCancel={mockOnCancel} />)
      const titleInput = screen.getByPlaceholderText('Page title...')
      expect(titleInput).toHaveValue('Test Page')
    })

    it('displays page content', () => {
      render(<PageEditor page={mockPage} onSave={mockOnSave} onCancel={mockOnCancel} />)
      const textarea = screen.getByPlaceholderText('Start writing in markdown...')
      expect(textarea).toHaveValue('Test content')
    })

    it('displays page icon', () => {
      render(<PageEditor page={mockPage} onSave={mockOnSave} onCancel={mockOnCancel} />)
      const iconInput = screen.getByTitle('Page icon (emoji)')
      expect(iconInput).toHaveValue('📝')
    })

    it('shows markdown preview', () => {
      render(<PageEditor page={mockPage} onSave={mockOnSave} onCancel={mockOnCancel} />)
      expect(screen.getByTestId('markdown-preview')).toHaveTextContent('Test content')
    })
  })

  describe('toolbar buttons', () => {
    it('renders all toolbar buttons', () => {
      render(<PageEditor page={mockPage} onSave={mockOnSave} onCancel={mockOnCancel} />)

      expect(screen.getByTitle('Bold')).toBeInTheDocument()
      expect(screen.getByTitle('Italic')).toBeInTheDocument()
      expect(screen.getByTitle('Heading')).toBeInTheDocument()
      expect(screen.getByTitle('List')).toBeInTheDocument()
      expect(screen.getByTitle('Code')).toBeInTheDocument()
      expect(screen.getByTitle('Link')).toBeInTheDocument()
      expect(screen.getByTitle('Table')).toBeInTheDocument()
    })

    it('shows live preview indicator', () => {
      render(<PageEditor page={mockPage} onSave={mockOnSave} onCancel={mockOnCancel} />)
      expect(screen.getByText('Live preview')).toBeInTheDocument()
    })
  })

  describe('user interactions', () => {
    it('updates title on input', async () => {
      render(<PageEditor page={mockPage} onSave={mockOnSave} onCancel={mockOnCancel} />)
      const titleInput = screen.getByPlaceholderText('Page title...')

      fireEvent.change(titleInput, { target: { value: 'New Title' } })

      expect(titleInput).toHaveValue('New Title')
    })

    it('updates content on input', async () => {
      render(<PageEditor page={mockPage} onSave={mockOnSave} onCancel={mockOnCancel} />)
      const textarea = screen.getByPlaceholderText('Start writing in markdown...')

      fireEvent.change(textarea, { target: { value: 'New content' } })

      expect(textarea).toHaveValue('New content')
    })

    it('updates icon on input', async () => {
      render(<PageEditor page={mockPage} onSave={mockOnSave} onCancel={mockOnCancel} />)
      const iconInput = screen.getByTitle('Page icon (emoji)')

      fireEvent.change(iconInput, { target: { value: '🚀' } })

      expect(iconInput).toHaveValue('🚀')
    })

    it('calls onSave when save button is clicked', async () => {
      render(<PageEditor page={mockPage} onSave={mockOnSave} onCancel={mockOnCancel} />)

      const saveButton = screen.getByTestId('button-save')
      fireEvent.click(saveButton)

      expect(mockOnSave).toHaveBeenCalledWith({
        title: 'Test Page',
        content: 'Test content',
        labels: ['label1', 'label2'],
        icon: '📝',
      })
    })

    it('calls onCancel when cancel button is clicked', async () => {
      render(<PageEditor page={mockPage} onSave={mockOnSave} onCancel={mockOnCancel} />)

      const cancelButton = screen.getByTestId('button-cancel')
      fireEvent.click(cancelButton)

      expect(mockOnCancel).toHaveBeenCalled()
    })
  })

  describe('auto-save functionality', () => {
    it('triggers auto-save after 2 seconds of inactivity', async () => {
      render(<PageEditor page={mockPage} onSave={mockOnSave} onCancel={mockOnCancel} />)
      const textarea = screen.getByPlaceholderText('Start writing in markdown...')

      fireEvent.change(textarea, { target: { value: 'Auto-saved content' } })

      // Fast-forward 2 seconds
      act(() => {
        vi.advanceTimersByTime(2000)
      })

      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          content: 'Auto-saved content',
          _autoSave: true,
        })
      )
    })

    it('debounces auto-save on rapid typing', async () => {
      render(<PageEditor page={mockPage} onSave={mockOnSave} onCancel={mockOnCancel} />)
      const textarea = screen.getByPlaceholderText('Start writing in markdown...')

      // Simulate rapid typing
      fireEvent.change(textarea, { target: { value: 'First' } })
      act(() => { vi.advanceTimersByTime(500) })

      fireEvent.change(textarea, { target: { value: 'Second' } })
      act(() => { vi.advanceTimersByTime(500) })

      fireEvent.change(textarea, { target: { value: 'Third' } })
      act(() => { vi.advanceTimersByTime(2000) })

      // Should only be called once with the final value
      expect(mockOnSave).toHaveBeenCalledTimes(1)
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          content: 'Third',
          _autoSave: true,
        })
      )
    })

    it('clears auto-save timer on manual save', async () => {
      render(<PageEditor page={mockPage} onSave={mockOnSave} onCancel={mockOnCancel} />)
      const textarea = screen.getByPlaceholderText('Start writing in markdown...')

      fireEvent.change(textarea, { target: { value: 'Changed content' } })

      // Save before auto-save triggers
      const saveButton = screen.getByTestId('button-save')
      fireEvent.click(saveButton)

      // Advance timer
      act(() => { vi.advanceTimersByTime(3000) })

      // Should only be called once (manual save, not auto-save)
      expect(mockOnSave).toHaveBeenCalledTimes(1)
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.not.objectContaining({ _autoSave: true })
      )
    })
  })

  describe('toolbar insertion', () => {
    it('inserts bold markdown when bold button is clicked', () => {
      render(<PageEditor page={{ ...mockPage, content: '' }} onSave={mockOnSave} onCancel={mockOnCancel} />)

      const boldButton = screen.getByTitle('Bold')
      fireEvent.click(boldButton)

      const textarea = screen.getByPlaceholderText('Start writing in markdown...')
      expect(textarea).toHaveValue('**bold text**')
    })

    it('inserts italic markdown when italic button is clicked', () => {
      render(<PageEditor page={{ ...mockPage, content: '' }} onSave={mockOnSave} onCancel={mockOnCancel} />)

      const italicButton = screen.getByTitle('Italic')
      fireEvent.click(italicButton)

      const textarea = screen.getByPlaceholderText('Start writing in markdown...')
      expect(textarea).toHaveValue('*italic text*')
    })

    it('inserts heading markdown when heading button is clicked', () => {
      render(<PageEditor page={{ ...mockPage, content: '' }} onSave={mockOnSave} onCancel={mockOnCancel} />)

      const headingButton = screen.getByTitle('Heading')
      fireEvent.click(headingButton)

      const textarea = screen.getByPlaceholderText('Start writing in markdown...')
      expect(textarea).toHaveValue('## Heading')
    })

    it('inserts table markdown when table button is clicked', () => {
      render(<PageEditor page={{ ...mockPage, content: '' }} onSave={mockOnSave} onCancel={mockOnCancel} />)

      const tableButton = screen.getByTitle('Table')
      fireEvent.click(tableButton)

      const textarea = screen.getByPlaceholderText('Start writing in markdown...')
      expect(textarea.value).toContain('| Column 1 |')
    })
  })

  describe('stats display', () => {
    it('displays word count', () => {
      render(<PageEditor page={{ ...mockPage, content: 'one two three' }} onSave={mockOnSave} onCancel={mockOnCancel} />)
      expect(screen.getByText(/3 words/)).toBeInTheDocument()
    })

    it('displays reading time', () => {
      render(<PageEditor page={mockPage} onSave={mockOnSave} onCancel={mockOnCancel} />)
      expect(screen.getByText(/min read/)).toBeInTheDocument()
    })
  })

  describe('page syncing', () => {
    it('syncs state when page prop changes', () => {
      const { rerender } = render(
        <PageEditor page={mockPage} onSave={mockOnSave} onCancel={mockOnCancel} />
      )

      const newPage = {
        id: 'page-2',
        title: 'Different Page',
        content: 'Different content',
        labels: ['new-label'],
        icon: '🆕',
      }

      rerender(<PageEditor page={newPage} onSave={mockOnSave} onCancel={mockOnCancel} />)

      expect(screen.getByPlaceholderText('Page title...')).toHaveValue('Different Page')
      expect(screen.getByPlaceholderText('Start writing in markdown...')).toHaveValue('Different content')
    })
  })

  describe('empty page handling', () => {
    it('handles empty page gracefully', () => {
      render(<PageEditor page={{}} onSave={mockOnSave} onCancel={mockOnCancel} />)

      expect(screen.getByPlaceholderText('Page title...')).toHaveValue('')
      expect(screen.getByPlaceholderText('Start writing in markdown...')).toHaveValue('')
    })

    it('handles null page gracefully', () => {
      render(<PageEditor page={null} onSave={mockOnSave} onCancel={mockOnCancel} />)

      expect(screen.getByPlaceholderText('Page title...')).toHaveValue('')
    })

    it('handles undefined page gracefully', () => {
      render(<PageEditor onSave={mockOnSave} onCancel={mockOnCancel} />)

      expect(screen.getByPlaceholderText('Page title...')).toHaveValue('')
    })
  })

  describe('edge cases', () => {
    it('limits icon input to 2 characters', () => {
      render(<PageEditor page={mockPage} onSave={mockOnSave} onCancel={mockOnCancel} />)
      const iconInput = screen.getByTitle('Page icon (emoji)')
      expect(iconInput).toHaveAttribute('maxLength', '2')
    })

    it('handles very long content', () => {
      const longContent = 'A'.repeat(10000)
      render(
        <PageEditor
          page={{ ...mockPage, content: longContent }}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      )

      const textarea = screen.getByPlaceholderText('Start writing in markdown...')
      expect(textarea).toHaveValue(longContent)
    })
  })
})
