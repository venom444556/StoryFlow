import AgentCommandCenter from '../overview/AgentCommandCenter'
import GatePanel from '../overview/GatePanel'
import EventFeed from '../overview/EventFeed'
import MetricsSummary from '../overview/MetricsSummary'
import SprintMetricsPanel from '../overview/SprintMetricsPanel'
import SessionHistory from '../overview/SessionHistory'
import { formatRelative } from '../../utils/dates'
import { useEventStore, selectGateCount, selectEvents } from '../../stores/eventStore'
import { useState, useEffect } from 'react'

function CommandMetric({ label, value, accentClass = 'text-[var(--color-fg-default)]', title }) {
  return (
    <div className="glass-card flex min-h-[6.25rem] flex-col justify-between rounded-xl px-4 py-4">
      <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--color-fg-faint)]">
        {label}
      </span>
      <span className={`text-lg font-semibold leading-relaxed ${accentClass}`} title={title}>
        {value}
      </span>
    </div>
  )
}

export default function OverviewTab({ project }) {
  const [opData, setOpData] = useState(null)
  const [analyticsData, setAnalyticsData] = useState(null)

  useEffect(() => {
    let mounted = true
    if (!project?.id) return
    Promise.all([
      fetch(`/api/projects/${encodeURIComponent(project.id)}/operational`)
        .then((res) => (res.ok ? res.json() : null))
        .catch(() => null),
      fetch(`/api/projects/${encodeURIComponent(project.id)}/analytics`)
        .then((res) => (res.ok ? res.json() : null))
        .catch(() => null),
    ]).then(([op, analytics]) => {
      if (!mounted) return
      if (op) setOpData(op)
      if (analytics) setAnalyticsData(analytics)
    })
    return () => {
      mounted = false
    }
  }, [project?.id])

  // Live enhancement: the websocket event store
  const liveGateCount = useEventStore(selectGateCount)
  const events = useEventStore(selectEvents)

  if (!project) return null

  // Baseline truth: the API endpoint contract
  const op = opData || {}

  const lastAiEvent = events?.find((e) => e.actor === 'ai')

  // Contract: activeBlockers is a list (never use aiStatus === 'blocked' to compute this count)
  const activeBlockersCount = Array.isArray(op.activeBlockers)
    ? op.activeBlockers.length
    : undefined
  const blockersStr =
    activeBlockersCount !== undefined
      ? `${activeBlockersCount} active`
      : 'Blocker summary unavailable'

  // Contract: pendingGatesCount is a number
  const pendingGatesCount = liveGateCount ?? op.pendingGatesCount
  const pendingGatesStr =
    pendingGatesCount !== undefined ? `${pendingGatesCount} pending` : 'No live gate data'
  const directivesCount = op.directivesCount ?? 0
  const directivesStr = `${directivesCount} open`

  // Contract: lastAgentActivity is an object
  // Enhancement: prefer the most recent AI-authored event from the live store if available
  let latestActivityTimestamp = op.lastAgentActivity?.timestamp
  let latestActivityTitle = null

  if (lastAiEvent?.timestamp) {
    latestActivityTimestamp = lastAiEvent.timestamp
    latestActivityTitle = lastAiEvent.entity_title || lastAiEvent.action
  }

  const lastActivityStr = latestActivityTimestamp
    ? formatRelative(latestActivityTimestamp)
    : 'Last activity unavailable'

  return (
    <div className="space-y-6 pb-8">
      {/* 1. PROJECT-SCOPED OPERATIONS */}
      <div className="surface-critical animate-entrance stagger-1 flex flex-col gap-5 p-5">
        <div className="flex items-center justify-between border-b border-[var(--color-border-muted)] pb-4">
          <h2 className="text-xl font-semibold text-[var(--color-fg-default)]">
            Project Operations
          </h2>
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-fg-faint)]">
            Current Flow
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <CommandMetric
            label="Open Directives"
            value={directivesStr}
            accentClass={
              directivesCount > 0
                ? 'font-semibold text-[var(--color-info)]'
                : 'italic text-[var(--color-fg-muted)]'
            }
          />
          <CommandMetric
            label="Pending Gates"
            value={pendingGatesStr}
            accentClass={
              pendingGatesCount > 0
                ? 'font-semibold text-[var(--color-gate-pending)]'
                : 'italic text-[var(--color-fg-muted)]'
            }
          />
          <CommandMetric
            label="Active Blockers"
            value={blockersStr}
            accentClass={
              activeBlockersCount > 0
                ? 'font-semibold text-[var(--color-danger)]'
                : 'italic text-[var(--color-fg-muted)]'
            }
          />
          <CommandMetric
            label="Last Activity"
            value={
              latestActivityTitle ? `${latestActivityTitle} (${lastActivityStr})` : lastActivityStr
            }
            accentClass="line-clamp-2 text-[var(--color-fg-subtle)]"
            title={latestActivityTitle || lastActivityStr}
          />
        </div>
      </div>

      <div className="animate-entrance stagger-2">
        <AgentCommandCenter projectId={project.id} />
      </div>

      <div className="animate-entrance stagger-3">
        <GatePanel projectId={project.id} />
      </div>

      {/* 3. OVERVIEW WORKSPACE */}
      <div
        className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.95fr)]"
        style={{
          marginBottom: 'calc(var(--steering-bar-clearance, 0px) + var(--space-2))',
        }}
      >
        <div
          className="min-w-0 overflow-hidden rounded-xl"
          style={{ height: 'min(calc(100vh - 22rem), 800px)' }}
        >
          <EventFeed projectId={project.id} />
        </div>

        <div
          className="flex min-w-0 flex-col gap-6"
          style={{ height: 'min(calc(100vh - 22rem), 800px)' }}
        >
          <SessionHistory projectId={project.id} className="min-h-0 flex-1" />
          <SprintMetricsPanel analytics={analyticsData} />
          <MetricsSummary analytics={analyticsData} />
        </div>
      </div>
    </div>
  )
}
