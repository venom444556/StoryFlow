import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import { classify, analyzeImpact } from '../src/analyze.js'
import { DEFAULT_THRESHOLDS } from '../src/thresholds.js'

/**
 * Severity rank mirror used only in tests.
 * @type {Record<string, number>}
 */
const RANK = { LOW: 0, MEDIUM: 1, HIGH: 2, CRITICAL: 3 }

describe('blast radius monotonicity', () => {
  it('increasing callsiteCount never decreases blast radius (services fixed)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 200 }),
        fc.integer({ min: 0, max: 200 }),
        fc.integer({ min: 0, max: 10 }),
        (a, b, services) => {
          const lo = Math.min(a, b)
          const hi = Math.max(a, b)
          const low = classify(lo, services, DEFAULT_THRESHOLDS).blastRadius
          const high = classify(hi, services, DEFAULT_THRESHOLDS).blastRadius
          return RANK[high] >= RANK[low]
        }
      ),
      { numRuns: 500 }
    )
  })

  it('increasing affectedServices never decreases blast radius (callsites fixed)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 10 }),
        fc.integer({ min: 0, max: 10 }),
        fc.integer({ min: 0, max: 200 }),
        (a, b, callsites) => {
          const lo = Math.min(a, b)
          const hi = Math.max(a, b)
          const low = classify(callsites, lo, DEFAULT_THRESHOLDS).blastRadius
          const high = classify(callsites, hi, DEFAULT_THRESHOLDS).blastRadius
          return RANK[high] >= RANK[low]
        }
      ),
      { numRuns: 500 }
    )
  })

  it('monotonicity holds through the public analyzeImpact entry point too', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 200 }),
        fc.integer({ min: 0, max: 200 }),
        fc.integer({ min: 0, max: 5 }),
        (a, b, services) => {
          const lo = Math.min(a, b)
          const hi = Math.max(a, b)
          const base = {
            target: { name: 't', file: 't.js' },
            callers: [],
            affectedClusters: [],
            affectedServices: services,
          }
          const low = analyzeImpact({ ...base, callsiteCount: lo }).blastRadius
          const high = analyzeImpact({ ...base, callsiteCount: hi }).blastRadius
          return RANK[high] >= RANK[low]
        }
      ),
      { numRuns: 300 }
    )
  })

  it('classification is a pure function — same input, same output', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 500 }),
        fc.integer({ min: 0, max: 20 }),
        (callsites, services) => {
          const a = classify(callsites, services, DEFAULT_THRESHOLDS)
          const b = classify(callsites, services, DEFAULT_THRESHOLDS)
          return a.blastRadius === b.blastRadius && a.rationale === b.rationale
        }
      ),
      { numRuns: 300 }
    )
  })

  it('output blastRadius is always one of the four valid values', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: -10, max: 1000 }),
        fc.integer({ min: -10, max: 100 }),
        (callsites, services) => {
          const { blastRadius } = classify(callsites, services, DEFAULT_THRESHOLDS)
          expect(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).toContain(blastRadius)
        }
      ),
      { numRuns: 200 }
    )
  })
})
