import { useState, useCallback, useRef } from 'react'

const GRID_SIZE = 20
const DRAG_THRESHOLD = 4

function snapToGrid(value) {
  return Math.round(value / GRID_SIZE) * GRID_SIZE
}

/**
 * Hook for managing canvas node dragging.
 * Extracts drag logic from WorkflowCanvas for reusability.
 */
export function useCanvasDrag({
  nodes,
  onSaveNodes,
  onSelectNode,
  screenToCanvas,
  canvasRef,
  isExecuting,
}) {
  const [draggingId, setDraggingId] = useState(null)
  const [pendingDragId, setPendingDragId] = useState(null)
  const dragOffsetRef = useRef({ x: 0, y: 0 })
  const dragStartRef = useRef(null)

  const handleNodeMouseDown = useCallback(
    (nodeId, event) => {
      if (isExecuting) return
      event.preventDefault()

      const node = nodes.find((n) => n.id === nodeId)
      if (!node) return

      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return

      const canvas = screenToCanvas(
        event.clientX - rect.left,
        event.clientY - rect.top
      )
      dragOffsetRef.current = {
        x: canvas.x - node.x,
        y: canvas.y - node.y,
      }
      dragStartRef.current = { clientX: event.clientX, clientY: event.clientY }
      setPendingDragId(nodeId)
      onSelectNode?.(nodeId)
    },
    [isExecuting, nodes, screenToCanvas, canvasRef, onSelectNode]
  )

  const handleDragMove = useCallback(
    (event) => {
      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return false

      // Check drag threshold before activating drag
      if (!draggingId && pendingDragId && dragStartRef.current) {
        const dx = event.clientX - dragStartRef.current.clientX
        const dy = event.clientY - dragStartRef.current.clientY
        if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) {
          setDraggingId(pendingDragId)
          setPendingDragId(null)
          dragStartRef.current = null
        }
        return true
      }

      if (draggingId) {
        const screenX = event.clientX - rect.left
        const screenY = event.clientY - rect.top
        const canvas = screenToCanvas(screenX, screenY)
        const rawX = canvas.x - dragOffsetRef.current.x
        const rawY = canvas.y - dragOffsetRef.current.y
        const newX = snapToGrid(rawX)
        const newY = snapToGrid(rawY)

        const updatedNodes = nodes.map((n) =>
          n.id === draggingId
            ? { ...n, x: Math.max(0, newX), y: Math.max(0, newY) }
            : n
        )
        onSaveNodes(updatedNodes)
        return true
      }

      return false
    },
    [draggingId, pendingDragId, nodes, onSaveNodes, screenToCanvas, canvasRef]
  )

  const handleDragEnd = useCallback(() => {
    if (draggingId) {
      setDraggingId(null)
    }
    setPendingDragId(null)
    dragStartRef.current = null
  }, [draggingId])

  return {
    draggingId,
    pendingDragId,
    handleNodeMouseDown,
    handleDragMove,
    handleDragEnd,
  }
}
