import { motion } from 'framer-motion'
import { Tag } from 'lucide-react'
import IssueTypeIcon from './IssueTypeIcon'
import Avatar from '../ui/Avatar'
import Badge from '../ui/Badge'

const PRIORITY_BADGE_VARIANT = {
  critical: 'red',
  high: 'yellow',
  medium: 'blue',
  low: 'gray',
}

export default function IssueCard({ issue, onClick, onDragStart, onDragEnd, isDragging = false }) {
  const priorityVariant = PRIORITY_BADGE_VARIANT[issue.priority] || 'default'

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
        'bg-[var(--color-bg-glass)] backdrop-blur-sm hover:bg-[var(--color-bg-glass-hover)]',
        isDragging
          ? 'ring-2'
          : 'border-[var(--color-border-default)] hover:border-[var(--color-border-emphasis)]',
      ].join(' ')}
      style={
        isDragging
          ? {
              borderColor: 'rgba(var(--accent-active-rgb, 139, 92, 246), 0.4)',
              '--tw-ring-color': 'rgba(var(--accent-active-rgb, 139, 92, 246), 0.2)',
            }
          : undefined
      }
    >
      {/* Top row: type icon + key */}
      <div className="mb-2 flex items-center gap-2">
        <IssueTypeIcon type={issue.type} size={14} />
        <span className="text-xs font-medium text-[var(--color-fg-muted)]">{issue.key}</span>
      </div>

      {/* Title */}
      <p className="mb-2.5 line-clamp-2 text-sm font-medium leading-snug text-[var(--color-fg-default)] group-hover:text-[var(--color-fg-default)]">
        {issue.title}
      </p>

      {/* Bottom row: priority, points, assignee, labels */}
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
