import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronDown, FileText, Plus, Trash2, Pin } from 'lucide-react'
import SearchBar from '../ui/SearchBar'
import Button from '../ui/Button'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Build a tree structure from a flat list of pages.
 * Returns root nodes (parentId === null) with a `children` array attached.
 */
function buildTree(pages) {
  const map = {}
  const roots = []

  // Index every page by id
  pages.forEach((p) => {
    map[p.id] = { ...p, children: [] }
  })

  // Attach children
  pages.forEach((p) => {
    if (p.parentId && map[p.parentId]) {
      map[p.parentId].children.push(map[p.id])
    } else {
      roots.push(map[p.id])
    }
  })

  return roots
}

/**
 * Recursively check if a node or any descendant matches the search filter.
 */
function matchesFilter(node, filter) {
  if (!filter) return true
  const lower = filter.toLowerCase()
  if (node.title?.toLowerCase().includes(lower)) return true
  return node.children.some((child) => matchesFilter(child, lower))
}

// ---------------------------------------------------------------------------
// TreeNode
// ---------------------------------------------------------------------------

function TreeNode({
  node,
  depth,
  selectedPageId,
  onSelectPage,
  onAddPage,
  onDeletePage,
  expandedIds,
  toggleExpanded,
  filter,
}) {
  const hasChildren = node.children.length > 0
  const isExpanded = expandedIds.has(node.id)
  const isSelected = node.id === selectedPageId
  const icon = node.icon || null

  // If filtering, only show nodes that match (or have a matching descendant)
  if (filter && !matchesFilter(node, filter)) return null

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        className={[
          'group flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm transition-colors cursor-pointer select-none',
          isSelected
            ? 'text-[var(--color-fg-default)]'
            : 'text-[var(--color-fg-muted)] hover:bg-[var(--color-bg-glass-hover)] hover:text-[var(--color-fg-default)]',
        ].join(' ')}
        style={{
          paddingLeft: `${depth * 16 + 8}px`,
          ...(isSelected
            ? { backgroundColor: 'rgba(var(--accent-active-rgb, 139, 92, 246), 0.2)' }
            : {}),
        }}
        onClick={() => onSelectPage(node.id)}
      >
        {/* Expand / collapse */}
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation()
              toggleExpanded(node.id)
            }}
            className="shrink-0 rounded p-0.5 hover:bg-[var(--color-bg-glass-hover)]"
          >
            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        ) : (
          <span className="w-[18px] shrink-0" />
        )}

        {/* Icon */}
        {icon ? (
          <span className="shrink-0 text-base leading-none">{icon}</span>
        ) : (
          <FileText size={14} className="shrink-0 text-[var(--color-fg-muted)]" />
        )}

        {/* Title */}
        <span className="flex-1 truncate">{node.title || 'Untitled'}</span>

        {/* Pin indicator */}
        {node.pinned && <Pin size={12} className="shrink-0 text-yellow-500/70" />}

        {/* Hover actions */}
        <span className="hidden shrink-0 items-center gap-0.5 group-hover:flex">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onAddPage(node.id)
            }}
            className="rounded p-0.5 text-[var(--color-fg-muted)] transition-colors hover:bg-[var(--color-bg-glass-hover)] hover:text-[var(--color-fg-default)]"
            title="Add child page"
          >
            <Plus size={13} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDeletePage(node.id)
            }}
            className="rounded p-0.5 text-[var(--color-fg-muted)] transition-colors hover:bg-red-500/20 hover:text-red-400"
            title="Delete page"
          >
            <Trash2 size={13} />
          </button>
        </span>
      </motion.div>

      {/* Children */}
      <AnimatePresence>
        {hasChildren && isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            {node.children.map((child) => (
              <TreeNode
                key={child.id}
                node={child}
                depth={depth + 1}
                selectedPageId={selectedPageId}
                onSelectPage={onSelectPage}
                onAddPage={onAddPage}
                onDeletePage={onDeletePage}
                expandedIds={expandedIds}
                toggleExpanded={toggleExpanded}
                filter={filter}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// ---------------------------------------------------------------------------
// PageTree (exported)
// ---------------------------------------------------------------------------

export default function PageTree({
  pages = [],
  selectedPageId,
  onSelectPage,
  onAddPage,
  onDeletePage,
}) {
  const [filter, setFilter] = useState('')
  const [expandedIds, setExpandedIds] = useState(new Set())

  const toggleExpanded = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // Sort: pinned pages first, then alphabetical
  const sortedPages = useMemo(() => {
    const pinned = pages.filter((p) => p.pinned)
    const rest = pages.filter((p) => !p.pinned)
    const byTitle = (a, b) => (a.title || '').localeCompare(b.title || '')
    return [...pinned.sort(byTitle), ...rest.sort(byTitle)]
  }, [pages])

  const tree = useMemo(() => buildTree(sortedPages), [sortedPages])

  return (
    <div className="glass-sidebar flex h-full w-64 shrink-0 flex-col">
      {/* Header */}
      <div className="shrink-0 border-b border-[var(--color-border-default)] px-3 py-3">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-fg-muted)]">
            Pages
          </h3>
          <Button variant="ghost" size="sm" icon={Plus} onClick={() => onAddPage(null)}>
            New
          </Button>
        </div>

        <SearchBar
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter pages..."
        />
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {tree.length === 0 && (
          <p className="px-2 py-4 text-center text-xs text-[var(--color-fg-subtle)]">
            No pages yet. Click <strong>New</strong> to create one.
          </p>
        )}
        {tree.map((node) => (
          <TreeNode
            key={node.id}
            node={node}
            depth={0}
            selectedPageId={selectedPageId}
            onSelectPage={onSelectPage}
            onAddPage={onAddPage}
            onDeletePage={onDeletePage}
            expandedIds={expandedIds}
            toggleExpanded={toggleExpanded}
            filter={filter}
          />
        ))}
      </div>
    </div>
  )
}
