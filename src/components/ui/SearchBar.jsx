import React from 'react'
import { Search, X } from 'lucide-react'

export default function SearchBar({
  value,
  onChange,
  placeholder = 'Search...',
  className = '',
  size = 'md',
}) {
  const handleClear = () => {
    onChange({ target: { value: '' } })
  }

  const sizeClasses = {
    sm: 'py-[var(--space-1)] pl-[var(--space-8)] pr-[var(--space-8)] text-[var(--text-xs)]',
    md: 'py-[var(--space-2)] pl-[var(--space-10)] pr-[var(--space-10)] text-[var(--text-sm)]',
    lg: 'py-[var(--space-3)] pl-[var(--space-12)] pr-[var(--space-12)] text-[var(--text-base)]',
  }

  const iconSizes = { sm: 14, md: 16, lg: 18 }

  return (
    <div className={['relative w-full', className].filter(Boolean).join(' ')}>
      <Search
        size={iconSizes[size] || 16}
        className="pointer-events-none absolute left-[var(--space-3)] top-1/2 -translate-y-1/2 text-[var(--color-fg-subtle)]"
      />
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={[
          'glass-input w-full rounded-[var(--radius-xl)]',
          'text-[var(--color-fg-default)] placeholder-[var(--color-input-placeholder)]',
          'focus-visible:outline-none',
          sizeClasses[size] || sizeClasses.md,
        ].join(' ')}
      />
      {value && (
        <button
          onClick={handleClear}
          className={[
            'absolute right-[var(--space-3)] top-1/2 -translate-y-1/2',
            'rounded-full p-0.5 text-[var(--color-fg-subtle)] transition-colors',
            'hover:bg-[var(--color-bg-glass-hover)] hover:text-[var(--color-fg-default)]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--interactive-default)]',
          ].join(' ')}
          style={{ transitionDuration: 'var(--duration-fast)' }}
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}
