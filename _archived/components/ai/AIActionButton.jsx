import { motion } from 'framer-motion'
import { Sparkles, Loader2 } from 'lucide-react'
import Button from '../ui/Button'
import Tooltip from '../ui/Tooltip'

/**
 * AIActionButton - Distinct button for AI-powered actions
 *
 * Features the sparkle icon and gradient styling to indicate
 * AI functionality. Can show loading state when AI is processing.
 */
export default function AIActionButton({
  children,
  onClick,
  loading = false,
  disabled = false,
  tooltip,
  size = 'sm',
  variant = 'ai', // 'ai' | 'ai-subtle' | 'ai-ghost'
  className = '',
  ...props
}) {
  const variants = {
    ai: [
      'bg-gradient-to-r from-purple-500/20 to-blue-500/20',
      'border border-purple-500/30',
      'text-purple-300 hover:text-purple-200',
      'hover:from-purple-500/30 hover:to-blue-500/30',
      'hover:border-purple-500/50',
    ].join(' '),
    'ai-subtle': [
      'bg-[var(--color-bg-glass)]',
      'border border-[var(--color-border-muted)]',
      'text-[var(--color-fg-muted)] hover:text-purple-300',
      'hover:border-purple-500/30 hover:bg-purple-500/10',
    ].join(' '),
    'ai-ghost': [
      'text-[var(--color-fg-subtle)] hover:text-purple-300',
      'hover:bg-purple-500/10',
    ].join(' '),
  }

  const button = (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={[
        'inline-flex items-center gap-2 rounded-lg transition-all',
        size === 'sm' && 'px-3 py-1.5 text-sm',
        size === 'md' && 'px-4 py-2 text-sm',
        size === 'lg' && 'px-5 py-2.5 text-base',
        variants[variant] || variants.ai,
        (disabled || loading) && 'opacity-50 cursor-not-allowed',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {loading ? (
        <Loader2 size={size === 'sm' ? 14 : 16} className="animate-spin" />
      ) : (
        <Sparkles size={size === 'sm' ? 14 : 16} />
      )}
      {children}
    </motion.button>
  )

  if (tooltip) {
    return <Tooltip content={tooltip}>{button}</Tooltip>
  }

  return button
}

/**
 * AI-generated content indicator badge
 */
export function AIGeneratedBadge({ className = '' }) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5',
        'bg-gradient-to-r from-purple-500/20 to-blue-500/20',
        'border border-purple-500/30 text-xs text-purple-300',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <Sparkles size={10} />
      AI Generated
    </span>
  )
}

/**
 * AI suggestion card with accept/dismiss actions
 */
export function AISuggestionCard({
  title,
  description,
  onAccept,
  onDismiss,
  loading = false,
  children,
  className = '',
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={[
        'rounded-lg border border-purple-500/30',
        'bg-gradient-to-br from-purple-500/10 to-blue-500/10',
        'p-4',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-purple-400" />
          <h4 className="font-medium text-[var(--color-fg-default)]">{title}</h4>
        </div>
        <AIGeneratedBadge />
      </div>

      {description && (
        <p className="mb-3 text-sm text-[var(--color-fg-muted)]">{description}</p>
      )}

      {children}

      <div className="mt-4 flex justify-end gap-2">
        <Button size="sm" variant="ghost" onClick={onDismiss} disabled={loading}>
          Dismiss
        </Button>
        <Button
          size="sm"
          onClick={onAccept}
          disabled={loading}
          className="bg-purple-500/20 text-purple-300 hover:bg-purple-500/30"
        >
          {loading ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Processing...
            </>
          ) : (
            'Accept'
          )}
        </Button>
      </div>
    </motion.div>
  )
}
