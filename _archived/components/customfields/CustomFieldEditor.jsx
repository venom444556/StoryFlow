import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Type,
  Hash,
  Calendar,
  CheckCircle,
  CheckSquare,
  Link,
  Mail,
} from 'lucide-react'
import Input from '../ui/Input'
import Select from '../ui/Select'
import Switch from '../ui/Switch'
import Button from '../ui/Button'
import TagInput from '../ui/TagInput'
import GlassCard from '../ui/GlassCard'
import { FIELD_TYPES, FIELD_TYPE_CONFIG, createFieldDefinition } from './fieldTypes'

const FIELD_TYPE_ICONS = {
  [FIELD_TYPES.TEXT]: Type,
  [FIELD_TYPES.NUMBER]: Hash,
  [FIELD_TYPES.SELECT]: ChevronDown,
  [FIELD_TYPES.MULTISELECT]: CheckSquare,
  [FIELD_TYPES.DATE]: Calendar,
  [FIELD_TYPES.CHECKBOX]: CheckCircle,
  [FIELD_TYPES.URL]: Link,
  [FIELD_TYPES.EMAIL]: Mail,
}

/**
 * CustomFieldEditor - UI for defining custom fields
 */
export default function CustomFieldEditor({
  fields = [],
  onChange,
  entityType = 'issue',
  className = '',
}) {
  const [expandedId, setExpandedId] = useState(null)
  const [isAdding, setIsAdding] = useState(false)

  const handleAddField = useCallback(
    (name, type) => {
      const newField = createFieldDefinition(name, type)
      onChange?.([...fields, newField])
      setExpandedId(newField.id)
      setIsAdding(false)
    },
    [fields, onChange]
  )

  const handleUpdateField = useCallback(
    (fieldId, updates) => {
      onChange?.(
        fields.map((f) => (f.id === fieldId ? { ...f, ...updates } : f))
      )
    },
    [fields, onChange]
  )

  const handleDeleteField = useCallback(
    (fieldId) => {
      onChange?.(fields.filter((f) => f.id !== fieldId))
      if (expandedId === fieldId) setExpandedId(null)
    },
    [fields, onChange, expandedId]
  )

  const handleMoveField = useCallback(
    (fieldId, direction) => {
      const index = fields.findIndex((f) => f.id === fieldId)
      if (index === -1) return

      const newIndex = index + direction
      if (newIndex < 0 || newIndex >= fields.length) return

      const newFields = [...fields]
      const [removed] = newFields.splice(index, 1)
      newFields.splice(newIndex, 0, removed)
      onChange?.(newFields)
    },
    [fields, onChange]
  )

  return (
    <div className={['space-y-3', className].filter(Boolean).join(' ')}>
      {/* Field list */}
      <AnimatePresence mode="popLayout">
        {fields.map((field, index) => (
          <FieldItem
            key={field.id}
            field={field}
            isExpanded={expandedId === field.id}
            onToggleExpand={() =>
              setExpandedId(expandedId === field.id ? null : field.id)
            }
            onUpdate={(updates) => handleUpdateField(field.id, updates)}
            onDelete={() => handleDeleteField(field.id)}
            onMoveUp={() => handleMoveField(field.id, -1)}
            onMoveDown={() => handleMoveField(field.id, 1)}
            canMoveUp={index > 0}
            canMoveDown={index < fields.length - 1}
          />
        ))}
      </AnimatePresence>

      {/* Add field */}
      {isAdding ? (
        <AddFieldForm onAdd={handleAddField} onCancel={() => setIsAdding(false)} />
      ) : (
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className={[
            'flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed',
            'border-[var(--color-border-default)] py-3 text-sm',
            'text-[var(--color-fg-muted)] transition-colors',
            'hover:border-[var(--interactive-default)] hover:text-[var(--interactive-default)]',
          ].join(' ')}
        >
          <Plus size={16} />
          Add Custom Field
        </button>
      )}

      {fields.length === 0 && !isAdding && (
        <p className="text-center text-sm text-[var(--color-fg-subtle)]">
          No custom fields defined for {entityType}s yet.
        </p>
      )}
    </div>
  )
}

/**
 * Individual field item with expand/collapse
 */
function FieldItem({
  field,
  isExpanded,
  onToggleExpand,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}) {
  const Icon = FIELD_TYPE_ICONS[field.type] || Type
  const config = FIELD_TYPE_CONFIG[field.type]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <GlassCard className="overflow-hidden">
        {/* Header */}
        <div
          className="flex cursor-pointer items-center gap-3 p-3"
          onClick={onToggleExpand}
        >
          <div className="flex items-center gap-1 text-[var(--color-fg-subtle)]">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onMoveUp()
              }}
              disabled={!canMoveUp}
              className="p-0.5 disabled:opacity-30"
            >
              <ChevronUp size={14} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onMoveDown()
              }}
              disabled={!canMoveDown}
              className="p-0.5 disabled:opacity-30"
            >
              <ChevronDown size={14} />
            </button>
          </div>

          <Icon size={16} className="text-[var(--color-fg-muted)]" />

          <div className="min-w-0 flex-1">
            <span className="font-medium text-[var(--color-fg-default)]">
              {field.name}
            </span>
            <span className="ml-2 text-xs text-[var(--color-fg-subtle)]">
              {config?.label || field.type}
            </span>
            {field.required && (
              <span className="ml-1 text-xs text-red-400">*</span>
            )}
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            className="rounded p-1 text-[var(--color-fg-subtle)] hover:bg-red-500/10 hover:text-red-400"
          >
            <Trash2 size={14} />
          </button>

          <ChevronDown
            size={16}
            className={[
              'text-[var(--color-fg-muted)] transition-transform',
              isExpanded && 'rotate-180',
            ].join(' ')}
          />
        </div>

        {/* Expanded content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="space-y-4 border-t border-[var(--color-border-muted)] p-4">
                {/* Name */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-[var(--color-fg-muted)]">
                    Field Name
                  </label>
                  <Input
                    value={field.name}
                    onChange={(e) => onUpdate({ name: e.target.value })}
                    placeholder="Field name"
                  />
                </div>

                {/* Type */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-[var(--color-fg-muted)]">
                    Field Type
                  </label>
                  <Select
                    value={field.type}
                    onChange={(e) => onUpdate({ type: e.target.value })}
                    options={Object.entries(FIELD_TYPE_CONFIG).map(([type, cfg]) => ({
                      value: type,
                      label: cfg.label,
                    }))}
                  />
                </div>

                {/* Options for select/multiselect */}
                {config?.hasOptions && (
                  <div>
                    <label className="mb-1 block text-xs font-medium text-[var(--color-fg-muted)]">
                      Options
                    </label>
                    <TagInput
                      tags={field.options || []}
                      onChange={(options) => onUpdate({ options })}
                      placeholder="Add option and press Enter..."
                    />
                  </div>
                )}

                {/* Description */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-[var(--color-fg-muted)]">
                    Description (optional)
                  </label>
                  <Input
                    value={field.description || ''}
                    onChange={(e) => onUpdate({ description: e.target.value })}
                    placeholder="Help text for this field"
                  />
                </div>

                {/* Required toggle */}
                <Switch
                  checked={field.required || false}
                  onChange={(required) => onUpdate({ required })}
                  label="Required"
                  description="Users must fill this field"
                  size="sm"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>
    </motion.div>
  )
}

/**
 * Form for adding a new field
 */
function AddFieldForm({ onAdd, onCancel }) {
  const [name, setName] = useState('')
  const [type, setType] = useState(FIELD_TYPES.TEXT)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (name.trim()) {
      onAdd(name.trim(), type)
    }
  }

  return (
    <GlassCard>
      <form onSubmit={handleSubmit} className="space-y-4 p-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--color-fg-muted)]">
              Field Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Customer Name"
              autoFocus
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--color-fg-muted)]">
              Field Type
            </label>
            <Select
              value={type}
              onChange={(e) => setType(e.target.value)}
              options={Object.entries(FIELD_TYPE_CONFIG).map(([t, cfg]) => ({
                value: t,
                label: cfg.label,
              }))}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={!name.trim()}>
            Add Field
          </Button>
        </div>
      </form>
    </GlassCard>
  )
}
