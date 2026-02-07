import React from 'react'
import {
  FileText,
  Network,
  GitBranch,
  Columns3,
  BookOpen,
  Clock,
  Scale,
} from 'lucide-react'
import Tooltip from '../ui/Tooltip'

const isMac = typeof navigator !== 'undefined' && /Mac/i.test(navigator.userAgent)
const ALT = isMac ? '⌥' : 'Alt+'

const TABS = [
  { key: 'overview', label: 'Overview', shortcut: `${ALT}1`, icon: FileText },
  { key: 'architecture', label: 'Architecture', shortcut: `${ALT}2`, icon: Network },
  { key: 'workflow', label: 'Workflow', shortcut: `${ALT}3`, icon: GitBranch },
  { key: 'board', label: 'Board', shortcut: `${ALT}4`, icon: Columns3 },
  { key: 'wiki', label: 'Wiki', shortcut: `${ALT}5`, icon: BookOpen },
  { key: 'timeline', label: 'Timeline', shortcut: `${ALT}6`, icon: Clock },
  { key: 'decisions', label: 'Decisions', shortcut: `${ALT}7`, icon: Scale },
]

export default function ProjectSidebar({ activeTab, onTabChange }) {
  return (
    <div className={[
      'glass-sidebar relative z-30 flex shrink-0 items-center overflow-visible border-white/5',
      // Mobile: fixed horizontal bottom bar
      'fixed bottom-0 left-0 right-0 gap-0 border-t px-2 py-1',
      // Desktop: vertical left sidebar
      'md:static md:w-16 md:flex-col md:gap-1 md:border-t-0 md:border-r md:py-4 md:px-0',
    ].join(' ')}>
      {TABS.map((tab) => {
        const isActive = activeTab === tab.key
        const Icon = tab.icon

        return (
          <Tooltip key={tab.key} content={`${tab.label}  (${tab.shortcut})`} position="right">
            <button
              onClick={() => onTabChange(tab.key)}
              title={tab.label}
              className={[
                'relative flex items-center justify-center aspect-square transition-colors',
                // Mobile: share row equally; Desktop: full width
                'flex-1 md:flex-none md:w-full',
                isActive
                  ? 'text-white'
                  : 'text-slate-500 hover:bg-white/5 hover:text-slate-300',
              ].join(' ')}
            >
              <Icon size={18} />
            </button>
          </Tooltip>
        )
      })}
    </div>
  )
}
