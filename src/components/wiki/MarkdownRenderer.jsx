import React, { useMemo } from 'react'
import { renderMarkdown } from '../../utils/markdown'

/**
 * Renders a markdown string as styled HTML.
 *
 * The rendered output uses Tailwind-based classes that are baked into the
 * HTML by `renderMarkdown()` in utils/markdown.js, so all headings, code
 * blocks, tables, lists, etc. are already styled.
 *
 * NOTE: We use dangerouslySetInnerHTML intentionally -- the content is
 * author-written markdown, not untrusted user input from external sources.
 */
export default function MarkdownRenderer({ content, className = '' }) {
  const html = useMemo(() => renderMarkdown(content || ''), [content])

  if (!content) {
    return (
      <p className="py-8 text-center text-sm italic text-slate-600">
        No content yet.
      </p>
    )
  }

  return (
    <div
      className={['markdown-body', className].filter(Boolean).join(' ')}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
