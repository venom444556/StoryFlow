import { motion } from 'framer-motion'
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Play,
  Square,
  Layers,
  CheckSquare,
  Flag,
  GitBranch,
  Globe,
  Database,
  Code,
  Settings,
  ChevronRight,
} from 'lucide-react'
import { getNodeType } from '../../data/nodeTypes'
import { sanitizeColor } from '../../utils/sanitize'

// ---------------------------------------------------------------------------
// Icon lookup – maps the string icon name from nodeTypes to the component
// ---------------------------------------------------------------------------
const ICON_MAP = {
  Play,
  Square,
  Layers,
  CheckSquare,
  Flag,
  GitBranch,
  Globe,
  Database,
  Code,
}

// ---------------------------------------------------------------------------
// Status helpers
// ---------------------------------------------------------------------------
function getStatusStyles(status) {
  switch (status) {
    case 'running':
      return { borderColor: 'var(--color-warning)' }
    case 'success':
      return { borderColor: 'var(--color-success)' }
    case 'error':
      return { borderColor: 'var(--color-danger)' }
    default:
      return { borderColor: 'var(--color-border-default)' }
  }
}

function StatusIcon({ status }) {
  switch (status) {
    case 'running':
      return <Clock size={14} className="animate-spin text-[var(--color-warning)]" />
    case 'success':
      return <CheckCircle size={14} className="text-[var(--color-success)]" />
    case 'error':
      return <XCircle size={14} className="text-[var(--color-danger)]" />
    default:
      return null
  }
}

// ---------------------------------------------------------------------------
// Child stats helper – calculates sub-node status summary
// ---------------------------------------------------------------------------
function getChildStats(node) {
  const children = node.children?.nodes || []
  const total = children.length
  let completed = 0
  let failed = 0
  let running = 0

  for (const child of children) {
    switch (child.status) {
      case 'success':
        completed++
        break
      case 'error':
        failed++
        break
      case 'running':
        running++
        break
      default:
        break
    }
  }

  return { total, completed, failed, running }
}

// ---------------------------------------------------------------------------
// Config preview – shows a summary of what's configured on the node
// ---------------------------------------------------------------------------
function getConfigPreview(node) {
  const cfg = node.config || {}

  switch (node.type) {
    case 'api': {
      const method = cfg.method || 'GET'
      const url = cfg.url
      if (url) {
        const short = url.length > 28 ? url.slice(0, 26) + '\u2026' : url
        return `${method} ${short}`
      }
      return null
    }
    case 'database': {
      const q = cfg.query
      if (q) {
        return q.length > 34 ? q.slice(0, 32) + '\u2026' : q
      }
      return null
    }
    case 'code': {
      const s = cfg.script
      if (s) {
        return s.length > 34 ? s.slice(0, 32) + '\u2026' : s
      }
      return null
    }
    case 'decision': {
      const c = cfg.condition
      if (c) {
        return c.length > 32 ? c.slice(0, 30) + '\u2026' : c
      }
      return null
    }
    case 'task': {
      const a = cfg.assignee
      return a ? `Assignee: ${a}` : null
    }
    case 'milestone': {
      const d = cfg.dueDate
      return d ? `Due: ${d}` : null
    }
    case 'phase': {
      const desc = cfg.description
      if (desc) {
        return desc.length > 34 ? desc.slice(0, 32) + '\u2026' : desc
      }
      return null
    }
    default:
      return null
  }
}

function hasConfig(node) {
  const cfg = node.config || {}
  return Object.values(cfg).some((v) => v && String(v).trim())
}

// ---------------------------------------------------------------------------
// WorkflowNode — Neptune/Maximux visual treatment
// ---------------------------------------------------------------------------

/**
 * Visual representation of a single workflow node.
 *
 * Props:
 * - node           {object}      node data
 * - isSelected     {boolean}     whether the node is currently selected
 * - inConnections  {number}      number of incoming connections
 * - outConnections {number}      number of outgoing connections
 * - onMouseDown    {function}    handler for initiating drag
 * - onDoubleClick  {function}    handler for opening detail modal
 * - onContextMenu  {function}    handler for right-click context menu
 * - onStartConnect {function}    handler for starting a new connection
 * - onEndConnect   {function}    handler for completing a connection
 * - onDrillDown    {function}    handler for drilling into child nodes
 */
export default function WorkflowNode({
  node,
  isSelected = false,
  inConnections = 0,
  outConnections = 0,
  onMouseDown,
  onDoubleClick,
  onContextMenu,
  onStartConnect,
  onEndConnect,
  onDrillDown,
}) {
  const typeDef = getNodeType(node.type)
  const color = sanitizeColor(typeDef?.color, '#6b7280')
  const iconName = typeDef?.icon
  const TypeIcon = iconName ? ICON_MAP[iconName] : null

  const configPreview = getConfigPreview(node)
  const configured = hasConfig(node)
  const isTerminal = node.type === 'start' || node.type === 'end'

  const hasChildren = (node.children?.nodes?.length || 0) > 0
  const childStats = hasChildren ? getChildStats(node) : null

  const statusStyles = getStatusStyles(node.status)

  return (
    <motion.div
      data-workflow-node
      role="button"
      tabIndex={0}
      aria-label={`${node.title} (${typeDef?.label || node.type})${node.status !== 'idle' ? `, status: ${node.status}` : ''}`}
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className={[
        'absolute select-none rounded-2xl',
        isSelected && 'ring-2 ring-[var(--accent-cyan)]/50 ring-offset-2 ring-offset-transparent',
      ]
        .filter(Boolean)
        .join(' ')}
      style={{
        left: node.x,
        top: node.y,
        width: 220,
        zIndex: isSelected ? 20 : 2,
        cursor: 'grab',
        background: 'var(--color-bg-node)',
        border: `${node.status && node.status !== 'idle' ? '2px' : '1px'} solid ${statusStyles.borderColor || 'var(--color-border-default)'}`,
        transition: 'border-color 0.25s',
      }}
      onMouseDown={onMouseDown}
      onDoubleClick={(e) => {
        e.stopPropagation()
        onDoubleClick?.()
      }}
      onContextMenu={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onContextMenu?.(e)
      }}
    >
      {/* Top accent gradient — Neptune signature */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl"
        style={{
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          opacity: 0.7,
        }}
      />

      <div className="px-4 py-3">
        {/* Header row */}
        <div className="mb-2 flex items-center gap-2.5">
          {TypeIcon && (
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${color}18` }}
            >
              <TypeIcon size={15} style={{ color }} />
            </div>
          )}
          <span className="flex-1 truncate text-[13px] font-bold tracking-tight text-[var(--color-fg-default)]">
            {node.title}
          </span>
          <StatusIcon status={node.status} />
        </div>

        {/* Type label + config indicator */}
        <div className="flex items-center gap-2">
          <span
            className="inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wide"
            style={{
              backgroundColor: `${color}15`,
              color,
              border: `1px solid ${color}25`,
            }}
          >
            {typeDef?.label || node.type}
          </span>
          {!isTerminal && configured && (
            <Settings size={11} className="text-[var(--color-fg-subtle)]" />
          )}
          {!isTerminal && !configured && node.status === 'idle' && (
            <span className="text-[9px] italic text-[var(--color-fg-subtle)]">not configured</span>
          )}
        </div>

        {/* Config preview */}
        {configPreview && (
          <div
            className="mt-2.5 rounded-lg px-2.5 py-2 overflow-hidden"
            style={{
              backgroundColor: 'var(--color-bg-glass)',
              border: '1px solid var(--color-border-muted)',
            }}
          >
            <code
              className="block truncate text-[10px] leading-tight text-[var(--color-fg-muted)]"
              title={configPreview}
            >
              {configPreview}
            </code>
          </div>
        )}

        {/* Description preview */}
        {node.description && !configPreview && (
          <div className="mt-2.5">
            <p
              className="text-[10px] leading-relaxed text-[var(--color-fg-subtle)] line-clamp-3 break-words"
              title={node.description}
            >
              {node.description}
            </p>
          </div>
        )}

        {/* Error message */}
        {node.error && (
          <div className="mt-2.5 flex items-start gap-1.5 text-[11px] text-red-400">
            <AlertCircle size={12} className="mt-0.5 flex-shrink-0" />
            <span className="line-clamp-2" title={node.error}>
              {node.error}
            </span>
          </div>
        )}

        {/* ---- Sub-node progress section ---- */}
        {hasChildren && childStats && (
          <div className="mt-3">
            {/* Progress bar */}
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-bg-subtle)]">
              {/* Green (completed) segment */}
              {childStats.completed > 0 && (
                <div
                  className="inline-block h-full rounded-full bg-emerald-500"
                  style={{
                    width: `${(childStats.completed / childStats.total) * 100}%`,
                  }}
                />
              )}
              {/* Red (failed) segment */}
              {childStats.failed > 0 && (
                <div
                  className="inline-block h-full rounded-full bg-red-500"
                  style={{
                    width: `${(childStats.failed / childStats.total) * 100}%`,
                  }}
                />
              )}
            </div>

            {/* Step count + drill-down indicator */}
            <div className="mt-1.5 flex items-center justify-between">
              <span className="text-[10px] text-[var(--color-fg-subtle)]">
                {childStats.completed}/{childStats.total} steps
              </span>
              <button
                type="button"
                className="flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[9px] font-medium text-[var(--color-fg-muted)] transition-colors hover:bg-[var(--color-bg-glass-hover)] hover:text-[var(--color-fg-default)]"
                style={{ border: '1px solid var(--color-border-muted)' }}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation()
                  onDrillDown?.()
                }}
              >
                Expand
                <ChevronRight size={10} className="ml-px" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ---- Connection handles ---- */}

      {/* Input handle (left) — fixed at 38px from top to align with connection lines */}
      <div
        className="absolute -left-[7px] top-[38px]"
        onMouseUp={(e) => {
          e.stopPropagation()
          onEndConnect?.(e)
        }}
      >
        <div
          className="h-3.5 w-3.5 rounded-full border-2 transition-transform hover:scale-150 cursor-crosshair"
          style={{
            borderColor: 'var(--color-bg-emphasis)',
            backgroundColor: 'var(--accent-cyan, #06b6d4)',
          }}
        />
        {inConnections > 1 && (
          <span className="absolute -top-2.5 -left-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[var(--color-bg-subtle)] text-[8px] font-bold text-[var(--color-fg-default)]">
            {inConnections}
          </span>
        )}
      </div>

      {/* Output handle (right) — fixed at 38px from top to align with connection lines */}
      <div
        className="absolute -right-[7px] top-[38px]"
        onMouseDown={(e) => {
          e.stopPropagation()
          onStartConnect?.(e)
        }}
      >
        <div
          className="h-3.5 w-3.5 rounded-full border-2 transition-transform hover:scale-150 cursor-crosshair"
          style={{
            borderColor: 'var(--color-bg-emphasis)',
            backgroundColor: 'var(--accent-cyan, #06b6d4)',
          }}
        />
        {outConnections > 1 && (
          <span className="absolute -top-2.5 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[var(--color-bg-subtle)] text-[8px] font-bold text-[var(--color-fg-default)]">
            {outConnections}
          </span>
        )}
      </div>
    </motion.div>
  )
}
