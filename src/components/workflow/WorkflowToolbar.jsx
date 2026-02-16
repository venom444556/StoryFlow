import React, { useState } from 'react'
import { Play, RotateCcw, Plus, Loader2, GitBranch, Link } from 'lucide-react'
import NodePalette from './NodePalette'

// ---------------------------------------------------------------------------
// WorkflowToolbar
// ---------------------------------------------------------------------------

/**
 * Horizontal toolbar rendered above the workflow canvas.
 *
 * Props:
 * - onAddNode        {function}   called with the selected node type definition
 * - onExecute        {function}   triggers workflow execution
 * - onReset          {function}   resets all node statuses
 * - isExecuting      {boolean}    whether the workflow is currently running
 * - nodeCount        {number}     total number of nodes in the workflow
 * - connectionCount  {number}     total number of connections
 */
export default function WorkflowToolbar({
  onAddNode,
  onExecute,
  onReset,
  isExecuting = false,
  nodeCount = 0,
  connectionCount = 0,
  hideExecution = false,
}) {
  const [paletteOpen, setPaletteOpen] = useState(false)

  const handleSelect = (typeDef) => {
    onAddNode?.(typeDef)
    setPaletteOpen(false)
  }

  return (
    <div className="glass relative z-10 flex items-center justify-between gap-4 px-4 py-2.5">
      {/* Left – add node */}
      <div className="relative flex items-center gap-2">
        <button
          onClick={() => setPaletteOpen((prev) => !prev)}
          disabled={isExecuting}
          className={[
            'inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-200',
            isExecuting
              ? 'cursor-not-allowed bg-[var(--color-bg-glass)] text-[var(--color-fg-muted)]'
              : 'bg-[var(--color-bg-glass)] text-[var(--color-fg-default)] hover:bg-[var(--color-bg-glass-hover)] hover:text-[var(--color-fg-default)]',
          ].join(' ')}
        >
          <Plus size={16} />
          Add Node
        </button>

        {/* Palette dropdown */}
        <NodePalette
          isOpen={paletteOpen}
          onClose={() => setPaletteOpen(false)}
          onSelect={handleSelect}
        />
      </div>

      {/* Center – execute & reset */}
      {!hideExecution && (
        <div className="flex items-center gap-2">
          <button
            onClick={onExecute}
            disabled={isExecuting}
            className={[
              'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200',
              isExecuting
                ? 'cursor-not-allowed bg-green-900/30 text-green-500/60'
                : 'bg-green-600 text-[var(--color-fg-default)] shadow-lg shadow-green-600/25 hover:bg-green-500',
            ].join(' ')}
          >
            {isExecuting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play size={16} />
                Execute
              </>
            )}
          </button>

          <button
            onClick={onReset}
            disabled={isExecuting}
            className={[
              'inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-200',
              isExecuting
                ? 'cursor-not-allowed bg-[var(--color-bg-glass)] text-[var(--color-fg-muted)]'
                : 'bg-[var(--color-bg-glass)] text-[var(--color-fg-default)] hover:bg-[var(--color-bg-glass-hover)] hover:text-[var(--color-fg-default)]',
            ].join(' ')}
          >
            <RotateCcw size={15} />
            Reset
          </button>
        </div>
      )}

      {/* Right – stats */}
      <div className="flex items-center gap-4 text-xs text-[var(--color-fg-muted)]">
        <span className="inline-flex items-center gap-1.5">
          <GitBranch size={13} />
          {nodeCount} node{nodeCount !== 1 ? 's' : ''}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Link size={13} />
          {connectionCount} connection{connectionCount !== 1 ? 's' : ''}
        </span>
        {isExecuting && (
          <span className="ml-2 inline-flex items-center gap-1.5 text-yellow-400">
            <Loader2 size={13} className="animate-spin" />
            Executing...
          </span>
        )}
      </div>
    </div>
  )
}
