import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Layers } from 'lucide-react'
import IssueTypeIcon from './IssueTypeIcon'
import ProgressBar from '../ui/ProgressBar'
import Badge from '../ui/Badge'

export default function EpicSidebar({
  issues = [],
  onFilterByEpic,
  activeEpicId = null,
  isCollapsed = false,
  onToggleCollapse,
}) {
  // Compute epic data
  const epicData = useMemo(() => {
    const epics = issues.filter((i) => i.type === 'epic')
    return epics.map((epic) => {
      const children = issues.filter((i) => i.epicId === epic.id && i.id !== epic.id)
      const total = children.length
      const done = children.filter((c) => c.status === 'Done').length
      const progress = total > 0 ? Math.round((done / total) * 100) : 0
      return { ...epic, childCount: total, doneCount: done, progress }
    })
  }, [issues])

  return (
    <AnimatePresence mode="wait">
      {isCollapsed ? (
        <motion.div
          key="collapsed"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 40, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="flex shrink-0 flex-col items-center border-r border-[var(--color-border-default)] pt-3"
          style={{ backgroundColor: 'var(--th-panel-light)' }}
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
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 256, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="flex w-64 shrink-0 flex-col border-r border-[var(--color-border-default)] backdrop-blur-xl"
          style={{ backgroundColor: 'var(--th-panel-light)' }}
        >
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between border-b border-[var(--color-border-default)] px-4 py-3">
            <div className="flex items-center gap-2">
              <Layers size={14} style={{ color: 'var(--accent-active, #8b5cf6)' }} />
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
                  ? 'bg-[var(--color-bg-glass-hover)] text-[var(--color-fg-default)]'
                  : 'text-[var(--color-fg-muted)] hover:bg-[var(--color-bg-glass)] hover:text-[var(--color-fg-default)]',
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
                    activeEpicId === epic.id ? 'ring-1' : 'hover:bg-[var(--color-bg-glass)]',
                  ].join(' ')}
                  style={
                    activeEpicId === epic.id
                      ? {
                          backgroundColor: 'rgba(var(--accent-active-rgb, 139, 92, 246), 0.15)',
                          '--tw-ring-color': 'rgba(var(--accent-active-rgb, 139, 92, 246), 0.2)',
                        }
                      : undefined
                  }
                >
                  {/* Epic title row */}
                  <div className="mb-1.5 flex items-center gap-2">
                    <IssueTypeIcon type="epic" size={14} />
                    <span
                      className={[
                        'min-w-0 flex-1 truncate text-sm font-medium',
                        activeEpicId === epic.id
                          ? ''
                          : 'text-[var(--color-fg-muted)] group-hover:text-[var(--color-fg-default)]',
                      ].join(' ')}
                      style={
                        activeEpicId === epic.id
                          ? { color: 'var(--accent-active, #8b5cf6)' }
                          : undefined
                      }
                    >
                      {epic.title}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <ProgressBar value={epic.progress} size="sm" />

                  {/* Stats row */}
                  <div className="mt-1.5 flex items-center justify-between text-[10px]">
                    <span className="text-[var(--color-fg-muted)]">
                      {epic.doneCount}/{epic.childCount} done
                    </span>
                    <span
                      className={
                        epic.progress === 100 ? 'text-green-400' : 'text-[var(--color-fg-muted)]'
                      }
                    >
                      {epic.progress}%
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
  )
}
