import { useState, useMemo, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { LayoutGrid, Layers, BarChart3 } from 'lucide-react'
import SprintBoard from '../board/SprintBoard'
import EpicsView from '../board/EpicsView'
import ChartsPanel from '../board/ChartsPanel'
import FilterBar from '../board/FilterBar'
import EpicSidebar from '../board/EpicSidebar'
import IssueDetail from '../board/IssueDetail'
import ConfirmDialog from '../ui/ConfirmDialog'
import { canonicalizeLabel } from '../../utils/labelDefinitions'

const VIEW_MODES = [
  { key: 'board', label: 'Board', icon: LayoutGrid },
  { key: 'epics', label: 'Epics', icon: Layers },
]

const EMPTY_FILTERS = {
  types: [],
  priorities: [],
  assignees: [],
  labelFilter: [],
  search: '',
}

// Generate sample burndown / velocity data from current issues
function computeChartData(issues) {
  // Burndown: simulate from total points for a default 10-day sprint
  const totalPoints = issues.reduce((sum, i) => sum + (i.storyPoints ?? 0), 0)
  const donePoints = issues
    .filter((i) => i.status === 'Done')
    .reduce((sum, i) => sum + (i.storyPoints ?? 0), 0)
  const inProgressPoints = issues
    .filter((i) => i.status === 'In Progress')
    .reduce((sum, i) => sum + (i.storyPoints ?? 0), 0)

  const days = 10
  const burndown = []
  for (let d = 0; d <= days; d++) {
    const ideal = totalPoints - (totalPoints / days) * d
    // Simulate actual based on current completion
    const fraction = d / days
    const completedSoFar =
      donePoints * Math.min(fraction * 1.3, 1) + inProgressPoints * Math.min(fraction * 0.6, 0.5)
    const actual = Math.max(0, totalPoints - completedSoFar)
    burndown.push({
      date: `Day ${d}`,
      ideal: Math.round(ideal * 10) / 10,
      actual: Math.round(actual * 10) / 10,
    })
  }

  // Velocity: group completed issues by a simple mock sprint model
  const doneIssues = issues.filter((i) => i.status === 'Done')
  const velocity = []
  if (doneIssues.length > 0) {
    // Create a couple mock sprints from done issues
    const chunkSize = Math.max(1, Math.ceil(doneIssues.length / 3))
    for (let s = 0; s < 3; s++) {
      const chunk = doneIssues.slice(s * chunkSize, (s + 1) * chunkSize)
      if (chunk.length > 0) {
        velocity.push({
          name: `Sprint ${s + 1}`,
          points: chunk.reduce((sum, i) => sum + (i.storyPoints ?? 1), 0),
        })
      }
    }
  }

  return { burndown, velocity }
}

export default function BoardTab({
  project,
  addIssue,
  updateIssue,
  deleteIssue,
  addSprint,
  updateSprint,
  deleteSprint,
  closeSprint,
}) {
  const [activeView, setActiveView] = useState('board')
  const [selectedIssue, setSelectedIssue] = useState(null)
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [showEpicSidebar, setShowEpicSidebar] = useState(false)
  const [showCharts, setShowCharts] = useState(false)
  const [activeEpicId, setActiveEpicId] = useState(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState(null)

  const board = project?.board
  const allIssues = useMemo(() => board?.issues ?? [], [board?.issues])
  const statusColumns = board?.statusColumns ?? ['To Do', 'In Progress', 'Done']

  // Collect all unique labels for filter bar (canonicalized)
  const allLabels = useMemo(() => {
    const labelSet = new Set()
    allIssues.forEach((i) => (i.labels || []).forEach((l) => labelSet.add(canonicalizeLabel(l))))
    return Array.from(labelSet).sort()
  }, [allIssues])

  // Collect epics for filter bar
  const allEpics = useMemo(() => allIssues.filter((i) => i.type === 'epic'), [allIssues])

  // Apply filters
  const filteredIssues = useMemo(() => {
    let result = allIssues

    // Epic filter (from sidebar)
    if (activeEpicId) {
      result = result.filter((i) => i.id === activeEpicId || i.epicId === activeEpicId)
    }

    // Type filter
    if (filters.types.length > 0) {
      result = result.filter((i) => filters.types.includes(i.type))
    }

    // Priority filter
    if (filters.priorities.length > 0) {
      result = result.filter((i) => filters.priorities.includes(i.priority))
    }

    // Assignee filter
    if (filters.assignees.length > 0) {
      result = result.filter((i) => {
        if (filters.assignees.includes('__none__') && !i.assignee) return true
        return filters.assignees.includes(i.assignee)
      })
    }

    // Label filter
    if (filters.labelFilter.length > 0) {
      result = result.filter((i) => filters.labelFilter.some((l) => (i.labels || []).includes(l)))
    }

    // Search filter
    if (filters.search) {
      const q = filters.search.toLowerCase()
      result = result.filter(
        (i) =>
          i.title?.toLowerCase().includes(q) ||
          i.key?.toLowerCase().includes(q) ||
          i.description?.toLowerCase().includes(q)
      )
    }

    return result
  }, [allIssues, filters, activeEpicId])

  // Chart data
  const chartData = useMemo(() => computeChartData(allIssues), [allIssues])

  // Handlers
  const handleIssueClick = useCallback((issue) => {
    setSelectedIssue(issue)
  }, [])

  const handleCloseDetail = useCallback(() => {
    setSelectedIssue(null)
  }, [])

  const handleUpdateIssue = useCallback(
    (issueId, updates) => {
      updateIssue?.(issueId, updates)
      // Update the selected issue in-memory so the panel shows changes immediately
      setSelectedIssue((prev) => {
        if (prev && prev.id === issueId) {
          return { ...prev, ...updates }
        }
        return prev
      })
    },
    [updateIssue]
  )

  const handleCreateIssue = useCallback(
    (issueData) => {
      const nextNumber = board?.nextIssueNumber ?? 1
      addIssue?.({
        key: `SF-${nextNumber}`,
        ...issueData,
      })
    },
    [addIssue, board?.nextIssueNumber]
  )

  const handleRequestDeleteIssue = useCallback((issueId) => {
    setDeleteConfirmId(issueId)
  }, [])

  const handleConfirmDeleteIssue = useCallback(() => {
    if (deleteConfirmId) {
      deleteIssue?.(deleteConfirmId)
      if (selectedIssue?.id === deleteConfirmId) {
        setSelectedIssue(null)
      }
      setDeleteConfirmId(null)
    }
  }, [deleteConfirmId, deleteIssue, selectedIssue?.id])

  const handleFilterByEpic = useCallback((epicId) => {
    setActiveEpicId(epicId)
  }, [])

  if (!project) return null

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar: view-mode switcher + epic toggle + charts toggle */}
      <div className="mb-4 flex items-center gap-3">
        {/* Segmented view-mode control */}
        <div className="inline-flex items-center gap-0.5 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-glass)] p-1">
          {VIEW_MODES.map((mode) => {
            const Icon = mode.icon
            const isActive = activeView === mode.key
            return (
              <button
                key={mode.key}
                onClick={() => setActiveView(mode.key)}
                className={[
                  'relative flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200',
                  isActive
                    ? 'text-[var(--color-fg-default)]'
                    : 'text-[var(--color-fg-muted)] hover:text-[var(--color-fg-default)]',
                ].join(' ')}
              >
                {isActive && (
                  <motion.div
                    layoutId="board-view-indicator"
                    className="absolute inset-0 rounded-lg bg-[var(--color-bg-glass-hover)] shadow-sm"
                    transition={{ type: 'spring', duration: 0.3, bounce: 0.15 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <Icon size={14} />
                  {mode.label}
                </span>
              </button>
            )
          })}
        </div>

        <div className="flex-1" />

        {/* Epic sidebar toggle */}
        <button
          onClick={() => setShowEpicSidebar((v) => !v)}
          className={[
            'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
            showEpicSidebar
              ? 'text-[var(--color-fg-default)]'
              : 'text-[var(--color-fg-muted)] hover:bg-[var(--color-bg-glass-hover)] hover:text-[var(--color-fg-default)]',
          ].join(' ')}
          style={
            showEpicSidebar
              ? { backgroundColor: 'rgba(var(--accent-active-rgb, 139, 92, 246), 0.15)' }
              : undefined
          }
        >
          <Layers size={13} />
          Epics
        </button>

        {/* Charts toggle */}
        <button
          onClick={() => setShowCharts((v) => !v)}
          className={[
            'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors',
            showCharts
              ? 'text-[var(--color-fg-default)]'
              : 'text-[var(--color-fg-muted)] hover:bg-[var(--color-bg-glass-hover)] hover:text-[var(--color-fg-default)]',
          ].join(' ')}
          style={
            showCharts
              ? { backgroundColor: 'rgba(var(--accent-active-rgb, 139, 92, 246), 0.15)' }
              : undefined
          }
          title="Toggle charts panel"
        >
          <BarChart3 size={14} />
        </button>
      </div>

      {/* Filter bar */}
      <div className="mb-4">
        <FilterBar
          filters={filters}
          onFilterChange={setFilters}
          labels={allLabels}
          epics={allEpics}
        />
      </div>

      {/* Main content area */}
      <div className="relative flex min-h-0 flex-1 gap-0 overflow-hidden rounded-xl">
        {/* Epic sidebar */}
        <EpicSidebar
          issues={allIssues}
          onFilterByEpic={handleFilterByEpic}
          activeEpicId={activeEpicId}
          isCollapsed={!showEpicSidebar}
          onToggleCollapse={() => setShowEpicSidebar((v) => !v)}
        />

        {/* Views */}
        <div className="min-w-0 flex-1 overflow-auto p-1">
          <AnimatePresence mode="wait">
            {activeView === 'board' && (
              <motion.div
                key="board"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <SprintBoard
                  issues={filteredIssues}
                  sprints={board?.sprints ?? []}
                  statusColumns={statusColumns}
                  onUpdateIssue={handleUpdateIssue}
                  onCreateIssue={handleCreateIssue}
                  onIssueClick={handleIssueClick}
                  onAddSprint={addSprint}
                  onUpdateSprint={updateSprint}
                  onDeleteSprint={deleteSprint}
                  onCloseSprint={closeSprint}
                  epicFilterActive={activeEpicId !== null}
                />
              </motion.div>
            )}

            {activeView === 'epics' && (
              <motion.div
                key="epics"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <EpicsView
                  issues={filteredIssues}
                  onIssueClick={handleIssueClick}
                  onDeleteIssue={handleRequestDeleteIssue}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Charts slide-out panel */}
        <AnimatePresence>
          {showCharts && (
            <ChartsPanel
              onClose={() => setShowCharts(false)}
              burndownData={chartData.burndown}
              velocityData={chartData.velocity}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Issue detail slide-out panel */}
      <AnimatePresence>
        {selectedIssue && (
          <IssueDetail
            key={selectedIssue.id}
            issue={selectedIssue}
            onUpdate={handleUpdateIssue}
            onDelete={handleRequestDeleteIssue}
            onClose={handleCloseDetail}
            allIssues={allIssues}
          />
        )}
      </AnimatePresence>

      {/* Delete issue confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handleConfirmDeleteIssue}
        title="Delete issue?"
        message="This issue will be permanently deleted. This cannot be undone."
        confirmLabel="Delete"
      />
    </div>
  )
}
