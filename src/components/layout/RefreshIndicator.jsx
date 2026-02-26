import { useState, useEffect, useCallback, useRef } from 'react'
import { RefreshCw, ChevronDown } from 'lucide-react'
import { useProjectsStore } from '../../stores/projectsStore'
import { reloadFromServer } from '../../stores/projectsStore'

const INTERVALS = [
  { label: 'Off', ms: 0 },
  { label: '5s', ms: 5_000 },
  { label: '10s', ms: 10_000 },
  { label: '30s', ms: 30_000 },
  { label: '1m', ms: 60_000 },
  { label: '5m', ms: 300_000 },
]

function formatRelative(iso) {
  if (!iso) return null
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 5) return 'just now'
  if (diff < 60) return `${diff}s ago`
  const mins = Math.floor(diff / 60)
  if (mins < 60) return `${mins}m ago`
  return `${Math.floor(mins / 60)}h ago`
}

export default function RefreshIndicator() {
  const lastRefreshed = useProjectsStore((s) => s.lastRefreshed)
  const interval = useProjectsStore((s) => s.autoRefreshInterval)
  const setInterval_ = useProjectsStore((s) => s.setAutoRefreshInterval)
  const [open, setOpen] = useState(false)
  const [relativeTime, setRelativeTime] = useState(() => formatRelative(lastRefreshed))
  const [spinning, setSpinning] = useState(false)
  const dropdownRef = useRef(null)

  // Tick the relative timestamp every second
  useEffect(() => {
    const id = window.setInterval(() => setRelativeTime(formatRelative(lastRefreshed)), 1000)
    return () => window.clearInterval(id)
  }, [lastRefreshed])

  // Close dropdown on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const handleRefresh = useCallback(() => {
    setSpinning(true)
    reloadFromServer()
    setTimeout(() => setSpinning(false), 600)
  }, [])

  const activeLabel = INTERVALS.find((i) => i.ms === interval)?.label || 'Off'

  const btnClasses = [
    'rounded-[var(--radius-lg)] p-[var(--space-2)]',
    'text-[var(--color-fg-muted)] transition-colors',
    'hover:bg-[var(--color-bg-glass-hover)] hover:text-[var(--color-fg-default)]',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--interactive-default)]',
  ].join(' ')

  return (
    <div className="relative flex items-center gap-[var(--space-1)]" ref={dropdownRef}>
      {/* Relative timestamp */}
      {relativeTime && (
        <span className="hidden text-[var(--text-xs)] text-[var(--color-fg-faint)] sm:inline">
          {relativeTime}
        </span>
      )}

      {/* Manual refresh button */}
      <button
        onClick={handleRefresh}
        aria-label="Refresh now"
        title="Refresh now"
        className={btnClasses}
        style={{ transitionDuration: 'var(--duration-fast)' }}
      >
        <RefreshCw
          size={16}
          className={spinning ? 'animate-spin' : ''}
          style={spinning ? { animationDuration: '0.6s' } : undefined}
        />
      </button>

      {/* Interval dropdown toggle */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Auto-refresh interval"
        title={`Auto-refresh: ${activeLabel}`}
        className={`${btnClasses} flex items-center gap-0.5 text-[var(--text-xs)]`}
        style={{ transitionDuration: 'var(--duration-fast)' }}
      >
        <span className="hidden sm:inline">{activeLabel}</span>
        <ChevronDown size={12} />
      </button>

      {/* Dropdown menu */}
      {open && (
        <div
          className={[
            'absolute right-0 top-full mt-[var(--space-1)]',
            'rounded-[var(--radius-lg)] border border-[var(--color-border-default)]',
            'bg-[var(--color-bg-surface)] shadow-lg',
            'py-[var(--space-1)] min-w-[80px]',
          ].join(' ')}
          style={{ zIndex: 'var(--z-dropdown)' }}
        >
          {INTERVALS.map(({ label, ms }) => (
            <button
              key={ms}
              onClick={() => {
                setInterval_(ms)
                setOpen(false)
              }}
              className={[
                'w-full px-[var(--space-3)] py-[var(--space-1)] text-left text-[var(--text-xs)]',
                'transition-colors hover:bg-[var(--color-bg-glass-hover)]',
                ms === interval
                  ? 'text-[var(--interactive-default)] font-[var(--font-medium)]'
                  : 'text-[var(--color-fg-muted)]',
              ].join(' ')}
              style={{ transitionDuration: 'var(--duration-fast)' }}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
