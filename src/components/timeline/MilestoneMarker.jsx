import { Edit3, Trash2, CheckCircle2, Circle, Calendar } from 'lucide-react'
import GlassCard from '../ui/GlassCard'
import Tooltip from '../ui/Tooltip'
import { formatDate } from '../../utils/dates'

export default function MilestoneMarker({
  milestone,
  onEdit,
  onDelete,
  onToggle,
  isLast = false,
  // Legacy props for backwards compat
  title: legacyTitle,
  date: legacyDate,
  completed: legacyCompleted,
}) {
  // Support both new milestone object prop and legacy individual props
  const name = milestone?.name || legacyTitle || ''
  const date = milestone?.date || legacyDate
  const completed = milestone?.completed ?? legacyCompleted ?? false

  return (
    <div className="relative flex gap-4">
      {/* Timeline spine */}
      <div className="flex flex-col items-center pt-1">
        {/* Diamond */}
        <div className="relative z-10 flex h-3.5 w-3.5 shrink-0 items-center justify-center">
          <div
            className={[
              'h-2.5 w-2.5 rotate-45 border-2 transition-colors cursor-pointer',
              completed
                ? 'border-[var(--color-fg-muted)] bg-[var(--color-fg-muted)]'
                : 'border-[var(--color-fg-subtle)] bg-transparent',
            ].join(' ')}
            onClick={() => onToggle?.(milestone)}
          />
        </div>
        {/* Connecting line */}
        {!isLast && <div className="mt-0 w-px flex-1 bg-[var(--color-border-default)]" />}
      </div>

      {/* Card */}
      <div className="group mb-4 flex-1 pb-2">
        <GlassCard padding="none" className="overflow-hidden">
          <div className="px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                {/* Toggle icon */}
                <button
                  onClick={() => onToggle?.(milestone)}
                  className="shrink-0 transition-colors"
                >
                  {completed ? (
                    <CheckCircle2 size={16} className="text-[var(--color-fg-muted)]" />
                  ) : (
                    <Circle size={16} className="text-[var(--color-fg-muted)]" />
                  )}
                </button>

                <h4
                  className={[
                    'text-sm font-semibold',
                    completed
                      ? 'text-[var(--color-fg-muted)] line-through'
                      : 'text-[var(--color-fg-default)]',
                  ].join(' ')}
                >
                  {name}
                </h4>
              </div>

              {/* Actions */}
              {(onEdit || onDelete) && (
                <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  {onEdit && (
                    <Tooltip content="Edit milestone">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onEdit?.(milestone)
                        }}
                        className="rounded-md p-1.5 text-[var(--color-fg-muted)] transition-colors hover:bg-[var(--color-bg-glass-hover)] hover:text-[var(--color-fg-default)]"
                      >
                        <Edit3 size={14} />
                      </button>
                    </Tooltip>
                  )}
                  {onDelete && (
                    <Tooltip content="Delete milestone">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onDelete?.(milestone)
                        }}
                        className="rounded-md p-1.5 text-[var(--color-fg-muted)] transition-colors hover:bg-red-500/20 hover:text-red-400"
                      >
                        <Trash2 size={14} />
                      </button>
                    </Tooltip>
                  )}
                </div>
              )}
            </div>

            {/* Date */}
            {date && (
              <div className="mt-1.5 flex items-center gap-1.5 text-xs text-[var(--color-fg-muted)]">
                <Calendar size={12} />
                <span>{formatDate(date)}</span>
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
