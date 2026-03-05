import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Bot,
  Plus,
  Pencil,
  Trash2,
  ArrowRight,
  Check,
  XCircle,
  FileText,
  Layers,
  Zap,
  Clock,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useEventStore, selectEvents, selectAiStatus } from '../../stores/eventStore'
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

const AI_STATUS_STYLES = {
  working: {
    dot: 'bg-[var(--color-ai-working)]',
    pulse: 'animate-pulse',
    label: 'Working',
  },
  idle: {
    dot: 'bg-[var(--color-ai-idle)]',
    pulse: '',
    label: 'Idle',
  },
  blocked: {
    dot: 'bg-[var(--color-ai-blocked)]',
    pulse: 'animate-pulse',
    label: 'Needs Input',
  },
}

function EventItem({ event }) {
  const respondToEvent = useEventStore((s) => s.respondToEvent)
  const Icon = ACTION_ICONS[event.action] || FileText
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
    const cat = CATEGORY_LABELS[event.category] || event.category
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
        return event.entity_title || `Analyzed ${cat}`
      case 'steer':
        return event.entity_title || 'Steering directive'
      case 'info':
        return event.entity_title || `${cat} update`
      default:
        return `${event.action} in ${cat}`
    }
  }, [event])

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      className={[
        'border-b border-[var(--color-border-default)] px-4 py-3 last:border-b-0',
        isPendingGate && 'border-l-2 border-l-amber-400/60 bg-amber-400/5',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="flex items-start gap-2.5">
        {/* Icon */}
        <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-bg-glass)]">
          <Icon size={12} className="text-[var(--color-fg-muted)]" />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <p className="text-[13px] leading-snug text-[var(--color-fg-default)]">{description}</p>

          {/* Reasoning preview */}
          {event.reasoning && (
            <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-[var(--color-fg-subtle)]">
              {event.reasoning}
            </p>
          )}

          {/* Pending gate label */}
          {isPendingGate && (
            <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-medium text-amber-400">
              <Clock size={11} />
              <span>Awaiting Approval</span>
            </div>
          )}

          {/* Meta row */}
          <div className="mt-1.5 flex items-center gap-2">
            <ProvenanceBadge
              actor={event.actor}
              confidence={event.confidence}
              reasoning={event.reasoning}
              size="xs"
            />
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

          {/* Show human response if already responded */}
          {event.human_response && (
            <div className="mt-1.5 text-[10px] text-[var(--color-fg-subtle)]">
              {event.human_response.action === 'approve' ? 'Approved' : 'Rejected'}
              {event.human_response.comment && ` — ${event.human_response.comment}`}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default function ActivitySidebar({ isOpen, onClose }) {
  const events = useEventStore(selectEvents)
  const aiStatus = useEventStore(selectAiStatus)
  const statusStyle = AI_STATUS_STYLES[aiStatus.status] || AI_STATUS_STYLES.idle

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[var(--z-drawer)] bg-[var(--color-bg-backdrop)]"
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 z-[var(--z-drawer)] flex h-full w-96 max-w-[85vw] flex-col border-l border-[var(--color-border-default)] bg-[var(--color-bg-base)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[var(--color-border-default)] px-4 py-3">
              <div className="flex items-center gap-3">
                <h2 className="text-sm font-semibold text-[var(--color-fg-default)]">Activity</h2>
                {/* AI Status indicator */}
                <div className="flex items-center gap-1.5">
                  <span
                    className={['h-2 w-2 rounded-full', statusStyle.dot, statusStyle.pulse].join(
                      ' '
                    )}
                  />
                  <span className="text-[11px] text-[var(--color-fg-muted)]">
                    AI: {statusStyle.label}
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-md p-1.5 text-[var(--color-fg-muted)] transition-colors hover:bg-[var(--color-bg-glass-hover)] hover:text-[var(--color-fg-default)]"
                aria-label="Close activity sidebar"
              >
                <X size={16} />
              </button>
            </div>

            {/* AI status detail */}
            {aiStatus.detail && (
              <div className="border-b border-[var(--color-border-default)] px-4 py-2">
                <p className="text-[12px] text-[var(--color-fg-muted)]">
                  <Bot size={12} className="mr-1.5 inline text-[var(--color-ai-accent)]" />
                  {aiStatus.detail}
                </p>
              </div>
            )}

            {/* Event list */}
            <div className="flex-1 overflow-y-auto">
              {events.length === 0 ? (
                <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                  <Zap size={32} className="mb-3 text-[var(--color-fg-faint)]" />
                  <p className="text-sm font-medium text-[var(--color-fg-muted)]">
                    No activity yet
                  </p>
                  <p className="mt-1 text-xs text-[var(--color-fg-subtle)]">
                    Events will appear here as actions happen
                  </p>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {events.map((event) => (
                    <EventItem key={event.id} event={event} />
                  ))}
                </AnimatePresence>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
