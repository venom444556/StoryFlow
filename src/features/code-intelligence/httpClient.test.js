// ---------------------------------------------------------------------------
// Tests for the browser-side HTTP proxy that replaces direct imports of
// gitnexus-client. Uses a stubbed global fetch — no real network traffic.
// ---------------------------------------------------------------------------

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createHttpGitNexusProxy } from './httpClient.js'

function mockFetchResponse(body, { status = 200, statusText = 'OK' } = {}) {
  const text = typeof body === 'string' ? body : JSON.stringify(body)
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText,
    text: async () => text,
  }
}

const originalFetch = globalThis.fetch

beforeEach(() => {
  globalThis.fetch = vi.fn()
})

afterEach(() => {
  globalThis.fetch = originalFetch
  vi.restoreAllMocks()
})

describe('createHttpGitNexusProxy', () => {
  it('returns an object with the required interface methods', () => {
    const proxy = createHttpGitNexusProxy()
    expect(typeof proxy.start).toBe('function')
    expect(typeof proxy.stop).toBe('function')
    expect(typeof proxy.health).toBe('function')
    expect(typeof proxy.search).toBe('function')
    expect(typeof proxy.impact).toBe('function')
    expect(typeof proxy.listClusters).toBe('function')
    expect(typeof proxy.detectChanges).toBe('function')
    expect(typeof proxy.queryGraph).toBe('function')
  })

  it('start() and stop() resolve without making HTTP calls', async () => {
    const proxy = createHttpGitNexusProxy()
    await expect(proxy.start()).resolves.toBeUndefined()
    await expect(proxy.stop()).resolves.toBeUndefined()
    expect(globalThis.fetch).not.toHaveBeenCalled()
  })

  it('search() POSTs to /api/code-intelligence/search with the query body', async () => {
    globalThis.fetch.mockResolvedValueOnce(mockFetchResponse([{ id: 'x' }]))
    const proxy = createHttpGitNexusProxy()
    const result = await proxy.search('foo', { topK: 7 })
    expect(result).toEqual([{ id: 'x' }])
    expect(globalThis.fetch).toHaveBeenCalledTimes(1)
    const [url, init] = globalThis.fetch.mock.calls[0]
    expect(url).toBe('/api/code-intelligence/search')
    expect(init.method).toBe('POST')
    expect(JSON.parse(init.body)).toEqual({ query: 'foo', topK: 7 })
  })

  it('impact() POSTs to /api/code-intelligence/impact', async () => {
    globalThis.fetch.mockResolvedValueOnce(mockFetchResponse({ target: { name: 'x' } }))
    const proxy = createHttpGitNexusProxy()
    const result = await proxy.impact({ symbol: 'x' })
    expect(result).toEqual({ target: { name: 'x' } })
    const [url, init] = globalThis.fetch.mock.calls[0]
    expect(url).toBe('/api/code-intelligence/impact')
    expect(init.method).toBe('POST')
    expect(JSON.parse(init.body)).toEqual({ symbol: 'x', file: undefined })
  })

  it('listClusters() GETs /api/code-intelligence/clusters', async () => {
    globalThis.fetch.mockResolvedValueOnce(mockFetchResponse([{ id: 'c1' }]))
    const proxy = createHttpGitNexusProxy()
    const result = await proxy.listClusters()
    expect(result).toEqual([{ id: 'c1' }])
    const [url, init] = globalThis.fetch.mock.calls[0]
    expect(url).toBe('/api/code-intelligence/clusters')
    expect(init.method).toBe('GET')
  })

  it('listClusters() returns an empty array on non-array payload', async () => {
    globalThis.fetch.mockResolvedValueOnce(mockFetchResponse({ oops: true }))
    const proxy = createHttpGitNexusProxy()
    const result = await proxy.listClusters()
    expect(result).toEqual([])
  })

  it('queryGraph() POSTs cypher to /api/code-intelligence/query', async () => {
    globalThis.fetch.mockResolvedValueOnce(mockFetchResponse({ rows: [] }))
    const proxy = createHttpGitNexusProxy()
    await proxy.queryGraph('MATCH (n) RETURN n')
    const [url, init] = globalThis.fetch.mock.calls[0]
    expect(url).toBe('/api/code-intelligence/query')
    expect(JSON.parse(init.body)).toEqual({ cypher: 'MATCH (n) RETURN n' })
  })

  it('detectChanges() GETs /api/code-intelligence/changes', async () => {
    globalThis.fetch.mockResolvedValueOnce(mockFetchResponse({ changed: [] }))
    const proxy = createHttpGitNexusProxy()
    await proxy.detectChanges()
    const [url, init] = globalThis.fetch.mock.calls[0]
    expect(url).toBe('/api/code-intelligence/changes')
    expect(init.method).toBe('GET')
  })

  it('non-2xx responses throw an error containing the status code', async () => {
    globalThis.fetch.mockResolvedValueOnce(
      mockFetchResponse('boom', { status: 500, statusText: 'Internal Server Error' })
    )
    const proxy = createHttpGitNexusProxy()
    await expect(proxy.impact({ symbol: 'x' })).rejects.toThrow(/500/)
  })

  it('health() returns "ok" when the server reports ok', async () => {
    globalThis.fetch.mockResolvedValueOnce(mockFetchResponse({ status: 'ok' }))
    const proxy = createHttpGitNexusProxy()
    await expect(proxy.health()).resolves.toBe('ok')
  })

  it('health() returns "down" when the server reports down', async () => {
    globalThis.fetch.mockResolvedValueOnce(mockFetchResponse({ status: 'down' }))
    const proxy = createHttpGitNexusProxy()
    await expect(proxy.health()).resolves.toBe('down')
  })

  it('health() returns "down" when fetch throws', async () => {
    globalThis.fetch.mockRejectedValueOnce(new Error('network'))
    const proxy = createHttpGitNexusProxy()
    await expect(proxy.health()).resolves.toBe('down')
  })

  it('honors a custom baseUrl prefix', async () => {
    globalThis.fetch.mockResolvedValueOnce(mockFetchResponse([]))
    const proxy = createHttpGitNexusProxy({ baseUrl: 'https://example.test' })
    await proxy.listClusters()
    expect(globalThis.fetch.mock.calls[0][0]).toBe(
      'https://example.test/api/code-intelligence/clusters'
    )
  })
})
