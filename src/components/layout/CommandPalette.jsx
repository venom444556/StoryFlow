import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Search,
  FolderKanban,
  Bug,
  FileText,
  GitBranch,
  Command,
  CornerDownLeft,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'
import { useProjects } from '../../hooks/useProjects'
import { useSearch } from '../../hooks/useSearch'

// ---------------------------------------------------------------------------
// Type icon lookup
// ---------------------------------------------------------------------------

const TYPE_ICONS = {
  project: FolderKanban,
  issue: Bug,
  page: FileText,
  decision: GitBranch,
}

const TYPE_LABELS = {
  project: 'Projects',
  issue: 'Issues',
  page: 'Pages',
  decision: 'Decisions',
}

const TYPE_COLORS = {
  project: 'text-purple-400',
  issue: 'text-blue-400',
  page: 'text-emerald-400',
  decision: 'text-amber-400',
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CommandPalette({ isOpen, onClose }) {
  const navigate = useNavigate()
  const { projects } = useProjects()
  const { query, setQuery, results, isSearching, clearSearch } = useSearch(projects)
  const inputRef = useRef(null)
  const listRef = useRef(null)
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Flatten results into a single ordered list for keyboard navigation
  const flatResults = useMemo(() => {
    if (query.trim()) {
      const grouped = []
      for (const type of ['project', 'issue', 'page', 'decision']) {
        const items = results[type + 's'] || results[type] || []
        if (items.length > 0) {
          grouped.push({ type: 'header', label: TYPE_LABELS[type] })
          for (const item of items) {
            grouped.push({ type: 'result', item })
          }
        }
      }
      return grouped
    }

    // When query is empty, show recent projects
    if (projects.length > 0) {
      const recents = [...projects]
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .slice(0, 5)
      return [
        { type: 'header', label: 'Recent Projects' },
        ...recents.map((p) => ({
          type: 'result',
          item: {
            id: p.id,
            type: 'project',
            title: p.name,
            preview: p.description || '',
            projectId: p.id,
            projectName: p.name,
          },
        })),
      ]
    }

    return []
  }, [query, results, projects])

  // Selectable indices (skip headers)
  const selectableIndices = useMemo(
    () => flatResults.map((r, i) => (r.type === 'result' ? i : -1)).filter((i) => i >= 0),
    [flatResults]
  )

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0)
  }, [flatResults.length, query])

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      // Small delay so the animation has started
      const t = setTimeout(() => inputRef.current?.focus(), 50)
      return () => clearTimeout(t)
    } else {
      clearSearch()
    }
  }, [isOpen, clearSearch])

  // Navigate to a result
  const navigateTo = useCallback(
    (item) => {
      if (!item) return
      onClose()

      switch (item.type) {
        case 'project':
          navigate(`/project/${item.projectId}`)
          break
        case 'issue':
          navigate(`/project/${item.projectId}`)
          break
        case 'page':
          navigate(`/project/${item.projectId}`)
          break
        case 'decision':
          navigate(`/project/${item.projectId}`)
          break
        default:
          break
      }
    },
    [navigate, onClose]
  )

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) => {
          // Find next selectable
          const curSelectable = selectableIndices.indexOf(prev)
          const next = curSelectable < selectableIndices.length - 1 ? curSelectable + 1 : 0
          return selectableIndices[next] ?? prev
        })
        return
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => {
          const curSelectable = selectableIndices.indexOf(prev)
          const next = curSelectable > 0 ? curSelectable - 1 : selectableIndices.length - 1
          return selectableIndices[next] ?? prev
        })
        return
      }

      if (e.key === 'Enter') {
        e.preventDefault()
        const entry = flatResults[selectedIndex]
        if (entry && entry.type === 'result') {
          navigateTo(entry.item)
        }
      }
    },
    [flatResults, selectedIndex, selectableIndices, navigateTo, onClose]
  )

  // Scroll selected item into view
  useEffect(() => {
    if (!listRef.current) return
    const el = listRef.current.querySelector(`[data-index="${selectedIndex}"]`)
    if (el) el.scrollIntoView({ block: 'nearest' })
  }, [selectedIndex])

  const hasResults =
    query.trim() &&
    (results.projects.length > 0 ||
      results.issues.length > 0 ||
      results.pages.length > 0 ||
      results.decisions.length > 0)
  const emptySearch = query.trim() && !isSearching && !hasResults

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 flex items-start justify-center pt-[12vh]"
          style={{ zIndex: 'var(--z-popover)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Palette card */}
          <motion.div
            className="relative z-10 w-full max-w-xl overflow-hidden rounded-2xl border border-[var(--color-border-default)] bg-[var(--color-bg-subtle)]/80 shadow-2xl backdrop-blur-xl"
            initial={{ opacity: 0, y: -20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            onKeyDown={handleKeyDown}
          >
            {/* Search input */}
            <div className="flex items-center gap-3 border-b border-[var(--color-border-default)] px-4 py-3">
              <Search size={18} className="shrink-0 text-[var(--color-fg-muted)]" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search projects, issues, pages, decisions..."
                className="flex-1 bg-transparent text-sm text-[var(--color-fg-default)] placeholder-[var(--color-fg-subtle)] outline-none"
              />
              <kbd className="hidden rounded-md border border-[var(--color-border-default)] bg-[var(--color-bg-glass)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--color-fg-subtle)] sm:inline-block">
                ESC
              </kbd>
            </div>

            {/* Results list */}
            <div ref={listRef} className="max-h-[50vh] overflow-y-auto py-2">
              {flatResults.length > 0 &&
                flatResults.map((entry, index) => {
                  if (entry.type === 'header') {
                    return (
                      <div
                        key={`header-${entry.label}`}
                        className="px-4 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-fg-subtle)]"
                      >
                        {entry.label}
                      </div>
                    )
                  }

                  const { item } = entry
                  const Icon = TYPE_ICONS[item.type] || FileText
                  const colorClass = TYPE_COLORS[item.type] || 'text-[var(--color-fg-muted)]'
                  const isSelected = index === selectedIndex

                  return (
                    <button
                      key={`${item.type}-${item.id}`}
                      data-index={index}
                      onClick={() => navigateTo(item)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={[
                        'flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors',
                        isSelected
                          ? 'bg-[var(--color-bg-glass-hover)] text-[var(--color-fg-default)]'
                          : 'text-[var(--color-fg-default)] hover:bg-[var(--color-bg-glass)]',
                      ].join(' ')}
                    >
                      <Icon size={16} className={`shrink-0 ${colorClass}`} />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">{item.title}</div>
                        {item.preview && (
                          <div className="truncate text-xs text-[var(--color-fg-subtle)]">
                            {item.preview}
                          </div>
                        )}
                      </div>
                      {item.projectName && item.type !== 'project' && (
                        <span className="shrink-0 rounded-full bg-[var(--color-bg-glass)] px-2 py-0.5 text-[10px] text-[var(--color-fg-subtle)]">
                          {item.projectName}
                        </span>
                      )}
                      {isSelected && (
                        <CornerDownLeft
                          size={12}
                          className="shrink-0 text-[var(--color-fg-subtle)]"
                        />
                      )}
                    </button>
                  )
                })}

              {/* Empty state */}
              {emptySearch && (
                <div className="px-4 py-10 text-center">
                  <Search size={32} className="mx-auto mb-3 text-[var(--color-fg-faint)]" />
                  <p className="text-sm text-[var(--color-fg-subtle)]">No results found</p>
                  <p className="mt-1 text-xs text-[var(--color-fg-faint)]">
                    Try a different search term
                  </p>
                </div>
              )}

              {/* No projects at all */}
              {!query.trim() && projects.length === 0 && (
                <div className="px-4 py-10 text-center">
                  <FolderKanban size={32} className="mx-auto mb-3 text-[var(--color-fg-faint)]" />
                  <p className="text-sm text-[var(--color-fg-subtle)]">No projects yet</p>
                  <p className="mt-1 text-xs text-[var(--color-fg-faint)]">
                    Create a project to get started
                  </p>
                </div>
              )}
            </div>

            {/* Footer hints */}
            <div className="flex items-center gap-4 border-t border-[var(--color-border-default)] px-4 py-2">
              <span className="flex items-center gap-1 text-[11px] text-[var(--color-fg-faint)]">
                <ArrowUp size={10} />
                <ArrowDown size={10} />
                navigate
              </span>
              <span className="flex items-center gap-1 text-[11px] text-[var(--color-fg-faint)]">
                <CornerDownLeft size={10} />
                open
              </span>
              <span className="flex items-center gap-1 text-[11px] text-[var(--color-fg-faint)]">
                <Command size={10} />
                <span>/</span>
                toggle
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
