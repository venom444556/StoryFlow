import { useState } from 'react'
import { Bot, User, Cpu, ChevronDown, ChevronUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'

const ACTOR_CONFIG = {
  ai: {
    label: 'AI',
    icon: Bot,
    bgClass: 'bg-[var(--color-ai-bg)]',
    textClass: 'text-[var(--color-ai-accent)]',
    borderClass: 'border-[var(--color-ai-border)]',
    dotClass: 'bg-[var(--color-ai-accent)]',
  },
  human: {
    label: 'Human',
    icon: User,
    bgClass: 'bg-[var(--color-human-bg)]',
    textClass: 'text-[var(--color-human-accent)]',
    borderClass: 'border-[var(--color-human-border)]',
    dotClass: 'bg-[var(--color-human-accent)]',
  },
  system: {
    label: 'System',
    icon: Cpu,
    bgClass: 'bg-[var(--badge-gray-bg)]',
    textClass: 'text-[var(--badge-gray-fg)]',
    borderClass: 'border-[var(--badge-gray-border)]',
    dotClass: 'bg-[var(--badge-gray-fg)]',
  },
}

export default function ProvenanceBadge({
  actor = 'human',
  reasoning,
  timestamp,
  confidence,
  size = 'sm',
}) {
  const [expanded, setExpanded] = useState(false)
  const config = ACTOR_CONFIG[actor] || ACTOR_CONFIG.human
  const Icon = config.icon

  const sizeClasses = {
    xs: 'px-1 py-px text-[9px] gap-0.5',
    sm: 'px-1.5 py-0.5 text-[10px] gap-1',
    md: 'px-2 py-0.5 text-[11px] gap-1',
  }

  const hasDetails = reasoning || confidence !== undefined

  return (
    <div className="inline-flex flex-col">
      <button
        onClick={hasDetails ? () => setExpanded((prev) => !prev) : undefined}
        className={[
          'inline-flex items-center rounded-full border font-medium leading-none',
          config.bgClass,
          config.textClass,
          config.borderClass,
          sizeClasses[size] || sizeClasses.sm,
          hasDetails ? 'cursor-pointer hover:brightness-110' : 'cursor-default',
        ].join(' ')}
        title={
          timestamp
            ? `${config.label} · ${formatDistanceToNow(new Date(timestamp), { addSuffix: true })}`
            : config.label
        }
        aria-expanded={hasDetails ? expanded : undefined}
      >
        <Icon size={size === 'xs' ? 8 : 10} />
        <span>{config.label}</span>
        {hasDetails && (expanded ? <ChevronUp size={8} /> : <ChevronDown size={8} />)}
      </button>

      <AnimatePresence>
        {expanded && hasDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
            className="mt-1 overflow-hidden"
          >
            <div
              className={[
                'rounded-lg border p-2 text-[11px] leading-relaxed',
                config.borderClass,
                config.bgClass,
              ].join(' ')}
            >
              {reasoning && (
                <p className="text-[var(--color-fg-muted)]">
                  <span className={`font-semibold ${config.textClass}`}>Why: </span>
                  {reasoning}
                </p>
              )}
              {confidence !== undefined && confidence !== null && (
                <p className="mt-1 text-[var(--color-fg-subtle)]">
                  Confidence: {Math.round(confidence * 100)}%
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
