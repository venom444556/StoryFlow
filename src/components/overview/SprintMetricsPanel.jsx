import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, Clock, Layers } from 'lucide-react'
import GlassCard from '../ui/GlassCard'
import SectionHeader from '../ui/SectionHeader'
import { MetricTile } from './MetricsSummary'

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
        <span className="text-[11px] text-[var(--color-fg-muted)]" title={label}>
          {label}
        </span>
        <span className="text-[11px] font-medium text-[var(--color-fg-default)]">{value} pts</span>
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
      <p className="mb-2 text-[11px] font-medium text-[var(--color-fg-muted)]">
        Status Distribution
      </p>
      <div className="flex h-6 overflow-hidden rounded-lg">
        {Object.entries(counts).map(([status, count]) => {
          if (count === 0) return null
          const pct = (count / total) * 100
          const displayPct = Math.max(pct, 3) // minimum 3% width so thin segments stay visible
          return (
            <motion.div
              key={status}
              className="flex items-center justify-center text-[9px] font-medium text-white/90"
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
                className="flex items-center gap-1 text-[10px] text-[var(--color-fg-subtle)]"
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
    <GlassCard>
      <SectionHeader icon={BarChart3} color="var(--color-info, #3b82f6)">
        Sprint Metrics
      </SectionHeader>

      <div className="space-y-5">
        {/* Cycle time + blocked time tiles */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {cycleTimeSamples > 0 && (
            <MetricTile
              icon={Clock}
              label="Avg Cycle Time"
              value={
                avgCycleTimeDays < 1
                  ? `${Math.round(avgCycleTimeDays * 24)}h`
                  : `${avgCycleTimeDays.toFixed(1)}d`
              }
              subtext={`across ${cycleTimeSamples} issues`}
              color="var(--color-info, #3b82f6)"
            />
          )}
          {blockedSamples > 0 && (
            <MetricTile
              icon={Layers}
              label="Avg Blocked Time"
              value={
                avgBlockedTimeHours < 24
                  ? `${Math.round(avgBlockedTimeHours)}h`
                  : `${(avgBlockedTimeHours / 24).toFixed(1)}d`
              }
              subtext={`across ${blockedSamples} issues`}
              color="var(--color-warning, #eab308)"
            />
          )}
        </div>

        {/* Status distribution */}
        <StatusDistribution issues={issues} />

        {/* Sprint velocity bars */}
        {sprintVelocity.length > 0 && (
          <div>
            <p className="mb-2 text-[11px] font-medium text-[var(--color-fg-muted)]">
              Sprint Velocity
            </p>
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
    </GlassCard>
  )
}
