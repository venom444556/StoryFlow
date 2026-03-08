const PADDING = {
  none: '',
  sm: 'p-[var(--space-4)]',
  md: 'p-[var(--space-7)]',
  lg: 'p-[var(--space-10)]',
}

export default function GlassCard({
  children,
  className = '',
  hover = false,
  padding = 'md',
  variant,
  onClick,
  as: Component = 'div',
  ...rest
}) {
  const isObsidian = variant === 'obsidian'

  return (
    <Component
      className={[
        isObsidian ? '' : 'glass-card',
        PADDING[padding] || PADDING.md,
        isObsidian && 'rounded-[var(--radius-lg)]',
        hover && 'transition-colors cursor-pointer',
        onClick && !hover && 'cursor-pointer',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{
        ...(isObsidian && {
          background: 'var(--color-bg-obsidian)',
          border: '1px solid var(--color-bg-obsidian-border)',
        }),
        transitionDuration: 'var(--duration-normal)',
        transitionTimingFunction: 'var(--ease-default)',
      }}
      onClick={onClick}
      {...rest}
    >
      {children}
    </Component>
  )
}
