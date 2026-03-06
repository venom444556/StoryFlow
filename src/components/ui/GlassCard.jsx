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
  onClick,
  as: Component = 'div',
  ...rest
}) {
  return (
    <Component
      className={[
        'glass-card',
        PADDING[padding] || PADDING.md,
        hover && 'transition-colors cursor-pointer',
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
