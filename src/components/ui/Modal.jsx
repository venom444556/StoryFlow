import { useEffect, useRef, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'

const SIZE_MAP = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-[calc(100vw-2rem)]',
}

// Focusable element selector
const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
}) {
  const modalRef = useRef(null)
  const previousActiveElement = useRef(null)
  const titleId = useRef(`modal-title-${Math.random().toString(36).slice(2, 9)}`)

  // Store the previously focused element when modal opens
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement
    }
  }, [isOpen])

  // Restore focus when modal closes
  useEffect(() => {
    if (!isOpen && previousActiveElement.current) {
      previousActiveElement.current.focus()
      previousActiveElement.current = null
    }
  }, [isOpen])

  // Focus first focusable element when modal opens
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll(FOCUSABLE_SELECTOR)
      if (focusableElements.length > 0) {
        // Focus the close button or first focusable element
        setTimeout(() => focusableElements[0].focus(), 0)
      }
    }
  }, [isOpen])

  // Trap focus within modal
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }

      if (e.key !== 'Tab' || !modalRef.current) return

      const focusableElements = modalRef.current.querySelectorAll(FOCUSABLE_SELECTOR)
      if (focusableElements.length === 0) return

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      // Shift+Tab on first element -> go to last
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault()
        lastElement.focus()
      }
      // Tab on last element -> go to first
      else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault()
        firstElement.focus()
      }
    },
    [onClose]
  )

  // Add keydown listener when modal is open
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, handleKeyDown])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center p-[var(--space-4)] max-md:p-0"
          style={{ zIndex: 'var(--z-modal)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? titleId.current : undefined}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-[var(--color-bg-backdrop)] backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Content */}
          <motion.div
            ref={modalRef}
            className={[
              'glass-card relative z-10 w-full overflow-hidden',
              SIZE_MAP[size] || SIZE_MAP.md,
              // Full-screen on mobile for md+ modals
              size !== 'sm' ? 'max-md:max-w-none max-md:h-full max-md:rounded-none' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            style={{
              boxShadow: 'var(--shadow-xl)',
            }}
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Header */}
            {title && (
              <div className="flex items-center justify-between border-b border-[var(--border-default)] px-[var(--space-6)] py-[var(--space-4)]">
                <h2
                  id={titleId.current}
                  className="text-[var(--text-lg)] font-[var(--font-semibold)] text-[var(--color-fg-default)]"
                >
                  {title}
                </h2>
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className={[
                      'rounded-[var(--radius-lg)] p-[var(--space-2)] text-[var(--color-fg-muted)]',
                      'transition-colors hover:bg-[var(--color-bg-glass-hover)] hover:text-[var(--color-fg-default)]',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--interactive-default)]',
                    ].join(' ')}
                    style={{
                      transitionDuration: 'var(--duration-fast)',
                    }}
                    aria-label="Close modal"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            )}

            {/* Body */}
            <div className="max-h-[calc(90vh-5rem)] overflow-y-auto px-[var(--space-6)] py-[var(--space-5)]">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
