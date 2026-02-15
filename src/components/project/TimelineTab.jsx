import { useState, useCallback } from 'react'
import { Plus, Flag, BarChart3, List } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import Button from '../ui/Button'
import Tabs from '../ui/Tabs'
import ConfirmDialog from '../ui/ConfirmDialog'
import TimelineStats from '../timeline/TimelineStats'
import TimelineView from '../timeline/TimelineView'
import GanttChart from '../timeline/GanttChart'
import PhaseForm from '../timeline/PhaseForm'
import MilestoneForm from '../timeline/MilestoneForm'

const VIEW_TABS = [
  { key: 'chart', label: 'Chart', icon: BarChart3 },
  { key: 'list', label: 'List', icon: List },
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
  const [view, setView] = useState('chart')
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

  return (
    <div className="mx-auto max-w-5xl">
      {/* Header */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="gradient-text text-xl font-semibold">Timeline</h2>
          <p className="mt-1 text-sm text-[var(--color-fg-muted)]">
            Track project phases and milestones
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" icon={Flag} onClick={() => setShowMilestoneForm(true)}>
            Add Milestone
          </Button>
          <Button icon={Plus} onClick={() => setShowPhaseForm(true)}>
            Add Phase
          </Button>
        </div>
      </div>

      {/* Stats row */}
      <div className="mb-5">
        <TimelineStats phases={phases} milestones={milestones} />
      </div>

      {/* Sub-tabs + time scale toggle */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Tabs tabs={VIEW_TABS} activeTab={view} onTabChange={setView} />

        {view === 'chart' && (
          <div className="glass inline-flex gap-0.5 rounded-lg p-1">
            {TIME_SCALES.map((s) => (
              <button
                key={s.key}
                onClick={() => setTimeScale(s.key)}
                className={[
                  'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                  timeScale === s.key
                    ? 'bg-[var(--color-bg-glass-hover)] text-[var(--color-fg-default)]'
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
      <AnimatePresence mode="wait">
        {view === 'chart' ? (
          <motion.div
            key="chart"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
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
          >
            <TimelineView
              phases={phases}
              milestones={milestones}
              onEditPhase={(phase) => setEditingPhase(phase)}
              onDeletePhase={(phase) => setDeletingPhase(phase)}
              onEditMilestone={(milestone) => setEditingMilestone(milestone)}
              onDeleteMilestone={(milestone) => setDeletingMilestone(milestone)}
              onToggleMilestone={handleToggleMilestone}
            />
          </motion.div>
        )}
      </AnimatePresence>

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
