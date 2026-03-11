/* global process */
// ---------------------------------------------------------------------------
// Framer Launcher — Detect, launch, and connect to Framer with debug port
// ---------------------------------------------------------------------------

import { execFileSync, spawn } from 'node:child_process'
import { existsSync } from 'node:fs'

const FRAMER_PATHS = ['/Applications/Framer.app', `${process.env.HOME}/Applications/Framer.app`]

const POLL_INTERVAL_MS = 500
const DEFAULT_TIMEOUT_MS = 30_000

export function findFramer() {
  for (const p of FRAMER_PATHS) {
    if (existsSync(p)) return p
  }
  return null
}

export function isFramerRunning() {
  try {
    const result = execFileSync('pgrep', ['-f', 'Framer'], { encoding: 'utf-8' })
    return result.trim().length > 0
  } catch {
    return false
  }
}

export async function isPortResponding(port) {
  try {
    const res = await fetch(`http://127.0.0.1:${port}/json/version`, {
      signal: AbortSignal.timeout(2000),
    })
    return res.ok
  } catch {
    return false
  }
}

export async function launch(port = 9222) {
  const framerPath = findFramer()
  if (!framerPath) {
    throw new Error('Framer not found. Install Framer desktop app or set FRAMER_PATH.')
  }

  // Launch Framer with remote debugging port
  const child = spawn('open', ['-a', framerPath, '--args', `--remote-debugging-port=${port}`], {
    detached: true,
    stdio: 'ignore',
  })
  child.unref()

  return child
}

export async function waitForReady(port = 9222, timeout = DEFAULT_TIMEOUT_MS) {
  const start = Date.now()
  while (Date.now() - start < timeout) {
    if (await isPortResponding(port)) return true
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS))
  }
  throw new Error(`Framer CDP not responding on port ${port} after ${timeout}ms`)
}

export async function ensureRunning(port = 9222) {
  if (await isPortResponding(port)) {
    return { launched: false, port }
  }

  await launch(port)
  await waitForReady(port)
  return { launched: true, port }
}

export async function findEditorPage(port = 9222) {
  const res = await fetch(`http://127.0.0.1:${port}/json/list`)
  if (!res.ok) throw new Error(`CDP discovery failed on port ${port}`)
  const targets = await res.json()

  // Prefer the Framer editor page
  const editor = targets.find(
    (t) => t.type === 'page' && /framer\.com\/(projects|design)/.test(t.url)
  )
  if (editor) return editor

  // Fall back to first page
  const page = targets.find((t) => t.type === 'page')
  if (page) return page

  return null
}
