import React, { forwardRef } from 'react'
import { AlertCircle, CheckCircle } from 'lucide-react'

const TextArea = forwardRef(function TextArea(
  {
    label,
    value,
    onChange,
    placeholder,
    disabled = false,
    rows = 4,
    className = '',
    error,
    success,
    helperText,
    resize = 'vertical',
    ...rest
  },
  ref
) {
  const hasError = Boolean(error)
  const hasSuccess = Boolean(success) && !hasError

  const resizeClass =
    {
      none: 'resize-none',
      vertical: 'resize-y',
      horizontal: 'resize-x',
      both: 'resize',
    }[resize] || 'resize-y'

  return (
    <div className={['w-full', className].filter(Boolean).join(' ')}>
      {label && (
        <label className="mb-[var(--space-2)] flex items-center gap-[var(--space-2)] text-[var(--text-sm)] font-[var(--font-medium)] text-[var(--color-fg-muted)]">
          {label}
          {hasError && <AlertCircle size={14} className="text-[var(--color-danger)]" />}
          {hasSuccess && <CheckCircle size={14} className="text-[var(--color-success)]" />}
        </label>
      )}
      <textarea
        ref={ref}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        className={[
          'w-full rounded-[var(--radius-md)] px-[var(--space-3)] py-[var(--space-2)] outline-none',
          'bg-[var(--color-input-bg)] border text-[var(--text-sm)] text-[var(--color-fg-default)] placeholder-[var(--color-input-placeholder)]',
          'transition-all',
          resizeClass,
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
        aria-describedby={helperText ? `${rest.id || 'textarea'}-helper` : undefined}
        {...rest}
      />
      {(helperText || error) && (
        <p
          id={`${rest.id || 'textarea'}-helper`}
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

export default TextArea
