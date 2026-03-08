export default function StatusBar({ children, className = '' }) {
  return (
    <div
      className={[
        'flex items-center gap-[var(--space-4)] px-[var(--space-4)] py-[var(--space-2)]',
        'text-[var(--text-xs)] text-[var(--color-fg-subtle)]',
        'border-t border-[var(--color-border-muted)]',
        className,
      ].join(' ')}
      style={{ backgroundColor: 'var(--color-bg-statusbar)' }}
    >
      {children}
    </div>
  )
}
