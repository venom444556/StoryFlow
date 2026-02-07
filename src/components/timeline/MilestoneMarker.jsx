import React from 'react'
import { Edit3, Trash2, CheckCircle2, Circle, Calendar } from 'lucide-react'
import GlassCard from '../ui/GlassCard'
import Tooltip from '../ui/Tooltip'
import { formatDate } from '../../utils/dates'
import { sanitizeColor } from '../../utils/sanitize'

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
  const color = sanitizeColor(milestone?.color, '#f59e0b')

  return (
    <div className="relative flex gap-4">
      {/* Timeline spine */}
      <div className="flex flex-col items-center pt-1">
        {/* Diamond */}
        <div className="relative z-10 flex h-3.5 w-3.5 shrink-0 items-center justify-center">
          <div
            className={[
              'h-3 w-3 rotate-45 border-2 transition-colors cursor-pointer',
              completed
                ? 'shadow-lg'
                : 'bg-transparent',
            ].join(' ')}
            style={{
              borderColor: color,
              backgroundColor: completed ? color : 'transparent',
              boxShadow: completed ? `0 0 8px ${color}40` : 'none',
            }}
            onClick={() => onToggle?.(milestone)}
          />
        </div>
        {/* Connecting line */}
        {!isLast && (
          <div
            className="mt-0 w-px flex-1"
            style={{ backgroundColor: `${color}30` }}
          />
        )}
      </div>

      {/* Card */}
      <div className="group mb-4 flex-1 pb-2">
        <GlassCard padding="none" className="overflow-hidden">
          {/* Color accent */}
          <div className="h-1 w-full" style={{ backgroundColor: color }} />

          <div className="px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                {/* Toggle icon */}
                <button
                  onClick={() => onToggle?.(milestone)}
                  className="shrink-0 transition-colors"
                >
                  {completed ? (
                    <CheckCircle2 size={16} style={{ color }} />
                  ) : (
                    <Circle size={16} className="text-slate-500" />
                  )}
                </button>

                <h4
                  className={[
                    'text-sm font-semibold truncate',
                    completed ? 'text-slate-400 line-through' : 'text-white',
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
                        className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
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
                        className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-red-500/20 hover:text-red-400"
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
              <div className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500">
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
