import { useCallback, useRef, useMemo } from 'react'
import { useKeyboardShortcuts, SHORTCUTS } from './useKeyboardShortcuts'

const MAX_HISTORY_SIZE = 50

/**
 * Generic undo/redo hook for state management
 *
 * @param {Object} options
 * @param {Function} options.onUndo - Called with the state to restore
 * @param {Function} options.onRedo - Called with the state to restore
 * @param {Function} options.getState - Returns current state for snapshot
 * @param {boolean} options.enabled - Whether keyboard shortcuts are active
 */
export function useUndoRedo(options = {}) {
  const { onUndo, onRedo, getState, enabled = true } = options

  const historyRef = useRef([])
  const futureRef = useRef([])
  const isUndoRedoRef = useRef(false)

  // Save current state to history
  const saveState = useCallback(
    (label) => {
      // Don't save state during undo/redo operations
      if (isUndoRedoRef.current) return

      const currentState = getState?.()
      if (!currentState) return

      // Add to history with label for display
      historyRef.current = [
        ...historyRef.current.slice(-MAX_HISTORY_SIZE + 1),
        { state: currentState, label, timestamp: Date.now() },
      ]

      // Clear future on new action
      futureRef.current = []
    },
    [getState]
  )

  // Undo last action
  const undo = useCallback(() => {
    if (historyRef.current.length === 0) return false

    const currentState = getState?.()
    if (!currentState) return false

    const lastEntry = historyRef.current[historyRef.current.length - 1]
    historyRef.current = historyRef.current.slice(0, -1)

    // Save current state to future
    futureRef.current = [
      ...futureRef.current,
      { state: currentState, label: 'Undone', timestamp: Date.now() },
    ]

    // Restore previous state
    isUndoRedoRef.current = true
    onUndo?.(lastEntry.state, lastEntry.label)
    isUndoRedoRef.current = false

    return true
  }, [getState, onUndo])

  // Redo last undone action
  const redo = useCallback(() => {
    if (futureRef.current.length === 0) return false

    const currentState = getState?.()
    if (!currentState) return false

    const nextEntry = futureRef.current[futureRef.current.length - 1]
    futureRef.current = futureRef.current.slice(0, -1)

    // Save current state to history
    historyRef.current = [
      ...historyRef.current,
      { state: currentState, label: 'Redone', timestamp: Date.now() },
    ]

    // Restore future state
    isUndoRedoRef.current = true
    onRedo?.(nextEntry.state, nextEntry.label)
    isUndoRedoRef.current = false

    return true
  }, [getState, onRedo])

  // Clear all history
  const clearHistory = useCallback(() => {
    historyRef.current = []
    futureRef.current = []
  }, [])

  // Register keyboard shortcuts
  useKeyboardShortcuts(
    enabled
      ? {
          [SHORTCUTS.UNDO]: undo,
          [SHORTCUTS.REDO]: redo,
          [SHORTCUTS.REDO_ALT]: redo,
        }
      : {}
  )

  // Computed state
  const state = useMemo(
    () => ({
      canUndo: historyRef.current.length > 0,
      canRedo: futureRef.current.length > 0,
      historyCount: historyRef.current.length,
      futureCount: futureRef.current.length,
      lastAction: historyRef.current[historyRef.current.length - 1]?.label,
    }),
    // Note: This won't update automatically - components should call getUndoRedoState()
    []
  )

  // Dynamic state getter
  const getUndoRedoState = useCallback(() => ({
    canUndo: historyRef.current.length > 0,
    canRedo: futureRef.current.length > 0,
    historyCount: historyRef.current.length,
    futureCount: futureRef.current.length,
    lastAction: historyRef.current[historyRef.current.length - 1]?.label,
    nextAction: futureRef.current[futureRef.current.length - 1]?.label,
  }), [])

  return {
    saveState,
    undo,
    redo,
    clearHistory,
    ...state,
    getUndoRedoState,
  }
}

/**
 * Simpler version that tracks a single value
 */
export function useValueHistory(initialValue, maxHistory = MAX_HISTORY_SIZE) {
  const historyRef = useRef([initialValue])
  const indexRef = useRef(0)

  const push = useCallback(
    (value) => {
      // Truncate future if we're not at the end
      const current = indexRef.current
      historyRef.current = historyRef.current.slice(0, current + 1)

      // Add new value
      historyRef.current.push(value)

      // Trim old history
      if (historyRef.current.length > maxHistory) {
        historyRef.current = historyRef.current.slice(-maxHistory)
      }

      indexRef.current = historyRef.current.length - 1
    },
    [maxHistory]
  )

  const undo = useCallback(() => {
    if (indexRef.current > 0) {
      indexRef.current--
      return historyRef.current[indexRef.current]
    }
    return null
  }, [])

  const redo = useCallback(() => {
    if (indexRef.current < historyRef.current.length - 1) {
      indexRef.current++
      return historyRef.current[indexRef.current]
    }
    return null
  }, [])

  const current = useCallback(() => {
    return historyRef.current[indexRef.current]
  }, [])

  const canUndo = useCallback(() => indexRef.current > 0, [])
  const canRedo = useCallback(
    () => indexRef.current < historyRef.current.length - 1,
    []
  )

  return { push, undo, redo, current, canUndo, canRedo }
}
