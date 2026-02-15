import { useState, useCallback, useRef } from 'react'

/**
 * Hook for managing canvas panning.
 * Extracts pan logic from WorkflowCanvas for reusability.
 */
export function useCanvasPan(viewport, setViewport) {
  const [isPanning, setIsPanning] = useState(false)
  const panStartRef = useRef(null)

  const handlePanStart = useCallback(
    (event) => {
      // Middle mouse button (button === 1)
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

  const handlePanMove = useCallback(
    (event) => {
      if (!isPanning || !panStartRef.current) return false

      const dx = event.clientX - panStartRef.current.clientX
      const dy = event.clientY - panStartRef.current.clientY
      setViewport((prev) => ({
        ...prev,
        offsetX: panStartRef.current.offsetX + dx,
        offsetY: panStartRef.current.offsetY + dy,
      }))
      return true
    },
    [isPanning, setViewport]
  )

  const handlePanEnd = useCallback(() => {
    if (isPanning) {
      setIsPanning(false)
      panStartRef.current = null
    }
  }, [isPanning])

  return {
    isPanning,
    handlePanStart,
    handlePanMove,
    handlePanEnd,
  }
}
