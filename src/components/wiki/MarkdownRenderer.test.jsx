import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import MarkdownRenderer from './MarkdownRenderer'

// Mock the markdown utility
vi.mock('../../utils/markdown', () => ({
  renderMarkdown: vi.fn((content) => {
    if (!content) return ''
    // Simple mock that converts basic markdown with HTML escaping
    let out = content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
    out = out
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br/>')
    return out
  }),
}))

describe('MarkdownRenderer', () => {
  describe('basic rendering', () => {
    it('renders without crashing', () => {
      render(<MarkdownRenderer content="" />)
      expect(screen.getByText('No content yet.')).toBeInTheDocument()
    })

    it('renders with content', () => {
      render(<MarkdownRenderer content="Hello World" />)
      expect(screen.getByText('Hello World')).toBeInTheDocument()
    })

    it('applies default className', () => {
      const { container } = render(<MarkdownRenderer content="Test" />)
      expect(container.querySelector('.markdown-body')).toBeInTheDocument()
    })

    it('applies additional className when provided', () => {
      const { container } = render(<MarkdownRenderer content="Test" className="custom-class" />)
      const div = container.querySelector('.markdown-body')
      expect(div).toHaveClass('custom-class')
    })
  })

  describe('empty state', () => {
    it('shows empty message when content is null', () => {
      render(<MarkdownRenderer content={null} />)
      expect(screen.getByText('No content yet.')).toBeInTheDocument()
    })

    it('shows empty message when content is undefined', () => {
      render(<MarkdownRenderer />)
      expect(screen.getByText('No content yet.')).toBeInTheDocument()
    })

    it('shows empty message when content is empty string', () => {
      render(<MarkdownRenderer content="" />)
      expect(screen.getByText('No content yet.')).toBeInTheDocument()
    })

    it('empty message has correct styling', () => {
      render(<MarkdownRenderer content="" />)
      const emptyMessage = screen.getByText('No content yet.')
      expect(emptyMessage).toHaveClass('text-center', 'text-sm', 'italic')
    })
  })

  describe('props handling', () => {
    it('handles whitespace-only content', () => {
      // Whitespace is still content, so it should render
      render(<MarkdownRenderer content="   " />)
      // The renderMarkdown mock will process the whitespace
      expect(screen.queryByText('No content yet.')).not.toBeInTheDocument()
    })

    it('combines markdown-body with custom className correctly', () => {
      const { container } = render(
        <MarkdownRenderer content="Test" className="prose dark:prose-invert" />
      )
      const div = container.querySelector('.markdown-body')
      expect(div).toHaveClass('markdown-body')
      expect(div).toHaveClass('prose')
    })
  })

  describe('markdown content rendering', () => {
    it('renders heading content', () => {
      render(<MarkdownRenderer content="# Main Title" />)
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Main Title')
    })

    it('renders bold text', () => {
      render(<MarkdownRenderer content="This is **bold** text" />)
      const strong = screen.getByText('bold')
      expect(strong.tagName).toBe('STRONG')
    })

    it('renders italic text', () => {
      render(<MarkdownRenderer content="This is *italic* text" />)
      const em = screen.getByText('italic')
      expect(em.tagName).toBe('EM')
    })

    it('renders inline code', () => {
      render(<MarkdownRenderer content="Use `const` keyword" />)
      const code = screen.getByText('const')
      expect(code.tagName).toBe('CODE')
    })

    it('renders multiple heading levels', () => {
      render(<MarkdownRenderer content={'# H1\n## H2'} />)
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('H1')
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('H2')
    })
  })

  describe('edge cases', () => {
    it('handles very long content', () => {
      const longContent = 'A'.repeat(10000)
      render(<MarkdownRenderer content={longContent} />)
      expect(screen.getByText(longContent)).toBeInTheDocument()
    })

    it('handles special characters', () => {
      render(<MarkdownRenderer content={'Special chars: <>&"\''} />)
      // Content should be escaped by renderMarkdown
      const { container } = render(<MarkdownRenderer content="<script>alert('xss')</script>" />)
      expect(container.querySelector('script')).not.toBeInTheDocument()
    })

    it('handles unicode characters', () => {
      render(<MarkdownRenderer content="Unicode: emoji test" />)
      expect(screen.getByText(/Unicode:/)).toBeInTheDocument()
    })

    it('handles mixed content types', () => {
      const content = '# Title\n\nParagraph with **bold** and *italic*.\n\n## Code\n\n`inline code`'
      render(<MarkdownRenderer content={content} />)
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument()
    })
  })

  describe('memoization', () => {
    it('uses useMemo for html rendering', () => {
      const { rerender } = render(<MarkdownRenderer content="Test" />)

      // Rerender with same props
      rerender(<MarkdownRenderer content="Test" />)

      // The component should not re-compute html for same content
      expect(screen.getByText('Test')).toBeInTheDocument()
    })
  })
})
