import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send,
  Terminal,
  Loader2,
  Check,
  X,
  Zap,
  Search,
  Pencil,
  ClipboardList,
  CheckSquare,
} from 'lucide-react'

const QUICK_ACTIONS = [
  { label: 'Optimize Code', icon: Zap },
  { label: 'Find Bugs', icon: Search },
  { label: 'Gen Docs', icon: Pencil },
  { label: 'Plan Sprint', icon: ClipboardList },
  { label: 'Review Issues', icon: CheckSquare },
]

function DirectiveMessage({ text, status }) {
  return (
    <div className="flex items-start gap-2.5 py-2">
      <div className="mt-0.5 shrink-0">
        {status === 'sent' && <Check size={12} className="text-[var(--color-success)]" />}
        {status === 'sending' && (
          <Loader2 size={12} className="animate-spin text-[var(--color-fg-muted)]" />
        )}
        {status === 'error' && (
          <div className="mt-0.5 h-2 w-2 rounded-full bg-[var(--color-danger)]" />
        )}
      </div>
      <p className="text-[13px] leading-relaxed text-[var(--color-fg-default)]">{text}</p>
    </div>
  )
}

export default function SteeringBar({ projectId }) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [directives, setDirectives] = useState([])
  const inputRef = useRef(null)
  const scrollRef = useRef(null)
  const panelRef = useRef(null)

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [directives])

  // Focus input when panel opens
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100)
  }, [open])

  // Close on click outside
  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])

  const handleSubmit = async () => {
    const trimmed = text.trim()
    if (!trimmed || sending) return

    const id = Date.now()
    setDirectives((prev) => [...prev, { id, text: trimmed, status: 'sending' }])
    setText('')
    setSending(true)

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
  }

  return (
    <>
      {/* Floating trigger button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-5 right-5 z-50 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-accent-emphasis)] text-white shadow-lg shadow-black/30 transition-transform hover:scale-105 active:scale-95"
            title="Steer Agent"
          >
            <Terminal size={20} />
            {directives.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-danger)] text-[9px] font-bold text-white">
                {directives.length}
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-5 right-5 z-50 flex w-[400px] flex-col overflow-hidden rounded-2xl border border-[var(--color-border-default)] bg-[var(--color-bg-card)] shadow-2xl shadow-black/40"
            style={{ maxHeight: 'min(500px, calc(100vh - 120px))' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[var(--color-border-muted)] px-4 py-3">
              <div className="flex items-center gap-2">
                <Terminal size={15} className="text-[var(--color-accent-emphasis)]" />
                <span className="text-sm font-semibold text-[var(--color-fg-default)]">
                  Agent Steering
                </span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-1 text-[var(--color-fg-muted)] transition-colors hover:bg-[var(--color-bg-glass-hover)] hover:text-[var(--color-fg-default)]"
              >
                <X size={16} />
              </button>
            </div>

            {/* Messages area */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-4 py-2"
              style={{ minHeight: 120 }}
            >
              {directives.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <Terminal size={24} className="mb-2 text-[var(--color-fg-faint)]" />
                  <p className="text-xs text-[var(--color-fg-muted)]">
                    Issue directives to the StoryFlow agent.
                  </p>
                  <p className="mt-1 text-[10px] text-[var(--color-fg-faint)]">
                    Commands are queued for the agent to consume.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col divide-y divide-[var(--color-border-subtle)]">
                  {directives.map((d) => (
                    <DirectiveMessage key={d.id} {...d} />
                  ))}
                </div>
              )}
            </div>

            {/* Quick actions */}
            <div className="flex gap-1.5 overflow-x-auto border-t border-[var(--color-border-subtle)] px-4 py-2">
              {QUICK_ACTIONS.map((a) => {
                const Icon = a.icon
                return (
                  <button
                    key={a.label}
                    onClick={() => {
                      setText(a.label)
                      inputRef.current?.focus()
                    }}
                    className="flex shrink-0 items-center gap-1 rounded-lg border border-[var(--color-border-subtle)] px-2 py-1 text-[10px] text-[var(--color-fg-subtle)] transition-colors hover:border-[var(--color-border-emphasis)] hover:text-[var(--color-fg-default)]"
                  >
                    <Icon size={10} />
                    {a.label}
                  </button>
                )
              })}
            </div>

            {/* Input */}
            <div className="flex items-center gap-2 border-t border-[var(--color-border-default)] px-4 py-3">
              <input
                ref={inputRef}
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Steer the agent..."
                disabled={sending}
                className="flex-1 border-none bg-transparent text-sm text-[var(--color-fg-default)] placeholder-[var(--color-fg-faint)] focus:outline-none"
              />
              <button
                onClick={handleSubmit}
                disabled={!text.trim() || sending}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--color-accent-emphasis)] text-white transition-all disabled:opacity-30 disabled:pointer-events-none hover:opacity-90 active:scale-95"
              >
                {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
