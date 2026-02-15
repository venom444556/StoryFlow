import { useState, useRef, useEffect, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Filter, X, ChevronDown, GitBranch, AlertCircle, ArrowDownRight, ArrowUpRight } from 'lucide-react'
import Badge from '../ui/Badge'
import { TYPE_HEX_COLORS, TYPE_ICONS, TYPE_COLORS } from './constants'

const CONNECTION_OPTIONS = [
  { value: 'has-deps', label: 'Has dependencies', icon: ArrowDownRight },
  { value: 'has-dependents', label: 'Has dependents', icon: ArrowUpRight },
  { value: 'orphans', label: 'Orphans (isolated)', icon: AlertCircle },
]

function CheckboxItem({ value, label, isSelected, onToggle, icon: Icon, iconColor }) {
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
          isSelected
            ? 'text-[var(--color-fg-default)]'
            : 'border-[var(--color-fg-muted)]',
        ].join(' ')}
        style={isSelected ? {
          borderColor: 'var(--accent-active, #8b5cf6)',
          backgroundColor: 'var(--accent-active, #8b5cf6)',
        } : undefined}
      >
        {isSelected && '\u2713'}
      </span>
      {Icon && (
        <div
          className="flex h-4 w-4 shrink-0 items-center justify-center rounded"
          style={iconColor ? { backgroundColor: `${iconColor}22` } : undefined}
        >
          <Icon size={12} style={iconColor ? { color: iconColor } : undefined} />
        </div>
      )}
      <span className="capitalize">{label}</span>
    </button>
  )
}

function RadioItem({ value, label, isSelected, onSelect, icon: Icon }) {
  return (
    <button
      onClick={() => onSelect(value)}
      className={[
        'flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors',
        isSelected
          ? 'bg-[var(--color-bg-glass-hover)] text-[var(--color-fg-default)]'
          : 'text-[var(--color-fg-default)] hover:bg-[var(--color-bg-glass)] hover:text-[var(--color-fg-default)]',
      ].join(' ')}
    >
      <span
        className={[
          'flex h-3.5 w-3.5 items-center justify-center rounded-full border',
          isSelected
            ? 'text-[var(--color-fg-default)]'
            : 'border-[var(--color-fg-muted)]',
        ].join(' ')}
        style={isSelected ? {
          borderColor: 'var(--accent-active, #8b5cf6)',
          backgroundColor: 'var(--accent-active, #8b5cf6)',
        } : undefined}
      >
        {isSelected && (
          <span className="block h-1.5 w-1.5 rounded-full bg-white" />
        )}
      </span>
      {Icon && <Icon size={13} className="shrink-0 text-[var(--color-fg-muted)]" />}
      {label}
    </button>
  )
}

function TypeDropdown({ types, selected, onChange }) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false)
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
        style={hasSelection ? {
          backgroundColor: 'rgba(var(--accent-active-rgb, 139, 92, 246), 0.15)',
          '--tw-ring-color': 'rgba(var(--accent-active-rgb, 139, 92, 246), 0.2)',
        } : undefined}
      >
        Type
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
            className="absolute left-0 top-full z-30 mt-1.5 min-w-[180px] overflow-hidden rounded-xl border border-[var(--color-border-emphasis)] bg-[var(--color-bg-inverse)] p-1 shadow-xl"
            style={{ isolation: 'isolate' }}
          >
            {types.map(({ value, label, icon, color }) => (
              <CheckboxItem
                key={value}
                value={value}
                label={label}
                icon={icon}
                iconColor={color}
                isSelected={selected.includes(value)}
                onToggle={toggle}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ConnectionDropdown({ selected, onChange }) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const hasSelection = !!selected

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
        style={hasSelection ? {
          backgroundColor: 'rgba(var(--accent-active-rgb, 139, 92, 246), 0.15)',
          '--tw-ring-color': 'rgba(var(--accent-active-rgb, 139, 92, 246), 0.2)',
        } : undefined}
      >
        Connections
        <ChevronDown size={12} className={isOpen ? 'rotate-180' : ''} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ duration: 0.12 }}
            className="absolute left-0 top-full z-30 mt-1.5 min-w-[200px] overflow-hidden rounded-xl border border-[var(--color-border-emphasis)] bg-[var(--color-bg-inverse)] p-1 shadow-xl"
            style={{ isolation: 'isolate' }}
          >
            {CONNECTION_OPTIONS.map((opt) => (
              <RadioItem
                key={opt.value}
                value={opt.value}
                label={opt.label}
                icon={opt.icon}
                isSelected={selected === opt.value}
                onSelect={(val) => {
                  onChange(selected === val ? null : val)
                  setIsOpen(false)
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const CONNECTION_LABELS = {
  'has-deps': 'Has dependencies',
  'has-dependents': 'Has dependents',
  orphans: 'Orphans',
}

export default function ArchitectureFilterBar({ components = [], filters, onFilterChange }) {
  const { types = [], connection = null } = filters

  // Build type options from components actually present
  const typeOptions = useMemo(() => {
    const present = new Set(components.map((c) => c.type))
    return [...present]
      .sort()
      .map((type) => ({
        value: type,
        label: type,
        icon: TYPE_ICONS[type] || null,
        color: TYPE_HEX_COLORS[type] || '#6b7280',
      }))
  }, [components])

  const activeCount = types.length + (connection ? 1 : 0)

  const clearAll = () => onFilterChange({ types: [], connection: null })

  return (
    <div className="relative z-40 flex flex-wrap items-center gap-2 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-glass)] px-3 py-2 backdrop-blur-sm">
      {/* Filter icon */}
      <div className="flex items-center gap-1.5 text-[var(--color-fg-muted)]">
        <Filter size={14} />
        <span className="text-xs font-medium">Filters</span>
      </div>

      <div className="h-4 w-px bg-[var(--color-bg-glass-hover)]" />

      {/* Type multi-select */}
      <TypeDropdown
        types={typeOptions}
        selected={types}
        onChange={(v) => onFilterChange({ ...filters, types: v })}
      />

      {/* Connection single-select */}
      <ConnectionDropdown
        selected={connection}
        onChange={(v) => onFilterChange({ ...filters, connection: v })}
      />

      <div className="flex-1" />

      {/* Active filter badges + clear */}
      {activeCount > 0 && (
        <>
          <div className="h-4 w-px bg-[var(--color-bg-glass-hover)]" />

          <div className="flex flex-wrap items-center gap-1">
            {types.map((t) => (
              <Badge
                key={`type-${t}`}
                variant={TYPE_COLORS[t] || 'default'}
                size="xs"
                removable
                onRemove={() =>
                  onFilterChange({ ...filters, types: types.filter((v) => v !== t) })
                }
              >
                {t}
              </Badge>
            ))}
            {connection && (
              <Badge
                variant="yellow"
                size="xs"
                removable
                onRemove={() => onFilterChange({ ...filters, connection: null })}
              >
                {CONNECTION_LABELS[connection] || connection}
              </Badge>
            )}
          </div>

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
