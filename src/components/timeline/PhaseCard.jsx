import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Edit3,
  Trash2,
  ChevronDown,
  ChevronRight,
  Calendar,
  CheckCircle2,
  Clock,
  Target,
  Tag,
  Loader2,
  FileText,
} from 'lucide-react'
import GlassCard from '../ui/GlassCard'
import ProgressBar from '../ui/ProgressBar'
import Badge from '../ui/Badge'
import Tooltip from '../ui/Tooltip'
import { formatDate } from '../../utils/dates'
import HotWashModal from './HotWashReport'

function getStatus(progress) {
  if (progress === 0) return { label: 'Not Started', variant: 'default', icon: Clock }
  if (progress >= 100) return { label: 'Complete', variant: 'success', icon: CheckCircle2 }
  return { label: 'In Progress', variant: 'info', icon: Target }
}

export default function PhaseCard({
  phase,
  onEdit,
  onDelete,
  onOpenHotWash,
  onGenerateHotWash,
  onFinalizeHotWash,
  projectId,
  isLast,
}) {
  const [expanded, setExpanded] = useState(false)
  const [showHotWashModal, setShowHotWashModal] = useState(false)
  const status = getStatus(phase.progress || 0)

  const hasDescription = phase.description && phase.description.trim().length > 0
  const hasDateRange = phase.startDate || phase.endDate

  const handleOpenHotWash = () => {
    onOpenHotWash?.(phase.id)
    setShowHotWashModal(true)
  }

  return (
    <motion.div layout className="relative flex gap-4">
      {/* Timeline spine */}
      <div className="flex flex-col items-center pt-1">
        {/* Dot */}
        <div
          className={[
            'relative z-10 h-3 w-3 shrink-0 rounded-full border-2',
            phase.progress >= 100
              ? 'border-[var(--color-fg-muted)] bg-[var(--color-fg-muted)]'
              : 'border-[var(--color-fg-subtle)] bg-transparent',
          ].join(' ')}
        />
        {/* Connecting line */}
        {!isLast && <div className="mt-0 w-px flex-1 bg-[var(--color-border-default)]" />}
      </div>

      {/* Card */}
      <div className="group mb-4 flex-1 pb-2">
        <GlassCard padding="none" className="overflow-hidden">
          <div className="p-4">
            {/* Header row */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <h4 className="text-sm font-semibold text-[var(--color-fg-default)]">
                  {phase.name}
                </h4>
                <Badge variant={status.variant} size="xs" outline dot>
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
                    className="rounded-md p-1.5 text-[var(--color-fg-muted)] transition-colors hover:bg-[var(--color-danger-subtle)] hover:text-[var(--color-danger)]"
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
                    className="mt-1 inline-flex items-center gap-1 text-xs text-[var(--color-fg-muted)] transition-colors hover:text-[var(--color-fg-default)]"
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

            {/* Deliverable tags */}
            {(phase.deliverables || []).length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {phase.deliverables.map((d, i) => (
                  <Badge key={i} variant="default" outline size="xs">
                    <Tag size={9} className="mr-1" />
                    {d}
                  </Badge>
                ))}
              </div>
            )}

            {/* Progress with glow */}
            <div className="mt-3">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs text-[var(--color-fg-muted)]">Progress</span>
                <span className="text-xs font-medium text-[var(--color-fg-muted)]">
                  {Math.round(phase.progress || 0)}%
                </span>
              </div>
              <ProgressBar value={phase.progress || 0} size="sm" />
            </div>

            {/* Hot Wash Entry Point */}
            {((phase.progress || 0) >= 100 || phase.hotWash) && (
              <div className="mt-4 pt-3 border-t border-[var(--color-border-subtle)]">
                {['draft', 'final'].includes(phase.hotWash?.status) ? (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-fg-muted)] flex items-center gap-1.5">
                        <FileText size={12} /> Hot Wash Report
                        {phase.hotWash.status === 'draft' && (
                          <Badge variant="blue" size="xs">
                            Draft
                          </Badge>
                        )}
                      </span>
                      <button
                        onClick={handleOpenHotWash}
                        className="text-[10px] text-[var(--color-interactive-default)] hover:text-[var(--color-interactive-hover)] transition-colors underline-offset-2 hover:underline font-medium"
                      >
                        Read Full Report
                      </button>
                    </div>
                    <p className="text-xs text-[var(--color-fg-muted)] line-clamp-2 pr-4 leading-relaxed">
                      {phase.hotWash.summary || 'Summary detailing operational findings.'}
                    </p>
                    {projectId && (
                      <div className="mt-3">
                        <Link
                          to={`/project/${projectId}/insights/lessons`}
                          className="inline-flex items-center gap-1 text-[10px] font-medium text-[var(--accent-default)] transition-colors hover:text-[var(--color-interactive-hover)]"
                        >
                          <span>Open Lessons Learned Page</span>
                          <ChevronRight size={10} />
                        </Link>
                      </div>
                    )}
                  </>
                ) : phase.hotWash?.status === 'generating' ? (
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-fg-muted)] flex items-center gap-1.5">
                      <FileText size={12} /> Hot Wash Report
                    </span>
                    <div className="flex items-center gap-1.5 text-[10px] text-[var(--color-accent-blue)]">
                      <Loader2 size={10} className="animate-spin" />
                      <span className="uppercase tracking-wider font-semibold">Compiling</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-fg-muted)] flex items-center gap-1.5">
                      <FileText size={12} /> Hot Wash Report
                    </span>
                    <button
                      onClick={() => onGenerateHotWash?.(phase.id)}
                      className="flex items-center gap-1 text-[10px] text-[var(--color-fg-subtle)] hover:text-[var(--color-interactive-default)] transition-colors"
                    >
                      Generate <ChevronRight size={10} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </GlassCard>
      </div>

      <HotWashModal
        isOpen={showHotWashModal}
        onClose={() => setShowHotWashModal(false)}
        report={phase.hotWash}
        onFinalize={onFinalizeHotWash}
        projectId={projectId}
      />
    </motion.div>
  )
}
