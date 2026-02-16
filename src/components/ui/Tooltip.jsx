import React, { useState } from 'react'

const POSITIONS = {
  top: {
    tooltip: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    arrow:
      'top-full left-1/2 -translate-x-1/2 border-t-[var(--color-bg-overlay)] border-x-transparent border-b-transparent border-4',
  },
  bottom: {
    tooltip: 'top-full left-1/2 -translate-x-1/2 mt-2',
    arrow:
      'bottom-full left-1/2 -translate-x-1/2 border-b-[var(--color-bg-overlay)] border-x-transparent border-t-transparent border-4',
  },
  left: {
    tooltip: 'right-full top-1/2 -translate-y-1/2 mr-2',
    arrow:
      'left-full top-1/2 -translate-y-1/2 border-l-[var(--color-bg-overlay)] border-y-transparent border-r-transparent border-4',
  },
  right: {
    tooltip: 'left-full top-1/2 -translate-y-1/2 ml-2',
    arrow:
      'right-full top-1/2 -translate-y-1/2 border-r-[var(--color-bg-overlay)] border-y-transparent border-l-transparent border-4',
  },
}

export default function Tooltip({ children, content, position = 'top', showArrow = true }) {
  const [visible, setVisible] = useState(false)
  const pos = POSITIONS[position] || POSITIONS.top

  if (!content) return children

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      <div
        className={[
          'pointer-events-none absolute whitespace-nowrap',
          'rounded-[var(--radius-md)] bg-[var(--color-bg-overlay)] px-[var(--space-3)] py-[var(--space-2)]',
          'text-[var(--text-xs)] font-[var(--font-medium)] text-[var(--color-fg-default)]',
          'shadow-lg transition-all',
          pos.tooltip,
          visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95',
        ].join(' ')}
        style={{
          zIndex: 'var(--z-tooltip)',
          transitionDuration: 'var(--duration-fast)',
          transitionTimingFunction: 'var(--ease-default)',
        }}
        role="tooltip"
      >
        {content}
        {showArrow && <span className={['absolute', pos.arrow].join(' ')} />}
      </div>
    </div>
  )
}
