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
    <div className="glass-card steering-aware-scroll hidden w-72 shrink-0 self-start overflow-y-auto max-h-full p-4 md:block">
      <div className="mb-3 flex items-center gap-1.5">
        <List size={14} className="text-[var(--color-fg-muted)]" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-fg-muted)]">
          On this page
        </h4>
      </div>

      <nav className="space-y-1">
        {headings.map((heading, idx) => {
          const indent = (heading.level - minLevel) * 12
          return (
            <button
              key={`${heading.id}-${idx}`}
              onClick={() => onHeadingClick?.(heading.id)}
              className="block w-full rounded px-2 py-1.5 text-left text-[13px] text-[var(--color-fg-muted)] transition-colors hover:bg-[var(--color-bg-glass-hover)] hover:text-[var(--color-fg-default)] leading-snug break-words"
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
