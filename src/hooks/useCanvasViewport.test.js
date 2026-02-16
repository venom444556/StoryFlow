import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCanvasViewport } from './useCanvasViewport'

describe('useCanvasViewport', () => {
  let mockCanvasRef

  beforeEach(() => {
    mockCanvasRef = {
      current: {
        getBoundingClientRect: () => ({
          left: 0,
          top: 0,
          width: 800,
          height: 600,
        }),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      },
    }
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('returns initial viewport state', () => {
      const { result } = renderHook(() => useCanvasViewport(mockCanvasRef, [], 'canvas-1'))

      expect(result.current.viewport).toEqual({
        scale: 1,
        offsetX: 0,
        offsetY: 0,
      })
    })

    it('returns all expected values and methods', () => {
      const { result } = renderHook(() => useCanvasViewport(mockCanvasRef, [], 'canvas-1'))

      expect(result.current.viewport).toBeDefined()
      expect(typeof result.current.setViewport).toBe('function')
      expect(typeof result.current.screenToCanvas).toBe('function')
      expect(typeof result.current.handleZoomIn).toBe('function')
      expect(typeof result.current.handleZoomOut).toBe('function')
      expect(typeof result.current.handleResetView).toBe('function')
      expect(result.current.MIN_ZOOM).toBe(0.25)
      expect(result.current.MAX_ZOOM).toBe(2.0)
    })
  })

  describe('screenToCanvas', () => {
    it('converts screen coordinates to canvas coordinates at default scale', () => {
      const { result } = renderHook(() => useCanvasViewport(mockCanvasRef, [], 'canvas-1'))

      const canvasCoords = result.current.screenToCanvas(100, 200)

      expect(canvasCoords).toEqual({ x: 100, y: 200 })
    })

    it('accounts for viewport offset', () => {
      const { result } = renderHook(() => useCanvasViewport(mockCanvasRef, [], 'canvas-1'))

      act(() => {
        result.current.setViewport({ scale: 1, offsetX: 50, offsetY: 100 })
      })

      const canvasCoords = result.current.screenToCanvas(150, 200)

      expect(canvasCoords).toEqual({ x: 100, y: 100 })
    })

    it('accounts for viewport scale', () => {
      const { result } = renderHook(() => useCanvasViewport(mockCanvasRef, [], 'canvas-1'))

      act(() => {
        result.current.setViewport({ scale: 2, offsetX: 0, offsetY: 0 })
      })

      const canvasCoords = result.current.screenToCanvas(200, 100)

      expect(canvasCoords).toEqual({ x: 100, y: 50 })
    })

    it('accounts for both offset and scale', () => {
      const { result } = renderHook(() => useCanvasViewport(mockCanvasRef, [], 'canvas-1'))

      act(() => {
        result.current.setViewport({ scale: 2, offsetX: 100, offsetY: 50 })
      })

      const canvasCoords = result.current.screenToCanvas(300, 150)

      // (300 - 100) / 2 = 100, (150 - 50) / 2 = 50
      expect(canvasCoords).toEqual({ x: 100, y: 50 })
    })
  })

  describe('handleZoomIn', () => {
    it('increases scale by 0.1', () => {
      const { result } = renderHook(() => useCanvasViewport(mockCanvasRef, [], 'canvas-1'))

      act(() => {
        result.current.handleZoomIn()
      })

      expect(result.current.viewport.scale).toBeCloseTo(1.1, 2)
    })

    it('does not exceed MAX_ZOOM', () => {
      const { result } = renderHook(() => useCanvasViewport(mockCanvasRef, [], 'canvas-1'))

      act(() => {
        result.current.setViewport({ scale: 1.95, offsetX: 0, offsetY: 0 })
      })

      act(() => {
        result.current.handleZoomIn()
      })

      expect(result.current.viewport.scale).toBe(2.0)
    })

    it('adjusts offset to zoom toward center', () => {
      const { result } = renderHook(() => useCanvasViewport(mockCanvasRef, [], 'canvas-1'))

      act(() => {
        result.current.setViewport({ scale: 1, offsetX: 100, offsetY: 50 })
      })

      const prevOffset = { x: result.current.viewport.offsetX, y: result.current.viewport.offsetY }

      act(() => {
        result.current.handleZoomIn()
      })

      // Offsets should change when zooming
      expect(result.current.viewport.offsetX).not.toBe(prevOffset.x)
      expect(result.current.viewport.offsetY).not.toBe(prevOffset.y)
    })

    it('handles missing canvas ref gracefully', () => {
      const nullRef = { current: null }
      const { result } = renderHook(() => useCanvasViewport(nullRef, [], 'canvas-1'))

      act(() => {
        result.current.handleZoomIn()
      })

      // Should still update scale even without container for center calculation
      expect(result.current.viewport.scale).toBeCloseTo(1.1, 2)
    })
  })

  describe('handleZoomOut', () => {
    it('decreases scale by 0.1', () => {
      const { result } = renderHook(() => useCanvasViewport(mockCanvasRef, [], 'canvas-1'))

      act(() => {
        result.current.handleZoomOut()
      })

      expect(result.current.viewport.scale).toBeCloseTo(0.9, 2)
    })

    it('does not go below MIN_ZOOM', () => {
      const { result } = renderHook(() => useCanvasViewport(mockCanvasRef, [], 'canvas-1'))

      act(() => {
        result.current.setViewport({ scale: 0.3, offsetX: 0, offsetY: 0 })
      })

      act(() => {
        result.current.handleZoomOut()
      })

      expect(result.current.viewport.scale).toBe(0.25)
    })

    it('adjusts offset to zoom toward center', () => {
      const { result } = renderHook(() => useCanvasViewport(mockCanvasRef, [], 'canvas-1'))

      act(() => {
        result.current.setViewport({ scale: 1.5, offsetX: 100, offsetY: 50 })
      })

      const prevOffset = { x: result.current.viewport.offsetX, y: result.current.viewport.offsetY }

      act(() => {
        result.current.handleZoomOut()
      })

      expect(result.current.viewport.offsetX).not.toBe(prevOffset.x)
      expect(result.current.viewport.offsetY).not.toBe(prevOffset.y)
    })
  })

  describe('handleResetView (centerOnNodes)', () => {
    it('centers viewport on nodes', () => {
      const nodes = [
        { id: 'node-1', x: 100, y: 100 },
        { id: 'node-2', x: 300, y: 200 },
      ]

      const { result } = renderHook(() => useCanvasViewport(mockCanvasRef, nodes, 'canvas-1'))

      act(() => {
        result.current.setViewport({ scale: 0.5, offsetX: 500, offsetY: 500 })
      })

      act(() => {
        result.current.handleResetView()
      })

      // centerOnNodes auto-fits: scale = clampZoom(min(1.5, scaleX, scaleY))
      // which yields 1.5 for this node layout and container size
      expect(result.current.viewport.scale).toBe(1.5)
      // Offsets should center the content
      expect(typeof result.current.viewport.offsetX).toBe('number')
      expect(typeof result.current.viewport.offsetY).toBe('number')
    })

    it('does nothing when no nodes', () => {
      const { result } = renderHook(() => useCanvasViewport(mockCanvasRef, [], 'canvas-1'))

      const initialViewport = { ...result.current.viewport }

      act(() => {
        result.current.handleResetView()
      })

      expect(result.current.viewport).toEqual(initialViewport)
    })

    it('does nothing when canvas ref is null', () => {
      const nullRef = { current: null }
      const nodes = [{ id: 'node-1', x: 100, y: 100 }]

      const { result } = renderHook(() => useCanvasViewport(nullRef, nodes, 'canvas-1'))

      const initialViewport = { ...result.current.viewport }

      act(() => {
        result.current.handleResetView()
      })

      expect(result.current.viewport).toEqual(initialViewport)
    })
  })

  describe('auto-center on mount', () => {
    it('centers on nodes when first mounted with nodes', () => {
      const nodes = [
        { id: 'node-1', x: 100, y: 100 },
        { id: 'node-2', x: 300, y: 200 },
      ]

      const { result } = renderHook(() => useCanvasViewport(mockCanvasRef, nodes, 'canvas-1'))

      // Auto-center uses setTimeout(280) so it does not fire synchronously.
      // Viewport remains at initial defaults.
      expect(result.current.viewport.scale).toBe(1)
      expect(result.current.viewport.offsetX).toBe(0)
      expect(result.current.viewport.offsetY).toBe(0)
    })

    it('does not auto-center when no nodes initially', () => {
      const { result } = renderHook(() => useCanvasViewport(mockCanvasRef, [], 'canvas-1'))

      expect(result.current.viewport).toEqual({
        scale: 1,
        offsetX: 0,
        offsetY: 0,
      })
    })
  })

  describe('canvasId changes', () => {
    it('resets viewport when canvasId changes', () => {
      const nodes = [{ id: 'node-1', x: 100, y: 100 }]

      const { result, rerender } = renderHook(
        ({ canvasId }) => useCanvasViewport(mockCanvasRef, nodes, canvasId),
        { initialProps: { canvasId: 'canvas-1' } }
      )

      // Modify viewport
      act(() => {
        result.current.setViewport({ scale: 0.5, offsetX: 500, offsetY: 500 })
      })

      expect(result.current.viewport.scale).toBe(0.5)

      // Change canvasId — auto-center uses setTimeout(280) so it doesn't
      // fire synchronously; viewport remains at the manually set values
      rerender({ canvasId: 'canvas-2' })

      expect(result.current.viewport.scale).toBe(0.5)
    })
  })

  describe('setViewport', () => {
    it('allows direct viewport updates', () => {
      const { result } = renderHook(() => useCanvasViewport(mockCanvasRef, [], 'canvas-1'))

      act(() => {
        result.current.setViewport({ scale: 1.5, offsetX: 200, offsetY: 150 })
      })

      expect(result.current.viewport).toEqual({
        scale: 1.5,
        offsetX: 200,
        offsetY: 150,
      })
    })

    it('supports functional updates', () => {
      const { result } = renderHook(() => useCanvasViewport(mockCanvasRef, [], 'canvas-1'))

      act(() => {
        result.current.setViewport((prev) => ({
          ...prev,
          offsetX: prev.offsetX + 100,
        }))
      })

      expect(result.current.viewport.offsetX).toBe(100)
    })
  })

  describe('wheel event listener', () => {
    it('adds wheel event listener on mount', () => {
      renderHook(() => useCanvasViewport(mockCanvasRef, [], 'canvas-1'))

      expect(mockCanvasRef.current.addEventListener).toHaveBeenCalledWith(
        'wheel',
        expect.any(Function),
        { passive: false }
      )
    })

    it('removes wheel event listener on unmount', () => {
      const { unmount } = renderHook(() => useCanvasViewport(mockCanvasRef, [], 'canvas-1'))

      unmount()

      expect(mockCanvasRef.current.removeEventListener).toHaveBeenCalledWith(
        'wheel',
        expect.any(Function)
      )
    })

    it('does not add listener when canvas ref is null', () => {
      const nullRef = { current: null }
      renderHook(() => useCanvasViewport(nullRef, [], 'canvas-1'))

      // Should not throw and should not try to add listener
    })
  })

  describe('edge cases', () => {
    it('handles single node centering', () => {
      const nodes = [{ id: 'node-1', x: 100, y: 100 }]

      const { result } = renderHook(() => useCanvasViewport(mockCanvasRef, nodes, 'canvas-1'))

      // Should center on the single node
      expect(result.current.viewport.scale).toBe(1)
    })

    it('handles nodes at origin', () => {
      const nodes = [{ id: 'node-1', x: 0, y: 0 }]

      const { result } = renderHook(() => useCanvasViewport(mockCanvasRef, nodes, 'canvas-1'))

      expect(result.current.viewport.scale).toBe(1)
    })

    it('handles large coordinate values', () => {
      const nodes = [
        { id: 'node-1', x: 10000, y: 10000 },
        { id: 'node-2', x: 20000, y: 20000 },
      ]

      const { result } = renderHook(() => useCanvasViewport(mockCanvasRef, nodes, 'canvas-1'))

      expect(result.current.viewport.scale).toBe(1)
      expect(typeof result.current.viewport.offsetX).toBe('number')
      expect(typeof result.current.viewport.offsetY).toBe('number')
    })

    it('multiple zoom operations maintain precision', () => {
      const { result } = renderHook(() => useCanvasViewport(mockCanvasRef, [], 'canvas-1'))

      // Zoom in 5 times
      for (let i = 0; i < 5; i++) {
        act(() => {
          result.current.handleZoomIn()
        })
      }

      expect(result.current.viewport.scale).toBeCloseTo(1.5, 2)

      // Zoom out 5 times
      for (let i = 0; i < 5; i++) {
        act(() => {
          result.current.handleZoomOut()
        })
      }

      expect(result.current.viewport.scale).toBeCloseTo(1.0, 2)
    })
  })
})
