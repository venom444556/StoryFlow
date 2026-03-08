const TYPE_STYLES = {
  epic: 'bg-[var(--badge-purple-bg)] text-[var(--badge-purple-fg)]',
  story: 'bg-[var(--badge-blue-bg)] text-[var(--badge-blue-fg)]',
  task: 'bg-[var(--badge-green-bg)] text-[var(--badge-green-fg)]',
  bug: 'bg-[var(--badge-red-bg)] text-[var(--badge-red-fg)]',
}

export default function TypeBadge({ type, className = '' }) {
  if (!type) return null
  return (
    <span
      className={[
        'inline-flex items-center rounded px-1.5 py-px',
        'text-[9px] font-bold uppercase tracking-wider',
        TYPE_STYLES[type] || TYPE_STYLES.task,
        className,
      ].join(' ')}
    >
      {type}
    </span>
  )
}
