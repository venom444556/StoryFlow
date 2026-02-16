import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutGrid, GitBranch, BookOpen, Clock, Scale, Boxes, Sparkles, X } from 'lucide-react'
import Button from '../ui/Button'

const STORAGE_KEY = 'storyflow-welcomed'

const FEATURES = [
  {
    icon: LayoutGrid,
    title: 'Board',
    description: 'Kanban board with sprints, epics, and drag-drop issue management.',
    color: 'var(--color-accent-emphasis)',
  },
  {
    icon: BookOpen,
    title: 'Wiki',
    description: 'Nested documentation pages with markdown editor and version history.',
    color: '#3b82f6',
  },
  {
    icon: GitBranch,
    title: 'Workflow',
    description: 'Visual node graph for planning phases, dependencies, and execution flow.',
    color: '#8b5cf6',
  },
  {
    icon: Boxes,
    title: 'Architecture',
    description: 'Component tree planning with dependency mapping and type filtering.',
    color: '#06b6d4',
  },
  {
    icon: Clock,
    title: 'Timeline',
    description: 'Phase-based progress tracking with milestones and Gantt view.',
    color: '#f59e0b',
  },
  {
    icon: Scale,
    title: 'Decisions',
    description: 'Architectural decision records with alternatives and consequences.',
    color: '#10b981',
  },
]

export default function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [dontShowAgain, setDontShowAgain] = useState(false)

  useEffect(() => {
    try {
      const welcomed = localStorage.getItem(STORAGE_KEY)
      if (!welcomed) {
        // Small delay so the app renders first
        const timer = setTimeout(() => setIsOpen(true), 600)
        return () => clearTimeout(timer)
      }
    } catch {
      // localStorage may be unavailable in private browsing — show modal anyway
      const timer = setTimeout(() => setIsOpen(true), 600)
      return () => clearTimeout(timer)
    }
  }, [])

  // Listen for re-open events from Help button in sidebar
  useEffect(() => {
    const handler = () => setIsOpen(true)
    window.addEventListener('storyflow-show-welcome', handler)
    return () => window.removeEventListener('storyflow-show-welcome', handler)
  }, [])

  const handleClose = () => {
    setIsOpen(false)
    if (dontShowAgain) {
      localStorage.setItem(STORAGE_KEY, 'true')
    }
  }

  const handleGetStarted = () => {
    localStorage.setItem(STORAGE_KEY, 'true')
    setIsOpen(false)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <div
            role="button"
            tabIndex={-1}
            aria-label="Close dialog"
            onKeyDown={(e) => e.key === 'Escape' && handleClose()}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-[var(--color-border-default)] bg-[var(--color-bg-overlay)] shadow-2xl"
          >
            {/* Close button */}
            <button
              type="button"
              onClick={handleClose}
              className="absolute right-3 top-3 rounded-lg p-1.5 text-[var(--color-fg-muted)] hover:bg-[var(--color-bg-glass-hover)] hover:text-[var(--color-fg-default)]"
            >
              <X size={16} />
            </button>

            {/* Header */}
            <div className="px-6 pb-2 pt-6 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-accent-emphasis)]/15">
                <Sparkles size={24} className="text-[var(--color-accent-emphasis)]" />
              </div>
              <h2 className="text-lg font-bold text-[var(--color-fg-default)]">
                Welcome to StoryFlow
              </h2>
              <p className="mt-1 text-sm text-[var(--color-fg-muted)]">
                Your visual project planning toolkit. Here&apos;s what you can do:
              </p>
            </div>

            {/* Feature grid */}
            <div className="grid grid-cols-2 gap-2 px-6 py-4">
              {FEATURES.map((feature) => {
                const Icon = feature.icon
                return (
                  <div
                    key={feature.title}
                    className="rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-glass)] p-3"
                  >
                    <div className="flex items-start gap-2.5">
                      <div
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                        style={{ backgroundColor: `${feature.color}20` }}
                      >
                        <Icon size={14} style={{ color: feature.color }} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[var(--color-fg-default)]">
                          {feature.title}
                        </p>
                        <p className="mt-0.5 text-[10px] leading-tight text-[var(--color-fg-muted)]">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-[var(--color-border-default)] px-6 py-4">
              <label className="flex items-center gap-2 text-xs text-[var(--color-fg-muted)]">
                <input
                  type="checkbox"
                  checked={dontShowAgain}
                  onChange={(e) => setDontShowAgain(e.target.checked)}
                  className="rounded"
                />
                Don&apos;t show again
              </label>
              <Button variant="primary" onClick={handleGetStarted}>
                Get Started
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/**
 * Re-open the welcome modal (called from help button in sidebar).
 * Sets the welcomed flag to false and forces re-render.
 */
// eslint-disable-next-line react-refresh/only-export-components
export function resetWelcome() {
  localStorage.removeItem(STORAGE_KEY)
}
