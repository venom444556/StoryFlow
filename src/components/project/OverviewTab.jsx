import AIStatusCard from '../overview/AIStatusCard'
import EventFeed from '../overview/EventFeed'
import MetricsSummary from '../overview/MetricsSummary'
import SteeringBar from '../overview/SteeringBar'

export default function OverviewTab({ project }) {
  if (!project) return null

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      {/* AI Status — hero card at the top */}
      <AIStatusCard />

      {/* Metrics row */}
      <MetricsSummary project={project} />

      {/* Event Feed — primary content */}
      <EventFeed />

      {/* Steering Bar — fixed-feeling input at the bottom */}
      <SteeringBar projectId={project.id} />
    </div>
  )
}
