import { createPortal } from 'react-dom'
import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  PackageOpen,
  HeartPulse,
  Terminal,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
} from 'lucide-react'
import Button from '../ui/Button'

export default function AgentDrawer({ isOpen, onClose }) {
  const location = useLocation()
  const match = location.pathname.match(/\/project\/([a-zA-Z0-9-]+)/)
  const projectId = match ? match[1] : null

  const [status, setStatus] = useState(null)
  const [doctor, setDoctor] = useState(null)
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState(null)

  const loadAgentData = () => {
    setLoading(true)
    setActionError(null)

    const doctorUrl = projectId
      ? `/api/agent/doctor?projectId=${encodeURIComponent(projectId)}`
      : '/api/agent/doctor'

    return Promise.all([
      fetch('/api/agent/status')
        .then((res) => (res.ok ? res.json() : null))
        .catch(() => null),
      fetch(doctorUrl)
        .then((res) => (res.ok ? res.json() : null))
        .catch(() => null),
    ]).then(([statusData, doctorData]) => {
      setStatus(
        statusData || {
          health: 'missing',
          packagePresent: false,
          memoryDbPresent: false,
          configPresent: false,
          hookCount: 0,
          hooksInstalled: false,
          kbCount: 0,
        }
      )
      setDoctor(doctorData || { checks: [], failCount: 0, timestamp: null })
      setLoading(false)
    })
  }

  // Only fetch when the drawer is opened or toggled.
  useEffect(() => {
    if (!isOpen) return
    let mounted = true
    loadAgentData().catch(() => {
      if (!mounted) return
      setLoading(false)
    })
    return () => {
      mounted = false
    }
  }, [isOpen, projectId])

  if (typeof document === 'undefined') return null

  const state = status?.health || 'missing'
  const doctorChecks = Array.isArray(doctor?.checks) ? doctor.checks : []

  const STATE_CONFIG = {
    missing: {
      label: 'Package Missing',
      desc: 'The StoryFlow Agent automaton is missing or uninstalled. Package data is pending.',
      icon: PackageOpen,
      color: 'var(--color-warning)',
      badge: 'var(--color-bg-glass)',
    },
    healthy: {
      label: 'Systems Nominal',
      desc: 'All hooks and runtime memory are perfectly synchronized.',
      icon: CheckCircle2,
      color: 'var(--color-success)',
      badge: 'color-mix(in srgb, var(--color-success) 10%, transparent)',
    },
    warning: {
      label: 'Systems Degraded',
      desc: 'Non-critical hooks or memory sync issues detected.',
      icon: AlertTriangle,
      color: 'var(--color-warning)',
      badge: 'color-mix(in srgb, var(--color-warning) 10%, transparent)',
    },
    broken: {
      label: 'Systems Critical',
      desc: 'Core package files or runtime connectivity failed.',
      icon: ShieldAlert,
      color: 'var(--color-danger)',
      badge: 'color-mix(in srgb, var(--color-danger) 10%, transparent)',
    },
  }

  const config = STATE_CONFIG[state] || STATE_CONFIG.missing
  const StatusIcon = config.icon
  const installedHooksCount = status?.hooksInstalled ? status?.hookCount || 0 : 0

  async function handleInstallAgent() {
    setActionLoading(true)
    setActionError(null)
    try {
      const res = await fetch('/api/agent/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force: false }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.error || 'Install failed')
      }
      await loadAgentData()
    } catch (err) {
      setActionError(err.message || 'Install failed')
      setLoading(false)
    } finally {
      setActionLoading(false)
    }
  }

  async function handleInstallHooks() {
    setActionLoading(true)
    setActionError(null)
    try {
      const res = await fetch('/api/agent/install-hooks', { method: 'POST' })
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.error || 'Hook installation failed')
      }
      await loadAgentData()
    } catch (err) {
      setActionError(err.message || 'Hook installation failed')
      setLoading(false)
    } finally {
      setActionLoading(false)
    }
  }

  async function handleRunDoctor() {
    setActionLoading(true)
    setActionError(null)
    try {
      await loadAgentData()
    } catch (err) {
      setActionError(err.message || 'Doctor refresh failed')
      setLoading(false)
    } finally {
      setActionLoading(false)
    }
  }

  const primaryAction = !status?.packagePresent
    ? { label: 'Install Agent', onClick: handleInstallAgent, icon: PackageOpen, variant: 'primary' }
    : !status?.hooksInstalled
      ? {
          label: 'Install Hooks',
          onClick: handleInstallHooks,
          icon: HeartPulse,
          variant: 'primary',
        }
      : { label: 'Run Doctor', onClick: handleRunDoctor, icon: HeartPulse, variant: 'outline' }

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative flex w-full max-w-sm flex-col w-[380px] border-l border-[var(--color-border-default)] bg-[var(--color-bg-obsidian)] shadow-2xl h-full"
          >
            <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] px-6 py-5 shrink-0">
              <div>
                <h2 className="text-[15px] font-semibold text-[var(--color-fg-default)] tracking-tight">
                  StoryFlow Agent
                </h2>
                <p className="text-[11px] font-medium tracking-wide uppercase text-[var(--color-fg-muted)] mt-1">
                  Workspace Care Package
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-md p-1.5 text-[var(--color-fg-muted)] hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-fg-default)] transition-colors"
                aria-label="Close Agent Drawer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {loading ? (
                <div className="animate-pulse space-y-6">
                  <div className="h-40 rounded-xl bg-[var(--color-bg-subtle)]" />
                  <div className="h-48 rounded-xl bg-[var(--color-bg-subtle)]" />
                </div>
              ) : (
                <>
                  <div
                    className="flex flex-col items-center justify-center text-center p-6 border border-[var(--color-border-subtle)] rounded-xl"
                    style={{ backgroundColor: config.badge }}
                  >
                    <StatusIcon size={28} style={{ color: config.color }} className="mb-4" />
                    <h3 className="text-[14px] font-semibold text-[var(--color-fg-default)]">
                      {config.label}
                    </h3>
                    <p className="text-[13px] text-[var(--color-fg-muted)] mt-2 leading-relaxed">
                      {config.desc}
                    </p>

                    {/* Workspace Install Stats */}
                    {state !== 'missing' && status && (
                      <div className="mt-4 flex flex-wrap justify-center gap-2">
                        <span className="inline-flex items-center rounded-sm bg-[var(--color-bg-glass)] px-2 py-1 text-[10px] font-medium text-[var(--color-fg-muted)] border border-[var(--color-border-subtle)] transition-colors hover:border-[var(--color-border-default)]">
                          Hooks: {installedHooksCount}/{status.hookCount || 0}
                        </span>
                        <span className="inline-flex items-center rounded-sm bg-[var(--color-bg-glass)] px-2 py-1 text-[10px] font-medium text-[var(--color-fg-muted)] border border-[var(--color-border-subtle)] transition-colors hover:border-[var(--color-border-default)]">
                          DB: {status.memoryDbPresent ? 'Found' : 'Missing'}
                        </span>
                        <span className="inline-flex items-center rounded-sm bg-[var(--color-bg-glass)] px-2 py-1 text-[10px] font-medium text-[var(--color-fg-muted)] border border-[var(--color-border-subtle)] transition-colors hover:border-[var(--color-border-default)]">
                          Config: {status.configPresent ? 'Found' : 'Missing'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Doctor Diagnostics Box */}
                  <div className="rounded-xl bg-[var(--color-bg-base)] border border-[var(--color-border-default)] p-4 font-mono text-[11px] text-[var(--color-fg-muted)] flex flex-col gap-3">
                    <div className="flex justify-between items-center pb-3 border-b border-[var(--color-border-subtle)]">
                      <span className="uppercase tracking-widest text-[var(--color-fg-faint)] font-bold">
                        Doctor Diagnostics
                      </span>
                      {projectId ? (
                        <span className="text-[var(--color-info)]">Project Filtered</span>
                      ) : (
                        <span className="text-[var(--color-fg-muted)]">Global Mode</span>
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      {doctorChecks.length > 0 ? (
                        doctorChecks.map((check) => (
                          <div
                            key={check.name}
                            className="flex flex-col gap-1 rounded-md px-2 py-1.5 hover:bg-[var(--color-bg-glass)] transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className={
                                  check.pass
                                    ? 'text-[var(--color-success)]'
                                    : 'text-[var(--color-danger)]'
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
                        <div className="flex items-center gap-2 text-[var(--color-fg-faint)] italic">
                          No explicit diagnostic telemetry found.
                        </div>
                      )}
                    </div>

                    {actionError ? (
                      <div className="mt-4 w-full rounded-lg border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 px-3 py-2 text-left text-[11px] text-[var(--color-danger)]">
                        {actionError}
                      </div>
                    ) : null}
                  </div>

                  {/* Action Affordances */}
                  <div className="grid gap-2.5 pt-2">
                    <Button
                      className="w-full justify-start font-medium"
                      size="md"
                      variant={primaryAction.variant}
                      icon={primaryAction.icon}
                      onClick={primaryAction.onClick}
                      disabled={actionLoading}
                    >
                      {actionLoading ? 'Working…' : primaryAction.label}
                    </Button>
                    <Button
                      className="w-full justify-start font-medium"
                      size="md"
                      variant="outline"
                      icon={HeartPulse}
                      onClick={handleRunDoctor}
                      disabled={actionLoading}
                    >
                      Run Doctor
                    </Button>
                    <Button
                      className="w-full justify-start font-medium bg-[var(--color-bg-glass)] border-transparent"
                      size="md"
                      variant="outline"
                      icon={Terminal}
                      disabled
                    >
                      Workspace package present
                    </Button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}
