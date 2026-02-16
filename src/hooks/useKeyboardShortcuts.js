import { useEffect, useRef, useCallback } from 'react'

// ---------------------------------------------------------------------------
// Keyboard shortcut constants
// ---------------------------------------------------------------------------

export const SHORTCUTS = {
  // Global
  NEW_PROJECT: 'ctrl+n',
  SAVE: 'ctrl+s',
  EXPORT: 'ctrl+e',
  SEARCH: 'ctrl+/',
  COMMAND_PALETTE: 'ctrl+k',
  ESCAPE: 'Escape',
  DELETE: 'Delete',
  HELP: '?',

  // Undo/Redo
  UNDO: 'ctrl+z',
  REDO: 'ctrl+shift+z',
  REDO_ALT: 'ctrl+y',

  // Navigation (J/K vim-style)
  NEXT_ITEM: 'j',
  PREV_ITEM: 'k',
  SELECT_ITEM: 'Enter',
  GO_BACK: 'Backspace',

  // Quick search
  QUICK_SEARCH: '/',

  // Tab switching (Alt+1-7)
  TAB_OVERVIEW: 'alt+1',
  TAB_ARCHITECTURE: 'alt+2',
  TAB_WORKFLOW: 'alt+3',
  TAB_BOARD: 'alt+4',
  TAB_WIKI: 'alt+5',
  TAB_TIMELINE: 'alt+6',
  TAB_DECISIONS: 'alt+7',

  // Context-aware create
  NEW_ITEM: 'ctrl+shift+n',

  // Board specific
  MOVE_LEFT: 'h',
  MOVE_RIGHT: 'l',
  TOGGLE_FILTERS: 'f',
}

// Vim-style chord shortcuts (g then ...)
export const CHORD_SHORTCUTS = {
  'g b': 'go_to_board',
  'g w': 'go_to_wiki',
  'g o': 'go_to_overview',
  'g a': 'go_to_architecture',
  'g f': 'go_to_workflow',
  'g t': 'go_to_timeline',
  'g d': 'go_to_decisions',
  'g h': 'go_to_home',
}

// ---------------------------------------------------------------------------
// Chord state manager
// ---------------------------------------------------------------------------

let chordFirstKey = null
let chordTimeout = null

function resetChord() {
  chordFirstKey = null
  if (chordTimeout) {
    clearTimeout(chordTimeout)
    chordTimeout = null
  }
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Register global keyboard shortcuts.
 *
 * @param {Record<string, () => void>} handlers
 *   Map of shortcut string to callback, e.g. { 'ctrl+n': () => {} }
 *
 * Supported modifier syntax:
 *   ctrl+<key>   Ctrl (or Cmd on Mac)
 *   shift+<key>  Shift
 *   alt+<key>    Alt / Option
 *   <key>        Plain key (e.g. "Escape", "Delete")
 *
 * Modifiers can be combined: "ctrl+shift+s"
 *
 * Chord support:
 *   Pass chord handlers with the chord action name as key, e.g. { 'go_to_board': () => {} }
 */
export function useKeyboardShortcuts(handlers, chordHandlers = {}) {
  // Keep a stable ref so we always call the latest handler without re-binding
  const handlersRef = useRef(handlers)
  const chordHandlersRef = useRef(chordHandlers)
  handlersRef.current = handlers
  chordHandlersRef.current = chordHandlers

  useEffect(() => {
    function onKeyDown(e) {
      const current = handlersRef.current
      const chords = chordHandlersRef.current
      if (!current) return

      // Skip plain-key shortcuts when typing in an input/textarea/contenteditable
      const tag = e.target.tagName
      const isEditable = tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable
      const hasModifier = e.ctrlKey || e.metaKey || e.altKey

      const key = e.key.toLowerCase()

      // Handle chord sequences
      if (!isEditable && !hasModifier) {
        // Check if we're in the middle of a chord
        if (chordFirstKey) {
          const chordKey = `${chordFirstKey} ${key}`
          const action = CHORD_SHORTCUTS[chordKey]

          if (action && chords[action]) {
            e.preventDefault()
            e.stopPropagation()
            chords[action]()
            resetChord()
            return
          }

          // Invalid chord - reset and continue normal processing
          resetChord()
        }

        // Check if this could start a chord (e.g., 'g')
        const possibleChords = Object.keys(CHORD_SHORTCUTS).filter((c) => c.startsWith(key + ' '))

        if (possibleChords.length > 0 && Object.keys(chords).length > 0) {
          e.preventDefault()
          chordFirstKey = key
          // Reset chord after 1 second of no input
          chordTimeout = setTimeout(resetChord, 1000)
          return
        }
      }

      // Regular shortcut handling
      for (const [shortcut, callback] of Object.entries(current)) {
        if (typeof callback !== 'function') continue
        // Skip plain-key (no modifier) shortcuts while typing in form fields
        const shortcutHasModifier = /ctrl|cmd|meta|alt/i.test(shortcut)
        if (isEditable && !hasModifier && !shortcutHasModifier) continue
        if (matchesShortcut(e, shortcut)) {
          e.preventDefault()
          e.stopPropagation()
          callback()
          return
        }
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      resetChord()
    }
  }, [])
}

// ---------------------------------------------------------------------------
// Focus management hook
// ---------------------------------------------------------------------------

/**
 * Hook for managing focus in a list of items with j/k navigation
 */
export function useListNavigation(items, options = {}) {
  const { onSelect, onFocusChange, enabled = true, loop = true } = options

  const focusIndexRef = useRef(0)

  const moveFocus = useCallback(
    (direction) => {
      if (!enabled || items.length === 0) return

      let newIndex = focusIndexRef.current + direction

      if (loop) {
        if (newIndex < 0) newIndex = items.length - 1
        if (newIndex >= items.length) newIndex = 0
      } else {
        newIndex = Math.max(0, Math.min(items.length - 1, newIndex))
      }

      focusIndexRef.current = newIndex
      onFocusChange?.(newIndex, items[newIndex])
    },
    [items, enabled, loop, onFocusChange]
  )

  const selectCurrent = useCallback(() => {
    if (!enabled || items.length === 0) return
    onSelect?.(items[focusIndexRef.current], focusIndexRef.current)
  }, [items, enabled, onSelect])

  const setFocusIndex = useCallback(
    (index) => {
      focusIndexRef.current = Math.max(0, Math.min(items.length - 1, index))
      onFocusChange?.(focusIndexRef.current, items[focusIndexRef.current])
    },
    [items, onFocusChange]
  )

  useKeyboardShortcuts(
    enabled
      ? {
          [SHORTCUTS.NEXT_ITEM]: () => moveFocus(1),
          [SHORTCUTS.PREV_ITEM]: () => moveFocus(-1),
          [SHORTCUTS.SELECT_ITEM]: selectCurrent,
        }
      : {}
  )

  return {
    focusIndex: focusIndexRef.current,
    setFocusIndex,
    moveFocus,
    selectCurrent,
  }
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Parse a shortcut string like "ctrl+shift+s" and test it against a
 * keyboard event.
 */
function matchesShortcut(event, shortcut) {
  const parts = shortcut
    .toLowerCase()
    .split('+')
    .map((p) => p.trim())

  const key = parts[parts.length - 1]
  const modifiers = new Set(parts.slice(0, -1))

  const needsCtrl = modifiers.has('ctrl') || modifiers.has('cmd') || modifiers.has('meta')
  const needsShift = modifiers.has('shift')
  const needsAlt = modifiers.has('alt')

  // Match the primary key
  const eventKey = event.key.toLowerCase()
  if (eventKey !== key.toLowerCase()) return false

  // Match ctrl/meta
  const ctrlOrMeta = event.ctrlKey || event.metaKey
  if (needsCtrl && !ctrlOrMeta) return false
  if (!needsCtrl && ctrlOrMeta) return false

  // Match shift
  if (needsShift && !event.shiftKey) return false
  if (!needsShift && event.shiftKey && key.length === 1) return false

  // Match alt
  if (needsAlt && !event.altKey) return false
  if (!needsAlt && event.altKey) return false

  return true
}

// ---------------------------------------------------------------------------
// Shortcut display helpers
// ---------------------------------------------------------------------------

const IS_MAC = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform)

/**
 * Convert shortcut string to display format
 */
export function formatShortcut(shortcut) {
  return shortcut
    .split('+')
    .map((part) => {
      const p = part.toLowerCase()
      if (p === 'ctrl' || p === 'cmd' || p === 'meta') return IS_MAC ? '⌘' : 'Ctrl'
      if (p === 'shift') return IS_MAC ? '⇧' : 'Shift'
      if (p === 'alt') return IS_MAC ? '⌥' : 'Alt'
      if (p === 'escape') return 'Esc'
      if (p === 'enter') return IS_MAC ? '↵' : 'Enter'
      if (p === 'backspace') return IS_MAC ? '⌫' : 'Backspace'
      if (p === 'delete') return IS_MAC ? '⌦' : 'Del'
      return part.toUpperCase()
    })
    .join(IS_MAC ? '' : '+')
}

/**
 * Get all shortcuts in a categorized format for display
 */
export function getShortcutCategories() {
  return [
    {
      name: 'Global',
      shortcuts: [
        { keys: SHORTCUTS.COMMAND_PALETTE, description: 'Open command palette' },
        { keys: SHORTCUTS.SEARCH, description: 'Search' },
        { keys: SHORTCUTS.NEW_PROJECT, description: 'New project' },
        { keys: SHORTCUTS.HELP, description: 'Show shortcuts' },
        { keys: SHORTCUTS.ESCAPE, description: 'Close/Cancel' },
      ],
    },
    {
      name: 'Navigation',
      shortcuts: [
        { keys: SHORTCUTS.NEXT_ITEM, description: 'Next item' },
        { keys: SHORTCUTS.PREV_ITEM, description: 'Previous item' },
        { keys: SHORTCUTS.SELECT_ITEM, description: 'Select item' },
        { keys: 'g b', description: 'Go to Board', isChord: true },
        { keys: 'g w', description: 'Go to Wiki', isChord: true },
        { keys: 'g o', description: 'Go to Overview', isChord: true },
      ],
    },
    {
      name: 'Tabs',
      shortcuts: [
        { keys: SHORTCUTS.TAB_OVERVIEW, description: 'Overview tab' },
        { keys: SHORTCUTS.TAB_BOARD, description: 'Board tab' },
        { keys: SHORTCUTS.TAB_WIKI, description: 'Wiki tab' },
        { keys: SHORTCUTS.TAB_WORKFLOW, description: 'Workflow tab' },
      ],
    },
    {
      name: 'Editing',
      shortcuts: [
        { keys: SHORTCUTS.UNDO, description: 'Undo' },
        { keys: SHORTCUTS.REDO, description: 'Redo' },
        { keys: SHORTCUTS.NEW_ITEM, description: 'New item (context-aware)' },
        { keys: SHORTCUTS.SAVE, description: 'Save' },
      ],
    },
  ]
}
