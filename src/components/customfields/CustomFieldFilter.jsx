import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Filter, X, Plus, ChevronDown } from 'lucide-react'
import Input from '../ui/Input'
import Select from '../ui/Select'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import { FIELD_TYPES, FIELD_TYPE_CONFIG } from './fieldTypes'

/**
 * Filter operators by field type
 */
const OPERATORS = {
  [FIELD_TYPES.TEXT]: [
    { value: 'contains', label: 'Contains' },
    { value: 'equals', label: 'Equals' },
    { value: 'startsWith', label: 'Starts with' },
    { value: 'endsWith', label: 'Ends with' },
    { value: 'isEmpty', label: 'Is empty' },
    { value: 'isNotEmpty', label: 'Is not empty' },
  ],
  [FIELD_TYPES.NUMBER]: [
    { value: 'equals', label: '=' },
    { value: 'notEquals', label: '!=' },
    { value: 'greaterThan', label: '>' },
    { value: 'lessThan', label: '<' },
    { value: 'greaterOrEqual', label: '>=' },
    { value: 'lessOrEqual', label: '<=' },
    { value: 'isEmpty', label: 'Is empty' },
  ],
  [FIELD_TYPES.SELECT]: [
    { value: 'equals', label: 'Is' },
    { value: 'notEquals', label: 'Is not' },
    { value: 'isEmpty', label: 'Is empty' },
  ],
  [FIELD_TYPES.MULTISELECT]: [
    { value: 'contains', label: 'Contains' },
    { value: 'notContains', label: 'Does not contain' },
    { value: 'isEmpty', label: 'Is empty' },
    { value: 'isNotEmpty', label: 'Is not empty' },
  ],
  [FIELD_TYPES.DATE]: [
    { value: 'equals', label: 'Is' },
    { value: 'before', label: 'Before' },
    { value: 'after', label: 'After' },
    { value: 'isEmpty', label: 'Is empty' },
  ],
  [FIELD_TYPES.CHECKBOX]: [
    { value: 'equals', label: 'Is' },
  ],
  [FIELD_TYPES.URL]: [
    { value: 'contains', label: 'Contains' },
    { value: 'isEmpty', label: 'Is empty' },
    { value: 'isNotEmpty', label: 'Is not empty' },
  ],
  [FIELD_TYPES.EMAIL]: [
    { value: 'contains', label: 'Contains' },
    { value: 'equals', label: 'Equals' },
    { value: 'isEmpty', label: 'Is empty' },
  ],
}

/**
 * CustomFieldFilter - Filter UI for custom fields
 */
export default function CustomFieldFilter({
  fields = [],
  filters = [],
  onChange,
  className = '',
}) {
  const [isAdding, setIsAdding] = useState(false)

  const handleAddFilter = useCallback(
    (filter) => {
      onChange?.([...filters, { ...filter, id: `filter-${Date.now()}` }])
      setIsAdding(false)
    },
    [filters, onChange]
  )

  const handleRemoveFilter = useCallback(
    (filterId) => {
      onChange?.(filters.filter((f) => f.id !== filterId))
    },
    [filters, onChange]
  )

  const handleUpdateFilter = useCallback(
    (filterId, updates) => {
      onChange?.(
        filters.map((f) => (f.id === filterId ? { ...f, ...updates } : f))
      )
    },
    [filters, onChange]
  )

  const handleClearAll = useCallback(() => {
    onChange?.([])
  }, [onChange])

  if (fields.length === 0) return null

  return (
    <div className={['space-y-2', className].filter(Boolean).join(' ')}>
      {/* Active filters */}
      {filters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <Filter size={14} className="text-[var(--color-fg-muted)]" />

          {filters.map((filter) => {
            const field = fields.find((f) => f.id === filter.fieldId)
            if (!field) return null

            return (
              <FilterBadge
                key={filter.id}
                filter={filter}
                field={field}
                onUpdate={(updates) => handleUpdateFilter(filter.id, updates)}
                onRemove={() => handleRemoveFilter(filter.id)}
              />
            )
          })}

          <button
            type="button"
            onClick={handleClearAll}
            className="text-xs text-[var(--color-fg-subtle)] hover:text-[var(--color-fg-muted)]"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Add filter */}
      {isAdding ? (
        <AddFilterForm
          fields={fields}
          onAdd={handleAddFilter}
          onCancel={() => setIsAdding(false)}
        />
      ) : (
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className={[
            'flex items-center gap-1 text-sm',
            'text-[var(--color-fg-muted)] hover:text-[var(--interactive-default)]',
          ].join(' ')}
        >
          <Plus size={14} />
          Add filter
        </button>
      )}
    </div>
  )
}

/**
 * Badge showing an active filter with edit capability
 */
function FilterBadge({ filter, field, onUpdate, onRemove }) {
  const [isEditing, setIsEditing] = useState(false)
  const operators = OPERATORS[field.type] || OPERATORS[FIELD_TYPES.TEXT]
  const operator = operators.find((op) => op.value === filter.operator)

  const displayValue = useMemo(() => {
    if (filter.operator === 'isEmpty' || filter.operator === 'isNotEmpty') {
      return ''
    }
    if (field.type === FIELD_TYPES.CHECKBOX) {
      return filter.value ? 'Yes' : 'No'
    }
    return filter.value
  }, [filter, field])

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsEditing(!isEditing)}
        className={[
          'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1',
          'bg-[var(--interactive-default)]/10 text-[var(--interactive-default)]',
          'text-xs font-medium transition-colors',
          'hover:bg-[var(--interactive-default)]/20',
        ].join(' ')}
      >
        <span>{field.name}</span>
        <span className="text-[var(--color-fg-muted)]">{operator?.label}</span>
        {displayValue && <span>"{displayValue}"</span>}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="ml-1 rounded-full p-0.5 hover:bg-[var(--color-bg-glass)]"
        >
          <X size={12} />
        </button>
      </button>

      {/* Inline edit popover */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className={[
              'absolute left-0 top-full z-50 mt-1',
              'rounded-lg border border-[var(--color-border-default)]',
              'bg-[var(--color-bg-glass)] backdrop-blur-xl shadow-lg',
              'p-3 min-w-[200px]',
            ].join(' ')}
          >
            <FilterValueEditor
              field={field}
              filter={filter}
              onUpdate={onUpdate}
              onClose={() => setIsEditing(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/**
 * Form for adding a new filter
 */
function AddFilterForm({ fields, onAdd, onCancel }) {
  const [fieldId, setFieldId] = useState('')
  const [operator, setOperator] = useState('')
  const [value, setValue] = useState('')

  const selectedField = fields.find((f) => f.id === fieldId)
  const operators = selectedField
    ? OPERATORS[selectedField.type] || OPERATORS[FIELD_TYPES.TEXT]
    : []

  const handleSubmit = (e) => {
    e.preventDefault()
    if (fieldId && operator) {
      onAdd({ fieldId, operator, value })
    }
  }

  const needsValue = operator && operator !== 'isEmpty' && operator !== 'isNotEmpty'

  return (
    <form
      onSubmit={handleSubmit}
      className={[
        'flex flex-wrap items-end gap-2 rounded-lg border',
        'border-[var(--color-border-default)] bg-[var(--color-bg-glass)] p-3',
      ].join(' ')}
    >
      {/* Field select */}
      <div className="min-w-[150px]">
        <label className="mb-1 block text-xs text-[var(--color-fg-muted)]">Field</label>
        <Select
          value={fieldId}
          onChange={(e) => {
            setFieldId(e.target.value)
            setOperator('')
            setValue('')
          }}
          options={[
            { value: '', label: 'Select field...' },
            ...fields.map((f) => ({ value: f.id, label: f.name })),
          ]}
        />
      </div>

      {/* Operator select */}
      {fieldId && (
        <div className="min-w-[120px]">
          <label className="mb-1 block text-xs text-[var(--color-fg-muted)]">Condition</label>
          <Select
            value={operator}
            onChange={(e) => setOperator(e.target.value)}
            options={[
              { value: '', label: 'Select...' },
              ...operators.map((op) => ({ value: op.value, label: op.label })),
            ]}
          />
        </div>
      )}

      {/* Value input */}
      {needsValue && selectedField && (
        <div className="min-w-[150px]">
          <label className="mb-1 block text-xs text-[var(--color-fg-muted)]">Value</label>
          {renderValueInput(selectedField, value, setValue)}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={!fieldId || !operator}>
          Apply
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

/**
 * Inline editor for filter value
 */
function FilterValueEditor({ field, filter, onUpdate, onClose }) {
  const [operator, setOperator] = useState(filter.operator)
  const [value, setValue] = useState(filter.value)
  const operators = OPERATORS[field.type] || OPERATORS[FIELD_TYPES.TEXT]

  const needsValue = operator && operator !== 'isEmpty' && operator !== 'isNotEmpty'

  const handleApply = () => {
    onUpdate({ operator, value: needsValue ? value : null })
    onClose()
  }

  return (
    <div className="space-y-3">
      <Select
        value={operator}
        onChange={(e) => setOperator(e.target.value)}
        options={operators.map((op) => ({ value: op.value, label: op.label }))}
      />

      {needsValue && renderValueInput(field, value, setValue)}

      <div className="flex justify-end gap-2">
        <Button size="sm" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button size="sm" onClick={handleApply}>
          Apply
        </Button>
      </div>
    </div>
  )
}

/**
 * Render appropriate value input for field type
 */
function renderValueInput(field, value, onChange) {
  switch (field.type) {
    case FIELD_TYPES.SELECT:
      return (
        <Select
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          options={[
            { value: '', label: 'Select...' },
            ...(field.options || []).map((opt) => ({ value: opt, label: opt })),
          ]}
        />
      )

    case FIELD_TYPES.CHECKBOX:
      return (
        <Select
          value={value === true ? 'true' : value === false ? 'false' : ''}
          onChange={(e) => onChange(e.target.value === 'true')}
          options={[
            { value: 'true', label: 'Yes' },
            { value: 'false', label: 'No' },
          ]}
        />
      )

    case FIELD_TYPES.NUMBER:
      return (
        <Input
          type="number"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
          placeholder="Value"
        />
      )

    case FIELD_TYPES.DATE:
      return (
        <Input
          type="date"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        />
      )

    default:
      return (
        <Input
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Value"
        />
      )
  }
}

/**
 * Apply filters to a list of items
 */
export function applyCustomFieldFilters(items, filters, fields, getValues) {
  if (!filters || filters.length === 0) return items

  return items.filter((item) => {
    const values = getValues(item)

    return filters.every((filter) => {
      const field = fields.find((f) => f.id === filter.fieldId)
      if (!field) return true

      const value = values[filter.fieldId]
      return evaluateFilter(value, filter.operator, filter.value, field)
    })
  })
}

/**
 * Evaluate a single filter condition
 */
function evaluateFilter(value, operator, filterValue, field) {
  // Handle empty checks
  if (operator === 'isEmpty') {
    return value === null || value === undefined || value === '' ||
           (Array.isArray(value) && value.length === 0)
  }
  if (operator === 'isNotEmpty') {
    return value !== null && value !== undefined && value !== '' &&
           (!Array.isArray(value) || value.length > 0)
  }

  // Handle null/undefined values
  if (value === null || value === undefined) return false

  switch (field.type) {
    case FIELD_TYPES.TEXT:
    case FIELD_TYPES.URL:
    case FIELD_TYPES.EMAIL:
      const strValue = String(value).toLowerCase()
      const strFilter = String(filterValue || '').toLowerCase()
      switch (operator) {
        case 'contains': return strValue.includes(strFilter)
        case 'equals': return strValue === strFilter
        case 'startsWith': return strValue.startsWith(strFilter)
        case 'endsWith': return strValue.endsWith(strFilter)
        default: return true
      }

    case FIELD_TYPES.NUMBER:
      const numValue = Number(value)
      const numFilter = Number(filterValue)
      switch (operator) {
        case 'equals': return numValue === numFilter
        case 'notEquals': return numValue !== numFilter
        case 'greaterThan': return numValue > numFilter
        case 'lessThan': return numValue < numFilter
        case 'greaterOrEqual': return numValue >= numFilter
        case 'lessOrEqual': return numValue <= numFilter
        default: return true
      }

    case FIELD_TYPES.SELECT:
      switch (operator) {
        case 'equals': return value === filterValue
        case 'notEquals': return value !== filterValue
        default: return true
      }

    case FIELD_TYPES.MULTISELECT:
      if (!Array.isArray(value)) return false
      switch (operator) {
        case 'contains': return value.includes(filterValue)
        case 'notContains': return !value.includes(filterValue)
        default: return true
      }

    case FIELD_TYPES.DATE:
      const dateValue = new Date(value)
      const dateFilter = new Date(filterValue)
      switch (operator) {
        case 'equals': return dateValue.toDateString() === dateFilter.toDateString()
        case 'before': return dateValue < dateFilter
        case 'after': return dateValue > dateFilter
        default: return true
      }

    case FIELD_TYPES.CHECKBOX:
      return value === filterValue

    default:
      return true
  }
}
