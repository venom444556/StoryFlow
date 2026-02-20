/**
 * Cross-tab sync utility using BroadcastChannel API.
 * Broadcasts store updates to other tabs and triggers re-hydration on receive.
 * Falls back to no-op if BroadcastChannel is not available.
 */

const CHANNEL_NAME = 'storyflow-sync'
const TAB_ID =
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2)

let channel = null
let _isRehydrating = false

try {
  if (typeof BroadcastChannel !== 'undefined') {
    channel = new BroadcastChannel(CHANNEL_NAME)
  }
} catch {
  // BroadcastChannel not available — no cross-tab sync
}

/**
 * Broadcast a store update to other tabs.
 * Suppressed during rehydration to prevent cross-tab ping-pong loops:
 * Tab A updates → broadcasts → Tab B rehydrates (new ref) → would broadcast → loop.
 * @param {string} storeName - Name of the store that changed ('projects' | 'activity' | 'ui')
 */
export function broadcastUpdate(storeName) {
  if (!channel || _isRehydrating) return
  try {
    channel.postMessage({
      type: 'store-updated',
      store: storeName,
      tabId: TAB_ID,
      timestamp: Date.now(),
    })
  } catch {
    // Silently ignore send errors
  }
}

/**
 * Mark the start/end of a rehydration cycle.
 * While rehydrating, broadcastUpdate() is suppressed to prevent loops.
 * @param {boolean} value
 */
export function setRehydrating(value) {
  _isRehydrating = value
}

/**
 * Listen for store updates from other tabs.
 * @param {function} onUpdate - Callback invoked with { store, timestamp } when another tab writes
 * @returns {function} Cleanup function to remove listener
 */
export function onCrossTabUpdate(onUpdate) {
  if (!channel) return () => {}

  const handler = (event) => {
    const { type, store, tabId, timestamp } = event.data || {}
    // Ignore our own broadcasts
    if (type === 'store-updated' && tabId !== TAB_ID) {
      onUpdate({ store, timestamp })
    }
  }

  channel.addEventListener('message', handler)
  return () => channel.removeEventListener('message', handler)
}
