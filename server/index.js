// ---------------------------------------------------------------------------
// StoryFlow Server — Entry point
// Express HTTP + WebSocket server backed by SQLite
// In dev mode, Vite runs as middleware inside Express (single process/port).
// ---------------------------------------------------------------------------

import { createServer } from 'node:http'
import { initDb, flushToDisk } from './db.js'
import { initWs } from './ws.js'
import { cleanupAllEvents } from './events.js'
import app from './app.js'

const PORT = process.env.STORYFLOW_PORT || 3001
const isDev = process.env.NODE_ENV !== 'production'

async function main() {
  // Initialize SQLite database (creates schema, auto-migrates from JSON)
  await initDb()

  // Run initial event cleanup (non-fatal)
  try {
    const result = cleanupAllEvents(90)
    if (result.deleted > 0) {
      console.log(`[Cleanup] Removed ${result.deleted} old events (cutoff: ${result.cutoff})`)
    }
  } catch (err) {
    console.warn('[Cleanup] Startup cleanup failed (non-fatal):', err.message)
  }

  // Schedule periodic cleanup every 24 hours
  setInterval(
    () => {
      try {
        const result = cleanupAllEvents(90)
        if (result.deleted > 0) {
          console.log(`[Cleanup] Periodic: removed ${result.deleted} old events`)
        }
      } catch (err) {
        console.warn('[Cleanup] Periodic cleanup failed:', err.message)
      }
    },
    24 * 60 * 60 * 1000
  )

  // Create HTTP server from Express app
  const server = createServer(app)

  // --- Vite dev middleware (dev only) ---
  // Runs inside Express: same process, same port, no separate Vite server to die.
  if (isDev) {
    const { createServer: createViteServer } = await import('vite')
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: { server } },
      appType: 'spa',
    })
    app.use(vite.middlewares)
  }

  // Attach WebSocket server
  initWs(server)

  // Start listening — bind to loopback only to prevent LAN exposure
  const HOST = process.env.STORYFLOW_HOST || '127.0.0.1'
  server.listen(PORT, HOST, () => {
    console.log(`[StoryFlow Server] HTTP:      http://${HOST}:${PORT}`)
    console.log(`[StoryFlow Server] WebSocket: ws://${HOST}:${PORT}`)
    console.log(`[StoryFlow Server] API:       http://${HOST}:${PORT}/api/projects`)
    if (isDev) {
      console.log(`[StoryFlow Server] Vite HMR:  ws://${HOST}:${PORT}`)
      console.log(`[StoryFlow Server] UI:        http://${HOST}:${PORT}`)
    }
  })

  // Graceful shutdown — flush SQLite to disk before exiting
  const shutdown = async () => {
    console.log('\n[StoryFlow Server] Shutting down...')
    try {
      await flushToDisk()
      console.log('[StoryFlow Server] Database saved to disk')
    } catch (err) {
      console.error('[StoryFlow Server] FAILED to save database:', err.message)
    }
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
