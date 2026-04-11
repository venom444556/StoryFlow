import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('./gate.js', () => ({
  runPreflightForIssue: vi.fn(),
}))

import { runPreflightForIssue } from './gate.js'
import { withPreflightGuard, PreflightBlockedError } from './transitionGuard.js'

describe('withPreflightGuard', () => {
  let updateFn
  let getIssue
  const issue = { id: 'iss-1', key: 'SC-1', title: 'Example' }

  beforeEach(() => {
    vi.clearAllMocks()
    updateFn = vi.fn().mockResolvedValue({ ok: true })
    getIssue = vi.fn().mockReturnValue(issue)
  })

  it('passes non-status updates through untouched', async () => {
    const guarded = withPreflightGuard(updateFn, getIssue)
    await guarded('proj', 'iss-1', { title: 'new title' })
    expect(runPreflightForIssue).not.toHaveBeenCalled()
    expect(updateFn).toHaveBeenCalledWith('proj', 'iss-1', { title: 'new title' })
  })

  it('passes status updates to non-"In Progress" values through untouched', async () => {
    const guarded = withPreflightGuard(updateFn, getIssue)
    await guarded('proj', 'iss-1', { status: 'Done' })
    expect(runPreflightForIssue).not.toHaveBeenCalled()
    expect(updateFn).toHaveBeenCalledWith('proj', 'iss-1', { status: 'Done' })
  })

  it('runs the gate on transition to "In Progress"', async () => {
    runPreflightForIssue.mockResolvedValue({
      outcome: 'allow',
      reason: 'ok',
      reports: [],
    })
    const guarded = withPreflightGuard(updateFn, getIssue)
    await guarded('proj', 'iss-1', { status: 'In Progress' })
    expect(getIssue).toHaveBeenCalledWith('iss-1')
    expect(runPreflightForIssue).toHaveBeenCalledWith(issue)
    expect(updateFn).toHaveBeenCalledWith('proj', 'iss-1', { status: 'In Progress' })
  })

  it('throws PreflightBlockedError when the gate blocks', async () => {
    const decision = {
      outcome: 'block',
      reason: 'high-risk',
      reports: [{ symbol: 'foo' }],
    }
    runPreflightForIssue.mockResolvedValue(decision)
    const guarded = withPreflightGuard(updateFn, getIssue)
    await expect(guarded('proj', 'iss-1', { status: 'In Progress' })).rejects.toBeInstanceOf(
      PreflightBlockedError
    )
    expect(updateFn).not.toHaveBeenCalled()

    // Verify the decision is attached on the thrown error
    try {
      await guarded('proj', 'iss-1', { status: 'In Progress' })
    } catch (err) {
      expect(err).toBeInstanceOf(PreflightBlockedError)
      expect(err).toBeInstanceOf(Error)
      expect(err.decision).toEqual(decision)
      expect(err.message).toBe('high-risk')
    }
  })

  it('delegates to the original updateFn when the gate allows', async () => {
    runPreflightForIssue.mockResolvedValue({
      outcome: 'allow',
      reason: 'ok',
      reports: [],
    })
    updateFn.mockResolvedValue({ id: 'iss-1', status: 'In Progress' })
    const guarded = withPreflightGuard(updateFn, getIssue)
    const result = await guarded('proj', 'iss-1', { status: 'In Progress' })
    expect(result).toEqual({ id: 'iss-1', status: 'In Progress' })
    expect(updateFn).toHaveBeenCalledTimes(1)
  })
})
