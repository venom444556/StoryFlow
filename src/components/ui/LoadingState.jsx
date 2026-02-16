import React from 'react'
import { Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'

/**
 * Loading state component with animated spinner and optional message.
 * Use this for consistent loading feedback throughout the app.
 */
export default function LoadingState({
  message = 'Loading...',
  size = 'md',
  fullScreen = false,
  className = '',
}) {
  const sizeClasses = {
    sm: { spinner: 16, text: 'text-[var(--text-xs)]' },
    md: { spinner: 24, text: 'text-[var(--text-sm)]' },
    lg: { spinner: 32, text: 'text-[var(--text-base)]' },
  }

  const { spinner, text } = sizeClasses[size] || sizeClasses.md

  const content = (
    <motion.div
      className={['flex flex-col items-center justify-center gap-[var(--space-3)]', className]
        .filter(Boolean)
        .join(' ')}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Loader2
        size={spinner}
        className="animate-spin text-[var(--interactive-default)]"
        aria-hidden="true"
      />
      {message && (
        <p className={`${text} text-[var(--text-muted)]`} role="status" aria-live="polite">
          {message}
        </p>
      )}
    </motion.div>
  )

  if (fullScreen) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center bg-[var(--surface-base)]/80 backdrop-blur-sm"
        style={{ zIndex: 'var(--z-overlay)' }}
      >
        {content}
      </div>
    )
  }

  return content
}
