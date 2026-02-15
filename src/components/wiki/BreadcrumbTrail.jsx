import React, { useMemo } from 'react'
import { ChevronRight, Home } from 'lucide-react'

/**
 * Build the ancestor chain from `currentPageId` up to the root.
 * Returns an array ordered from root -> ... -> parent -> current.
 */
function buildAncestorPath(pages, currentPageId) {
  if (!currentPageId || !pages?.length) return []

  const map = {}
  pages.forEach((p) => {
    map[p.id] = p
  })

  const path = []
  let current = map[currentPageId]
  while (current) {
    path.unshift(current)
    current = current.parentId ? map[current.parentId] : null
  }
  return path
}

export default function BreadcrumbTrail({ pages = [], currentPageId, onNavigate }) {
  const path = useMemo(
    () => buildAncestorPath(pages, currentPageId),
    [pages, currentPageId]
  )

  if (path.length === 0) return null

  return (
    <nav className="flex items-center gap-1 text-sm">
      {/* Home / Wiki root */}
      <button
        onClick={() => onNavigate(null)}
        className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[var(--color-fg-muted)] transition-colors hover:bg-[var(--color-bg-glass-hover)] hover:text-[var(--color-fg-default)]"
      >
        <Home size={13} />
        <span>Wiki</span>
      </button>

      {path.map((page, idx) => {
        const isLast = idx === path.length - 1
        return (
          <span key={page.id} className="flex items-center gap-1">
            <ChevronRight size={12} className="text-[var(--color-fg-subtle)]" />
            {isLast ? (
              <span className="px-1.5 py-0.5 font-medium text-[var(--color-fg-default)]">
                {page.icon ? `${page.icon} ` : ''}
                {page.title || 'Untitled'}
              </span>
            ) : (
              <button
                onClick={() => onNavigate(page.id)}
                className="rounded px-1.5 py-0.5 text-[var(--color-fg-muted)] transition-colors hover:bg-[var(--color-bg-glass-hover)] hover:text-[var(--color-fg-default)]"
              >
                {page.icon ? `${page.icon} ` : ''}
                {page.title || 'Untitled'}
              </button>
            )}
          </span>
        )
      })}
    </nav>
  )
}
