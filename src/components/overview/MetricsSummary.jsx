import { useMemo } from 'react'
import {
  Bot,
  User,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Activity,
  Gauge,
  ShieldAlert,
} from 'lucide-react'
import GlassCard from '../ui/GlassCard'
import SectionHeader from '../ui/SectionHeader'
import Sparkline from '../ui/Sparkline'
import { useEventStore, selectEvents } from '../../stores/eventStore'

export function MetricTile({ icon: Icon, label, value, subtext, color, trend }) {
  return (
    <div
      className="group flex flex-col gap-1 rounded-xl bg-[var(--color-bg-glass)] p-3 transition-colors hover:bg-[var(--color-bg-glass-hover)]"
      style={{ transitionDuration: 'var(--duration-normal)' }}
      title={`${label}: ${value}${subtext ? ` — ${subtext}` : ''}`}
    >
      <div className="flex items-center justify-between">
        <div
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg"
          style={{
            backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)`,
          }}
        >
          <Icon size={12} style={{ color }} />
        </div>
        {trend && trend.length >= 2 && (
          <Sparkline data={trend} width={48} height={18} color={color} strokeWidth={1.5} />
        )}
      </div>
      <p className="text-xl font-bold leading-none tracking-tight text-[var(--color-fg-default)]">
        {value}
      </p>
      <p className="text-[11px] font-medium text-[var(--color-fg-muted)]">{label}</p>
      {subtext && <p className="text-[10px] text-[var(--color-fg-subtle)]">{subtext}</p>}
    </div>
  )
}

export default function MetricsSummary({ project }) {
  const events = useEventStore(selectEvents)

  const metrics = useMemo(() => {
    const aiEvents = events.filter((e) => e.actor === 'ai')
    const humanEvents = events.filter((e) => e.actor === 'human')

    // Human override rate: AI events that were rejected / total AI events with response
    const respondedAi = aiEvents.filter((e) => e.human_response)
    const rejected = respondedAi.filter((e) => e.human_response?.action === 'reject')
    const overrideRate =
      respondedAi.length > 0 ? Math.round((rejected.length / respondedAi.length) * 100) : 0

    // Issues stats from project data
    const issues = project?.board?.issues || []
    const doneIssues = issues.filter((i) => i.status === 'Done')
    const inProgressIssues = issues.filter((i) => i.status === 'In Progress')
    const blockedIssues = issues.filter((i) => i.status === 'Blocked')
    const totalPoints = issues.reduce((s, i) => s + (i.storyPoints ?? 0), 0)
    const donePoints = doneIssues.reduce((s, i) => s + (i.storyPoints ?? 0), 0)

    // Average AI confidence from events with confidence scores
    const aiWithConfidence = aiEvents.filter(
      (e) => e.confidence !== null && e.confidence !== undefined
    )
    const avgConfidence =
      aiWithConfidence.length > 0
        ? Math.round(
            (aiWithConfidence.reduce((s, e) => s + e.confidence, 0) / aiWithConfidence.length) * 100
          )
        : null

    // Determine confidence color
    let confidenceColor = 'var(--color-fg-muted)'
    if (avgConfidence !== null) {
      if (avgConfidence >= 80) confidenceColor = 'var(--color-confidence-high)'
      else if (avgConfidence >= 50) confidenceColor = 'var(--color-confidence-medium)'
      else confidenceColor = 'var(--color-confidence-low)'
    }

    // Completion percentage
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
      totalPoints,
      avgConfidence,
      confidenceColor,
      completionPct,
    }
  }, [events, project])

  return (
    <GlassCard>
      <SectionHeader icon={Activity} color="var(--accent-default)">
        Metrics
      </SectionHeader>

      {/* Hero stats row */}
      <div className="mb-3 grid grid-cols-3 gap-2">
        <div className="rounded-xl bg-[var(--color-bg-glass)] p-3 text-center">
          <p className="text-2xl font-black leading-none tracking-tight text-[var(--color-fg-default)]">
            {metrics.totalIssues}
          </p>
          <p className="mt-1 text-[10px] font-medium text-[var(--color-fg-muted)]">Total Issues</p>
        </div>
        <div className="rounded-xl bg-[var(--color-bg-glass)] p-3 text-center">
          <p className="text-2xl font-black leading-none tracking-tight text-[var(--color-success)]">
            {metrics.completionPct}%
          </p>
          <p className="mt-1 text-[10px] font-medium text-[var(--color-fg-muted)]">Complete</p>
        </div>
        <div className="rounded-xl bg-[var(--color-bg-glass)] p-3 text-center">
          <p className="text-2xl font-black leading-none tracking-tight text-[var(--color-info)]">
            {metrics.velocity}
          </p>
          <p className="mt-1 text-[10px] font-medium text-[var(--color-fg-muted)]">Points Done</p>
        </div>
      </div>

      {/* Detail tiles */}
      <div className="grid grid-cols-2 gap-2">
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
          label="In Progress"
          value={metrics.issuesInProgress}
          subtext={`${metrics.issuesBlocked} blocked`}
          color="var(--color-info, #3b82f6)"
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
    </GlassCard>
  )
}
