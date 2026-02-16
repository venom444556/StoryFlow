import db from './storyflowDb'

// ---------------------------------------------------------------------------
// Custom Zustand persist storage engine backed by IndexedDB (Dexie)
// ---------------------------------------------------------------------------
// Implements the StateStorage interface expected by Zustand's persist
// middleware: { getItem, setItem, removeItem }
//
// Falls back to localStorage if IndexedDB is unavailable (e.g., private
// browsing in some older browsers).
// ---------------------------------------------------------------------------

/**
 * Creates a Zustand-compatible storage engine that persists to IndexedDB.
 *
 * Usage with Zustand persist:
 *   persist(storeCreator, {
 *     name: 'storyflow-projects',
 *     storage: createJSONStorage(() => indexedDbStorage),
 *   })
 */
const indexedDbStorage = {
  getItem: async (name) => {
    try {
      const row = await db.keyval.get(name)
      return row?.value ?? null
    } catch {
      // Fallback to localStorage if IndexedDB fails
      return localStorage.getItem(name)
    }
  },

  setItem: async (name, value) => {
    try {
      await db.keyval.put({ key: name, value })
    } catch {
      // Fallback to localStorage if IndexedDB fails
      localStorage.setItem(name, value)
    }
  },

  removeItem: async (name) => {
    try {
      await db.keyval.delete(name)
    } catch {
      localStorage.removeItem(name)
    }
  },
}

export default indexedDbStorage
