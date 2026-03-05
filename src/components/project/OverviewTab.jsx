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
    <div className="mx-auto max-w-5xl space-y-5">
      {/* AI Status — hero card at the top */}
      <div className="animate-entrance stagger-1">
        <AIStatusCard />
      </div>

      {/* Gate approvals + escalations — only renders when gates exist or AI is blocked */}
      <div className="animate-entrance stagger-2">
        <GatePanel projectId={project.id} />
      </div>

      {/* Metrics row */}
      <div className="animate-entrance stagger-3">
        <MetricsSummary project={project} />
      </div>

      {/* Sprint metrics — velocity, cycle time, status distribution */}
      <div className="animate-entrance stagger-4">
        <SprintMetricsPanel project={project} />
      </div>

      {/* Event Feed — primary content */}
      <div className="animate-entrance stagger-5">
        <EventFeed />
      </div>

      {/* Session History — past agent work sessions */}
      <div className="animate-entrance stagger-6">
        <SessionHistory projectId={project.id} />
      </div>

      {/* Steering Bar — fixed-feeling input at the bottom */}
      <div className="animate-entrance stagger-7">
        <SteeringBar projectId={project.id} />
      </div>
    </div>
  )
}
