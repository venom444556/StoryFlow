import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, MessageCircle, Loader2, X, Check, Compass } from 'lucide-react'

const QUICK_ACTIONS = [
  { label: 'Optimize Code', icon: '⚡' },
  { label: 'Find Bugs', icon: '🔍' },
  { label: 'Gen Docs', icon: '📝' },
  { label: 'Plan Sprint', icon: '📋' },
  { label: 'Review Issues', icon: '✅' },
]

function DirectiveMessage({ text, status }) {
  return (
    <div className="flex items-start gap-2 py-2">
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-medium leading-snug text-[var(--color-fg-default)]">
          {text}
        </p>
      </div>
      {status === 'sent' && (
        <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[var(--color-success)]/15">
          <Check size={10} className="text-[var(--color-success)]" />
        </div>
      )}
      {status === 'sending' && (
        <Loader2 size={12} className="mt-0.5 shrink-0 animate-spin text-[var(--color-fg-muted)]" />
      )}
    </div>
  )
}

export default function SteeringBar({ projectId }) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [directives, setDirectives] = useState([])
  const inputRef = useRef(null)
  const panelRef = useRef(null)
  const scrollRef = useRef(null)

  // Focus input when panel opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  // Scroll to bottom when new directive added
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [directives])

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
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
    if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  const handleQuickAction = (action) => {
    setText(action)
    inputRef.current?.focus()
  }

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-colors"
        style={{
          background: open ? 'var(--color-fg-muted)' : 'var(--accent-default)',
          color: 'white',
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title="Steer the AI"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X size={20} />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <MessageCircle size={20} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-20 right-6 z-50 w-[360px] overflow-hidden rounded-2xl"
            style={{
              background: 'var(--color-bg-card, var(--color-bg-glass))',
              border: '1px solid var(--color-border-default)',
              boxShadow: '0 8px 40px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.03)',
            }}
          >
            {/* Header */}
            <div className="border-b border-[var(--color-border-default)] px-4 py-3">
              <div className="flex items-center gap-2">
                <Compass size={14} className="text-[var(--accent-default)]" />
                <p className="text-sm font-medium text-[var(--color-fg-default)]">Steer the AI</p>
              </div>
              <p className="mt-0.5 text-[11px] text-[var(--color-fg-subtle)]">
                Tell the agent what to focus on next
              </p>
            </div>

            {/* Quick actions */}
            <div className="flex flex-wrap gap-1.5 border-b border-[var(--color-border-default)] px-4 py-2.5">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.label}
                  onClick={() => handleQuickAction(action.label)}
                  className="rounded-full px-2.5 py-1 text-[10px] font-medium text-[var(--color-fg-muted)] transition-all hover:text-[var(--color-fg-default)]"
                  style={{
                    backgroundColor: 'var(--color-bg-glass)',
                    border: '1px solid var(--color-border-default)',
                  }}
                >
                  <span className="mr-1">{action.icon}</span>
                  {action.label}
                </button>
              ))}
            </div>

            {/* Directive history */}
            <div ref={scrollRef} className="max-h-[200px] overflow-y-auto px-4">
              {directives.length === 0 ? (
                <div className="py-6 text-center">
                  <p className="text-xs text-[var(--color-fg-subtle)]">
                    No directives sent yet this session
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[var(--color-border-default)]">
                  {directives.map((d) => (
                    <DirectiveMessage key={d.id} text={d.text} status={d.status} />
                  ))}
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-[var(--color-border-default)] px-4 py-3">
              <div
                className="flex items-center gap-2 rounded-xl px-3 py-2"
                style={{
                  backgroundColor: 'var(--color-bg-glass)',
                  border: '1px solid var(--color-border-default)',
                }}
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Focus on..."
                  disabled={sending}
                  className="min-w-0 flex-1 border-none bg-transparent text-[13px] text-[var(--color-fg-default)] placeholder-[var(--color-fg-muted)] outline-none disabled:opacity-50"
                />
                <button
                  onClick={handleSubmit}
                  disabled={!text.trim() || sending}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-all disabled:pointer-events-none disabled:opacity-30"
                  style={{
                    backgroundColor: text.trim()
                      ? 'rgba(var(--accent-default-rgb), 0.2)'
                      : 'transparent',
                    color: text.trim() ? 'var(--accent-default)' : 'var(--color-fg-muted)',
                  }}
                >
                  {sending ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
