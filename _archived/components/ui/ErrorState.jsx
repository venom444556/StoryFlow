import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from './Button';

/**
 * Error state component with retry option.
 * Use this for consistent error feedback throughout the app.
 */
export default function ErrorState({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  onRetry,
  retryLabel = 'Try Again',
  icon: Icon = AlertCircle,
  className = '',
}) {
  return (
    <motion.div
      className={[
        'flex flex-col items-center justify-center gap-[var(--space-4)]',
        'p-[var(--space-6)] text-center',
        className,
      ].filter(Boolean).join(' ')}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--status-error-subtle)]">
        <Icon size={24} className="text-[var(--status-error)]" aria-hidden="true" />
      </div>

      <div>
        <h3 className="text-[var(--text-base)] font-[var(--font-medium)] text-[var(--text-primary)]">
          {title}
        </h3>
        <p className="mt-[var(--space-1)] text-[var(--text-sm)] text-[var(--text-muted)]">
          {message}
        </p>
      </div>

      {onRetry && (
        <Button
          variant="secondary"
          size="sm"
          icon={RefreshCw}
          onClick={onRetry}
        >
          {retryLabel}
        </Button>
      )}
    </motion.div>
  );
}
