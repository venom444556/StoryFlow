import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Compass, Loader2 } from 'lucide-react'

const QUICK_ACTIONS = [
  'Focus on bug fixes',
  'Write documentation',
  'Plan the next sprint',
  'Review open issues',
]

export default function SteeringBar({ projectId }) {
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [lastSent, setLastSent] = useState(null)
  const inputRef = useRef(null)

  const handleSubmit = async () => {
    const trimmed = text.trim()
    if (!trimmed || sending) return

    setSending(true)
    try {
      const res = await fetch(`/api/projects/${encodeURIComponent(projectId)}/steer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: trimmed }),
      })
      if (res.ok) {
        setLastSent(trimmed)
        setText('')
        // Clear the confirmation after a few seconds
        setTimeout(() => setLastSent(null), 4000)
      }
    } catch {
      // Silently fail — steering is best-effort
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
  }

  const handleQuickAction = (action) => {
    setText(action)
    inputRef.current?.focus()
  }

  return (
    <div className="glass-card overflow-hidden p-0">
      {/* Quick action chips */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-[var(--color-border-default)] px-4 py-2">
        <Compass size={12} className="shrink-0 text-[var(--color-fg-faint)]" />
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action}
            onClick={() => handleQuickAction(action)}
            className="shrink-0 rounded-full border border-[var(--color-border-default)] px-2.5 py-1 text-[11px] text-[var(--color-fg-muted)] transition-colors hover:border-[var(--color-border-emphasis)] hover:text-[var(--color-fg-default)]"
          >
            {action}
          </button>
        ))}
      </div>

      {/* Input area */}
      <div className="flex items-end gap-2 px-4 py-3">
        <div className="min-w-0 flex-1">
          <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-[var(--color-fg-subtle)]">
            Steer the AI
          </label>
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tell the AI what to focus on next..."
            disabled={sending}
            className="w-full border-none bg-transparent text-sm text-[var(--color-fg-default)] placeholder-[var(--color-fg-muted)] outline-none disabled:opacity-50"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={!text.trim() || sending}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all disabled:pointer-events-none disabled:opacity-30"
          style={{
            backgroundColor: text.trim() ? 'rgba(var(--accent-default-rgb), 0.2)' : 'transparent',
            color: text.trim() ? 'var(--accent-default)' : 'var(--color-fg-muted)',
          }}
        >
          {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
        </button>
      </div>

      {/* Sent confirmation */}
      <AnimatePresence>
        {lastSent && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-[var(--color-border-default)]"
          >
            <div className="flex items-center gap-2 px-4 py-2 text-[11px] text-[var(--color-success)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-success)]" />
              Directive sent: &quot;{lastSent}&quot;
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
