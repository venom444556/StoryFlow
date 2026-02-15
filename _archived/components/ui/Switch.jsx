import { forwardRef } from 'react'
import { motion } from 'framer-motion'

/**
 * Switch - Toggle boolean control
 */
const Switch = forwardRef(function Switch(
  { checked, onChange, disabled, size = 'md', label, description, className = '' },
  ref
) {
  const sizes = {
    sm: { track: 'h-4 w-7', thumb: 'h-3 w-3', translate: 'translate-x-3' },
    md: { track: 'h-5 w-9', thumb: 'h-4 w-4', translate: 'translate-x-4' },
    lg: { track: 'h-6 w-11', thumb: 'h-5 w-5', translate: 'translate-x-5' },
  }

  const sizeConfig = sizes[size] || sizes.md

  const handleChange = () => {
    if (!disabled) {
      onChange?.(!checked)
    }
  }

  return (
    <div
      ref={ref}
      className={['flex items-center gap-3', className].filter(Boolean).join(' ')}
    >
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={handleChange}
        className={[
          'relative inline-flex shrink-0 cursor-pointer items-center rounded-full',
          'border-2 border-transparent transition-colors duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--interactive-default)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-base)]',
          disabled && 'cursor-not-allowed opacity-50',
          checked
            ? 'bg-[var(--interactive-default)]'
            : 'bg-[var(--color-bg-glass)]',
          sizeConfig.track,
        ].join(' ')}
      >
        <motion.span
          layout
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className={[
            'pointer-events-none inline-block rounded-full bg-[var(--color-fg-default)] shadow-lg',
            checked ? sizeConfig.translate : 'translate-x-0',
            sizeConfig.thumb,
          ].join(' ')}
        />
      </button>

      {(label || description) && (
        <div className="min-w-0 flex-1">
          {label && (
            <span
              className={[
                'block text-sm font-medium',
                disabled
                  ? 'text-[var(--color-fg-muted)]'
                  : 'text-[var(--color-fg-default)]',
              ].join(' ')}
            >
              {label}
            </span>
          )}
          {description && (
            <span className="block text-xs text-[var(--color-fg-subtle)]">
              {description}
            </span>
          )}
        </div>
      )}
    </div>
  )
})

export default Switch
