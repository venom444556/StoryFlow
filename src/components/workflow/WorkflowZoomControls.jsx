import React from 'react'
import { Plus, Minus, Maximize2 } from 'lucide-react'
import Tooltip from '../ui/Tooltip'

export default function WorkflowZoomControls({
  scale = 1,
  onZoomIn,
  onZoomOut,
  onReset,
  minZoom = 0.25,
  maxZoom = 2.0,
}) {
  const pct = Math.round(scale * 100)

  return (
    <div className="absolute bottom-4 right-4 z-30 flex items-center gap-1 rounded-lg border border-white/[0.08] bg-slate-900/80 px-1.5 py-1 shadow-lg backdrop-blur-xl">
      <Tooltip content="Zoom out">
        <button
          onClick={onZoomOut}
          disabled={scale <= minZoom}
          className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white disabled:pointer-events-none disabled:opacity-30"
        >
          <Minus size={14} />
        </button>
      </Tooltip>

      <span className="min-w-[3rem] select-none text-center text-xs font-medium text-slate-400">
        {pct}%
      </span>

      <Tooltip content="Zoom in">
        <button
          onClick={onZoomIn}
          disabled={scale >= maxZoom}
          className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white disabled:pointer-events-none disabled:opacity-30"
        >
          <Plus size={14} />
        </button>
      </Tooltip>

      <div className="mx-0.5 h-4 w-px bg-white/[0.08]" />

      <Tooltip content="Fit to view">
        <button
          onClick={onReset}
          className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
        >
          <Maximize2 size={14} />
        </button>
      </Tooltip>
    </div>
  )
}
