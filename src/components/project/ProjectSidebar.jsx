import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  Compass,
  LayoutGrid,
  BookOpen,
  BarChart3,
  MoreHorizontal,
  ChevronRight,
} from 'lucide-react'
import Tooltip from '../ui/Tooltip'

const isMac = typeof navigator !== 'undefined' && /Mac/i.test(navigator.userAgent)
const ALT = isMac ? '⌥' : 'Alt+'

// Main 5 tabs
const MAIN_TABS = [
  {
    key: 'overview',
    label: 'Overview',
    shortcut: `${ALT}1`,
    icon: FileText,
    path: 'overview',
    mobileVisible: true,
  },
  {
    key: 'plan',
    label: 'Plan',
    shortcut: `${ALT}2`,
    icon: Compass,
    path: 'plan',
    mobileVisible: true,
    legacyKey: 'architecture',
  },
  {
    key: 'work',
    label: 'Work',
    shortcut: `${ALT}4`,
    icon: LayoutGrid,
    path: 'work',
    mobileVisible: true,
    legacyKey: 'board',
  },
  {
    key: 'docs',
    label: 'Docs',
    shortcut: `${ALT}5`,
    icon: BookOpen,
    path: 'docs',
    mobileVisible: true,
    legacyKey: 'wiki',
  },
  {
    key: 'insights',
    label: 'Insights',
    shortcut: `${ALT}6`,
    icon: BarChart3,
    path: 'insights',
    mobileVisible: false, // Hidden in mobile, shown in "More" menu
    legacyKey: 'timeline',
  },
]

// Map legacy tab keys to main tabs
const TAB_KEY_MAP = {
  overview: 'overview',
  architecture: 'plan',
  workflow: 'plan',
  board: 'work',
  wiki: 'docs',
  decisions: 'docs',
  timeline: 'insights',
}

export default function ProjectSidebar({ activeTab, projectId, onTabChange }) {
  const [showMore, setShowMore] = useState(false)

  // Get the main tab that's active
  const activeMainTab = TAB_KEY_MAP[activeTab] || 'overview'

  return (
    <>
      {/* Desktop sidebar */}
      <div
        className={[
          'glass-sidebar relative z-30 flex shrink-0 flex-col items-center overflow-visible',
          'hidden md:flex md:w-16 md:gap-2 md:border-r md:border-[var(--color-border-muted)] md:py-4',
        ].join(' ')}
      >
        {MAIN_TABS.map((tab) => {
          const isActive = activeMainTab === tab.key
          const Icon = tab.icon

          return (
            <Tooltip key={tab.key} content={`${tab.label}  (${tab.shortcut})`} position="right">
              <Link
                to={`/project/${projectId}/${tab.path}`}
                onClick={(e) => {
                  if (onTabChange) {
                    e.preventDefault()
                    onTabChange(tab.legacyKey || tab.key)
                  }
                }}
                className={[
                  'relative flex w-full items-center justify-center aspect-square transition-colors rounded-lg',
                  isActive
                    ? 'text-[var(--color-fg-default)] bg-[var(--color-bg-glass)]'
                    : 'text-[var(--color-fg-muted)] hover:bg-[var(--color-bg-glass-hover)] hover:text-[var(--color-fg-default)]',
                ].join(' ')}
              >
                <Icon size={18} />
                {isActive && (
                  <span
                    className="absolute -left-px top-1/2 -translate-y-1/2 h-6 w-0.5 rounded-full bg-[var(--interactive-default)]"
                    aria-hidden="true"
                  />
                )}
              </Link>
            </Tooltip>
          )
        })}
      </div>

      {/* Mobile bottom bar */}
      <div
        className={[
          'glass-sidebar fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around',
          'border-t border-[var(--color-border-muted)] px-2 py-1 md:hidden',
        ].join(' ')}
      >
        {MAIN_TABS.filter((t) => t.mobileVisible).map((tab) => {
          const isActive = activeMainTab === tab.key
          const Icon = tab.icon

          return (
            <Link
              key={tab.key}
              to={`/project/${projectId}/${tab.path}`}
              onClick={(e) => {
                if (onTabChange) {
                  e.preventDefault()
                  onTabChange(tab.legacyKey || tab.key)
                }
              }}
              className={[
                'flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg transition-colors',
                isActive ? 'text-[var(--interactive-default)]' : 'text-[var(--color-fg-muted)]',
              ].join(' ')}
            >
              <Icon size={20} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          )
        })}

        {/* More menu for mobile */}
        <div className="relative">
          <button
            onClick={() => setShowMore(!showMore)}
            className={[
              'flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg transition-colors',
              showMore ? 'text-[var(--interactive-default)]' : 'text-[var(--color-fg-muted)]',
            ].join(' ')}
          >
            <MoreHorizontal size={20} />
            <span className="text-[10px] font-medium">More</span>
          </button>

          <AnimatePresence>
            {showMore && (
              <>
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-40"
                  onClick={() => setShowMore(false)}
                />

                {/* Menu */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className={[
                    'absolute bottom-full right-0 mb-2 z-50',
                    'w-48 rounded-lg border border-[var(--color-border-default)]',
                    'bg-[var(--color-bg-glass)] backdrop-blur-xl shadow-lg',
                    'overflow-hidden',
                  ].join(' ')}
                >
                  {/* Hidden tabs */}
                  {MAIN_TABS.filter((t) => !t.mobileVisible).map((tab) => {
                    const Icon = tab.icon
                    return (
                      <Link
                        key={tab.key}
                        to={`/project/${projectId}/${tab.path}`}
                        onClick={(e) => {
                          if (onTabChange) {
                            e.preventDefault()
                            onTabChange(tab.legacyKey || tab.key)
                          }
                          setShowMore(false)
                        }}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-[var(--color-fg-default)] hover:bg-[var(--color-bg-glass-hover)]"
                      >
                        <Icon size={16} />
                        <span>{tab.label}</span>
                        <ChevronRight size={14} className="ml-auto text-[var(--color-fg-subtle)]" />
                      </Link>
                    )
                  })}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  )
}
