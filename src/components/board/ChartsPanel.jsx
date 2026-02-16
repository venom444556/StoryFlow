import { motion } from 'framer-motion'
import { X, BarChart3 } from 'lucide-react'
import BurndownChart from './BurndownChart'
import VelocityChart from './VelocityChart'

export default function ChartsPanel({ onClose, burndownData = [], velocityData = [] }) {
  return (
    <motion.div
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 28, stiffness: 320 }}
      className="absolute right-0 top-0 bottom-0 z-20 flex w-[480px] max-w-full flex-col border-l border-[var(--color-border-default)] bg-[var(--color-bg-overlay)]"
      style={{ backdropFilter: 'blur(16px)' }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-[var(--color-border-default)] px-4 py-3">
        <BarChart3 size={16} className="text-[var(--color-fg-muted)]" />
        <h3 className="flex-1 text-sm font-semibold text-[var(--color-fg-default)]">Charts</h3>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1.5 text-[var(--color-fg-muted)] transition-colors hover:bg-[var(--color-bg-glass-hover)] hover:text-[var(--color-fg-default)]"
        >
          <X size={16} />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 space-y-6 overflow-y-auto p-4">
        <BurndownChart data={burndownData} />
        <VelocityChart sprints={velocityData} />
      </div>
    </motion.div>
  )
}
