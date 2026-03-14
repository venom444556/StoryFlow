import { motion } from 'framer-motion'
import { Clock, Tag, MessageSquare, Sparkles } from 'lucide-react'
import Avatar from '../ui/Avatar'
import Badge from '../ui/Badge'
import TypeBadge from '../ui/TypeBadge'
import ProvenanceBadge from '../ui/ProvenanceBadge'
import BlockedBanner from './BlockedBanner'
import { getStaleInfo } from '../../utils/staleness'
import { useSettings } from '../../contexts/SettingsContext'

const PRIORITY_BADGE_VARIANT = {
  critical: 'red',
  high: 'yellow',
  medium: 'blue',
  low: 'gray',
}

export default function IssueCard({ issue, onClick, onDragStart, onDragEnd, isDragging = false }) {
  const { settings } = useSettings()
  const priorityVariant = PRIORITY_BADGE_VARIANT[issue.priority] || 'default'
  const { isStale, agoText } = getStaleInfo(issue, settings.staleThresholdMinutes * 60 * 1000)
  const isAiCreated = issue.createdBy === 'ai'

  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', issue.id)
    e.dataTransfer.effectAllowed = 'move'
    onDragStart?.(issue)
  }

  const handleDragEnd = () => {
    onDragEnd?.(issue)
  }

  return (
    <motion.div
      role="option"
      aria-selected={false}
      layout
      layoutId={issue.id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: isDragging ? 0.6 : 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={() => onClick?.(issue)}
      className={[
        'group cursor-grab rounded-xl border p-3 transition-all duration-200 active:cursor-grabbing',
        'bg-transparent hover:bg-[var(--color-bg-glass)]',
        isDragging
          ? 'ring-2'
          : 'border-[var(--color-border-default)] hover:border-[var(--color-border-emphasis)]',
      ]
        .filter(Boolean)
        .join(' ')}
      style={
        isDragging
          ? {
              borderColor: 'rgba(var(--accent-default-rgb), 0.4)',
              '--tw-ring-color': 'rgba(var(--accent-default-rgb), 0.2)',
            }
          : undefined
      }
    >
      {/* Top row: type badge + key + AI sparkle + provenance */}
      <div className="mb-2 flex items-center gap-2">
        <TypeBadge type={issue.type} />
        <span className="text-xs font-medium text-[var(--color-fg-muted)]">{issue.key}</span>
        {isAiCreated && (
          <span
            className="flex items-center gap-0.5 text-[10px] text-[var(--color-fg-subtle)]"
            title="AI Generated"
          >
            <Sparkles size={10} />
          </span>
        )}
        <div className="flex-1" />
        {issue.createdBy && (
          <ProvenanceBadge
            actor={issue.createdBy}
            reasoning={issue.createdByReasoning}
            confidence={issue.createdByConfidence}
            timestamp={issue.createdAt}
            size="xs"
          />
        )}
      </div>

      {/* Blocked banner */}
      {issue.status === 'Blocked' && (
        <BlockedBanner blockedAt={issue.blockedAt || issue.updatedAt} />
      )}

      {/* Title */}
      <p
        className="mb-2.5 line-clamp-2 text-sm font-medium leading-snug text-[var(--color-fg-default)] group-hover:text-[var(--color-fg-default)]"
        title={issue.title}
      >
        {issue.title}
      </p>

      {/* Staleness indicator */}
      {isStale && (
        <div className="mb-2 flex items-center gap-1.5 text-[11px] text-amber-400/80">
          <Clock size={12} />
          <span>Updated {agoText} ago</span>
        </div>
      )}

      {/* Bottom row: priority, points, comments, labels, assignee */}
      <div className="flex items-center gap-2">
        {/* Priority badge */}
        {issue.priority && (
          <Badge variant={priorityVariant} size="xs" dot>
            {issue.priority}
          </Badge>
        )}

        {/* Story points */}
        {issue.storyPoints !== null && issue.storyPoints !== undefined && (
          <span
            className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-bg-muted)] text-[10px] font-bold text-[var(--color-fg-muted)]"
            title={`${issue.storyPoints} story points`}
          >
            {issue.storyPoints}
          </span>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Comment count */}
        {issue.comments && issue.comments.length > 0 && (
          <span
            className="flex items-center gap-0.5 text-[10px] text-[var(--color-fg-muted)]"
            title={`${issue.comments.length} comments`}
          >
            <MessageSquare size={10} />
            {issue.comments.length}
          </span>
        )}

        {/* Labels count */}
        {issue.labels && issue.labels.length > 0 && (
          <span
            className="flex items-center gap-1 text-[10px] text-[var(--color-fg-muted)]"
            title={issue.labels.join(', ')}
          >
            <Tag size={10} />
            {issue.labels.length}
          </span>
        )}

        {/* Assignee avatar */}
        {issue.assignee && <Avatar name={issue.assignee} size="sm" />}
      </div>
    </motion.div>
  )
}
