import { useState, useEffect } from 'react'
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  PackageOpen,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import GlassCard from '../ui/GlassCard'

export default function AgentCommandCenter({ projectId }) {
  const [status, setStatus] = useState(null)
  const [doctor, setDoctor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [collapsed, setCollapsed] = useState(false)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    let mounted = true
    Promise.all([
      fetch('/api/agent/status')
        .then((res) => (res.ok ? res.json() : null))
        .catch(() => null),
      fetch(`/api/agent/doctor?projectId=${encodeURIComponent(projectId)}`)
        .then((res) => (res.ok ? res.json() : null))
        .catch(() => null),
    ]).then(([statusData, doctorData]) => {
      if (!mounted) return
      setStatus(
        statusData || {
          health: 'missing',
          packagePresent: false,
          memoryDbPresent: false,
          configPresent: false,
          hookCount: 0,
          kbCount: 0,
        }
      )
      setDoctor(doctorData || { checks: [], failCount: 0, timestamp: null })
      setLoading(false)
    })
    return () => {
      mounted = false
    }
  }, [projectId])

  const state = status?.health || 'missing'
  const doctorChecks = Array.isArray(doctor?.checks) ? doctor.checks : []
  const failCount = doctor?.failCount || 0

  const STATE_CONFIG = {
    missing: {
      label: 'Agent Care Package Missing',
      desc: 'The packaged StoryFlow Agent is not installed in this workspace yet.',
      icon: PackageOpen,
      dot: 'var(--color-border-emphasis)',
    },
    healthy: {
      label: 'Agent Runtime Healthy',
      desc: 'Hooks, memory, and boot diagnostics are all online.',
      icon: CheckCircle2,
      dot: 'var(--color-success)',
    },
    warning: {
      label: 'Agent Runtime Warning',
      desc: 'The care package is present, but parts of the runtime need attention.',
      icon: AlertTriangle,
      dot: 'var(--color-warning)',
    },
    broken: {
      label: 'Agent Runtime Critical',
      desc: 'Core package files or runtime connectivity failed.',
      icon: ShieldAlert,
      dot: 'var(--color-danger)',
    },
  }

  const config = STATE_CONFIG[state] || STATE_CONFIG.missing
  const StatusIcon = config.icon
  const installedHooks = status?.hooksInstalled ? status?.hookCount || 0 : 0
  const compactSummary = [
    `${installedHooks}/${status?.hookCount || 0} hooks`,
    status?.memoryDbPresent ? 'memory ready' : 'memory missing',
    failCount > 0 ? `${failCount} doctor issue${failCount === 1 ? '' : 's'}` : 'doctor clean',
  ].join(' · ')

  useEffect(() => {
    if (loading || initialized) return
    setCollapsed(state === 'healthy' && failCount === 0)
    setInitialized(true)
  }, [loading, initialized, state, failCount])

  useEffect(() => {
    if (!initialized) return
    if (state !== 'healthy' || failCount > 0) {
      setCollapsed(false)
    }
  }, [initialized, state, failCount])

  if (loading) {
    return (
      <GlassCard padding="md" className="animate-pulse border border-[var(--color-border-subtle)]">
        <div className="h-24" />
      </GlassCard>
    )
  }

  return (
    <GlassCard
      padding="md"
      className="animate-entrance stagger-2 flex flex-col gap-4 border border-[var(--color-border-subtle)]"
    >
      <button
        type="button"
        onClick={() => setCollapsed((value) => !value)}
        className="flex w-full items-start justify-between gap-4 rounded-xl text-left transition-colors hover:bg-[var(--color-bg-glass)]/60 px-1 py-1"
      >
        <div className="flex items-start gap-3">
          <div className="relative mt-1 flex h-3 w-3 shrink-0 items-center justify-center">
            {state === 'healthy' ? (
              <span
                className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
                style={{ backgroundColor: config.dot }}
              />
            ) : null}
            <span
              className="relative inline-flex h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: config.dot }}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <StatusIcon size={15} style={{ color: config.dot }} />
              <h3 className="text-sm font-semibold text-[var(--color-fg-default)]">
                {config.label}
              </h3>
            </div>
            <p className="mt-1 text-[13px] leading-relaxed text-[var(--color-fg-muted)]">
              {collapsed ? compactSummary : config.desc}
            </p>
            {!collapsed ? (
              <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-[var(--color-fg-subtle)]">
                <span className="rounded-full bg-[var(--color-bg-glass)] px-2 py-0.5">
                  hooks {installedHooks}/{status?.hookCount || 0}
                </span>
                <span className="rounded-full bg-[var(--color-bg-glass)] px-2 py-0.5">
                  memory {status?.memoryDbPresent ? 'ready' : 'missing'}
                </span>
                <span className="rounded-full bg-[var(--color-bg-glass)] px-2 py-0.5">
                  config {status?.configPresent ? 'present' : 'missing'}
                </span>
              </div>
            ) : null}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 pt-0.5 text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--color-fg-faint)]">
          <span>{collapsed ? 'Expand' : 'Collapse'}</span>
          {collapsed ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
        </div>
      </button>

      {!collapsed ? (
        <div className="rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-base)] p-4 font-mono text-[11px] text-[var(--color-fg-muted)] flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] pb-3">
            <span className="font-bold uppercase tracking-widest text-[var(--color-fg-faint)]">
              Doctor Diagnostics
            </span>
            <span
              className={
                state === 'healthy' ? 'text-[var(--color-success)]' : 'text-[var(--color-warning)]'
              }
            >
              {state === 'healthy' ? 'Nominal' : 'Review Required'}
            </span>
          </div>
          <div className="flex flex-col gap-1.5">
            {doctorChecks.length > 0 ? (
              doctorChecks.map((check) => (
                <div
                  key={check.name}
                  className="flex flex-col gap-1 rounded-md px-2 py-1.5 hover:bg-[var(--color-bg-glass)]"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={
                        check.pass ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'
                      }
                    >
                      {check.pass ? '✓' : '✗'}
                    </span>
                    <span className={!check.pass ? 'text-[var(--color-fg-default)]' : ''}>
                      {check.name}
                    </span>
                    <span className="ml-auto text-[var(--color-fg-subtle)]">
                      [{check.pass ? 'PASS' : check.fix ? 'FIXABLE' : 'FAIL'}]
                    </span>
                  </div>
                  {check.detail ? (
                    <div className="pl-5 text-[10px] leading-relaxed text-[var(--color-fg-subtle)]">
                      {check.detail}
                    </div>
                  ) : null}
                  {check.fix && !check.pass ? (
                    <div className="pl-5 text-[10px] leading-relaxed text-[var(--color-warning)]">
                      fix: {check.fix}
                    </div>
                  ) : null}
                </div>
              ))
            ) : (
              <div className="flex items-center gap-2 italic text-[var(--color-fg-faint)]">
                No diagnostic telemetry available.
              </div>
            )}
          </div>
        </div>
      ) : null}
    </GlassCard>
  )
}
