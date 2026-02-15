import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Edit3, Trash2, ChevronDown, ChevronRight, Calendar, CheckCircle2, Clock, Target } from 'lucide-react'
import GlassCard from '../ui/GlassCard'
import ProgressBar from '../ui/ProgressBar'
import Badge from '../ui/Badge'
import Tooltip from '../ui/Tooltip'
import { formatDate } from '../../utils/dates'
import { sanitizeColor } from '../../utils/sanitize'

function getStatus(progress) {
  if (progress === 0) return { label: 'Not Started', variant: 'gray', icon: Clock }
  if (progress >= 100) return { label: 'Complete', variant: 'green', icon: CheckCircle2 }
  return { label: 'In Progress', variant: 'blue', icon: Target }
}

export default function PhaseCard({ phase, onEdit, onDelete, isLast }) {
  const [expanded, setExpanded] = useState(false)
  const status = getStatus(phase.progress || 0)
  const StatusIcon = status.icon

  const hasDescription = phase.description && phase.description.trim().length > 0
  const hasDateRange = phase.startDate || phase.endDate

  return (
    <motion.div
      layout
      className="relative flex gap-4"
    >
      {/* Timeline spine */}
      <div className="flex flex-col items-center pt-1">
        {/* Dot */}
        <div
          className="relative z-10 h-3.5 w-3.5 shrink-0 rounded-full border-2 shadow-lg"
          style={{
            borderColor: sanitizeColor(phase.color, '#8b5cf6'),
            backgroundColor: phase.progress >= 100 ? sanitizeColor(phase.color, '#8b5cf6') : 'transparent',
            boxShadow: `0 0 8px ${sanitizeColor(phase.color, '#8b5cf6')}40`,
          }}
        />
        {/* Connecting line */}
        {!isLast && (
          <div
            className="mt-0 w-px flex-1"
            style={{ backgroundColor: `${sanitizeColor(phase.color, '#8b5cf6')}30` }}
          />
        )}
      </div>

      {/* Card */}
      <div className="group mb-4 flex-1 pb-2">
        <GlassCard padding="none" className="overflow-hidden">
          {/* Color accent bar */}
          <div
            className="h-1 w-full"
            style={{ backgroundColor: sanitizeColor(phase.color, '#8b5cf6') }}
          />

          <div className="p-4">
            {/* Header row */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <h4 className="text-sm font-semibold text-[var(--color-fg-default)] truncate">{phase.name}</h4>
                <Badge variant={status.variant} size="sm" dot>
                  {status.label}
                </Badge>
              </div>

              {/* Actions */}
              <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <Tooltip content="Edit phase">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onEdit?.(phase)
                    }}
                    className="rounded-md p-1.5 text-[var(--color-fg-muted)] transition-colors hover:bg-[var(--color-bg-glass-hover)] hover:text-[var(--color-fg-default)]"
                  >
                    <Edit3 size={14} />
                  </button>
                </Tooltip>
                <Tooltip content="Delete phase">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete?.(phase)
                    }}
                    className="rounded-md p-1.5 text-[var(--color-fg-muted)] transition-colors hover:bg-red-500/20 hover:text-red-400"
                  >
                    <Trash2 size={14} />
                  </button>
                </Tooltip>
              </div>
            </div>

            {/* Date range */}
            <div className="mt-2 flex items-center gap-1.5 text-xs text-[var(--color-fg-muted)]">
              <Calendar size={12} />
              {hasDateRange ? (
                <span>
                  {phase.startDate ? formatDate(phase.startDate) : '...'}
                  {' \u2014 '}
                  {phase.endDate ? formatDate(phase.endDate) : '...'}
                </span>
              ) : (
                <span className="italic">No dates set</span>
              )}
            </div>

            {/* Description */}
            {hasDescription && (
              <div className="mt-2.5">
                <p
                  className={[
                    'text-sm text-[var(--color-fg-muted)] leading-relaxed',
                    !expanded && 'line-clamp-2',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {phase.description}
                </p>
                {phase.description.length > 120 && (
                  <button
                    onClick={() => setExpanded((prev) => !prev)}
                    className="mt-1 inline-flex items-center gap-1 text-xs transition-colors"
                    style={{ color: 'var(--accent-active, #8b5cf6)' }}
                  >
                    {expanded ? (
                      <>
                        Show less <ChevronDown size={12} className="rotate-180" />
                      </>
                    ) : (
                      <>
                        Show more <ChevronRight size={12} />
                      </>
                    )}
                  </button>
                )}
              </div>
            )}

            {/* Progress */}
            <div className="mt-3">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs text-[var(--color-fg-muted)]">Progress</span>
                <span className="text-xs font-medium text-[var(--color-fg-muted)]">
                  {Math.round(phase.progress || 0)}%
                </span>
              </div>
              <ProgressBar value={phase.progress || 0} size="sm" />
            </div>
          </div>
        </GlassCard>
      </div>
    </motion.div>
  )
}
