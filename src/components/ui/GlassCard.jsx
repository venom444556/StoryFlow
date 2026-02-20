const PADDING = {
  none: '',
  sm: 'p-[var(--space-3)]',
  md: 'p-[var(--space-5)]',
  lg: 'p-[var(--space-8)]',
}

export default function GlassCard({
  children,
  className = '',
  hover = false,
  padding = 'md',
  onClick,
  as: Component = 'div',
  ...rest
}) {
  return (
    <Component
      className={[
        'glass-card',
        PADDING[padding] || PADDING.md,
        hover && 'transition-all hover:scale-[1.02] hover:brightness-110 cursor-pointer',
        onClick && !hover && 'cursor-pointer',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{
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
