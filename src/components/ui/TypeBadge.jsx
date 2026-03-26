export default function TypeBadge({ type, className = '' }) {
  if (!type) return null
  const colors = {
    epic: 'text-[var(--color-info)]',
    story: 'text-[var(--color-success)]',
    task: 'text-[var(--color-fg-muted)]',
    bug: 'text-[var(--color-danger)]',
  }
  return (
    <span
      className={[
        'text-[10px] font-mono font-bold uppercase tracking-widest',
        colors[type] || colors.task,
        className,
      ].join(' ')}
    >
      [{type}]
    </span>
  )
}
