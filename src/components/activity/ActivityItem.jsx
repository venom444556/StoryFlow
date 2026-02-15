import { useMemo } from 'react'
import {
  Plus,
  Pencil,
  Trash2,
  ArrowRight,
  User,
  AlertTriangle,
  CheckCircle,
  FileText,
  GitBranch,
  MessageSquare,
  Scale,
  Clock,
  Target,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ACTIVITY_TYPES, getActivityDescription } from '../../stores/activityStore'
import Avatar from '../ui/Avatar'

const ACTIVITY_ICONS = {
  [ACTIVITY_TYPES.ISSUE_CREATED]: Plus,
  [ACTIVITY_TYPES.ISSUE_UPDATED]: Pencil,
  [ACTIVITY_TYPES.ISSUE_DELETED]: Trash2,
  [ACTIVITY_TYPES.ISSUE_STATUS_CHANGED]: ArrowRight,
  [ACTIVITY_TYPES.ISSUE_ASSIGNED]: User,
  [ACTIVITY_TYPES.ISSUE_PRIORITY_CHANGED]: AlertTriangle,

  [ACTIVITY_TYPES.PAGE_CREATED]: Plus,
  [ACTIVITY_TYPES.PAGE_UPDATED]: Pencil,
  [ACTIVITY_TYPES.PAGE_DELETED]: Trash2,
  [ACTIVITY_TYPES.PAGE_PUBLISHED]: CheckCircle,

  [ACTIVITY_TYPES.DECISION_CREATED]: Plus,
  [ACTIVITY_TYPES.DECISION_UPDATED]: Pencil,
  [ACTIVITY_TYPES.DECISION_STATUS_CHANGED]: Scale,

  [ACTIVITY_TYPES.PHASE_CREATED]: Plus,
  [ACTIVITY_TYPES.PHASE_UPDATED]: Pencil,
  [ACTIVITY_TYPES.PHASE_DELETED]: Trash2,

  [ACTIVITY_TYPES.MILESTONE_CREATED]: Target,
  [ACTIVITY_TYPES.MILESTONE_COMPLETED]: CheckCircle,

  [ACTIVITY_TYPES.WORKFLOW_UPDATED]: GitBranch,
  [ACTIVITY_TYPES.WORKFLOW_EXECUTED]: GitBranch,

  [ACTIVITY_TYPES.COMMENT_ADDED]: MessageSquare,
  [ACTIVITY_TYPES.COMMENT_EDITED]: Pencil,
  [ACTIVITY_TYPES.COMMENT_DELETED]: Trash2,
}

const ENTITY_COLORS = {
  issue: 'text-blue-400',
  page: 'text-green-400',
  decision: 'text-purple-400',
  phase: 'text-orange-400',
  milestone: 'text-yellow-400',
  workflow: 'text-cyan-400',
  comment: 'text-pink-400',
}

export default function ActivityItem({ activity }) {
  const Icon = ACTIVITY_ICONS[activity.type] || Clock
  const iconColor = ENTITY_COLORS[activity.entityType] || 'text-[var(--color-fg-muted)]'

  const timeAgo = useMemo(() => {
    try {
      return formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })
    } catch {
      return 'recently'
    }
  }, [activity.timestamp])

  const description = getActivityDescription(activity)

  return (
    <div className="flex items-start gap-3 border-b border-[var(--color-border-default)] px-4 py-3 last:border-b-0 hover:bg-[var(--color-bg-glass)] transition-colors">
      {/* Actor avatar or icon */}
      <div className="mt-0.5">
        {activity.actor ? (
          <Avatar name={activity.actor} size="sm" />
        ) : (
          <div
            className={[
              'flex h-6 w-6 items-center justify-center rounded-full',
              'bg-[var(--color-bg-glass)]',
            ].join(' ')}
          >
            <Icon size={12} className={iconColor} />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p className="text-sm text-[var(--color-fg-default)] leading-snug">
          {description}
        </p>
        <p className="mt-0.5 text-xs text-[var(--color-fg-muted)]">
          {timeAgo}
        </p>
      </div>
    </div>
  )
}
