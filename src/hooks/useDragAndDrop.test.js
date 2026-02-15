import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDragAndDrop } from './useDragAndDrop'

describe('useDragAndDrop', () => {
  let mockCanvasRef
  let addEventListenerSpy
  let removeEventListenerSpy

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

    addEventListenerSpy = vi.spyOn(window, 'addEventListener')
    removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
  })

  afterEach(() => {
    addEventListenerSpy.mockRestore()
    removeEventListenerSpy.mockRestore()
  })

  describe('initial state', () => {
    it('returns initial state with null values', () => {
      const { result } = renderHook(() => useDragAndDrop(mockCanvasRef))

      expect(result.current.draggingId).toBeNull()
      expect(result.current.dragPosition).toBeNull()
    })

    it('returns all expected methods', () => {
      const { result } = renderHook(() => useDragAndDrop(mockCanvasRef))

      expect(typeof result.current.startDrag).toBe('function')
      expect(typeof result.current.onMouseMove).toBe('function')
      expect(typeof result.current.onMouseUp).toBe('function')
    })
  })

  describe('startDrag', () => {
    it('starts drag on primary mouse button (button === 0)', () => {
      const { result } = renderHook(() => useDragAndDrop(mockCanvasRef))

      const mockEvent = {
        button: 0,
        preventDefault: vi.fn(),
        clientX: 150,
        clientY: 200,
      }

      act(() => {
        result.current.startDrag('element-1', mockEvent, 100, 150)
      })

      expect(mockEvent.preventDefault).toHaveBeenCalled()
      expect(result.current.draggingId).toBe('element-1')
      expect(result.current.dragPosition).toEqual({ x: 100, y: 150 })
    })

    it('does not start drag on secondary mouse buttons', () => {
      const { result } = renderHook(() => useDragAndDrop(mockCanvasRef))

      const mockEvent = {
        button: 1,
        preventDefault: vi.fn(),
        clientX: 150,
        clientY: 200,
      }

      act(() => {
        result.current.startDrag('element-1', mockEvent, 100, 150)
      })

      expect(mockEvent.preventDefault).not.toHaveBeenCalled()
      expect(result.current.draggingId).toBeNull()
    })

    it('does not start drag on right mouse button', () => {
      const { result } = renderHook(() => useDragAndDrop(mockCanvasRef))

      const mockEvent = {
        button: 2,
        preventDefault: vi.fn(),
        clientX: 150,
        clientY: 200,
      }

      act(() => {
        result.current.startDrag('element-1', mockEvent, 100, 150)
      })

      expect(result.current.draggingId).toBeNull()
    })

    it('does nothing when canvas ref is null', () => {
      const nullRef = { current: null }
      const { result } = renderHook(() => useDragAndDrop(nullRef))

      const mockEvent = {
        button: 0,
        preventDefault: vi.fn(),
        clientX: 150,
        clientY: 200,
      }

      act(() => {
        result.current.startDrag('element-1', mockEvent, 100, 150)
      })

      expect(result.current.draggingId).toBeNull()
    })

    it('calculates correct offset from mouse position', () => {
      const { result } = renderHook(() => useDragAndDrop(mockCanvasRef))

      const mockEvent = {
        button: 0,
        preventDefault: vi.fn(),
        clientX: 150,
        clientY: 200,
      }

      act(() => {
        result.current.startDrag('element-1', mockEvent, 100, 150)
      })

      // Move the mouse and check that offset is maintained
      act(() => {
        result.current.onMouseMove({ clientX: 200, clientY: 250 })
      })

      // New position should be: clientX - rect.left - offset
      // offset was: (150 - 0) - 100 = 50 for x, (200 - 0) - 150 = 50 for y
      // new position: (200 - 0) - 50 = 150 for x, (250 - 0) - 50 = 200 for y
      expect(result.current.dragPosition).toEqual({ x: 150, y: 200 })
    })
  })

  describe('onMouseMove', () => {
    it('does nothing when not dragging', () => {
      const { result } = renderHook(() => useDragAndDrop(mockCanvasRef))

      act(() => {
        result.current.onMouseMove({ clientX: 200, clientY: 200 })
      })

      expect(result.current.dragPosition).toBeNull()
    })

    it('updates drag position when dragging', () => {
      const { result } = renderHook(() => useDragAndDrop(mockCanvasRef))

      const startEvent = {
        button: 0,
        preventDefault: vi.fn(),
        clientX: 100,
        clientY: 100,
      }

      act(() => {
        result.current.startDrag('element-1', startEvent, 100, 100)
      })

      act(() => {
        result.current.onMouseMove({ clientX: 200, clientY: 150 })
      })

      expect(result.current.dragPosition).toEqual({ x: 200, y: 150 })
    })

    it('handles multiple move events', () => {
      const { result } = renderHook(() => useDragAndDrop(mockCanvasRef))

      const startEvent = {
        button: 0,
        preventDefault: vi.fn(),
        clientX: 100,
        clientY: 100,
      }

      act(() => {
        result.current.startDrag('element-1', startEvent, 100, 100)
      })

      act(() => {
        result.current.onMouseMove({ clientX: 150, clientY: 120 })
      })

      expect(result.current.dragPosition).toEqual({ x: 150, y: 120 })

      act(() => {
        result.current.onMouseMove({ clientX: 200, clientY: 180 })
      })

      expect(result.current.dragPosition).toEqual({ x: 200, y: 180 })
    })

    it('does nothing when canvas ref becomes null', () => {
      const ref = { current: mockCanvasRef.current }
      const { result } = renderHook(() => useDragAndDrop(ref))

      const startEvent = {
        button: 0,
        preventDefault: vi.fn(),
        clientX: 100,
        clientY: 100,
      }

      act(() => {
        result.current.startDrag('element-1', startEvent, 100, 100)
      })

      // Remove the ref
      ref.current = null

      act(() => {
        result.current.onMouseMove({ clientX: 200, clientY: 200 })
      })

      // Position should remain unchanged
      expect(result.current.dragPosition).toEqual({ x: 100, y: 100 })
    })
  })

  describe('onMouseUp', () => {
    it('ends drag operation', () => {
      const { result } = renderHook(() => useDragAndDrop(mockCanvasRef))

      const startEvent = {
        button: 0,
        preventDefault: vi.fn(),
        clientX: 100,
        clientY: 100,
      }

      act(() => {
        result.current.startDrag('element-1', startEvent, 100, 100)
      })

      expect(result.current.draggingId).toBe('element-1')

      act(() => {
        result.current.onMouseUp()
      })

      expect(result.current.draggingId).toBeNull()
      expect(result.current.dragPosition).toBeNull()
    })

    it('can be called when not dragging without error', () => {
      const { result } = renderHook(() => useDragAndDrop(mockCanvasRef))

      act(() => {
        result.current.onMouseUp()
      })

      expect(result.current.draggingId).toBeNull()
    })
  })

  describe('window event listeners', () => {
    it('adds window listeners when dragging starts', () => {
      const { result } = renderHook(() => useDragAndDrop(mockCanvasRef))

      const startEvent = {
        button: 0,
        preventDefault: vi.fn(),
        clientX: 100,
        clientY: 100,
      }

      act(() => {
        result.current.startDrag('element-1', startEvent, 100, 100)
      })

      expect(addEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function))
      expect(addEventListenerSpy).toHaveBeenCalledWith('mouseup', expect.any(Function))
    })

    it('removes window listeners when dragging ends', () => {
      const { result } = renderHook(() => useDragAndDrop(mockCanvasRef))

      const startEvent = {
        button: 0,
        preventDefault: vi.fn(),
        clientX: 100,
        clientY: 100,
      }

      act(() => {
        result.current.startDrag('element-1', startEvent, 100, 100)
      })

      act(() => {
        result.current.onMouseUp()
      })

      expect(removeEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function))
      expect(removeEventListenerSpy).toHaveBeenCalledWith('mouseup', expect.any(Function))
    })

    it('removes listeners on unmount during drag', () => {
      const { result, unmount } = renderHook(() => useDragAndDrop(mockCanvasRef))

      const startEvent = {
        button: 0,
        preventDefault: vi.fn(),
        clientX: 100,
        clientY: 100,
      }

      act(() => {
        result.current.startDrag('element-1', startEvent, 100, 100)
      })

      unmount()

      expect(removeEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function))
      expect(removeEventListenerSpy).toHaveBeenCalledWith('mouseup', expect.any(Function))
    })

    it('does not add listeners when not dragging', () => {
      renderHook(() => useDragAndDrop(mockCanvasRef))

      expect(addEventListenerSpy).not.toHaveBeenCalled()
    })
  })

  describe('dragging different elements', () => {
    it('tracks correct element id', () => {
      const { result } = renderHook(() => useDragAndDrop(mockCanvasRef))

      const startEvent1 = {
        button: 0,
        preventDefault: vi.fn(),
        clientX: 100,
        clientY: 100,
      }

      act(() => {
        result.current.startDrag('element-A', startEvent1, 50, 50)
      })

      expect(result.current.draggingId).toBe('element-A')

      act(() => {
        result.current.onMouseUp()
      })

      const startEvent2 = {
        button: 0,
        preventDefault: vi.fn(),
        clientX: 200,
        clientY: 200,
      }

      act(() => {
        result.current.startDrag('element-B', startEvent2, 150, 150)
      })

      expect(result.current.draggingId).toBe('element-B')
    })

    it('maintains separate offsets for different starting positions', () => {
      const { result } = renderHook(() => useDragAndDrop(mockCanvasRef))

      // Drag element starting at (50, 50)
      const startEvent1 = {
        button: 0,
        preventDefault: vi.fn(),
        clientX: 100,
        clientY: 100,
      }

      act(() => {
        result.current.startDrag('element-1', startEvent1, 50, 50)
      })

      act(() => {
        result.current.onMouseMove({ clientX: 150, clientY: 150 })
      })

      // Offset was 50 for both, so position should be 100, 100
      expect(result.current.dragPosition).toEqual({ x: 100, y: 100 })

      act(() => {
        result.current.onMouseUp()
      })

      // Drag element starting at (200, 200) with mouse at (250, 280)
      const startEvent2 = {
        button: 0,
        preventDefault: vi.fn(),
        clientX: 250,
        clientY: 280,
      }

      act(() => {
        result.current.startDrag('element-2', startEvent2, 200, 200)
      })

      act(() => {
        result.current.onMouseMove({ clientX: 300, clientY: 330 })
      })

      // Offset was 50 for x, 80 for y
      // New position: 300 - 50 = 250, 330 - 80 = 250
      expect(result.current.dragPosition).toEqual({ x: 250, y: 250 })
    })
  })

  describe('edge cases', () => {
    it('handles canvas with non-zero position', () => {
      const offsetCanvasRef = {
        current: {
          getBoundingClientRect: () => ({
            left: 100,
            top: 50,
            width: 800,
            height: 600,
          }),
        },
      }

      const { result } = renderHook(() => useDragAndDrop(offsetCanvasRef))

      const startEvent = {
        button: 0,
        preventDefault: vi.fn(),
        clientX: 200, // 100 relative to canvas
        clientY: 150, // 100 relative to canvas
      }

      act(() => {
        result.current.startDrag('element-1', startEvent, 50, 50)
      })

      // Offset: (200 - 100) - 50 = 50, (150 - 50) - 50 = 50
      act(() => {
        result.current.onMouseMove({ clientX: 250, clientY: 200 })
      })

      // Position: (250 - 100) - 50 = 100, (200 - 50) - 50 = 100
      expect(result.current.dragPosition).toEqual({ x: 100, y: 100 })
    })

    it('handles rapid drag start/end cycles', () => {
      const { result } = renderHook(() => useDragAndDrop(mockCanvasRef))

      for (let i = 0; i < 5; i++) {
        const startEvent = {
          button: 0,
          preventDefault: vi.fn(),
          clientX: 100 + i * 10,
          clientY: 100 + i * 10,
        }

        act(() => {
          result.current.startDrag(`element-${i}`, startEvent, 50, 50)
        })

        expect(result.current.draggingId).toBe(`element-${i}`)

        act(() => {
          result.current.onMouseUp()
        })

        expect(result.current.draggingId).toBeNull()
      }
    })

    it('handles negative positions', () => {
      const { result } = renderHook(() => useDragAndDrop(mockCanvasRef))

      const startEvent = {
        button: 0,
        preventDefault: vi.fn(),
        clientX: 50,
        clientY: 50,
      }

      act(() => {
        result.current.startDrag('element-1', startEvent, 100, 100)
      })

      // Move mouse to result in position calculation
      // offset = (50 - 0) - 100 = -50 for both x and y
      // newPos = (0 - 0) - (-50) = 50 for both x and y
      act(() => {
        result.current.onMouseMove({ clientX: 0, clientY: 0 })
      })

      // Position is calculated as clientX - rect.left - offset
      // which yields 50, not negative
      expect(result.current.dragPosition.x).toBe(50)
      expect(result.current.dragPosition.y).toBe(50)
    })
  })
})
