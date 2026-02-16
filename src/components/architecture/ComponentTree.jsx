import { useState, useMemo } from 'react'
import { ChevronRight, ChevronDown, Plus, Network } from 'lucide-react'
import Badge from '../ui/Badge'
import Button from '../ui/Button'
import GlassCard from '../ui/GlassCard'
import EmptyState from '../ui/EmptyState'
import { TYPE_COLORS } from './constants'

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

  return (
    <div>
      <button
        onClick={() => onSelect(node.id)}
        aria-expanded={hasChildren ? expanded : undefined}
        aria-label={`${node.name} (${node.type || 'component'})`}
        className={[
          'group flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-all duration-200',
          isSelected
            ? 'bg-[var(--color-bg-glass-hover)] text-[var(--color-fg-default)]'
            : 'text-[var(--color-fg-default)] hover:bg-[var(--color-bg-glass)] hover:text-[var(--color-fg-default)]',
        ].join(' ')}
        style={{
          paddingLeft: `${depth * 16 + 8}px`,
          ...(isDimmed ? { opacity: 0.3, pointerEvents: 'none' } : {}),
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
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </span>
        ) : (
          <span className="h-4 w-4 shrink-0" />
        )}

        <Badge variant={TYPE_COLORS[node.type] || 'default'} size="xs">
          {node.type || 'component'}
        </Badge>
        <span className="truncate">{node.name}</span>
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
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-fg-muted)]">
          Components
        </h3>
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
