import { useState } from 'react'
import { ChevronDown, ChevronRight, Palette, Layers, FileText } from 'lucide-react'
import NodePalette from './NodePalette'
import LayersPanel from './LayersPanel'
import TemplatesPanel from './TemplatesPanel'

function CollapsibleSection({ icon: Icon, title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-[var(--color-border-muted)]">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 px-3 py-2.5 text-left transition-colors hover:bg-[var(--color-bg-glass)]"
      >
        {open ? (
          <ChevronDown size={12} className="text-[var(--color-fg-subtle)]" />
        ) : (
          <ChevronRight size={12} className="text-[var(--color-fg-subtle)]" />
        )}
        <Icon size={13} className="text-[var(--color-fg-subtle)]" />
        <span className="text-[var(--text-2xs)] font-semibold uppercase tracking-widest text-[var(--color-fg-subtle)]">
          {title}
        </span>
      </button>
      {open && <div className="px-3 pb-3">{children}</div>}
    </div>
  )
}

export default function WorkflowSidebar({ onAddNode, nodes = [], isExecuting }) {
  return (
    <div
      className="flex h-full w-56 shrink-0 flex-col border-r border-[var(--color-border-default)] overflow-y-auto"
      style={{ backgroundColor: 'var(--th-panel-light)' }}
    >
      <CollapsibleSection icon={Palette} title="Node Palette">
        <NodePalette
          onSelect={onAddNode}
          isOpen={true}
          onClose={() => {}}
          inline
          disabled={isExecuting}
        />
      </CollapsibleSection>

      <CollapsibleSection icon={Layers} title="Layers" defaultOpen={false}>
        <LayersPanel nodes={nodes} />
      </CollapsibleSection>

      <CollapsibleSection icon={FileText} title="Templates" defaultOpen={false}>
        <TemplatesPanel onAddNode={onAddNode} />
      </CollapsibleSection>
    </div>
  )
}
