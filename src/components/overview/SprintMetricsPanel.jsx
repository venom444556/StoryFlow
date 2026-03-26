import { motion } from 'framer-motion'
import { BarChart3, Clock, Layers } from 'lucide-react'
import SectionHeader from '../ui/SectionHeader'

const STATUS_COLORS = {
  'To Do': 'var(--color-fg-muted, #6b7280)',
  'In Progress': 'var(--color-info, #3b82f6)',
  Blocked: 'var(--color-warning, #eab308)',
  Done: 'var(--color-success, #22c55e)',
}

function HorizontalBar({ label, value, max, color }) {
  const pct = max > 0 ? (value / max) * 100 : 0
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-[var(--color-fg-default)]" title={label}>
          {label}
        </span>
        <span className="text-xs font-semibold text-[var(--color-fg-default)]">{value} pts</span>
      </div>
      <div className="relative h-4 overflow-hidden rounded-md bg-[var(--color-bg-glass)]">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-md"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

function StatusDistribution({ byStatus = {} }) {
  const counts = {
    'To Do': byStatus['To Do'] || 0,
    'In Progress': byStatus['In Progress'] || 0,
    Blocked: byStatus.Blocked || 0,
    Done: byStatus.Done || 0,
  }
  const total = Object.values(counts).reduce((sum, count) => sum + count, 0)
  if (total === 0) return null

  return (
    <div>
      <p className="mb-2 text-xs font-bold text-[var(--color-fg-default)]">Status Distribution</p>
      <div className="flex h-6 overflow-hidden rounded-lg">
        {Object.entries(counts).map(([status, count]) => {
          if (count === 0) return null
          const pct = (count / total) * 100
          const displayPct = Math.max(pct, 3) // minimum 3% width so thin segments stay visible
          return (
            <motion.div
              key={status}
              className="flex items-center justify-center text-[13px] font-semibold text-white"
              style={{ backgroundColor: STATUS_COLORS[status] }}
              initial={{ width: 0 }}
              animate={{ width: `${displayPct}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              title={`${status}: ${count}`}
            >
              {pct >= 12 && count}
            </motion.div>
          )
        })}
      </div>
      <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5">
        {Object.entries(counts).map(
          ([status, count]) =>
            count > 0 && (
              <div
                key={status}
                className="flex items-center gap-1 text-[11px] text-[var(--color-fg-muted)]"
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: STATUS_COLORS[status] }}
                />
                {status} ({count})
              </div>
            )
        )}
      </div>
    </div>
  )
}

export default function SprintMetricsPanel({ analytics, embedded = false }) {
  if (!analytics) {
    return (
      <div
        className={[
          embedded
            ? 'flex flex-col opacity-60 pointer-events-none grayscale-[0.5]'
            : 'glass-card flex flex-col overflow-hidden opacity-60 pointer-events-none grayscale-[0.5]',
        ].join(' ')}
      >
        <div
          className={
            embedded ? 'px-5 py-4' : 'border-b border-[var(--color-border-default)] px-5 py-4'
          }
        >
          <SectionHeader icon={BarChart3} color="var(--color-info, #3b82f6)" className="mb-0">
            Sprint Metrics
          </SectionHeader>
        </div>
        <div className="flex h-40 flex-col items-center justify-center p-6 text-center">
          <Layers size={24} className="mb-2 text-[var(--color-fg-subtle)]" />
          <p className="text-sm font-medium text-[var(--color-fg-muted)]">Awaiting Analytics</p>
          <p className="mt-1 text-xs text-[var(--color-fg-subtle)]">
            Sprint cycle metrics are currently building.
          </p>
        </div>
      </div>
    )
  }

  const { byStatus = {}, velocity = null, cycleTime = null } = analytics

  const hasDistribution = Object.values(byStatus).some((count) => count > 0)
  const hasVelocity = Boolean(velocity)
  const hasCycleTime = Boolean(cycleTime)

  if (!hasDistribution && !hasVelocity && !hasCycleTime) return null

  return (
    <div className={embedded ? 'flex flex-col' : 'glass-card flex flex-col overflow-hidden'}>
      <div
        className={
          embedded ? 'px-5 py-4' : 'border-b border-[var(--color-border-default)] px-5 py-4'
        }
      >
        <SectionHeader icon={BarChart3} color="var(--color-info, #3b82f6)" className="mb-0">
          Sprint Metrics
        </SectionHeader>
      </div>

      <div className={embedded ? 'space-y-4 px-5 pb-5' : 'space-y-4 px-5 py-4'}>
        {/* Inline stats — compact, no cards */}
        {hasCycleTime && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Clock size={13} className="text-[var(--color-info)]" />
              <div>
                <span className="text-sm font-bold text-[var(--color-fg-default)]">
                  {cycleTime.averageDays < 1
                    ? `${Math.round(cycleTime.averageDays * 24)} hour${Math.round(cycleTime.averageDays * 24) === 1 ? '' : 's'}`
                    : `${cycleTime.averageDays.toFixed(1)} day${cycleTime.averageDays.toFixed(1) === '1.0' ? '' : 's'}`}
                </span>
                <span className="ml-1.5 text-[11px] text-[var(--color-fg-muted)]">cycle time</span>
                <span className="ml-1 text-[10px] text-[var(--color-fg-subtle)]">
                  ({cycleTime.sampleSize} issues)
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Status distribution */}
        {hasDistribution && <StatusDistribution byStatus={byStatus} />}

        {/* Sprint velocity bars */}
        {hasVelocity && (
          <div>
            <p className="mb-2 text-xs font-bold text-[var(--color-fg-default)]">Sprint Velocity</p>
            <div className="space-y-1.5">
              <HorizontalBar
                label={velocity.sprintName || 'Active Sprint'}
                value={velocity.completedPoints || 0}
                max={Math.max(velocity.totalPoints || 0, 1)}
                color="var(--accent-default)"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
