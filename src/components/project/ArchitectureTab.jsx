import React, { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  ChevronRight,
  ChevronDown,
  Trash2,
  Network,
} from 'lucide-react'
import { generateId } from '../../utils/ids'
import GlassCard from '../ui/GlassCard'
import Input from '../ui/Input'
import Select from '../ui/Select'
import Badge from '../ui/Badge'
import Button from '../ui/Button'
import EmptyState from '../ui/EmptyState'

const COMPONENT_TYPES = [
  { value: 'page', label: 'Page' },
  { value: 'component', label: 'Component' },
  { value: 'hook', label: 'Hook' },
  { value: 'util', label: 'Utility' },
  { value: 'context', label: 'Context' },
  { value: 'api', label: 'API' },
  { value: 'service', label: 'Service' },
  { value: 'model', label: 'Model' },
]

const TYPE_COLORS = {
  page: 'blue',
  component: 'purple',
  hook: 'cyan',
  util: 'yellow',
  context: 'green',
  api: 'red',
  service: 'pink',
  model: 'gray',
}

// Build a tree structure from the flat components array
function buildTree(components) {
  const map = {}
  const roots = []

  // Index all components by id
  components.forEach((comp) => {
    map[comp.id] = { ...comp, children: [] }
  })

  // Assign children
  components.forEach((comp) => {
    if (comp.parentId && map[comp.parentId]) {
      map[comp.parentId].children.push(map[comp.id])
    } else {
      roots.push(map[comp.id])
    }
  })

  return roots
}

function TreeNode({ node, selectedId, onSelect, depth = 0 }) {
  const [expanded, setExpanded] = useState(true)
  const hasChildren = node.children && node.children.length > 0
  const isSelected = selectedId === node.id

  return (
    <div>
      <button
        onClick={() => onSelect(node.id)}
        className={[
          'group flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors',
          isSelected
            ? 'bg-white/10 text-white'
            : 'text-slate-300 hover:bg-white/5 hover:text-white',
        ].join(' ')}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {/* Expand/collapse toggle */}
        {hasChildren ? (
          <span
            onClick={(e) => {
              e.stopPropagation()
              setExpanded((prev) => !prev)
            }}
            className="flex h-4 w-4 shrink-0 items-center justify-center text-slate-500 hover:text-slate-300"
          >
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </span>
        ) : (
          <span className="h-4 w-4 shrink-0" />
        )}

        <Badge variant={TYPE_COLORS[node.type] || 'default'} size="sm">
          {node.type || 'component'}
        </Badge>
        <span className="truncate">{node.name}</span>
      </button>

      {/* Children */}
      {hasChildren && expanded && (
        <div>
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              selectedId={selectedId}
              onSelect={onSelect}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
  className = '',
}) {
  return (
    <div className={['w-full', className].filter(Boolean).join(' ')}>
      {label && (
        <label className="mb-1.5 block text-sm text-slate-400">{label}</label>
      )}
      <textarea
        value={value || ''}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className="glass-input w-full resize-none px-3 py-2 text-sm text-white placeholder-slate-500"
      />
    </div>
  )
}

function DependencyList({ dependencies, allComponents, onChange }) {
  const [adding, setAdding] = useState(false)

  const availableComponents = allComponents.filter(
    (c) => !dependencies.includes(c.id)
  )

  return (
    <div className="w-full">
      <label className="mb-1.5 block text-sm text-slate-400">Dependencies</label>
      <div className="space-y-1.5">
        {dependencies.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {dependencies.map((depId) => {
              const dep = allComponents.find((c) => c.id === depId)
              if (!dep) return null
              return (
                <Badge
                  key={depId}
                  variant={TYPE_COLORS[dep.type] || 'default'}
                  size="sm"
                  removable
                  onRemove={() =>
                    onChange(dependencies.filter((id) => id !== depId))
                  }
                >
                  {dep.name}
                </Badge>
              )
            })}
          </div>
        ) : (
          <p className="text-xs text-slate-500">No dependencies</p>
        )}

        {adding ? (
          <Select
            value=""
            placeholder="Select a component..."
            options={availableComponents.map((c) => ({
              value: c.id,
              label: `${c.name} (${c.type})`,
            }))}
            onChange={(e) => {
              if (e.target.value) {
                onChange([...dependencies, e.target.value])
              }
              setAdding(false)
            }}
          />
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="mt-1 text-xs transition-colors"
            style={{ color: 'var(--accent-active, #8b5cf6)' }}
          >
            + Add dependency
          </button>
        )}
      </div>
    </div>
  )
}

export default function ArchitectureTab({ project, onUpdate }) {
  const [selectedId, setSelectedId] = useState(null)

  const components = project?.architecture?.components || []

  const tree = useMemo(() => buildTree(components), [components])

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

  const handleAddComponent = useCallback(() => {
    const newComp = {
      id: generateId(),
      name: 'New Component',
      type: 'component',
      parentId: null,
      description: '',
      dependencies: [],
    }
    updateComponents([...components, newComp])
    setSelectedId(newComp.id)
  }, [components, updateComponents])

  const handleUpdateSelected = useCallback(
    (field, value) => {
      if (!selectedId) return
      updateComponents(
        components.map((c) =>
          c.id === selectedId ? { ...c, [field]: value } : c
        )
      )
    },
    [selectedId, components, updateComponents]
  )

  const handleDeleteSelected = useCallback(() => {
    if (!selectedId) return
    // Remove the component and any components that have it as parent
    const idsToRemove = new Set([selectedId])

    // Recursively find children
    const findChildren = (parentId) => {
      components.forEach((c) => {
        if (c.parentId === parentId && !idsToRemove.has(c.id)) {
          idsToRemove.add(c.id)
          findChildren(c.id)
        }
      })
    }
    findChildren(selectedId)

    // Also remove from other components' dependencies
    const updated = components
      .filter((c) => !idsToRemove.has(c.id))
      .map((c) => ({
        ...c,
        dependencies: (c.dependencies || []).filter(
          (depId) => !idsToRemove.has(depId)
        ),
      }))

    updateComponents(updated)
    setSelectedId(null)
  }, [selectedId, components, updateComponents])

  // Build parent options (exclude self and descendants)
  const parentOptions = useMemo(() => {
    if (!selectedId) return []

    // Find all descendants of the selected component
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
    <div className="flex h-full flex-col gap-4 md:flex-row">
      {/* Left Panel - Component Tree */}
      <div className="flex w-full shrink-0 flex-col max-h-64 md:max-h-none md:w-80">
        <GlassCard className="flex flex-1 flex-col overflow-hidden">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
              Components
            </h3>
            <Button
              variant="ghost"
              size="sm"
              icon={Plus}
              onClick={handleAddComponent}
            >
              Add
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto -mx-2">
            {tree.length > 0 ? (
              <div className="space-y-0.5">
                {tree.map((node) => (
                  <TreeNode
                    key={node.id}
                    node={node}
                    selectedId={selectedId}
                    onSelect={setSelectedId}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Network}
                title="No components yet"
                description="Add your first component to start building your architecture."
                action={{
                  label: 'Add Component',
                  onClick: handleAddComponent,
                }}
              />
            )}
          </div>
        </GlassCard>
      </div>

      {/* Right Panel - Component Detail */}
      <div className="flex-1">
        <AnimatePresence mode="wait">
          {selected ? (
            <motion.div
              key={selected.id}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.15 }}
            >
              <GlassCard>
                <div className="mb-5 flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={TYPE_COLORS[selected.type] || 'default'}
                      size="md"
                      dot
                    >
                      {selected.type}
                    </Badge>
                    <h3 className="text-lg font-semibold text-white">
                      {selected.name}
                    </h3>
                  </div>
                  <Button
                    variant="danger"
                    size="sm"
                    icon={Trash2}
                    onClick={handleDeleteSelected}
                  >
                    Delete
                  </Button>
                </div>

                <div className="space-y-4">
                  <Input
                    label="Name"
                    value={selected.name}
                    onChange={(e) =>
                      handleUpdateSelected('name', e.target.value)
                    }
                    placeholder="Component name"
                  />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Select
                      label="Type"
                      value={selected.type}
                      options={COMPONENT_TYPES}
                      onChange={(e) =>
                        handleUpdateSelected('type', e.target.value)
                      }
                    />
                    <Select
                      label="Parent"
                      value={selected.parentId || ''}
                      options={parentOptions}
                      onChange={(e) =>
                        handleUpdateSelected(
                          'parentId',
                          e.target.value || null
                        )
                      }
                    />
                  </div>

                  <TextArea
                    label="Description"
                    value={selected.description}
                    onChange={(e) =>
                      handleUpdateSelected('description', e.target.value)
                    }
                    placeholder="Describe what this component does..."
                    rows={4}
                  />

                  <DependencyList
                    dependencies={selected.dependencies || []}
                    allComponents={components.filter(
                      (c) => c.id !== selectedId
                    )}
                    onChange={(deps) =>
                      handleUpdateSelected('dependencies', deps)
                    }
                  />
                </div>
              </GlassCard>
            </motion.div>
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
                  className="mx-auto mb-4 text-slate-600"
                  strokeWidth={1.5}
                />
                <p className="text-sm text-slate-500">
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
  )
}
