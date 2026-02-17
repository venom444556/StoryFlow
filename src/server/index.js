// ---------------------------------------------------------------------------
// StoryFlow Server — Entry point
// Express HTTP + WebSocket server backed by SQLite
// ---------------------------------------------------------------------------

import { createServer } from 'node:http'
import { initDb, flushToDisk } from './db.js'
import { initWs } from './ws.js'
import app from './app.js'

const PORT = process.env.STORYFLOW_PORT || 3001

async function main() {
  // Initialize SQLite database (creates schema, auto-migrates from JSON)
  await initDb()

  // Create HTTP server from Express app
  const server = createServer(app)

  // Attach WebSocket server
  initWs(server)

  // Start listening
  server.listen(PORT, () => {
    console.log(`[StoryFlow Server] HTTP:      http://localhost:${PORT}`)
    console.log(`[StoryFlow Server] WebSocket: ws://localhost:${PORT}`)
    console.log(`[StoryFlow Server] API:       http://localhost:${PORT}/api/projects`)
  })

  // Graceful shutdown — flush SQLite to disk
  const shutdown = () => {
    console.log('\n[StoryFlow Server] Shutting down...')
    flushToDisk()
    server.close(() => {
      console.log('[StoryFlow Server] Closed')
      process.exit(0)
    })
    // Force exit after 3s if server.close hangs
    setTimeout(() => process.exit(0), 3000)
  }

  process.on('SIGTERM', shutdown)
  process.on('SIGINT', shutdown)
}

main().catch((err) => {
  console.error('[StoryFlow Server] Fatal error:', err)
  process.exit(1)
})
