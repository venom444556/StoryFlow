import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Trash2 } from 'lucide-react'
import GlassCard from '../ui/GlassCard'
import Input from '../ui/Input'
import Select from '../ui/Select'
import Badge from '../ui/Badge'
import Button from '../ui/Button'
import { COMPONENT_TYPES, TYPE_COLORS, TYPE_HEX_COLORS, TYPE_ICONS } from './constants'
import { buildBezierPath } from '../../utils/workflow'
import { wouldCreateCycle } from '../../utils/graph'

// ---------------------------------------------------------------------------
// DependencyList — outgoing dependencies
// ---------------------------------------------------------------------------
function DependencyList({ dependencies, allComponents, currentComponentId, onChange }) {
  const [adding, setAdding] = useState(false)

  // Filter available components: exclude already-added dependencies and those that would create cycles
  const availableComponents = useMemo(() => {
    return allComponents.filter((c) => {
      // Already a dependency
      if (dependencies.includes(c.id)) return false
      // Would create a circular dependency
      if (wouldCreateCycle(currentComponentId, c.id, allComponents)) return false
      return true
    })
  }, [allComponents, dependencies, currentComponentId])

  return (
    <div className="w-full">
      <label className="mb-1 block text-xs text-[var(--color-fg-muted)]">Depends on</label>
      <div className="space-y-1.5">
        {dependencies.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {dependencies.map((depId) => {
              const dep = allComponents.find((c) => c.id === depId)
              if (!dep) return null
              return (
                <Badge
                  key={depId}
                  variant={TYPE_COLORS[dep.type] || 'default'}
                  size="xs"
                  removable
                  onRemove={() => onChange(dependencies.filter((id) => id !== depId))}
                >
                  {dep.name}
                </Badge>
              )
            })}
          </div>
        ) : (
          <p className="text-[11px] text-[var(--color-fg-muted)]">No dependencies</p>
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
            className="text-[11px] transition-colors"
            style={{ color: 'var(--accent-active, #8b5cf6)' }}
          >
            + Add dependency
          </button>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// MiniDepGraph — small SVG showing immediate neighbors
// ---------------------------------------------------------------------------
function MiniDepGraph({ component, allComponents }) {
  const deps = (component.dependencies || [])
    .map((id) => allComponents.find((c) => c.id === id))
    .filter(Boolean)
  const usedBy = allComponents.filter((c) => (c.dependencies || []).includes(component.id))

  if (deps.length === 0 && usedBy.length === 0) return null

  const nodeW = 100
  const nodeH = 30
  const connGap = 30 // horizontal gap between columns for bezier curves
  const gapY = 38

  const leftNodes = deps.slice(0, 4)
  const rightNodes = usedBy.slice(0, 4)

  const hasLeft = leftNodes.length > 0
  const hasRight = rightNodes.length > 0

  // Compute column X positions — only allocate space for columns that exist
  const pad = 6
  let leftX, centerX, rightX, svgWidth

  if (hasLeft && hasRight) {
    leftX = pad
    centerX = pad + nodeW + connGap
    rightX = centerX + nodeW + connGap
    svgWidth = rightX + nodeW + pad
  } else if (hasLeft) {
    leftX = pad
    centerX = pad + nodeW + connGap
    rightX = 0 // unused
    svgWidth = centerX + nodeW + pad
  } else {
    leftX = 0 // unused
    centerX = pad
    rightX = pad + nodeW + connGap
    svgWidth = rightX + nodeW + pad
  }

  const svgHeight = Math.max(nodeH + 20, Math.max(leftNodes.length, rightNodes.length) * gapY + 14)
  const centerY = svgHeight / 2 - nodeH / 2

  const leftStartY = centerY - ((leftNodes.length - 1) * gapY) / 2
  const rightStartY = centerY - ((rightNodes.length - 1) * gapY) / 2

  return (
    <div className="mb-3 overflow-hidden rounded-lg bg-[var(--color-bg-glass)] p-2">
      <svg
        width="100%"
        height={svgHeight}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Edges from dependencies → center */}
        {leftNodes.map((dep, i) => {
          const y = leftStartY + i * gapY
          const path = buildBezierPath(leftX + nodeW, y + nodeH / 2, centerX, centerY + nodeH / 2)
          return (
            <path
              key={`l-${dep.id}`}
              d={path}
              stroke={TYPE_HEX_COLORS[dep.type] || '#6b7280'}
              strokeWidth="2"
              fill="none"
              opacity={0.65}
            />
          )
        })}

        {/* Edges from center → used-by */}
        {rightNodes.map((ub, i) => {
          const y = rightStartY + i * gapY
          const path = buildBezierPath(centerX + nodeW, centerY + nodeH / 2, rightX, y + nodeH / 2)
          return (
            <path
              key={`r-${ub.id}`}
              d={path}
              stroke={TYPE_HEX_COLORS[ub.type] || '#6b7280'}
              strokeWidth="2"
              fill="none"
              opacity={0.65}
            />
          )
        })}

        {/* Left dependency nodes */}
        {leftNodes.map((dep, i) => {
          const y = leftStartY + i * gapY
          return (
            <g key={`ln-${dep.id}`}>
              <rect
                x={leftX}
                y={y}
                width={nodeW}
                height={nodeH}
                rx={6}
                fill={`${TYPE_HEX_COLORS[dep.type] || '#6b7280'}18`}
                stroke={TYPE_HEX_COLORS[dep.type] || '#6b7280'}
                strokeWidth={1}
              />
              <text
                x={leftX + nodeW / 2}
                y={y + nodeH / 2 + 4}
                textAnchor="middle"
                fill="var(--th-text-muted)"
                fontSize="10"
              >
                {dep.name.length > 14 ? dep.name.slice(0, 12) + '\u2026' : dep.name}
              </text>
            </g>
          )
        })}

        {/* Center node */}
        <rect
          x={centerX}
          y={centerY}
          width={nodeW}
          height={nodeH}
          rx={6}
          fill={`${TYPE_HEX_COLORS[component.type] || '#6b7280'}30`}
          stroke={TYPE_HEX_COLORS[component.type] || '#6b7280'}
          strokeWidth={1.5}
        />
        <text
          x={centerX + nodeW / 2}
          y={centerY + nodeH / 2 + 4}
          textAnchor="middle"
          fill="var(--color-fg-default)"
          fontSize="11"
          fontWeight="600"
        >
          {component.name.length > 14 ? component.name.slice(0, 12) + '\u2026' : component.name}
        </text>

        {/* Right used-by nodes */}
        {rightNodes.map((ub, i) => {
          const y = rightStartY + i * gapY
          return (
            <g key={`rn-${ub.id}`}>
              <rect
                x={rightX}
                y={y}
                width={nodeW}
                height={nodeH}
                rx={6}
                fill={`${TYPE_HEX_COLORS[ub.type] || '#6b7280'}18`}
                stroke={TYPE_HEX_COLORS[ub.type] || '#6b7280'}
                strokeWidth={1}
              />
              <text
                x={rightX + nodeW / 2}
                y={y + nodeH / 2 + 4}
                textAnchor="middle"
                fill="var(--th-text-muted)"
                fontSize="10"
              >
                {ub.name.length > 14 ? ub.name.slice(0, 12) + '\u2026' : ub.name}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

// ---------------------------------------------------------------------------
// ComponentDetail
// ---------------------------------------------------------------------------
export default function ComponentDetail({
  component,
  allComponents,
  onUpdate,
  onDelete,
  parentOptions,
}) {
  const TypeIcon = TYPE_ICONS[component.type] || null
  const hexColor = TYPE_HEX_COLORS[component.type] || '#6b7280'

  // Components that depend on this one ("Used by")
  const usedBy = useMemo(
    () =>
      allComponents.filter(
        (c) => c.id !== component.id && (c.dependencies || []).includes(component.id)
      ),
    [allComponents, component.id]
  )

  return (
    <motion.div
      key={component.id}
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -12 }}
      transition={{ duration: 0.15 }}
    >
      <GlassCard className="!p-3">
        {/* Header: type badge + name + delete */}
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {TypeIcon && (
              <div
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded"
                style={{ backgroundColor: `${hexColor}18` }}
              >
                <TypeIcon size={13} style={{ color: hexColor }} />
              </div>
            )}
            <Badge variant={TYPE_COLORS[component.type] || 'default'} size="xs" dot>
              {component.type}
            </Badge>
            <h3 className="truncate text-sm font-semibold text-[var(--color-fg-default)]">
              {component.name}
            </h3>
          </div>
          <Button variant="danger" size="sm" icon={Trash2} onClick={onDelete}>
            Delete
          </Button>
        </div>

        {/* Mini dependency visualization */}
        <MiniDepGraph component={component} allComponents={allComponents} />

        <div className="space-y-3">
          <Input
            label="Name"
            value={component.name}
            onChange={(e) => onUpdate('name', e.target.value)}
            placeholder="Component name"
          />

          <div className="grid gap-3 grid-cols-2">
            <Select
              label="Type"
              value={component.type}
              options={COMPONENT_TYPES}
              onChange={(e) => onUpdate('type', e.target.value)}
            />
            <Select
              label="Parent"
              value={component.parentId || ''}
              options={parentOptions}
              onChange={(e) => onUpdate('parentId', e.target.value || null)}
            />
          </div>

          <div className="w-full">
            <label className="mb-1 block text-xs text-[var(--color-fg-muted)]">Description</label>
            <textarea
              value={component.description || ''}
              onChange={(e) => onUpdate('description', e.target.value)}
              placeholder="Describe what this component does..."
              rows={2}
              className="glass-input w-full resize-none px-2.5 py-1.5 text-xs text-[var(--color-fg-default)] placeholder-[var(--color-fg-muted)]"
            />
          </div>

          <DependencyList
            dependencies={component.dependencies || []}
            allComponents={allComponents.filter((c) => c.id !== component.id)}
            currentComponentId={component.id}
            onChange={(deps) => onUpdate('dependencies', deps)}
          />

          {/* Used by (incoming dependencies) */}
          {usedBy.length > 0 && (
            <div className="w-full">
              <label className="mb-1 block text-xs text-[var(--color-fg-muted)]">Used by</label>
              <div className="flex flex-wrap gap-1">
                {usedBy.map((c) => (
                  <Badge key={c.id} variant={TYPE_COLORS[c.type] || 'default'} size="xs">
                    {c.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </GlassCard>
    </motion.div>
  )
}
