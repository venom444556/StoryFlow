import AIStatusCard from '../overview/AIStatusCard'
import GatePanel from '../overview/GatePanel'
import EventFeed from '../overview/EventFeed'
import MetricsSummary from '../overview/MetricsSummary'
import SprintMetricsPanel from '../overview/SprintMetricsPanel'
import SessionHistory from '../overview/SessionHistory'
import SteeringBar from '../overview/SteeringBar'

export default function OverviewTab({ project }) {
  if (!project) return null

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      {/* AI Status — hero card at the top */}
      <div className="animate-entrance stagger-1">
        <AIStatusCard />
      </div>

      {/* Two-column grid: gates+events left, metrics+sessions right */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
        {/* Left column — primary content */}
        <div className="space-y-5">
          {/* Gate approvals + escalations */}
          <div className="animate-entrance stagger-2">
            <GatePanel projectId={project.id} />
          </div>

          {/* Event Feed */}
          <div className="animate-entrance stagger-3">
            <EventFeed />
          </div>

          {/* Steering Bar — input at the bottom of left column */}
          <div className="animate-entrance stagger-6">
            <SteeringBar projectId={project.id} />
          </div>
        </div>

        {/* Right column — metrics + sessions */}
        <div className="space-y-5">
          {/* Metrics row */}
          <div className="animate-entrance stagger-3">
            <MetricsSummary project={project} />
          </div>

          {/* Sprint metrics */}
          <div className="animate-entrance stagger-4">
            <SprintMetricsPanel project={project} />
          </div>

          {/* Session History */}
          <div className="animate-entrance stagger-5">
            <SessionHistory projectId={project.id} />
          </div>
        </div>
      </div>
    </div>
  )
}
