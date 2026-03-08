import { FileCode, RefreshCw } from 'lucide-react'

const TEMPLATES = [
  {
    name: 'API Auth Loop',
    description: 'Token refresh with retry logic',
    icon: RefreshCw,
    nodes: [
      { type: 'api', label: 'Auth Request' },
      { type: 'decision', label: 'Token Valid?' },
      { type: 'api', label: 'Refresh Token' },
    ],
  },
  {
    name: 'Data Sync',
    description: 'Fetch, transform, and store data',
    icon: FileCode,
    nodes: [
      { type: 'api', label: 'Fetch Data' },
      { type: 'code', label: 'Transform' },
      { type: 'database', label: 'Store' },
    ],
  },
]

export default function TemplatesPanel({ onAddNode }) {
  return (
    <div className="space-y-2">
      {TEMPLATES.map((template) => {
        const Icon = template.icon
        return (
          <button
            key={template.name}
            onClick={() => {
              // Add all template nodes sequentially
              template.nodes.forEach((node) => {
                onAddNode?.({ ...node, type: node.type })
              })
            }}
            className="flex w-full items-start gap-2.5 rounded-lg border border-[var(--color-border-muted)] bg-[var(--color-bg-glass)] px-3 py-2.5 text-left transition-colors hover:border-[var(--color-border-emphasis)] hover:bg-[var(--color-bg-glass-hover)]"
          >
            <Icon size={14} className="mt-0.5 shrink-0 text-[var(--color-fg-subtle)]" />
            <div className="min-w-0">
              <p className="text-xs font-medium text-[var(--color-fg-default)]">{template.name}</p>
              <p className="text-[var(--text-2xs)] text-[var(--color-fg-subtle)]">
                {template.description}
              </p>
            </div>
          </button>
        )
      })}
    </div>
  )
}
