export default function SectionHeader({
  icon: Icon,
  children,
  action,
  color,
  count,
  tags,
  live,
  className = '',
}) {
  const accentColor = color || 'var(--accent-default)'

  return (
    <div className={['flex items-center gap-3', 'mb-[var(--space-4)]', className].join(' ')}>
      <div className="h-5 w-1 shrink-0 rounded-full" style={{ backgroundColor: accentColor }} />
      {Icon && <Icon size={16} style={{ color: accentColor }} />}
      <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-fg-default)]">
        {children}
      </h3>
      {count !== undefined && count !== null && (
        <span className="rounded-full bg-[var(--color-bg-glass)] px-2.5 py-0.5 text-[11px] font-medium text-[var(--color-fg-muted)]">
          {count}
        </span>
      )}
      {live && (
        <span className="flex items-center gap-1.5 rounded-full bg-[var(--color-success)]/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[var(--color-success)]">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--color-success)]" />
          Live
        </span>
      )}
      {tags && tags.length > 0 && (
        <div className="flex items-center gap-1.5">
          {tags.map((tag) => (
            <span
              key={tag.label}
              className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
              style={{
                backgroundColor: `color-mix(in srgb, ${tag.color || accentColor} 15%, transparent)`,
                color: tag.color || accentColor,
              }}
            >
              {tag.label}
            </span>
          ))}
        </div>
      )}
      <div className="flex-1" />
      {action}
    </div>
  )
}
