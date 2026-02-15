import { useState, useRef, useEffect, useMemo } from 'react'
import { Download, Check } from 'lucide-react'
import Badge from '../ui/Badge'
import Button from '../ui/Button'

const STATUS_OPTIONS = [
  { value: 'planning', label: 'Planning', variant: 'blue' },
  { value: 'in-progress', label: 'In Progress', variant: 'yellow' },
  { value: 'completed', label: 'Completed', variant: 'green' },
  { value: 'archived', label: 'Archived', variant: 'gray' },
]

function StatusDropdown({ status, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const current = STATUS_OPTIONS.find((s) => s.value === status) || STATUS_OPTIONS[0]

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((prev) => !prev)}>
        <Badge variant={current.variant} dot size="sm">
          {current.label}
        </Badge>
      </button>

      {open && (
        <div className="glass-card absolute left-1/2 top-full z-30 mt-2 w-44 -translate-x-1/2 p-1">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                onChange(opt.value)
                setOpen(false)
              }}
              className={[
                'flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors',
                status === opt.value
                  ? 'bg-[var(--color-bg-glass-hover)] text-[var(--color-fg-default)]'
                  : 'text-[var(--color-fg-default)] hover:bg-[var(--color-bg-glass)] hover:text-[var(--color-fg-default)]',
              ].join(' ')}
            >
              <Badge variant={opt.variant} dot size="sm">
                {opt.label}
              </Badge>
              {status === opt.value && (
                <Check size={14} className="ml-auto" style={{ color: 'var(--accent-active, #8b5cf6)' }} />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function ProjectHeader({ project, onUpdate }) {
  const [editing, setEditing] = useState(false)
  const [nameValue, setNameValue] = useState(project?.name || '')
  const inputRef = useRef(null)

  // Compute "saved X ago" text
  const savedText = useMemo(() => {
    if (!project?.updatedAt) return ''
    const diff = Date.now() - new Date(project.updatedAt).getTime()
    const seconds = Math.floor(diff / 1000)
    if (seconds < 10) return 'Saved just now'
    if (seconds < 60) return `Saved ${seconds}s ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `Saved ${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    return `Saved ${hours}h ago`
  }, [project?.updatedAt])

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editing])

  useEffect(() => {
    setNameValue(project?.name || '')
  }, [project?.name])

  const commitName = () => {
    setEditing(false)
    const trimmed = nameValue.trim()
    if (trimmed && trimmed !== project?.name) {
      onUpdate({ name: trimmed })
    } else {
      setNameValue(project?.name || '')
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      commitName()
    }
    if (e.key === 'Escape') {
      setNameValue(project?.name || '')
      setEditing(false)
    }
  }

  if (!project) return null

  return (
    <div className="glass flex items-center justify-between gap-4 rounded-xl px-5 py-3">
      {/* Left - Project Name */}
      <div className="min-w-0 flex-1">
        {editing ? (
          <input
            ref={inputRef}
            value={nameValue}
            onChange={(e) => setNameValue(e.target.value)}
            onBlur={commitName}
            onKeyDown={handleKeyDown}
            className="w-full border-none bg-transparent text-lg font-semibold text-[var(--color-fg-default)] outline-none"
          />
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="truncate text-lg font-semibold text-[var(--color-fg-default)] transition-colors"
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-active, #8b5cf6)'}
            onMouseLeave={(e) => e.currentTarget.style.color = ''}
          >
            {project.name}
          </button>
        )}
      </div>

      {/* Center - Status */}
      <StatusDropdown
        status={project.status}
        onChange={(status) => onUpdate({ status })}
      />

      {/* Right - Saved indicator + export */}
      <div className="flex shrink-0 items-center gap-3">
        <span className="hidden text-xs text-[var(--color-fg-muted)] sm:inline">{savedText}</span>
        <Button variant="ghost" size="sm" icon={Download}>
          Export
        </Button>
      </div>
    </div>
  )
}
