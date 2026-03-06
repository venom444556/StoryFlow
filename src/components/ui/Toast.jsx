import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'

const VARIANTS = {
  success: {
    icon: CheckCircle,
    className: 'border-[var(--color-success)]/25 bg-[var(--color-success-subtle)]',
    iconClass: 'text-[var(--color-success)]',
  },
  error: {
    icon: AlertCircle,
    className: 'border-[var(--color-danger)]/25 bg-[var(--color-danger-subtle)]',
    iconClass: 'text-[var(--color-danger)]',
  },
  warning: {
    icon: AlertTriangle,
    className: 'border-[var(--color-warning)]/25 bg-[var(--color-warning-subtle)]',
    iconClass: 'text-[var(--color-warning)]',
  },
  info: {
    icon: Info,
    className: 'border-[var(--color-info)]/25 bg-[var(--color-info-subtle)]',
    iconClass: 'text-[var(--color-info)]',
  },
}

function ToastItem({ toast, onDismiss }) {
  // Support both 'variant' and 'type' naming (store uses 'type')
  const variantKey = toast.variant || toast.type || 'info'
  const variant = VARIANTS[variantKey] || VARIANTS.info
  const Icon = variant.icon

  useEffect(() => {
    if (toast.duration !== 0) {
      const timer = setTimeout(() => {
        onDismiss(toast.id)
      }, toast.duration || 4000)

      return () => clearTimeout(timer)
    }
  }, [toast.id, toast.duration, onDismiss])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={[
        'pointer-events-auto flex items-start gap-3 rounded-[var(--radius-xl)] border p-4',
        'shadow-[var(--shadow-toast)]',
        variant.className,
      ].join(' ')}
    >
      <Icon size={18} className={variant.iconClass} />

      <div className="min-w-0 flex-1">
        {toast.title && (
          <p className="text-sm font-medium text-[var(--color-fg-default)]">{toast.title}</p>
        )}
        {toast.message && (
          <p className="mt-0.5 text-sm text-[var(--color-fg-muted)]">{toast.message}</p>
        )}
      </div>

      <button
        onClick={() => onDismiss(toast.id)}
        className="rounded p-0.5 text-[var(--color-fg-muted)] transition-colors hover:bg-[var(--color-bg-glass-hover)] hover:text-[var(--color-fg-default)]"
      >
        <X size={14} />
      </button>
    </motion.div>
  )
}

export default function ToastContainer({ toasts, onDismiss }) {
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex flex-col-reverse gap-2">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>
  )
}

// Export a simple hook-compatible toast function
// eslint-disable-next-line react-refresh/only-export-components
export function createToast(variant, title, message, duration = 4000) {
  return {
    id: crypto.randomUUID(),
    variant,
    title,
    message,
    duration,
    createdAt: new Date().toISOString(),
  }
}
