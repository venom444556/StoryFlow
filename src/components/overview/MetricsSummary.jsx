import { useMemo } from 'react'
import Sparkline from '../ui/Sparkline'

export function MetricTile({ icon: Icon, label, value, subtext, color, trend }) {
  return (
    <div
      className="group relative flex flex-col gap-2 overflow-hidden rounded-2xl p-5 transition-all hover:scale-[1.02]"
      style={{
        background: 'var(--color-bg-glass)',
        border: '1px solid var(--color-border-default)',
        transitionDuration: 'var(--duration-normal)',
      }}
      title={`${label}: ${value}${subtext ? ` — ${subtext}` : ''}`}
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: `linear-gradient(to right, transparent, ${color}, transparent)`,
          opacity: 0.4,
        }}
      />

      <div className="flex items-center justify-between">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
          style={{
            backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)`,
          }}
        >
          <Icon size={16} style={{ color }} />
        </div>
        {trend && trend.length >= 2 && (
          <Sparkline data={trend} width={56} height={22} color={color} strokeWidth={1.5} />
        )}
      </div>
      <p className="text-3xl font-bold leading-none tracking-tight text-[var(--color-fg-default)]">
        {value}
      </p>
      <div>
        <p className="text-xs font-medium text-[var(--color-fg-muted)]">{label}</p>
        {subtext && <p className="mt-0.5 text-[11px] text-[var(--color-fg-subtle)]">{subtext}</p>}
      </div>
    </div>
  )
}

function HeroStat({ value, label, color }) {
  return (
    <div
      className="relative flex flex-col items-center justify-center overflow-hidden rounded-2xl px-6 py-8"
      style={{
        background: 'var(--color-bg-glass)',
        border: '1px solid var(--color-border-default)',
      }}
    >
      {/* Glow behind the number */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          background: `radial-gradient(circle at 50% 60%, ${color || 'var(--accent-default)'}, transparent 70%)`,
        }}
      />
      <p
        className="relative text-5xl font-bold leading-none tracking-tight"
        style={{ color: color || 'var(--color-fg-default)' }}
      >
        {value}
      </p>
      <p className="relative mt-3 text-sm font-medium text-[var(--color-fg-muted)]">{label}</p>
    </div>
  )
}

export default function MetricsSummary({ project }) {
  const metrics = useMemo(() => {
    const issues = project?.board?.issues || []
    const doneIssues = issues.filter((i) => i.status === 'Done')
    const inProgressIssues = issues.filter((i) => i.status === 'In Progress')
    const donePoints = doneIssues.reduce((s, i) => s + (i.storyPoints ?? 0), 0)
    const completionPct =
      issues.length > 0 ? Math.round((doneIssues.length / issues.length) * 100) : 0

    return {
      totalIssues: issues.length,
      issuesInProgress: inProgressIssues.length,
      velocity: donePoints,
      completionPct,
    }
  }, [project])

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <HeroStat value={metrics.totalIssues} label="Total Issues" />
      <HeroStat value={`${metrics.completionPct}%`} label="Complete" color="var(--color-success)" />
      <HeroStat value={metrics.velocity} label="Points Done" color="var(--accent-cyan)" />
      <HeroStat value={metrics.issuesInProgress} label="In Progress" color="var(--color-info)" />
    </div>
  )
}
