/**
 * This test file previously tested the syncToServer race condition (#20).
 *
 * syncToServer and IndexedDB persistence have been removed from projectsStore
 * as part of the SQL normalization migration. The store now hydrates exclusively
 * from the REST API via reloadFromServer(). The race condition that this test
 * guarded against no longer exists.
 *
 * See projectsStore.serverSync.test.js for reloadFromServer() coverage.
 */
import { describe, it } from 'vitest'

describe('syncToServer race condition (#20) [REMOVED]', () => {
  it('is no longer relevant — syncToServer was removed', () => {
    // syncToServer and /api/sync push have been removed.
    // The store is now read-only from the server via reloadFromServer().
  })
})
