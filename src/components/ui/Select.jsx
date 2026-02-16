import { forwardRef } from 'react'
import { ChevronDown, AlertCircle } from 'lucide-react'

const SIZES = {
  sm: 'h-[var(--size-input-sm)] px-[var(--space-3)] pr-[var(--space-8)] text-[var(--text-xs)]',
  md: 'h-[var(--size-input-md)] px-[var(--space-3)] pr-[var(--space-10)] text-[var(--text-sm)]',
  lg: 'h-[var(--size-input-lg)] px-[var(--space-4)] pr-[var(--space-12)] text-[var(--text-base)]',
}

const Select = forwardRef(function Select(
  {
    label,
    value,
    onChange,
    options = [],
    placeholder,
    disabled = false,
    className = '',
    size = 'md',
    error,
    helperText,
    ...rest
  },
  ref
) {
  const hasError = Boolean(error)

  return (
    <div className={['w-full', className].filter(Boolean).join(' ')}>
      {label && (
        <label className="mb-[var(--space-2)] block text-[var(--text-sm)] font-[var(--font-medium)] text-[var(--color-fg-muted)]">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={[
            'w-full appearance-none rounded-[var(--radius-md)] outline-none',
            'bg-[var(--color-input-bg)] border text-[var(--color-fg-default)]',
            'transition-all cursor-pointer',
            SIZES[size] || SIZES.md,
            // Border states
            hasError
              ? 'border-[var(--color-danger)] focus:border-[var(--color-danger)] focus:ring-2 focus:ring-[var(--color-danger-subtle)]'
              : 'border-[var(--color-input-border)] focus:border-[var(--color-border-emphasis)] focus:ring-2 focus:ring-[rgba(var(--interactive-rgb),0.15)]',
            // Focus background
            'focus:bg-[var(--color-input-bg-focus)]',
            // Disabled state
            disabled && 'cursor-not-allowed opacity-50',
            !value && 'text-[var(--color-input-placeholder)]',
          ]
            .filter(Boolean)
            .join(' ')}
          style={{
            transitionDuration: 'var(--duration-fast)',
            transitionTimingFunction: 'var(--ease-default)',
          }}
          aria-invalid={hasError || undefined}
          aria-describedby={helperText ? `${rest.id || 'select'}-helper` : undefined}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option
              key={opt.value}
              value={opt.value}
              className="bg-[var(--color-bg-subtle)] text-[var(--color-fg-default)]"
            >
              {opt.label}
            </option>
          ))}
        </select>

        {/* Icons */}
        <div className="pointer-events-none absolute right-[var(--space-3)] top-1/2 -translate-y-1/2 flex items-center gap-[var(--space-2)]">
          {hasError && <AlertCircle size={16} className="text-[var(--color-danger)]" />}
          <ChevronDown size={16} className="text-[var(--color-fg-subtle)]" />
        </div>
      </div>

      {(helperText || error) && (
        <p
          id={`${rest.id || 'select'}-helper`}
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

export default Select
