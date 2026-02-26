import { Edit3, Trash2, Clock, History, Pin, PinOff } from 'lucide-react'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import MarkdownRenderer from './MarkdownRenderer'
import { formatRelative } from '../../utils/dates'

const STATUS_VARIANT = {
  draft: 'yellow',
  published: 'green',
}

export default function PageViewer({ page, onEdit, onDelete, onTogglePin, onShowVersions }) {
  if (!page) return null

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="shrink-0 border-b border-[var(--color-border-default)] pb-4">
        <div className="flex items-start justify-between gap-4">
          {/* Title block */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              {page.icon && <span className="text-3xl leading-none">{page.icon}</span>}
              <h1 className="text-2xl font-bold text-[var(--color-fg-default)]">
                {page.title || 'Untitled'}
              </h1>
            </div>

            {/* Meta row */}
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge variant={STATUS_VARIANT[page.status] || 'default'} size="sm">
                {page.status || 'draft'}
              </Badge>

              {page.labels?.map((label) => (
                <Badge key={label} variant="purple" size="xs">
                  {label}
                </Badge>
              ))}

              {page.updatedAt && (
                <span className="flex items-center gap-1 text-xs text-[var(--color-fg-subtle)]">
                  <Clock size={12} />
                  Updated {formatRelative(page.updatedAt)}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex shrink-0 items-center gap-2">
            {onTogglePin && (
              <Button
                variant="ghost"
                size="sm"
                icon={page.pinned ? PinOff : Pin}
                onClick={() => onTogglePin(page.id)}
                title={page.pinned ? 'Unpin page' : 'Pin page'}
              />
            )}
            {onShowVersions && page.versions?.length > 0 && (
              <Button variant="ghost" size="sm" icon={History} onClick={onShowVersions}>
                History ({page.versions.length})
              </Button>
            )}
            <Button variant="secondary" size="sm" icon={Edit3} onClick={onEdit}>
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              icon={Trash2}
              onClick={onDelete}
              className="text-red-400 hover:text-red-300"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto py-6 pr-2">
        <MarkdownRenderer content={page.content} />
      </div>
    </div>
  )
}
