import { useState, useMemo } from 'react'
import { ChevronRight, ChevronDown, Plus, Network, Folder, FolderOpen } from 'lucide-react'
import Badge from '../ui/Badge'
import Button from '../ui/Button'
import GlassCard from '../ui/GlassCard'
import EmptyState from '../ui/EmptyState'
import { TYPE_COLORS, TYPE_HEX_COLORS, TYPE_ICONS } from './constants'
import { sanitizeColor } from '../../utils/sanitize'

// Build a tree structure from the flat components array
function buildTree(components) {
  const map = {}
  const roots = []

  components.forEach((comp) => {
    map[comp.id] = { ...comp, children: [] }
  })

  components.forEach((comp) => {
    if (comp.parentId && map[comp.parentId]) {
      map[comp.parentId].children.push(map[comp.id])
    } else {
      roots.push(map[comp.id])
    }
  })

  return roots
}

function TreeNode({ node, selectedId, onSelect, depth = 0, highlightIds }) {
  const [expanded, setExpanded] = useState(true)
  const hasChildren = node.children && node.children.length > 0
  const isSelected = selectedId === node.id
  const isDimmed = highlightIds && !highlightIds.has(node.id)
  const TypeIcon = TYPE_ICONS[node.type] || null
  const hexColor = sanitizeColor(TYPE_HEX_COLORS[node.type], '#6b7280')

  return (
    <div>
      <button
        onClick={() => onSelect(node.id)}
        aria-expanded={hasChildren ? expanded : undefined}
        aria-label={`${node.name} (${node.type || 'component'})`}
        className={[
          'group flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm transition-all duration-150',
          isSelected
            ? 'bg-[var(--color-bg-glass-hover)] text-[var(--color-fg-default)]'
            : 'text-[var(--color-fg-muted)] hover:bg-[var(--color-bg-glass)] hover:text-[var(--color-fg-default)]',
        ].join(' ')}
        style={{
          paddingLeft: `${depth * 16 + 8}px`,
          ...(isDimmed ? { opacity: 0.2, pointerEvents: 'none' } : {}),
        }}
      >
        {hasChildren ? (
          <span
            onClick={(e) => {
              e.stopPropagation()
              setExpanded((prev) => !prev)
            }}
            className="flex h-4 w-4 shrink-0 items-center justify-center text-[var(--color-fg-muted)] hover:text-[var(--color-fg-default)]"
          >
            {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </span>
        ) : (
          <span className="h-4 w-4 shrink-0" />
        )}

        {TypeIcon && <TypeIcon size={14} style={{ color: hexColor }} className="shrink-0" />}

        <span className="min-w-0 flex-1 truncate" title={node.name}>
          {node.name}
        </span>

        <Badge variant={TYPE_COLORS[node.type] || 'default'} size="xs">
          {node.type || 'component'}
        </Badge>
      </button>

      {hasChildren && expanded && (
        <div>
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              selectedId={selectedId}
              onSelect={onSelect}
              depth={depth + 1}
              highlightIds={highlightIds}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function ComponentTree({ components, selectedId, onSelect, onAdd, highlightIds }) {
  const tree = useMemo(() => buildTree(components), [components])

  return (
    <GlassCard className="flex flex-1 flex-col overflow-hidden">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--color-fg-default)]">Components</h3>
        <Button variant="ghost" size="sm" icon={Plus} onClick={onAdd}>
          Add
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto -mx-2">
        {tree.length > 0 ? (
          <div className="space-y-0.5">
            {tree.map((node) => (
              <TreeNode
                key={node.id}
                node={node}
                selectedId={selectedId}
                onSelect={onSelect}
                highlightIds={highlightIds}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Network}
            title="No components yet"
            description="Add your first component to start building your architecture."
            action={{
              label: 'Add Component',
              onClick: onAdd,
            }}
          />
        )}
      </div>
    </GlassCard>
  )
}
