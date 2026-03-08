import { useMemo } from 'react'
import { Clock, Flag, Bot } from 'lucide-react'
import { differenceInDays, parseISO } from 'date-fns'
import GlassCard from '../ui/GlassCard'

export default function TimelineStats({ phases = [], milestones = [] }) {
  const stats = useMemo(() => {
    // Days elapsed since earliest startDate
    let daysElapsed = 0
    const today = new Date()
    let earliest = null
    for (const phase of phases) {
      if (phase.startDate) {
        const start = parseISO(phase.startDate)
        if (!earliest || start < earliest) earliest = start
      }
    }
    if (earliest) {
      daysElapsed = Math.max(0, differenceInDays(today, earliest))
    }

    // Milestone counts
    const completedMilestones = milestones.filter((m) => m.completed).length

    // Active phases (in progress)
    const activePhases = phases.filter(
      (p) => (p.progress || 0) > 0 && (p.progress || 0) < 100
    ).length

    return { daysElapsed, completedMilestones, activePhases }
  }, [phases, milestones])

  return (
    <GlassCard padding="sm">
      <div className="flex items-center justify-around divide-x divide-[var(--color-border-default)]">
        {/* Days elapsed */}
        <div className="flex items-center gap-2 px-4">
          <Clock size={14} className="text-[var(--color-fg-muted)]" />
          <div>
            <span className="text-sm font-bold text-[var(--color-fg-default)]">
              {stats.daysElapsed}
            </span>
            <span className="ml-1 text-xs text-[var(--color-fg-muted)]">days elapsed</span>
          </div>
        </div>

        {/* Milestones */}
        <div className="flex items-center gap-2 px-4">
          <Flag size={14} className="text-[var(--color-success)]" />
          <div>
            <span className="text-sm font-bold text-[var(--color-fg-default)]">
              {stats.completedMilestones}/{milestones.length}
            </span>
            <span className="ml-1 text-xs text-[var(--color-fg-muted)]">milestones</span>
          </div>
        </div>

        {/* Active phases */}
        <div className="flex items-center gap-2 px-4">
          <Bot size={14} className="text-[var(--color-info)]" />
          <div>
            <span className="text-sm font-bold text-[var(--color-fg-default)]">
              {stats.activePhases}
            </span>
            <span className="ml-1 text-xs text-[var(--color-fg-muted)]">active phases</span>
          </div>
        </div>
      </div>
    </GlassCard>
  )
}
