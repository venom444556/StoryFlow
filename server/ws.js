// ---------------------------------------------------------------------------
// WebSocket notification server
// Broadcasts sync events to connected browser clients
// Replaces Vite HMR's storyflow:sync event
// ---------------------------------------------------------------------------

import { WebSocketServer } from 'ws'

let wss = null

// Rate limiting: max messages per client within a rolling window
const RATE_LIMIT_MAX = 50 // max messages allowed
const RATE_LIMIT_WINDOW_MS = 10_000 // per 10-second window
const MAX_MESSAGE_SIZE = 4096 // bytes
const MAX_CONNECTIONS = 20 // max concurrent clients

/** Attach WebSocket server to an HTTP server instance */
export function initWs(server) {
  wss = new WebSocketServer({ server, maxPayload: MAX_MESSAGE_SIZE })

  wss.on('connection', (ws, req) => {
    // --- Connection limit ---
    if (wss.clients.size > MAX_CONNECTIONS) {
      console.warn('[WS] Connection rejected: max clients reached')
      ws.close(1013, 'Too many connections')
      return
    }

    const ip = req.socket.remoteAddress
    console.log(`[WS] Client connected (${ip})`)

    // --- Per-client rate limiter ---
    ws._messageTimestamps = []

    ws.on('message', (data) => {
      const now = Date.now()

      // Prune timestamps outside the window
      ws._messageTimestamps = ws._messageTimestamps.filter(
        (t) => now - t < RATE_LIMIT_WINDOW_MS
      )

      if (ws._messageTimestamps.length >= RATE_LIMIT_MAX) {
        console.warn(`[WS] Rate limit exceeded for ${ip}, closing connection`)
        ws.close(1008, 'Rate limit exceeded')
        return
      }

      ws._messageTimestamps.push(now)
    })

    ws.on('close', () => console.log(`[WS] Client disconnected (${ip})`))
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
