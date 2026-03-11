import { Loader2 } from 'lucide-react'

const VARIANTS = {
  primary: [
    'text-[var(--color-fg-on-accent)]',
    'hover:shadow-[var(--shadow-button-primary)]',
    'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--interactive-default)]',
    'focus-visible:ring-offset-[var(--color-bg-base)]',
    'active:scale-[0.98]',
  ].join(' '),
  secondary: [
    'glass text-[var(--color-fg-muted)] hover:text-[var(--color-fg-default)]',
    'hover:bg-[var(--color-bg-glass-hover)]',
    'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--interactive-default)]',
    'focus-visible:ring-offset-[var(--color-bg-base)]',
    'active:scale-[0.98]',
  ].join(' '),
  danger: [
    'bg-[var(--color-danger)] text-[var(--color-fg-on-accent)]',
    'hover:opacity-90',
    'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-danger)]',
    'focus-visible:ring-offset-[var(--color-bg-base)]',
    'active:scale-[0.98]',
  ].join(' '),
  ghost: [
    'bg-transparent text-[var(--color-fg-muted)]',
    'hover:bg-[var(--color-bg-glass-hover)] hover:text-[var(--color-fg-default)]',
    'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--interactive-default)]',
    'focus-visible:ring-offset-[var(--color-bg-base)]',
    'active:scale-[0.98]',
  ].join(' '),
  outline: [
    'bg-transparent border border-[var(--color-border-default)] text-[var(--color-fg-muted)]',
    'hover:border-[var(--color-border-emphasis)] hover:text-[var(--color-fg-default)] hover:bg-[var(--color-bg-glass)]',
    'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--interactive-default)]',
    'focus-visible:ring-offset-[var(--color-bg-base)]',
    'active:scale-[0.98]',
  ].join(' '),
}

const SIZES = {
  sm: 'h-[var(--size-input-sm)] px-[var(--space-4)] text-[var(--text-xs)] gap-[var(--space-2)]',
  md: 'h-[var(--size-input-md)] px-[var(--space-5)] text-[var(--text-sm)] gap-[var(--space-2)]',
  lg: 'h-[var(--size-input-lg)] px-[var(--space-7)] text-[var(--text-base)] gap-[var(--space-3)]',
}

const ICON_SIZES = {
  sm: 14,
  md: 16,
  lg: 18,
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconRight: IconRight,
  disabled = false,
  isLoading = false,
  onClick,
  className = '',
  type = 'button',
  as: Component,
  ...rest
}) {
  const Tag = Component || 'button'
  const isButton = Tag === 'button'
  const isPrimary = (variant || 'primary') === 'primary'
  const isDanger = variant === 'danger'
  const isDisabled = disabled || isLoading

  // Primary and danger get pill shape; others get rounded-lg
  const radiusClass =
    isPrimary || isDanger ? 'rounded-[var(--radius-pill)]' : 'rounded-[var(--radius-lg)]'

  return (
    <Tag
      {...(isButton ? { type } : {})}
      className={[
        `inline-flex items-center justify-center whitespace-nowrap ${radiusClass} font-medium`,
        'transition-all outline-none',
        VARIANTS[variant] || VARIANTS.primary,
        SIZES[size] || SIZES.md,
        isDisabled && 'opacity-50 cursor-not-allowed pointer-events-none',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{
        transitionDuration: 'var(--duration-normal)',
        transitionTimingFunction: 'var(--ease-default)',
        ...(isPrimary
          ? {
              background:
                'linear-gradient(135deg, var(--accent-default), var(--interactive-hover))',
              boxShadow: 'var(--shadow-button-primary)',
            }
          : {}),
      }}
      onClick={isDisabled ? undefined : onClick}
      disabled={isButton ? isDisabled : undefined}
      aria-disabled={isDisabled || undefined}
      {...rest}
    >
      {isLoading ? (
        <Loader2 size={ICON_SIZES[size] || 16} className="animate-spin" />
      ) : (
        Icon && <Icon size={ICON_SIZES[size] || 16} />
      )}
      {children}
      {!isLoading && IconRight && <IconRight size={ICON_SIZES[size] || 16} />}
    </Tag>
  )
}
