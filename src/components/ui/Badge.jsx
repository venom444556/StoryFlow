import React from 'react'
import { X } from 'lucide-react'

const VARIANTS = {
  default: 'bg-[var(--color-bg-glass-active)] text-[var(--color-fg-muted)]',
  purple: 'bg-[var(--badge-purple-bg)] text-[var(--badge-purple-fg)]',
  blue: 'bg-[var(--badge-blue-bg)] text-[var(--badge-blue-fg)]',
  green: 'bg-[var(--badge-green-bg)] text-[var(--badge-green-fg)]',
  yellow: 'bg-[var(--badge-yellow-bg)] text-[var(--badge-yellow-fg)]',
  red: 'bg-[var(--badge-red-bg)] text-[var(--badge-red-fg)]',
  pink: 'bg-[var(--badge-pink-bg)] text-[var(--badge-pink-fg)]',
  cyan: 'bg-[var(--badge-cyan-bg)] text-[var(--badge-cyan-fg)]',
  gray: 'bg-[var(--badge-gray-bg)] text-[var(--badge-gray-fg)]',
  // Semantic variants
  success: 'bg-[var(--color-success-subtle)] text-[var(--color-success)]',
  warning: 'bg-[var(--color-warning-subtle)] text-[var(--color-warning)]',
  error: 'bg-[var(--color-danger-subtle)] text-[var(--color-danger)]',
  info: 'bg-[var(--color-info-subtle)] text-[var(--color-info)]',
}

const OUTLINE_VARIANTS = {
  default: 'border-[var(--color-border-default)] text-[var(--color-fg-muted)]',
  purple: 'border-[var(--badge-purple-border)] text-[var(--badge-purple-fg)]',
  blue: 'border-[var(--badge-blue-border)] text-[var(--badge-blue-fg)]',
  green: 'border-[var(--badge-green-border)] text-[var(--badge-green-fg)]',
  yellow: 'border-[var(--badge-yellow-border)] text-[var(--badge-yellow-fg)]',
  red: 'border-[var(--badge-red-border)] text-[var(--badge-red-fg)]',
  pink: 'border-[var(--badge-pink-border)] text-[var(--badge-pink-fg)]',
  cyan: 'border-[var(--badge-cyan-border)] text-[var(--badge-cyan-fg)]',
  gray: 'border-[var(--badge-gray-border)] text-[var(--badge-gray-fg)]',
  success: 'border-[var(--color-success)]/40 text-[var(--color-success)]',
  warning: 'border-[var(--color-warning)]/40 text-[var(--color-warning)]',
  error: 'border-[var(--color-danger)]/40 text-[var(--color-danger)]',
  info: 'border-[var(--color-info)]/40 text-[var(--color-info)]',
}

const DOT_COLORS = {
  default: 'bg-[var(--color-fg-subtle)]',
  purple: 'bg-purple-400',
  blue: 'bg-blue-400',
  green: 'bg-green-400',
  yellow: 'bg-yellow-400',
  red: 'bg-red-400',
  pink: 'bg-pink-400',
  cyan: 'bg-cyan-400',
  gray: 'bg-gray-400',
  success: 'bg-[var(--color-success)]',
  warning: 'bg-[var(--color-warning)]',
  error: 'bg-[var(--color-danger)]',
  info: 'bg-[var(--color-info)]',
}

const SIZES = {
  xs: 'px-1.5 py-px text-[10px] leading-4',
  sm: 'px-2 py-0.5 text-[11px] leading-4',
  md: 'px-2.5 py-1 text-xs',
}

export default function Badge({
  children,
  variant = 'default',
  size = 'sm',
  dot = false,
  outline = false,
  removable = false,
  onRemove,
}) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1 rounded-full font-medium',
        outline
          ? `bg-transparent border ${OUTLINE_VARIANTS[variant] || OUTLINE_VARIANTS.default}`
          : VARIANTS[variant] || VARIANTS.default,
        SIZES[size] || SIZES.sm,
      ].join(' ')}
    >
      {dot && (
        <span
          className={['h-1.5 w-1.5 rounded-full', DOT_COLORS[variant] || DOT_COLORS.default].join(
            ' '
          )}
        />
      )}
      {children}
      {removable && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove?.()
          }}
          className={[
            'ml-0.5 rounded-full p-0.5 transition-colors',
            'hover:bg-[var(--color-bg-glass-hover)]',
            'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--interactive-default)]',
          ].join(' ')}
          style={{
            transitionDuration: 'var(--duration-fast)',
          }}
          aria-label="Remove"
        >
          <X size={10} />
        </button>
      )}
    </span>
  )
}
