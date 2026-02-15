import { forwardRef } from 'react'

/**
 * FormField - Label + input/control + error wrapper
 */
const FormField = forwardRef(function FormField(
  {
    label,
    description,
    error,
    required,
    children,
    className = '',
    labelClassName = '',
    id,
  },
  ref
) {
  return (
    <div ref={ref} className={['space-y-1.5', className].filter(Boolean).join(' ')}>
      {label && (
        <label
          htmlFor={id}
          className={[
            'block text-sm font-medium text-[var(--color-fg-muted)]',
            labelClassName,
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {label}
          {required && <span className="ml-0.5 text-red-400">*</span>}
        </label>
      )}

      {description && (
        <p className="text-xs text-[var(--color-fg-subtle)]">{description}</p>
      )}

      {children}

      {error && (
        <p className="text-xs text-[var(--color-danger)]">{error}</p>
      )}
    </div>
  )
})

export default FormField
