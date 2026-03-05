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
import { useEventStore, selectEvents } from '../../stores/eventStore'

export function MetricTile({ icon: Icon, label, value, subtext, color }) {
  return (
    <div
      className="group flex items-start gap-3 rounded-xl bg-[var(--color-bg-glass)] p-3 transition-all hover:bg-[var(--color-bg-glass-hover)] hover:scale-[1.02]"
      style={{ transitionDuration: 'var(--duration-normal)' }}
    >
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-transform group-hover:scale-110"
        style={{
          backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)`,
          transitionDuration: 'var(--duration-normal)',
        }}
      >
        <Icon size={18} style={{ color }} />
      </div>
      <div>
        <p className="text-xl font-bold leading-none tracking-tight text-[var(--color-fg-default)]">
          {value}
        </p>
        <p className="mt-1 text-[11px] font-medium text-[var(--color-fg-muted)]">{label}</p>
        {subtext && <p className="text-[10px] text-[var(--color-fg-subtle)]">{subtext}</p>}
      </div>
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
    }
  }, [events, project])

  return (
    <GlassCard>
      <div className="mb-3 flex items-center gap-2">
        <Activity size={14} style={{ color: 'var(--accent-default)' }} />
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-fg-muted)]">
          Metrics
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
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
          label="Issues Done"
          value={metrics.issuesDone}
          subtext={`of ${metrics.totalIssues} total`}
          color="var(--color-success, #22c55e)"
        />
        <MetricTile
          icon={ShieldAlert}
          label="Blocked"
          value={metrics.issuesBlocked}
          subtext={metrics.issuesBlocked > 0 ? 'need attention' : 'none'}
          color="var(--color-warning, #eab308)"
        />
        <MetricTile
          icon={TrendingUp}
          label="Velocity"
          value={`${metrics.velocity} pts`}
          subtext={`of ${metrics.totalPoints} total`}
          color="var(--color-info, #3b82f6)"
        />
        {metrics.avgConfidence !== null && (
          <MetricTile
            icon={Gauge}
            label="Avg AI Confidence"
            value={`${metrics.avgConfidence}%`}
            subtext={`across ${metrics.aiActions} actions`}
            color={metrics.confidenceColor}
          />
        )}
      </div>
    </GlassCard>
  )
}
