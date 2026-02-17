import { useState, useRef, useEffect } from 'react'
import { Plus, ChevronDown } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import IssueTypeIcon from './IssueTypeIcon'
import { ISSUE_TYPES } from '../../utils/constants'

const TYPE_OPTIONS = [
  { value: ISSUE_TYPES.TASK, label: 'Task' },
  { value: ISSUE_TYPES.STORY, label: 'Story' },
  { value: ISSUE_TYPES.BUG, label: 'Bug' },
  { value: ISSUE_TYPES.EPIC, label: 'Epic' },
  { value: ISSUE_TYPES.SUBTASK, label: 'Subtask' },
]

const STATUS_DOT = {
  'To Do': 'bg-[var(--color-fg-faint)]',
  'In Progress': 'bg-blue-400',
  Done: 'bg-green-400',
}

export default function QuickCreateBar({ onCreateIssue, defaultStatus = 'To Do', statusColumns }) {
  const [title, setTitle] = useState('')
  const [type, setType] = useState(ISSUE_TYPES.TASK)
  const [status, setStatus] = useState(defaultStatus)
  const [showTypeMenu, setShowTypeMenu] = useState(false)
  const [showStatusMenu, setShowStatusMenu] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [showError, setShowError] = useState(false)
  const inputRef = useRef(null)
  const typeMenuRef = useRef(null)
  const statusMenuRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (typeMenuRef.current && !typeMenuRef.current.contains(e.target)) {
        setShowTypeMenu(false)
      }
      if (statusMenuRef.current && !statusMenuRef.current.contains(e.target)) {
        setShowStatusMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSubmit = () => {
    const trimmed = title.trim()
    if (!trimmed) {
      setShowError(true)
      inputRef.current?.focus()
      return
    }
    setShowError(false)

    onCreateIssue({
      title: trimmed,
      type,
      status,
      priority: 'medium',
      description: '',
      storyPoints: null,
      epicId: null,
      sprintId: null,
      assignee: null,
      labels: [],
      subtasks: [],
      comments: [],
      dependencies: [],
    })

    setTitle('')
    setType(ISSUE_TYPES.TASK)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    }
    if (e.key === 'Escape') {
      setTitle('')
      setShowError(false)
      inputRef.current?.blur()
    }
  }

  const dotColor = STATUS_DOT[status] || 'bg-[var(--color-fg-faint)]'

  return (
    <div
      className={[
        'flex items-center gap-1.5 rounded-lg border px-2 py-1 transition-all duration-200',
        isFocused
          ? 'bg-[var(--color-bg-glass)]'
          : 'border-[var(--color-border-default)] bg-[var(--color-bg-glass)] hover:border-[var(--color-bg-glass-hover)] hover:bg-[var(--color-bg-glass)]',
      ].join(' ')}
      style={
        showError
          ? {
              borderColor: 'rgba(239, 68, 68, 0.5)',
              boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.1)',
            }
          : isFocused
            ? {
                borderColor: 'rgba(var(--accent-active-rgb, 139, 92, 246), 0.4)',
                boxShadow: '0 0 0 3px rgba(var(--accent-active-rgb, 139, 92, 246), 0.1)',
              }
            : undefined
      }
    >
      {/* Type selector */}
      <div ref={typeMenuRef} className="relative">
        <button
          type="button"
          onClick={() => {
            setShowTypeMenu((p) => !p)
            setShowStatusMenu(false)
          }}
          className="flex items-center gap-0.5 rounded p-0.5 text-[var(--color-fg-muted)] transition-colors hover:bg-[var(--color-bg-glass-hover)] hover:text-[var(--color-fg-default)]"
        >
          <IssueTypeIcon type={type} size={14} />
          <ChevronDown size={10} className="opacity-60" />
        </button>

        <AnimatePresence>
          {showTypeMenu && (
            <motion.div
              className="glass-card absolute left-0 bottom-full z-30 mb-1 min-w-[140px] overflow-hidden p-1"
              initial={{ opacity: 0, scale: 0.95, y: 4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 4 }}
              transition={{ duration: 0.12 }}
            >
              {TYPE_OPTIONS.map((opt) => (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => {
                    setType(opt.value)
                    setShowTypeMenu(false)
                    inputRef.current?.focus()
                  }}
                  className={[
                    'flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors',
                    opt.value === type
                      ? 'bg-[var(--color-bg-glass-hover)] text-[var(--color-fg-default)]'
                      : 'text-[var(--color-fg-muted)] hover:bg-[var(--color-bg-glass-hover)] hover:text-[var(--color-fg-default)]',
                  ].join(' ')}
                >
                  <IssueTypeIcon type={opt.value} size={14} />
                  {opt.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Status selector (only when statusColumns provided) */}
      {statusColumns && statusColumns.length > 0 && (
        <>
          <div className="h-3.5 w-px bg-[var(--color-border-default)]" />
          <div ref={statusMenuRef} className="relative">
            <button
              type="button"
              onClick={() => {
                setShowStatusMenu((p) => !p)
                setShowTypeMenu(false)
              }}
              className="flex items-center gap-1.5 rounded px-1.5 py-0.5 text-xs text-[var(--color-fg-muted)] transition-colors hover:bg-[var(--color-bg-glass-hover)] hover:text-[var(--color-fg-default)]"
            >
              <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
              {status}
              <ChevronDown size={10} className="opacity-60" />
            </button>

            <AnimatePresence>
              {showStatusMenu && (
                <motion.div
                  className="glass-card absolute left-0 bottom-full z-30 mb-1 min-w-[140px] overflow-hidden p-1"
                  initial={{ opacity: 0, scale: 0.95, y: 4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 4 }}
                  transition={{ duration: 0.12 }}
                >
                  {statusColumns.map((col) => (
                    <button
                      type="button"
                      key={col}
                      onClick={() => {
                        setStatus(col)
                        setShowStatusMenu(false)
                        inputRef.current?.focus()
                      }}
                      className={[
                        'flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors',
                        col === status
                          ? 'bg-[var(--color-bg-glass-hover)] text-[var(--color-fg-default)]'
                          : 'text-[var(--color-fg-muted)] hover:bg-[var(--color-bg-glass-hover)] hover:text-[var(--color-fg-default)]',
                      ].join(' ')}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${STATUS_DOT[col] || 'bg-[var(--color-fg-faint)]'}`}
                      />
                      {col}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </>
      )}

      <div className="h-3.5 w-px bg-[var(--color-border-default)]" />

      {/* Title input */}
      <input
        ref={inputRef}
        type="text"
        value={title}
        onChange={(e) => {
          setTitle(e.target.value)
          if (showError && e.target.value.trim()) setShowError(false)
        }}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={showError ? 'Title is required' : 'Create issue...'}
        aria-invalid={showError || undefined}
        aria-label="Issue title"
        className="min-w-0 flex-1 border-none bg-transparent py-0.5 text-sm text-[var(--color-fg-default)] placeholder-[var(--color-fg-muted)] outline-none"
      />

      {/* Submit button */}
      {title.trim() && (
        <motion.button
          type="button"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={handleSubmit}
          className="flex h-5 w-5 items-center justify-center rounded transition-colors"
          style={{
            backgroundColor: 'rgba(var(--accent-active-rgb, 139, 92, 246), 0.2)',
            color: 'var(--accent-active, #8b5cf6)',
          }}
        >
          <Plus size={12} />
        </motion.button>
      )}
    </div>
  )
}
