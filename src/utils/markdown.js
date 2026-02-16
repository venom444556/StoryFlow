/**
 * Lightweight markdown parser and utilities.
 * No external dependencies -- just enough to cover the common subset:
 *   headings, bold, italic, strikethrough, inline code, fenced code blocks,
 *   unordered/ordered lists, links, blockquotes, horizontal rules, tables,
 *   and paragraphs.
 */

// ---------------------------------------------------------------------------
// Heading extraction
// ---------------------------------------------------------------------------

/**
 * Pull every ATX heading from a markdown string.
 * @param {string} markdown
 * @returns {{ level: number, text: string, id: string }[]}
 */
export function extractHeadings(markdown) {
  if (!markdown) return []
  const lines = markdown.split('\n')
  const headings = []
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
}

// ---------------------------------------------------------------------------
// Word / reading time helpers
// ---------------------------------------------------------------------------

/**
 * Count words in plain text (strips markdown syntax for a rough count).
 * @param {string} text
 * @returns {number}
 */
export function wordCount(text) {
  if (!text) return 0
  // Strip common markdown syntax for a cleaner count
  const stripped = text
    .replace(/```[\s\S]*?```/g, '') // fenced code blocks
    .replace(/`[^`]+`/g, '') // inline code
    .replace(/[#*_~>\-|]/g, '') // markdown chars
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // links -> text
    .trim()
  if (!stripped) return 0
  return stripped.split(/\s+/).filter(Boolean).length
}

/**
 * Estimated reading time in minutes (200 wpm).
 * @param {string} text
 * @returns {number}
 */
export function readingTime(text) {
  const words = wordCount(text)
  return Math.max(1, Math.ceil(words / 200))
}

// ---------------------------------------------------------------------------
// Markdown -> HTML renderer
// ---------------------------------------------------------------------------

/**
 * Escape HTML entities so raw user text is safe inside innerHTML.
 */
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * Check whether a URL uses a safe protocol (http, https, mailto).
 * Blocks javascript:, data:, vbscript:, and other dangerous schemes.
 */
function isSafeUrl(url) {
  try {
    const trimmed = url.trim()
    // Relative URLs and anchors are safe
    if (
      trimmed.startsWith('/') ||
      trimmed.startsWith('#') ||
      trimmed.startsWith('./') ||
      trimmed.startsWith('../')
    ) {
      return true
    }
    const parsed = new URL(trimmed, window.location.origin)
    return ['http:', 'https:', 'mailto:'].includes(parsed.protocol)
  } catch {
    return false
  }
}

/**
 * Apply inline markdown transformations to a single line of text.
 * Order matters -- we process from most specific to least specific.
 */
function inlineMarkdown(text) {
  let out = escapeHtml(text)

  // images (before links to avoid conflicts)  ![alt](url)
  out = out.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, url) => {
    if (!isSafeUrl(url)) return `[image blocked: unsafe URL]`
    return `<img src="${url}" alt="${alt}" class="max-w-full rounded" />`
  })

  // links  [text](url)
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text, url) => {
    if (!isSafeUrl(url)) return `${text} [link blocked: unsafe URL]`
    return `<a href="${url}" class="text-blue-400 underline hover:text-blue-300" target="_blank" rel="noopener noreferrer">${text}</a>`
  })

  // bold + italic  ***text*** or ___text___
  out = out.replace(/\*{3}(.+?)\*{3}/g, '<strong><em>$1</em></strong>')
  out = out.replace(/_{3}(.+?)_{3}/g, '<strong><em>$1</em></strong>')

  // bold  **text** or __text__
  out = out.replace(/\*{2}(.+?)\*{2}/g, '<strong>$1</strong>')
  out = out.replace(/_{2}(.+?)_{2}/g, '<strong>$1</strong>')

  // italic  *text* or _text_
  out = out.replace(/\*(.+?)\*/g, '<em>$1</em>')
  out = out.replace(/_(.+?)_/g, '<em>$1</em>')

  // strikethrough  ~~text~~
  out = out.replace(/~~(.+?)~~/g, '<del>$1</del>')

  // inline code  `code`
  out = out.replace(
    /`([^`]+)`/g,
    '<code class="bg-[var(--color-bg-muted)] rounded px-1.5 py-0.5 text-sm font-mono text-[var(--badge-purple-fg)]">$1</code>'
  )

  return out
}

/**
 * Parse a table block (array of lines) into an HTML <table>.
 */
function parseTable(lines) {
  if (lines.length < 2) return lines.map((l) => `<p>${inlineMarkdown(l)}</p>`).join('\n')

  const parseCells = (row) =>
    row
      .replace(/^\|/, '')
      .replace(/\|$/, '')
      .split('|')
      .map((c) => c.trim())

  const headerCells = parseCells(lines[0])
  const separatorCells = parseCells(lines[1])

  // Validate separator row (must only contain dashes, colons, spaces)
  const isSeparator = separatorCells.every((c) => /^:?-+:?$/.test(c))
  if (!isSeparator) return lines.map((l) => `<p>${inlineMarkdown(l)}</p>`).join('\n')

  // Determine alignment
  const aligns = separatorCells.map((c) => {
    if (c.startsWith(':') && c.endsWith(':')) return 'center'
    if (c.endsWith(':')) return 'right'
    return 'left'
  })

  let html = '<div class="overflow-x-auto my-4"><table class="w-full border-collapse text-sm">'

  // Header
  html += '<thead><tr>'
  headerCells.forEach((cell, i) => {
    const align = aligns[i] || 'left'
    html += `<th class="border border-[var(--color-border-default)] bg-[var(--color-bg-glass)] px-3 py-2 text-left font-semibold text-[var(--color-fg-default)]" style="text-align:${align}">${inlineMarkdown(cell)}</th>`
  })
  html += '</tr></thead>'

  // Body
  html += '<tbody>'
  for (let r = 2; r < lines.length; r++) {
    const cells = parseCells(lines[r])
    const isEven = (r - 2) % 2 === 0
    html += `<tr class="${isEven ? '' : 'bg-[var(--color-bg-glass)]'}">`
    cells.forEach((cell, i) => {
      const align = aligns[i] || 'left'
      html += `<td class="border border-[var(--color-border-default)] px-3 py-2 text-[var(--color-fg-muted)]" style="text-align:${align}">${inlineMarkdown(cell)}</td>`
    })
    html += '</tr>'
  }
  html += '</tbody></table></div>'
  return html
}

/**
 * Convert a markdown string to an HTML string.
 *
 * Supports: headings (h1-h6), bold, italic, strikethrough, inline code,
 * fenced code blocks (with optional language), unordered / ordered lists,
 * links, blockquotes, horizontal rules, tables, and paragraphs.
 *
 * @param {string} markdown
 * @returns {string} HTML
 */
export function renderMarkdown(markdown) {
  if (!markdown) return ''

  const lines = markdown.split('\n')
  const htmlParts = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // ---- Fenced code block ----
    const fenceMatch = line.match(/^```(\w*)/)
    if (fenceMatch) {
      const lang = fenceMatch[1]
      const codeLines = []
      i++
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i])
        i++
      }
      i++ // skip closing ```
      const langClass = lang ? ` class="language-${lang}"` : ''
      htmlParts.push(
        `<pre class="bg-[var(--color-bg-muted)] rounded-lg p-4 my-3 overflow-x-auto text-sm"><code${langClass} class="font-mono text-[var(--color-fg-muted)]">${escapeHtml(codeLines.join('\n'))}</code></pre>`
      )
      continue
    }

    // ---- Horizontal rule ----
    if (/^(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) {
      htmlParts.push('<hr class="border-[var(--color-border-default)] my-6" />')
      i++
      continue
    }

    // ---- Headings ----
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/)
    if (headingMatch) {
      const level = headingMatch[1].length
      const text = headingMatch[2].trim()
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
      const sizeClasses = {
        1: 'text-3xl font-bold mt-8 mb-4 pb-2 border-b border-[var(--color-border-default)]',
        2: 'text-2xl font-bold mt-6 mb-3 pb-2 border-b border-[var(--color-border-default)]',
        3: 'text-xl font-semibold mt-5 mb-2',
        4: 'text-lg font-semibold mt-4 mb-2',
        5: 'text-base font-semibold mt-3 mb-1',
        6: 'text-sm font-semibold mt-3 mb-1 uppercase tracking-wider text-[var(--color-fg-subtle)]',
      }
      htmlParts.push(
        `<h${level} id="${id}" class="${sizeClasses[level]} text-[var(--color-fg-default)]">${inlineMarkdown(text)}</h${level}>`
      )
      i++
      continue
    }

    // ---- Blockquote ----
    if (line.startsWith('> ') || line === '>') {
      const quoteLines = []
      while (i < lines.length && (lines[i].startsWith('> ') || lines[i] === '>')) {
        quoteLines.push(lines[i].replace(/^>\s?/, ''))
        i++
      }
      htmlParts.push(
        `<blockquote class="border-l-4 border-purple-500/50 pl-4 my-4 italic text-[var(--color-fg-subtle)]">${quoteLines
          .map(inlineMarkdown)
          .join('<br />')}</blockquote>`
      )
      continue
    }

    // ---- Table ----
    if (
      line.includes('|') &&
      i + 1 < lines.length &&
      /^\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?\s*$/.test(lines[i + 1])
    ) {
      const tableLines = []
      while (i < lines.length && lines[i].includes('|')) {
        tableLines.push(lines[i])
        i++
      }
      htmlParts.push(parseTable(tableLines))
      continue
    }

    // ---- Unordered list ----
    if (/^[\s]*[-*+]\s/.test(line)) {
      const listItems = []
      while (i < lines.length && /^[\s]*[-*+]\s/.test(lines[i])) {
        const content = lines[i].replace(/^[\s]*[-*+]\s/, '')
        // Handle task-list items  - [ ] / - [x]
        const taskMatch = content.match(/^\[([ xX])\]\s*(.*)$/)
        if (taskMatch) {
          const checked = taskMatch[1].toLowerCase() === 'x'
          listItems.push(
            `<li class="flex items-start gap-2 text-[var(--color-fg-muted)] my-1"><input type="checkbox" ${checked ? 'checked' : ''} disabled class="mt-1 accent-purple-500" /><span>${inlineMarkdown(taskMatch[2])}</span></li>`
          )
        } else {
          listItems.push(
            `<li class="text-[var(--color-fg-muted)] my-1 ml-4 list-disc">${inlineMarkdown(content)}</li>`
          )
        }
        i++
      }
      htmlParts.push(`<ul class="my-3 space-y-0.5">${listItems.join('')}</ul>`)
      continue
    }

    // ---- Ordered list ----
    if (/^\d+\.\s/.test(line)) {
      const listItems = []
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        const content = lines[i].replace(/^\d+\.\s/, '')
        listItems.push(
          `<li class="text-[var(--color-fg-muted)] my-1 ml-4 list-decimal">${inlineMarkdown(content)}</li>`
        )
        i++
      }
      htmlParts.push(`<ol class="my-3 space-y-0.5">${listItems.join('')}</ol>`)
      continue
    }

    // ---- Empty line (paragraph break) ----
    if (line.trim() === '') {
      i++
      continue
    }

    // ---- Paragraph (default) ----
    const paraLines = []
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !lines[i].match(/^(#{1,6})\s/) &&
      !lines[i].startsWith('> ') &&
      !lines[i].startsWith('```') &&
      !/^[-*+]\s/.test(lines[i]) &&
      !/^\d+\.\s/.test(lines[i]) &&
      !/^(-{3,}|\*{3,}|_{3,})\s*$/.test(lines[i]) &&
      !(
        lines[i].includes('|') &&
        i + 1 < lines.length &&
        /^\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?\s*$/.test(lines[i + 1])
      )
    ) {
      paraLines.push(lines[i])
      i++
    }
    if (paraLines.length > 0) {
      htmlParts.push(
        `<p class="text-[var(--color-fg-muted)] my-3 leading-relaxed">${paraLines.map(inlineMarkdown).join(' ')}</p>`
      )
    }
  }

  return htmlParts.join('\n')
}
