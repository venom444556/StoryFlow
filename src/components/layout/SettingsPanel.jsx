import { useCallback, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Moon,
  Sun,
  Palette,
  Grid3x3,
  Save,
  Trash2,
  RotateCcw,
  Monitor,
  Sparkles,
  Navigation,
  LayoutGrid,
  RefreshCw,
} from 'lucide-react'
import { useSettings } from '../../contexts/SettingsContext'
import { useProjectsStore, reloadFromServer } from '../../stores/projectsStore'

const ACCENT_COLORS = [
  { id: 'purple', label: 'Purple', color: '#8b5cf6' },
  { id: 'blue', label: 'Blue', color: '#3b82f6' },
  { id: 'cyan', label: 'Cyan', color: '#06b6d4' },
  { id: 'green', label: 'Green', color: '#10b981' },
  { id: 'pink', label: 'Pink', color: '#ec4899' },
]

function SettingRow({ icon: Icon, label, description, children }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="flex items-center gap-3 min-w-0">
        {Icon && (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--color-bg-glass-hover)]">
            <Icon size={16} className="text-[var(--color-fg-muted)]" />
          </div>
        )}
        <div className="min-w-0">
          <div className="text-sm font-medium text-[var(--color-fg-default)]">{label}</div>
          {description && <div className="text-xs text-[var(--color-fg-muted)]">{description}</div>}
        </div>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

function Toggle({ checked, onChange }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out"
      style={{
        backgroundColor: checked ? 'var(--accent-active, #8b5cf6)' : 'var(--color-bg-emphasis)',
      }}
    >
      <span
        className={[
          'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-[var(--color-fg-default)] shadow ring-0 transition duration-200 ease-in-out',
          checked ? 'translate-x-5' : 'translate-x-0',
        ].join(' ')}
      />
    </button>
  )
}

function SectionLabel({ children }) {
  return (
    <div className="mb-1 mt-4 first:mt-0 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-fg-faint)]">
      {children}
    </div>
  )
}

const REFRESH_INTERVALS = [
  { label: 'Off', ms: 0 },
  { label: '5s', ms: 5_000 },
  { label: '10s', ms: 10_000 },
  { label: '30s', ms: 30_000 },
  { label: '1m', ms: 60_000 },
  { label: '5m', ms: 300_000 },
]

function formatRelative(iso) {
  if (!iso) return 'Never'
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 5) return 'Just now'
  if (diff < 60) return `${diff}s ago`
  const mins = Math.floor(diff / 60)
  if (mins < 60) return `${mins}m ago`
  return `${Math.floor(mins / 60)}h ago`
}

function AutoRefreshSetting() {
  const interval = useProjectsStore((s) => s.autoRefreshInterval)
  const setInterval_ = useProjectsStore((s) => s.setAutoRefreshInterval)
  const lastRefreshed = useProjectsStore((s) => s.lastRefreshed)
  const [relativeTime, setRelativeTime] = useState(null)

  useEffect(() => {
    setRelativeTime(formatRelative(lastRefreshed))
    const id = window.setInterval(() => setRelativeTime(formatRelative(lastRefreshed)), 1000)
    return () => window.clearInterval(id)
  }, [lastRefreshed])

  const handleManualRefresh = useCallback(() => {
    reloadFromServer()
  }, [])

  return (
    <>
      <SettingRow icon={RefreshCw} label="Refresh Interval" description="Poll server for changes">
        <select
          value={interval}
          onChange={(e) => setInterval_(Number(e.target.value))}
          className="glass-input rounded-md px-2 py-1 text-xs text-[var(--color-fg-default)]"
        >
          {REFRESH_INTERVALS.map(({ label, ms }) => (
            <option key={ms} value={ms}>
              {label}
            </option>
          ))}
        </select>
      </SettingRow>
      <div className="flex items-center justify-between py-2 pl-11">
        <span className="text-xs text-[var(--color-fg-faint)]">Last refreshed: {relativeTime}</span>
        <button
          onClick={handleManualRefresh}
          className="rounded-md px-2 py-1 text-xs font-medium text-[var(--interactive-default)] transition-colors hover:bg-[var(--color-bg-glass-hover)]"
        >
          Refresh now
        </button>
      </div>
    </>
  )
}

export default function SettingsPanel({ isOpen, onClose }) {
  const { settings, setSetting, resetSettings } = useSettings()

  const handleThemeToggle = useCallback(() => {
    setSetting('theme', settings.theme === 'dark' ? 'light' : 'dark')
  }, [settings.theme, setSetting])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 flex h-full w-[380px] max-w-[90vw] flex-col border-l border-[var(--color-border-default)] bg-[var(--color-bg-subtle)] shadow-2xl"
          >
            {/* Header */}
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-[var(--color-border-default)] px-5">
              <h2 className="text-base font-semibold text-[var(--color-fg-default)]">Settings</h2>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-[var(--color-fg-muted)] transition-colors hover:bg-[var(--color-bg-glass-hover)]"
              >
                <X size={18} />
              </button>
            </div>

            {/* Settings content */}
            <div className="flex-1 overflow-y-auto px-5 py-2">
              {/* Appearance */}
              <SectionLabel>Appearance</SectionLabel>

              <SettingRow
                icon={settings.theme === 'dark' ? Moon : Sun}
                label="Dark Mode"
                description="Toggle between dark and light theme"
              >
                <Toggle checked={settings.theme === 'dark'} onChange={handleThemeToggle} />
              </SettingRow>

              <SettingRow icon={Palette} label="Accent Color" description="Primary highlight color">
                <div className="flex gap-1.5">
                  {ACCENT_COLORS.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSetting('accentColor', c.id)}
                      title={c.label}
                      className={[
                        'h-6 w-6 rounded-full transition-all',
                        settings.accentColor === c.id
                          ? 'ring-2 ring-offset-2 scale-110'
                          : 'hover:scale-110',
                      ].join(' ')}
                      style={{
                        backgroundColor: c.color,
                        '--tw-ring-color': c.color,
                        '--tw-ring-offset-color': 'var(--color-bg-subtle)',
                      }}
                    />
                  ))}
                </div>
              </SettingRow>

              <SettingRow
                icon={Sparkles}
                label="Animations"
                description="Enable motion and transitions"
              >
                <Toggle
                  checked={settings.animationsEnabled}
                  onChange={(v) => setSetting('animationsEnabled', v)}
                />
              </SettingRow>

              <SettingRow
                icon={LayoutGrid}
                label="Compact Cards"
                description="Smaller project cards on dashboard"
              >
                <Toggle
                  checked={settings.compactCards}
                  onChange={(v) => setSetting('compactCards', v)}
                />
              </SettingRow>

              {/* Navigation */}
              <SectionLabel>Navigation</SectionLabel>

              <SettingRow
                icon={Navigation}
                label="Show Breadcrumbs"
                description="Path navigation in header"
              >
                <Toggle
                  checked={settings.showBreadcrumbs}
                  onChange={(v) => setSetting('showBreadcrumbs', v)}
                />
              </SettingRow>

              {/* Saving */}
              <SectionLabel>Saving</SectionLabel>

              <SettingRow icon={Save} label="Auto-Save" description="Automatically save changes">
                <Toggle checked={settings.autoSave} onChange={(v) => setSetting('autoSave', v)} />
              </SettingRow>

              <SettingRow
                icon={Trash2}
                label="Confirm on Delete"
                description="Show confirmation before deleting"
              >
                <Toggle
                  checked={settings.showConfirmOnDelete}
                  onChange={(v) => setSetting('showConfirmOnDelete', v)}
                />
              </SettingRow>

              {/* Auto-Refresh */}
              <SectionLabel>Auto-Refresh</SectionLabel>

              <AutoRefreshSetting />

              {/* Workflow */}
              <SectionLabel>Workflow Canvas</SectionLabel>

              <SettingRow
                icon={Grid3x3}
                label="Snap to Grid"
                description="Align nodes to grid when dragging"
              >
                <Toggle
                  checked={settings.workflowSnapToGrid}
                  onChange={(v) => setSetting('workflowSnapToGrid', v)}
                />
              </SettingRow>

              <SettingRow icon={Monitor} label="Grid Size" description="Spacing for snap-to-grid">
                <select
                  value={settings.workflowGridSize}
                  onChange={(e) => setSetting('workflowGridSize', Number(e.target.value))}
                  className="glass-input rounded-md px-2 py-1 text-xs text-[var(--color-fg-default)]"
                >
                  <option value={10}>10px</option>
                  <option value={20}>20px</option>
                  <option value={40}>40px</option>
                </select>
              </SettingRow>

              {/* Danger zone */}
              <SectionLabel>Reset</SectionLabel>

              <div className="py-3">
                <button
                  onClick={() => {
                    resetSettings()
                    onClose()
                  }}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10"
                >
                  <RotateCcw size={14} />
                  Reset All Settings
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="shrink-0 border-t border-[var(--color-border-default)] px-5 py-3">
              <p className="text-center text-[11px] text-[var(--color-fg-faint)]">
                Settings are saved automatically
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
