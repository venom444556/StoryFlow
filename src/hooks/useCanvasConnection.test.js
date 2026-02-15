import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCanvasConnection } from './useCanvasConnection'

// Mock generateId to return predictable values
vi.mock('../utils/ids', () => ({
  generateId: vi.fn(() => 'mock-connection-id'),
}))

describe('useCanvasConnection', () => {
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
      connections: [],
      onSaveConnections: vi.fn(),
      screenToCanvas: vi.fn((x, y) => ({ x, y })),
      canvasRef: mockCanvasRef,
      isExecuting: false,
    }
  })

  describe('initial state', () => {
    it('returns initial state with null values', () => {
      const { result } = renderHook(() => useCanvasConnection(mockProps))

      expect(result.current.connectingFrom).toBeNull()
      expect(result.current.tempConnectionEnd).toBeNull()
    })

    it('returns all expected methods', () => {
      const { result } = renderHook(() => useCanvasConnection(mockProps))

      expect(typeof result.current.handleStartConnect).toBe('function')
      expect(typeof result.current.handleEndConnect).toBe('function')
      expect(typeof result.current.handleConnectionMove).toBe('function')
      expect(typeof result.current.handleConnectionEnd).toBe('function')
      expect(typeof result.current.handleDeleteConnection).toBe('function')
    })
  })

  describe('handleStartConnect', () => {
    it('sets connectingFrom when not executing', () => {
      const { result } = renderHook(() => useCanvasConnection(mockProps))

      act(() => {
        result.current.handleStartConnect('node-1')
      })

      expect(result.current.connectingFrom).toBe('node-1')
    })

    it('does not set connectingFrom when isExecuting is true', () => {
      const props = { ...mockProps, isExecuting: true }
      const { result } = renderHook(() => useCanvasConnection(props))

      act(() => {
        result.current.handleStartConnect('node-1')
      })

      expect(result.current.connectingFrom).toBeNull()
    })
  })

  describe('handleEndConnect', () => {
    it('creates a new connection when connecting to different node', () => {
      const { result } = renderHook(() => useCanvasConnection(mockProps))

      act(() => {
        result.current.handleStartConnect('node-1')
      })

      act(() => {
        result.current.handleEndConnect('node-2')
      })

      expect(mockProps.onSaveConnections).toHaveBeenCalledWith([
        { id: 'mock-connection-id', from: 'node-1', to: 'node-2' },
      ])
      expect(result.current.connectingFrom).toBeNull()
      expect(result.current.tempConnectionEnd).toBeNull()
    })

    it('does not create connection when connecting to same node', () => {
      const { result } = renderHook(() => useCanvasConnection(mockProps))

      act(() => {
        result.current.handleStartConnect('node-1')
      })

      act(() => {
        result.current.handleEndConnect('node-1')
      })

      expect(mockProps.onSaveConnections).not.toHaveBeenCalled()
      expect(result.current.connectingFrom).toBeNull()
    })

    it('does not create duplicate connections', () => {
      const existingConnection = { id: 'conn-1', from: 'node-1', to: 'node-2' }
      const props = { ...mockProps, connections: [existingConnection] }
      const { result } = renderHook(() => useCanvasConnection(props))

      act(() => {
        result.current.handleStartConnect('node-1')
      })

      act(() => {
        result.current.handleEndConnect('node-2')
      })

      expect(mockProps.onSaveConnections).not.toHaveBeenCalled()
    })

    it('resets state when connectingFrom is null', () => {
      const { result } = renderHook(() => useCanvasConnection(mockProps))

      act(() => {
        result.current.handleEndConnect('node-2')
      })

      expect(mockProps.onSaveConnections).not.toHaveBeenCalled()
    })
  })

  describe('handleConnectionMove', () => {
    it('returns false when not connecting', () => {
      const { result } = renderHook(() => useCanvasConnection(mockProps))

      let returnValue
      act(() => {
        returnValue = result.current.handleConnectionMove({ clientX: 100, clientY: 100 })
      })

      expect(returnValue).toBe(false)
    })

    it('updates tempConnectionEnd when connecting', () => {
      const { result } = renderHook(() => useCanvasConnection(mockProps))

      act(() => {
        result.current.handleStartConnect('node-1')
      })

      let returnValue
      act(() => {
        returnValue = result.current.handleConnectionMove({ clientX: 150, clientY: 200 })
      })

      expect(returnValue).toBe(true)
      expect(result.current.tempConnectionEnd).toEqual({ x: 150, y: 200 })
    })

    it('returns false when canvas ref is not available', () => {
      const props = {
        ...mockProps,
        canvasRef: { current: null },
      }
      const { result } = renderHook(() => useCanvasConnection(props))

      act(() => {
        result.current.handleStartConnect('node-1')
      })

      let returnValue
      act(() => {
        returnValue = result.current.handleConnectionMove({ clientX: 100, clientY: 100 })
      })

      expect(returnValue).toBe(false)
    })

    it('applies screenToCanvas transformation', () => {
      const props = {
        ...mockProps,
        screenToCanvas: vi.fn((x, y) => ({ x: x * 2, y: y * 2 })),
      }
      const { result } = renderHook(() => useCanvasConnection(props))

      act(() => {
        result.current.handleStartConnect('node-1')
      })

      act(() => {
        result.current.handleConnectionMove({ clientX: 100, clientY: 50 })
      })

      expect(props.screenToCanvas).toHaveBeenCalledWith(100, 50)
      expect(result.current.tempConnectionEnd).toEqual({ x: 200, y: 100 })
    })
  })

  describe('handleConnectionEnd', () => {
    it('resets connecting state when connection was in progress', () => {
      const { result } = renderHook(() => useCanvasConnection(mockProps))

      act(() => {
        result.current.handleStartConnect('node-1')
      })

      act(() => {
        result.current.handleConnectionMove({ clientX: 100, clientY: 100 })
      })

      expect(result.current.connectingFrom).not.toBeNull()

      act(() => {
        result.current.handleConnectionEnd()
      })

      expect(result.current.connectingFrom).toBeNull()
      expect(result.current.tempConnectionEnd).toBeNull()
    })

    it('does nothing when not connecting', () => {
      const { result } = renderHook(() => useCanvasConnection(mockProps))

      act(() => {
        result.current.handleConnectionEnd()
      })

      expect(result.current.connectingFrom).toBeNull()
    })
  })

  describe('handleDeleteConnection', () => {
    it('deletes a connection', () => {
      const connections = [
        { id: 'conn-1', from: 'node-1', to: 'node-2' },
        { id: 'conn-2', from: 'node-2', to: 'node-3' },
      ]
      const props = { ...mockProps, connections }
      const { result } = renderHook(() => useCanvasConnection(props))

      act(() => {
        result.current.handleDeleteConnection({ id: 'conn-1' })
      })

      expect(mockProps.onSaveConnections).toHaveBeenCalledWith([
        { id: 'conn-2', from: 'node-2', to: 'node-3' },
      ])
    })

    it('does not delete when isExecuting', () => {
      const connections = [{ id: 'conn-1', from: 'node-1', to: 'node-2' }]
      const props = { ...mockProps, connections, isExecuting: true }
      const { result } = renderHook(() => useCanvasConnection(props))

      act(() => {
        result.current.handleDeleteConnection({ id: 'conn-1' })
      })

      expect(mockProps.onSaveConnections).not.toHaveBeenCalled()
    })

    it('handles deleting non-existent connection gracefully', () => {
      const connections = [{ id: 'conn-1', from: 'node-1', to: 'node-2' }]
      const props = { ...mockProps, connections }
      const { result } = renderHook(() => useCanvasConnection(props))

      act(() => {
        result.current.handleDeleteConnection({ id: 'non-existent' })
      })

      expect(mockProps.onSaveConnections).toHaveBeenCalledWith([
        { id: 'conn-1', from: 'node-1', to: 'node-2' },
      ])
    })
  })

  describe('prop updates', () => {
    it('responds to isExecuting changes', () => {
      const { result, rerender } = renderHook(
        ({ isExecuting }) => useCanvasConnection({ ...mockProps, isExecuting }),
        { initialProps: { isExecuting: false } }
      )

      act(() => {
        result.current.handleStartConnect('node-1')
      })
      expect(result.current.connectingFrom).toBe('node-1')

      // Reset and test with isExecuting true
      act(() => {
        result.current.handleConnectionEnd()
      })

      rerender({ isExecuting: true })

      act(() => {
        result.current.handleStartConnect('node-2')
      })
      expect(result.current.connectingFrom).toBeNull()
    })
  })
})
