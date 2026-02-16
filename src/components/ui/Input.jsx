import React, { forwardRef } from 'react'
import { AlertCircle, CheckCircle } from 'lucide-react'

const SIZES = {
  sm: 'h-[var(--size-input-sm)] px-[var(--space-3)] text-[var(--text-xs)]',
  md: 'h-[var(--size-input-md)] px-[var(--space-3)] text-[var(--text-sm)]',
  lg: 'h-[var(--size-input-lg)] px-[var(--space-4)] text-[var(--text-base)]',
}

const Input = forwardRef(function Input(
  {
    label,
    value,
    onChange,
    placeholder,
    disabled = false,
    className = '',
    type = 'text',
    icon: Icon,
    size = 'md',
    error,
    success,
    helperText,
    ...rest
  },
  ref
) {
  const hasError = Boolean(error)
  const hasSuccess = Boolean(success) && !hasError
  const showIcon = Icon || hasError || hasSuccess

  // Determine which icon to show (status icons override custom icon)
  const StatusIcon = hasError ? AlertCircle : hasSuccess ? CheckCircle : Icon
  const iconColorClass = hasError
    ? 'text-[var(--color-danger)]'
    : hasSuccess
      ? 'text-[var(--color-success)]'
      : 'text-[var(--color-fg-subtle)]'

  return (
    <div className={['w-full', className].filter(Boolean).join(' ')}>
      {label && (
        <label className="mb-[var(--space-2)] block text-[var(--text-sm)] font-[var(--font-medium)] text-[var(--color-fg-muted)]">
          {label}
        </label>
      )}
      <div className="relative">
        {showIcon && (
          <StatusIcon
            size={16}
            className={[
              'pointer-events-none absolute left-[var(--space-3)] top-1/2 -translate-y-1/2',
              iconColorClass,
            ].join(' ')}
          />
        )}
        <input
          ref={ref}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={[
            'w-full rounded-[var(--radius-md)] outline-none',
            'bg-[var(--color-input-bg)] border text-[var(--color-fg-default)] placeholder-[var(--color-input-placeholder)]',
            'transition-all',
            SIZES[size] || SIZES.md,
            showIcon && 'pl-[var(--space-10)]',
            // Border states
            hasError
              ? 'border-[var(--color-danger)] focus:border-[var(--color-danger)] focus:ring-2 focus:ring-[var(--color-danger-subtle)]'
              : hasSuccess
                ? 'border-[var(--color-success)] focus:border-[var(--color-success)] focus:ring-2 focus:ring-[var(--color-success-subtle)]'
                : 'border-[var(--color-input-border)] focus:border-[var(--color-border-emphasis)] focus:ring-2 focus:ring-[rgba(var(--interactive-rgb),0.15)]',
            // Focus background
            'focus:bg-[var(--color-input-bg-focus)]',
            // Disabled state
            disabled && 'cursor-not-allowed opacity-50',
          ]
            .filter(Boolean)
            .join(' ')}
          style={{
            transitionDuration: 'var(--duration-fast)',
            transitionTimingFunction: 'var(--ease-default)',
          }}
          aria-invalid={hasError || undefined}
          aria-describedby={helperText ? `${rest.id || 'input'}-helper` : undefined}
          {...rest}
        />
      </div>
      {(helperText || error) && (
        <p
          id={`${rest.id || 'input'}-helper`}
          className={[
            'mt-[var(--space-2)] text-[var(--text-xs)]',
            hasError ? 'text-[var(--color-danger)]' : 'text-[var(--color-fg-subtle)]',
          ].join(' ')}
        >
          {error || helperText}
        </p>
      )}
    </div>
  )
})

export default Input
