import { motion } from 'framer-motion'
import { Edit3, Calendar } from 'lucide-react'
import GlassCard from '../ui/GlassCard'
import Badge from '../ui/Badge'
import { formatRelative } from '../../utils/dates'

const STATUS_CONFIG = {
  proposed: { label: 'Proposed', variant: 'yellow' },
  accepted: { label: 'Accepted', variant: 'green' },
  superseded: { label: 'Superseded', variant: 'gray' },
}

export default function DecisionCard({ decision, onEdit, onClick }) {
  const statusCfg = STATUS_CONFIG[decision.status] || STATUS_CONFIG.proposed
  const tags = decision.tags || []

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
    >
      <GlassCard
        hover
        padding="none"
        className="group overflow-hidden"
        onClick={() => onClick?.(decision)}
      >
        {/* Status accent stripe */}
        <div
          className={[
            'h-0.5 w-full',
            decision.status === 'accepted' && 'bg-green-500',
            decision.status === 'proposed' && 'bg-yellow-500',
            decision.status === 'superseded' && 'bg-[var(--color-fg-subtle)]',
          ]
            .filter(Boolean)
            .join(' ')}
        />

        <div className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2.5">
                <h4 className="truncate text-sm font-semibold text-[var(--color-fg-default)]">
                  {decision.title}
                </h4>
                <Badge variant={statusCfg.variant} size="sm" dot>
                  {statusCfg.label}
                </Badge>
              </div>
            </div>

            {/* Edit action on hover */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                onEdit?.(decision)
              }}
              className="shrink-0 rounded-md p-1.5 text-[var(--color-fg-muted)] opacity-0 transition-all hover:bg-[var(--color-bg-glass-hover)] hover:text-[var(--color-fg-default)] group-hover:opacity-100"
            >
              <Edit3 size={14} />
            </button>
          </div>

          {/* Context preview */}
          {decision.context && (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[var(--color-fg-muted)]">
              {decision.context}
            </p>
          )}

          {/* Footer */}
          <div className="mt-3 flex items-center justify-between">
            {/* Tags */}
            <div className="flex flex-wrap gap-1">
              {tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="purple" size="xs">
                  {tag}
                </Badge>
              ))}
              {tags.length > 3 && (
                <Badge variant="default" size="xs">
                  +{tags.length - 3}
                </Badge>
              )}
            </div>

            {/* Date */}
            {decision.createdAt && (
              <span className="flex items-center gap-1.5 text-xs text-[var(--color-fg-muted)]">
                <Calendar size={11} />
                {formatRelative(decision.createdAt)}
              </span>
            )}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  )
}
