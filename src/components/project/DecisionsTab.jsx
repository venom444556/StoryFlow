import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Plus, Scale, ArrowLeft } from 'lucide-react'

const MIN_WIDTH = 280
const MAX_WIDTH = 600
const DEFAULT_WIDTH = 380
const STORAGE_KEY = 'storyflow-decisions-sidebar-width'
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
  { value: 'deprecated', label: 'Deprecated' },
]

export default function DecisionsTab({ project, addDecision, updateDecision }) {
  const [selectedDecision, setSelectedDecision] = useState(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [statusFilter, setStatusFilter] = useState('all')
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, Number(saved))) : DEFAULT_WIDTH
    } catch {
      return DEFAULT_WIDTH
    }
  })
  const [isDragging, setIsDragging] = useState(false)
  const startXRef = useRef(0)
  const startWidthRef = useRef(0)

  const handleResizeStart = useCallback(
    (e) => {
      e.preventDefault()
      startXRef.current = e.clientX
      startWidthRef.current = sidebarWidth
      setIsDragging(true)
    },
    [sidebarWidth]
  )

  useEffect(() => {
    if (!isDragging) return
    const handleMouseMove = (e) => {
      const next = Math.max(
        MIN_WIDTH,
        Math.min(MAX_WIDTH, startWidthRef.current + (e.clientX - startXRef.current))
      )
      setSidebarWidth(next)
    }
    const handleMouseUp = () => {
      setIsDragging(false)
      try {
        localStorage.setItem(STORAGE_KEY, String(sidebarWidth))
      } catch {
        /* ignore */
      }
    }
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    document.body.style.userSelect = 'none'
    document.body.style.cursor = 'col-resize'
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.userSelect = ''
      document.body.style.cursor = ''
    }
  }, [isDragging, sidebarWidth])

  const decisions = useMemo(() => project?.decisions || [], [project?.decisions])

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
    const c = { all: decisions.length, proposed: 0, accepted: 0, superseded: 0, deprecated: 0 }
    decisions.forEach((d) => {
      if (c[d.status] !== undefined) c[d.status]++
    })
    return c
  }, [decisions])

  // Compute original index for ADR numbering (based on creation order)
  const decisionIndexMap = useMemo(() => {
    const map = new Map()
    decisions.forEach((d, i) => map.set(d.id, i))
    return map
  }, [decisions])

  return (
    <div className="flex h-full flex-col gap-4 md:flex-row">
      {/* Sidebar list — resizable */}
      <div
        className={[
          'relative flex shrink-0 flex-col border-r border-[var(--color-border-default)]',
          activeDecision ? 'hidden md:flex' : 'w-full max-w-3xl mx-auto md:flex',
        ].join(' ')}
        style={{
          width: activeDecision ? sidebarWidth : undefined,
          transition: isDragging ? 'none' : 'width 0.2s ease',
        }}
      >
        {/* Header */}
        <div className="mb-4 flex items-center justify-between pr-4">
          <h2 className="text-sm font-semibold text-[var(--color-fg-default)]">Decisions</h2>
          <Button variant="ghost" size="sm" icon={Plus} onClick={() => setShowCreateForm(true)}>
            New
          </Button>
        </div>

        {/* Filter tabs */}
        <div className="mb-3 flex flex-wrap items-center gap-1 pr-4">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={[
                'flex items-center gap-1.5 px-2 py-1 text-[11px] font-medium transition-colors',
                statusFilter === tab.value
                  ? 'text-[var(--color-fg-default)]'
                  : 'text-[var(--color-fg-muted)] hover:text-[var(--color-fg-default)]',
              ].join(' ')}
            >
              {tab.label}
              <span className="text-[10px] text-[var(--color-fg-subtle)]">{counts[tab.value]}</span>
            </button>
          ))}
        </div>

        {/* Decision list */}
        <div className="flex-1 overflow-y-auto pr-2">
          {filtered.length > 0 ? (
            <AnimatePresence mode="popLayout">
              <div className="space-y-1">
                {filtered.map((decision) => (
                  <DecisionCard
                    key={decision.id}
                    decision={decision}
                    index={decisionIndexMap.get(decision.id) ?? 0}
                    isActive={activeDecision?.id === decision.id}
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

        {/* Resize handle */}
        <div
          onMouseDown={handleResizeStart}
          className={[
            'absolute inset-y-0 -right-1 z-10 flex w-2 cursor-col-resize items-center justify-center',
            'opacity-0 transition-opacity hover:opacity-100',
            isDragging && 'opacity-100',
          ]
            .filter(Boolean)
            .join(' ')}
          title="Drag to resize"
        >
          <div
            className={[
              'h-8 w-1 rounded-full transition-colors',
              isDragging
                ? 'bg-[var(--accent-default)]'
                : 'bg-[var(--color-fg-faint)] hover:bg-[var(--color-fg-muted)]',
            ].join(' ')}
          />
        </div>
      </div>

      {/* Detail panel — fills remaining space */}
      <div className="flex min-w-0 flex-1 flex-col">
        {activeDecision ? (
          <>
            <button
              onClick={handleCloseDetail}
              className="mb-2 flex items-center gap-1 text-sm text-[var(--color-fg-muted)] hover:text-[var(--color-fg-default)] md:hidden"
            >
              <ArrowLeft size={14} />
              Back to decisions
            </button>
            <AnimatePresence mode="wait">
              <DecisionDetail
                key={activeDecision.id}
                decision={activeDecision}
                index={decisionIndexMap.get(activeDecision.id) ?? 0}
                onUpdate={updateDecision}
                onClose={handleCloseDetail}
              />
            </AnimatePresence>
          </>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center">
            <div className="text-center">
              <Scale
                size={48}
                className="mx-auto mb-4 text-[var(--color-fg-subtle)]"
                strokeWidth={1.5}
              />
              <p className="text-sm text-[var(--color-fg-muted)]">
                {decisions.length > 0
                  ? 'Select a decision to view details'
                  : 'Create your first decision to get started'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Create form */}
      <DecisionForm
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onSave={handleCreateDecision}
      />
    </div>
  )
}
