import AIStatusCard from '../overview/AIStatusCard'
import GatePanel from '../overview/GatePanel'
import EventFeed from '../overview/EventFeed'
import MetricsSummary from '../overview/MetricsSummary'
import SprintMetricsPanel from '../overview/SprintMetricsPanel'
import SessionHistory from '../overview/SessionHistory'
import { formatRelative } from '../../utils/dates'
import {
  useEventStore,
  selectAiStatus,
  selectPendingGates,
  selectEvents,
} from '../../stores/eventStore'
import { useState, useEffect } from 'react'

export default function OverviewTab({ project }) {
  const [opData, setOpData] = useState(null)

  useEffect(() => {
    let mounted = true
    if (!project?.id) return
    fetch(`/api/projects/${encodeURIComponent(project.id)}/operational`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (mounted && data) setOpData(data)
      })
      .catch(() => {})
    return () => {
      mounted = false
    }
  }, [project?.id])

  // Live enhancement: the websocket event store
  const aiStatus = useEventStore(selectAiStatus)
  const pendingGates = useEventStore(selectPendingGates)
  const events = useEventStore(selectEvents)

  if (!project) return null

  // Baseline truth: the API endpoint contract
  const op = opData || {}

  const lastAiEvent = events?.find((e) => e.actor === 'ai')

  // Contract: agentState is an object
  const statusObj = op.agentState || {}
  // Enhancement: reflect live transient "working" state if applicable, else rely on contract
  const agentStateStr =
    aiStatus?.status && aiStatus.status !== 'idle'
      ? aiStatus.status
      : statusObj.status || 'unavailable'

  // Contract: activeBlockers is a list (never use aiStatus === 'blocked' to compute this count)
  const activeBlockersCount = Array.isArray(op.activeBlockers)
    ? op.activeBlockers.length
    : undefined
  const blockersStr =
    activeBlockersCount !== undefined
      ? `${activeBlockersCount} active`
      : 'Blocker summary unavailable'

  // Contract: pendingGatesCount is a number
  const pendingGatesCount = pendingGates?.length ?? op.pendingGatesCount
  const pendingGatesStr =
    pendingGatesCount !== undefined ? `${pendingGatesCount} pending` : 'No live gate data'

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

  // Agent State Semantic Styling
  let agentStateClass =
    'bg-[var(--color-bg-muted)] text-[var(--color-fg-muted)] border-[var(--color-border-muted)]'
  if (agentStateStr === 'working')
    agentStateClass = 'provenance-ai text-[var(--color-ai)] border-[var(--color-ai-border)]'
  if (agentStateStr === 'blocked')
    agentStateClass =
      'state-gate-rejected text-[var(--color-danger)] border-[var(--color-gate-rejected-border)]'
  if (agentStateStr === 'needs-review')
    agentStateClass =
      'state-gate-pending text-[var(--color-gate-pending)] border-[var(--color-gate-pending-border)]'

  return (
    <div className="space-y-8 pb-8">
      {/* 1. MISSION CONTROL CONSOLE - Top Priority */}
      <div className="surface-critical p-6 animate-entrance stagger-1 flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-[var(--color-border-muted)] pb-4">
          <h2 className="text-xl font-semibold text-[var(--color-fg-default)]">
            Operational Command Center
          </h2>
          <div className={`px-3 py-1 rounded text-sm font-medium border ${agentStateClass}`}>
            ● {agentStateStr}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-fg-faint)]">
              Pending Gates
            </span>
            <span
              className={`text-sm ${
                pendingGatesCount > 0
                  ? 'font-semibold text-[var(--color-gate-pending)]'
                  : 'italic text-[var(--color-fg-muted)]'
              }`}
            >
              {pendingGatesStr}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-fg-faint)]">
              Active Blockers
            </span>
            <span
              className={`text-sm ${
                activeBlockersCount > 0
                  ? 'font-semibold text-[var(--color-danger)]'
                  : 'italic text-[var(--color-fg-muted)]'
              }`}
            >
              {blockersStr}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-fg-faint)]">
              Last Activity
            </span>
            <span
              className="truncate text-sm text-[var(--color-fg-subtle)]"
              title={latestActivityTitle || lastActivityStr}
            >
              {latestActivityTitle
                ? `${latestActivityTitle} (${lastActivityStr})`
                : lastActivityStr}
            </span>
          </div>
        </div>
        {/* Note: nextRecommendedAction has been completely removed to honor the deferred contract */}
      </div>

      {/* 2. LEGACY AI WIDGETS & MODALS (Will be integrated/replaced over time) */}
      <div className="animate-entrance stagger-2 transition-opacity hover:opacity-100 opacity-80">
        <AIStatusCard />
      </div>

      {/* 3. Two-Column Workspace: Left Feed vs Right Analytics */}
      <div className="grid grid-cols-1 items-start gap-8 xl:grid-cols-[1fr_420px]">
        {/* Left Column: Events & Approvals */}
        <div className="space-y-8">
          <div className="animate-entrance stagger-3">
            <GatePanel projectId={project.id} />
          </div>
          <div className="animate-entrance stagger-4">
            <EventFeed />
          </div>
        </div>

        {/* Right Column: Sessions & Traditional Analytics */}
        <div className="space-y-8">
          <div className="animate-entrance stagger-5">
            <SessionHistory projectId={project.id} />
          </div>
          <div className="animate-entrance stagger-6">
            <SprintMetricsPanel project={project} />
          </div>
          <div className="animate-entrance stagger-7">
            <MetricsSummary project={project} />
          </div>
        </div>
      </div>
    </div>
  )
}
