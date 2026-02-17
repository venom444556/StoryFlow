// ---------------------------------------------------------------------------
// WebSocket notification server
// Broadcasts sync events to connected browser clients
// Replaces Vite HMR's storyflow:sync event
// ---------------------------------------------------------------------------

import { WebSocketServer } from 'ws'

let wss = null

/** Attach WebSocket server to an HTTP server instance */
export function initWs(server) {
  wss = new WebSocketServer({ server })

  wss.on('connection', (ws) => {
    console.log('[WS] Client connected')
    ws.on('close', () => console.log('[WS] Client disconnected'))
    ws.on('error', (err) => console.error('[WS] Client error:', err.message))
  })

  console.log('[WS] WebSocket server ready')
}

/** Broadcast a sync notification to all connected clients */
export function notifyClients() {
  if (!wss) return
  const msg = JSON.stringify({ type: 'sync', timestamp: Date.now() })
  let sent = 0
  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      // WebSocket.OPEN
      client.send(msg)
      sent++
    }
  })
  if (sent > 0) {
    console.log(`[WS] Notified ${sent} client(s)`)
  }
}
