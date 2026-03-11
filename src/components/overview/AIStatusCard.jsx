import { Bot, Wifi, WifiOff, ShieldAlert } from 'lucide-react'
import { motion } from 'framer-motion'
import {
  useEventStore,
  selectAiStatus,
  selectConnected,
  selectGateCount,
} from '../../stores/eventStore'

const STATUS_CONFIG = {
  working: {
    label: 'Working',
    color: 'var(--color-ai-working)',
    pulse: true,
    ringClass: 'ring-[var(--color-ai-working)]/20',
  },
  idle: {
    label: 'Idle',
    color: 'var(--color-ai-idle)',
    pulse: false,
    ringClass: 'ring-[var(--color-ai-idle)]/10',
  },
  blocked: {
    label: 'Needs Input',
    color: 'var(--color-ai-blocked)',
    pulse: true,
    ringClass: 'ring-[var(--color-ai-blocked)]/20',
  },
}

export default function AIStatusCard() {
  const aiStatus = useEventStore(selectAiStatus)
  const connected = useEventStore(selectConnected)
  const gateCount = useEventStore(selectGateCount)
  const config = STATUS_CONFIG[aiStatus.status] || STATUS_CONFIG.idle

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-6"
      style={{
        background: 'var(--color-bg-glass)',
        border: '1px solid var(--color-border-default)',
      }}
    >
      {/* Background glow when AI is working */}
      {aiStatus.status === 'working' && (
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: `radial-gradient(ellipse at 20% 50%, var(--color-ai-accent), transparent 60%)`,
          }}
        />
      )}

      {/* Top gradient accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{
          background: `linear-gradient(to right, var(--accent-cyan), var(--accent-blue), transparent)`,
          opacity: 0.5,
        }}
      />

      <div className="relative flex items-center gap-5">
        {/* AI avatar — larger */}
        <div className="relative shrink-0">
          <motion.div
            className={[
              'flex h-14 w-14 items-center justify-center rounded-2xl',
              'bg-[var(--color-ai-bg)] ring-2',
              config.ringClass,
            ].join(' ')}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <Bot size={28} className="text-[var(--color-ai-accent)]" />
          </motion.div>
          <motion.span
            className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-[var(--color-bg-base)]"
            style={{ backgroundColor: config.color }}
            animate={config.pulse ? { scale: [1, 1.3, 1] } : {}}
            transition={config.pulse ? { repeat: Infinity, duration: 2 } : {}}
          />
        </div>

        {/* Status info — more spacious */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-fg-default)]">
              AI Agent
            </h3>
            <span
              className="rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider"
              style={{
                backgroundColor: `color-mix(in srgb, ${config.color} 15%, transparent)`,
                color: config.color,
              }}
            >
              {config.label}
            </span>
            {gateCount > 0 && (
              <span className="flex items-center gap-1.5 rounded-full bg-amber-400/15 px-2.5 py-1 text-[11px] font-medium text-amber-400">
                <ShieldAlert size={12} />
                {gateCount} pending
              </span>
            )}
          </div>

          {aiStatus.detail ? (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[var(--color-fg-muted)]">
              {aiStatus.detail}
            </p>
          ) : (
            <p className="mt-2 flex items-center gap-2 text-sm text-[var(--color-fg-subtle)]">
              {aiStatus.status === 'working' && (
                <span className="flex items-center gap-2 text-[var(--color-success)]">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--color-success)]" />
                  AI Active
                </span>
              )}
              {aiStatus.status === 'idle' &&
                'Waiting for tasks \u2014 use the chat button to direct the agent'}
              {aiStatus.status === 'blocked' && 'Waiting for your input...'}
            </p>
          )}
        </div>

        {/* Connection indicator — pill badge */}
        <div
          className="flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium"
          style={{
            backgroundColor: connected
              ? 'color-mix(in srgb, var(--color-success) 10%, transparent)'
              : 'color-mix(in srgb, var(--color-danger) 10%, transparent)',
            color: connected ? 'var(--color-success)' : 'var(--color-danger)',
          }}
          title={connected ? 'Connected' : 'Disconnected'}
        >
          {connected ? <Wifi size={14} /> : <WifiOff size={14} />}
          {connected ? 'Connected' : 'Disconnected'}
        </div>
      </div>
    </div>
  )
}
