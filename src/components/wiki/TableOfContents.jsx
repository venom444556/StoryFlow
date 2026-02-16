import { useMemo } from 'react'
import { List } from 'lucide-react'
import { extractHeadings } from '../../utils/markdown'

export default function TableOfContents({ markdown, onHeadingClick }) {
  const headings = useMemo(() => extractHeadings(markdown), [markdown])

  // Only show when there are 2+ headings
  if (headings.length < 2) return null

  // Find the minimum heading level so we can normalize indentation
  const minLevel = Math.min(...headings.map((h) => h.level))

  return (
    <div className="glass-card hidden w-48 shrink-0 self-start p-3 md:block">
      <div className="mb-2 flex items-center gap-1.5">
        <List size={13} className="text-[var(--color-fg-muted)]" />
        <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-fg-muted)]">
          On this page
        </h4>
      </div>

      <nav className="space-y-0.5">
        {headings.map((heading, idx) => {
          const indent = (heading.level - minLevel) * 12
          return (
            <button
              key={`${heading.id}-${idx}`}
              onClick={() => onHeadingClick?.(heading.id)}
              className="block w-full truncate rounded px-2 py-1 text-left text-xs text-[var(--color-fg-muted)] transition-colors hover:bg-[var(--color-bg-glass-hover)] hover:text-[var(--color-fg-default)]"
              style={{ paddingLeft: `${indent + 8}px` }}
              title={heading.text}
            >
              {heading.text}
            </button>
          )
        })}
      </nav>
    </div>
  )
}
