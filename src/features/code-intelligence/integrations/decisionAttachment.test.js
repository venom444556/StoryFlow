import { describe, it, expect } from 'vitest'
import {
  createImpactAttachment,
  isImpactAttachment,
  summarizeAttachment,
  IMPACT_ATTACHMENT_TYPE,
} from './decisionAttachment.js'

const symbol = {
  name: 'auth.middleware.verify',
  file: 'src/auth/middleware.js',
  line: 42,
  kind: 'function',
}

const report = {
  target: symbol,
  blastRadius: 'HIGH',
  callsiteCount: 23,
  affectedClusterIds: ['auth', 'api'],
  affectedServiceCount: 2,
  topCallers: [],
  rationale: '23 callsites across 2 services exceeds HIGH threshold.',
}

describe('createImpactAttachment', () => {
  it('returns a frozen object with correct shape and fields', () => {
    const att = createImpactAttachment(symbol, report)
    expect(att.type).toBe(IMPACT_ATTACHMENT_TYPE)
    expect(att.targetSymbol).toBe(symbol)
    expect(att.report).toBe(report)
    expect(typeof att.capturedAt).toBe('string')
    expect(new Date(att.capturedAt).toString()).not.toBe('Invalid Date')
    expect(Object.isFrozen(att)).toBe(true)
    expect(att.note).toBeUndefined()
  })

  it('includes optional note when provided', () => {
    const att = createImpactAttachment(symbol, report, '  Reviewed by Alice  ')
    expect(att.note).toBe('Reviewed by Alice')
  })

  it('omits empty/whitespace notes', () => {
    const att = createImpactAttachment(symbol, report, '   ')
    expect(att.note).toBeUndefined()
  })

  it('throws on missing symbol or report', () => {
    expect(() => createImpactAttachment(null, report)).toThrow()
    expect(() => createImpactAttachment(symbol, null)).toThrow()
  })
})

describe('isImpactAttachment', () => {
  it('recognizes valid attachments', () => {
    const att = createImpactAttachment(symbol, report)
    expect(isImpactAttachment(att)).toBe(true)
  })

  it('rejects non-objects and wrong-type payloads', () => {
    expect(isImpactAttachment(null)).toBe(false)
    expect(isImpactAttachment(undefined)).toBe(false)
    expect(isImpactAttachment('hello')).toBe(false)
    expect(isImpactAttachment({})).toBe(false)
    expect(
      isImpactAttachment({ type: 'other', capturedAt: '', targetSymbol: {}, report: {} })
    ).toBe(false)
  })

  it('rejects attachments missing required fields', () => {
    expect(isImpactAttachment({ type: IMPACT_ATTACHMENT_TYPE })).toBe(false)
    expect(
      isImpactAttachment({ type: IMPACT_ATTACHMENT_TYPE, capturedAt: 'x', targetSymbol: {} })
    ).toBe(false)
  })
})

describe('summarizeAttachment', () => {
  it('returns a concise human-readable string', () => {
    const att = createImpactAttachment(symbol, report)
    const s = summarizeAttachment(att)
    expect(s).toContain('auth.middleware.verify')
    expect(s).toContain('HIGH')
    expect(s).toContain('23 callsites')
    expect(s).toContain('2 clusters')
  })

  it('pluralizes correctly for single counts', () => {
    const singleReport = { ...report, callsiteCount: 1, affectedClusterIds: ['solo'] }
    const att = createImpactAttachment(symbol, singleReport)
    const s = summarizeAttachment(att)
    expect(s).toContain('1 callsite,')
    expect(s).toContain('1 cluster')
  })

  it('handles invalid input gracefully', () => {
    expect(summarizeAttachment(null)).toMatch(/invalid/i)
    expect(summarizeAttachment({})).toMatch(/invalid/i)
  })
})
