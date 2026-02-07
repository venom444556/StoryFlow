import React from 'react'
import Modal from '../ui/Modal'

const isMac = typeof navigator !== 'undefined' && /Mac/i.test(navigator.userAgent)
const MOD = isMac ? '⌘' : 'Ctrl'
const ALT = isMac ? '⌥' : 'Alt'

const SECTIONS = [
  {
    title: 'Navigation',
    shortcuts: [
      { keys: [ALT, '1'], label: 'Overview tab' },
      { keys: [ALT, '2'], label: 'Architecture tab' },
      { keys: [ALT, '3'], label: 'Workflow tab' },
      { keys: [ALT, '4'], label: 'Board tab' },
      { keys: [ALT, '5'], label: 'Wiki tab' },
      { keys: [ALT, '6'], label: 'Timeline tab' },
      { keys: [ALT, '7'], label: 'Decisions tab' },
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
    <kbd className="inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded border border-white/10 bg-white/5 px-1.5 text-[11px] font-medium text-slate-300">
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
            <h3 className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              {section.title}
            </h3>
            <div className="space-y-1.5">
              {section.shortcuts.map((s) => (
                <div
                  key={s.label}
                  className="flex items-center justify-between rounded-md px-2 py-1.5 transition-colors hover:bg-white/5"
                >
                  <span className="text-sm text-slate-300">{s.label}</span>
                  <div className="flex items-center gap-1">
                    {s.keys.map((k, i) => (
                      <React.Fragment key={i}>
                        {i > 0 && <span className="text-[10px] text-slate-600">+</span>}
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
