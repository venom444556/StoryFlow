import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCanvasDrag } from './useCanvasDrag'

describe('useCanvasDrag', () => {
  let mockProps
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
      },
    }

    mockProps = {
      nodes: [
        { id: 'node-1', x: 100, y: 100 },
        { id: 'node-2', x: 200, y: 200 },
      ],
      onSaveNodes: vi.fn(),
      onSelectNode: vi.fn(),
      screenToCanvas: vi.fn((x, y) => ({ x, y })),
      canvasRef: mockCanvasRef,
      isExecuting: false,
    }
  })

  describe('initial state', () => {
    it('returns initial state with null draggingId', () => {
      const { result } = renderHook(() => useCanvasDrag(mockProps))

      expect(result.current.draggingId).toBeNull()
      expect(result.current.pendingDragId).toBeNull()
    })

    it('returns all expected methods', () => {
      const { result } = renderHook(() => useCanvasDrag(mockProps))

      expect(typeof result.current.handleNodeMouseDown).toBe('function')
      expect(typeof result.current.handleDragMove).toBe('function')
      expect(typeof result.current.handleDragEnd).toBe('function')
    })
  })

  describe('handleNodeMouseDown', () => {
    it('sets pending drag state and selects node', () => {
      const { result } = renderHook(() => useCanvasDrag(mockProps))

      const mockEvent = {
        preventDefault: vi.fn(),
        clientX: 150,
        clientY: 150,
      }

      act(() => {
        result.current.handleNodeMouseDown('node-1', mockEvent)
      })

      expect(mockEvent.preventDefault).toHaveBeenCalled()
      expect(result.current.pendingDragId).toBe('node-1')
      expect(mockProps.onSelectNode).toHaveBeenCalledWith('node-1')
    })

    it('does not start drag when isExecuting', () => {
      const props = { ...mockProps, isExecuting: true }
      const { result } = renderHook(() => useCanvasDrag(props))

      const mockEvent = {
        preventDefault: vi.fn(),
        clientX: 150,
        clientY: 150,
      }

      act(() => {
        result.current.handleNodeMouseDown('node-1', mockEvent)
      })

      expect(result.current.pendingDragId).toBeNull()
      expect(mockProps.onSelectNode).not.toHaveBeenCalled()
    })

    it('does nothing for non-existent node', () => {
      const { result } = renderHook(() => useCanvasDrag(mockProps))

      const mockEvent = {
        preventDefault: vi.fn(),
        clientX: 150,
        clientY: 150,
      }

      act(() => {
        result.current.handleNodeMouseDown('non-existent', mockEvent)
      })

      expect(result.current.pendingDragId).toBeNull()
    })

    it('does nothing when canvas ref is not available', () => {
      const props = { ...mockProps, canvasRef: { current: null } }
      const { result } = renderHook(() => useCanvasDrag(props))

      const mockEvent = {
        preventDefault: vi.fn(),
        clientX: 150,
        clientY: 150,
      }

      act(() => {
        result.current.handleNodeMouseDown('node-1', mockEvent)
      })

      expect(result.current.pendingDragId).toBeNull()
    })
  })

  describe('handleDragMove', () => {
    it('returns false when not dragging and no pending drag', () => {
      const { result } = renderHook(() => useCanvasDrag(mockProps))

      let returnValue
      act(() => {
        returnValue = result.current.handleDragMove({ clientX: 200, clientY: 200 })
      })

      expect(returnValue).toBe(false)
    })

    it('activates drag after threshold is exceeded', () => {
      const { result } = renderHook(() => useCanvasDrag(mockProps))

      const mouseDownEvent = {
        preventDefault: vi.fn(),
        clientX: 100,
        clientY: 100,
      }

      act(() => {
        result.current.handleNodeMouseDown('node-1', mouseDownEvent)
      })

      expect(result.current.pendingDragId).toBe('node-1')
      expect(result.current.draggingId).toBeNull()

      // Move beyond threshold (DRAG_THRESHOLD = 4)
      let returnValue
      act(() => {
        returnValue = result.current.handleDragMove({ clientX: 110, clientY: 100 })
      })

      expect(returnValue).toBe(true)
      expect(result.current.draggingId).toBe('node-1')
      expect(result.current.pendingDragId).toBeNull()
    })

    it('does not activate drag before threshold', () => {
      const { result } = renderHook(() => useCanvasDrag(mockProps))

      const mouseDownEvent = {
        preventDefault: vi.fn(),
        clientX: 100,
        clientY: 100,
      }

      act(() => {
        result.current.handleNodeMouseDown('node-1', mouseDownEvent)
      })

      // Move less than threshold
      act(() => {
        result.current.handleDragMove({ clientX: 102, clientY: 101 })
      })

      expect(result.current.draggingId).toBeNull()
      expect(result.current.pendingDragId).toBe('node-1')
    })

    it('updates node position when dragging', () => {
      const { result } = renderHook(() => useCanvasDrag(mockProps))

      const mouseDownEvent = {
        preventDefault: vi.fn(),
        clientX: 100,
        clientY: 100,
      }

      act(() => {
        result.current.handleNodeMouseDown('node-1', mouseDownEvent)
      })

      // Exceed threshold to start drag
      act(() => {
        result.current.handleDragMove({ clientX: 110, clientY: 100 })
      })

      // Continue dragging
      act(() => {
        result.current.handleDragMove({ clientX: 140, clientY: 120 })
      })

      expect(mockProps.onSaveNodes).toHaveBeenCalled()
      const lastCall = mockProps.onSaveNodes.mock.calls[mockProps.onSaveNodes.mock.calls.length - 1]
      const updatedNodes = lastCall[0]
      const draggedNode = updatedNodes.find((n) => n.id === 'node-1')

      // Position should be snapped to grid (GRID_SIZE = 20)
      expect(draggedNode.x % 20).toBe(0)
      expect(draggedNode.y % 20).toBe(0)
    })

    it('snaps position to grid', () => {
      const { result } = renderHook(() => useCanvasDrag(mockProps))

      const mouseDownEvent = {
        preventDefault: vi.fn(),
        clientX: 100,
        clientY: 100,
      }

      act(() => {
        result.current.handleNodeMouseDown('node-1', mouseDownEvent)
      })

      // Start drag
      act(() => {
        result.current.handleDragMove({ clientX: 115, clientY: 100 })
      })

      // Move to position that should snap
      act(() => {
        result.current.handleDragMove({ clientX: 133, clientY: 117 })
      })

      const lastCall = mockProps.onSaveNodes.mock.calls[mockProps.onSaveNodes.mock.calls.length - 1]
      const updatedNodes = lastCall[0]
      const draggedNode = updatedNodes.find((n) => n.id === 'node-1')

      // Should be snapped to nearest 20px grid
      expect(draggedNode.x % 20).toBe(0)
      expect(draggedNode.y % 20).toBe(0)
    })

    it('prevents negative positions', () => {
      const props = {
        ...mockProps,
        nodes: [{ id: 'node-1', x: 20, y: 20 }],
      }
      const { result } = renderHook(() => useCanvasDrag(props))

      const mouseDownEvent = {
        preventDefault: vi.fn(),
        clientX: 20,
        clientY: 20,
      }

      act(() => {
        result.current.handleNodeMouseDown('node-1', mouseDownEvent)
      })

      // Start drag
      act(() => {
        result.current.handleDragMove({ clientX: 30, clientY: 20 })
      })

      // Try to drag to negative position
      act(() => {
        result.current.handleDragMove({ clientX: -50, clientY: -50 })
      })

      const lastCall = mockProps.onSaveNodes.mock.calls[mockProps.onSaveNodes.mock.calls.length - 1]
      const updatedNodes = lastCall[0]
      const draggedNode = updatedNodes.find((n) => n.id === 'node-1')

      expect(draggedNode.x).toBeGreaterThanOrEqual(0)
      expect(draggedNode.y).toBeGreaterThanOrEqual(0)
    })

    it('returns false when canvas ref is not available', () => {
      const props = { ...mockProps, canvasRef: { current: null } }
      const { result } = renderHook(() => useCanvasDrag(props))

      let returnValue
      act(() => {
        returnValue = result.current.handleDragMove({ clientX: 200, clientY: 200 })
      })

      expect(returnValue).toBe(false)
    })
  })

  describe('handleDragEnd', () => {
    it('resets drag state when dragging', () => {
      const { result } = renderHook(() => useCanvasDrag(mockProps))

      const mouseDownEvent = {
        preventDefault: vi.fn(),
        clientX: 100,
        clientY: 100,
      }

      act(() => {
        result.current.handleNodeMouseDown('node-1', mouseDownEvent)
      })

      // Start drag
      act(() => {
        result.current.handleDragMove({ clientX: 115, clientY: 100 })
      })

      expect(result.current.draggingId).toBe('node-1')

      act(() => {
        result.current.handleDragEnd()
      })

      expect(result.current.draggingId).toBeNull()
      expect(result.current.pendingDragId).toBeNull()
    })

    it('resets pending drag state', () => {
      const { result } = renderHook(() => useCanvasDrag(mockProps))

      const mouseDownEvent = {
        preventDefault: vi.fn(),
        clientX: 100,
        clientY: 100,
      }

      act(() => {
        result.current.handleNodeMouseDown('node-1', mouseDownEvent)
      })

      expect(result.current.pendingDragId).toBe('node-1')

      act(() => {
        result.current.handleDragEnd()
      })

      expect(result.current.pendingDragId).toBeNull()
    })
  })

  describe('prop updates', () => {
    it('uses updated nodes list', () => {
      const { result, rerender } = renderHook(
        ({ nodes }) => useCanvasDrag({ ...mockProps, nodes }),
        {
          initialProps: {
            nodes: [{ id: 'node-1', x: 100, y: 100 }],
          },
        }
      )

      // Update nodes
      rerender({
        nodes: [
          { id: 'node-1', x: 100, y: 100 },
          { id: 'node-3', x: 300, y: 300 },
        ],
      })

      const mouseDownEvent = {
        preventDefault: vi.fn(),
        clientX: 300,
        clientY: 300,
      }

      act(() => {
        result.current.handleNodeMouseDown('node-3', mouseDownEvent)
      })

      expect(result.current.pendingDragId).toBe('node-3')
    })

    it('responds to isExecuting changes', () => {
      const { result, rerender } = renderHook(
        ({ isExecuting }) => useCanvasDrag({ ...mockProps, isExecuting }),
        { initialProps: { isExecuting: false } }
      )

      const mouseDownEvent = {
        preventDefault: vi.fn(),
        clientX: 100,
        clientY: 100,
      }

      // Works when not executing
      act(() => {
        result.current.handleNodeMouseDown('node-1', mouseDownEvent)
      })
      expect(result.current.pendingDragId).toBe('node-1')

      // Reset
      act(() => {
        result.current.handleDragEnd()
      })

      // Does not work when executing
      rerender({ isExecuting: true })

      act(() => {
        result.current.handleNodeMouseDown('node-1', mouseDownEvent)
      })
      expect(result.current.pendingDragId).toBeNull()
    })
  })
})
