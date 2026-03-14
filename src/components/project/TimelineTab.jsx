import { useState, useCallback, useMemo } from 'react'
import {
  Plus,
  Flag,
  BarChart3,
  List,
  Clock,
  Download,
  CheckCircle2,
  Target,
  Calendar,
} from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { differenceInDays, parseISO, format } from 'date-fns'
import Button from '../ui/Button'
import Tabs from '../ui/Tabs'
import ConfirmDialog from '../ui/ConfirmDialog'
import EmptyState from '../ui/EmptyState'
import ProgressBar from '../ui/ProgressBar'
import TimelineView from '../timeline/TimelineView'
import GanttChart from '../timeline/GanttChart'
import PhaseForm from '../timeline/PhaseForm'
import MilestoneForm from '../timeline/MilestoneForm'

const VIEW_TABS = [
  { key: 'list', label: 'Phase Overview', icon: List },
  { key: 'chart', label: 'Gantt Chart', icon: BarChart3 },
]

const TIME_SCALES = [
  { key: 'weeks', label: 'Weeks' },
  { key: 'months', label: 'Months' },
]

export default function TimelineTab({
  project,
  addPhase,
  updatePhase,
  deletePhase,
  addMilestone,
  updateMilestone,
  deleteMilestone,
}) {
  const [view, setView] = useState('list')
  const [timeScale, setTimeScale] = useState('weeks')

  // Phase CRUD state
  const [showPhaseForm, setShowPhaseForm] = useState(false)
  const [editingPhase, setEditingPhase] = useState(null)
  const [deletingPhase, setDeletingPhase] = useState(null)

  // Milestone CRUD state
  const [showMilestoneForm, setShowMilestoneForm] = useState(false)
  const [editingMilestone, setEditingMilestone] = useState(null)
  const [deletingMilestone, setDeletingMilestone] = useState(null)

  const phases = project?.timeline?.phases || []
  const milestones = project?.timeline?.milestones || []

  // Compute summary stats
  const stats = useMemo(() => {
    const today = new Date()
    let earliest = null
    let latest = null
    let totalProgress = 0

    for (const phase of phases) {
      totalProgress += phase.progress || 0
      if (phase.startDate) {
        const start = parseISO(phase.startDate)
        if (!earliest || start < earliest) earliest = start
      }
      if (phase.endDate) {
        const end = parseISO(phase.endDate)
        if (!latest || end > latest) latest = end
      }
    }

    const daysElapsed = earliest ? Math.max(0, differenceInDays(today, earliest)) : 0
    const daysRemaining = latest ? Math.max(0, differenceInDays(latest, today)) : 0
    const completedPhases = phases.filter((p) => (p.progress || 0) >= 100).length
    const activePhases = phases.filter(
      (p) => (p.progress || 0) > 0 && (p.progress || 0) < 100
    ).length
    const completedMilestones = milestones.filter((m) => m.completed).length
    const overallProgress = phases.length > 0 ? Math.round(totalProgress / phases.length) : 0

    // Upcoming milestones (not completed, sorted by date)
    const upcoming = milestones
      .filter((m) => !m.completed && m.date)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 5)

    return {
      daysElapsed,
      daysRemaining,
      completedPhases,
      activePhases,
      completedMilestones,
      overallProgress,
      upcoming,
      earliest,
      latest,
    }
  }, [phases, milestones])

  // Phase handlers
  const handleCreatePhase = useCallback(
    (data) => {
      addPhase(data)
    },
    [addPhase]
  )

  const handleUpdatePhase = useCallback(
    (data) => {
      if (!editingPhase) return
      updatePhase(editingPhase.id, data)
      setEditingPhase(null)
    },
    [editingPhase, updatePhase]
  )

  const handleDeletePhase = useCallback(() => {
    if (!deletingPhase) return
    deletePhase(deletingPhase.id)
    setDeletingPhase(null)
  }, [deletingPhase, deletePhase])

  // Milestone handlers
  const handleCreateMilestone = useCallback(
    (data) => {
      addMilestone(data)
    },
    [addMilestone]
  )

  const handleUpdateMilestone = useCallback(
    (data) => {
      if (!editingMilestone) return
      updateMilestone(editingMilestone.id, data)
      setEditingMilestone(null)
    },
    [editingMilestone, updateMilestone]
  )

  const handleDeleteMilestone = useCallback(() => {
    if (!deletingMilestone) return
    deleteMilestone(deletingMilestone.id)
    setDeletingMilestone(null)
  }, [deletingMilestone, deleteMilestone])

  const handleToggleMilestone = useCallback(
    (milestone) => {
      updateMilestone(milestone.id, { completed: !milestone.completed })
    },
    [updateMilestone]
  )

  // Click handlers from chart
  const handlePhaseClick = useCallback((phase) => {
    setEditingPhase(phase)
  }, [])

  const handleMilestoneClick = useCallback((milestone) => {
    setEditingMilestone(milestone)
  }, [])

  const hasData = phases.length > 0 || milestones.length > 0

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-[var(--color-fg-default)]">Timeline</h2>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" icon={Download} onClick={() => window.print()}>
            Export
          </Button>
          <Button variant="ghost" size="sm" icon={Flag} onClick={() => setShowMilestoneForm(true)}>
            Add Milestone
          </Button>
          <Button variant="secondary" size="sm" icon={Plus} onClick={() => setShowPhaseForm(true)}>
            Add Phase
          </Button>
        </div>
      </div>

      {/* Sub-tabs + time scale toggle */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Tabs tabs={VIEW_TABS} activeTab={view} onTabChange={setView} layoutId="timeline-tabs" />

        {view === 'chart' && (
          <div className="inline-flex gap-1">
            {TIME_SCALES.map((s) => (
              <button
                key={s.key}
                onClick={() => setTimeScale(s.key)}
                className={[
                  'px-2.5 py-1 text-xs font-medium transition-colors',
                  timeScale === s.key
                    ? 'text-[var(--color-fg-default)]'
                    : 'text-[var(--color-fg-muted)] hover:text-[var(--color-fg-default)]',
                ].join(' ')}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* View content */}
      {!hasData ? (
        <div className="flex items-center justify-center py-16">
          <EmptyState
            icon={Clock}
            title="No phases defined"
            description="Create a phase to start planning your project timeline, then add milestones to track key deliverables."
            action={{
              label: 'Add Phase',
              onClick: () => setShowPhaseForm(true),
            }}
          />
        </div>
      ) : (
        <div className="min-h-0 flex-1">
          <AnimatePresence mode="wait">
            {view === 'chart' ? (
              <motion.div
                key="chart"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
              >
                {/* Gantt: full width with stats bar above */}
                <div className="mb-4 grid grid-cols-4 gap-4">
                  <StatCell
                    label="Overall"
                    value={`${stats.overallProgress}%`}
                    sub={`${phases.length} phases`}
                  />
                  <StatCell
                    label="Days elapsed"
                    value={stats.daysElapsed}
                    sub={stats.earliest ? format(stats.earliest, 'MMM d') : '—'}
                  />
                  <StatCell
                    label="Days remaining"
                    value={stats.daysRemaining}
                    sub={stats.latest ? format(stats.latest, 'MMM d') : '—'}
                  />
                  <StatCell
                    label="Milestones"
                    value={`${stats.completedMilestones}/${milestones.length}`}
                    sub={`${milestones.length - stats.completedMilestones} pending`}
                  />
                </div>
                <GanttChart
                  phases={phases}
                  milestones={milestones}
                  onPhaseClick={handlePhaseClick}
                  onMilestoneClick={handleMilestoneClick}
                  timeScale={timeScale}
                />
              </motion.div>
            ) : (
              <motion.div
                key="list"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="flex gap-6"
              >
                {/* Phase Overview: timeline + sidebar */}
                <div className="min-w-0 flex-1">
                  <TimelineView
                    phases={phases}
                    milestones={milestones}
                    onEditPhase={(phase) => setEditingPhase(phase)}
                    onDeletePhase={(phase) => setDeletingPhase(phase)}
                    onEditMilestone={(milestone) => setEditingMilestone(milestone)}
                    onDeleteMilestone={(milestone) => setDeletingMilestone(milestone)}
                    onToggleMilestone={handleToggleMilestone}
                  />
                </div>

                {/* Summary sidebar */}
                <div className="hidden w-72 shrink-0 space-y-5 xl:block">
                  {/* Overall progress */}
                  <div className="rounded-xl border border-[var(--color-border-default)] p-4">
                    <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-fg-subtle)]">
                      Overall Progress
                    </h3>
                    <div className="mb-1 flex items-baseline justify-between">
                      <span className="text-2xl font-bold text-[var(--color-fg-default)]">
                        {stats.overallProgress}%
                      </span>
                      <span className="text-xs text-[var(--color-fg-muted)]">
                        {stats.completedPhases}/{phases.length} phases
                      </span>
                    </div>
                    <ProgressBar value={stats.overallProgress} size="sm" />
                  </div>

                  {/* Phase breakdown */}
                  <div className="rounded-xl border border-[var(--color-border-default)] p-4">
                    <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-fg-subtle)]">
                      Phases
                    </h3>
                    <div className="space-y-3">
                      {phases.map((phase) => (
                        <button
                          key={phase.id}
                          onClick={() => setEditingPhase(phase)}
                          className="block w-full text-left transition-colors hover:text-[var(--color-fg-default)]"
                        >
                          <div className="mb-1 flex items-center justify-between">
                            <span className="text-xs font-medium text-[var(--color-fg-default)]">
                              {phase.name}
                            </span>
                            <span className="text-[10px] text-[var(--color-fg-muted)]">
                              {Math.round(phase.progress || 0)}%
                            </span>
                          </div>
                          <ProgressBar value={phase.progress || 0} size="xs" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="rounded-xl border border-[var(--color-border-default)] p-4">
                    <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-fg-subtle)]">
                      Stats
                    </h3>
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-xs text-[var(--color-fg-muted)]">
                          <Clock size={12} /> Days elapsed
                        </span>
                        <span className="text-xs font-medium text-[var(--color-fg-default)]">
                          {stats.daysElapsed}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-xs text-[var(--color-fg-muted)]">
                          <Target size={12} /> Active phases
                        </span>
                        <span className="text-xs font-medium text-[var(--color-fg-default)]">
                          {stats.activePhases}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-xs text-[var(--color-fg-muted)]">
                          <CheckCircle2 size={12} /> Completed
                        </span>
                        <span className="text-xs font-medium text-[var(--color-fg-default)]">
                          {stats.completedPhases}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-xs text-[var(--color-fg-muted)]">
                          <Flag size={12} /> Milestones
                        </span>
                        <span className="text-xs font-medium text-[var(--color-fg-default)]">
                          {stats.completedMilestones}/{milestones.length}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Upcoming milestones */}
                  {stats.upcoming.length > 0 && (
                    <div className="rounded-xl border border-[var(--color-border-default)] p-4">
                      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-fg-subtle)]">
                        Upcoming Milestones
                      </h3>
                      <div className="space-y-2">
                        {stats.upcoming.map((m) => (
                          <button
                            key={m.id}
                            onClick={() => setEditingMilestone(m)}
                            className="flex w-full items-start gap-2 text-left"
                          >
                            <Flag
                              size={11}
                              className="mt-0.5 shrink-0 text-[var(--color-fg-subtle)]"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-medium text-[var(--color-fg-default)]">
                                {m.name}
                              </p>
                              <p className="flex items-center gap-1 text-[10px] text-[var(--color-fg-muted)]">
                                <Calendar size={9} />
                                {format(parseISO(m.date), 'MMM d, yyyy')}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Phase forms */}
      <PhaseForm
        isOpen={showPhaseForm}
        onClose={() => setShowPhaseForm(false)}
        onSave={handleCreatePhase}
        phase={null}
      />
      <PhaseForm
        isOpen={editingPhase !== null}
        onClose={() => setEditingPhase(null)}
        onSave={handleUpdatePhase}
        phase={editingPhase}
      />

      {/* Milestone forms */}
      <MilestoneForm
        isOpen={showMilestoneForm}
        onClose={() => setShowMilestoneForm(false)}
        onSave={handleCreateMilestone}
        milestone={null}
        phases={phases}
      />
      <MilestoneForm
        isOpen={editingMilestone !== null}
        onClose={() => setEditingMilestone(null)}
        onSave={handleUpdateMilestone}
        milestone={editingMilestone}
        phases={phases}
      />

      {/* Delete confirm dialogs */}
      <ConfirmDialog
        isOpen={deletingPhase !== null}
        onClose={() => setDeletingPhase(null)}
        onConfirm={handleDeletePhase}
        title="Delete Phase"
        message={`Are you sure you want to delete "${deletingPhase?.name || 'this phase'}"? This action cannot be undone.`}
        confirmLabel="Delete"
      />
      <ConfirmDialog
        isOpen={deletingMilestone !== null}
        onClose={() => setDeletingMilestone(null)}
        onConfirm={handleDeleteMilestone}
        title="Delete Milestone"
        message={`Are you sure you want to delete "${deletingMilestone?.name || 'this milestone'}"? This action cannot be undone.`}
        confirmLabel="Delete"
      />
    </div>
  )
}

function StatCell({ label, value, sub }) {
  return (
    <div className="rounded-xl border border-[var(--color-border-default)] px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-fg-subtle)]">
        {label}
      </p>
      <p className="mt-1 text-lg font-bold text-[var(--color-fg-default)]">{value}</p>
      <p className="text-[11px] text-[var(--color-fg-muted)]">{sub}</p>
    </div>
  )
}
