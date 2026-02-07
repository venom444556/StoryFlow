import React, { useState, useMemo, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Plus, Scale, ArrowLeft } from 'lucide-react'
import Button from '../ui/Button'
import EmptyState from '../ui/EmptyState'
import DecisionCard from '../decisions/DecisionCard'
import DecisionDetail from '../decisions/DecisionDetail'
import DecisionForm from '../decisions/DecisionForm'

const FILTER_TABS = [
  { value: 'all', label: 'All' },
  { value: 'proposed', label: 'Proposed' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'superseded', label: 'Superseded' },
]

export default function DecisionsTab({ project, addDecision, updateDecision }) {
  const [selectedDecision, setSelectedDecision] = useState(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [statusFilter, setStatusFilter] = useState('all')

  const decisions = project?.decisions || []

  // Filter and sort
  const filtered = useMemo(() => {
    let list = decisions
    if (statusFilter !== 'all') {
      list = list.filter((d) => d.status === statusFilter)
    }
    // Sort newest first
    return [...list].sort((a, b) => {
      if (a.createdAt && b.createdAt) return b.createdAt.localeCompare(a.createdAt)
      return 0
    })
  }, [decisions, statusFilter])

  // Keep selected decision in sync with project data
  const activeDecision = useMemo(() => {
    if (!selectedDecision) return null
    return decisions.find((d) => d.id === selectedDecision.id) || null
  }, [decisions, selectedDecision])

  const handleCreateDecision = useCallback(
    (data) => {
      const created = addDecision(data)
      if (created) {
        setSelectedDecision(created)
      }
    },
    [addDecision]
  )

  const handleCardClick = useCallback((decision) => {
    setSelectedDecision(decision)
  }, [])

  const handleCloseDetail = useCallback(() => {
    setSelectedDecision(null)
  }, [])

  // Count per status for filter badges
  const counts = useMemo(() => {
    const c = { all: decisions.length, proposed: 0, accepted: 0, superseded: 0 }
    decisions.forEach((d) => {
      if (c[d.status] !== undefined) c[d.status]++
    })
    return c
  }, [decisions])

  return (
    <div className="flex h-full flex-col gap-4 md:flex-row">
      {/* Main list */}
      <div className={[
        'flex flex-col transition-all duration-300',
        activeDecision ? 'hidden md:flex md:w-1/2' : 'w-full max-w-3xl mx-auto',
      ].join(' ')}>
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="gradient-text text-xl font-semibold">Decisions</h2>
            <p className="mt-1 text-sm text-slate-500">
              Record architectural decisions and rationale
            </p>
          </div>
          <Button icon={Plus} onClick={() => setShowCreateForm(true)}>
            New Decision
          </Button>
        </div>

        {/* Filter tabs */}
        <div className="mb-4 flex items-center gap-1 rounded-lg bg-white/5 p-1">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={[
                'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-150',
                statusFilter === tab.value
                  ? 'bg-white/10 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-300',
              ].join(' ')}
            >
              {tab.label}
              <span
                className={[
                  'rounded-full px-1.5 py-0.5 text-[10px]',
                  statusFilter === tab.value
                    ? 'bg-white/10 text-white'
                    : 'bg-white/5 text-slate-500',
                ].join(' ')}
              >
                {counts[tab.value]}
              </span>
            </button>
          ))}
        </div>

        {/* Decision list */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length > 0 ? (
            <AnimatePresence mode="popLayout">
              <div className="space-y-3">
                {filtered.map((decision) => (
                  <DecisionCard
                    key={decision.id}
                    decision={decision}
                    onEdit={handleCardClick}
                    onClick={handleCardClick}
                  />
                ))}
              </div>
            </AnimatePresence>
          ) : (
            <EmptyState
              icon={Scale}
              title={statusFilter !== 'all' ? 'No matching decisions' : 'No decisions yet'}
              description={
                statusFilter !== 'all'
                  ? `No decisions with status "${statusFilter}" found.`
                  : 'Record your first architectural decision to keep track of important choices and their rationale.'
              }
              action={
                statusFilter === 'all'
                  ? { label: 'New Decision', onClick: () => setShowCreateForm(true) }
                  : undefined
              }
            />
          )}
        </div>
      </div>

      {/* Detail panel */}
      {activeDecision && (
        <div className="w-full shrink-0 overflow-hidden md:w-1/2">
          <button
            onClick={handleCloseDetail}
            className="mb-2 flex items-center gap-1 text-sm text-slate-400 hover:text-white md:hidden"
          >
            <ArrowLeft size={14} />
            Back to decisions
          </button>
          <DecisionDetail
            decision={activeDecision}
            onUpdate={updateDecision}
            onClose={handleCloseDetail}
          />
        </div>
      )}

      {/* Create form */}
      <DecisionForm
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onSave={handleCreateDecision}
      />
    </div>
  )
}
