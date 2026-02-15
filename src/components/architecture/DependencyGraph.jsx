import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import WorkflowZoomControls from '../workflow/WorkflowZoomControls'
import DependencyEdge from './DependencyEdge'
import { autoLayout } from './archLayout'
import { TYPE_HEX_COLORS, TYPE_ICONS } from './constants'

// ---------------------------------------------------------------------------
// DependencyGraph
// ---------------------------------------------------------------------------
// Interactive visual dependency graph adapted from WorkflowCanvas.
// Nodes rendered as HTML divs, edges as SVG bezier paths.
// Supports zoom/pan/drag. No connection drawing or execution engine.
// ---------------------------------------------------------------------------

const NODE_WIDTH = 180
const GRID_SIZE = 20

const MIN_ZOOM = 0.25
const MAX_ZOOM = 2.0
const ZOOM_STEP = 0.1

function snapToGrid(value) {
  return Math.round(value / GRID_SIZE) * GRID_SIZE
}

function clampZoom(z) {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round(z * 100) / 100))
}

export default function DependencyGraph({
  components,
  selectedId,
  onSelectNode,
  onUpdateComponents,
  highlightIds,
}) {
  // ------ Viewport state ------
  const [viewport, setViewport] = useState({ scale: 1, offsetX: 0, offsetY: 0 })
  const viewportInitialized = useRef(false)

  // ------ Drag state ------
  const [draggingId, setDraggingId] = useState(null)
  const [pendingDragId, setPendingDragId] = useState(null)
  const dragOffsetRef = useRef({ x: 0, y: 0 })
  const dragStartRef = useRef(null)
  const DRAG_THRESHOLD = 4

  // ------ Pan state ------
  const [isPanning, setIsPanning] = useState(false)
  const panStartRef = useRef(null)

  const canvasRef = useRef(null)

  // ------ Auto-layout on first render when nodes lack positions ------
  const positionedComponents = useMemo(() => {
    const needsLayout = components.some((c) => c.x === undefined || c.y === undefined)
    if (!needsLayout) return components

    const positions = autoLayout(components)
    return components.map((c) => {
      if (c.x !== undefined && c.y !== undefined) return c
      const pos = positions.get(c.id)
      return pos ? { ...c, x: pos.x, y: pos.y } : { ...c, x: 60, y: 60 }
    })
  }, [components])

  // Persist auto-layout positions on first render
  const layoutApplied = useRef(false)
  useEffect(() => {
    if (!layoutApplied.current) {
      const needsLayout = components.some((c) => c.x === undefined || c.y === undefined)
      if (needsLayout && positionedComponents.length > 0) {
        onUpdateComponents(positionedComponents)
      }
      layoutApplied.current = true
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ------ Build edge data ------
  const edges = useMemo(() => {
    const result = []
    const compMap = new Map(positionedComponents.map((c) => [c.id, c]))

    positionedComponents.forEach((comp) => {
      ;(comp.dependencies || []).forEach((depId) => {
        const dep = compMap.get(depId)
        if (dep) {
          result.push({
            id: `${comp.id}->${depId}`,
            from: comp,
            to: dep,
            sourceType: comp.type,
            dependerId: comp.id,
            dependencyId: depId,
          })
        }
      })
    })
    return result
  }, [positionedComponents])

  // ------ Coordinate helpers ------
  const screenToCanvas = useCallback(
    (screenX, screenY) => ({
      x: (screenX - viewport.offsetX) / viewport.scale,
      y: (screenY - viewport.offsetY) / viewport.scale,
    }),
    [viewport]
  )

  // ------ Auto-center ------
  const centerOnNodes = useCallback(() => {
    const container = canvasRef.current
    if (!container || positionedComponents.length === 0) return

    const rect = container.getBoundingClientRect()
    const xs = positionedComponents.map((n) => n.x || 0)
    const ys = positionedComponents.map((n) => n.y || 0)
    const minX = Math.min(...xs)
    const maxX = Math.max(...xs) + NODE_WIDTH
    const minY = Math.min(...ys)
    const maxY = Math.max(...ys) + 80

    const contentCenterX = (minX + maxX) / 2
    const contentCenterY = (minY + maxY) / 2

    setViewport({
      scale: 1,
      offsetX: rect.width / 2 - contentCenterX,
      offsetY: rect.height / 2 - contentCenterY,
    })
  }, [positionedComponents])

  useEffect(() => {
    if (!viewportInitialized.current && positionedComponents.length > 0) {
      centerOnNodes()
      viewportInitialized.current = true
    }
  }, [positionedComponents, centerOnNodes])

  // ------ Zoom handlers ------
  const handleZoomIn = useCallback(() => {
    setViewport((prev) => {
      const newScale = clampZoom(prev.scale + ZOOM_STEP)
      const container = canvasRef.current
      if (!container) return { ...prev, scale: newScale }
      const rect = container.getBoundingClientRect()
      const cx = rect.width / 2
      const cy = rect.height / 2
      return {
        scale: newScale,
        offsetX: cx - (cx - prev.offsetX) * (newScale / prev.scale),
        offsetY: cy - (cy - prev.offsetY) * (newScale / prev.scale),
      }
    })
  }, [])

  const handleZoomOut = useCallback(() => {
    setViewport((prev) => {
      const newScale = clampZoom(prev.scale - ZOOM_STEP)
      const container = canvasRef.current
      if (!container) return { ...prev, scale: newScale }
      const rect = container.getBoundingClientRect()
      const cx = rect.width / 2
      const cy = rect.height / 2
      return {
        scale: newScale,
        offsetX: cx - (cx - prev.offsetX) * (newScale / prev.scale),
        offsetY: cy - (cy - prev.offsetY) * (newScale / prev.scale),
      }
    })
  }, [])

  const handleResetView = useCallback(() => {
    centerOnNodes()
  }, [centerOnNodes])

  // Ctrl+scroll zoom
  useEffect(() => {
    const container = canvasRef.current
    if (!container) return

    const onWheel = (e) => {
      if (!e.ctrlKey && !e.metaKey) return
      e.preventDefault()

      const rect = container.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top
      const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP

      setViewport((prev) => {
        const newScale = clampZoom(prev.scale + delta)
        return {
          scale: newScale,
          offsetX: mx - (mx - prev.offsetX) * (newScale / prev.scale),
          offsetY: my - (my - prev.offsetY) * (newScale / prev.scale),
        }
      })
    }

    container.addEventListener('wheel', onWheel, { passive: false })
    return () => container.removeEventListener('wheel', onWheel)
  }, [])

  // ------ Node drag ------
  const handleNodeMouseDown = useCallback(
    (compId, event) => {
      event.preventDefault()
      const node = positionedComponents.find((n) => n.id === compId)
      if (!node) return

      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return

      const canvas = screenToCanvas(event.clientX - rect.left, event.clientY - rect.top)
      dragOffsetRef.current = { x: canvas.x - (node.x || 0), y: canvas.y - (node.y || 0) }
      dragStartRef.current = { clientX: event.clientX, clientY: event.clientY }
      setPendingDragId(compId)
      onSelectNode?.(compId)
    },
    [positionedComponents, onSelectNode, screenToCanvas]
  )

  // ------ Pan ------
  const handlePanStart = useCallback(
    (event) => {
      if (event.button === 1) {
        event.preventDefault()
        setIsPanning(true)
        panStartRef.current = {
          clientX: event.clientX,
          clientY: event.clientY,
          offsetX: viewport.offsetX,
          offsetY: viewport.offsetY,
        }
      }
    },
    [viewport.offsetX, viewport.offsetY]
  )

  // ------ Global mouse handlers ------
  const handleCanvasMouseMove = useCallback(
    (event) => {
      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return

      if (isPanning && panStartRef.current) {
        const dx = event.clientX - panStartRef.current.clientX
        const dy = event.clientY - panStartRef.current.clientY
        setViewport((prev) => ({
          ...prev,
          offsetX: panStartRef.current.offsetX + dx,
          offsetY: panStartRef.current.offsetY + dy,
        }))
        return
      }

      // Drag threshold
      if (!draggingId && pendingDragId && dragStartRef.current) {
        const dx = event.clientX - dragStartRef.current.clientX
        const dy = event.clientY - dragStartRef.current.clientY
        if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) {
          setDraggingId(pendingDragId)
          setPendingDragId(null)
          dragStartRef.current = null
        }
        return
      }

      if (draggingId) {
        const screenX = event.clientX - rect.left
        const screenY = event.clientY - rect.top
        const canvas = screenToCanvas(screenX, screenY)
        const rawX = canvas.x - dragOffsetRef.current.x
        const rawY = canvas.y - dragOffsetRef.current.y
        const newX = snapToGrid(rawX)
        const newY = snapToGrid(rawY)

        const updated = positionedComponents.map((c) =>
          c.id === draggingId ? { ...c, x: Math.max(0, newX), y: Math.max(0, newY) } : c
        )
        onUpdateComponents(updated)
      }
    },
    [draggingId, pendingDragId, isPanning, positionedComponents, onUpdateComponents, screenToCanvas]
  )

  const handleCanvasMouseUp = useCallback(() => {
    if (draggingId) setDraggingId(null)
    setPendingDragId(null)
    dragStartRef.current = null
    if (isPanning) {
      setIsPanning(false)
      panStartRef.current = null
    }
  }, [draggingId, isPanning])

  useEffect(() => {
    if (!draggingId && !pendingDragId && !isPanning) return

    const move = (e) => handleCanvasMouseMove(e)
    const up = () => handleCanvasMouseUp()

    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', up)

    return () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseup', up)
    }
  }, [draggingId, pendingDragId, isPanning, handleCanvasMouseMove, handleCanvasMouseUp])

  // ------ Canvas click (deselect) ------
  const handleCanvasClick = useCallback(
    (e) => {
      if (e.target === e.currentTarget || e.target.tagName === 'rect') {
        onSelectNode?.(null)
      }
    },
    [onSelectNode]
  )

  // ------ Remove dependency edge ------
  const handleDeleteEdge = useCallback(
    (dependerId, dependencyId) => {
      const updated = positionedComponents.map((c) =>
        c.id === dependerId
          ? { ...c, dependencies: (c.dependencies || []).filter((d) => d !== dependencyId) }
          : c
      )
      onUpdateComponents(updated)
    },
    [positionedComponents, onUpdateComponents]
  )

  const canvasCursor = isPanning
    ? 'grabbing'
    : draggingId
      ? 'grabbing'
      : 'default'

  const transformStyle = {
    zoom: viewport.scale,
    transform: `translate(${viewport.offsetX / viewport.scale}px, ${viewport.offsetY / viewport.scale}px)`,
    transformOrigin: '0 0',
  }

  return (
    <div
      ref={canvasRef}
      className="relative flex-1 overflow-hidden bg-surface-primary rounded-xl"
      style={{ cursor: canvasCursor, minHeight: 400 }}
      onMouseDown={handlePanStart}
    >
      <div className="absolute inset-0" style={transformStyle}>
        <svg
          className="absolute h-full w-full"
          style={{ left: 0, top: 0, width: '200%', height: '200%' }}
          onClick={handleCanvasClick}
        >
          {/* Dot grid */}
          <defs>
            <pattern
              id="arch-grid"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="1" cy="1" r="0.8" style={{ fill: 'var(--th-border)' }} />
            </pattern>
          </defs>
          <rect x="-5000" y="-5000" width="10000" height="10000" fill="url(#arch-grid)" />

          {/* Dependency edges */}
          {edges.map((edge) => (
            <DependencyEdge
              key={edge.id}
              fromNode={edge.from}
              toNode={edge.to}
              sourceType={edge.sourceType}
              onDelete={() => handleDeleteEdge(edge.dependerId, edge.dependencyId)}
              edgeOpacity={
                highlightIds
                  ? highlightIds.has(edge.from.id) || highlightIds.has(edge.to.id)
                    ? 1
                    : 0.1
                  : undefined
              }
            />
          ))}
        </svg>

        {/* Component nodes (HTML over SVG) */}
        {positionedComponents.map((comp) => {
          const hexColor = TYPE_HEX_COLORS[comp.type] || '#6b7280'
          const TypeIcon = TYPE_ICONS[comp.type] || null
          const isSelected = selectedId === comp.id
          const depCount = (comp.dependencies || []).length

          return (
            <motion.div
              key={comp.id}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className={[
                'absolute select-none rounded-xl border-2 backdrop-blur-xl',
                'hover:shadow-[0_0_24px_rgba(99,102,241,0.12)]',
                isSelected
                  ? 'border-blue-500/60 ring-2 ring-blue-500/40 ring-offset-1 ring-offset-transparent'
                  : 'border-[var(--color-border-default)]',
              ]
                .filter(Boolean)
                .join(' ')}
              style={{
                left: comp.x || 0,
                top: comp.y || 0,
                width: NODE_WIDTH,
                zIndex: isSelected ? 20 : 2,
                cursor: draggingId === comp.id ? 'grabbing' : 'grab',
                opacity: highlightIds && !highlightIds.has(comp.id) ? 0.15 : 1,
                transition: 'border-color 0.2s, box-shadow 0.2s, opacity 0.2s',
                backgroundColor: 'var(--th-panel)',
              }}
              onMouseDown={(e) => handleNodeMouseDown(comp.id, e)}
            >
              {/* Color bar */}
              <div
                className="h-1 rounded-t-[10px]"
                style={{ backgroundColor: hexColor }}
              />

              <div className="px-3 py-2.5">
                {/* Header */}
                <div className="mb-1.5 flex items-center gap-2">
                  {TypeIcon && (
                    <div
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md"
                      style={{ backgroundColor: `${hexColor}22` }}
                    >
                      <TypeIcon size={13} style={{ color: hexColor }} />
                    </div>
                  )}
                  <span className="flex-1 truncate text-sm font-semibold text-[var(--color-fg-default)]">
                    {comp.name}
                  </span>
                </div>

                {/* Type badge + dep count */}
                <div className="flex items-center gap-1.5">
                  <span
                    className="inline-block rounded-full px-2 py-0.5 text-[10px] font-medium"
                    style={{ backgroundColor: `${hexColor}22`, color: hexColor }}
                  >
                    {comp.type}
                  </span>
                  {depCount > 0 && (
                    <span className="text-[10px] text-[var(--color-fg-muted)]">
                      {depCount} dep{depCount !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                {/* Description preview */}
                {comp.description && (
                  <div className="mt-2">
                    <p className="line-clamp-1 text-[10px] leading-tight text-[var(--color-fg-muted)]">
                      {comp.description}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Zoom controls */}
      <WorkflowZoomControls
        scale={viewport.scale}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onReset={handleResetView}
        minZoom={MIN_ZOOM}
        maxZoom={MAX_ZOOM}
      />
    </div>
  )
}
