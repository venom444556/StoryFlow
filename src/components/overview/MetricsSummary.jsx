import { useMemo } from 'react'
import { Bot, User, CheckCircle2, AlertTriangle, Gauge, ShieldAlert } from 'lucide-react'
import Sparkline from '../ui/Sparkline'
import { useEventStore, selectEvents } from '../../stores/eventStore'

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
  const events = useEventStore(selectEvents)

  const metrics = useMemo(() => {
    const aiEvents = events.filter((e) => e.actor === 'ai')
    const humanEvents = events.filter((e) => e.actor === 'human')

    const respondedAi = aiEvents.filter((e) => e.human_response)
    const rejected = respondedAi.filter((e) => e.human_response?.action === 'reject')
    const overrideRate =
      respondedAi.length > 0 ? Math.round((rejected.length / respondedAi.length) * 100) : 0

    const issues = project?.board?.issues || []
    const doneIssues = issues.filter((i) => i.status === 'Done')
    const inProgressIssues = issues.filter((i) => i.status === 'In Progress')
    const blockedIssues = issues.filter((i) => i.status === 'Blocked')
    const donePoints = doneIssues.reduce((s, i) => s + (i.storyPoints ?? 0), 0)

    const aiWithConfidence = aiEvents.filter(
      (e) => e.confidence !== null && e.confidence !== undefined
    )
    const avgConfidence =
      aiWithConfidence.length > 0
        ? Math.round(
            (aiWithConfidence.reduce((s, e) => s + e.confidence, 0) / aiWithConfidence.length) * 100
          )
        : null

    let confidenceColor = 'var(--color-fg-muted)'
    if (avgConfidence !== null) {
      if (avgConfidence >= 80) confidenceColor = 'var(--color-confidence-high)'
      else if (avgConfidence >= 50) confidenceColor = 'var(--color-confidence-medium)'
      else confidenceColor = 'var(--color-confidence-low)'
    }

    const completionPct =
      issues.length > 0 ? Math.round((doneIssues.length / issues.length) * 100) : 0

    return {
      aiActions: aiEvents.length,
      humanActions: humanEvents.length,
      overrideRate,
      issuesDone: doneIssues.length,
      issuesInProgress: inProgressIssues.length,
      issuesBlocked: blockedIssues.length,
      totalIssues: issues.length,
      velocity: donePoints,
      avgConfidence,
      confidenceColor,
      completionPct,
    }
  }, [events, project])

  return (
    <div className="space-y-6">
      {/* Hero stats — big, full-width, Neptune-style */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <HeroStat value={metrics.totalIssues} label="Total Issues" />
        <HeroStat
          value={`${metrics.completionPct}%`}
          label="Complete"
          color="var(--color-success)"
        />
        <HeroStat value={metrics.velocity} label="Points Done" color="var(--accent-cyan)" />
        <HeroStat value={metrics.issuesInProgress} label="In Progress" color="var(--color-info)" />
      </div>

      {/* Detail tiles — secondary metrics */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <MetricTile
          icon={Bot}
          label="AI Actions"
          value={metrics.aiActions}
          subtext="this session"
          color="var(--color-ai-accent)"
        />
        <MetricTile
          icon={User}
          label="Human Actions"
          value={metrics.humanActions}
          subtext="this session"
          color="var(--color-human-accent)"
        />
        <MetricTile
          icon={AlertTriangle}
          label="Override Rate"
          value={`${metrics.overrideRate}%`}
          subtext={`of ${metrics.aiActions} AI actions`}
          color="var(--color-warning, #eab308)"
        />
        <MetricTile
          icon={CheckCircle2}
          label="Done"
          value={metrics.issuesDone}
          subtext={`${metrics.issuesBlocked} blocked`}
          color="var(--color-success)"
        />
        {metrics.avgConfidence !== null && (
          <MetricTile
            icon={Gauge}
            label="AI Confidence"
            value={`${metrics.avgConfidence}%`}
            subtext={`across ${metrics.aiActions} actions`}
            color={metrics.confidenceColor}
          />
        )}
        {metrics.issuesBlocked > 0 && (
          <MetricTile
            icon={ShieldAlert}
            label="Blocked"
            value={metrics.issuesBlocked}
            subtext="need attention"
            color="var(--color-warning, #eab308)"
          />
        )}
      </div>
    </div>
  )
}
