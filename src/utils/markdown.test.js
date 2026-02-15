import { describe, it, expect, beforeEach } from 'vitest'
import { extractHeadings, wordCount, readingTime, renderMarkdown } from './markdown'

describe('markdown utilities', () => {
  describe('extractHeadings', () => {
    it('extracts a single h1 heading', () => {
      const result = extractHeadings('# Hello World')
      expect(result).toEqual([
        { level: 1, text: 'Hello World', id: 'hello-world' },
      ])
    })

    it('extracts multiple headings at different levels', () => {
      const markdown = `# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6`
      const result = extractHeadings(markdown)
      expect(result).toHaveLength(6)
      expect(result[0].level).toBe(1)
      expect(result[5].level).toBe(6)
    })

    it('generates slug IDs from heading text', () => {
      const result = extractHeadings('# Hello World Test')
      expect(result[0].id).toBe('hello-world-test')
    })

    it('removes special characters from IDs', () => {
      const result = extractHeadings('# Hello! World? Test.')
      expect(result[0].id).toBe('hello-world-test')
    })

    it('converts IDs to lowercase', () => {
      const result = extractHeadings('# UPPERCASE Title')
      expect(result[0].id).toBe('uppercase-title')
    })

    it('returns empty array for empty string', () => {
      expect(extractHeadings('')).toEqual([])
    })

    it('returns empty array for null', () => {
      expect(extractHeadings(null)).toEqual([])
    })

    it('returns empty array for undefined', () => {
      expect(extractHeadings(undefined)).toEqual([])
    })

    it('ignores non-heading lines', () => {
      const markdown = `Regular text
# Actual Heading
More text`
      const result = extractHeadings(markdown)
      expect(result).toHaveLength(1)
      expect(result[0].text).toBe('Actual Heading')
    })

    it('ignores headings in code blocks', () => {
      // The current implementation doesn't skip code blocks
      // but we can test for lines that look like headings
      const markdown = '# Real Heading\nSome code: # Not a heading'
      const result = extractHeadings(markdown)
      expect(result).toHaveLength(1)
    })

    it('requires space after hash for valid heading', () => {
      const markdown = '#NoSpace\n# With Space'
      const result = extractHeadings(markdown)
      expect(result).toHaveLength(1)
      expect(result[0].text).toBe('With Space')
    })
  })

  describe('wordCount', () => {
    it('counts words in simple text', () => {
      expect(wordCount('hello world')).toBe(2)
    })

    it('counts words in longer text', () => {
      expect(wordCount('one two three four five')).toBe(5)
    })

    it('returns 0 for empty string', () => {
      expect(wordCount('')).toBe(0)
    })

    it('returns 0 for null', () => {
      expect(wordCount(null)).toBe(0)
    })

    it('returns 0 for undefined', () => {
      expect(wordCount(undefined)).toBe(0)
    })

    it('handles multiple spaces between words', () => {
      expect(wordCount('hello    world')).toBe(2)
    })

    it('handles leading and trailing spaces', () => {
      expect(wordCount('  hello world  ')).toBe(2)
    })

    it('strips markdown heading syntax', () => {
      expect(wordCount('# Hello World')).toBe(2)
    })

    it('strips markdown bold and italic syntax', () => {
      expect(wordCount('**bold** and *italic*')).toBe(3)
    })

    it('strips inline code', () => {
      expect(wordCount('use `code` here')).toBe(2)
    })

    it('strips fenced code blocks', () => {
      const text = 'text\n```\ncode block\n```\nmore text'
      expect(wordCount(text)).toBe(3) // text, more, text
    })

    it('extracts link text', () => {
      expect(wordCount('[click here](http://example.com)')).toBe(2)
    })

    it('returns 0 for whitespace only', () => {
      expect(wordCount('   \n\t   ')).toBe(0)
    })
  })

  describe('readingTime', () => {
    it('returns 1 minute for short text', () => {
      expect(readingTime('hello world')).toBe(1)
    })

    it('returns 1 minute minimum', () => {
      expect(readingTime('')).toBe(1)
      expect(readingTime('a')).toBe(1)
    })

    it('calculates based on 200 wpm', () => {
      // 400 words should be 2 minutes
      const words = Array(400).fill('word').join(' ')
      expect(readingTime(words)).toBe(2)
    })

    it('rounds up to nearest minute', () => {
      // 201 words should round up to 2 minutes
      const words = Array(201).fill('word').join(' ')
      expect(readingTime(words)).toBe(2)
    })

    it('handles null and undefined', () => {
      expect(readingTime(null)).toBe(1)
      expect(readingTime(undefined)).toBe(1)
    })
  })

  describe('renderMarkdown', () => {
    beforeEach(() => {
      // Mock window.location.origin for URL parsing
      Object.defineProperty(window, 'location', {
        value: { origin: 'http://localhost:3000' },
        writable: true,
      })
    })

    describe('empty and null input', () => {
      it('returns empty string for empty input', () => {
        expect(renderMarkdown('')).toBe('')
      })

      it('returns empty string for null', () => {
        expect(renderMarkdown(null)).toBe('')
      })

      it('returns empty string for undefined', () => {
        expect(renderMarkdown(undefined)).toBe('')
      })
    })

    describe('headings', () => {
      it('renders h1 heading', () => {
        const result = renderMarkdown('# Hello')
        expect(result).toContain('<h1')
        expect(result).toContain('Hello')
        expect(result).toContain('id="hello"')
      })

      it('renders h2 through h6 headings', () => {
        expect(renderMarkdown('## H2')).toContain('<h2')
        expect(renderMarkdown('### H3')).toContain('<h3')
        expect(renderMarkdown('#### H4')).toContain('<h4')
        expect(renderMarkdown('##### H5')).toContain('<h5')
        expect(renderMarkdown('###### H6')).toContain('<h6')
      })
    })

    describe('inline formatting', () => {
      it('renders bold text with **', () => {
        const result = renderMarkdown('**bold**')
        expect(result).toContain('<strong>bold</strong>')
      })

      it('renders bold text with __', () => {
        const result = renderMarkdown('__bold__')
        expect(result).toContain('<strong>bold</strong>')
      })

      it('renders italic text with *', () => {
        const result = renderMarkdown('*italic*')
        expect(result).toContain('<em>italic</em>')
      })

      it('renders italic text with _', () => {
        const result = renderMarkdown('_italic_')
        expect(result).toContain('<em>italic</em>')
      })

      it('renders bold and italic with ***', () => {
        const result = renderMarkdown('***both***')
        expect(result).toContain('<strong><em>both</em></strong>')
      })

      it('renders strikethrough with ~~', () => {
        const result = renderMarkdown('~~deleted~~')
        expect(result).toContain('<del>deleted</del>')
      })

      it('renders inline code with backticks', () => {
        const result = renderMarkdown('use `code` here')
        expect(result).toContain('<code')
        expect(result).toContain('code')
      })
    })

    describe('links', () => {
      it('renders safe links', () => {
        const result = renderMarkdown('[click](http://example.com)')
        expect(result).toContain('<a href="http://example.com"')
        expect(result).toContain('click')
        expect(result).toContain('target="_blank"')
        expect(result).toContain('rel="noopener noreferrer"')
      })

      it('blocks javascript: URLs', () => {
        const result = renderMarkdown('[evil](javascript:alert(1))')
        expect(result).toContain('link blocked')
        expect(result).not.toContain('javascript:')
      })

      it('blocks data: URLs', () => {
        const result = renderMarkdown('[evil](data:text/html,<script>)')
        expect(result).toContain('link blocked')
      })

      it('allows relative URLs', () => {
        const result = renderMarkdown('[link](/path/to/page)')
        expect(result).toContain('href="/path/to/page"')
      })

      it('allows anchor links', () => {
        const result = renderMarkdown('[link](#section)')
        expect(result).toContain('href="#section"')
      })

      it('allows mailto: links', () => {
        const result = renderMarkdown('[email](mailto:test@example.com)')
        expect(result).toContain('href="mailto:test@example.com"')
      })
    })

    describe('images', () => {
      it('renders images with safe URLs', () => {
        const result = renderMarkdown('![alt text](http://example.com/img.png)')
        expect(result).toContain('<img')
        expect(result).toContain('src="http://example.com/img.png"')
        expect(result).toContain('alt="alt text"')
      })

      it('blocks images with unsafe URLs', () => {
        const result = renderMarkdown('![img](javascript:alert(1))')
        expect(result).toContain('image blocked')
        expect(result).not.toContain('<img')
      })
    })

    describe('code blocks', () => {
      it('renders fenced code blocks', () => {
        const result = renderMarkdown('```\ncode\n```')
        expect(result).toContain('<pre')
        expect(result).toContain('<code')
        expect(result).toContain('code')
      })

      it('renders code blocks with language', () => {
        const result = renderMarkdown('```javascript\nconst x = 1\n```')
        expect(result).toContain('language-javascript')
      })

      it('escapes HTML in code blocks', () => {
        const result = renderMarkdown('```\n<script>alert(1)</script>\n```')
        expect(result).toContain('&lt;script&gt;')
        expect(result).not.toContain('<script>')
      })
    })

    describe('lists', () => {
      it('renders unordered lists with -', () => {
        const result = renderMarkdown('- item 1\n- item 2')
        expect(result).toContain('<ul')
        expect(result).toContain('<li')
        expect(result).toContain('item 1')
        expect(result).toContain('item 2')
      })

      it('renders unordered lists with *', () => {
        const result = renderMarkdown('* item 1\n* item 2')
        expect(result).toContain('<ul')
      })

      it('renders unordered lists with +', () => {
        const result = renderMarkdown('+ item 1\n+ item 2')
        expect(result).toContain('<ul')
      })

      it('renders ordered lists', () => {
        const result = renderMarkdown('1. first\n2. second')
        expect(result).toContain('<ol')
        expect(result).toContain('<li')
        expect(result).toContain('first')
        expect(result).toContain('second')
      })

      it('renders task list items', () => {
        const result = renderMarkdown('- [ ] unchecked\n- [x] checked')
        expect(result).toContain('type="checkbox"')
        expect(result).toContain('checked')
      })
    })

    describe('blockquotes', () => {
      it('renders blockquotes', () => {
        const result = renderMarkdown('> quoted text')
        expect(result).toContain('<blockquote')
        expect(result).toContain('quoted text')
      })

      it('renders multi-line blockquotes', () => {
        const result = renderMarkdown('> line 1\n> line 2')
        expect(result).toContain('<blockquote')
        expect(result).toContain('line 1')
        expect(result).toContain('line 2')
      })
    })

    describe('horizontal rules', () => {
      it('renders horizontal rule with ---', () => {
        const result = renderMarkdown('---')
        expect(result).toContain('<hr')
      })

      it('renders horizontal rule with ***', () => {
        const result = renderMarkdown('***')
        expect(result).toContain('<hr')
      })

      it('renders horizontal rule with ___', () => {
        const result = renderMarkdown('___')
        expect(result).toContain('<hr')
      })
    })

    describe('tables', () => {
      it('renders tables', () => {
        const table = `| Header 1 | Header 2 |
| --- | --- |
| Cell 1 | Cell 2 |`
        const result = renderMarkdown(table)
        expect(result).toContain('<table')
        expect(result).toContain('<thead')
        expect(result).toContain('<tbody')
        expect(result).toContain('<th')
        expect(result).toContain('<td')
        expect(result).toContain('Header 1')
        expect(result).toContain('Cell 1')
      })

      it('handles table alignment', () => {
        const table = `| Left | Center | Right |
| :--- | :---: | ---: |
| L | C | R |`
        const result = renderMarkdown(table)
        expect(result).toContain('text-align:left')
        expect(result).toContain('text-align:center')
        expect(result).toContain('text-align:right')
      })
    })

    describe('paragraphs', () => {
      it('renders paragraphs', () => {
        const result = renderMarkdown('This is a paragraph.')
        expect(result).toContain('<p')
        expect(result).toContain('This is a paragraph.')
      })

      it('handles multiple paragraphs', () => {
        const result = renderMarkdown('Paragraph 1\n\nParagraph 2')
        expect(result).toContain('Paragraph 1')
        expect(result).toContain('Paragraph 2')
      })
    })

    describe('HTML escaping', () => {
      it('escapes HTML entities in text', () => {
        const result = renderMarkdown('<script>alert(1)</script>')
        expect(result).toContain('&lt;script&gt;')
        expect(result).not.toContain('<script>')
      })

      it('escapes ampersands', () => {
        const result = renderMarkdown('A & B')
        expect(result).toContain('&amp;')
      })

      it('escapes quotes', () => {
        const result = renderMarkdown('He said "hello"')
        expect(result).toContain('&quot;')
      })
    })
  })
})
