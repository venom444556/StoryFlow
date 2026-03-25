import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Terminal, Loader2, Check, ChevronUp, ChevronDown } from 'lucide-react'

const QUICK_ACTIONS = [
  { label: 'Optimize Code', icon: '⚡' },
  { label: 'Find Bugs', icon: '🔍' },
  { label: 'Gen Docs', icon: '📝' },
  { label: 'Plan Sprint', icon: '📋' },
  { label: 'Review Issues', icon: '✅' },
]

function DirectiveMessage({ text, status }) {
  return (
    <div className="flex items-center gap-3 py-1.5 px-2 hover:bg-[var(--color-bg-subtle)] rounded transition-colors group">
      {status === 'sent' && <Check size={14} className="text-[var(--color-success)] shrink-0" />}
      {status === 'sending' && (
        <Loader2 size={14} className="animate-spin text-[var(--color-fg-muted)] shrink-0" />
      )}
      {status === 'error' && (
        <div className="h-2 w-2 rounded-full bg-[var(--color-danger)] shrink-0" />
      )}

      <p className="text-[13px] font-mono text-[var(--color-fg-muted)] group-hover:text-[var(--color-fg-default)] truncate">
        {text}
      </p>
    </div>
  )
}

export default function SteeringBar({ projectId }) {
  const [expanded, setExpanded] = useState(false)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [directives, setDirectives] = useState([])
  const inputRef = useRef(null)
  const scrollRef = useRef(null)

  // Scroll to bottom when new directive added
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [directives, expanded])

  const handleSubmit = async () => {
    const trimmed = text.trim()
    if (!trimmed || sending) return

    const id = Date.now()
    setDirectives((prev) => [...prev, { id, text: trimmed, status: 'sending' }])
    setText('')
    setSending(true)
    setExpanded(true)

    try {
      const res = await fetch(`/api/projects/${encodeURIComponent(projectId)}/steer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: trimmed }),
      })
      setDirectives((prev) =>
        prev.map((d) => (d.id === id ? { ...d, status: res.ok ? 'sent' : 'error' } : d))
      )
    } catch {
      setDirectives((prev) => prev.map((d) => (d.id === id ? { ...d, status: 'error' } : d)))
    } finally {
      setSending(false)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
    if (e.key === 'Escape') {
      inputRef.current?.blur()
      setExpanded(false)
    }
  }

  const handleQuickAction = (action) => {
    setText(action)
    inputRef.current?.focus()
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none flex justify-center pb-6 px-6">
      {/* The Steering Console */}
      <motion.div
        layout
        className="pointer-events-auto surface-critical w-full max-w-3xl flex flex-col overflow-hidden"
        style={{
          boxShadow: '0 12px 48px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)',
        }}
      >
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-b border-[var(--color-border-muted)] bg-[var(--color-bg-card)]"
            >
              <div className="p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-bold tracking-wider text-[var(--color-fg-faint)]">
                    Active Directives
                  </span>
                  <div className="flex gap-2">
                    {QUICK_ACTIONS.map((a) => (
                      <button
                        key={a.label}
                        onClick={() => handleQuickAction(a.label)}
                        className="text-[10px] px-2 py-1 rounded bg-[var(--color-bg-subtle)] text-[var(--color-fg-subtle)] hover:text-[var(--color-fg-default)] hover:bg-[var(--color-border-muted)] transition-colors border border-[var(--color-border-subtle)]"
                      >
                        {a.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div
                  ref={scrollRef}
                  className="max-h-[160px] overflow-y-auto pr-2 flex flex-col gap-1"
                >
                  {directives.length === 0 ? (
                    <p className="text-xs italic text-[var(--color-fg-faint)] py-2">
                      No directives issued bridging this runtime.
                    </p>
                  ) : (
                    directives.map((d) => <DirectiveMessage key={d.id} {...d} />)
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Bar */}
        <div className="flex items-center bg-[var(--color-bg-glass)] px-4 py-3 gap-3">
          <Terminal size={16} className="text-[var(--color-fg-muted)] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (directives.length > 0) setExpanded(true)
            }}
            placeholder="Issue operational directive to the Agent..."
            disabled={sending}
            className="flex-1 bg-transparent border-none text-[14px] text-[var(--color-fg-default)] placeholder-[var(--color-fg-faint)] focus:outline-none focus:ring-0 font-mono"
          />
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1.5 rounded text-[var(--color-fg-subtle)] hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-fg-default)] transition-colors"
              title="Toggle Log"
            >
              {expanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            </button>
            <button
              onClick={handleSubmit}
              disabled={!text.trim() || sending}
              className="flex items-center justify-center p-1.5 rounded bg-[var(--color-fg-subtle)] text-[var(--color-bg-default)] disabled:opacity-30 disabled:pointer-events-none hover:bg-[var(--color-fg-default)] transition-colors"
            >
              {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
