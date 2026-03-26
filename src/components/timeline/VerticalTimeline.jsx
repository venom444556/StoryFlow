import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PhaseCard from './PhaseCard'
import MilestoneMarker from './MilestoneMarker'

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, x: -16 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
  },
}

/**
 * VerticalTimeline renders a connected sequence of phase cards and milestone
 * markers with a gradient spine running behind the individual node segments.
 *
 * It accepts a pre-sorted `items` array (same shape as TimelineView builds)
 * and delegates rendering to PhaseCard / MilestoneMarker.
 */
export default function VerticalTimeline({
  items = [],
  onEditPhase,
  onDeletePhase,
  onEditMilestone,
  onDeleteMilestone,
  onToggleMilestone,
}) {
  // Compute gradient stops based on item statuses
  const gradientStyle = useMemo(() => {
    if (items.length < 2) return null
    const stops = items.map((item, i) => {
      const pct = (i / (items.length - 1)) * 100
      if (item.type === 'milestone') {
        return `${item.data.completed ? '#10b981' : '#374151'} ${pct}%`
      }
      const progress = item.data.progress || 0
      if (progress >= 100) return `#10b981 ${pct}%`
      if (progress > 0) return `#374151 ${pct}%`
      return `#1f2937 ${pct}%`
    })
    return {
      background: `linear-gradient(to bottom, ${stops.join(', ')})`,
      opacity: 0.18,
    }
  }, [items])

  if (items.length === 0) return null

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="relative pl-1"
    >
      {/* Dynamic gradient spine */}
      {gradientStyle && (
        <div
          className="absolute left-[7.5px] top-0 bottom-0 w-0.5 rounded-full"
          style={gradientStyle}
        />
      )}
      <AnimatePresence mode="popLayout">
        {items.map((item, index) => (
          <motion.div key={item.data.id} variants={itemVariants} layout>
            {item.type === 'phase' ? (
              <PhaseCard
                phase={item.data}
                onEdit={onEditPhase}
                onDelete={onDeletePhase}
                isLast={index === items.length - 1}
              />
            ) : (
              <MilestoneMarker
                milestone={item.data}
                onEdit={onEditMilestone}
                onDelete={onDeleteMilestone}
                onToggle={onToggleMilestone}
                isLast={index === items.length - 1}
              />
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  )
}
