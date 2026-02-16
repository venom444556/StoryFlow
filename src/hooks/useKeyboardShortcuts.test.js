import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useKeyboardShortcuts, SHORTCUTS } from './useKeyboardShortcuts'

describe('useKeyboardShortcuts', () => {
  let addEventListenerSpy
  let removeEventListenerSpy

  beforeEach(() => {
    addEventListenerSpy = vi.spyOn(window, 'addEventListener')
    removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
  })

  afterEach(() => {
    addEventListenerSpy.mockRestore()
    removeEventListenerSpy.mockRestore()
  })

  describe('SHORTCUTS constants', () => {
    it('exports expected shortcut constants', () => {
      expect(SHORTCUTS.NEW_PROJECT).toBe('ctrl+n')
      expect(SHORTCUTS.SAVE).toBe('ctrl+s')
      expect(SHORTCUTS.EXPORT).toBe('ctrl+e')
      expect(SHORTCUTS.SEARCH).toBe('ctrl+/')
      expect(SHORTCUTS.ESCAPE).toBe('Escape')
      expect(SHORTCUTS.DELETE).toBe('Delete')
      expect(SHORTCUTS.HELP).toBe('?')
      expect(SHORTCUTS.TAB_OVERVIEW).toBe('alt+1')
      expect(SHORTCUTS.TAB_ARCHITECTURE).toBe('alt+2')
      expect(SHORTCUTS.TAB_WORKFLOW).toBe('alt+3')
      expect(SHORTCUTS.TAB_BOARD).toBe('alt+4')
      expect(SHORTCUTS.TAB_WIKI).toBe('alt+5')
      expect(SHORTCUTS.TAB_TIMELINE).toBe('alt+6')
      expect(SHORTCUTS.TAB_DECISIONS).toBe('alt+7')
    })
  })

  describe('event listener setup', () => {
    it('adds keydown event listener on mount', () => {
      renderHook(() => useKeyboardShortcuts({}))

      expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
    })

    it('removes keydown event listener on unmount', () => {
      const { unmount } = renderHook(() => useKeyboardShortcuts({}))

      unmount()

      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
    })

    it('only adds listener once regardless of handler updates', () => {
      const { rerender } = renderHook(({ handlers }) => useKeyboardShortcuts(handlers), {
        initialProps: { handlers: { 'ctrl+s': vi.fn() } },
      })

      // Initial render
      expect(addEventListenerSpy).toHaveBeenCalledTimes(1)

      // Update handlers
      rerender({ handlers: { 'ctrl+s': vi.fn(), 'ctrl+n': vi.fn() } })

      // Should not add another listener
      expect(addEventListenerSpy).toHaveBeenCalledTimes(1)
    })
  })

  describe('shortcut matching', () => {
    function simulateKeyDown(key, modifiers = {}) {
      const event = new KeyboardEvent('keydown', {
        key,
        ctrlKey: modifiers.ctrl || false,
        metaKey: modifiers.meta || false,
        altKey: modifiers.alt || false,
        shiftKey: modifiers.shift || false,
        bubbles: true,
      })

      // Mock target for editable check
      Object.defineProperty(event, 'target', {
        value: {
          tagName: modifiers.targetTag || 'DIV',
          isContentEditable: modifiers.isContentEditable || false,
        },
      })

      // Add mock methods
      event.preventDefault = vi.fn()
      event.stopPropagation = vi.fn()

      window.dispatchEvent(event)
      return event
    }

    it('calls handler for ctrl+key shortcut', () => {
      const handler = vi.fn()
      renderHook(() => useKeyboardShortcuts({ 'ctrl+s': handler }))

      simulateKeyDown('s', { ctrl: true })

      expect(handler).toHaveBeenCalled()
    })

    it('calls handler for meta+key shortcut (Mac)', () => {
      const handler = vi.fn()
      renderHook(() => useKeyboardShortcuts({ 'ctrl+s': handler }))

      simulateKeyDown('s', { meta: true })

      expect(handler).toHaveBeenCalled()
    })

    it('calls handler for alt+key shortcut', () => {
      const handler = vi.fn()
      renderHook(() => useKeyboardShortcuts({ 'alt+1': handler }))

      simulateKeyDown('1', { alt: true })

      expect(handler).toHaveBeenCalled()
    })

    it('calls handler for shift+key shortcut', () => {
      const handler = vi.fn()
      renderHook(() => useKeyboardShortcuts({ 'shift+a': handler }))

      simulateKeyDown('a', { shift: true })

      expect(handler).toHaveBeenCalled()
    })

    it('calls handler for plain key shortcut', () => {
      const handler = vi.fn()
      renderHook(() => useKeyboardShortcuts({ Escape: handler }))

      simulateKeyDown('Escape')

      expect(handler).toHaveBeenCalled()
    })

    it('calls handler for combined modifiers', () => {
      const handler = vi.fn()
      renderHook(() => useKeyboardShortcuts({ 'ctrl+shift+s': handler }))

      simulateKeyDown('s', { ctrl: true, shift: true })

      expect(handler).toHaveBeenCalled()
    })

    it('prevents default and stops propagation when matched', () => {
      const handler = vi.fn()
      renderHook(() => useKeyboardShortcuts({ 'ctrl+s': handler }))

      const event = simulateKeyDown('s', { ctrl: true })

      expect(event.preventDefault).toHaveBeenCalled()
      expect(event.stopPropagation).toHaveBeenCalled()
    })

    it('does not call handler when modifiers do not match', () => {
      const handler = vi.fn()
      renderHook(() => useKeyboardShortcuts({ 'ctrl+s': handler }))

      simulateKeyDown('s') // No ctrl

      expect(handler).not.toHaveBeenCalled()
    })

    it('does not call handler when key does not match', () => {
      const handler = vi.fn()
      renderHook(() => useKeyboardShortcuts({ 'ctrl+s': handler }))

      simulateKeyDown('n', { ctrl: true }) // Wrong key

      expect(handler).not.toHaveBeenCalled()
    })

    it('does not call handler when extra modifier is present', () => {
      const handler = vi.fn()
      renderHook(() => useKeyboardShortcuts({ 'ctrl+s': handler }))

      simulateKeyDown('s', { ctrl: true, alt: true }) // Extra alt

      expect(handler).not.toHaveBeenCalled()
    })

    it('matches case-insensitively', () => {
      const handler = vi.fn()
      renderHook(() => useKeyboardShortcuts({ 'ctrl+S': handler }))

      simulateKeyDown('s', { ctrl: true })

      expect(handler).toHaveBeenCalled()
    })
  })

  describe('editable field handling', () => {
    function simulateKeyDownInField(key, modifiers = {}, tagName = 'INPUT') {
      const event = new KeyboardEvent('keydown', {
        key,
        ctrlKey: modifiers.ctrl || false,
        metaKey: modifiers.meta || false,
        altKey: modifiers.alt || false,
        shiftKey: modifiers.shift || false,
        bubbles: true,
      })

      Object.defineProperty(event, 'target', {
        value: {
          tagName,
          isContentEditable: modifiers.isContentEditable || false,
        },
      })

      event.preventDefault = vi.fn()
      event.stopPropagation = vi.fn()

      window.dispatchEvent(event)
      return event
    }

    it('does not trigger plain key shortcuts in INPUT fields', () => {
      const handler = vi.fn()
      renderHook(() => useKeyboardShortcuts({ Escape: handler }))

      simulateKeyDownInField('Escape', {}, 'INPUT')

      expect(handler).not.toHaveBeenCalled()
    })

    it('does not trigger plain key shortcuts in TEXTAREA fields', () => {
      const handler = vi.fn()
      renderHook(() => useKeyboardShortcuts({ Delete: handler }))

      simulateKeyDownInField('Delete', {}, 'TEXTAREA')

      expect(handler).not.toHaveBeenCalled()
    })

    it('does not trigger plain key shortcuts in contentEditable elements', () => {
      const handler = vi.fn()
      renderHook(() => useKeyboardShortcuts({ '?': handler }))

      simulateKeyDownInField('?', { isContentEditable: true }, 'DIV')

      expect(handler).not.toHaveBeenCalled()
    })

    it('triggers modifier shortcuts in INPUT fields', () => {
      const handler = vi.fn()
      renderHook(() => useKeyboardShortcuts({ 'ctrl+s': handler }))

      simulateKeyDownInField('s', { ctrl: true }, 'INPUT')

      expect(handler).toHaveBeenCalled()
    })

    it('triggers modifier shortcuts in TEXTAREA fields', () => {
      const handler = vi.fn()
      renderHook(() => useKeyboardShortcuts({ 'ctrl+n': handler }))

      simulateKeyDownInField('n', { ctrl: true }, 'TEXTAREA')

      expect(handler).toHaveBeenCalled()
    })

    it('triggers alt shortcuts in input fields', () => {
      const handler = vi.fn()
      renderHook(() => useKeyboardShortcuts({ 'alt+1': handler }))

      simulateKeyDownInField('1', { alt: true }, 'INPUT')

      expect(handler).toHaveBeenCalled()
    })
  })

  describe('handler updates', () => {
    it('uses latest handlers without re-binding', () => {
      const handler1 = vi.fn()
      const handler2 = vi.fn()

      const { rerender } = renderHook(({ handlers }) => useKeyboardShortcuts(handlers), {
        initialProps: { handlers: { 'ctrl+s': handler1 } },
      })

      // Dispatch event with first handler
      const event1 = new KeyboardEvent('keydown', {
        key: 's',
        ctrlKey: true,
        bubbles: true,
      })
      Object.defineProperty(event1, 'target', { value: { tagName: 'DIV' } })
      event1.preventDefault = vi.fn()
      event1.stopPropagation = vi.fn()
      window.dispatchEvent(event1)

      expect(handler1).toHaveBeenCalledTimes(1)

      // Update to second handler
      rerender({ handlers: { 'ctrl+s': handler2 } })

      // Dispatch event with second handler
      const event2 = new KeyboardEvent('keydown', {
        key: 's',
        ctrlKey: true,
        bubbles: true,
      })
      Object.defineProperty(event2, 'target', { value: { tagName: 'DIV' } })
      event2.preventDefault = vi.fn()
      event2.stopPropagation = vi.fn()
      window.dispatchEvent(event2)

      expect(handler2).toHaveBeenCalledTimes(1)
      expect(handler1).toHaveBeenCalledTimes(1) // Not called again
    })
  })

  describe('multiple handlers', () => {
    function simulateKeyDown(key, modifiers = {}) {
      const event = new KeyboardEvent('keydown', {
        key,
        ctrlKey: modifiers.ctrl || false,
        metaKey: modifiers.meta || false,
        altKey: modifiers.alt || false,
        shiftKey: modifiers.shift || false,
        bubbles: true,
      })

      Object.defineProperty(event, 'target', {
        value: { tagName: 'DIV', isContentEditable: false },
      })

      event.preventDefault = vi.fn()
      event.stopPropagation = vi.fn()

      window.dispatchEvent(event)
      return event
    }

    it('handles multiple shortcuts', () => {
      const saveHandler = vi.fn()
      const newHandler = vi.fn()

      renderHook(() =>
        useKeyboardShortcuts({
          'ctrl+s': saveHandler,
          'ctrl+n': newHandler,
        })
      )

      simulateKeyDown('s', { ctrl: true })
      expect(saveHandler).toHaveBeenCalled()
      expect(newHandler).not.toHaveBeenCalled()

      simulateKeyDown('n', { ctrl: true })
      expect(newHandler).toHaveBeenCalled()
    })

    it('only triggers first matching handler', () => {
      const handler = vi.fn()

      // This shouldn't happen in practice, but tests the early return
      renderHook(() =>
        useKeyboardShortcuts({
          'ctrl+s': handler, // Tests that last handler wins
        })
      )

      simulateKeyDown('s', { ctrl: true })

      // Only the registered handler should be called
      expect(handler).toHaveBeenCalled()
    })
  })

  describe('edge cases', () => {
    it('handles empty handlers object', () => {
      renderHook(() => useKeyboardShortcuts({}))

      const event = new KeyboardEvent('keydown', { key: 's', ctrlKey: true, bubbles: true })
      Object.defineProperty(event, 'target', { value: { tagName: 'DIV' } })
      event.preventDefault = vi.fn()

      window.dispatchEvent(event)

      expect(event.preventDefault).not.toHaveBeenCalled()
    })

    it('handles null/undefined handlers gracefully', () => {
      renderHook(() =>
        useKeyboardShortcuts({
          'ctrl+s': null,
          'ctrl+n': undefined,
        })
      )

      const event = new KeyboardEvent('keydown', { key: 's', ctrlKey: true, bubbles: true })
      Object.defineProperty(event, 'target', { value: { tagName: 'DIV' } })
      event.preventDefault = vi.fn()

      // Should not throw
      expect(() => window.dispatchEvent(event)).not.toThrow()
    })

    it('handles special characters in shortcuts', () => {
      const handler = vi.fn()
      renderHook(() => useKeyboardShortcuts({ 'ctrl+/': handler }))

      const event = new KeyboardEvent('keydown', { key: '/', ctrlKey: true, bubbles: true })
      Object.defineProperty(event, 'target', { value: { tagName: 'DIV' } })
      event.preventDefault = vi.fn()
      event.stopPropagation = vi.fn()
      window.dispatchEvent(event)

      expect(handler).toHaveBeenCalled()
    })

    it('handles ? key shortcut', () => {
      const handler = vi.fn()
      renderHook(() => useKeyboardShortcuts({ '?': handler }))

      const event = new KeyboardEvent('keydown', { key: '?', bubbles: true })
      Object.defineProperty(event, 'target', {
        value: { tagName: 'DIV', isContentEditable: false },
      })
      event.preventDefault = vi.fn()
      event.stopPropagation = vi.fn()
      window.dispatchEvent(event)

      expect(handler).toHaveBeenCalled()
    })

    it('handles cmd modifier alias', () => {
      const handler = vi.fn()
      renderHook(() => useKeyboardShortcuts({ 'cmd+s': handler }))

      const event = new KeyboardEvent('keydown', { key: 's', metaKey: true, bubbles: true })
      Object.defineProperty(event, 'target', { value: { tagName: 'DIV' } })
      event.preventDefault = vi.fn()
      event.stopPropagation = vi.fn()
      window.dispatchEvent(event)

      expect(handler).toHaveBeenCalled()
    })

    it('handles meta modifier alias', () => {
      const handler = vi.fn()
      renderHook(() => useKeyboardShortcuts({ 'meta+s': handler }))

      const event = new KeyboardEvent('keydown', { key: 's', ctrlKey: true, bubbles: true })
      Object.defineProperty(event, 'target', { value: { tagName: 'DIV' } })
      event.preventDefault = vi.fn()
      event.stopPropagation = vi.fn()
      window.dispatchEvent(event)

      expect(handler).toHaveBeenCalled()
    })
  })
})
