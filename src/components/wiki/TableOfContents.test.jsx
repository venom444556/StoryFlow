import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import TableOfContents from './TableOfContents'

// Mock the markdown utility
vi.mock('../../utils/markdown', () => ({
  extractHeadings: vi.fn((markdown) => {
    if (!markdown) return []

    const headings = []
    const lines = markdown.split('\n')

    for (const line of lines) {
      const match = line.match(/^(#{1,6})\s+(.+)$/)
      if (match) {
        const level = match[1].length
        const text = match[2].trim()
        const id = text
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
        headings.push({ level, text, id })
      }
    }

    return headings
  }),
}))

describe('TableOfContents', () => {
  const mockOnHeadingClick = vi.fn()

  beforeEach(() => {
    mockOnHeadingClick.mockClear()
  })

  describe('basic rendering', () => {
    it('renders when there are 2+ headings', () => {
      const markdown = '# First Heading\n\n## Second Heading'
      render(<TableOfContents markdown={markdown} onHeadingClick={mockOnHeadingClick} />)

      expect(screen.getByText('On this page')).toBeInTheDocument()
      expect(screen.getByText('First Heading')).toBeInTheDocument()
      expect(screen.getByText('Second Heading')).toBeInTheDocument()
    })

    it('returns null when fewer than 2 headings', () => {
      const markdown = '# Only One Heading'
      const { container } = render(
        <TableOfContents markdown={markdown} onHeadingClick={mockOnHeadingClick} />
      )

      expect(container).toBeEmptyDOMElement()
    })

    it('returns null when no headings', () => {
      const markdown = 'Just some regular text without headings.'
      const { container } = render(
        <TableOfContents markdown={markdown} onHeadingClick={mockOnHeadingClick} />
      )

      expect(container).toBeEmptyDOMElement()
    })

    it('returns null when markdown is empty', () => {
      const { container } = render(
        <TableOfContents markdown="" onHeadingClick={mockOnHeadingClick} />
      )

      expect(container).toBeEmptyDOMElement()
    })

    it('returns null when markdown is null', () => {
      const { container } = render(
        <TableOfContents markdown={null} onHeadingClick={mockOnHeadingClick} />
      )

      expect(container).toBeEmptyDOMElement()
    })
  })

  describe('heading display', () => {
    it('displays all headings', () => {
      const markdown = '# H1\n## H2\n### H3\n#### H4'
      render(<TableOfContents markdown={markdown} onHeadingClick={mockOnHeadingClick} />)

      expect(screen.getByText('H1')).toBeInTheDocument()
      expect(screen.getByText('H2')).toBeInTheDocument()
      expect(screen.getByText('H3')).toBeInTheDocument()
      expect(screen.getByText('H4')).toBeInTheDocument()
    })

    it('renders headings as buttons', () => {
      const markdown = '# First\n## Second'
      render(<TableOfContents markdown={markdown} onHeadingClick={mockOnHeadingClick} />)

      expect(screen.getByRole('button', { name: 'First' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Second' })).toBeInTheDocument()
    })
  })

  describe('heading click interaction', () => {
    it('calls onHeadingClick with heading id when clicked', () => {
      const markdown = '# Test Heading\n## Another Heading'
      render(<TableOfContents markdown={markdown} onHeadingClick={mockOnHeadingClick} />)

      fireEvent.click(screen.getByText('Test Heading'))

      expect(mockOnHeadingClick).toHaveBeenCalledWith('test-heading')
    })

    it('handles special characters in heading id', () => {
      const markdown = '# Hello World!\n## Second Heading'
      render(<TableOfContents markdown={markdown} onHeadingClick={mockOnHeadingClick} />)

      fireEvent.click(screen.getByText('Hello World!'))

      expect(mockOnHeadingClick).toHaveBeenCalledWith('hello-world')
    })

    it('does not crash when onHeadingClick is not provided', () => {
      const markdown = '# First\n## Second'
      render(<TableOfContents markdown={markdown} />)

      // Should not throw
      fireEvent.click(screen.getByText('First'))
    })
  })

  describe('indentation', () => {
    it('indents headings based on level', () => {
      const markdown = '# Level 1\n## Level 2\n### Level 3'
      render(<TableOfContents markdown={markdown} onHeadingClick={mockOnHeadingClick} />)

      const h1Button = screen.getByText('Level 1')
      const h2Button = screen.getByText('Level 2')
      const h3Button = screen.getByText('Level 3')

      // Check that buttons have different padding (indentation)
      // H1 is minimum level, so 0 indent
      expect(h1Button).toHaveStyle({ paddingLeft: '8px' })
      // H2 is level 2, so 12px more indent
      expect(h2Button).toHaveStyle({ paddingLeft: '20px' })
      // H3 is level 3, so 24px more indent
      expect(h3Button).toHaveStyle({ paddingLeft: '32px' })
    })

    it('normalizes indentation to minimum level', () => {
      const markdown = '## H2\n### H3' // No H1, so H2 is the minimum
      render(<TableOfContents markdown={markdown} onHeadingClick={mockOnHeadingClick} />)

      const h2Button = screen.getByText('H2')
      const h3Button = screen.getByText('H3')

      // H2 should be at base indent (0 * 12 + 8 = 8)
      expect(h2Button).toHaveStyle({ paddingLeft: '8px' })
      // H3 should be 1 level deeper (1 * 12 + 8 = 20)
      expect(h3Button).toHaveStyle({ paddingLeft: '20px' })
    })
  })

  describe('title attribute', () => {
    it('sets title attribute for long headings', () => {
      const markdown = '# Short\n## Another Short'
      render(<TableOfContents markdown={markdown} onHeadingClick={mockOnHeadingClick} />)

      const button = screen.getByText('Short')
      expect(button).toHaveAttribute('title', 'Short')
    })
  })

  describe('memoization', () => {
    it('uses useMemo for extracting headings', () => {
      const markdown = '# First\n## Second'
      const { rerender } = render(
        <TableOfContents markdown={markdown} onHeadingClick={mockOnHeadingClick} />
      )

      // Rerender with same markdown
      rerender(<TableOfContents markdown={markdown} onHeadingClick={mockOnHeadingClick} />)

      // Should still render correctly
      expect(screen.getByText('First')).toBeInTheDocument()
    })
  })

  describe('styling', () => {
    it('has glass-card styling', () => {
      const markdown = '# First\n## Second'
      const { container } = render(
        <TableOfContents markdown={markdown} onHeadingClick={mockOnHeadingClick} />
      )

      expect(container.querySelector('.glass-card')).toBeInTheDocument()
    })

    it('is hidden on mobile (md:block)', () => {
      const markdown = '# First\n## Second'
      const { container } = render(
        <TableOfContents markdown={markdown} onHeadingClick={mockOnHeadingClick} />
      )

      const wrapper = container.firstChild
      expect(wrapper).toHaveClass('hidden')
      expect(wrapper).toHaveClass('md:block')
    })
  })

  describe('edge cases', () => {
    it('handles headings with same text', () => {
      const markdown = '# Introduction\n## Introduction\n### Introduction'
      render(<TableOfContents markdown={markdown} onHeadingClick={mockOnHeadingClick} />)

      const buttons = screen.getAllByText('Introduction')
      expect(buttons).toHaveLength(3)
    })

    it('handles headings with only numbers', () => {
      const markdown = '# 123\n## 456'
      render(<TableOfContents markdown={markdown} onHeadingClick={mockOnHeadingClick} />)

      expect(screen.getByText('123')).toBeInTheDocument()
      expect(screen.getByText('456')).toBeInTheDocument()
    })

    it('handles headings with markdown syntax in text', () => {
      const markdown = '# **Bold Title**\n## _Italic Title_'
      render(<TableOfContents markdown={markdown} onHeadingClick={mockOnHeadingClick} />)

      expect(screen.getByText('**Bold Title**')).toBeInTheDocument()
      expect(screen.getByText('_Italic Title_')).toBeInTheDocument()
    })

    it('handles very long headings', () => {
      const longHeading = 'A'.repeat(100)
      const markdown = `# ${longHeading}\n## Short`
      render(<TableOfContents markdown={markdown} onHeadingClick={mockOnHeadingClick} />)

      expect(screen.getByText(longHeading)).toBeInTheDocument()
    })

    it('handles all heading levels (h1-h6)', () => {
      const markdown = '# H1\n## H2\n### H3\n#### H4\n##### H5\n###### H6'
      render(<TableOfContents markdown={markdown} onHeadingClick={mockOnHeadingClick} />)

      expect(screen.getByText('H1')).toBeInTheDocument()
      expect(screen.getByText('H2')).toBeInTheDocument()
      expect(screen.getByText('H3')).toBeInTheDocument()
      expect(screen.getByText('H4')).toBeInTheDocument()
      expect(screen.getByText('H5')).toBeInTheDocument()
      expect(screen.getByText('H6')).toBeInTheDocument()
    })
  })
})
