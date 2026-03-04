import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Pencil,
  Trash2,
  ArrowRight,
  Check,
  XCircle,
  FileText,
  Zap,
  Layers,
  Filter,
  Clock,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useEventStore, selectEvents } from '../../stores/eventStore'
import ProvenanceBadge from '../ui/ProvenanceBadge'

const ACTION_ICONS = {
  create: Plus,
  update: Pencil,
  delete: Trash2,
  status_change: ArrowRight,
  approve: Check,
  reject: XCircle,
  analyze: Zap,
  steer: Layers,
  info: FileText,
}

const CATEGORY_LABELS = {
  board: 'Board',
  wiki: 'Wiki',
  architecture: 'Architecture',
  workflow: 'Workflow',
  timeline: 'Timeline',
  decisions: 'Decisions',
  project: 'Project',
  steering: 'Steering',
  system: 'System',
}

const CATEGORY_COLORS = {
  board: 'var(--color-info, #3b82f6)',
  wiki: 'var(--color-success, #22c55e)',
  architecture: 'var(--badge-purple-fg, #a78bfa)',
  workflow: 'var(--badge-cyan-fg, #22d3ee)',
  steering: 'var(--color-warning, #eab308)',
  project: 'var(--accent-active, #8b5cf6)',
  system: 'var(--color-fg-muted)',
}

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'board', label: 'Board' },
  { key: 'wiki', label: 'Wiki' },
  { key: 'steering', label: 'Steering' },
  { key: 'ai', label: 'AI Only', isActor: true },
]

function FeedItem({ event }) {
  const respondToEvent = useEventStore((s) => s.respondToEvent)
  const Icon = ACTION_ICONS[event.action] || FileText
  const categoryColor = CATEGORY_COLORS[event.category] || 'var(--color-fg-muted)'
  const isPendingGate = event.status === 'pending'
  const isPendingAi = event.actor === 'ai' && !event.human_response

  const timeAgo = useMemo(() => {
    try {
      return formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })
    } catch {
      return 'just now'
    }
  }, [event.timestamp])

  const description = useMemo(() => {
    const entity = event.entity_title || event.entity_type || ''
    switch (event.action) {
      case 'create':
        return `Created ${event.entity_type || 'item'}: ${entity}`
      case 'update':
        return `Updated ${entity}`
      case 'delete':
        return `Deleted ${event.entity_type || 'item'}: ${entity}`
      case 'status_change':
        return `Changed status of ${entity}`
      case 'analyze':
        return event.entity_title || 'Analysis completed'
      case 'steer':
        return event.entity_title || 'Steering directive'
      case 'info':
        return event.entity_title || 'System info'
      default:
        return `${event.action} — ${entity}`
    }
  }, [event])

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      className={[
        'group flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-[var(--color-bg-glass)]',
        isPendingGate && 'border-l-2 border-l-amber-400/60 bg-amber-400/5',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Category-colored icon */}
      <div
        className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: `color-mix(in srgb, ${categoryColor} 12%, transparent)` }}
      >
        <Icon size={14} style={{ color: categoryColor }} />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p className="text-[13px] leading-snug text-[var(--color-fg-default)]">{description}</p>

        {event.reasoning && (
          <p className="mt-0.5 line-clamp-1 text-[11px] text-[var(--color-fg-subtle)]">
            {event.reasoning}
          </p>
        )}

        {/* Pending gate label */}
        {isPendingGate && (
          <div className="mt-1 flex items-center gap-1.5 text-[11px] font-medium text-amber-400">
            <Clock size={11} />
            <span>Awaiting Approval</span>
          </div>
        )}

        {/* Meta row */}
        <div className="mt-1 flex items-center gap-2">
          <ProvenanceBadge
            actor={event.actor}
            confidence={event.confidence}
            reasoning={event.reasoning}
            size="xs"
          />
          <span
            className="rounded-full px-1.5 py-px text-[9px] font-medium"
            style={{
              backgroundColor: `color-mix(in srgb, ${categoryColor} 10%, transparent)`,
              color: categoryColor,
            }}
          >
            {CATEGORY_LABELS[event.category] || event.category}
          </span>
          <span className="text-[10px] text-[var(--color-fg-faint)]">{timeAgo}</span>
        </div>

        {/* Approve/Reject for pending AI actions */}
        {isPendingAi && (
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => respondToEvent(event.id, 'approve')}
              className="flex items-center gap-1 rounded-md bg-[var(--color-success-subtle)] px-2 py-1 text-[11px] font-medium text-[var(--color-success)] transition-colors hover:brightness-110"
            >
              <Check size={10} /> Approve
            </button>
            <button
              onClick={() => respondToEvent(event.id, 'reject')}
              className="flex items-center gap-1 rounded-md bg-[var(--color-danger-subtle)] px-2 py-1 text-[11px] font-medium text-[var(--color-danger)] transition-colors hover:brightness-110"
            >
              <XCircle size={10} /> Reject
            </button>
          </div>
        )}

        {event.human_response && (
          <div className="mt-1 text-[10px] text-[var(--color-fg-subtle)]">
            {event.human_response.action === 'approve' ? 'Approved' : 'Rejected'}
            {event.human_response.comment && ` — ${event.human_response.comment}`}
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default function EventFeed() {
  const [activeFilter, setActiveFilter] = useState('all')
  const events = useEventStore(selectEvents)

  const filteredEvents = useMemo(() => {
    const filter = FILTERS.find((f) => f.key === activeFilter)
    if (!filter || activeFilter === 'all') return events.slice(0, 100)
    if (filter.isActor) return events.filter((e) => e.actor === activeFilter).slice(0, 100)
    return events.filter((e) => e.category === activeFilter).slice(0, 100)
  }, [events, activeFilter])

  return (
    <div className="glass-card flex flex-col overflow-hidden">
      {/* Header with filters */}
      <div className="flex items-center gap-3 border-b border-[var(--color-border-default)] px-4 py-3">
        <Zap size={14} style={{ color: 'var(--accent-active, #8b5cf6)' }} />
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-fg-muted)]">
          Activity Feed
        </h3>
        <span className="rounded-full bg-[var(--color-bg-glass)] px-2 py-0.5 text-[10px] text-[var(--color-fg-muted)]">
          {events.length}
        </span>

        <div className="flex-1" />

        {/* Filter chips */}
        <div className="flex items-center gap-1">
          <Filter size={11} className="mr-1 text-[var(--color-fg-faint)]" />
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={[
                'rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors',
                activeFilter === f.key
                  ? 'bg-[var(--color-accent-emphasis)] text-white'
                  : 'text-[var(--color-fg-muted)] hover:bg-[var(--color-bg-glass-hover)]',
              ].join(' ')}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Event list */}
      <div className="max-h-[520px] flex-1 overflow-y-auto py-1">
        {filteredEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
            <Zap size={28} className="mb-2 text-[var(--color-fg-faint)]" />
            <p className="text-sm font-medium text-[var(--color-fg-muted)]">No activity yet</p>
            <p className="mt-1 text-xs text-[var(--color-fg-subtle)]">
              Events will appear here as the AI agent works on your project
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {filteredEvents.map((event) => (
              <FeedItem key={event.id} event={event} />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
