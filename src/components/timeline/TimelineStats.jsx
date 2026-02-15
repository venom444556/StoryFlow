import React, { useMemo } from 'react'
import { TrendingUp, Layers, Flag, Calendar } from 'lucide-react'
import { differenceInDays, parseISO } from 'date-fns'
import GlassCard from '../ui/GlassCard'

function StatCard({ icon: Icon, value, label, color }) {
  return (
    <GlassCard padding="sm">
      <div className="flex items-center gap-3">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${color}18` }}
        >
          <Icon size={18} style={{ color }} />
        </div>
        <div className="min-w-0">
          <div className="text-lg font-bold text-[var(--color-fg-default)] leading-tight">{value}</div>
          <div className="text-[11px] text-[var(--color-fg-muted)] truncate">{label}</div>
        </div>
      </div>
    </GlassCard>
  )
}

export default function TimelineStats({ phases = [], milestones = [] }) {
  const stats = useMemo(() => {
    // Overall progress
    const progress =
      phases.length > 0
        ? Math.round(
            phases.reduce((sum, p) => sum + (p.progress || 0), 0) / phases.length
          )
        : 0

    // Milestone counts
    const completedMilestones = milestones.filter((m) => m.completed).length

    // Days remaining until latest endDate
    let daysRemaining = null
    const today = new Date()
    for (const phase of phases) {
      if (phase.endDate) {
        const end = parseISO(phase.endDate)
        const diff = differenceInDays(end, today)
        if (daysRemaining === null || diff > daysRemaining) {
          daysRemaining = diff
        }
      }
    }

    return { progress, completedMilestones, daysRemaining }
  }, [phases, milestones])

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatCard
        icon={TrendingUp}
        value={`${stats.progress}%`}
        label="Overall Progress"
        color="#6366f1"
      />
      <StatCard
        icon={Layers}
        value={phases.length}
        label={phases.length === 1 ? 'Phase' : 'Phases'}
        color="#3b82f6"
      />
      <StatCard
        icon={Flag}
        value={`${stats.completedMilestones}/${milestones.length}`}
        label="Milestones Done"
        color="#10b981"
      />
      <StatCard
        icon={Calendar}
        value={stats.daysRemaining !== null ? stats.daysRemaining : '—'}
        label={stats.daysRemaining !== null && stats.daysRemaining >= 0 ? 'Days Remaining' : stats.daysRemaining !== null ? 'Days Overdue' : 'No End Date'}
        color={stats.daysRemaining !== null && stats.daysRemaining < 0 ? '#ef4444' : '#f59e0b'}
      />
    </div>
  )
}
