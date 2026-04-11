import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, RefreshCw, AlertTriangle, GitCommit, Circle } from 'lucide-react'
import PhaseCard from './PhaseCard'
import MilestoneMarker from './MilestoneMarker'
import EmptyState from '../ui/EmptyState'
import {
  isCodeIntelEvent,
  renderMeta,
} from '../../features/code-intelligence/integrations/timelineEvents'

// Map icon name strings from renderMeta() to lucide-react components.
const CODE_INTEL_ICONS = {
  RefreshCw,
  AlertTriangle,
  GitCommit,
  Circle,
}

function CodeIntelEventRow({ event }) {
  const meta = renderMeta(event)
  const Icon = CODE_INTEL_ICONS[meta.icon] || Circle
  let detail = ''
  if (event.type === 'code-intel-index-refreshed') {
    detail = `${event.symbolCount} symbols, ${event.clusterCount} clusters @ ${String(event.headSha || '').slice(0, 7)}`
  } else if (event.type === 'code-intel-blast-radius-warning') {
    detail = `${event.issueKey}: ${event.callsites} callsites across ${event.affectedClusters?.length || 0} clusters`
  } else if (event.type === 'code-intel-change-detected') {
    detail = `${event.changedFileCount} files changed — ${event.recommendation}`
  }
  return (
    <div className="relative flex items-start gap-3 pl-6 py-3">
      <div
        className="absolute left-[2px] top-4 flex h-3 w-3 items-center justify-center rounded-full border-2 border-[var(--color-bg-default)]"
        style={{ backgroundColor: meta.color }}
      />
      <div className="shrink-0 pt-0.5" style={{ color: meta.color }}>
        <Icon size={14} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-medium text-[var(--color-fg-default)]">{meta.label}</div>
        {detail && <div className="text-xs text-[var(--color-fg-muted)] mt-0.5">{detail}</div>}
        {event.at && (
          <div className="text-[10px] text-[var(--color-fg-subtle)] mt-0.5">{event.at}</div>
        )}
      </div>
    </div>
  )
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
  },
}

export default function TimelineView({
  phases = [],
  milestones = [],
  events = [],
  onEditPhase,
  onDeletePhase,
  onOpenHotWash,
  onEditMilestone,
  onDeleteMilestone,
  onToggleMilestone,
  onGenerateHotWash,
  onFinalizeHotWash,
  projectId,
}) {
  // Build a combined timeline of phases + milestones + code-intel events
  const items = useMemo(() => {
    const list = []

    for (const phase of phases) {
      list.push({
        type: 'phase',
        sortDate: phase.startDate || '9999-99-99',
        data: phase,
      })
    }

    for (const milestone of milestones) {
      list.push({
        type: 'milestone',
        sortDate: milestone.date || '9999-99-99',
        data: milestone,
      })
    }

    for (const ev of events) {
      if (isCodeIntelEvent(ev)) {
        list.push({
          type: 'code-intel-event',
          sortDate: ev.at || '9999-99-99',
          data: ev,
        })
      }
    }

    list.sort((a, b) => a.sortDate.localeCompare(b.sortDate))
    return list
  }, [phases, milestones, events])

  if (items.length === 0) {
    return (
      <EmptyState
        icon={Clock}
        title="No phases or milestones yet"
        description="Add your first phase or milestone to start tracking progress on your project timeline."
      />
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="relative pl-1"
    >
      {/* Spine behind individual segments */}
      {items.length > 1 && (
        <div className="absolute left-[7px] top-0 bottom-0 w-px bg-[var(--color-border-default)]" />
      )}
      <AnimatePresence mode="popLayout">
        {items.map((item, index) => {
          const key =
            item.type === 'code-intel-event'
              ? `${item.type}-${item.data.type}-${item.data.at}-${index}`
              : `${item.type}-${item.data.id}`
          return (
            <motion.div key={key} variants={itemVariants} layout>
              {item.type === 'phase' && (
                <PhaseCard
                  phase={item.data}
                  onEdit={onEditPhase}
                  onDelete={onDeletePhase}
                  onOpenHotWash={onOpenHotWash}
                  onGenerateHotWash={onGenerateHotWash}
                  onFinalizeHotWash={onFinalizeHotWash}
                  projectId={projectId}
                  isLast={index === items.length - 1}
                />
              )}
              {item.type === 'milestone' && (
                <MilestoneMarker
                  milestone={item.data}
                  onEdit={onEditMilestone}
                  onDelete={onDeleteMilestone}
                  onToggle={onToggleMilestone}
                  isLast={index === items.length - 1}
                />
              )}
              {item.type === 'code-intel-event' && <CodeIntelEventRow event={item.data} />}
            </motion.div>
          )
        })}
      </AnimatePresence>
    </motion.div>
  )
}
