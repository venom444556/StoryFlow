import { describe, it, expect, vi } from 'vitest'
import { createSymbolResolver } from '../src/index.js'

describe('symbol-resolver edge cases', () => {
  it('throws if client does not implement search', () => {
    expect(() => createSymbolResolver({})).toThrow(/must implement search/)
    expect(() => createSymbolResolver(null)).toThrow(/must implement search/)
  })

  it('throws on malformed ticket (no title AND no description)', async () => {
    const client = { search: vi.fn() }
    const resolver = createSymbolResolver(client)
    await expect(resolver.resolveTicket({ title: '', description: '' })).rejects.toThrow(
      /non-empty title or description/
    )
    await expect(resolver.resolveTicket({})).rejects.toThrow(/non-empty title or description/)
    expect(client.search).not.toHaveBeenCalled()
  })

  it('searches against title alone when description is empty', async () => {
    const client = {
      search: vi
        .fn()
        .mockResolvedValue([{ symbol: { name: 'foo', file: 'src/foo.js' }, score: 0.6 }]),
    }
    const resolver = createSymbolResolver(client, { minConfidence: 0 })
    const result = await resolver.resolveTicket({ title: 'only a title', description: '' })

    expect(client.search).toHaveBeenCalledWith('only a title', { topK: 5 })
    expect(result).toHaveLength(1)
  })

  it('searches against description alone when title is empty', async () => {
    const client = {
      search: vi
        .fn()
        .mockResolvedValue([{ symbol: { name: 'foo', file: 'src/foo.js' }, score: 0.6 }]),
    }
    const resolver = createSymbolResolver(client, { minConfidence: 0 })
    await resolver.resolveTicket({ title: '', description: 'only a description' })
    expect(client.search).toHaveBeenCalledWith('only a description', { topK: 5 })
  })

  it('returns empty array (not throw) when search returns zero hits', async () => {
    const client = { search: vi.fn().mockResolvedValue([]) }
    const resolver = createSymbolResolver(client)
    const result = await resolver.resolveTicket({
      title: 'no match',
      description: 'nothing to find',
    })
    expect(result).toEqual([])
  })

  it('returns empty array when client.search returns non-array', async () => {
    const client = { search: vi.fn().mockResolvedValue(null) }
    const resolver = createSymbolResolver(client)
    const result = await resolver.resolveTicket({ title: 'x', description: '' })
    expect(result).toEqual([])
  })

  it('propagates client.search errors with context', async () => {
    const client = {
      search: vi.fn().mockRejectedValue(new Error('gitnexus down')),
    }
    const resolver = createSymbolResolver(client)
    await expect(resolver.resolveTicket({ title: 'x', description: '' })).rejects.toThrow(
      /GitNexusClient\.search failed: gitnexus down/
    )
  })

  it('ignores malformed hits that lack a symbol', async () => {
    const client = {
      search: vi.fn().mockResolvedValue([
        null,
        { score: 0.9 }, // no symbol
        { symbol: {}, score: 0.9 }, // symbol has no name
        { symbol: { name: 'ok', file: 'src/ok.js' }, score: 0.6 },
      ]),
    }
    const resolver = createSymbolResolver(client, { minConfidence: 0 })
    const result = await resolver.resolveTicket({ title: 't', description: '' })
    expect(result).toHaveLength(1)
    expect(result[0].symbol.name).toBe('ok')
  })
})
