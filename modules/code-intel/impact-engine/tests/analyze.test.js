import { describe, it, expect } from 'vitest'
import {
  analyzeImpact,
  classify,
  TOP_CALLERS_CAP,
  preflightGate,
  DEFAULT_THRESHOLDS,
  resolveThresholds,
} from '../src/index.js'

/**
 * Build an ImpactRaw fixture. Defaults are a LOW-radius symbol.
 */
function raw(overrides = {}) {
  return {
    target: { name: 'auth.middleware.verify', file: 'src/auth/mw.js', line: 42, kind: 'function' },
    callers: [],
    callsiteCount: 0,
    affectedClusters: [],
    affectedServices: 0,
    ...overrides,
  }
}

describe('analyzeImpact — contract tests', () => {
  it('classifies LOW when callsites <= low_maxCallsites and services <= medium_maxServices', () => {
    const r = analyzeImpact(raw({ callsiteCount: 3, affectedServices: 1 }))
    expect(r.blastRadius).toBe('LOW')
    expect(r.callsiteCount).toBe(3)
    expect(r.affectedServiceCount).toBe(1)
    expect(r.rationale).toContain('LOW')
    expect(r.rationale).toContain('low_maxCallsites')
    expect(r.rationale).toContain('5') // the default low threshold
  })

  it('classifies LOW at the boundary (callsites === low_maxCallsites)', () => {
    const r = analyzeImpact(raw({ callsiteCount: 5, affectedServices: 1 }))
    expect(r.blastRadius).toBe('LOW')
  })

  it('classifies MEDIUM when callsites exceeds low threshold but stays single-service', () => {
    const r = analyzeImpact(raw({ callsiteCount: 15, affectedServices: 1 }))
    expect(r.blastRadius).toBe('MEDIUM')
    expect(r.rationale).toContain('MEDIUM')
    expect(r.rationale).toContain('low_maxCallsites')
    expect(r.rationale).toContain('medium_maxCallsites')
  })

  it('classifies MEDIUM just above the low boundary (6 callsites)', () => {
    const r = analyzeImpact(raw({ callsiteCount: 6, affectedServices: 0 }))
    expect(r.blastRadius).toBe('MEDIUM')
  })

  it('classifies HIGH when callsites >= high_minCallsites', () => {
    const r = analyzeImpact(raw({ callsiteCount: 21, affectedServices: 1 }))
    expect(r.blastRadius).toBe('HIGH')
    expect(r.rationale).toContain('HIGH')
    expect(r.rationale).toContain('high_minCallsites')
    expect(r.rationale).toContain('21')
  })

  it('classifies HIGH when cross-service spread meets high_minServices even at low callsites', () => {
    const r = analyzeImpact(raw({ callsiteCount: 4, affectedServices: 3 }))
    expect(r.blastRadius).toBe('HIGH')
    expect(r.rationale).toContain('HIGH')
    expect(r.rationale).toContain('high_minServices')
  })

  it('classifies CRITICAL when callsites >= critical_minCallsites', () => {
    const r = analyzeImpact(raw({ callsiteCount: 50, affectedServices: 2 }))
    expect(r.blastRadius).toBe('CRITICAL')
    expect(r.rationale).toContain('CRITICAL')
    expect(r.rationale).toContain('critical_minCallsites')
    expect(r.rationale).toContain('50')
  })

  it('classifies CRITICAL even with a single service when callsites are huge', () => {
    const r = analyzeImpact(raw({ callsiteCount: 500, affectedServices: 1 }))
    expect(r.blastRadius).toBe('CRITICAL')
  })

  it('populates target, clusters, and topCallers from the raw response', () => {
    const callers = Array.from({ length: 15 }, (_, i) => ({
      from: { name: `caller_${i}`, file: `src/c${i}.js` },
      to: { name: 'auth.middleware.verify', file: 'src/auth/mw.js' },
    }))
    const r = analyzeImpact(
      raw({
        callsiteCount: 12,
        affectedServices: 1,
        affectedClusters: ['cluster-auth', 'cluster-api'],
        callers,
      })
    )
    expect(r.target).toEqual(raw().target)
    expect(r.affectedClusterIds).toEqual(['cluster-auth', 'cluster-api'])
    expect(r.topCallers).toHaveLength(TOP_CALLERS_CAP)
  })

  it('ranks direct callers before transitive callers (those with `via`)', () => {
    const direct = { from: { name: 'd', file: 'd.js' }, to: { name: 't', file: 't.js' } }
    const transitive = {
      from: { name: 'tr', file: 'tr.js' },
      to: { name: 't', file: 't.js' },
      via: 'helper.js',
    }
    const r = analyzeImpact(raw({ callers: [transitive, direct] }))
    expect(r.topCallers[0]).toBe(direct)
    expect(r.topCallers[1]).toBe(transitive)
  })

  it('is deterministic — same input yields equal output twice', () => {
    const input = raw({ callsiteCount: 34, affectedServices: 3 })
    const a = analyzeImpact(input)
    const b = analyzeImpact(input)
    expect(a).toEqual(b)
  })

  it('does not mutate its input', () => {
    const input = raw({
      callsiteCount: 10,
      affectedServices: 1,
      affectedClusters: ['a', 'b'],
      callers: [{ from: { name: 'x', file: 'x.js' }, to: { name: 'y', file: 'y.js' } }],
    })
    const snap = JSON.parse(JSON.stringify(input))
    analyzeImpact(input)
    expect(input).toEqual(snap)
  })

  it('accepts custom thresholds and honors them', () => {
    const r = analyzeImpact(raw({ callsiteCount: 7, affectedServices: 1 }), {
      low_maxCallsites: 10,
    })
    expect(r.blastRadius).toBe('LOW')
  })

  it('throws a TypeError if raw is missing', () => {
    expect(() => analyzeImpact(null)).toThrow(TypeError)
    expect(() => analyzeImpact(undefined)).toThrow(TypeError)
  })

  it('coerces non-finite numeric fields to 0', () => {
    const r = analyzeImpact(raw({ callsiteCount: NaN, affectedServices: Infinity }))
    expect(r.callsiteCount).toBe(0)
    expect(r.affectedServiceCount).toBe(0)
    expect(r.blastRadius).toBe('LOW')
  })

  it('handles missing optional arrays gracefully', () => {
    // Deliberately strip arrays to non-arrays.
    const weird = { target: { name: 't', file: 't.js' }, callsiteCount: 2 }
    const r = analyzeImpact(weird)
    expect(r.affectedClusterIds).toEqual([])
    expect(r.topCallers).toEqual([])
  })
})

describe('classify — direct unit tests for rationale hooks', () => {
  it('plural vs singular services copy', () => {
    const one = classify(2, 1, DEFAULT_THRESHOLDS)
    expect(one.rationale).toContain('1 service.')
    const two = classify(2, 0, DEFAULT_THRESHOLDS)
    expect(two.rationale).toContain('0 services.')
  })

  it('HIGH via services branch names the triggering threshold', () => {
    const { rationale } = classify(1, 5, DEFAULT_THRESHOLDS)
    expect(rationale).toContain('high_minServices')
  })

  it('services branch uses plural when >=2', () => {
    const { rationale } = classify(25, 2, DEFAULT_THRESHOLDS)
    expect(rationale).toContain('services')
  })

  it('rationale of HIGH-via-services path surfaces callsite count too', () => {
    const { rationale } = classify(3, 2, DEFAULT_THRESHOLDS)
    expect(rationale).toMatch(/3 callsites/)
  })
})

describe('public barrel (src/index.js) re-exports', () => {
  it('re-exports preflightGate so one import covers the whole module', () => {
    const r = analyzeImpact({
      target: { name: 't', file: 't.js' },
      callers: [],
      callsiteCount: 1,
      affectedClusters: [],
      affectedServices: 0,
    })
    const d = preflightGate([r], 'HIGH')
    expect(d.outcome).toBe('allow')
  })
})

describe('resolveThresholds', () => {
  it('returns the default object when no overrides are provided', () => {
    expect(resolveThresholds()).toBe(DEFAULT_THRESHOLDS)
  })

  it('merges overrides without mutating defaults', () => {
    const merged = resolveThresholds({ low_maxCallsites: 99 })
    expect(merged.low_maxCallsites).toBe(99)
    expect(merged.medium_maxCallsites).toBe(DEFAULT_THRESHOLDS.medium_maxCallsites)
    expect(DEFAULT_THRESHOLDS.low_maxCallsites).toBe(5)
  })
})
