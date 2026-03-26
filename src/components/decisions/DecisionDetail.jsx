import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  X,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  Calendar,
  Bot,
  User,
  MessageSquare,
  Send,
} from 'lucide-react'
import GlassCard from '../ui/GlassCard'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import Select from '../ui/Select'
import TagInput from '../ui/TagInput'
import ProvenanceBadge from '../ui/ProvenanceBadge'
import ConfirmDialog from '../ui/ConfirmDialog'
import { formatDate, formatRelative } from '../../utils/dates'
import { generateId } from '../../utils/ids'

const STATUS_OPTIONS = [
  { value: 'proposed', label: 'Proposed' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'superseded', label: 'Superseded' },
  { value: 'deprecated', label: 'Deprecated' },
]

const STATUS_VARIANT = {
  proposed: 'yellow',
  accepted: 'green',
  superseded: 'gray',
  deprecated: 'red',
}

function InlineTextArea({ value, onChange, placeholder, className = '' }) {
  const rowCount = Math.max(1, (value || '').split('\n').length)
  return (
    <textarea
      value={value || ''}
      onChange={onChange}
      placeholder={placeholder}
      rows={rowCount}
      className={[
        'w-full resize-none bg-transparent px-2 py-1.5 -ml-2 rounded-md text-[13px] leading-relaxed text-[var(--color-fg-default)] placeholder-[var(--color-fg-muted)] hover:bg-[var(--color-bg-subtle)] focus:bg-[var(--color-bg-subtle)] focus:ring-1 focus:ring-[var(--color-border-emphasis)] outline-none transition-colors border-none',
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
        'mb-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-fg-subtle)]',
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
    <div className="rounded-xl border border-[var(--color-border-default)] bg-transparent p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="flex items-center gap-2 text-[13px] font-semibold text-[var(--color-fg-default)] transition-colors hover:text-[var(--color-accent)]"
        >
          <span className="text-[var(--color-fg-subtle)]">
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </span>
          <span>{alt.name || `Alternative ${index + 1}`}</span>
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="rounded-md p-1.5 text-[var(--color-fg-muted)] transition-colors hover:bg-red-500/10 hover:text-red-400"
        >
          <Trash2 size={13} />
        </button>
      </div>

      {expanded && (
        <div className="mt-4 space-y-4">
          <div>
            <label className="mb-1.5 block text-[11px] font-medium text-[var(--color-fg-muted)]">
              Name
            </label>
            <input
              value={alt.name || ''}
              onChange={(e) => onUpdate({ ...alt, name: e.target.value })}
              placeholder="Alternative name"
              className="w-full bg-transparent border border-[var(--color-border-default)] rounded-lg px-3 py-2 text-[13px] text-[var(--color-fg-default)] placeholder-[var(--color-fg-muted)] hover:border-[var(--color-border-emphasis)] focus:border-[var(--accent-default)] focus:ring-1 focus:ring-[var(--accent-default)] outline-none transition-all"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[11px] font-medium text-[var(--color-success)] opacity-90">
                Pros
              </label>
              <div className="rounded-lg border border-[var(--color-success)]/20 bg-[var(--color-success)]/5 p-1 px-2">
                <InlineTextArea
                  value={alt.pros}
                  onChange={(e) => onUpdate({ ...alt, pros: e.target.value })}
                  placeholder="Advantages of this option..."
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-medium text-[var(--color-danger)] opacity-90">
                Cons
              </label>
              <div className="rounded-lg border border-[var(--color-danger)]/20 bg-[var(--color-danger)]/5 p-1 px-2">
                <InlineTextArea
                  value={alt.cons}
                  onChange={(e) => onUpdate({ ...alt, cons: e.target.value })}
                  placeholder="Disadvantages of this option..."
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function CommentItem({ comment }) {
  const isAi = comment.author === 'ai'
  return (
    <div className="flex gap-3">
      <div
        className={[
          'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs',
          isAi
            ? 'bg-[var(--color-ai-bg)] text-[var(--color-ai-accent)]'
            : 'bg-[var(--color-bg-glass-hover)] text-[var(--color-fg-muted)]',
        ].join(' ')}
      >
        {isAi ? <Bot size={14} /> : <User size={14} />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-[var(--color-fg-default)]">
            {isAi ? 'AI Agent' : 'Human'}
          </span>
          {comment.createdAt && (
            <span className="text-[10px] text-[var(--color-fg-subtle)]">
              {formatRelative(comment.createdAt)}
            </span>
          )}
        </div>
        <p className="mt-1 text-sm leading-relaxed text-[var(--color-fg-muted)]">{comment.text}</p>
      </div>
    </div>
  )
}

export default function DecisionDetail({ decision, index = 0, onUpdate, onClose }) {
  const [removeAltId, setRemoveAltId] = useState(null)
  const [commentText, setCommentText] = useState('')

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

  const handleRequestRemoveAlternative = useCallback((altId) => {
    setRemoveAltId(altId)
  }, [])

  const handleConfirmRemoveAlternative = useCallback(() => {
    if (removeAltId === null) return
    const alternatives = (decision.alternatives || []).filter((a) => a.id !== removeAltId)
    onUpdate(decision.id, { alternatives })
    setRemoveAltId(null)
  }, [removeAltId, decision.id, decision.alternatives, onUpdate])

  const handleAddComment = useCallback(() => {
    if (!commentText.trim()) return
    const comments = [...(decision.comments || [])]
    comments.push({
      id: generateId(),
      author: 'human',
      text: commentText.trim(),
      createdAt: new Date().toISOString(),
    })
    onUpdate(decision.id, { comments })
    setCommentText('')
  }, [commentText, decision.id, decision.comments, onUpdate])

  const statusVariant = STATUS_VARIANT[decision.status] || 'default'

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="flex h-full flex-col"
    >
      <GlassCard
        padding="none"
        className="flex flex-1 flex-col overflow-hidden border-0 border-l border-[var(--color-bg-obsidian-border)] rounded-none rounded-r-[var(--radius-lg)]"
      >
        {/* Header — ADR number + title + status */}
        <div className="border-b border-[var(--color-border-default)] px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-fg-subtle)]">
                  {decision.sequenceNumber
                    ? `ADR-${String(decision.sequenceNumber).padStart(3, '0')}`
                    : 'ADR'}
                </span>
                <Badge variant={statusVariant} size="sm" outline>
                  {decision.status || 'proposed'}
                </Badge>
                {decision.createdBy && (
                  <ProvenanceBadge
                    actor={decision.createdBy}
                    reasoning={decision.createdByReasoning}
                    timestamp={decision.createdAt}
                    size="xs"
                  />
                )}
              </div>
              <input
                value={decision.title || ''}
                onChange={handleFieldChange('title')}
                placeholder="Decision title"
                className="w-full bg-transparent text-lg font-semibold text-[var(--color-fg-default)] placeholder-[var(--color-fg-muted)] hover:bg-[var(--color-bg-subtle)] focus:bg-[var(--color-bg-subtle)] px-2 -ml-2 py-1 mt-1 rounded transition-colors outline-none border-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={decision.status}
                options={STATUS_OPTIONS}
                onChange={handleStatusChange}
                className="w-32"
              />
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-[var(--color-fg-muted)] transition-colors hover:bg-[var(--color-bg-glass-hover)] hover:text-[var(--color-fg-default)]"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          <div className="space-y-6">
            {/* AI proposer card */}
            {decision.createdBy === 'ai' && (
              <div className="flex items-center gap-3 rounded-lg border border-[var(--color-ai-border)] bg-[var(--color-ai-bg)] px-4 py-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-ai-accent)]/20 text-[var(--color-ai-accent)]">
                  <Bot size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-medium text-[var(--color-ai-accent)]">
                    Proposed by AI Agent
                  </span>
                  {decision.createdByReasoning && (
                    <p className="mt-0.5 text-xs text-[var(--color-fg-muted)]">
                      {decision.createdByReasoning}
                    </p>
                  )}
                </div>
                {decision.confidence !== undefined && decision.confidence !== null && (
                  <div className="shrink-0 text-right">
                    <span className="text-lg font-semibold text-[var(--color-ai-accent)]">
                      {Math.round(decision.confidence * 100)}%
                    </span>
                    <p className="text-[10px] text-[var(--color-fg-subtle)]">confidence</p>
                  </div>
                )}
              </div>
            )}

            {/* Context */}
            <div>
              <SectionHeader>Context</SectionHeader>
              <InlineTextArea
                value={decision.context}
                onChange={handleFieldChange('context')}
                placeholder="Describe the context and forces at play..."
                rows={3}
              />
            </div>

            {/* Decision — styled as quote block */}
            <div>
              <SectionHeader>Decision</SectionHeader>
              <div className="rounded-lg border-l-4 border-l-[var(--color-border-emphasis)] bg-[var(--color-bg-glass)] pl-4 pr-3 py-3">
                <InlineTextArea
                  value={decision.decision}
                  onChange={handleFieldChange('decision')}
                  placeholder="Describe the decision that was made..."
                  rows={3}
                  className="bg-transparent"
                />
              </div>
            </div>

            {/* Alternatives Analysis */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <SectionHeader className="mb-0">Alternatives Considered</SectionHeader>
                <Button variant="ghost" size="sm" icon={Plus} onClick={handleAddAlternative}>
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
                      onRemove={() => handleRequestRemoveAlternative(alt.id)}
                    />
                  ))}
                </div>
              ) : (
                <p className="rounded-lg border border-dashed border-[var(--color-border-default)] py-4 text-center text-xs text-[var(--color-fg-muted)]">
                  No alternatives recorded yet
                </p>
              )}
            </div>

            {/* Consequences — positive / negative grid */}
            <div>
              <SectionHeader>Consequences</SectionHeader>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-success)]">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--color-success)]" />
                    Positive
                  </label>
                  <div className="rounded-lg border border-[var(--color-success)]/20 bg-[var(--color-success)]/5 px-2 py-1">
                    <InlineTextArea
                      value={decision.consequencesPositive || decision.consequences || ''}
                      onChange={(e) =>
                        onUpdate(decision.id, { consequencesPositive: e.target.value })
                      }
                      placeholder="Benefits and positive outcomes..."
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-danger)]">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--color-danger)]" />
                    Negative
                  </label>
                  <div className="rounded-lg border border-[var(--color-danger)]/20 bg-[var(--color-danger)]/5 px-2 py-1">
                    <InlineTextArea
                      value={decision.consequencesNegative || ''}
                      onChange={(e) =>
                        onUpdate(decision.id, { consequencesNegative: e.target.value })
                      }
                      placeholder="Trade-offs and risks..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div>
              <SectionHeader>Tags</SectionHeader>
              <TagInput
                tags={decision.tags || []}
                onChange={handleTagsChange}
                placeholder="Add tag..."
                suggestions={[
                  'architecture',
                  'database',
                  'frontend',
                  'backend',
                  'security',
                  'performance',
                  'ux',
                  'api',
                  'infrastructure',
                  'testing',
                ]}
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

            {/* Comment Thread */}
            <div>
              <SectionHeader>
                <span className="flex items-center gap-1.5">
                  <MessageSquare size={12} />
                  Discussion ({(decision.comments || []).length})
                </span>
              </SectionHeader>
              {(decision.comments || []).length > 0 && (
                <div className="mb-4 space-y-4">
                  {decision.comments.map((comment) => (
                    <CommentItem key={comment.id} comment={comment} />
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleAddComment()
                    }
                  }}
                  placeholder="Add a comment..."
                  className="glass-input flex-1 px-3 py-2 text-sm text-[var(--color-fg-default)] placeholder-[var(--color-fg-muted)]"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  icon={Send}
                  onClick={handleAddComment}
                  disabled={!commentText.trim()}
                />
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Remove alternative confirmation */}
      <ConfirmDialog
        isOpen={removeAltId !== null}
        onClose={() => setRemoveAltId(null)}
        onConfirm={handleConfirmRemoveAlternative}
        title="Remove alternative?"
        message="This alternative and its pros/cons will be removed. This cannot be undone."
        confirmLabel="Remove"
      />
    </motion.div>
  )
}
