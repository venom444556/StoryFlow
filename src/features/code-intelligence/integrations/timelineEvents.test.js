import { describe, it, expect } from 'vitest'
import {
  createIndexRefreshedEvent,
  createBlastRadiusWarningEvent,
  createChangeDetectedEvent,
  isCodeIntelEvent,
  renderMeta,
  INDEX_REFRESHED,
  BLAST_RADIUS_WARNING,
  CHANGE_DETECTED,
} from './timelineEvents.js'

describe('createIndexRefreshedEvent', () => {
  it('creates event with correct type tag and fields', () => {
    const ev = createIndexRefreshedEvent({
      symbolCount: 1204,
      clusterCount: 18,
      headSha: 'abc123',
      headMessage: 'feat: refactor auth',
    })
    expect(ev.type).toBe(INDEX_REFRESHED)
    expect(ev.symbolCount).toBe(1204)
    expect(ev.clusterCount).toBe(18)
    expect(ev.headSha).toBe('abc123')
    expect(ev.headMessage).toBe('feat: refactor auth')
    expect(typeof ev.at).toBe('string')
  })
})

describe('createBlastRadiusWarningEvent', () => {
  it('creates event with correct type tag and stringifies non-string snapshots', () => {
    const snapshot = { blastRadius: 'CRITICAL', callsiteCount: 87 }
    const ev = createBlastRadiusWarningEvent({
      issueKey: 'SC-42',
      callsites: 87,
      affectedClusters: ['auth', 'billing'],
      reportSnapshot: snapshot,
    })
    expect(ev.type).toBe(BLAST_RADIUS_WARNING)
    expect(ev.issueKey).toBe('SC-42')
    expect(ev.callsites).toBe(87)
    expect(ev.affectedClusters).toEqual(['auth', 'billing'])
    expect(typeof ev.reportSnapshot).toBe('string')
    expect(JSON.parse(ev.reportSnapshot)).toEqual(snapshot)
  })

  it('preserves already-stringified snapshots', () => {
    const ev = createBlastRadiusWarningEvent({
      issueKey: 'SC-5',
      callsites: 3,
      affectedClusters: [],
      reportSnapshot: '{"already":"json"}',
    })
    expect(ev.reportSnapshot).toBe('{"already":"json"}')
  })
})

describe('createChangeDetectedEvent', () => {
  it('creates event with correct type tag and fields', () => {
    const ev = createChangeDetectedEvent({
      changedFileCount: 12,
      affectedClusters: ['core'],
      recommendation: 'Refresh index',
    })
    expect(ev.type).toBe(CHANGE_DETECTED)
    expect(ev.changedFileCount).toBe(12)
    expect(ev.affectedClusters).toEqual(['core'])
    expect(ev.recommendation).toBe('Refresh index')
  })
})

describe('isCodeIntelEvent', () => {
  it('recognizes all three code-intel types', () => {
    expect(isCodeIntelEvent({ type: INDEX_REFRESHED })).toBe(true)
    expect(isCodeIntelEvent({ type: BLAST_RADIUS_WARNING })).toBe(true)
    expect(isCodeIntelEvent({ type: CHANGE_DETECTED })).toBe(true)
  })

  it('rejects other event types and non-objects', () => {
    expect(isCodeIntelEvent({ type: 'milestone-completed' })).toBe(false)
    expect(isCodeIntelEvent({})).toBe(false)
    expect(isCodeIntelEvent(null)).toBe(false)
    expect(isCodeIntelEvent('string')).toBe(false)
  })
})

describe('renderMeta', () => {
  it('returns non-empty icon/color/label for each code-intel type', () => {
    for (const type of [INDEX_REFRESHED, BLAST_RADIUS_WARNING, CHANGE_DETECTED]) {
      const meta = renderMeta({ type })
      expect(meta.icon).toBeTruthy()
      expect(meta.color).toBeTruthy()
      expect(meta.label).toBeTruthy()
    }
  })

  it('differentiates icons across event types', () => {
    const icons = new Set([
      renderMeta({ type: INDEX_REFRESHED }).icon,
      renderMeta({ type: BLAST_RADIUS_WARNING }).icon,
      renderMeta({ type: CHANGE_DETECTED }).icon,
    ])
    expect(icons.size).toBe(3)
  })

  it('returns fallback for unknown type', () => {
    const meta = renderMeta({ type: 'unknown' })
    expect(meta.icon).toBeTruthy()
    expect(meta.label).toBeTruthy()
  })
})
