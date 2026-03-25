import { useMemo, useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Layers } from 'lucide-react'
import ProgressBar from '../ui/ProgressBar'
import Badge from '../ui/Badge'
import { shortEpicTitle } from '../../utils/constants'

const EPIC_COLORS = [
  'bg-purple-400',
  'bg-blue-400',
  'bg-cyan-400',
  'bg-green-400',
  'bg-yellow-400',
  'bg-orange-400',
  'bg-pink-400',
  'bg-red-400',
]

const MIN_WIDTH = 200
const MAX_WIDTH = 480
const DEFAULT_WIDTH = 256
const COLLAPSED_WIDTH = 40
const STORAGE_KEY = 'storyflow-epic-sidebar-width'

function useResizable(isCollapsed) {
  const [width, setWidth] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, Number(saved))) : DEFAULT_WIDTH
    } catch {
      return DEFAULT_WIDTH
    }
  })
  const [isDragging, setIsDragging] = useState(false)
  const startXRef = useRef(0)
  const startWidthRef = useRef(0)

  const handleMouseDown = useCallback(
    (e) => {
      if (isCollapsed) return
      e.preventDefault()
      startXRef.current = e.clientX
      startWidthRef.current = width
      setIsDragging(true)
    },
    [isCollapsed, width]
  )

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e) => {
      const delta = e.clientX - startXRef.current
      const next = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, startWidthRef.current + delta))
      setWidth(next)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      try {
        localStorage.setItem(STORAGE_KEY, String(width))
      } catch {
        // ignore
      }
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    // Prevent text selection while dragging
    document.body.style.userSelect = 'none'
    document.body.style.cursor = 'col-resize'

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.userSelect = ''
      document.body.style.cursor = ''
    }
  }, [isDragging, width])

  // Persist on width change (debounced by mouseUp)
  const effectiveWidth = isCollapsed ? COLLAPSED_WIDTH : width

  return { width: effectiveWidth, isDragging, handleMouseDown }
}

export default function EpicSidebar({
  issues = [],
  onFilterByEpic,
  activeEpicId = null,
  isCollapsed = false,
  onToggleCollapse,
}) {
  const { width, isDragging, handleMouseDown } = useResizable(isCollapsed)

  // Compute epic data
  const epicData = useMemo(() => {
    const epics = issues.filter((i) => i.type === 'epic')
    return epics.map((epic, idx) => {
      const children = issues.filter((i) => i.epicId === epic.id && i.id !== epic.id)
      const total = children.length
      const done = children.filter((c) => c.status === 'Done').length
      const progress = total > 0 ? Math.round((done / total) * 100) : 0
      return {
        ...epic,
        childCount: total,
        doneCount: done,
        progress,
        colorDot: EPIC_COLORS[idx % EPIC_COLORS.length],
      }
    })
  }, [issues])

  return (
    <div
      className="workstation-sidebar relative flex flex-col"
      style={{
        width,
        backgroundColor: 'var(--th-panel-light)',
        transition: isDragging ? 'none' : 'width 0.2s ease',
      }}
    >
      <AnimatePresence mode="wait">
        {isCollapsed ? (
          <motion.div
            key="collapsed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex flex-1 flex-col items-center pt-3"
          >
            <button
              onClick={onToggleCollapse}
              className="rounded-md p-1.5 text-[var(--color-fg-muted)] transition-colors hover:bg-[var(--color-bg-glass-hover)] hover:text-[var(--color-fg-default)]"
              title="Expand epics"
            >
              <ChevronRight size={14} />
            </button>
            <div className="mt-3 rotate-90 whitespace-nowrap text-[10px] font-semibold uppercase tracking-widest text-[var(--color-fg-subtle)]">
              Epics
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="expanded"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex flex-1 flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-[var(--color-border-default)] px-4 py-3">
              <div className="flex items-center gap-2">
                <Layers size={14} style={{ color: 'var(--accent-default)' }} />
                <h3 className="text-sm font-semibold text-[var(--color-fg-muted)]">Epics</h3>
                <Badge variant="purple" size="sm">
                  {epicData.length}
                </Badge>
              </div>
              <button
                onClick={onToggleCollapse}
                className="rounded-md p-1 text-[var(--color-fg-muted)] transition-colors hover:bg-[var(--color-bg-glass-hover)] hover:text-[var(--color-fg-default)]"
              >
                <ChevronLeft size={14} />
              </button>
            </div>

            {/* Epic list */}
            <div className="flex-1 overflow-y-auto p-2">
              {/* All issues option */}
              <button
                onClick={() => onFilterByEpic?.(null)}
                className={[
                  'mb-1 flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors',
                  activeEpicId === null
                    ? 'text-[var(--color-fg-default)] font-medium'
                    : 'text-[var(--color-fg-muted)] hover:text-[var(--color-fg-default)]',
                ].join(' ')}
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[var(--color-bg-muted)]">
                  <Layers size={11} className="text-[var(--color-fg-muted)]" />
                </span>
                All Issues
              </button>

              {/* Individual epics */}
              <div className="space-y-0.5">
                {epicData.map((epic) => (
                  <button
                    key={epic.id}
                    onClick={() => onFilterByEpic?.(epic.id)}
                    className={[
                      'group w-full rounded-lg px-3 py-2.5 text-left transition-colors',
                      activeEpicId !== epic.id && 'hover:text-[var(--color-fg-default)]',
                    ].join(' ')}
                  >
                    {/* Epic title row */}
                    <div className="mb-1.5 flex items-center gap-2">
                      <span
                        className={['h-2.5 w-2.5 shrink-0 rounded-full', epic.colorDot].join(' ')}
                      />
                      <span
                        className={[
                          'min-w-0 flex-1 truncate text-sm font-medium',
                          activeEpicId === epic.id
                            ? ''
                            : 'text-[var(--color-fg-muted)] group-hover:text-[var(--color-fg-default)]',
                        ].join(' ')}
                        style={
                          activeEpicId === epic.id ? { color: 'var(--accent-default)' } : undefined
                        }
                        title={epic.title}
                      >
                        {shortEpicTitle(epic.title)}
                      </span>
                    </div>

                    {/* Progress bar */}
                    <ProgressBar value={epic.progress} size="sm" />

                    {/* Stats row */}
                    <div className="mt-1.5 flex items-center justify-between text-[10px]">
                      <span className="text-[var(--color-fg-muted)]">{epic.childCount} issues</span>
                      <span className="text-[var(--color-fg-muted)]">
                        {epic.doneCount}/{epic.childCount} done
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              {epicData.length === 0 && (
                <div className="py-8 text-center text-xs text-[var(--color-fg-subtle)]">
                  No epics yet. Create one to organize your issues.
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Resize handle */}
      {!isCollapsed && (
        <div
          onMouseDown={handleMouseDown}
          className={[
            'absolute inset-y-0 -right-1 z-10 flex w-2 cursor-col-resize items-center justify-center',
            'opacity-0 transition-opacity hover:opacity-100',
            isDragging && 'opacity-100',
          ]
            .filter(Boolean)
            .join(' ')}
          title="Drag to resize"
        >
          <div
            className={[
              'h-8 w-1 rounded-full transition-colors',
              isDragging
                ? 'bg-[var(--accent-default)]'
                : 'bg-[var(--color-fg-faint)] hover:bg-[var(--color-fg-muted)]',
            ].join(' ')}
          />
        </div>
      )}
    </div>
  )
}
