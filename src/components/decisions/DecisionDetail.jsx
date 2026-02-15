import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  X,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  Calendar,
  Scale,
} from 'lucide-react'
import GlassCard from '../ui/GlassCard'
import Button from '../ui/Button'
import Select from '../ui/Select'
import TagInput from '../ui/TagInput'
import { formatDate } from '../../utils/dates'
import { generateId } from '../../utils/ids'

const STATUS_OPTIONS = [
  { value: 'proposed', label: 'Proposed' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'superseded', label: 'Superseded' },
]

const STATUS_CONFIG = {
  proposed: { variant: 'yellow' },
  accepted: { variant: 'green' },
  superseded: { variant: 'gray' },
}

function InlineTextArea({ value, onChange, placeholder, rows = 3, className = '' }) {
  return (
    <textarea
      value={value || ''}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      className={[
        'glass-input w-full resize-none px-3 py-2 text-sm text-[var(--color-fg-default)] placeholder-[var(--color-fg-muted)]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    />
  )
}

function SectionHeader({ children, className = '' }) {
  return (
    <h4
      className={[
        'mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-fg-muted)]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </h4>
  )
}

function AlternativeItem({ alt, index, onUpdate, onRemove }) {
  const [expanded, setExpanded] = useState(true)

  return (
    <div className="rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-glass)] p-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setExpanded((prev) => !prev)}
          className="flex items-center gap-2 text-sm font-medium text-[var(--color-fg-default)] transition-colors hover:text-[var(--color-fg-default)]"
        >
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          <span>{alt.name || `Alternative ${index + 1}`}</span>
        </button>
        <button
          onClick={onRemove}
          className="rounded-md p-1 text-[var(--color-fg-muted)] transition-colors hover:bg-red-500/20 hover:text-red-400"
        >
          <Trash2 size={13} />
        </button>
      </div>

      {expanded && (
        <div className="mt-3 space-y-3">
          <div>
            <label className="mb-1 block text-xs text-[var(--color-fg-muted)]">Name</label>
            <input
              value={alt.name || ''}
              onChange={(e) => onUpdate({ ...alt, name: e.target.value })}
              placeholder="Alternative name"
              className="glass-input w-full px-3 py-1.5 text-sm text-[var(--color-fg-default)] placeholder-[var(--color-fg-muted)]"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-green-400/80">Pros</label>
              <InlineTextArea
                value={alt.pros}
                onChange={(e) => onUpdate({ ...alt, pros: e.target.value })}
                placeholder="Advantages of this option..."
                rows={2}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-red-400/80">Cons</label>
              <InlineTextArea
                value={alt.cons}
                onChange={(e) => onUpdate({ ...alt, cons: e.target.value })}
                placeholder="Disadvantages of this option..."
                rows={2}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function DecisionDetail({ decision, onUpdate, onClose }) {
  const handleFieldChange = useCallback(
    (field) => (e) => {
      onUpdate(decision.id, { [field]: e.target.value })
    },
    [decision.id, onUpdate]
  )

  const handleStatusChange = useCallback(
    (e) => {
      onUpdate(decision.id, { status: e.target.value })
    },
    [decision.id, onUpdate]
  )

  const handleTagsChange = useCallback(
    (tags) => {
      onUpdate(decision.id, { tags })
    },
    [decision.id, onUpdate]
  )

  const handleAddAlternative = useCallback(() => {
    const alternatives = [...(decision.alternatives || [])]
    alternatives.push({ id: generateId(), name: '', pros: '', cons: '' })
    onUpdate(decision.id, { alternatives })
  }, [decision.id, decision.alternatives, onUpdate])

  const handleUpdateAlternative = useCallback(
    (index, updated) => {
      const alternatives = [...(decision.alternatives || [])]
      alternatives[index] = updated
      onUpdate(decision.id, { alternatives })
    },
    [decision.id, decision.alternatives, onUpdate]
  )

  const handleRemoveAlternative = useCallback(
    (index) => {
      const alternatives = (decision.alternatives || []).filter((_, i) => i !== index)
      onUpdate(decision.id, { alternatives })
    },
    [decision.id, decision.alternatives, onUpdate]
  )

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="flex h-full flex-col"
    >
      <GlassCard padding="none" className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--color-border-default)] px-5 py-4">
          <div className="flex items-center gap-2.5">
            <Scale size={18} className="text-purple-400" />
            <span className="text-sm font-semibold text-[var(--color-fg-default)]">Decision Detail</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[var(--color-fg-muted)] transition-colors hover:bg-[var(--color-bg-glass-hover)] hover:text-[var(--color-fg-default)]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          <div className="space-y-6">
            {/* Title & Status */}
            <div>
              <SectionHeader>Title & Status</SectionHeader>
              <div className="space-y-3">
                <input
                  value={decision.title || ''}
                  onChange={handleFieldChange('title')}
                  placeholder="Decision title"
                  className="glass-input w-full px-3 py-2 text-base font-semibold text-[var(--color-fg-default)] placeholder-[var(--color-fg-muted)]"
                />
                <Select
                  label="Status"
                  value={decision.status}
                  options={STATUS_OPTIONS}
                  onChange={handleStatusChange}
                />
              </div>
            </div>

            {/* Context */}
            <div>
              <SectionHeader>Context</SectionHeader>
              <p className="mb-2 text-xs text-[var(--color-fg-muted)]">
                What prompted this decision?
              </p>
              <InlineTextArea
                value={decision.context}
                onChange={handleFieldChange('context')}
                placeholder="Describe the context and forces at play..."
                rows={3}
              />
            </div>

            {/* Decision */}
            <div>
              <SectionHeader>Decision</SectionHeader>
              <p className="mb-2 text-xs text-[var(--color-fg-muted)]">
                What was decided?
              </p>
              <InlineTextArea
                value={decision.decision}
                onChange={handleFieldChange('decision')}
                placeholder="Describe the decision that was made..."
                rows={3}
              />
            </div>

            {/* Alternatives */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <SectionHeader className="mb-0">Alternatives Considered</SectionHeader>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={Plus}
                  onClick={handleAddAlternative}
                >
                  Add
                </Button>
              </div>
              {(decision.alternatives || []).length > 0 ? (
                <div className="space-y-2.5">
                  {decision.alternatives.map((alt, i) => (
                    <AlternativeItem
                      key={alt.id || i}
                      alt={alt}
                      index={i}
                      onUpdate={(updated) => handleUpdateAlternative(i, updated)}
                      onRemove={() => handleRemoveAlternative(i)}
                    />
                  ))}
                </div>
              ) : (
                <p className="rounded-lg border border-dashed border-[var(--color-border-default)] py-4 text-center text-xs text-[var(--color-fg-muted)]">
                  No alternatives recorded yet
                </p>
              )}
            </div>

            {/* Consequences */}
            <div>
              <SectionHeader>Consequences</SectionHeader>
              <p className="mb-2 text-xs text-[var(--color-fg-muted)]">
                What are the implications?
              </p>
              <InlineTextArea
                value={decision.consequences}
                onChange={handleFieldChange('consequences')}
                placeholder="Describe the expected consequences..."
                rows={3}
              />
            </div>

            {/* Tags */}
            <div>
              <SectionHeader>Tags</SectionHeader>
              <TagInput
                tags={decision.tags || []}
                onChange={handleTagsChange}
                placeholder="Add tag..."
                suggestions={['architecture', 'database', 'frontend', 'backend', 'security', 'performance', 'ux', 'api', 'infrastructure', 'testing']}
              />
            </div>

            {/* Metadata */}
            <div className="rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-glass)] p-3">
              <SectionHeader>Metadata</SectionHeader>
              <div className="space-y-1.5 text-xs text-[var(--color-fg-muted)]">
                {decision.createdAt && (
                  <div className="flex items-center gap-2">
                    <Calendar size={12} />
                    <span>Created: {formatDate(decision.createdAt)}</span>
                  </div>
                )}
                {decision.updatedAt && (
                  <div className="flex items-center gap-2">
                    <Calendar size={12} />
                    <span>Updated: {formatDate(decision.updatedAt)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  )
}
