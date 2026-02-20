import db from './storyflowDb'

// ---------------------------------------------------------------------------
// One-time localStorage → IndexedDB migration
// ---------------------------------------------------------------------------
// Checks if legacy localStorage keys exist. If so, copies them to IndexedDB
// and removes the localStorage entries. Returns a detailed status object.
// ---------------------------------------------------------------------------

const STORAGE_KEYS = ['storyflow-projects', 'storyflow-activity', 'storyflow-ui']

/**
 * Migrate legacy localStorage data to IndexedDB.
 * @returns {Promise<{ migrated: boolean, error?: string, keysTransferred: string[] }>}
 */
export async function migrateFromLocalStorage() {
  // Check if any legacy keys exist in localStorage
  const keysToMigrate = STORAGE_KEYS.filter((key) => localStorage.getItem(key) !== null)

  if (keysToMigrate.length === 0) {
    return { migrated: false, keysTransferred: [] }
  }

  // Check if data already exists in IndexedDB (avoid double migration)
  try {
    const existing = await db.keyval.get('storyflow-projects')
    if (existing) {
      // IndexedDB already has data — clean up localStorage silently
      keysToMigrate.forEach((key) => localStorage.removeItem(key))
      return { migrated: false, keysTransferred: [] }
    }
  } catch {
    // IndexedDB not available — keep using localStorage
    return {
      migrated: false,
      error: 'IndexedDB is not available. Using localStorage fallback.',
      keysTransferred: [],
    }
  }

  // Migrate each key
  try {
    const transferred = []
    await db.transaction('rw', db.keyval, async () => {
      for (const key of keysToMigrate) {
        const value = localStorage.getItem(key)
        if (value) {
          await db.keyval.put({ key, value })
          transferred.push(key)
        }
      }
    })

    // Migration succeeded — remove localStorage entries
    keysToMigrate.forEach((key) => localStorage.removeItem(key))

    return { migrated: true, keysTransferred: transferred }
  } catch (err) {
    // Migration failed — keep localStorage as-is, Zustand will pick it up
    // via the fallback in indexedDbStorage.getItem
    return {
      migrated: false,
      error: `Data migration failed: ${err?.message || 'Unknown error'}. Your data is safe in localStorage.`,
      keysTransferred: [],
    }
  }
}
