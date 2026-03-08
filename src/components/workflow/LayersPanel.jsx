import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'

export default function LayersPanel({ nodes = [] }) {
  const [hiddenIds, setHiddenIds] = useState(new Set())

  const toggleVisibility = (id) => {
    setHiddenIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  if (nodes.length === 0) {
    return (
      <p className="text-[var(--text-2xs)] text-[var(--color-fg-subtle)]">
        No nodes yet. Add nodes from the palette above.
      </p>
    )
  }

  return (
    <div className="space-y-0.5">
      {nodes.map((node) => (
        <div
          key={node.id}
          className="flex items-center gap-2 rounded-md px-2 py-1.5 text-[var(--text-xs)] transition-colors hover:bg-[var(--color-bg-glass)]"
        >
          <button
            onClick={() => toggleVisibility(node.id)}
            className="text-[var(--color-fg-subtle)] hover:text-[var(--color-fg-default)]"
          >
            {hiddenIds.has(node.id) ? <EyeOff size={12} /> : <Eye size={12} />}
          </button>
          <span
            className={[
              'truncate flex-1',
              hiddenIds.has(node.id)
                ? 'text-[var(--color-fg-faint)] line-through'
                : 'text-[var(--color-fg-muted)]',
            ].join(' ')}
          >
            {node.title || node.type}
          </span>
        </div>
      ))}
    </div>
  )
}
