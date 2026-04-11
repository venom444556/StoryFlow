import { describe, it, expect } from 'vitest'
import { preflightGate } from '../src/gate.js'
import { analyzeImpact } from '../src/analyze.js'

function report(blastRadius, name = 'sym') {
  return analyzeImpact({
    target: { name, file: `${name}.js` },
    callers: [],
    callsiteCount:
      blastRadius === 'LOW' ? 1 : blastRadius === 'MEDIUM' ? 10 : blastRadius === 'HIGH' ? 25 : 60,
    affectedClusters: [],
    affectedServices: blastRadius === 'HIGH' ? 2 : blastRadius === 'CRITICAL' ? 3 : 1,
  })
}

describe('preflightGate — contract tests', () => {
  it('returns allow with "no linked symbols." on an empty array', () => {
    const d = preflightGate([], 'HIGH')
    expect(d.outcome).toBe('allow')
    expect(d.reason).toBe('no linked symbols.')
    expect(d.reports).toEqual([])
  })

  it('returns block when any report equals the threshold severity', () => {
    const reports = [report('LOW'), report('HIGH')]
    const d = preflightGate(reports, 'HIGH')
    expect(d.outcome).toBe('block')
    expect(d.reason).toContain('HIGH')
    expect(d.reports).toBe(reports)
  })

  it('returns block when any report exceeds the threshold severity', () => {
    const reports = [report('MEDIUM'), report('CRITICAL')]
    const d = preflightGate(reports, 'HIGH')
    expect(d.outcome).toBe('block')
    expect(d.reason).toContain('CRITICAL')
  })

  it('returns allow when all reports are strictly below the threshold', () => {
    const reports = [report('LOW'), report('MEDIUM')]
    const d = preflightGate(reports, 'HIGH')
    expect(d.outcome).toBe('allow')
    expect(d.reason).toContain('below HIGH threshold')
    expect(d.reason).toContain('worst: MEDIUM')
  })

  it('picks the WORST report as the reason source', () => {
    const reports = [report('LOW'), report('MEDIUM'), report('CRITICAL', 'big.boom'), report('LOW')]
    const d = preflightGate(reports, 'HIGH')
    expect(d.outcome).toBe('block')
    expect(d.reason).toContain('big.boom')
    expect(d.reason).toContain('CRITICAL')
  })

  it('MEDIUM blockAt blocks on medium', () => {
    const d = preflightGate([report('MEDIUM')], 'MEDIUM')
    expect(d.outcome).toBe('block')
  })

  it('MEDIUM blockAt allows when everything is LOW', () => {
    const d = preflightGate([report('LOW'), report('LOW')], 'MEDIUM')
    expect(d.outcome).toBe('allow')
  })

  it('CRITICAL blockAt only blocks on critical', () => {
    const reports = [report('HIGH'), report('MEDIUM')]
    expect(preflightGate(reports, 'CRITICAL').outcome).toBe('allow')
    expect(preflightGate([...reports, report('CRITICAL')], 'CRITICAL').outcome).toBe('block')
  })

  it('handles single-report pluralization in the allow message', () => {
    const d = preflightGate([report('LOW')], 'HIGH')
    expect(d.reason).toContain('1 linked symbol ')
  })

  it('rejects non-array input with a TypeError', () => {
    expect(() => preflightGate(null, 'HIGH')).toThrow(TypeError)
    // @ts-expect-error bad input
    expect(() => preflightGate('not-an-array', 'HIGH')).toThrow(TypeError)
  })

  it('rejects an invalid blockAt severity', () => {
    expect(() => preflightGate([], 'LOW')).toThrow(RangeError)
    expect(() => preflightGate([], 'NUCLEAR')).toThrow(RangeError)
  })

  it('is pure — does not mutate the reports array', () => {
    const reports = [report('LOW'), report('HIGH')]
    const snap = [...reports]
    preflightGate(reports, 'HIGH')
    expect(reports).toEqual(snap)
  })

  it('fallback target name when worst.target.name is missing', () => {
    const r = report('HIGH')
    delete r.target
    const d = preflightGate([r], 'HIGH')
    expect(d.reason).toContain('<unknown symbol>')
  })
})
