import { useState, useCallback, useEffect, useRef } from 'react'

const MIN_ZOOM = 0.25
const MAX_ZOOM = 2.0
const ZOOM_STEP = 0.1

function clampZoom(z) {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round(z * 100) / 100))
}

/**
 * Hook for managing canvas viewport state (zoom + pan).
 * Extracts viewport logic from WorkflowCanvas for reusability.
 */
export function useCanvasViewport(canvasRef, nodes, canvasId) {
  const [viewport, setViewport] = useState({ scale: 1, offsetX: 0, offsetY: 0 })
  const viewportInitialized = useRef(false)
  const prevCanvasId = useRef(canvasId)

  // Convert screen (mouse) coordinates to canvas-space coordinates
  const screenToCanvas = useCallback(
    (screenX, screenY) => ({
      x: (screenX - viewport.offsetX) / viewport.scale,
      y: (screenY - viewport.offsetY) / viewport.scale,
    }),
    [viewport]
  )

  // Center viewport on nodes. Returns true if successful.
  const centerOnNodes = useCallback(() => {
    const container = canvasRef.current
    if (!container || nodes.length === 0) return false

    const NODE_WIDTH = 180
    const NODE_HEIGHT_ESTIMATE = 80

    const rect = container.getBoundingClientRect()
    // Guard: container must have real dimensions (not mid-animation or hidden)
    if (rect.width < 10 || rect.height < 10) return false

    const xs = nodes.map((n) => n.x)
    const ys = nodes.map((n) => n.y)
    const minX = Math.min(...xs)
    const maxX = Math.max(...xs) + NODE_WIDTH
    const minY = Math.min(...ys)
    const maxY = Math.max(...ys) + NODE_HEIGHT_ESTIMATE

    const contentW = maxX - minX
    const contentH = maxY - minY

    // Auto-fit: scale to fill viewport (up to 1.5x for small content)
    const pad = 60
    const scaleX = (rect.width - pad * 2) / contentW
    const scaleY = (rect.height - pad * 2) / contentH
    const FIT_MAX = 1.5
    const fitScale = clampZoom(Math.min(FIT_MAX, scaleX, scaleY))

    const contentCenterX = (minX + maxX) / 2
    const contentCenterY = (minY + maxY) / 2

    setViewport({
      scale: fitScale,
      offsetX: rect.width / 2 - contentCenterX * fitScale,
      offsetY: rect.height / 2 - contentCenterY * fitScale,
    })
    return true
  }, [canvasRef, nodes])

  // Auto-center on mount / canvasId change
  useEffect(() => {
    if (prevCanvasId.current !== canvasId) {
      viewportInitialized.current = false
      prevCanvasId.current = canvasId
    }

    if (!viewportInitialized.current && nodes.length > 0) {
      // Delay to allow parent animations (e.g. overlay scale-in) to finish
      // so container has its final dimensions for accurate centering
      const timer = setTimeout(() => {
        if (centerOnNodes()) {
          viewportInitialized.current = true
        }
      }, 280)
      return () => clearTimeout(timer)
    }
  }, [nodes, canvasId, centerOnNodes])

  // Zoom handlers
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
  }, [canvasRef])

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
  }, [canvasRef])

  const handleResetView = useCallback(() => {
    centerOnNodes()
  }, [centerOnNodes])

  // Ctrl/Cmd + scroll wheel zoom
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
  }, [canvasRef])

  return {
    viewport,
    setViewport,
    screenToCanvas,
    handleZoomIn,
    handleZoomOut,
    handleResetView,
    MIN_ZOOM,
    MAX_ZOOM,
  }
}
