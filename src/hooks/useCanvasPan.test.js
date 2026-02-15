import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCanvasPan } from './useCanvasPan'

describe('useCanvasPan', () => {
  let viewport
  let setViewport

  beforeEach(() => {
    viewport = { scale: 1, offsetX: 0, offsetY: 0 }
    setViewport = vi.fn((updater) => {
      if (typeof updater === 'function') {
        viewport = updater(viewport)
      } else {
        viewport = updater
      }
    })
  })

  describe('initial state', () => {
    it('returns initial state with isPanning false', () => {
      const { result } = renderHook(() => useCanvasPan(viewport, setViewport))

      expect(result.current.isPanning).toBe(false)
    })

    it('returns all expected methods', () => {
      const { result } = renderHook(() => useCanvasPan(viewport, setViewport))

      expect(typeof result.current.handlePanStart).toBe('function')
      expect(typeof result.current.handlePanMove).toBe('function')
      expect(typeof result.current.handlePanEnd).toBe('function')
    })
  })

  describe('handlePanStart', () => {
    it('starts panning on middle mouse button (button === 1)', () => {
      const { result } = renderHook(() => useCanvasPan(viewport, setViewport))

      const mockEvent = {
        button: 1,
        preventDefault: vi.fn(),
        clientX: 400,
        clientY: 300,
      }

      act(() => {
        result.current.handlePanStart(mockEvent)
      })

      expect(mockEvent.preventDefault).toHaveBeenCalled()
      expect(result.current.isPanning).toBe(true)
    })

    it('does not start panning on left mouse button (button === 0)', () => {
      const { result } = renderHook(() => useCanvasPan(viewport, setViewport))

      const mockEvent = {
        button: 0,
        preventDefault: vi.fn(),
        clientX: 400,
        clientY: 300,
      }

      act(() => {
        result.current.handlePanStart(mockEvent)
      })

      expect(mockEvent.preventDefault).not.toHaveBeenCalled()
      expect(result.current.isPanning).toBe(false)
    })

    it('does not start panning on right mouse button (button === 2)', () => {
      const { result } = renderHook(() => useCanvasPan(viewport, setViewport))

      const mockEvent = {
        button: 2,
        preventDefault: vi.fn(),
        clientX: 400,
        clientY: 300,
      }

      act(() => {
        result.current.handlePanStart(mockEvent)
      })

      expect(result.current.isPanning).toBe(false)
    })
  })

  describe('handlePanMove', () => {
    it('returns false when not panning', () => {
      const { result } = renderHook(() => useCanvasPan(viewport, setViewport))

      let returnValue
      act(() => {
        returnValue = result.current.handlePanMove({ clientX: 450, clientY: 350 })
      })

      expect(returnValue).toBe(false)
      expect(setViewport).not.toHaveBeenCalled()
    })

    it('updates viewport offset when panning', () => {
      const { result } = renderHook(() => useCanvasPan(viewport, setViewport))

      const startEvent = {
        button: 1,
        preventDefault: vi.fn(),
        clientX: 400,
        clientY: 300,
      }

      act(() => {
        result.current.handlePanStart(startEvent)
      })

      let returnValue
      act(() => {
        returnValue = result.current.handlePanMove({ clientX: 450, clientY: 350 })
      })

      expect(returnValue).toBe(true)
      expect(setViewport).toHaveBeenCalled()
      expect(viewport.offsetX).toBe(50)
      expect(viewport.offsetY).toBe(50)
    })

    it('tracks cumulative pan distance', () => {
      const { result } = renderHook(() => useCanvasPan(viewport, setViewport))

      const startEvent = {
        button: 1,
        preventDefault: vi.fn(),
        clientX: 400,
        clientY: 300,
      }

      act(() => {
        result.current.handlePanStart(startEvent)
      })

      // First move
      act(() => {
        result.current.handlePanMove({ clientX: 450, clientY: 350 })
      })

      expect(viewport.offsetX).toBe(50)
      expect(viewport.offsetY).toBe(50)

      // Second move (relative to start, not to previous position)
      act(() => {
        result.current.handlePanMove({ clientX: 500, clientY: 400 })
      })

      expect(viewport.offsetX).toBe(100)
      expect(viewport.offsetY).toBe(100)
    })

    it('handles negative pan movement', () => {
      const { result } = renderHook(() => useCanvasPan(viewport, setViewport))

      const startEvent = {
        button: 1,
        preventDefault: vi.fn(),
        clientX: 400,
        clientY: 300,
      }

      act(() => {
        result.current.handlePanStart(startEvent)
      })

      act(() => {
        result.current.handlePanMove({ clientX: 350, clientY: 250 })
      })

      expect(viewport.offsetX).toBe(-50)
      expect(viewport.offsetY).toBe(-50)
    })

    it('preserves scale during panning', () => {
      const initialViewport = { scale: 1.5, offsetX: 100, offsetY: 100 }
      const customSetViewport = vi.fn((updater) => {
        if (typeof updater === 'function') {
          const result = updater(initialViewport)
          expect(result.scale).toBe(1.5)
        }
      })

      const { result } = renderHook(() => useCanvasPan(initialViewport, customSetViewport))

      const startEvent = {
        button: 1,
        preventDefault: vi.fn(),
        clientX: 400,
        clientY: 300,
      }

      act(() => {
        result.current.handlePanStart(startEvent)
      })

      act(() => {
        result.current.handlePanMove({ clientX: 450, clientY: 350 })
      })

      expect(customSetViewport).toHaveBeenCalled()
    })
  })

  describe('handlePanEnd', () => {
    it('stops panning when isPanning is true', () => {
      const { result } = renderHook(() => useCanvasPan(viewport, setViewport))

      const startEvent = {
        button: 1,
        preventDefault: vi.fn(),
        clientX: 400,
        clientY: 300,
      }

      act(() => {
        result.current.handlePanStart(startEvent)
      })

      expect(result.current.isPanning).toBe(true)

      act(() => {
        result.current.handlePanEnd()
      })

      expect(result.current.isPanning).toBe(false)
    })

    it('does nothing when not panning', () => {
      const { result } = renderHook(() => useCanvasPan(viewport, setViewport))

      act(() => {
        result.current.handlePanEnd()
      })

      expect(result.current.isPanning).toBe(false)
    })

    it('allows restarting pan after end', () => {
      const { result } = renderHook(() => useCanvasPan(viewport, setViewport))

      const startEvent = {
        button: 1,
        preventDefault: vi.fn(),
        clientX: 400,
        clientY: 300,
      }

      // First pan
      act(() => {
        result.current.handlePanStart(startEvent)
      })
      act(() => {
        result.current.handlePanEnd()
      })

      // Second pan
      const startEvent2 = {
        button: 1,
        preventDefault: vi.fn(),
        clientX: 200,
        clientY: 150,
      }

      act(() => {
        result.current.handlePanStart(startEvent2)
      })

      expect(result.current.isPanning).toBe(true)
    })
  })

  describe('viewport prop updates', () => {
    it('uses current viewport offsets for new pan start', () => {
      let currentViewport = { scale: 1, offsetX: 100, offsetY: 50 }
      const customSetViewport = vi.fn((updater) => {
        if (typeof updater === 'function') {
          currentViewport = updater(currentViewport)
        }
      })

      const { result, rerender } = renderHook(
        ({ vp }) => useCanvasPan(vp, customSetViewport),
        { initialProps: { vp: currentViewport } }
      )

      const startEvent = {
        button: 1,
        preventDefault: vi.fn(),
        clientX: 400,
        clientY: 300,
      }

      act(() => {
        result.current.handlePanStart(startEvent)
      })

      act(() => {
        result.current.handlePanMove({ clientX: 450, clientY: 350 })
      })

      // Should add to existing offset
      expect(currentViewport.offsetX).toBe(150) // 100 + 50
      expect(currentViewport.offsetY).toBe(100) // 50 + 50
    })
  })

  describe('edge cases', () => {
    it('handles rapid start/end cycles', () => {
      const { result } = renderHook(() => useCanvasPan(viewport, setViewport))

      const startEvent = {
        button: 1,
        preventDefault: vi.fn(),
        clientX: 400,
        clientY: 300,
      }

      for (let i = 0; i < 5; i++) {
        act(() => {
          result.current.handlePanStart(startEvent)
        })
        expect(result.current.isPanning).toBe(true)

        act(() => {
          result.current.handlePanEnd()
        })
        expect(result.current.isPanning).toBe(false)
      }
    })

    it('ignores move events after pan end', () => {
      const { result } = renderHook(() => useCanvasPan(viewport, setViewport))

      const startEvent = {
        button: 1,
        preventDefault: vi.fn(),
        clientX: 400,
        clientY: 300,
      }

      act(() => {
        result.current.handlePanStart(startEvent)
      })

      act(() => {
        result.current.handlePanEnd()
      })

      setViewport.mockClear()

      let returnValue
      act(() => {
        returnValue = result.current.handlePanMove({ clientX: 500, clientY: 400 })
      })

      expect(returnValue).toBe(false)
      expect(setViewport).not.toHaveBeenCalled()
    })
  })
})
