export default function SectionHeader({ icon: Icon, children, action, className = '' }) {
  return (
    <div
      className={['flex items-center justify-between', 'mb-[var(--space-3)]', className].join(' ')}
    >
      <h3 className="flex items-center gap-[var(--space-2)] text-[var(--text-2xs)] font-semibold uppercase tracking-widest text-[var(--color-fg-subtle)]">
        {Icon && <Icon size={14} />}
        {children}
      </h3>
      {action}
    </div>
  )
}
