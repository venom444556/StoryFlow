// ---------------------------------------------------------------------------
// WebSocket notification server
// Broadcasts sync events to connected browser clients
// Replaces Vite HMR's storyflow:sync event
// ---------------------------------------------------------------------------

import { WebSocketServer } from 'ws'
import { timingSafeEqual } from 'node:crypto'

let wss = null

// Rate limiting: max messages per client within a rolling window
const RATE_LIMIT_MAX = 50 // max messages allowed
const RATE_LIMIT_WINDOW_MS = 10_000 // per 10-second window
const MAX_MESSAGE_SIZE = 4096 // bytes
const MAX_CONNECTIONS = 20 // max concurrent clients

// Auth: reuse the same token as REST API
const AUTH_TOKEN = process.env.STORYFLOW_TOKEN || process.env.STORYFLOW_MCP_TOKEN || null

// Origin verification: trust any localhost origin (private app), or use env override
const CUSTOM_ORIGINS = process.env.STORYFLOW_CORS_ORIGINS
  ? new Set(
      process.env.STORYFLOW_CORS_ORIGINS.split(',')
        .map((o) => o.trim())
        .filter(Boolean)
    )
  : null

function isAllowedOrigin(origin) {
  if (!origin) return true // non-browser clients (CLI, curl) don't send Origin
  if (CUSTOM_ORIGINS) return CUSTOM_ORIGINS.has(origin)
  try {
    const url = new URL(origin)
    return url.hostname === 'localhost' || url.hostname === '127.0.0.1'
  } catch {
    return false
  }
}

/** Verify WebSocket upgrade request (origin + token) */
function verifyClient(info) {
  const origin = info.origin || info.req.headers.origin
  if (!isAllowedOrigin(origin)) {
    console.warn(`[WS] Rejected connection from disallowed origin: ${origin}`)
    return false
  }

  // If token auth is configured, require it on WebSocket connections too
  if (AUTH_TOKEN) {
    const url = new URL(info.req.url, 'http://localhost')
    const token = url.searchParams.get('token')
    if (!token) {
      console.warn('[WS] Rejected connection: missing auth token')
      return false
    }
    const a = Buffer.from(token)
    const b = Buffer.from(AUTH_TOKEN)
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      console.warn('[WS] Rejected connection: invalid auth token')
      return false
    }
  }

  return true
}

/** Attach WebSocket server to an HTTP server instance */
export function initWs(server) {
  wss = new WebSocketServer({
    noServer: true,
    maxPayload: MAX_MESSAGE_SIZE,
  })

  // Handle upgrades only for /ws path — leave other paths (e.g. Vite HMR) alone
  server.on('upgrade', (req, socket, head) => {
    if (req.url === '/ws' || req.url.startsWith('/ws?')) {
      const allowed = verifyClient({ req })
      if (!allowed) {
        socket.write('HTTP/1.1 403 Forbidden\r\n\r\n')
        socket.destroy()
        return
      }
      wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit('connection', ws, req)
      })
    }
  })

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

    ws.on('message', (_data) => {
      const now = Date.now()

      // Prune timestamps outside the window
      ws._messageTimestamps = ws._messageTimestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS)

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

/** Broadcast a structured event to all connected clients */
export function broadcastEvent(event) {
  if (!wss) return
  const msg = JSON.stringify({ type: 'event', event })
  wss.clients.forEach((client) => {
    if (client.readyState === 1) client.send(msg)
  })
}

/** Broadcast AI status change to all connected clients */
export function broadcastAiStatus(status) {
  if (!wss) return
  const msg = JSON.stringify({ type: 'ai_status', ...status })
  wss.clients.forEach((client) => {
    if (client.readyState === 1) client.send(msg)
  })
}

/** Broadcast gate status update to all connected clients */
export function broadcastGateUpdate({ projectId, eventId, status }) {
  if (!wss) return
  const msg = JSON.stringify({ type: 'gate_update', projectId, eventId, status })
  wss.clients.forEach((client) => {
    if (client.readyState === 1) client.send(msg)
  })
}
