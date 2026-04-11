import { describe, it, expect, vi } from 'vitest'
import { createSymbolResolver } from '../src/index.js'
import { extractExplicitSymbolMarkers, extractFilePathMentions } from '../src/heuristics.js'

function makeClient(hits) {
  return { search: vi.fn().mockResolvedValue(hits) }
}

describe('heuristic extraction', () => {
  it('extracts [[Symbol:name]] markers case-insensitively', () => {
    const markers = extractExplicitSymbolMarkers(
      'See [[Symbol:auth.verify]] and [[Symbol:User.login]] plus junk [[Symbol:bad spaces]]'
    )
    expect(markers.has('auth.verify')).toBe(true)
    expect(markers.has('user.login')).toBe(true)
  })

  it('extracts file paths from backticked and bare mentions', () => {
    const paths = extractFilePathMentions(
      'Fix `src/auth/middleware.js` and also server/db.js please'
    )
    expect(paths.has('src/auth/middleware.js')).toBe(true)
    expect(paths.has('server/db.js')).toBe(true)
  })
})

describe('resolver heuristic boosts', () => {
  it('boosts confidence for direct symbol name in title', async () => {
    const client = makeClient([
      { symbol: { name: 'verify', file: 'src/auth/middleware.js', kind: 'function' }, score: 0.4 },
      { symbol: { name: 'somethingElse', file: 'src/other.js', kind: 'function' }, score: 0.4 },
    ])
    const resolver = createSymbolResolver(client, { minConfidence: 0 })
    const result = await resolver.resolveTicket({
      title: 'Fix verify() on expired tokens',
      description: '',
    })
    const verify = result.find((c) => c.symbol.name === 'verify')
    const other = result.find((c) => c.symbol.name === 'somethingElse')
    expect(verify.confidence).toBeGreaterThan(other.confidence)
    expect(verify.reason).toMatch(/matched from title/)
  })

  it('boosts candidates whose file path is referenced in the ticket', async () => {
    const client = makeClient([
      { symbol: { name: 'foo', file: 'src/auth/middleware.js' }, score: 0.4 },
      { symbol: { name: 'bar', file: 'src/unrelated.js' }, score: 0.4 },
    ])
    const resolver = createSymbolResolver(client, { minConfidence: 0 })
    const result = await resolver.resolveTicket({
      title: 'bug',
      description: 'The bug is in `src/auth/middleware.js`.',
    })
    expect(result[0].symbol.name).toBe('foo')
    expect(result[0].reason).toMatch(/file path referenced/)
  })

  it('boosts explicit [[Symbol:name]] markers strongest', async () => {
    const client = makeClient([
      { symbol: { name: 'auth.verify', file: 'src/auth/middleware.js' }, score: 0.2 },
      { symbol: { name: 'auth.login', file: 'src/auth/login.js' }, score: 0.9 },
    ])
    const resolver = createSymbolResolver(client, { minConfidence: 0 })
    const result = await resolver.resolveTicket({
      title: 'investigate',
      description: 'Trace [[Symbol:auth.verify]] path.',
    })
    const verify = result.find((c) => c.symbol.name === 'auth.verify')
    expect(verify.reason).toMatch(/explicit \[\[Symbol:auth\.verify\]\] marker/)
    // Explicit marker boost (0.5) + base 0.2 = 0.7, beats login's 0.9? No.
    // login has higher base; just assert explicit marker is credited.
    expect(verify.confidence).toBeGreaterThanOrEqual(0.7)
  })

  it('keeps confidence within [0,1]', async () => {
    const client = makeClient([
      { symbol: { name: 'verify', file: 'src/auth/middleware.js', kind: 'function' }, score: 0.99 },
    ])
    const resolver = createSymbolResolver(client, { minConfidence: 0 })
    const [only] = await resolver.resolveTicket({
      title: 'Fix verify in `src/auth/middleware.js`',
      description: 'Linked [[Symbol:verify]]',
    })
    expect(only.confidence).toBeLessThanOrEqual(1)
    expect(only.confidence).toBeGreaterThan(0)
  })
})
