// @vitest-environment node
// ---------------------------------------------------------------------------
// Tests for server/codeIntelligenceRoutes.js — the HTTP surface that fronts
// the gitnexus client for the browser bundle.
//
// We vi.mock('./codeIntelligence.js') so we can control what getGitNexusClient
// returns per test without booting the real client.
// ---------------------------------------------------------------------------

import { describe, it, expect, beforeEach, vi } from 'vitest'
import express from 'express'
import { createServer } from 'node:http'

vi.mock('./codeIntelligence.js', () => ({
  getGitNexusClient: vi.fn(),
}))

import { getGitNexusClient } from './codeIntelligence.js'
import { createCodeIntelligenceRouter } from './codeIntelligenceRoutes.js'

async function withServer(fn) {
  const app = express()
  app.use(express.json())
  app.use('/api/code-intelligence', createCodeIntelligenceRouter())
  const server = createServer(app)
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  const { port } = server.address()
  const baseUrl = `http://127.0.0.1:${port}`
  try {
    return await fn(baseUrl)
  } finally {
    await new Promise((resolve) => server.close(resolve))
  }
}

function makeFakeClient(overrides = {}) {
  return {
    impact: vi.fn(async () => ({ target: { name: 'foo' } })),
    search: vi.fn(async () => [{ id: 's1' }]),
    listClusters: vi.fn(async () => [{ id: 'c1' }]),
    queryGraph: vi.fn(async () => ({ rows: [] })),
    detectChanges: vi.fn(async () => ({ changed: [] })),
    ...overrides,
  }
}

beforeEach(() => {
  getGitNexusClient.mockReset()
})

describe('codeIntelligenceRoutes', () => {
  it('GET /health returns { status: "down" } when no client is running', async () => {
    getGitNexusClient.mockReturnValue(null)
    await withServer(async (baseUrl) => {
      const res = await fetch(`${baseUrl}/api/code-intelligence/health`)
      expect(res.status).toBe(200)
      expect(await res.json()).toEqual({ status: 'down' })
    })
  })

  it('GET /health returns { status: "ok" } when client is running', async () => {
    getGitNexusClient.mockReturnValue(makeFakeClient())
    await withServer(async (baseUrl) => {
      const res = await fetch(`${baseUrl}/api/code-intelligence/health`)
      expect(res.status).toBe(200)
      expect(await res.json()).toEqual({ status: 'ok' })
    })
  })

  it('POST /impact returns 503 when no client', async () => {
    getGitNexusClient.mockReturnValue(null)
    await withServer(async (baseUrl) => {
      const res = await fetch(`${baseUrl}/api/code-intelligence/impact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol: 'x' }),
      })
      expect(res.status).toBe(503)
      expect(await res.json()).toEqual({ error: 'code-intelligence-not-enabled' })
    })
  })

  it('POST /impact delegates to client.impact and returns the result', async () => {
    const client = makeFakeClient()
    getGitNexusClient.mockReturnValue(client)
    await withServer(async (baseUrl) => {
      const res = await fetch(`${baseUrl}/api/code-intelligence/impact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol: 'foo' }),
      })
      expect(res.status).toBe(200)
      expect(await res.json()).toEqual({ target: { name: 'foo' } })
      expect(client.impact).toHaveBeenCalledWith({ symbol: 'foo', file: undefined })
    })
  })

  it('POST /search delegates to client.search with topK option', async () => {
    const client = makeFakeClient()
    getGitNexusClient.mockReturnValue(client)
    await withServer(async (baseUrl) => {
      const res = await fetch(`${baseUrl}/api/code-intelligence/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: 'auth', topK: 5 }),
      })
      expect(res.status).toBe(200)
      expect(await res.json()).toEqual([{ id: 's1' }])
      expect(client.search).toHaveBeenCalledWith('auth', { topK: 5 })
    })
  })

  it('GET /clusters delegates to client.listClusters', async () => {
    const client = makeFakeClient()
    getGitNexusClient.mockReturnValue(client)
    await withServer(async (baseUrl) => {
      const res = await fetch(`${baseUrl}/api/code-intelligence/clusters`)
      expect(res.status).toBe(200)
      expect(await res.json()).toEqual([{ id: 'c1' }])
      expect(client.listClusters).toHaveBeenCalled()
    })
  })

  it('POST /query delegates to client.queryGraph', async () => {
    const client = makeFakeClient()
    getGitNexusClient.mockReturnValue(client)
    await withServer(async (baseUrl) => {
      const res = await fetch(`${baseUrl}/api/code-intelligence/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cypher: 'MATCH (n) RETURN n' }),
      })
      expect(res.status).toBe(200)
      expect(await res.json()).toEqual({ rows: [] })
      expect(client.queryGraph).toHaveBeenCalledWith('MATCH (n) RETURN n')
    })
  })

  it('GET /changes delegates to client.detectChanges', async () => {
    const client = makeFakeClient()
    getGitNexusClient.mockReturnValue(client)
    await withServer(async (baseUrl) => {
      const res = await fetch(`${baseUrl}/api/code-intelligence/changes`)
      expect(res.status).toBe(200)
      expect(await res.json()).toEqual({ changed: [] })
      expect(client.detectChanges).toHaveBeenCalled()
    })
  })

  it('returns 500 with a sanitized message when the client throws', async () => {
    const client = makeFakeClient({
      impact: vi.fn(async () => {
        throw new Error('internal gitnexus explosion')
      }),
    })
    getGitNexusClient.mockReturnValue(client)
    await withServer(async (baseUrl) => {
      const res = await fetch(`${baseUrl}/api/code-intelligence/impact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol: 'x' }),
      })
      expect(res.status).toBe(500)
      const body = await res.json()
      expect(body.error).toBe('internal gitnexus explosion')
    })
  })
})
