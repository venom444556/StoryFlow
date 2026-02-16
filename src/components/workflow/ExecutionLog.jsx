import React, { useEffect, useRef } from 'react'
import { Trash2, Clock, Terminal } from 'lucide-react'

// ---------------------------------------------------------------------------
// Level styles
// ---------------------------------------------------------------------------
const LEVEL_STYLES = {
  info: 'bg-[var(--color-bg-glass)] text-[var(--color-fg-default)]',
  success: 'bg-green-500/10 text-green-300',
  warning: 'bg-yellow-500/10 text-yellow-300',
  error: 'bg-red-500/10 text-red-300',
}

const LEVEL_DOT = {
  info: 'bg-[var(--color-bg-emphasis)]',
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  error: 'bg-red-500',
}

// ---------------------------------------------------------------------------
// ExecutionLog
// ---------------------------------------------------------------------------

/**
 * Panel that displays real-time workflow execution log entries.
 *
 * Props:
 * - logs     {Array<{ timestamp:string, message:string, level:string }>}
 * - onClear  {function}  callback to clear all log entries
 */
export default function ExecutionLog({ logs = [], onClear }) {
  const scrollRef = useRef(null)

  // Auto-scroll to the latest entry when new logs arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [logs.length])

  return (
    <div
      className="flex h-full flex-col border-l border-[var(--color-border-default)] backdrop-blur-2xl"
      style={{ backgroundColor: 'var(--th-panel)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--color-border-default)] px-4 py-3">
        <div className="flex items-center gap-2">
          <Terminal size={14} className="text-[var(--color-fg-muted)]" />
          <h3 className="text-sm font-semibold text-[var(--color-fg-default)]">Execution Log</h3>
          {logs.length > 0 && (
            <span className="rounded-full bg-[var(--color-bg-glass)] px-2 py-0.5 text-[10px] text-[var(--color-fg-muted)]">
              {logs.length}
            </span>
          )}
        </div>
        {logs.length > 0 && (
          <button
            onClick={onClear}
            className="rounded-md p-1 text-[var(--color-fg-muted)] transition-colors hover:bg-[var(--color-bg-glass-hover)] hover:text-[var(--color-fg-default)]"
            title="Clear log"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {/* Log entries */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 font-mono text-xs">
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-12 text-[var(--color-fg-subtle)]">
            <Clock size={28} className="mb-2 opacity-40" />
            <p className="text-center text-xs">No execution logs yet.</p>
            <p className="text-center text-[10px] text-[var(--color-fg-faint)]">
              Click Execute to run the workflow.
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {logs.map((log, idx) => (
              <div
                key={idx}
                className={[
                  'flex items-start gap-2 rounded-md px-2.5 py-1.5',
                  LEVEL_STYLES[log.level] || LEVEL_STYLES.info,
                ].join(' ')}
              >
                {/* Level indicator dot */}
                <span
                  className={[
                    'mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full',
                    LEVEL_DOT[log.level] || LEVEL_DOT.info,
                  ].join(' ')}
                />

                <div className="min-w-0 flex-1">
                  <span className="mr-2 text-[10px] text-[var(--color-fg-subtle)]">
                    {log.timestamp}
                  </span>
                  <span className="break-words">{log.message}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
