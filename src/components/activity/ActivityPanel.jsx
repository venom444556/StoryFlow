import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Activity } from 'lucide-react'
import { useActivityStore } from '../../stores/activityStore'
import GlassCard from '../ui/GlassCard'
import EmptyState from '../ui/EmptyState'
import ActivityItem from './ActivityItem'

export default function ActivityPanel({
  projectId,
  limit = 50,
  entityType,
  entityId,
  className = '',
}) {
  // Get activities using getState() to avoid subscription issues
  // Then use a simple selector for the activities object to trigger re-renders
  const activitiesMap = useActivityStore((state) => state.activities)

  // Filter activities based on props
  const activities = useMemo(() => {
    const allActivities = activitiesMap[projectId] || []
    // Ensure we always have an array to work with
    if (!Array.isArray(allActivities)) return []

    let filtered = allActivities

    if (entityType) {
      filtered = filtered.filter((a) => a.entityType === entityType)
    }

    if (entityId) {
      filtered = filtered.filter((a) => a.entityId === entityId)
    }

    return filtered.slice(0, limit)
  }, [activitiesMap, projectId, entityType, entityId, limit])

  if (activities.length === 0) {
    return (
      <GlassCard className={className}>
        <div className="mb-3 flex items-center gap-2">
          <Activity size={16} className="text-purple-400" />
          <h3 className="text-sm font-semibold text-[var(--color-fg-muted)]">Activity</h3>
        </div>
        <EmptyState
          icon={Activity}
          title="No activity yet"
          description="Create issues, update pages, or make decisions — your actions will be logged here automatically."
        />
      </GlassCard>
    )
  }

  return (
    <GlassCard padding="none" className={className}>
      <div className="flex items-center justify-between border-b border-[var(--color-border-default)] px-4 py-3">
        <div className="flex items-center gap-2">
          <Activity size={16} className="text-purple-400" />
          <h3 className="text-sm font-semibold text-[var(--color-fg-default)]">Activity</h3>
          <span className="rounded-full bg-[var(--color-bg-glass)] px-2 py-0.5 text-[10px] text-[var(--color-fg-muted)]">
            {activities.length}
          </span>
        </div>
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        <AnimatePresence mode="popLayout" initial={false}>
          {activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2, delay: index * 0.02 }}
            >
              <ActivityItem activity={activity} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </GlassCard>
  )
}
