import AIStatusCard from '../overview/AIStatusCard'
import GatePanel from '../overview/GatePanel'
import EventFeed from '../overview/EventFeed'
import MetricsSummary from '../overview/MetricsSummary'
import SprintMetricsPanel from '../overview/SprintMetricsPanel'
import SessionHistory from '../overview/SessionHistory'

export default function OverviewTab({ project }) {
  if (!project) return null

  return (
    <div className="space-y-8 pb-8">
      {/* AI Status — hero banner, full width */}
      <div className="animate-entrance stagger-1">
        <AIStatusCard />
      </div>

      {/* Hero metrics — full-width row */}
      <div className="animate-entrance stagger-2">
        <MetricsSummary project={project} />
      </div>

      {/* Gate approvals + escalations */}
      <div className="animate-entrance stagger-3">
        <GatePanel projectId={project.id} />
      </div>

      {/* Two-column: feed left, sprint + sessions right */}
      <div className="grid grid-cols-1 items-start gap-8 xl:grid-cols-[1fr_420px]">
        {/* Left column — activity feed */}
        <div className="animate-entrance stagger-4">
          <EventFeed />
        </div>

        {/* Right column — sprint metrics + sessions (determines row height) */}
        <div className="space-y-8">
          <div className="animate-entrance stagger-4">
            <SprintMetricsPanel project={project} />
          </div>

          <div className="animate-entrance stagger-5">
            <SessionHistory projectId={project.id} />
          </div>
        </div>
      </div>
    </div>
  )
}
