import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Filter, X, ChevronDown, Search } from 'lucide-react'
import Badge from '../ui/Badge'
import { ISSUE_TYPES, PRIORITIES } from '../../utils/constants'
import { getLabelsByCategory, getLabel } from '../../utils/labelDefinitions'

const TYPE_OPTIONS = [
  { value: ISSUE_TYPES.EPIC, label: 'Epic', variant: 'purple' },
  { value: ISSUE_TYPES.STORY, label: 'Story', variant: 'green' },
  { value: ISSUE_TYPES.TASK, label: 'Task', variant: 'blue' },
  { value: ISSUE_TYPES.BUG, label: 'Bug', variant: 'red' },
  { value: ISSUE_TYPES.SUBTASK, label: 'Subtask', variant: 'gray' },
]

const PRIORITY_OPTIONS = [
  { value: PRIORITIES.CRITICAL, label: 'Critical', variant: 'red' },
  { value: PRIORITIES.HIGH, label: 'High', variant: 'yellow' },
  { value: PRIORITIES.MEDIUM, label: 'Medium', variant: 'blue' },
  { value: PRIORITIES.LOW, label: 'Low', variant: 'gray' },
]

const ASSIGNEE_OPTIONS = [
  { value: 'Claude', label: 'Claude' },
  { value: 'User', label: 'User' },
  { value: '__none__', label: 'Unassigned' },
]

// Checkbox item used in both flat and grouped dropdowns
function CheckboxItem({ value, label, isSelected, onToggle }) {
  return (
    <button
      onClick={() => onToggle(value)}
      className={[
        'flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors',
        isSelected
          ? 'bg-[var(--color-bg-glass-hover)] text-[var(--color-fg-default)]'
          : 'text-[var(--color-fg-default)] hover:bg-[var(--color-bg-glass)] hover:text-[var(--color-fg-default)]',
      ].join(' ')}
    >
      <span
        className={[
          'flex h-3.5 w-3.5 items-center justify-center rounded border text-[9px]',
          isSelected ? 'text-[var(--color-fg-default)]' : 'border-[var(--color-fg-muted)]',
        ].join(' ')}
        style={
          isSelected
            ? {
                borderColor: 'var(--accent-active, #8b5cf6)',
                backgroundColor: 'var(--accent-active, #8b5cf6)',
              }
            : undefined
        }
      >
        {isSelected && '\u2713'}
      </span>
      {label}
    </button>
  )
}

// Reusable multi-select dropdown (flat list)
function MultiSelectDropdown({ label, options, selected = [], onChange }) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const toggle = (value) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value))
    } else {
      onChange([...selected, value])
    }
  }

  const hasSelection = selected.length > 0

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen((p) => !p)}
        className={[
          'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors',
          hasSelection
            ? 'text-[var(--color-fg-default)] ring-1'
            : 'text-[var(--color-fg-muted)] hover:bg-[var(--color-bg-glass)] hover:text-[var(--color-fg-default)]',
        ].join(' ')}
        style={
          hasSelection
            ? {
                backgroundColor: 'rgba(var(--accent-active-rgb, 139, 92, 246), 0.15)',
                '--tw-ring-color': 'rgba(var(--accent-active-rgb, 139, 92, 246), 0.2)',
              }
            : undefined
        }
      >
        {label}
        {hasSelection && (
          <span
            className="flex h-4 w-4 items-center justify-center rounded-full text-[10px] text-[var(--color-fg-default)]"
            style={{ backgroundColor: 'rgba(var(--accent-active-rgb, 139, 92, 246), 0.3)' }}
          >
            {selected.length}
          </span>
        )}
        <ChevronDown size={12} className={isOpen ? 'rotate-180' : ''} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ duration: 0.12 }}
            className="absolute left-0 top-full z-30 mt-1.5 min-w-[160px] overflow-hidden rounded-xl border border-[var(--color-border-emphasis)] bg-[var(--color-bg-inverse)] p-1 shadow-xl"
            style={{ isolation: 'isolate' }}
          >
            {options.map((opt) => (
              <CheckboxItem
                key={opt.value}
                value={opt.value}
                label={opt.label}
                isSelected={selected.includes(opt.value)}
                onToggle={toggle}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Grouped multi-select dropdown (for labels with category headers)
function GroupedMultiSelectDropdown({ label, groups, selected = [], onChange }) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const toggle = (value) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value))
    } else {
      onChange([...selected, value])
    }
  }

  const hasSelection = selected.length > 0

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen((p) => !p)}
        className={[
          'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors',
          hasSelection
            ? 'text-[var(--color-fg-default)] ring-1'
            : 'text-[var(--color-fg-muted)] hover:bg-[var(--color-bg-glass)] hover:text-[var(--color-fg-default)]',
        ].join(' ')}
        style={
          hasSelection
            ? {
                backgroundColor: 'rgba(var(--accent-active-rgb, 139, 92, 246), 0.15)',
                '--tw-ring-color': 'rgba(var(--accent-active-rgb, 139, 92, 246), 0.2)',
              }
            : undefined
        }
      >
        {label}
        {hasSelection && (
          <span
            className="flex h-4 w-4 items-center justify-center rounded-full text-[10px] text-[var(--color-fg-default)]"
            style={{ backgroundColor: 'rgba(var(--accent-active-rgb, 139, 92, 246), 0.3)' }}
          >
            {selected.length}
          </span>
        )}
        <ChevronDown size={12} className={isOpen ? 'rotate-180' : ''} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ duration: 0.12 }}
            className="absolute left-0 top-full z-30 mt-1.5 max-h-[320px] min-w-[200px] overflow-y-auto rounded-xl border border-[var(--color-border-emphasis)] bg-[var(--color-bg-inverse)] p-1 shadow-xl"
            style={{ isolation: 'isolate' }}
          >
            {groups.map((group, gi) => (
              <div key={group.categoryKey}>
                {gi > 0 && <div className="mx-2 my-1 h-px bg-[var(--color-border-default)]" />}
                <div
                  className="px-2.5 pb-0.5 pt-1.5 text-[10px] font-semibold uppercase tracking-wider"
                  style={{ color: group.color }}
                >
                  {group.categoryName}
                </div>
                {group.labels.map((name) => (
                  <CheckboxItem
                    key={name}
                    value={name}
                    label={name}
                    isSelected={selected.includes(name)}
                    onToggle={toggle}
                  />
                ))}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function FilterBar({
  filters = {},
  onFilterChange,
  issueTypes = TYPE_OPTIONS,
  labels = [],
  epics: _epics = [],
}) {
  const { types = [], priorities = [], assignees = [], labelFilter = [], search = '' } = filters

  const handleChange = useCallback(
    (key, value) => {
      onFilterChange?.({ ...filters, [key]: value })
    },
    [filters, onFilterChange]
  )

  const activeCount =
    types.length + priorities.length + assignees.length + labelFilter.length + (search ? 1 : 0)

  const clearAll = () => {
    onFilterChange?.({
      types: [],
      priorities: [],
      assignees: [],
      labelFilter: [],
      search: '',
    })
  }

  // Build grouped label options from registry, filtered to only labels that exist in data
  const labelGroups = useMemo(() => {
    const dataLabels = new Set(labels)
    return getLabelsByCategory()
      .map((group) => ({
        ...group,
        labels: group.labels.filter((l) => dataLabels.has(l)),
      }))
      .filter((group) => group.labels.length > 0)
  }, [labels])

  const hasLabels = labelGroups.some((g) => g.labels.length > 0)

  return (
    <div className="relative z-40 flex flex-wrap items-center gap-2 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-glass)] px-3 py-2 backdrop-blur-sm">
      {/* Filter icon */}
      <div className="flex items-center gap-1.5 text-[var(--color-fg-muted)]">
        <Filter size={14} />
        <span className="text-xs font-medium">Filters</span>
      </div>

      <div className="h-4 w-px bg-[var(--color-bg-glass-hover)]" />

      {/* Type filter */}
      <MultiSelectDropdown
        label="Type"
        options={issueTypes}
        selected={types}
        onChange={(v) => handleChange('types', v)}
      />

      {/* Priority filter */}
      <MultiSelectDropdown
        label="Priority"
        options={PRIORITY_OPTIONS}
        selected={priorities}
        onChange={(v) => handleChange('priorities', v)}
      />

      {/* Assignee filter */}
      <MultiSelectDropdown
        label="Assignee"
        options={ASSIGNEE_OPTIONS}
        selected={assignees}
        onChange={(v) => handleChange('assignees', v)}
      />

      {/* Label filter (grouped by category) */}
      {hasLabels && (
        <GroupedMultiSelectDropdown
          label="Labels"
          groups={labelGroups}
          selected={labelFilter}
          onChange={(v) => handleChange('labelFilter', v)}
        />
      )}

      <div className="flex-1" />

      {/* Search */}
      <div className="relative">
        <Search
          size={13}
          className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-[var(--color-fg-muted)]"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => handleChange('search', e.target.value)}
          placeholder="Search..."
          className="glass-input w-40 rounded-lg py-1 pl-7 pr-2 text-xs text-[var(--color-fg-default)] placeholder-[var(--color-fg-muted)]"
        />
        {search && (
          <button
            onClick={() => handleChange('search', '')}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-[var(--color-fg-muted)] hover:text-[var(--color-fg-default)]"
          >
            <X size={10} />
          </button>
        )}
      </div>

      {/* Active filter badges + clear */}
      {activeCount > 0 && (
        <>
          <div className="h-4 w-px bg-[var(--color-bg-glass-hover)]" />

          {/* Show active filter badges */}
          <div className="flex flex-wrap items-center gap-1">
            {types.map((t) => (
              <Badge
                key={`type-${t}`}
                variant="purple"
                size="xs"
                removable
                onRemove={() =>
                  handleChange(
                    'types',
                    types.filter((v) => v !== t)
                  )
                }
              >
                {t}
              </Badge>
            ))}
            {priorities.map((p) => (
              <Badge
                key={`pri-${p}`}
                variant="yellow"
                size="xs"
                removable
                onRemove={() =>
                  handleChange(
                    'priorities',
                    priorities.filter((v) => v !== p)
                  )
                }
              >
                {p}
              </Badge>
            ))}
            {assignees.map((a) => (
              <Badge
                key={`asgn-${a}`}
                variant="blue"
                size="xs"
                removable
                onRemove={() =>
                  handleChange(
                    'assignees',
                    assignees.filter((v) => v !== a)
                  )
                }
              >
                {a === '__none__' ? 'Unassigned' : a}
              </Badge>
            ))}
            {labelFilter.map((l) => {
              const def = getLabel(l)
              return (
                <Badge
                  key={`lbl-${l}`}
                  variant="cyan"
                  size="xs"
                  removable
                  onRemove={() =>
                    handleChange(
                      'labelFilter',
                      labelFilter.filter((v) => v !== l)
                    )
                  }
                >
                  {def && (
                    <span
                      className="mr-1 inline-block h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: def.color }}
                    />
                  )}
                  {l}
                </Badge>
              )
            })}
          </div>

          {/* Clear all */}
          <button
            onClick={clearAll}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-[var(--color-fg-muted)] transition-colors hover:bg-[var(--color-bg-glass)] hover:text-[var(--color-fg-muted)]"
          >
            <X size={10} />
            Clear
          </button>
        </>
      )}
    </div>
  )
}
