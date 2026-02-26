import { useState, useCallback, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, Trash2, Plus, Check, MessageSquare, Clock, ListChecks, Send } from 'lucide-react'
import IssueTypeIcon from './IssueTypeIcon'
import Select from '../ui/Select'
import TextArea from '../ui/TextArea'
import TagInput from '../ui/TagInput'
import Avatar from '../ui/Avatar'
import ConfirmDialog from '../ui/ConfirmDialog'
import { ISSUE_TYPES, PRIORITIES } from '../../utils/constants'
import { generateId } from '../../utils/ids'
import { getSuggestions } from '../../utils/labelDefinitions'
import { formatDistanceStrict } from 'date-fns'

const TYPE_OPTIONS = [
  { value: ISSUE_TYPES.EPIC, label: 'Epic' },
  { value: ISSUE_TYPES.STORY, label: 'Story' },
  { value: ISSUE_TYPES.TASK, label: 'Task' },
  { value: ISSUE_TYPES.BUG, label: 'Bug' },
  { value: ISSUE_TYPES.SUBTASK, label: 'Subtask' },
]

const PRIORITY_OPTIONS = [
  { value: PRIORITIES.CRITICAL, label: 'Critical' },
  { value: PRIORITIES.HIGH, label: 'High' },
  { value: PRIORITIES.MEDIUM, label: 'Medium' },
  { value: PRIORITIES.LOW, label: 'Low' },
]

const STATUS_OPTIONS = [
  { value: 'To Do', label: 'To Do' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Done', label: 'Done' },
]

const ASSIGNEE_OPTIONS = [
  { value: '', label: 'Unassigned' },
  { value: 'Claude', label: 'Claude' },
  { value: 'User', label: 'User' },
]

function SectionHeader({ icon: Icon, children }) {
  return (
    <div className="mb-2 flex items-center gap-2">
      {Icon && <Icon size={14} className="text-[var(--color-fg-muted)]" />}
      <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-fg-muted)]">
        {children}
      </h4>
    </div>
  )
}

function formatDate(isoString) {
  if (!isoString) return ''
  const d = new Date(isoString)
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function IssueDetail({
  issue,
  onUpdate,
  onDelete,
  onClose,
  allIssues = [],
  sprints = [],
}) {
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleDraft, setTitleDraft] = useState('')
  const [newSubtask, setNewSubtask] = useState('')
  const [newComment, setNewComment] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const epics = useMemo(
    () =>
      allIssues
        .filter((i) => i.type === 'epic' && i.id !== issue?.id)
        .map((i) => ({ value: i.id, label: `${i.key} - ${i.title}` })),
    [allIssues, issue?.id]
  )

  const epicOptions = useMemo(() => [{ value: '', label: 'No Epic' }, ...epics], [epics])

  const sprintOptions = useMemo(
    () => [
      { value: '', label: 'No Sprint' },
      ...sprints.map((s) => ({ value: s.id, label: s.name })),
    ],
    [sprints]
  )

  const handleUpdate = useCallback(
    (updates) => {
      onUpdate?.(issue.id, updates)
    },
    [issue?.id, onUpdate]
  )

  const handleTitleSave = () => {
    const trimmed = titleDraft.trim()
    if (trimmed && trimmed !== issue.title) {
      handleUpdate({ title: trimmed })
    }
    setEditingTitle(false)
  }

  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleTitleSave()
    }
    if (e.key === 'Escape') {
      setEditingTitle(false)
    }
  }

  const handleAddSubtask = () => {
    const trimmed = newSubtask.trim()
    if (!trimmed) return
    const subtask = { id: generateId(), title: trimmed, completed: false }
    handleUpdate({ subtasks: [...(issue.subtasks || []), subtask] })
    setNewSubtask('')
  }

  const handleToggleSubtask = (subtaskId) => {
    const updated = (issue.subtasks || []).map((st) =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    )
    handleUpdate({ subtasks: updated })
  }

  const handleDeleteSubtask = (subtaskId) => {
    handleUpdate({
      subtasks: (issue.subtasks || []).filter((st) => st.id !== subtaskId),
    })
  }

  const handleAddComment = () => {
    const trimmed = newComment.trim()
    if (!trimmed) return
    const comment = {
      id: generateId(),
      text: trimmed,
      author: 'User',
      createdAt: new Date().toISOString(),
    }
    handleUpdate({ comments: [...(issue.comments || []), comment] })
    setNewComment('')
  }

  const handleCommentKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleAddComment()
    }
  }

  if (!issue) return null

  const subtasksTotal = (issue.subtasks || []).length
  const subtasksDone = (issue.subtasks || []).filter((s) => s.completed).length

  return (
    <>
      <AnimatePresence>
        <motion.div
          key="issue-detail-panel"
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="fixed right-0 top-0 flex h-full w-[480px] max-w-full flex-col border-l border-[var(--color-border-default)] backdrop-blur-2xl"
          style={{ backgroundColor: 'var(--th-panel-solid)', zIndex: 'var(--z-drawer)' }}
        >
          {/* Header */}
          <div className="flex shrink-0 items-start gap-3 border-b border-[var(--color-border-default)] px-5 py-4">
            <IssueTypeIcon type={issue.type} size={20} />
            <div className="min-w-0 flex-1">
              <span className="mb-0.5 block text-xs font-medium text-[var(--color-fg-muted)]">
                {issue.key}
              </span>
              {editingTitle ? (
                <input
                  type="text"
                  value={titleDraft}
                  onChange={(e) => setTitleDraft(e.target.value)}
                  onBlur={handleTitleSave}
                  onKeyDown={handleTitleKeyDown}
                  autoFocus
                  className="w-full border-none bg-transparent text-base font-semibold text-[var(--color-fg-default)] outline-none"
                />
              ) : (
                <h2
                  className="cursor-pointer truncate text-base font-semibold text-[var(--color-fg-default)] transition-colors"
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = 'var(--accent-active, #8b5cf6)')
                  }
                  onMouseLeave={(e) => (e.currentTarget.style.color = '')}
                  onClick={() => {
                    setTitleDraft(issue.title)
                    setEditingTitle(true)
                  }}
                >
                  {issue.title}
                </h2>
              )}
            </div>
            <button
              onClick={onClose}
              aria-label="Close issue detail"
              className="shrink-0 rounded-lg p-1.5 text-[var(--color-fg-muted)] transition-colors hover:bg-[var(--color-bg-glass-hover)] hover:text-[var(--color-fg-default)]"
            >
              <X size={18} />
            </button>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-5 py-4">
            <div className="space-y-5">
              {/* Type / Status / Priority selectors */}
              <div className="grid grid-cols-3 gap-3">
                <Select
                  label="Type"
                  value={issue.type}
                  onChange={(e) => handleUpdate({ type: e.target.value })}
                  options={TYPE_OPTIONS}
                />
                <Select
                  label="Status"
                  value={issue.status}
                  onChange={(e) => handleUpdate({ status: e.target.value })}
                  options={STATUS_OPTIONS}
                />
                <Select
                  label="Priority"
                  value={issue.priority}
                  onChange={(e) => handleUpdate({ priority: e.target.value })}
                  options={PRIORITY_OPTIONS}
                />
              </div>

              {/* Description */}
              <div>
                <TextArea
                  label="Description"
                  value={issue.description || ''}
                  onChange={(e) => handleUpdate({ description: e.target.value })}
                  placeholder="Add a description..."
                  rows={4}
                />
              </div>

              {/* Details row: Points, Assignee */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-sm text-[var(--color-fg-muted)]">
                    Story Points
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={issue.storyPoints ?? ''}
                    onChange={(e) =>
                      handleUpdate({
                        storyPoints: e.target.value === '' ? null : Number(e.target.value),
                      })
                    }
                    placeholder="--"
                    className="glass-input w-full px-3 py-2 text-sm text-[var(--color-fg-default)] placeholder-[var(--color-fg-muted)]"
                  />
                </div>
                <Select
                  label="Assignee"
                  value={issue.assignee || ''}
                  onChange={(e) =>
                    handleUpdate({
                      assignee: e.target.value || null,
                    })
                  }
                  options={ASSIGNEE_OPTIONS}
                />
              </div>

              {/* Epic & Sprint row */}
              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="Epic"
                  value={issue.epicId || ''}
                  onChange={(e) =>
                    handleUpdate({
                      epicId: e.target.value || null,
                    })
                  }
                  options={epicOptions}
                />
                <Select
                  label="Sprint"
                  value={issue.sprintId || ''}
                  onChange={(e) =>
                    handleUpdate({
                      sprintId: e.target.value || null,
                    })
                  }
                  options={sprintOptions}
                />
              </div>

              {/* Labels */}
              <div>
                <label className="mb-1.5 block text-sm text-[var(--color-fg-muted)]">Labels</label>
                <TagInput
                  tags={issue.labels || []}
                  onChange={(labels) => handleUpdate({ labels })}
                  placeholder="Add label..."
                  suggestions={getSuggestions()}
                />
              </div>

              {/* Subtasks */}
              <div>
                <SectionHeader icon={ListChecks}>
                  Subtasks{' '}
                  {subtasksTotal > 0 && (
                    <span className="ml-1 font-normal text-[var(--color-fg-subtle)]">
                      ({subtasksDone}/{subtasksTotal})
                    </span>
                  )}
                </SectionHeader>

                {/* Progress bar for subtasks */}
                {subtasksTotal > 0 && (
                  <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-[var(--color-bg-glass)]">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${(subtasksDone / subtasksTotal) * 100}%`,
                        backgroundImage:
                          'linear-gradient(to right, var(--accent-active, #8b5cf6), #3b82f6)',
                      }}
                    />
                  </div>
                )}

                {/* Subtask list */}
                <div className="space-y-1">
                  {(issue.subtasks || []).map((st) => (
                    <div
                      key={st.id}
                      className="group/st flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-[var(--color-bg-glass-hover)]"
                    >
                      <button
                        onClick={() => handleToggleSubtask(st.id)}
                        className={[
                          'flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-all',
                          st.completed
                            ? 'border-green-500/40 bg-green-500/20 text-green-400'
                            : 'border-[var(--color-border-emphasis)] text-transparent hover:border-[var(--color-border-emphasis)]',
                        ].join(' ')}
                      >
                        <Check size={10} />
                      </button>
                      <span
                        className={[
                          'flex-1 text-sm',
                          st.completed
                            ? 'text-[var(--color-fg-muted)] line-through'
                            : 'text-[var(--color-fg-muted)]',
                        ].join(' ')}
                      >
                        {st.title}
                      </span>
                      <button
                        onClick={() => handleDeleteSubtask(st.id)}
                        className="shrink-0 rounded p-0.5 text-[var(--color-fg-subtle)] opacity-0 transition-all hover:bg-red-500/10 hover:text-red-400 group-hover/st:opacity-100"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add subtask input */}
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="text"
                    value={newSubtask}
                    onChange={(e) => setNewSubtask(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddSubtask()
                      }
                    }}
                    placeholder="Add subtask..."
                    className="glass-input flex-1 px-3 py-1.5 text-sm text-[var(--color-fg-default)] placeholder-[var(--color-fg-muted)]"
                  />
                  <button
                    onClick={handleAddSubtask}
                    disabled={!newSubtask.trim()}
                    className="rounded-md p-1.5 text-[var(--color-fg-muted)] transition-colors hover:bg-[var(--color-bg-glass-hover)] hover:text-[var(--color-fg-default)] disabled:pointer-events-none disabled:opacity-30"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Comments */}
              <div>
                <SectionHeader icon={MessageSquare}>
                  Comments
                  {(issue.comments || []).length > 0 && (
                    <span className="ml-1 font-normal text-[var(--color-fg-subtle)]">
                      ({(issue.comments || []).length})
                    </span>
                  )}
                </SectionHeader>

                {/* Comments list */}
                <div className="space-y-3">
                  {(issue.comments || []).map((comment) => (
                    <div
                      key={comment.id}
                      className="rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-glass)] px-3 py-2.5"
                    >
                      <div className="mb-1.5 flex items-center gap-2">
                        <Avatar name={comment.author} size="sm" />
                        <span className="text-xs font-medium text-[var(--color-fg-muted)]">
                          {comment.author}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-[var(--color-fg-subtle)]">
                          <Clock size={9} />
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--color-fg-muted)]">
                        {comment.text}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Add comment */}
                <div className="mt-2 flex items-end gap-2">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={handleCommentKeyDown}
                    placeholder="Write a comment... (Enter to send)"
                    rows={2}
                    className="glass-input flex-1 resize-none px-3 py-2 text-sm text-[var(--color-fg-default)] placeholder-[var(--color-fg-muted)]"
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    className="rounded-lg p-2 text-[var(--color-fg-muted)] transition-colors disabled:pointer-events-none disabled:opacity-30"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor =
                        'rgba(var(--accent-active-rgb, 139, 92, 246), 0.1)'
                      e.currentTarget.style.color = 'var(--accent-active, #8b5cf6)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = ''
                      e.currentTarget.style.color = ''
                    }}
                  >
                    <Send size={14} />
                  </button>
                </div>
              </div>

              {/* Timestamps */}
              <div className="border-t border-[var(--color-border-default)] pt-4">
                <div className="grid grid-cols-2 gap-4 text-xs text-[var(--color-fg-subtle)]">
                  <div>
                    <span className="text-[var(--color-fg-muted)]">Created:</span>{' '}
                    {formatDate(issue.createdAt)}
                  </div>
                  <div>
                    <span className="text-[var(--color-fg-muted)]">Updated:</span>{' '}
                    {formatDate(issue.updatedAt)}
                  </div>
                </div>

                {/* Phase timestamps & durations */}
                {(issue.todoAt || issue.inProgressAt || issue.doneAt) && (
                  <div className="mt-3 space-y-2">
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--color-fg-subtle)]">
                      {issue.todoAt && (
                        <div>
                          <span className="text-[var(--color-fg-faint)]">To Do:</span>{' '}
                          {formatDate(issue.todoAt)}
                        </div>
                      )}
                      {issue.inProgressAt && (
                        <div>
                          <span className="text-blue-400">In Progress:</span>{' '}
                          {formatDate(issue.inProgressAt)}
                        </div>
                      )}
                      {issue.doneAt && (
                        <div>
                          <span className="text-green-400">Done:</span> {formatDate(issue.doneAt)}
                        </div>
                      )}
                    </div>

                    {/* Calculated durations */}
                    {(issue.inProgressAt || issue.doneAt) && (
                      <div className="flex flex-wrap gap-x-3 gap-y-1">
                        {issue.todoAt && issue.inProgressAt && (
                          <span className="rounded-md bg-[var(--color-bg-glass-hover)] px-2 py-0.5 text-[10px] text-[var(--color-fg-muted)]">
                            Wait:{' '}
                            {formatDistanceStrict(
                              new Date(issue.todoAt),
                              new Date(issue.inProgressAt)
                            )}
                          </span>
                        )}
                        {issue.inProgressAt && issue.doneAt && (
                          <span className="rounded-md bg-[var(--color-bg-glass-hover)] px-2 py-0.5 text-[10px] text-blue-400">
                            Active:{' '}
                            {formatDistanceStrict(
                              new Date(issue.inProgressAt),
                              new Date(issue.doneAt)
                            )}
                          </span>
                        )}
                        {issue.todoAt && issue.doneAt && (
                          <span className="rounded-md bg-[var(--color-bg-glass-hover)] px-2 py-0.5 text-[10px] text-green-400">
                            Total:{' '}
                            {formatDistanceStrict(new Date(issue.todoAt), new Date(issue.doneAt))}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="shrink-0 border-t border-[var(--color-border-default)] px-5 py-3">
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-red-400 transition-colors hover:bg-red-500/10"
            >
              <Trash2 size={14} />
              Delete Issue
            </button>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Backdrop */}
      <AnimatePresence>
        {issue && (
          <motion.div
            key="issue-detail-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Confirm delete */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => {
          onDelete?.(issue.id)
          onClose?.()
        }}
        title="Delete Issue"
        message={`Are you sure you want to delete "${issue.key} - ${issue.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
      />
    </>
  )
}
