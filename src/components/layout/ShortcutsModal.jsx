import React from 'react'
import Modal from '../ui/Modal'

const isMac = typeof navigator !== 'undefined' && /Mac/i.test(navigator.userAgent)
const MOD = isMac ? '⌘' : 'Ctrl'
const ALT = isMac ? '⌥' : 'Alt'

const SECTIONS = [
  {
    title: 'Navigation',
    shortcuts: [
      { keys: [ALT, '1'], label: 'Overview' },
      { keys: [ALT, '2'], label: 'Plan → Architecture' },
      { keys: [ALT, '3'], label: 'Plan → Workflow' },
      { keys: [ALT, '4'], label: 'Work (Board)' },
      { keys: [ALT, '5'], label: 'Docs → Wiki' },
      { keys: [ALT, '6'], label: 'Insights (Timeline)' },
      { keys: [ALT, '7'], label: 'Docs → Decisions' },
    ],
  },
  {
    title: 'General',
    shortcuts: [
      { keys: [MOD, '/'], label: 'Search / command palette' },
      { keys: ['?'], label: 'Show keyboard shortcuts' },
      { keys: ['Esc'], label: 'Close modal / panel' },
    ],
  },
]

function Kbd({ children }) {
  return (
    <kbd className="inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded border border-[var(--color-border-default)] bg-[var(--color-bg-glass)] px-1.5 text-[11px] font-medium text-[var(--color-fg-default)]">
      {children}
    </kbd>
  )
}

export default function ShortcutsModal({ isOpen, onClose }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Keyboard Shortcuts" size="sm">
      <div className="space-y-5">
        {SECTIONS.map((section) => (
          <div key={section.title}>
            <h3 className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-fg-subtle)]">
              {section.title}
            </h3>
            <div className="space-y-1.5">
              {section.shortcuts.map((s) => (
                <div
                  key={s.label}
                  className="flex items-center justify-between rounded-md px-2 py-1.5 transition-colors hover:bg-[var(--color-bg-glass)]"
                >
                  <span className="text-sm text-[var(--color-fg-default)]">{s.label}</span>
                  <div className="flex items-center gap-1">
                    {s.keys.map((k, i) => (
                      <React.Fragment key={i}>
                        {i > 0 && <span className="text-[10px] text-[var(--color-fg-faint)]">+</span>}
                        <Kbd>{k}</Kbd>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  )
}
