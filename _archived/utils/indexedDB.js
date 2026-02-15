/**
 * IndexedDB Storage Utilities
 *
 * Provides IndexedDB fallback for large project data that exceeds
 * localStorage limits. Offers a simple key-value interface.
 */

const DB_NAME = 'storyflow-db'
const DB_VERSION = 1
const STORE_NAME = 'projects'

/**
 * Open IndexedDB connection
 */
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = (event) => {
      const db = event.target.result

      // Create object store for projects
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }
  })
}

/**
 * Get item from IndexedDB
 */
export async function getItem(key) {
  try {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.get(key)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result?.data)
    })
  } catch (error) {
    console.error('IndexedDB getItem error:', error)
    return null
  }
}

/**
 * Set item in IndexedDB
 */
export async function setItem(key, value) {
  try {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.put({ id: key, data: value, updatedAt: Date.now() })

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  } catch (error) {
    console.error('IndexedDB setItem error:', error)
    throw error
  }
}

/**
 * Remove item from IndexedDB
 */
export async function removeItem(key) {
  try {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.delete(key)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  } catch (error) {
    console.error('IndexedDB removeItem error:', error)
    throw error
  }
}

/**
 * Get all keys from IndexedDB
 */
export async function getAllKeys() {
  try {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.getAllKeys()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  } catch (error) {
    console.error('IndexedDB getAllKeys error:', error)
    return []
  }
}

/**
 * Get all items from IndexedDB
 */
export async function getAllItems() {
  try {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.getAll()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        const items = request.result.reduce((acc, item) => {
          acc[item.id] = item.data
          return acc
        }, {})
        resolve(items)
      }
    })
  } catch (error) {
    console.error('IndexedDB getAllItems error:', error)
    return {}
  }
}

/**
 * Clear all items from IndexedDB
 */
export async function clearAll() {
  try {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.clear()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  } catch (error) {
    console.error('IndexedDB clearAll error:', error)
    throw error
  }
}

/**
 * Check if IndexedDB is available
 */
export function isIndexedDBAvailable() {
  try {
    return typeof indexedDB !== 'undefined' && indexedDB !== null
  } catch {
    return false
  }
}

/**
 * Get storage usage estimate
 */
export async function getStorageEstimate() {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    try {
      const estimate = await navigator.storage.estimate()
      return {
        usage: estimate.usage || 0,
        quota: estimate.quota || 0,
        percentUsed: estimate.quota
          ? ((estimate.usage / estimate.quota) * 100).toFixed(1)
          : 0,
      }
    } catch (error) {
      console.error('Storage estimate error:', error)
    }
  }
  return { usage: 0, quota: 0, percentUsed: 0 }
}

/**
 * Migrate data from localStorage to IndexedDB
 */
export async function migrateFromLocalStorage(localStorageKey) {
  try {
    const data = localStorage.getItem(localStorageKey)
    if (!data) return false

    const parsed = JSON.parse(data)
    await setItem(localStorageKey, parsed)

    // Optionally clear localStorage after migration
    // localStorage.removeItem(localStorageKey)

    return true
  } catch (error) {
    console.error('Migration error:', error)
    return false
  }
}

/**
 * Hybrid storage that uses localStorage for small data
 * and IndexedDB for large data
 */
export const hybridStorage = {
  THRESHOLD: 1024 * 1024, // 1MB

  async get(key) {
    // Try localStorage first (faster)
    const localData = localStorage.getItem(key)
    if (localData) {
      try {
        return JSON.parse(localData)
      } catch {
        return localData
      }
    }

    // Fall back to IndexedDB
    if (isIndexedDBAvailable()) {
      return await getItem(key)
    }

    return null
  },

  async set(key, value) {
    const serialized = JSON.stringify(value)
    const size = serialized.length * 2 // UTF-16 estimate

    if (size < this.THRESHOLD) {
      // Small data: use localStorage
      try {
        localStorage.setItem(key, serialized)
        // Clean up IndexedDB if exists
        if (isIndexedDBAvailable()) {
          await removeItem(key).catch(() => {})
        }
        return 'localStorage'
      } catch (e) {
        // localStorage full, fall back to IndexedDB
        if (e.name === 'QuotaExceededError' && isIndexedDBAvailable()) {
          await setItem(key, value)
          localStorage.removeItem(key)
          return 'indexedDB'
        }
        throw e
      }
    } else {
      // Large data: use IndexedDB
      if (isIndexedDBAvailable()) {
        await setItem(key, value)
        localStorage.removeItem(key)
        return 'indexedDB'
      } else {
        // Fallback to localStorage even for large data
        localStorage.setItem(key, serialized)
        return 'localStorage'
      }
    }
  },

  async remove(key) {
    localStorage.removeItem(key)
    if (isIndexedDBAvailable()) {
      await removeItem(key).catch(() => {})
    }
  },
}
