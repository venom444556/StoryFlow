import { LayoutGrid } from 'lucide-react'
import Sparkline from '../ui/Sparkline'
import SectionHeader from '../ui/SectionHeader'

export function MetricTile({ icon: Icon, label, value, subtext, color, trend }) {
  return (
    <div
      className="group relative flex flex-col gap-2 overflow-hidden rounded-2xl p-5 transition-all hover:scale-[1.02]"
      style={{
        background: 'var(--color-bg-glass)',
        border: '1px solid var(--color-border-default)',
        transitionDuration: 'var(--duration-normal)',
      }}
      title={`${label}: ${value}${subtext ? ` — ${subtext}` : ''}`}
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: `linear-gradient(to right, transparent, ${color}, transparent)`,
          opacity: 0.4,
        }}
      />

      <div className="flex items-center justify-between">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
          style={{
            backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)`,
          }}
        >
          <Icon size={16} style={{ color }} />
        </div>
        {trend && trend.length >= 2 && (
          <Sparkline data={trend} width={56} height={22} color={color} strokeWidth={1.5} />
        )}
      </div>
      <p className="text-3xl font-bold leading-none tracking-tight text-[var(--color-fg-default)]">
        {value}
      </p>
      <div>
        <p className="text-xs font-medium text-[var(--color-fg-muted)]">{label}</p>
        {subtext && <p className="mt-0.5 text-[11px] text-[var(--color-fg-subtle)]">{subtext}</p>}
      </div>
    </div>
  )
}

function HeroStat({ value, label, color }) {
  return (
    <div
      className="relative flex min-h-[7rem] flex-col items-center justify-center overflow-hidden rounded-2xl px-4 py-5"
      style={{
        background: 'var(--color-bg-glass)',
        border: '1px solid var(--color-border-default)',
      }}
    >
      {/* Glow behind the number */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          background: `radial-gradient(circle at 50% 60%, ${color || 'var(--accent-default)'}, transparent 80%)`,
        }}
      />
      <p
        className="relative text-3xl font-bold leading-none tracking-tight"
        style={{ color: color || 'var(--color-fg-default)' }}
      >
        {value}
      </p>
      <p className="relative mt-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-fg-muted)]">
        {label}
      </p>
    </div>
  )
}

export default function MetricsSummary({ analytics, embedded = false }) {
  const content = analytics ? (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <HeroStat value={analytics.completion?.totalIssues ?? 0} label="Total Issues" />
      <HeroStat
        value={`${analytics.completion?.percent ?? 0}%`}
        label="Complete"
        color="var(--color-success)"
      />
      <HeroStat
        value={analytics.velocity?.completedPoints ?? 0}
        label="Points Done"
        color="var(--accent-cyan)"
      />
      <HeroStat
        value={analytics.byStatus?.['In Progress'] ?? 0}
        label="In Progress"
        color="var(--color-info)"
      />
    </div>
  ) : (
    <div className="grid grid-cols-2 gap-4 opacity-60 grayscale-[0.5] sm:grid-cols-4">
      <HeroStat value="--" label="Total Issues" />
      <HeroStat value="--%" label="Complete" color="var(--color-success)" />
      <HeroStat value="--" label="Points Done" color="var(--accent-cyan)" />
      <HeroStat value="--" label="In Progress" color="var(--color-info)" />
    </div>
  )

  if (!analytics) {
    return (
      <div className={embedded ? 'flex flex-col' : 'glass-card flex flex-col overflow-hidden'}>
        <div
          className={
            embedded ? 'px-5 py-4' : 'border-b border-[var(--color-border-default)] px-5 py-4'
          }
        >
          <SectionHeader icon={LayoutGrid} color="var(--accent-default)" className="mb-0">
            Delivery Snapshot
          </SectionHeader>
        </div>
        <div className="p-5 opacity-60 pointer-events-none">{content}</div>
      </div>
    )
  }

  return (
    <div className={embedded ? 'flex flex-col' : 'glass-card flex flex-col overflow-hidden'}>
      <div
        className={
          embedded ? 'px-5 py-4' : 'border-b border-[var(--color-border-default)] px-5 py-4'
        }
      >
        <SectionHeader icon={LayoutGrid} color="var(--accent-default)" className="mb-0">
          Delivery Snapshot
        </SectionHeader>
      </div>
      <div className="p-5">{content}</div>
    </div>
  )
}
