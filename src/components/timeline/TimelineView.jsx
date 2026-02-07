import React, { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock } from 'lucide-react'
import PhaseCard from './PhaseCard'
import MilestoneMarker from './MilestoneMarker'
import EmptyState from '../ui/EmptyState'

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
  },
}

export default function TimelineView({
  phases = [],
  milestones = [],
  onEditPhase,
  onDeletePhase,
  onEditMilestone,
  onDeleteMilestone,
  onToggleMilestone,
}) {
  // Build a combined timeline of phases + milestones, sorted by date
  const items = useMemo(() => {
    const list = []

    for (const phase of phases) {
      list.push({
        type: 'phase',
        sortDate: phase.startDate || '9999-99-99',
        data: phase,
      })
    }

    for (const milestone of milestones) {
      list.push({
        type: 'milestone',
        sortDate: milestone.date || '9999-99-99',
        data: milestone,
      })
    }

    list.sort((a, b) => a.sortDate.localeCompare(b.sortDate))
    return list
  }, [phases, milestones])

  if (items.length === 0) {
    return (
      <EmptyState
        icon={Clock}
        title="No phases or milestones yet"
        description="Add your first phase or milestone to start tracking progress on your project timeline."
      />
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="relative pl-1"
    >
      <AnimatePresence mode="popLayout">
        {items.map((item, index) => (
          <motion.div
            key={item.data.id}
            variants={itemVariants}
            layout
          >
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
