import { describe, it, expect, vi } from 'vitest'
import { createSymbolResolver } from '../src/index.js'

function makeFakeClient(hits) {
  return {
    search: vi.fn().mockResolvedValue(hits),
  }
}

describe('createSymbolResolver', () => {
  it('transforms search hits into SymbolCandidate[]', async () => {
    const client = makeFakeClient([
      {
        symbol: { name: 'auth.verify', file: 'src/auth/middleware.js', kind: 'function' },
        score: 0.85,
        snippet: 'export function verify(token) { ... }',
      },
      {
        symbol: { name: 'auth.signIn', file: 'src/auth/sign-in.js', kind: 'function' },
        score: 0.6,
        snippet: '...',
      },
    ])

    const resolver = createSymbolResolver(client)
    const result = await resolver.resolveTicket({
      title: 'Fix auth verify on expired tokens',
      description: 'When token is expired verify() throws undefined.',
    })

    expect(client.search).toHaveBeenCalledOnce()
    expect(result).toHaveLength(2)
    expect(result[0].symbol.name).toBe('auth.verify')
    expect(result[0].confidence).toBeGreaterThan(0)
    expect(result[0].reason).toMatch(/semantic match score/)
  })

  it('sorts candidates by confidence descending', async () => {
    const client = makeFakeClient([
      { symbol: { name: 'foo', file: 'src/foo.js' }, score: 0.4 },
      { symbol: { name: 'bar', file: 'src/bar.js' }, score: 0.9 },
      { symbol: { name: 'baz', file: 'src/baz.js' }, score: 0.7 },
    ])

    const resolver = createSymbolResolver(client, { minConfidence: 0 })
    const result = await resolver.resolveTicket({
      title: 'random ticket',
      description: '',
    })

    const scores = result.map((c) => c.confidence)
    const sorted = [...scores].sort((a, b) => b - a)
    expect(scores).toEqual(sorted)
  })

  it('filters candidates below minConfidence', async () => {
    const client = makeFakeClient([
      { symbol: { name: 'weak', file: 'src/weak.js' }, score: 0.1 },
      { symbol: { name: 'strong', file: 'src/strong.js' }, score: 0.8 },
    ])

    const resolver = createSymbolResolver(client, { minConfidence: 0.5 })
    const result = await resolver.resolveTicket({
      title: 'anything',
      description: '',
    })

    expect(result).toHaveLength(1)
    expect(result[0].symbol.name).toBe('strong')
  })

  it('caps output at topK', async () => {
    const hits = Array.from({ length: 10 }, (_, i) => ({
      symbol: { name: `fn${i}`, file: `src/f${i}.js` },
      score: 0.9 - i * 0.01,
    }))
    const client = makeFakeClient(hits)

    const resolver = createSymbolResolver(client, { topK: 3, minConfidence: 0 })
    const result = await resolver.resolveTicket({ title: 'cap me', description: '' })

    expect(result).toHaveLength(3)
    expect(client.search).toHaveBeenCalledWith('cap me', { topK: 3 })
  })

  it('is deterministic given the same input', async () => {
    const hits = [
      { symbol: { name: 'alpha', file: 'src/a.js' }, score: 0.5 },
      { symbol: { name: 'beta', file: 'src/b.js' }, score: 0.5 },
    ]
    const clientA = makeFakeClient(hits)
    const clientB = makeFakeClient(hits)

    const a = await createSymbolResolver(clientA, { minConfidence: 0 }).resolveTicket({
      title: 'same',
      description: 'same',
    })
    const b = await createSymbolResolver(clientB, { minConfidence: 0 }).resolveTicket({
      title: 'same',
      description: 'same',
    })

    expect(a).toEqual(b)
  })

  it('populates reason with semantic score phrasing', async () => {
    const client = makeFakeClient([{ symbol: { name: 'xyz', file: 'src/xyz.js' }, score: 0.82 }])
    const resolver = createSymbolResolver(client, { minConfidence: 0 })
    const [only] = await resolver.resolveTicket({ title: 't', description: '' })
    expect(only.reason).toContain('semantic match score 0.82')
  })
})
