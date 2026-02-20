import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play,
  Square,
  Layers,
  CheckSquare,
  Flag,
  GitBranch,
  Globe,
  Database,
  Code,
} from 'lucide-react'
import NODE_TYPES from '../../data/nodeTypes'
import { sanitizeColor } from '../../utils/sanitize'

// ---------------------------------------------------------------------------
// Icon lookup (mirrors WorkflowNode)
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
// NodePalette
// ---------------------------------------------------------------------------

/**
 * Dropdown panel that displays all available node types.
 * The user clicks a card to add that node type to the canvas.
 *
 * Props:
 * - onSelect  {function}  called with the full node type definition object
 * - isOpen    {boolean}   whether the palette is visible
 * - onClose   {function}  callback to close the palette
 */
export default function NodePalette({ onSelect, isOpen, onClose }) {
  const panelRef = useRef(null)

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose?.()
      }
    }

    // Use a timeout so the opening click doesn't immediately close it
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside)
    }, 0)

    return () => {
      clearTimeout(timer)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={panelRef}
          initial={{ opacity: 0, y: -8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.96 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="absolute left-0 top-full z-50 mt-2 w-[360px] rounded-xl border border-[var(--color-border-default)] p-3 shadow-2xl backdrop-blur-2xl"
          style={{ backgroundColor: 'var(--th-panel-heavy)' }}
        >
          <h4 className="mb-2.5 px-1 text-xs font-semibold uppercase tracking-wider text-[var(--color-fg-muted)]">
            Choose a Node Type
          </h4>

          <div className="grid grid-cols-3 gap-2">
            {NODE_TYPES.map((typeDef) => {
              const Icon = ICON_MAP[typeDef.icon]
              return (
                <button
                  key={typeDef.type}
                  onClick={() => onSelect?.(typeDef)}
                  className="group flex flex-col items-center gap-1.5 rounded-lg border border-transparent bg-[var(--color-bg-glass)] px-2 py-3 text-center transition-all duration-150 hover:border-[var(--color-border-emphasis)] hover:bg-[var(--color-bg-glass-hover)]"
                >
                  {Icon && (
                    <Icon
                      size={20}
                      style={{ color: sanitizeColor(typeDef.color) }}
                      className="transition-transform duration-150 group-hover:scale-110"
                    />
                  )}
                  <span className="text-xs font-medium text-[var(--color-fg-default)]">
                    {typeDef.label}
                  </span>
                  <span className="line-clamp-2 text-[10px] leading-tight text-[var(--color-fg-muted)]">
                    {typeDef.description}
                  </span>
                </button>
              )
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
