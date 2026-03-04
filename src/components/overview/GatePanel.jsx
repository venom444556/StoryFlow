import { useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldAlert, Check, XCircle, MessageSquare, AlertTriangle } from 'lucide-react'
import GlassCard from '../ui/GlassCard'
import ProvenanceBadge from '../ui/ProvenanceBadge'
import { useEventStore, selectPendingGates, selectAiStatus } from '../../stores/eventStore'

function GateCard({ gate }) {
  const respondToEvent = useEventStore((s) => s.respondToEvent)
  const [showRejectInput, setShowRejectInput] = useState(false)
  const [rejectComment, setRejectComment] = useState('')

  const handleApprove = () => {
    respondToEvent(gate.id, 'approve')
  }

  const handleReject = () => {
    if (!showRejectInput) {
      setShowRejectInput(true)
      return
    }
    respondToEvent(gate.id, 'reject', rejectComment || undefined)
    setShowRejectInput(false)
    setRejectComment('')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-4"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-400/10">
          <ShieldAlert size={16} className="text-amber-400" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-[var(--color-fg-default)]">
            {gate.entity_title || gate.action || 'Approval required'}
          </p>
          {gate.reasoning && (
            <p className="mt-1 text-xs leading-relaxed text-[var(--color-fg-muted)]">
              {gate.reasoning}
            </p>
          )}
          <div className="mt-2 flex items-center gap-2">
            <ProvenanceBadge actor={gate.actor} confidence={gate.confidence} size="xs" />
            <span className="text-[10px] text-amber-400 font-medium">Awaiting approval</span>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={handleApprove}
              className="flex items-center gap-1.5 rounded-lg bg-[var(--color-success)]/15 px-3 py-1.5 text-xs font-medium text-[var(--color-success)] transition-colors hover:bg-[var(--color-success)]/25"
            >
              <Check size={12} /> Approve
            </button>
            <button
              onClick={handleReject}
              className="flex items-center gap-1.5 rounded-lg bg-[var(--color-danger)]/15 px-3 py-1.5 text-xs font-medium text-[var(--color-danger)] transition-colors hover:bg-[var(--color-danger)]/25"
            >
              <XCircle size={12} /> Reject
            </button>
          </div>

          <AnimatePresence>
            {showRejectInput && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="text"
                    value={rejectComment}
                    onChange={(e) => setRejectComment(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleReject()}
                    placeholder="Reason for rejection (optional)"
                    className="flex-1 rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-base)] px-3 py-1.5 text-xs text-[var(--color-fg-default)] placeholder-[var(--color-fg-muted)] outline-none focus:border-[var(--color-border-emphasis)]"
                    autoFocus
                  />
                  <button
                    onClick={() => {
                      setShowRejectInput(false)
                      setRejectComment('')
                    }}
                    className="text-[10px] text-[var(--color-fg-subtle)] hover:text-[var(--color-fg-muted)]"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}

function EscalationCard({ aiStatus, projectId }) {
  const [response, setResponse] = useState('')
  const [sending, setSending] = useState(false)

  const handleSend = async () => {
    const trimmed = response.trim()
    if (!trimmed || sending) return
    setSending(true)
    try {
      await fetch(`/api/projects/${encodeURIComponent(projectId)}/steer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: trimmed, priority: 'high', context: 'escalation_response' }),
      })
      setResponse('')
    } catch {
      // best-effort
    } finally {
      setSending(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-red-400/30 bg-red-400/5 p-4"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-400/10">
          <AlertTriangle size={16} className="text-red-400" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-red-400">AI Blocked — Needs Your Input</p>
          {aiStatus.detail && (
            <p className="mt-1 text-xs leading-relaxed text-[var(--color-fg-muted)]">
              {aiStatus.detail}
            </p>
          )}
          <div className="mt-3 flex items-center gap-2">
            <input
              type="text"
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Respond to the agent..."
              disabled={sending}
              className="flex-1 rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-base)] px-3 py-1.5 text-xs text-[var(--color-fg-default)] placeholder-[var(--color-fg-muted)] outline-none focus:border-red-400/50 disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={!response.trim() || sending}
              className="flex items-center gap-1 rounded-lg bg-red-400/15 px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-400/25 disabled:opacity-30"
            >
              <MessageSquare size={12} /> Send
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function GatePanel({ projectId }) {
  const pendingGates = useEventStore(useShallow(selectPendingGates))
  const aiStatus = useEventStore(useShallow(selectAiStatus))
  const isBlocked = aiStatus.status === 'blocked'

  if (pendingGates.length === 0 && !isBlocked) return null

  return (
    <GlassCard className="border border-amber-400/10">
      <div className="mb-3 flex items-center gap-2">
        <ShieldAlert size={14} className="text-amber-400" />
        <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400">
          Action Required
        </h3>
        {pendingGates.length > 0 && (
          <span className="rounded-full bg-amber-400/15 px-2 py-0.5 text-[10px] font-medium text-amber-400">
            {pendingGates.length}
          </span>
        )}
      </div>

      <div className="space-y-3">
        {isBlocked && <EscalationCard aiStatus={aiStatus} projectId={projectId} />}
        <AnimatePresence>
          {pendingGates.map((gate) => (
            <GateCard key={gate.id} gate={gate} />
          ))}
        </AnimatePresence>
      </div>
    </GlassCard>
  )
}
