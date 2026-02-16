import { useState, useMemo, useCallback } from 'react'
import { Plus, Network, List } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { generateId } from '../../utils/ids'
import Button from '../ui/Button'
import Tabs from '../ui/Tabs'
import ArchitectureFilterBar from '../architecture/ArchitectureFilterBar'
import ComponentTree from '../architecture/ComponentTree'
import ComponentDetail from '../architecture/ComponentDetail'
import DependencyGraph from '../architecture/DependencyGraph'
import ComponentForm from '../architecture/ComponentForm'

const VIEW_TABS = [
  { key: 'graph', label: 'Graph', icon: Network },
  { key: 'tree', label: 'Tree', icon: List },
]

export default function ArchitectureTab({ project, onUpdate }) {
  const [view, setView] = useState('graph')
  const [selectedId, setSelectedId] = useState(null)
  const [showComponentForm, setShowComponentForm] = useState(false)
  const [filters, setFilters] = useState({ types: [], connection: null })

  const components = useMemo(
    () => project?.architecture?.components || [],
    [project?.architecture?.components]
  )

  // Compute which component IDs match the active filters
  const highlightIds = useMemo(() => {
    const { types, connection } = filters
    const hasTypeFilter = types.length > 0
    const hasConnFilter = !!connection

    if (!hasTypeFilter && !hasConnFilter) return null

    const compMap = new Map(components.map((c) => [c.id, c]))
    let ids = new Set(components.map((c) => c.id))

    if (hasTypeFilter) {
      ids = new Set(
        [...ids].filter((id) => {
          const comp = compMap.get(id)
          return comp && types.includes(comp.type)
        })
      )
    }

    if (hasConnFilter) {
      const dependedUpon = new Set()
      components.forEach((c) => (c.dependencies || []).forEach((d) => dependedUpon.add(d)))

      ids = new Set(
        [...ids].filter((id) => {
          const comp = compMap.get(id)
          if (!comp) return false
          switch (connection) {
            case 'has-deps':
              return (comp.dependencies || []).length > 0
            case 'has-dependents':
              return dependedUpon.has(comp.id)
            case 'orphans':
              return (comp.dependencies || []).length === 0 && !dependedUpon.has(comp.id)
            default:
              return true
          }
        })
      )
    }

    return ids
  }, [filters, components])

  const selected = useMemo(
    () => components.find((c) => c.id === selectedId) || null,
    [components, selectedId]
  )

  const updateComponents = useCallback(
    (newComponents) => {
      onUpdate({
        architecture: { ...project.architecture, components: newComponents },
      })
    },
    [project?.architecture, onUpdate]
  )

  // --- CRUD handlers ---

  const handleAddComponent = useCallback(
    (data) => {
      const newComp = {
        id: generateId(),
        name: data?.name || 'New Component',
        type: data?.type || 'component',
        parentId: data?.parentId || null,
        description: data?.description || '',
        dependencies: [],
      }
      updateComponents([...components, newComp])
      setSelectedId(newComp.id)
    },
    [components, updateComponents]
  )

  const handleQuickAdd = useCallback(() => {
    handleAddComponent()
  }, [handleAddComponent])

  const handleUpdateSelected = useCallback(
    (field, value) => {
      if (!selectedId) return
      updateComponents(components.map((c) => (c.id === selectedId ? { ...c, [field]: value } : c)))
    },
    [selectedId, components, updateComponents]
  )

  const handleDeleteSelected = useCallback(() => {
    if (!selectedId) return
    const idsToRemove = new Set([selectedId])

    const findChildren = (parentId) => {
      components.forEach((c) => {
        if (c.parentId === parentId && !idsToRemove.has(c.id)) {
          idsToRemove.add(c.id)
          findChildren(c.id)
        }
      })
    }
    findChildren(selectedId)

    const updated = components
      .filter((c) => !idsToRemove.has(c.id))
      .map((c) => ({
        ...c,
        dependencies: (c.dependencies || []).filter((depId) => !idsToRemove.has(depId)),
      }))

    updateComponents(updated)
    setSelectedId(null)
  }, [selectedId, components, updateComponents])

  // Build parent options (exclude self and descendants)
  const parentOptions = useMemo(() => {
    if (!selectedId) return []

    const descendants = new Set()
    const findDescendants = (parentId) => {
      components.forEach((c) => {
        if (c.parentId === parentId && !descendants.has(c.id)) {
          descendants.add(c.id)
          findDescendants(c.id)
        }
      })
    }
    findDescendants(selectedId)

    return [
      { value: '', label: 'None (root)' },
      ...components
        .filter((c) => c.id !== selectedId && !descendants.has(c.id))
        .map((c) => ({
          value: c.id,
          label: `${c.name} (${c.type})`,
        })),
    ]
  }, [selectedId, components])

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Header row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs tabs={VIEW_TABS} activeTab={view} onTabChange={setView} />
        <Button size="sm" icon={Plus} onClick={() => setShowComponentForm(true)}>
          Add Component
        </Button>
      </div>

      {/* Filters */}
      <ArchitectureFilterBar
        components={components}
        filters={filters}
        onFilterChange={setFilters}
      />

      {/* View content */}
      {view === 'graph' ? (
        <div className="flex flex-1 gap-4 min-h-0">
          <DependencyGraph
            components={components}
            selectedId={selectedId}
            onSelectNode={setSelectedId}
            onUpdateComponents={updateComponents}
            highlightIds={highlightIds}
          />
          {selected && (
            <div className="w-80 shrink-0 overflow-y-auto">
              <AnimatePresence mode="wait">
                <ComponentDetail
                  key={selected.id}
                  component={selected}
                  allComponents={components}
                  onUpdate={handleUpdateSelected}
                  onDelete={handleDeleteSelected}
                  parentOptions={parentOptions}
                />
              </AnimatePresence>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-1 flex-col gap-4 md:flex-row min-h-0">
          <div className="flex w-full shrink-0 flex-col max-h-64 md:max-h-none md:w-80">
            <ComponentTree
              components={components}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onAdd={handleQuickAdd}
              highlightIds={highlightIds}
            />
          </div>

          <div className="flex-1">
            <AnimatePresence mode="wait">
              {selected ? (
                <ComponentDetail
                  key={selected.id}
                  component={selected}
                  allComponents={components}
                  onUpdate={handleUpdateSelected}
                  onDelete={handleDeleteSelected}
                  parentOptions={parentOptions}
                />
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex h-full items-center justify-center"
                >
                  <div className="text-center">
                    <Network
                      size={48}
                      className="mx-auto mb-4 text-[var(--color-fg-subtle)]"
                      strokeWidth={1.5}
                    />
                    <p className="text-sm text-[var(--color-fg-muted)]">
                      {components.length > 0
                        ? 'Select a component to view details'
                        : 'Add your first component to get started'}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Add Component Modal */}
      <ComponentForm
        isOpen={showComponentForm}
        onClose={() => setShowComponentForm(false)}
        onSave={handleAddComponent}
        allComponents={components}
      />
    </div>
  )
}
