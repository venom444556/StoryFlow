import { motion } from 'framer-motion'
import { Edit3, Calendar } from 'lucide-react'
import GlassCard from '../ui/GlassCard'
import Badge from '../ui/Badge'
import ProvenanceBadge from '../ui/ProvenanceBadge'
import { formatRelative } from '../../utils/dates'

const STATUS_CONFIG = {
  proposed: { label: 'Proposed', variant: 'yellow', borderColor: 'var(--color-warning)' },
  accepted: { label: 'Accepted', variant: 'green', borderColor: 'var(--color-success)' },
  superseded: { label: 'Superseded', variant: 'gray', borderColor: 'var(--color-fg-faint)' },
  deprecated: { label: 'Deprecated', variant: 'red', borderColor: 'var(--color-danger)' },
}

export default function DecisionCard({ decision, onEdit, onClick, isActive = false }) {
  const statusCfg = STATUS_CONFIG[decision.status] || STATUS_CONFIG.proposed
  const tags = decision.tags || []

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.15 }}
      onClick={() => onClick?.(decision)}
      className={[
        'group relative cursor-pointer px-4 py-3 transition-colors',
        isActive ? 'bg-[var(--color-bg-glass-hover)]' : 'hover:bg-[var(--color-bg-glass-hover)]',
        'border-b border-[var(--color-border-subtle)] last:border-b-0',
      ].join(' ')}
      style={{ borderLeft: `3px solid ${statusCfg.borderColor}` }}
    >
      {/* Active Indicator Line */}
      {isActive && (
        <motion.div
          layoutId="activeDecision"
          className="absolute left-0 top-0 bottom-0 w-[3px] bg-[var(--accent-default)]"
        />
      )}

      <div className="flex gap-3">
        {/* Left Column: ID & Status */}
        <div className="w-[72px] shrink-0 pt-0.5 flex flex-col gap-1.5 items-start">
          <span className="text-[11px] font-mono font-medium text-[var(--color-fg-muted)] group-hover:text-[var(--accent-default)] transition-colors">
            {decision.sequenceNumber
              ? `ADR-${String(decision.sequenceNumber).padStart(3, '0')}`
              : 'ADR'}
          </span>
          <Badge variant={statusCfg.variant} size="xs" outline className="w-full justify-center">
            {statusCfg.label}
          </Badge>
        </div>

        {/* Right Column: Content */}
        <div className="min-w-0 flex-1 flex flex-col gap-1">
          <div className="flex items-start justify-between gap-3">
            <h4
              className={[
                'text-[13px] font-medium leading-snug transition-colors',
                isActive
                  ? 'text-[var(--color-fg-default)]'
                  : 'text-[var(--color-fg-muted)] group-hover:text-[var(--color-fg-default)]',
              ].join(' ')}
            >
              {decision.title}
            </h4>

            {/* Edit action */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                onEdit?.(decision)
              }}
              className="shrink-0 rounded flex items-center justify-center h-5 w-5 text-[var(--color-fg-muted)] opacity-0 transition-all hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-fg-default)] group-hover:opacity-100"
            >
              <Edit3 size={11} />
            </button>
          </div>

          <div className="flex items-center gap-3 text-[10px] uppercase tracking-wider font-semibold text-[var(--color-fg-subtle)] mt-0.5">
            {decision.createdAt && (
              <span className="flex items-center gap-1 opacity-80">
                <Calendar size={9} />
                {formatRelative(decision.createdAt)}
              </span>
            )}
            {decision.createdBy && (
              <ProvenanceBadge
                actor={decision.createdBy}
                reasoning={decision.createdByReasoning}
                timestamp={decision.createdAt}
                size="xs"
              />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
