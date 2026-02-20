import Dexie from 'dexie'

// ---------------------------------------------------------------------------
// StoryFlow IndexedDB database via Dexie.js
// ---------------------------------------------------------------------------
// Uses a key-value approach for Zustand persist compatibility.
// Each Zustand store gets its own table row keyed by the store name.
// This gives us:
//   - Transaction safety (crash mid-write = rollback, not corruption)
//   - ~50% of disk free (vs 5MB localStorage)
//   - Async writes (no UI jank on rapid edits)
// ---------------------------------------------------------------------------

const db = new Dexie('storyflow')

db.version(1).stores({
  // Key-value store for Zustand persist state
  // Each entry: { key: 'storyflow-projects', value: '...serialized JSON...' }
  keyval: 'key',
})

export default db
