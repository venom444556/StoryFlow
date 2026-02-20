import { useState } from 'react'
import { RotateCcw, ChevronDown, ChevronUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import MarkdownRenderer from './MarkdownRenderer'
import { formatDateTime } from '../../utils/dates'

function VersionItem({ version, onRestore }) {
  const [expanded, setExpanded] = useState(false)
  const preview = version.content?.substring(0, 120)?.replace(/\n/g, ' ') || '(empty)'

  return (
    <div className="glass-card overflow-hidden rounded-lg">
      {/* Summary row */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--color-bg-glass-hover)]"
      >
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-[var(--color-fg-default)]">
            {version.summary || 'Auto-save'}
          </p>
          <p className="mt-0.5 text-xs text-[var(--color-fg-muted)]">
            {formatDateTime(version.editedAt)}
          </p>
          {!expanded && (
            <p className="mt-1 truncate text-xs text-[var(--color-fg-subtle)]">{preview}</p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            icon={RotateCcw}
            onClick={(e) => {
              e.stopPropagation()
              onRestore(version)
            }}
          >
            Restore
          </Button>

          {expanded ? (
            <ChevronUp size={14} className="text-[var(--color-fg-muted)]" />
          ) : (
            <ChevronDown size={14} className="text-[var(--color-fg-muted)]" />
          )}
        </div>
      </button>

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-[var(--color-border-default)]"
          >
            <div className="max-h-72 overflow-y-auto px-4 py-3">
              <MarkdownRenderer content={version.content} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function VersionHistory({ isOpen, onClose, versions = [], onRestore }) {
  // Sort newest first
  const sorted = [...versions].sort((a, b) => new Date(b.editedAt) - new Date(a.editedAt))

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Version History" size="lg">
      {sorted.length === 0 ? (
        <p className="py-8 text-center text-sm text-[var(--color-fg-muted)]">
          No previous versions recorded.
        </p>
      ) : (
        <div className="space-y-2">
          {sorted.map((version) => (
            <VersionItem
              key={version.id}
              version={version}
              onRestore={(v) => {
                onRestore(v)
                onClose()
              }}
            />
          ))}
        </div>
      )}
    </Modal>
  )
}
