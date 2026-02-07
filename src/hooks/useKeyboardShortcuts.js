import { useEffect, useRef } from 'react'

// ---------------------------------------------------------------------------
// Keyboard shortcut constants
// ---------------------------------------------------------------------------

export const SHORTCUTS = {
  NEW_PROJECT: 'ctrl+n',
  SAVE: 'ctrl+s',
  EXPORT: 'ctrl+e',
  SEARCH: 'ctrl+/',
  ESCAPE: 'Escape',
  DELETE: 'Delete',
  HELP: '?',

  // Tab switching (Alt+1-7)
  TAB_OVERVIEW: 'alt+1',
  TAB_ARCHITECTURE: 'alt+2',
  TAB_WORKFLOW: 'alt+3',
  TAB_BOARD: 'alt+4',
  TAB_WIKI: 'alt+5',
  TAB_TIMELINE: 'alt+6',
  TAB_DECISIONS: 'alt+7',
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
 */
export function useKeyboardShortcuts(handlers) {
  // Keep a stable ref so we always call the latest handler without re-binding
  const handlersRef = useRef(handlers)
  handlersRef.current = handlers

  useEffect(() => {
    function onKeyDown(e) {
      const current = handlersRef.current
      if (!current) return

      // Skip plain-key shortcuts when typing in an input/textarea/contenteditable
      const tag = e.target.tagName
      const isEditable = tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable
      const hasModifier = e.ctrlKey || e.metaKey || e.altKey

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
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])
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
