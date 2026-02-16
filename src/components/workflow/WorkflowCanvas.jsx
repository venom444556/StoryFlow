import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { generateId } from '../../utils/ids'
import { useCanvasViewport } from '../../hooks/useCanvasViewport'
import { useCanvasDrag } from '../../hooks/useCanvasDrag'
import { useCanvasPan } from '../../hooks/useCanvasPan'
import { useCanvasConnection } from '../../hooks/useCanvasConnection'
import WorkflowNode from './WorkflowNode'
import WorkflowConnection from './WorkflowConnection'
import NodeContextMenu from './NodeContextMenu'
import WorkflowZoomControls from './WorkflowZoomControls'
import ConfirmDialog from '../ui/ConfirmDialog'
import { NODE_WIDTH } from '../../utils/canvasConstants'

// ---------------------------------------------------------------------------
// WorkflowCanvas
// ---------------------------------------------------------------------------
// Reusable interactive workflow canvas with SVG grid, nodes, connections,
// drag, connection-drawing, zoom/pan, and context menu support.
// Uses extracted hooks for viewport, drag, pan, and connection management.
// ---------------------------------------------------------------------------
const HANDLE_CENTER_Y = 41

export default function WorkflowCanvas({
  nodes,
  connections,
  selectedNodeId,
  onSaveNodes,
  onSaveConnections,
  onSaveBoth,
  onSelectNode,
  onDrillDown,
  onNodeDoubleClick,
  onAddChildren,
  isExecuting = false,
  canvasId = 'main',
}) {
  const canvasRef = useRef(null)
  const [contextMenu, setContextMenu] = useState(null)

  // Guard against NaN/undefined coordinates (M4 audit fix)
  const safeNodes = useMemo(
    () =>
      (nodes || []).map((n) => ({
        ...n,
        x: Number.isFinite(n.x) ? n.x : 0,
        y: Number.isFinite(n.y) ? n.y : 0,
      })),
    [nodes]
  )

  // ------ Viewport (zoom + pan offset) ------
  const {
    viewport,
    setViewport,
    screenToCanvas,
    handleZoomIn,
    handleZoomOut,
    handleResetView,
    MIN_ZOOM,
    MAX_ZOOM,
  } = useCanvasViewport(canvasRef, safeNodes, canvasId)

  // ------ Drag handling ------
  const {
    draggingId,
    pendingDragId,
    handleNodeMouseDown: onNodeMouseDown,
    handleDragMove,
    handleDragEnd,
  } = useCanvasDrag({
    nodes,
    onSaveNodes,
    onSelectNode,
    screenToCanvas,
    canvasRef,
    isExecuting,
  })

  // ------ Pan handling ------
  const { isPanning, handlePanStart, handlePanMove, handlePanEnd } = useCanvasPan(
    viewport,
    setViewport
  )

  // ------ Connection drawing ------
  const {
    connectingFrom,
    tempConnectionEnd,
    handleStartConnect,
    handleEndConnect,
    handleConnectionMove,
    handleConnectionEnd,
    handleDeleteConnection,
  } = useCanvasConnection({
    connections,
    onSaveConnections,
    screenToCanvas,
    canvasRef,
    isExecuting,
  })

  // ------ Connection counts ------
  const inConnectionCounts = useMemo(() => {
    const counts = {}
    connections.forEach((c) => {
      counts[c.to] = (counts[c.to] || 0) + 1
    })
    return counts
  }, [connections])

  const outConnectionCounts = useMemo(() => {
    const counts = {}
    connections.forEach((c) => {
      counts[c.from] = (counts[c.from] || 0) + 1
    })
    return counts
  }, [connections])

  const contextMenuNode = contextMenu ? nodes.find((n) => n.id === contextMenu.nodeId) : null

  // ------ Node CRUD ------

  const [deleteConfirmNodeId, setDeleteConfirmNodeId] = useState(null)

  const handleRequestDeleteNode = useCallback((nodeId) => {
    setDeleteConfirmNodeId(nodeId)
    setContextMenu(null)
  }, [])

  const handleConfirmDeleteNode = useCallback(() => {
    if (!deleteConfirmNodeId) return
    const updatedNodes = nodes.filter((n) => n.id !== deleteConfirmNodeId)
    const updatedConns = connections.filter(
      (c) => c.from !== deleteConfirmNodeId && c.to !== deleteConfirmNodeId
    )
    onSaveBoth(updatedNodes, updatedConns)
    if (selectedNodeId === deleteConfirmNodeId) onSelectNode?.(null)
    setDeleteConfirmNodeId(null)
  }, [deleteConfirmNodeId, nodes, connections, onSaveBoth, selectedNodeId, onSelectNode])

  const handleDuplicateNode = useCallback(
    (nodeId) => {
      const original = nodes.find((n) => n.id === nodeId)
      if (!original) return

      const duplicate = {
        ...original,
        id: generateId(),
        title: `${original.title} (copy)`,
        x: original.x + 40,
        y: original.y + 40,
        status: 'idle',
        error: null,
        children: undefined,
      }
      onSaveNodes([...nodes, duplicate])
      onSelectNode?.(duplicate.id)
      setContextMenu(null)
    },
    [nodes, onSaveNodes, onSelectNode]
  )

  // ------ Context menu ------

  const handleNodeContextMenu = useCallback((nodeId, event) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    setContextMenu({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      nodeId,
    })
  }, [])

  const closeContextMenu = useCallback(() => {
    setContextMenu(null)
  }, [])

  // Wrap mouse down to also close context menu
  const handleNodeMouseDown = useCallback(
    (nodeId, event) => {
      setContextMenu(null)
      onNodeMouseDown(nodeId, event)
    },
    [onNodeMouseDown]
  )

  // ------ Global mouse handlers ------

  const handleCanvasMouseMove = useCallback(
    (event) => {
      // Priority: pan > drag > connection
      if (handlePanMove(event)) return
      if (handleDragMove(event)) return
      handleConnectionMove(event)
    },
    [handlePanMove, handleDragMove, handleConnectionMove]
  )

  const handleCanvasMouseUp = useCallback(() => {
    handleDragEnd()
    handlePanEnd()
    handleConnectionEnd()
  }, [handleDragEnd, handlePanEnd, handleConnectionEnd])

  useEffect(() => {
    if (!draggingId && !connectingFrom && !pendingDragId && !isPanning) return

    const move = (e) => handleCanvasMouseMove(e)
    const up = () => handleCanvasMouseUp()

    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', up)

    return () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseup', up)
    }
  }, [
    draggingId,
    connectingFrom,
    pendingDragId,
    isPanning,
    handleCanvasMouseMove,
    handleCanvasMouseUp,
  ])

  // ------ Canvas click (deselect) ------

  const handleCanvasClick = useCallback(
    (e) => {
      // Deselect when clicking empty canvas area (not on a node)
      if (!e.target.closest('[data-workflow-node]')) {
        onSelectNode?.(null)
        setContextMenu(null)
      }
    },
    [onSelectNode]
  )

  // ------ Temp connection path ------

  const renderTempConnection = () => {
    if (!connectingFrom || !tempConnectionEnd) return null

    const fromNode = safeNodes.find((n) => n.id === connectingFrom)
    if (!fromNode) return null

    const startX = fromNode.x + NODE_WIDTH + 7
    const startY = fromNode.y + HANDLE_CENTER_Y

    return (
      <line
        x1={startX}
        y1={startY}
        x2={tempConnectionEnd.x}
        y2={tempConnectionEnd.y}
        stroke="#3b82f6"
        strokeWidth="2"
        strokeDasharray="6 4"
        strokeLinecap="round"
        className="pointer-events-none"
      />
    )
  }

  const canvasCursor = isPanning
    ? 'grabbing'
    : draggingId
      ? 'grabbing'
      : connectingFrom
        ? 'crosshair'
        : 'default'

  const transformStyle = {
    zoom: viewport.scale,
    transform: `translate(${viewport.offsetX / viewport.scale}px, ${viewport.offsetY / viewport.scale}px)`,
    transformOrigin: '0 0',
  }

  // Compute grid background offset so the dot grid moves with pan/zoom
  // The grid lives on the container (not the transform wrapper) to fill the entire area
  const gridSize = 20 * viewport.scale
  const gridOffX = viewport.offsetX % (20 * viewport.scale)
  const gridOffY = viewport.offsetY % (20 * viewport.scale)

  return (
    <div
      ref={canvasRef}
      className="relative flex-1 overflow-hidden bg-surface-primary"
      style={{
        cursor: canvasCursor,
        backgroundImage: `radial-gradient(circle, var(--color-border-emphasis) 0.8px, transparent 0.8px)`,
        backgroundSize: `${gridSize}px ${gridSize}px`,
        backgroundPosition: `${gridOffX}px ${gridOffY}px`,
      }}
      onMouseDown={handlePanStart}
      onClick={handleCanvasClick}
    >
      {/* Transform wrapper */}
      <div className="absolute inset-0" style={transformStyle}>
        <svg
          className="absolute h-full w-full"
          style={{ left: 0, top: 0, width: '200%', height: '200%' }}
        >
          {/* Connections */}
          {connections.map((conn) => {
            const fromNode = safeNodes.find((n) => n.id === conn.from)
            const toNode = safeNodes.find((n) => n.id === conn.to)
            if (!fromNode || !toNode) return null

            return (
              <WorkflowConnection
                key={conn.id}
                fromNode={fromNode}
                toNode={toNode}
                connection={conn}
                onDelete={isExecuting ? undefined : handleDeleteConnection}
              />
            )
          })}

          {/* Temp connection being drawn */}
          {renderTempConnection()}
        </svg>

        {/* Nodes rendered as HTML positioned over the SVG */}
        {safeNodes.map((node) => (
          <WorkflowNode
            key={node.id}
            node={node}
            isSelected={selectedNodeId === node.id}
            inConnections={inConnectionCounts[node.id] || 0}
            outConnections={outConnectionCounts[node.id] || 0}
            onMouseDown={(e) => handleNodeMouseDown(node.id, e)}
            onDoubleClick={() => onNodeDoubleClick?.(node.id)}
            onDrillDown={() => onDrillDown?.(node.id)}
            onContextMenu={(e) => handleNodeContextMenu(node.id, e)}
            onStartConnect={() => handleStartConnect(node.id)}
            onEndConnect={() => handleEndConnect(node.id)}
          />
        ))}
      </div>

      {/* Context menu (outside transform) */}
      {contextMenu && contextMenuNode && (
        <NodeContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          node={contextMenuNode}
          onClose={closeContextMenu}
          onEdit={() => {
            onNodeDoubleClick?.(contextMenu.nodeId)
            setContextMenu(null)
          }}
          onDuplicate={() => handleDuplicateNode(contextMenu.nodeId)}
          onDelete={() => handleRequestDeleteNode(contextMenu.nodeId)}
          onAddChildren={
            onAddChildren && !contextMenuNode.children?.nodes?.length
              ? () => {
                  onAddChildren(contextMenu.nodeId)
                  setContextMenu(null)
                }
              : undefined
          }
          onDrillDown={
            contextMenuNode.children?.nodes?.length
              ? () => {
                  onDrillDown?.(contextMenu.nodeId)
                  setContextMenu(null)
                }
              : undefined
          }
          isExecuting={isExecuting}
        />
      )}

      {/* Zoom controls (outside transform) */}
      <WorkflowZoomControls
        scale={viewport.scale}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onReset={handleResetView}
        minZoom={MIN_ZOOM}
        maxZoom={MAX_ZOOM}
      />

      {/* Delete node confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirmNodeId !== null}
        onClose={() => setDeleteConfirmNodeId(null)}
        onConfirm={handleConfirmDeleteNode}
        title="Delete node?"
        message="This workflow node and all its connections will be permanently removed. This cannot be undone."
        confirmLabel="Delete"
      />
    </div>
  )
}
