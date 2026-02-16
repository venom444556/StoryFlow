import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import {
  Plus,
  Play,
  CheckCircle2,
  Clock,
  MoreHorizontal,
  Pencil,
  Trash2,
  ArrowRight,
} from 'lucide-react'
import BoardColumn from './BoardColumn'
import SprintModal from './SprintModal'
import Badge from '../ui/Badge'
import ConfirmDialog from '../ui/ConfirmDialog'

function SprintHeader({
  sprint,
  issueCount,
  pointsTotal,
  pointsDone,
  onEdit,
  onDelete,
  onStart,
  onClose,
}) {
  const [menuOpen, setMenuOpen] = useState(false)

  const statusConfig = {
    planning: { label: 'Planning', icon: Clock, color: 'default' },
    active: { label: 'Active', icon: Play, color: 'blue' },
    completed: { label: 'Completed', icon: CheckCircle2, color: 'green' },
  }
  const cfg = statusConfig[sprint.status] || statusConfig.planning
  const StatusIcon = cfg.icon
  const progress = pointsTotal > 0 ? Math.round((pointsDone / pointsTotal) * 100) : 0

  return (
    <div className="mb-3 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-glass)] p-3">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-[var(--color-fg-default)]">{sprint.name}</h3>
            <Badge variant={cfg.color} size="sm">
              <StatusIcon size={11} className="mr-1" />
              {cfg.label}
            </Badge>
          </div>
          {sprint.goal && (
            <p className="mt-0.5 text-xs text-[var(--color-fg-muted)]">{sprint.goal}</p>
          )}
          <div className="mt-1.5 flex items-center gap-3 text-xs text-[var(--color-fg-subtle)]">
            <span>{issueCount} issues</span>
            <span>{pointsTotal} pts</span>
            {sprint.startDate && <span>Started {sprint.startDate}</span>}
          </div>
        </div>

        {/* Progress bar */}
        {pointsTotal > 0 && (
          <div className="w-24 shrink-0">
            <div className="flex items-center justify-between text-xs text-[var(--color-fg-muted)]">
              <span>{progress}%</span>
            </div>
            <div className="mt-0.5 h-1.5 rounded-full bg-[var(--color-bg-tertiary)]">
              <div
                className="h-full rounded-full bg-[var(--color-accent-emphasis)] transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Actions menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="rounded-md p-1.5 text-[var(--color-fg-muted)] hover:bg-[var(--color-bg-glass-hover)]"
          >
            <MoreHorizontal size={14} />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-full z-40 mt-1 w-44 rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-overlay)] p-1 shadow-lg">
                {sprint.status === 'planning' && (
                  <button
                    onClick={() => {
                      onStart?.()
                      setMenuOpen(false)
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs text-[var(--color-fg-default)] hover:bg-[var(--color-bg-glass-hover)]"
                  >
                    <Play size={12} /> Start Sprint
                  </button>
                )}
                {sprint.status === 'active' && (
                  <button
                    onClick={() => {
                      onClose?.()
                      setMenuOpen(false)
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs text-[var(--color-fg-default)] hover:bg-[var(--color-bg-glass-hover)]"
                  >
                    <CheckCircle2 size={12} /> Complete Sprint
                  </button>
                )}
                <button
                  onClick={() => {
                    onEdit?.()
                    setMenuOpen(false)
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs text-[var(--color-fg-default)] hover:bg-[var(--color-bg-glass-hover)]"
                >
                  <Pencil size={12} /> Edit Sprint
                </button>
                <button
                  onClick={() => {
                    onDelete?.()
                    setMenuOpen(false)
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs text-[var(--color-fg-danger)] hover:bg-[var(--color-bg-glass-hover)]"
                >
                  <Trash2 size={12} /> Delete Sprint
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function SprintBoard({
  issues = [],
  sprints = [],
  statusColumns = ['To Do', 'In Progress', 'Done'],
  onUpdateIssue,
  onCreateIssue,
  onIssueClick,
  onAddSprint,
  onUpdateSprint,
  onDeleteSprint,
  onCloseSprint,
  epicFilterActive = false,
}) {
  const [activeSprintId, setActiveSprintId] = useState(null)
  const [sprintModalOpen, setSprintModalOpen] = useState(false)
  const [editingSprint, setEditingSprint] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [closeTarget, setCloseTarget] = useState(null)

  // Auto-switch to "All" when epic filter first activates, so the user
  // sees every child issue. After that, they can freely pick any sprint tab.
  const prevEpicFilter = useRef(epicFilterActive)
  useEffect(() => {
    if (epicFilterActive && !prevEpicFilter.current) {
      setActiveSprintId('all')
    }
    prevEpicFilter.current = epicFilterActive
  }, [epicFilterActive])

  const selectedSprintId =
    activeSprintId || sprints.find((s) => s.status === 'active')?.id || sprints[0]?.id || null

  // Filter issues for selected sprint
  const sprintIssues = useMemo(() => {
    if (selectedSprintId === 'all' || !selectedSprintId)
      return issues.filter((i) => i.type !== 'epic')
    return issues.filter((i) => i.sprintId === selectedSprintId && i.type !== 'epic')
  }, [issues, selectedSprintId])

  const backlogIssues = useMemo(
    () => issues.filter((i) => !i.sprintId && i.type !== 'epic'),
    [issues]
  )

  // Group by status
  const issuesByStatus = useMemo(() => {
    const grouped = {}
    statusColumns.forEach((col) => {
      grouped[col] = []
    })
    sprintIssues.forEach((issue) => {
      const col = statusColumns.includes(issue.status) ? issue.status : statusColumns[0]
      if (!grouped[col]) grouped[col] = []
      grouped[col].push(issue)
    })
    return grouped
  }, [sprintIssues, statusColumns])

  // Sprint stats
  const sprintStats = useMemo(() => {
    const total = sprintIssues.reduce((sum, i) => sum + (i.storyPoints ?? 0), 0)
    const done = sprintIssues
      .filter((i) => i.status === 'Done')
      .reduce((sum, i) => sum + (i.storyPoints ?? 0), 0)
    return { total, done, count: sprintIssues.length }
  }, [sprintIssues])

  const handleDrop = useCallback(
    (issueId, newStatus) => {
      onUpdateIssue?.(issueId, { status: newStatus })
    },
    [onUpdateIssue]
  )

  const handleSaveSprint = useCallback(
    (data) => {
      if (editingSprint) {
        onUpdateSprint?.(editingSprint.id, data)
      } else {
        onAddSprint?.(data)
      }
      setEditingSprint(null)
    },
    [editingSprint, onAddSprint, onUpdateSprint]
  )

  const handleStartSprint = useCallback(
    (sprintId) => {
      onUpdateSprint?.(sprintId, { status: 'active' })
    },
    [onUpdateSprint]
  )

  const handleConfirmDelete = useCallback(() => {
    if (deleteTarget) {
      onDeleteSprint?.(deleteTarget)
      if (activeSprintId === deleteTarget) setActiveSprintId(null)
      setDeleteTarget(null)
    }
  }, [deleteTarget, onDeleteSprint, activeSprintId])

  const handleConfirmClose = useCallback(() => {
    if (closeTarget) {
      onCloseSprint?.(closeTarget, 'backlog')
      setCloseTarget(null)
    }
  }, [closeTarget, onCloseSprint])

  const selectedSprint =
    selectedSprintId === 'all' ? null : sprints.find((s) => s.id === selectedSprintId)

  return (
    <div className="flex h-full flex-col">
      {/* Sprint selector bar */}
      {sprints.length > 0 && (
        <div className="mb-3 flex items-center gap-2 overflow-x-auto">
          {/* "All" tab — shows every issue regardless of sprint */}
          <button
            onClick={() => setActiveSprintId('all')}
            className={[
              'shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
              selectedSprintId === 'all'
                ? 'bg-[var(--color-accent-emphasis)] text-white'
                : 'text-[var(--color-fg-muted)] hover:bg-[var(--color-bg-glass-hover)] hover:text-[var(--color-fg-default)]',
            ].join(' ')}
          >
            All
          </button>
          {sprints.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSprintId(s.id)}
              className={[
                'shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
                s.id === selectedSprintId
                  ? 'bg-[var(--color-accent-emphasis)] text-white'
                  : 'text-[var(--color-fg-muted)] hover:bg-[var(--color-bg-glass-hover)] hover:text-[var(--color-fg-default)]',
              ].join(' ')}
            >
              {s.name}
              {s.status === 'active' && <Play size={10} className="ml-1 inline" />}
              {s.status === 'completed' && <CheckCircle2 size={10} className="ml-1 inline" />}
            </button>
          ))}
          <button
            onClick={() => {
              setEditingSprint(null)
              setSprintModalOpen(true)
            }}
            className="flex shrink-0 items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-[var(--color-fg-muted)] hover:bg-[var(--color-bg-glass-hover)] hover:text-[var(--color-fg-default)]"
          >
            <Plus size={12} /> New Sprint
          </button>
        </div>
      )}

      {/* Sprint header (if sprint selected) */}
      {selectedSprint && (
        <SprintHeader
          sprint={selectedSprint}
          issueCount={sprintStats.count}
          pointsTotal={sprintStats.total}
          pointsDone={sprintStats.done}
          onEdit={() => {
            setEditingSprint(selectedSprint)
            setSprintModalOpen(true)
          }}
          onDelete={() => setDeleteTarget(selectedSprintId)}
          onStart={() => handleStartSprint(selectedSprintId)}
          onClose={() => setCloseTarget(selectedSprintId)}
        />
      )}

      {/* No sprints state */}
      {sprints.length === 0 && (
        <div className="mb-3 flex items-center justify-between rounded-xl border border-dashed border-[var(--color-border-default)] bg-[var(--color-bg-glass)] p-4">
          <div>
            <p className="text-sm font-medium text-[var(--color-fg-default)]">No sprints yet</p>
            <p className="text-xs text-[var(--color-fg-muted)]">
              Create a sprint to organize your work into time-boxed iterations.
            </p>
          </div>
          <button
            onClick={() => {
              setEditingSprint(null)
              setSprintModalOpen(true)
            }}
            className="flex items-center gap-1.5 rounded-lg bg-[var(--color-accent-emphasis)] px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
          >
            <Plus size={12} /> Create Sprint
          </button>
        </div>
      )}

      {/* Kanban columns */}
      <div className="flex flex-1 gap-4 overflow-x-auto pb-4">
        {statusColumns.map((status) => (
          <BoardColumn
            key={status}
            title={status}
            status={status}
            issues={issuesByStatus[status] || []}
            onDrop={handleDrop}
            onIssueClick={onIssueClick}
            onCreateIssue={onCreateIssue}
          />
        ))}
      </div>

      {/* Backlog summary (if a specific sprint is selected and there are unassigned issues) */}
      {sprints.length > 0 && selectedSprintId !== 'all' && backlogIssues.length > 0 && (
        <div className="mt-2 rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-glass)] px-4 py-2">
          <p className="text-xs text-[var(--color-fg-muted)]">
            <ArrowRight size={11} className="mr-1 inline" />
            {backlogIssues.length} issue{backlogIssues.length !== 1 ? 's' : ''} in backlog
            (unassigned to sprints)
          </p>
        </div>
      )}

      {/* Sprint modal */}
      <SprintModal
        isOpen={sprintModalOpen}
        onClose={() => {
          setSprintModalOpen(false)
          setEditingSprint(null)
        }}
        onSave={handleSaveSprint}
        sprint={editingSprint}
      />

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete sprint?"
        message="This sprint will be deleted. Issues assigned to it will be moved to the backlog."
        confirmLabel="Delete"
      />

      {/* Close sprint confirmation */}
      <ConfirmDialog
        isOpen={closeTarget !== null}
        onClose={() => setCloseTarget(null)}
        onConfirm={handleConfirmClose}
        title="Complete sprint?"
        message="Incomplete issues will be moved back to the backlog. Completed issues will keep their status."
        confirmLabel="Complete Sprint"
      />
    </div>
  )
}
