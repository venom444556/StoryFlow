import { useMemo } from 'react'
import DOMPurify from 'dompurify'
import { renderMarkdown } from '../../utils/markdown'

/**
 * Renders a markdown string as styled HTML.
 *
 * The rendered output uses Tailwind-based classes that are baked into the
 * HTML by `renderMarkdown()` in utils/markdown.js, so all headings, code
 * blocks, tables, lists, etc. are already styled.
 *
 * Even though the content is author-written markdown, imported projects
 * could contain pre-rendered HTML. We sanitize via DOMPurify to prevent
 * XSS from imported content or markdown edge-cases.
 */
export default function MarkdownRenderer({ content, className = '' }) {
  const html = useMemo(() => {
    const raw = renderMarkdown(content || '')
    return DOMPurify.sanitize(raw, {
      ADD_ATTR: ['target', 'rel', 'class', 'id', 'style'],
      ADD_TAGS: ['code', 'pre', 'span'],
    })
  }, [content])

  if (!content) {
    return (
      <p className="py-8 text-center text-sm italic text-[var(--color-fg-subtle)]">
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
