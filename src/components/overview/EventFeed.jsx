import { useState, useMemo, useEffect } from 'react'
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
import AIBadge from '../ui/AIBadge'
import SectionHeader from '../ui/SectionHeader'

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
  project: 'var(--accent-default)',
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
  const Icon = ACTION_ICONS[event.action] || FileText
  const categoryColor = CATEGORY_COLORS[event.category] || 'var(--color-fg-muted)'
  const isPendingGate = event.status === 'pending'

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
        'rounded-xl px-3 py-3 transition-colors hover:bg-[var(--color-bg-glass)]',
        isPendingGate ? 'bg-amber-400/5' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="flex items-start gap-3">
        {/* Dot indicator with color coding — matches SessionHistory */}
        <div className="mt-2 flex flex-col items-center gap-1">
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: categoryColor }}
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-medium leading-snug text-[var(--color-fg-default)]">
            {description}
          </p>

          {/* Reasoning — always visible, gives each item substance */}
          {event.reasoning && (
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[var(--color-fg-muted)]">
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

          {/* Stat chips — matches SessionHistory */}
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <AIBadge source={event.actor === 'ai' ? 'ai' : 'human'} />
            <span className="flex items-center gap-1 rounded-full bg-[var(--color-info)]/10 px-2 py-0.5 text-[10px] font-medium text-[var(--color-info)]">
              <Icon size={9} /> {CATEGORY_LABELS[event.category] || event.category}
            </span>
            <span className="text-[10px] text-[var(--color-fg-faint)]">{timeAgo}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function EventFeed({ className = '', projectId = null }) {
  const [activeFilter, setActiveFilter] = useState('all')
  const liveEvents = useEventStore(selectEvents)
  const [baselineEvents, setBaselineEvents] = useState([])

  useEffect(() => {
    if (!projectId) return
    let cancelled = false
    fetch(`/api/projects/${encodeURIComponent(projectId)}/events?limit=100`)
      .then((res) => (res.ok ? res.json() : []))
      .then((events) => {
        if (!cancelled) setBaselineEvents(Array.isArray(events) ? events : [])
      })
      .catch(() => {
        if (!cancelled) setBaselineEvents([])
      })
    return () => {
      cancelled = true
    }
  }, [projectId])

  const events = useMemo(() => {
    const merged = [...liveEvents]
    const seen = new Set(liveEvents.map((event) => event.id))
    for (const event of baselineEvents) {
      if (!seen.has(event.id)) merged.push(event)
    }
    return merged.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  }, [liveEvents, baselineEvents])

  const filteredEvents = useMemo(() => {
    const filter = FILTERS.find((f) => f.key === activeFilter)
    if (!filter || activeFilter === 'all') return events.slice(0, 100)
    if (filter.isActor) return events.filter((e) => e.actor === activeFilter).slice(0, 100)
    return events.filter((e) => e.category === activeFilter).slice(0, 100)
  }, [events, activeFilter])

  return (
    <div className={`glass-card flex flex-col overflow-hidden h-full ${className}`}>
      {/* Header with filters */}
      <div className="border-b border-[var(--color-border-default)] px-5 py-4 shrink-0">
        <SectionHeader
          icon={Zap}
          color="var(--accent-default)"
          count={events.length}
          live={events.length > 0}
          className="mb-0"
          action={
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
          }
        >
          Activity Feed
        </SectionHeader>
      </div>

      {/* Event list */}
      <div className="flex-1 overflow-y-auto py-2">
        {filteredEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 text-center h-full gap-1">
            <Zap size={28} className="mb-2 text-[var(--color-fg-faint)]" />
            <p className="text-sm font-medium text-[var(--color-fg-muted)]">No recent activity</p>
            <p className="mt-1 text-xs text-[var(--color-fg-subtle)]">
              {activeFilter === 'all'
                ? 'Recent events will appear here as the agent works on your project. Historical events must be loaded manually.'
                : 'Try changing your filter.'}
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
