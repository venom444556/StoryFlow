import { Link } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'

/**
 * Breadcrumbs - Navigation trail
 */
export default function Breadcrumbs({ items = [], className = '' }) {
  if (items.length === 0) return null

  return (
    <nav
      aria-label="Breadcrumb"
      className={['flex items-center gap-1', className].filter(Boolean).join(' ')}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1
        const Icon = item.icon

        return (
          <div key={item.href || item.label} className="flex items-center gap-1">
            {index > 0 && (
              <ChevronRight
                size={14}
                className="text-[var(--color-fg-subtle)]"
                aria-hidden="true"
              />
            )}

            {isLast ? (
              <span
                className="flex items-center gap-1.5 text-sm font-medium text-[var(--color-fg-default)]"
                aria-current="page"
              >
                {Icon && <Icon size={14} className="text-[var(--color-fg-muted)]" />}
                {item.label}
              </span>
            ) : item.href ? (
              <Link
                to={item.href}
                className="flex items-center gap-1.5 text-sm text-[var(--color-fg-muted)] transition-colors hover:text-[var(--color-fg-default)]"
              >
                {Icon && <Icon size={14} />}
                {item.label}
              </Link>
            ) : (
              <span className="flex items-center gap-1.5 text-sm text-[var(--color-fg-muted)]">
                {Icon && <Icon size={14} />}
                {item.label}
              </span>
            )}
          </div>
        )
      })}
    </nav>
  )
}

/**
 * Helper to create breadcrumb items
 */
export function createBreadcrumb(label, href, icon) {
  return { label, href, icon }
}
