/* global process, Buffer */
// ---------------------------------------------------------------------------
// CDP Client — Connect-per-command WebSocket wrapper for Chrome DevTools Protocol
// Each command: connect → do work → close. Sub-100ms overhead.
// ---------------------------------------------------------------------------

import WebSocket from 'ws'

const DEFAULT_PORT = 9222
const CONNECT_TIMEOUT_MS = 5_000
const COMMAND_TIMEOUT_MS = 30_000

export class CDPClient {
  constructor(port = DEFAULT_PORT) {
    this.port = port
    this.ws = null
    this._id = 0
    this._pending = new Map()
    this._events = new Map()
  }

  // --- Discovery ---

  async listTargets() {
    const res = await fetch(`http://127.0.0.1:${this.port}/json/list`)
    if (!res.ok) throw new Error(`CDP discovery failed (${res.status})`)
    return res.json()
  }

  async getVersion() {
    const res = await fetch(`http://127.0.0.1:${this.port}/json/version`)
    if (!res.ok) throw new Error(`CDP version check failed (${res.status})`)
    return res.json()
  }

  // --- Connection ---

  async connect(wsUrl) {
    if (!wsUrl) {
      // Auto-discover: find the Framer editor page
      const targets = await this.listTargets()
      const editor = targets.find(
        (t) => t.type === 'page' && /framer\.com\/(projects|design)/.test(t.url)
      )
      if (!editor) {
        // Fall back to first page target
        const page = targets.find((t) => t.type === 'page')
        if (!page)
          throw new Error(
            'No CDP page targets found. Is Framer running with --remote-debugging-port?'
          )
        wsUrl = page.webSocketDebuggerUrl
      } else {
        wsUrl = editor.webSocketDebuggerUrl
      }
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`CDP connection timed out after ${CONNECT_TIMEOUT_MS}ms`))
      }, CONNECT_TIMEOUT_MS)

      this.ws = new WebSocket(wsUrl)

      this.ws.on('open', () => {
        clearTimeout(timeout)
        resolve()
      })

      this.ws.on('error', (err) => {
        clearTimeout(timeout)
        reject(new Error(`CDP WebSocket error: ${err.message}`))
      })

      this.ws.on('message', (data) => {
        const msg = JSON.parse(data.toString())
        if (msg.id !== undefined && this._pending.has(msg.id)) {
          const { resolve, reject } = this._pending.get(msg.id)
          this._pending.delete(msg.id)
          if (msg.error) {
            reject(new Error(`CDP error: ${msg.error.message}`))
          } else {
            resolve(msg.result)
          }
        } else if (msg.method) {
          // Event
          const handlers = this._events.get(msg.method) || []
          for (const h of handlers) h(msg.params)
        }
      })

      this.ws.on('close', () => {
        // Reject all pending
        for (const [, { reject }] of this._pending) {
          reject(new Error('CDP connection closed'))
        }
        this._pending.clear()
      })
    })
  }

  // --- Protocol ---

  send(method, params = {}) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('Not connected to CDP')
    }

    const id = ++this._id
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this._pending.delete(id)
        reject(new Error(`CDP command timed out: ${method}`))
      }, COMMAND_TIMEOUT_MS)

      this._pending.set(id, {
        resolve: (result) => {
          clearTimeout(timeout)
          resolve(result)
        },
        reject: (err) => {
          clearTimeout(timeout)
          reject(err)
        },
      })

      this.ws.send(JSON.stringify({ id, method, params }))
    })
  }

  on(event, handler) {
    if (!this._events.has(event)) this._events.set(event, [])
    this._events.get(event).push(handler)
  }

  // --- High-level CDP operations ---

  async evaluate(expression, returnByValue = true) {
    const result = await this.send('Runtime.evaluate', {
      expression,
      returnByValue,
      awaitPromise: true,
    })
    if (result.exceptionDetails) {
      const msg = result.exceptionDetails.exception?.description || result.exceptionDetails.text
      throw new Error(`JS evaluation error: ${msg}`)
    }
    return result.result.value
  }

  async screenshot(options = {}) {
    const {
      format = 'png',
      quality,
      clip,
      fromSurface = true,
      captureBeyondViewport = false,
    } = options

    // Set device scale factor for high-res capture
    if (options.deviceScaleFactor) {
      const { width, height } = await this.evaluate(
        'JSON.stringify({ width: window.innerWidth, height: window.innerHeight })'
      ).then(JSON.parse)
      await this.send('Emulation.setDeviceMetricsOverride', {
        width,
        height,
        deviceScaleFactor: options.deviceScaleFactor,
        mobile: false,
      })
    }

    const params = { format, fromSurface, captureBeyondViewport }
    if (quality !== undefined) params.quality = quality
    if (clip) params.clip = clip

    const result = await this.send('Page.captureScreenshot', params)

    // Reset device metrics if we overrode them
    if (options.deviceScaleFactor) {
      await this.send('Emulation.clearDeviceMetricsOverride')
    }

    return Buffer.from(result.data, 'base64')
  }

  async click(x, y, options = {}) {
    const { button = 'left', clickCount = 1 } = options
    await this.send('Input.dispatchMouseEvent', {
      type: 'mousePressed',
      x,
      y,
      button,
      clickCount,
    })
    await this.send('Input.dispatchMouseEvent', {
      type: 'mouseReleased',
      x,
      y,
      button,
      clickCount,
    })
  }

  async type(text) {
    for (const char of text) {
      await this.send('Input.dispatchKeyEvent', {
        type: 'keyDown',
        text: char,
        key: char,
        unmodifiedText: char,
      })
      await this.send('Input.dispatchKeyEvent', {
        type: 'keyUp',
        key: char,
      })
    }
  }

  async keyCombo(keys) {
    // keys: ['Meta', 'a'] for Cmd+A
    const modifiers = { Meta: 4, Control: 2, Alt: 1, Shift: 8 }
    let modifierFlags = 0
    const regular = []

    for (const key of keys) {
      if (modifiers[key] !== undefined) {
        modifierFlags |= modifiers[key]
      } else {
        regular.push(key)
      }
    }

    // Press modifiers
    for (const key of keys) {
      if (modifiers[key] !== undefined) {
        await this.send('Input.dispatchKeyEvent', {
          type: 'keyDown',
          key,
          modifiers: modifierFlags,
        })
      }
    }

    // Press and release regular keys
    for (const key of regular) {
      await this.send('Input.dispatchKeyEvent', {
        type: 'keyDown',
        key,
        text: key.length === 1 ? key : '',
        modifiers: modifierFlags,
      })
      await this.send('Input.dispatchKeyEvent', {
        type: 'keyUp',
        key,
        modifiers: modifierFlags,
      })
    }

    // Release modifiers
    for (const key of keys.reverse()) {
      if (modifiers[key] !== undefined) {
        await this.send('Input.dispatchKeyEvent', {
          type: 'keyUp',
          key,
        })
      }
    }
  }

  async waitForSelector(selector, timeout = 5000) {
    const start = Date.now()
    while (Date.now() - start < timeout) {
      const found = await this.evaluate(`!!document.querySelector(${JSON.stringify(selector)})`)
      if (found) return true
      await new Promise((r) => setTimeout(r, 100))
    }
    throw new Error(`Selector not found within ${timeout}ms: ${selector}`)
  }

  close() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }
}

// --- Convenience: connect-per-command pattern ---

export async function withCDP(port, fn) {
  const client = new CDPClient(port)
  try {
    await client.connect()
    return await fn(client)
  } finally {
    client.close()
  }
}

export function getPort(opts) {
  return parseInt(opts?.port || opts?.parent?.opts()?.port || process.env.FORGE_PORT || '9222', 10)
}
