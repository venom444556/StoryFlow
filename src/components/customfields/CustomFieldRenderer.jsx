import { useState, useCallback } from 'react'
import { format, parseISO } from 'date-fns'
import { ExternalLink, Mail, Check, X } from 'lucide-react'
import Input from '../ui/Input'
import Select from '../ui/Select'
import Switch from '../ui/Switch'
import DatePicker from '../ui/DatePicker'
import TagInput from '../ui/TagInput'
import { FIELD_TYPES, validateFieldValue } from './fieldTypes'

/**
 * CustomFieldRenderer - Renders a custom field for display or editing
 */
export default function CustomFieldRenderer({
  field,
  value,
  onChange,
  readOnly = false,
  compact = false,
  showLabel = true,
  className = '',
}) {
  const [error, setError] = useState(null)

  const handleChange = useCallback(
    (newValue) => {
      const validation = validateFieldValue(newValue, field.type, {
        required: field.required,
        choices: field.options,
      })

      if (!validation.valid) {
        setError(validation.error)
      } else {
        setError(null)
      }

      onChange?.(field.id, newValue)
    },
    [field, onChange]
  )

  // Read-only display
  if (readOnly) {
    return (
      <div className={['space-y-1', className].filter(Boolean).join(' ')}>
        {showLabel && (
          <label className="block text-xs font-medium text-[var(--color-fg-muted)]">
            {field.name}
          </label>
        )}
        <div className="text-sm text-[var(--color-fg-default)]">
          {renderReadOnlyValue(field, value)}
        </div>
      </div>
    )
  }

  // Editable field
  return (
    <div className={['space-y-1', className].filter(Boolean).join(' ')}>
      {showLabel && (
        <label className="block text-xs font-medium text-[var(--color-fg-muted)]">
          {field.name}
          {field.required && <span className="ml-0.5 text-red-400">*</span>}
        </label>
      )}

      {renderEditableField(field, value, handleChange, compact)}

      {error && <p className="text-xs text-[var(--color-danger)]">{error}</p>}
      {field.description && !error && (
        <p className="text-xs text-[var(--color-fg-subtle)]">{field.description}</p>
      )}
    </div>
  )
}

/**
 * Render read-only value display
 */
function renderReadOnlyValue(field, value) {
  if (value === null || value === undefined || value === '') {
    return <span className="text-[var(--color-fg-subtle)]">—</span>
  }

  switch (field.type) {
    case FIELD_TYPES.TEXT:
      return value

    case FIELD_TYPES.NUMBER:
      return typeof value === 'number' ? value.toLocaleString() : value

    case FIELD_TYPES.SELECT:
      return (
        <span className="inline-flex items-center rounded-full bg-[var(--color-bg-glass)] px-2 py-0.5 text-xs">
          {value}
        </span>
      )

    case FIELD_TYPES.MULTISELECT:
      if (!Array.isArray(value) || value.length === 0) {
        return <span className="text-[var(--color-fg-subtle)]">—</span>
      }
      return (
        <div className="flex flex-wrap gap-1">
          {value.map((v) => (
            <span
              key={v}
              className="inline-flex items-center rounded-full bg-[var(--color-bg-glass)] px-2 py-0.5 text-xs"
            >
              {v}
            </span>
          ))}
        </div>
      )

    case FIELD_TYPES.DATE:
      try {
        return format(parseISO(value), 'MMM d, yyyy')
      } catch {
        return value
      }

    case FIELD_TYPES.CHECKBOX:
      return value ? (
        <Check size={16} className="text-green-400" />
      ) : (
        <X size={16} className="text-[var(--color-fg-subtle)]" />
      )

    case FIELD_TYPES.URL:
      return (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[var(--interactive-default)] hover:underline"
        >
          {value.replace(/^https?:\/\//, '').slice(0, 30)}
          {value.length > 30 && '...'}
          <ExternalLink size={12} />
        </a>
      )

    case FIELD_TYPES.EMAIL:
      return (
        <a
          href={`mailto:${value}`}
          className="inline-flex items-center gap-1 text-[var(--interactive-default)] hover:underline"
        >
          <Mail size={12} />
          {value}
        </a>
      )

    default:
      return String(value)
  }
}

/**
 * Render editable field input
 */
function renderEditableField(field, value, onChange, compact) {
  const inputSize = compact ? 'sm' : 'md'

  switch (field.type) {
    case FIELD_TYPES.TEXT:
      return (
        <Input
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder || `Enter ${field.name.toLowerCase()}...`}
          size={inputSize}
        />
      )

    case FIELD_TYPES.NUMBER:
      return (
        <Input
          type="number"
          value={value ?? ''}
          onChange={(e) => {
            const val = e.target.value
            onChange(val === '' ? null : Number(val))
          }}
          placeholder={field.placeholder || '0'}
          size={inputSize}
        />
      )

    case FIELD_TYPES.SELECT:
      return (
        <Select
          value={value || ''}
          onChange={(e) => onChange(e.target.value || null)}
          options={[
            { value: '', label: 'Select...' },
            ...(field.options || []).map((opt) => ({ value: opt, label: opt })),
          ]}
        />
      )

    case FIELD_TYPES.MULTISELECT:
      return (
        <TagInput
          tags={value || []}
          onChange={onChange}
          suggestions={field.options || []}
          placeholder={field.placeholder || 'Add options...'}
        />
      )

    case FIELD_TYPES.DATE:
      return (
        <DatePicker
          value={value}
          onChange={onChange}
          placeholder={field.placeholder || 'Select date...'}
        />
      )

    case FIELD_TYPES.CHECKBOX:
      return (
        <Switch
          checked={Boolean(value)}
          onChange={onChange}
          size={compact ? 'sm' : 'md'}
        />
      )

    case FIELD_TYPES.URL:
      return (
        <Input
          type="url"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder || 'https://...'}
          size={inputSize}
        />
      )

    case FIELD_TYPES.EMAIL:
      return (
        <Input
          type="email"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder || 'email@example.com'}
          size={inputSize}
        />
      )

    default:
      return (
        <Input
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          size={inputSize}
        />
      )
  }
}

/**
 * Render a group of custom fields
 */
export function CustomFieldGroup({
  fields = [],
  values = {},
  onChange,
  readOnly = false,
  columns = 2,
  className = '',
}) {
  if (fields.length === 0) return null

  const handleFieldChange = useCallback(
    (fieldId, value) => {
      onChange?.({ ...values, [fieldId]: value })
    },
    [values, onChange]
  )

  return (
    <div
      className={[
        'grid gap-4',
        columns === 1 && 'grid-cols-1',
        columns === 2 && 'grid-cols-1 md:grid-cols-2',
        columns === 3 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {fields.map((field) => (
        <CustomFieldRenderer
          key={field.id}
          field={field}
          value={values[field.id]}
          onChange={handleFieldChange}
          readOnly={readOnly}
        />
      ))}
    </div>
  )
}
