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
      <AIStatusCard />

      {/* Gate approvals + escalations — only renders when gates exist or AI is blocked */}
      <GatePanel projectId={project.id} />

      {/* Metrics row */}
      <MetricsSummary project={project} />

      {/* Sprint metrics — velocity, cycle time, status distribution */}
      <SprintMetricsPanel project={project} />

      {/* Event Feed — primary content */}
      <EventFeed />

      {/* Session History — past agent work sessions */}
      <SessionHistory projectId={project.id} />

      {/* Steering Bar — fixed-feeling input at the bottom */}
      <SteeringBar projectId={project.id} />
    </div>
  )
}
