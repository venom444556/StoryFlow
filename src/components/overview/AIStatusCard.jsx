import { Bot, Wifi, WifiOff, ShieldAlert } from 'lucide-react'
import { motion } from 'framer-motion'
import GlassCard from '../ui/GlassCard'
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
    ringClass: 'ring-green-400/20',
  },
  idle: {
    label: 'Idle',
    color: 'var(--color-ai-idle)',
    pulse: false,
    ringClass: 'ring-gray-400/10',
  },
  blocked: {
    label: 'Needs Input',
    color: 'var(--color-ai-blocked)',
    pulse: true,
    ringClass: 'ring-yellow-400/20',
  },
}

export default function AIStatusCard() {
  const aiStatus = useEventStore(selectAiStatus)
  const connected = useEventStore(selectConnected)
  const gateCount = useEventStore(selectGateCount)
  const config = STATUS_CONFIG[aiStatus.status] || STATUS_CONFIG.idle

  return (
    <GlassCard className="relative overflow-hidden">
      {/* Subtle glow behind the card when AI is working */}
      {aiStatus.status === 'working' && (
        <div
          className="absolute -inset-1 -z-10 rounded-2xl opacity-30 blur-xl"
          style={{ background: `radial-gradient(circle, var(--color-ai-accent), transparent 70%)` }}
        />
      )}

      <div className="flex items-start gap-4">
        {/* AI avatar with status ring */}
        <div className="relative shrink-0">
          <div
            className={[
              'flex h-12 w-12 items-center justify-center rounded-xl',
              'bg-[var(--color-ai-bg)] ring-2',
              config.ringClass,
            ].join(' ')}
          >
            <Bot size={24} className="text-[var(--color-ai-accent)]" />
          </div>
          {/* Status dot */}
          <motion.span
            className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-[var(--color-bg-base)]"
            style={{ backgroundColor: config.color }}
            animate={config.pulse ? { scale: [1, 1.3, 1] } : {}}
            transition={config.pulse ? { repeat: Infinity, duration: 2 } : {}}
          />
        </div>

        {/* Status info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-[var(--color-fg-default)]">AI Agent</h3>
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-medium"
              style={{
                backgroundColor: `color-mix(in srgb, ${config.color} 15%, transparent)`,
                color: config.color,
              }}
            >
              {config.label}
            </span>
            {gateCount > 0 && (
              <span className="flex items-center gap-1 rounded-full bg-amber-400/15 px-2 py-0.5 text-[10px] font-medium text-amber-400">
                <ShieldAlert size={10} />
                {gateCount} pending
              </span>
            )}
          </div>

          {aiStatus.detail ? (
            <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-[var(--color-fg-muted)]">
              {aiStatus.detail}
            </p>
          ) : (
            <p className="mt-1 text-sm text-[var(--color-fg-subtle)]">
              {aiStatus.status === 'idle'
                ? 'Waiting for tasks — use the steering bar below to direct the agent'
                : 'Processing...'}
            </p>
          )}
        </div>

        {/* Connection indicator */}
        <div className="shrink-0" title={connected ? 'Connected' : 'Disconnected'}>
          {connected ? (
            <Wifi size={14} className="text-green-400/60" />
          ) : (
            <WifiOff size={14} className="text-red-400/60" />
          )}
        </div>
      </div>
    </GlassCard>
  )
}
