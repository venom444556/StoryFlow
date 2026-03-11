import { useMemo } from 'react'
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

function StatusDistribution({ issues }) {
  const total = issues.length
  if (total === 0) return null

  const counts = { 'To Do': 0, 'In Progress': 0, Blocked: 0, Done: 0 }
  for (const issue of issues) {
    if (counts[issue.status] !== undefined) counts[issue.status]++
  }

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

export default function SprintMetricsPanel({ project }) {
  const metrics = useMemo(() => {
    const issues = project?.board?.issues || []
    const sprints = project?.board?.sprints || []

    // Velocity per sprint: sum of done story points per sprint
    const sprintVelocity = sprints
      .map((sprint) => {
        const sprintIssues = issues.filter((i) => i.sprintId === sprint.id && i.status === 'Done')
        const points = sprintIssues.reduce((sum, i) => sum + (i.storyPoints ?? 0), 0)
        return { name: sprint.name, points }
      })
      .filter((s) => s.points > 0)

    const maxVelocity = Math.max(...sprintVelocity.map((s) => s.points), 1)

    // Cycle time: avg days from inProgressAt → doneAt for Done issues
    const doneTimes = issues
      .filter((i) => i.status === 'Done' && i.inProgressAt && i.doneAt)
      .map((i) => new Date(i.doneAt).getTime() - new Date(i.inProgressAt).getTime())
      .filter((t) => t > 0)

    const avgCycleTimeMs =
      doneTimes.length > 0 ? doneTimes.reduce((s, t) => s + t, 0) / doneTimes.length : 0
    const avgCycleTimeDays = avgCycleTimeMs / (1000 * 60 * 60 * 24)

    // Blocked time: avg time issues spent in Blocked
    const blockedTimes = issues
      .filter((i) => i.blockedAt && (i.inProgressAt || i.doneAt || i.updatedAt))
      .map((i) => {
        // Use the next status transition after blockedAt as the end time
        const blockedStart = new Date(i.blockedAt).getTime()
        // If the issue is no longer blocked, use updatedAt as proxy
        const end = i.status !== 'Blocked' ? new Date(i.updatedAt).getTime() : Date.now()
        return end - blockedStart
      })
      .filter((t) => t > 0)

    const avgBlockedTimeMs =
      blockedTimes.length > 0 ? blockedTimes.reduce((s, t) => s + t, 0) / blockedTimes.length : 0
    const avgBlockedTimeHours = avgBlockedTimeMs / (1000 * 60 * 60)

    return {
      issues,
      sprintVelocity,
      maxVelocity,
      avgCycleTimeDays,
      avgBlockedTimeHours,
      cycleTimeSamples: doneTimes.length,
      blockedSamples: blockedTimes.length,
    }
  }, [project])

  const {
    issues,
    sprintVelocity,
    maxVelocity,
    avgCycleTimeDays,
    avgBlockedTimeHours,
    cycleTimeSamples,
    blockedSamples,
  } = metrics

  if (issues.length === 0) return null

  return (
    <div className="glass-card flex flex-col overflow-hidden">
      <div className="border-b border-[var(--color-border-default)] px-5 py-4">
        <SectionHeader icon={BarChart3} color="var(--color-info, #3b82f6)" className="mb-0">
          Sprint Metrics
        </SectionHeader>
      </div>

      <div className="space-y-4 px-5 py-4">
        {/* Inline stats — compact, no cards */}
        {(cycleTimeSamples > 0 || blockedSamples > 0) && (
          <div className="flex items-center gap-4">
            {cycleTimeSamples > 0 && (
              <div className="flex items-center gap-2">
                <Clock size={13} className="text-[var(--color-info)]" />
                <div>
                  <span className="text-sm font-bold text-[var(--color-fg-default)]">
                    {avgCycleTimeDays < 1
                      ? `${Math.round(avgCycleTimeDays * 24)} hour${Math.round(avgCycleTimeDays * 24) === 1 ? '' : 's'}`
                      : `${avgCycleTimeDays.toFixed(1)} day${avgCycleTimeDays.toFixed(1) === '1.0' ? '' : 's'}`}
                  </span>
                  <span className="ml-1.5 text-[11px] text-[var(--color-fg-muted)]">
                    cycle time
                  </span>
                </div>
              </div>
            )}
            {blockedSamples > 0 && (
              <div className="flex items-center gap-2">
                <Layers size={13} className="text-[var(--color-warning)]" />
                <div>
                  <span className="text-sm font-bold text-[var(--color-fg-default)]">
                    {avgBlockedTimeHours < 24
                      ? `${Math.round(avgBlockedTimeHours)} hour${Math.round(avgBlockedTimeHours) === 1 ? '' : 's'}`
                      : `${(avgBlockedTimeHours / 24).toFixed(1)} day${(avgBlockedTimeHours / 24).toFixed(1) === '1.0' ? '' : 's'}`}
                  </span>
                  <span className="ml-1.5 text-[11px] text-[var(--color-fg-muted)]">
                    blocked avg
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Status distribution */}
        <StatusDistribution issues={issues} />

        {/* Sprint velocity bars */}
        {sprintVelocity.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-bold text-[var(--color-fg-default)]">Sprint Velocity</p>
            <div className="space-y-1.5">
              {sprintVelocity.map((sprint) => (
                <HorizontalBar
                  key={sprint.name}
                  label={sprint.name}
                  value={sprint.points}
                  max={maxVelocity}
                  color="var(--accent-default)"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
