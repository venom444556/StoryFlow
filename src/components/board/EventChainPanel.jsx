import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, ArrowRight, FileText, Zap, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useEventStore, selectEventsByEntity } from '../../stores/eventStore'
import ProvenanceBadge from '../ui/ProvenanceBadge'

const ACTION_ICONS = {
  create: Plus,
  update: Pencil,
  delete: Trash2,
  status_change: ArrowRight,
  analyze: Zap,
  info: FileText,
}

function ChainEvent({ event, isFirst, isLast }) {
  const Icon = ACTION_ICONS[event.action] || FileText

  const timeAgo = useMemo(() => {
    try {
      return formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })
    } catch {
      return ''
    }
  }, [event.timestamp])

  const label = useMemo(() => {
    switch (event.action) {
      case 'create':
        return 'Created'
      case 'update':
        return 'Updated'
      case 'status_change': {
        const changes = event.changes || []
        const statusChange = changes.find((c) => c.field === 'status')
        return statusChange ? `Status → ${statusChange.to}` : 'Status changed'
      }
      case 'delete':
        return 'Deleted'
      default:
        return event.action
    }
  }, [event])

  return (
    <div className="flex gap-3">
      {/* Timeline line + dot */}
      <div className="flex w-5 flex-col items-center">
        <div
          className={[
            'h-2 w-px',
            isFirst ? 'bg-transparent' : 'bg-[var(--color-border-default)]',
          ].join(' ')}
        />
        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-bg-glass)]">
          <Icon size={10} className="text-[var(--color-fg-muted)]" />
        </div>
        <div
          className={[
            'flex-1 w-px',
            isLast ? 'bg-transparent' : 'bg-[var(--color-border-default)]',
          ].join(' ')}
        />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-medium text-[var(--color-fg-default)]">{label}</span>
          <ProvenanceBadge actor={event.actor} size="xs" />
          <span className="text-[10px] text-[var(--color-fg-faint)]">{timeAgo}</span>
        </div>

        {/* Changes detail */}
        {event.changes && event.changes.length > 0 && event.action !== 'status_change' && (
          <div className="mt-1 space-y-0.5">
            {event.changes.slice(0, 5).map((change, i) => (
              <p key={i} className="text-[11px] text-[var(--color-fg-subtle)]">
                <span className="text-[var(--color-fg-muted)]">{change.field}:</span>{' '}
                {change.from !== null && change.from !== undefined && (
                  <>
                    <span className="line-through opacity-60">
                      {String(change.from).slice(0, 40)}
                    </span>
                    {' → '}
                  </>
                )}
                <span>{String(change.to).slice(0, 60)}</span>
              </p>
            ))}
          </div>
        )}

        {/* Reasoning */}
        {event.reasoning && (
          <p className="mt-1 text-[11px] leading-relaxed text-[var(--color-fg-subtle)]">
            <span className="font-medium text-[var(--color-ai-accent)]">Why:</span>{' '}
            {event.reasoning}
          </p>
        )}
      </div>
    </div>
  )
}

export default function EventChainPanel({ entityType, entityId }) {
  const selector = useMemo(() => selectEventsByEntity(entityType, entityId), [entityType, entityId])
  const events = useEventStore(selector)

  // Sort oldest-first for the timeline
  const sortedEvents = useMemo(() => [...events].reverse(), [events])

  if (sortedEvents.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-[var(--color-bg-glass)] px-3 py-4 text-center">
        <Clock size={14} className="mx-auto text-[var(--color-fg-faint)]" />
        <p className="text-xs text-[var(--color-fg-subtle)]">No event history yet</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-glass)] p-3">
      <AnimatePresence initial={false}>
        {sortedEvents.map((event, i) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15, delay: i * 0.03 }}
          >
            <ChainEvent event={event} isFirst={i === 0} isLast={i === sortedEvents.length - 1} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
