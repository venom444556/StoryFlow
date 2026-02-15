import { motion, AnimatePresence } from 'framer-motion'
import { Users } from 'lucide-react'
import Tooltip from '../ui/Tooltip'

/**
 * PresenceIndicator - Shows who else is viewing the project
 *
 * Displays avatar pills for each viewer with their name and
 * which tab they're currently on.
 */
export default function PresenceIndicator({
  viewers = [],
  maxDisplay = 4,
  className = '',
}) {
  if (viewers.length === 0) return null

  const displayedViewers = viewers.slice(0, maxDisplay)
  const remainingCount = viewers.length - maxDisplay

  return (
    <div
      className={[
        'flex items-center gap-1',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <AnimatePresence mode="popLayout">
        {displayedViewers.map((viewer, index) => (
          <motion.div
            key={viewer.id}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
            style={{ zIndex: maxDisplay - index }}
          >
            <Tooltip
              content={
                <div className="text-center">
                  <div className="font-medium">{viewer.name}</div>
                  <div className="text-xs text-[var(--color-fg-muted)]">
                    Viewing {formatTabName(viewer.tab)}
                  </div>
                </div>
              }
            >
              <ViewerAvatar viewer={viewer} />
            </Tooltip>
          </motion.div>
        ))}

        {remainingCount > 0 && (
          <motion.div
            key="remaining"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
          >
            <Tooltip content={`${remainingCount} more viewer${remainingCount > 1 ? 's' : ''}`}>
              <div
                className={[
                  'flex h-7 w-7 items-center justify-center rounded-full',
                  'bg-[var(--color-bg-muted)] text-xs font-medium',
                  'text-[var(--color-fg-muted)] ring-2 ring-[var(--color-bg-base)]',
                ].join(' ')}
              >
                +{remainingCount}
              </div>
            </Tooltip>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/**
 * Single viewer avatar
 */
function ViewerAvatar({ viewer }) {
  // Get initials from name
  const initials = viewer.name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div
      className={[
        'relative flex h-7 w-7 items-center justify-center rounded-full',
        'text-xs font-medium text-white',
        'ring-2 ring-[var(--color-bg-base)]',
        'cursor-default transition-transform hover:scale-110',
      ].join(' ')}
      style={{ backgroundColor: viewer.color }}
    >
      {initials}

      {/* Online indicator */}
      <span
        className={[
          'absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full',
          'bg-green-400 ring-2 ring-[var(--color-bg-base)]',
        ].join(' ')}
      />
    </div>
  )
}

/**
 * Compact presence count indicator
 */
export function PresenceCount({ count = 0, className = '' }) {
  if (count === 0) return null

  return (
    <div
      className={[
        'flex items-center gap-1.5 rounded-full px-2 py-1',
        'bg-[var(--color-bg-glass)] text-xs',
        'text-[var(--color-fg-muted)]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <Users size={12} />
      <span>
        {count} viewing
      </span>
    </div>
  )
}

/**
 * Presence banner for showing at the top of a page
 */
export function PresenceBanner({ viewers = [], className = '' }) {
  if (viewers.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={[
        'flex items-center justify-between rounded-lg px-3 py-2',
        'bg-[var(--color-bg-glass)] border border-[var(--color-border-muted)]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="flex items-center gap-2">
        <Users size={14} className="text-[var(--color-fg-muted)]" />
        <span className="text-sm text-[var(--color-fg-muted)]">
          {viewers.length} other{viewers.length > 1 ? 's' : ''} viewing
        </span>
      </div>

      <PresenceIndicator viewers={viewers} maxDisplay={6} />
    </motion.div>
  )
}

/**
 * Format tab name for display
 */
function formatTabName(tab) {
  const names = {
    overview: 'Overview',
    architecture: 'Architecture',
    workflow: 'Workflow',
    board: 'Board',
    wiki: 'Wiki',
    decisions: 'Decisions',
    timeline: 'Timeline',
    plan: 'Plan',
    work: 'Work',
    docs: 'Docs',
    insights: 'Insights',
  }
  return names[tab] || tab
}
