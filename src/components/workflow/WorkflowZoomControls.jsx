import { Plus, Minus, Maximize2, LayoutGrid } from 'lucide-react'
import Tooltip from '../ui/Tooltip'

export default function WorkflowZoomControls({
  scale = 1,
  onZoomIn,
  onZoomOut,
  onReset,
  onTidy,
  minZoom = 0.25,
  maxZoom = 2.0,
}) {
  const pct = Math.round(scale * 100)

  return (
    <div className="absolute bottom-4 right-4 z-30 flex items-center gap-1 rounded-2xl border border-[var(--color-border-default)] bg-[var(--color-bg-emphasis)] px-2 py-1.5 shadow-xl shadow-black/20">
      <Tooltip content="Zoom out">
        <button
          onClick={onZoomOut}
          disabled={scale <= minZoom}
          className="rounded-md p-1.5 text-[var(--color-fg-muted)] transition-colors hover:bg-[var(--color-bg-glass-hover)] hover:text-[var(--color-fg-default)] disabled:pointer-events-none disabled:opacity-30"
        >
          <Minus size={14} />
        </button>
      </Tooltip>

      <span className="min-w-[3rem] select-none text-center text-xs font-medium text-[var(--color-fg-muted)]">
        {pct}%
      </span>

      <Tooltip content="Zoom in">
        <button
          onClick={onZoomIn}
          disabled={scale >= maxZoom}
          className="rounded-md p-1.5 text-[var(--color-fg-muted)] transition-colors hover:bg-[var(--color-bg-glass-hover)] hover:text-[var(--color-fg-default)] disabled:pointer-events-none disabled:opacity-30"
        >
          <Plus size={14} />
        </button>
      </Tooltip>

      <div className="mx-0.5 h-4 w-px bg-[var(--color-border-default)]" />

      <Tooltip content="Fit to view">
        <button
          onClick={onReset}
          className="rounded-md p-1.5 text-[var(--color-fg-muted)] transition-colors hover:bg-[var(--color-bg-glass-hover)] hover:text-[var(--color-fg-default)]"
        >
          <Maximize2 size={14} />
        </button>
      </Tooltip>

      {onTidy && (
        <>
          <div className="mx-0.5 h-4 w-px bg-[var(--color-border-default)]" />
          <Tooltip content="Tidy layout">
            <button
              onClick={onTidy}
              className="rounded-md p-1.5 text-[var(--color-fg-muted)] transition-colors hover:bg-[var(--color-bg-glass-hover)] hover:text-[var(--color-fg-default)]"
            >
              <LayoutGrid size={14} />
            </button>
          </Tooltip>
        </>
      )}
    </div>
  )
}
