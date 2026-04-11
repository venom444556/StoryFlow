import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../index.js', () => ({
  getCodeIntelligenceModule: vi.fn(),
}))

import { getCodeIntelligenceModule } from '../index.js'
import { runPreflightForIssue } from './gate.js'

describe('runPreflightForIssue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns allow when feature is disabled', async () => {
    getCodeIntelligenceModule.mockReturnValue({
      config: { enabled: false },
      runPreflight: vi.fn(),
    })
    const decision = await runPreflightForIssue({ id: 'abc' })
    expect(decision.outcome).toBe('allow')
    expect(decision.reason).toBe('code-intelligence disabled')
    expect(decision.reports).toEqual([])
  })

  it('returns block when module returns block decision', async () => {
    const blockDecision = {
      outcome: 'block',
      reason: 'high-risk changes',
      reports: [{ symbol: 'foo', severity: 'HIGH' }],
    }
    getCodeIntelligenceModule.mockReturnValue({
      config: { enabled: true },
      runPreflight: vi.fn().mockResolvedValue(blockDecision),
    })
    const decision = await runPreflightForIssue({ id: 'abc' })
    expect(decision).toEqual(blockDecision)
  })

  it('returns allow with error reason when module throws', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    getCodeIntelligenceModule.mockReturnValue({
      config: { enabled: true },
      runPreflight: vi.fn().mockRejectedValue(new Error('boom')),
    })
    const decision = await runPreflightForIssue({ id: 'abc' })
    expect(decision.outcome).toBe('allow')
    expect(decision.reason).toMatch(/preflight errored: boom/)
    expect(decision.reports).toEqual([])
    warnSpy.mockRestore()
  })

  it('fails open when getCodeIntelligenceModule itself throws', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    getCodeIntelligenceModule.mockImplementation(() => {
      throw new Error('bootstrap failed')
    })
    const decision = await runPreflightForIssue({ id: 'abc' })
    expect(decision.outcome).toBe('allow')
    expect(decision.reason).toMatch(/preflight errored: bootstrap failed/)
    warnSpy.mockRestore()
  })
})
