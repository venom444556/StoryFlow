import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'

// Mock the feature module hook — we control enabled/ready/module per test.
vi.mock('../index.js', () => ({
  useCodeIntelligence: vi.fn(),
}))

import CodeTab from './CodeTab.jsx'
import { useCodeIntelligence } from '../index.js'

const BASE_ISSUE = {
  id: 'issue-1',
  key: 'SC-42',
  title: 'Fix auth middleware null deref',
  description: 'Crash when verifying expired tokens in auth.middleware.verify',
}

function makeModule(overrides = {}) {
  return {
    config: {},
    enabled: true,
    ready: Promise.resolve(),
    analyzeSymbols: vi.fn().mockResolvedValue([]),
    resolveTicket: vi.fn().mockResolvedValue([]),
    runPreflight: vi.fn().mockResolvedValue({ outcome: 'allow', reason: '', reports: [] }),
    fetchClusterSummary: vi.fn().mockResolvedValue({ clusters: [], stats: {} }),
    fetchGraphData: vi.fn().mockResolvedValue({ nodes: [], edges: [], clusters: [] }),
    shutdown: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  }
}

describe('CodeTab', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the disabled empty state when feature is off', () => {
    useCodeIntelligence.mockReturnValue({
      enabled: false,
      ready: true,
      error: null,
      module: null,
    })

    render(<CodeTab issue={BASE_ISSUE} />)

    expect(screen.getByTestId('code-tab-disabled')).toBeInTheDocument()
    expect(
      screen.getByText(/Code Intelligence is not enabled for this project/i)
    ).toBeInTheDocument()
    expect(screen.getByText(/code-intelligence\.example\.json/)).toBeInTheDocument()
  })

  it('renders the "Resolve symbols" prompt when issue has no codeLinks', () => {
    useCodeIntelligence.mockReturnValue({
      enabled: true,
      ready: true,
      error: null,
      module: makeModule(),
    })

    render(<CodeTab issue={BASE_ISSUE} />)

    expect(screen.getByTestId('code-tab-no-links')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /resolve symbols from this ticket/i })
    ).toBeInTheDocument()
  })

  it('calls module.resolveTicket and renders candidates when Resolve is clicked', async () => {
    const candidates = [
      {
        symbol: { name: 'auth.middleware.verify', file: 'src/auth/middleware.js', line: 42 },
        confidence: 0.92,
        reason: 'Title match on symbol name',
      },
      {
        symbol: { name: 'auth.middleware.decode', file: 'src/auth/middleware.js', line: 18 },
        confidence: 0.71,
        reason: 'Description mention',
      },
    ]
    const module = makeModule({
      resolveTicket: vi.fn().mockResolvedValue(candidates),
    })

    useCodeIntelligence.mockReturnValue({
      enabled: true,
      ready: true,
      error: null,
      module,
    })

    render(<CodeTab issue={BASE_ISSUE} />)

    fireEvent.click(screen.getByRole('button', { name: /resolve symbols from this ticket/i }))

    await waitFor(() => {
      expect(module.resolveTicket).toHaveBeenCalledTimes(1)
    })
    const callArg = module.resolveTicket.mock.calls[0][0]
    expect(callArg.title).toBe(BASE_ISSUE.title)
    expect(callArg.description).toBe(BASE_ISSUE.description)

    expect(await screen.findByText('auth.middleware.verify')).toBeInTheDocument()
    expect(screen.getByText('auth.middleware.decode')).toBeInTheDocument()
    expect(screen.getByText('92%')).toBeInTheDocument()
    expect(screen.getByText('Title match on symbol name')).toBeInTheDocument()
  })

  it('renders linked symbols with their current impact reports', () => {
    const issue = {
      ...BASE_ISSUE,
      codeLinks: [
        {
          id: 'link-1',
          symbol: { name: 'auth.middleware.verify', file: 'src/auth/middleware.js', line: 42 },
          impact: {
            blastRadius: 'HIGH',
            callsiteCount: 37,
            affectedServiceCount: 3,
            affectedClusterIds: ['auth', 'api'],
            rationale: '37 callsites across 3 services exceeds HIGH threshold.',
          },
        },
      ],
    }

    useCodeIntelligence.mockReturnValue({
      enabled: true,
      ready: true,
      error: null,
      module: makeModule(),
    })

    render(<CodeTab issue={issue} />)

    const row = screen.getByTestId('linked-symbol-row')
    expect(row).toBeInTheDocument()
    expect(screen.getByText('auth.middleware.verify')).toBeInTheDocument()
    expect(screen.getByTestId('inline-impact-badge')).toHaveTextContent(/high/i)
    expect(row.textContent).toMatch(/37 callsites/)
    expect(row.textContent).toMatch(/3 services/)
    expect(row.textContent).toMatch(/2 clusters/)
    expect(screen.getByRole('button', { name: /re-resolve/i })).toBeInTheDocument()
  })

  it('shows an error message when resolveTicket rejects', async () => {
    const module = makeModule({
      resolveTicket: vi.fn().mockRejectedValue(new Error('gitnexus down')),
    })

    useCodeIntelligence.mockReturnValue({
      enabled: true,
      ready: true,
      error: null,
      module,
    })

    render(<CodeTab issue={BASE_ISSUE} />)

    fireEvent.click(screen.getByRole('button', { name: /resolve symbols from this ticket/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/gitnexus down/)
    })
  })
})
