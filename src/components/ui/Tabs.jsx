import React, { useRef, useCallback } from 'react'
import { motion } from 'framer-motion'

export default function Tabs({
  tabs = [],
  activeTab,
  onTabChange,
  className = '',
  layoutId = 'tabs',
}) {
  const tabsRef = useRef([])

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e, index) => {
      const tabCount = tabs.length
      let newIndex = index

      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault()
          newIndex = (index + 1) % tabCount
          break
        case 'ArrowLeft':
          e.preventDefault()
          newIndex = (index - 1 + tabCount) % tabCount
          break
        case 'Home':
          e.preventDefault()
          newIndex = 0
          break
        case 'End':
          e.preventDefault()
          newIndex = tabCount - 1
          break
        default:
          return
      }

      tabsRef.current[newIndex]?.focus()
      onTabChange(tabs[newIndex].key)
    },
    [tabs, onTabChange]
  )

  return (
    <div
      className={[
        'glass inline-flex gap-[var(--space-1)] rounded-[var(--radius-lg)] p-[var(--space-1)]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      role="tablist"
    >
      {tabs.map((tab, index) => {
        const isActive = tab.key === activeTab
        const Icon = tab.icon

        return (
          <button
            key={tab.key}
            ref={(el) => (tabsRef.current[index] = el)}
            onClick={() => onTabChange(tab.key)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            role="tab"
            aria-selected={isActive}
            aria-controls={`${tab.key}-panel`}
            tabIndex={isActive ? 0 : -1}
            className={[
              'relative flex items-center gap-[var(--space-2)] rounded-[var(--radius-md)]',
              'px-[var(--space-4)] py-[var(--space-2)] text-[var(--text-sm)] font-[var(--font-medium)]',
              'transition-colors outline-none',
              'focus-visible:ring-2 focus-visible:ring-[var(--interactive-default)] focus-visible:ring-inset',
              isActive
                ? 'text-[var(--color-fg-default)]'
                : 'text-[var(--color-fg-subtle)] hover:text-[var(--color-fg-muted)]',
            ].join(' ')}
            style={{
              transitionDuration: 'var(--duration-normal)',
            }}
          >
            {isActive && (
              <motion.div
                layoutId={`${layoutId}-indicator`}
                className="absolute inset-0 rounded-[var(--radius-md)] bg-[var(--color-bg-glass-active)]"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-[var(--space-2)]">
              {Icon && <Icon size={16} />}
              {tab.label}
            </span>
            {isActive && (
              <motion.div
                layoutId={`${layoutId}-underline`}
                className="absolute bottom-0 left-[var(--space-2)] right-[var(--space-2)] h-0.5 rounded-full"
                style={{
                  backgroundImage:
                    'linear-gradient(to right, var(--accent-active, #8b5cf6), #3b82f6)',
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}
