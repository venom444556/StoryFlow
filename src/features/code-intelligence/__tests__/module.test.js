import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, waitFor, cleanup } from '@testing-library/react'
import React from 'react'

// Mock the HTTP proxy so tests never make real fetch calls. The proxy
// replaces the browser-unsafe gitnexus-client import.
vi.mock('../httpClient.js', () => ({
  createHttpGitNexusProxy: vi.fn(),
}))
vi.mock('../../../../modules/code-intel/impact-engine/src/index.js', () => ({
  analyzeImpact: vi.fn((raw) => ({
    target: raw.target,
    blastRadius: 'LOW',
    callsiteCount: raw.callsiteCount || 0,
    affectedClusterIds: raw.affectedClusters || [],
    affectedServiceCount: raw.affectedServices || 0,
    topCallers: raw.callers || [],
    rationale: 'fixture',
  })),
  preflightGate: vi.fn((reports) => ({
    outcome: 'allow',
    reason: `evaluated ${reports.length}`,
    reports,
  })),
}))
vi.mock('../../../../modules/code-intel/symbol-resolver/src/index.js', () => ({
  createSymbolResolver: vi.fn(() => ({
    resolveTicket: vi.fn(async () => [
      { symbol: { name: 'foo', file: 'a.js' }, confidence: 0.9, reason: 'fixture' },
    ]),
  })),
}))

// Mock config so we can flip enabled on demand.
vi.mock('../config.js', async () => {
  const actual = await vi.importActual('../config.js')
  return {
    ...actual,
    loadConfig: vi.fn(() => ({ enabled: false })),
    isCodeIntelligenceEnabled: vi.fn(() => false),
  }
})

import {
  createCodeIntelligenceModule,
  getCodeIntelligenceModule,
  resetCodeIntelligenceModule,
  clustersToGraphData,
} from '../module.js'
import { useCodeIntelligence } from '../hooks/useCodeIntelligence.js'
import * as configModule from '../config.js'

beforeEach(() => {
  resetCodeIntelligenceModule()
})

afterEach(() => {
  cleanup()
  resetCodeIntelligenceModule()
})

describe('createCodeIntelligenceModule — disabled', () => {
  it('returns an object with the full contract shape', () => {
    const mod = createCodeIntelligenceModule({ enabled: false })
    expect(mod.enabled).toBe(false)
    expect(mod.ready).toBeInstanceOf(Promise)
    expect(typeof mod.analyzeSymbols).toBe('function')
    expect(typeof mod.resolveTicket).toBe('function')
    expect(typeof mod.runPreflight).toBe('function')
    expect(typeof mod.fetchClusterSummary).toBe('function')
    expect(typeof mod.fetchGraphData).toBe('function')
    expect(typeof mod.shutdown).toBe('function')
  })

  it('no-op methods resolve to empty contract values', async () => {
    const mod = createCodeIntelligenceModule({ enabled: false })
    await expect(mod.ready).resolves.toBeUndefined()
    await expect(mod.analyzeSymbols(['x'])).resolves.toEqual([])
    await expect(mod.resolveTicket({ title: 't', description: '' })).resolves.toEqual([])
    await expect(mod.runPreflight({})).resolves.toEqual({
      outcome: 'allow',
      reason: 'code-intelligence disabled',
      reports: [],
    })
    await expect(mod.fetchClusterSummary()).resolves.toEqual({ clusters: [], stats: {} })
    await expect(mod.fetchGraphData()).resolves.toEqual({
      nodes: [],
      edges: [],
      clusters: [],
    })
    await expect(mod.shutdown()).resolves.toBeUndefined()
  })

  it('getCodeIntelligenceModule returns a cached singleton', () => {
    const a = getCodeIntelligenceModule()
    const b = getCodeIntelligenceModule()
    expect(a).toBe(b)
  })
})

describe('createCodeIntelligenceModule — enabled (with injected deps)', () => {
  const enabledConfig = {
    enabled: true,
    gitnexusVersion: '1.5.3',
    repoPath: '/tmp/repo',
    llm: { baseUrl: 'http://localhost:11434/v1', apiKey: 'k', allowOpenRouter: false },
    features: {},
    thresholds: { preflightBlockAt: 'HIGH' },
  }

  function makeFakeClient() {
    return {
      start: vi.fn(async () => {}),
      stop: vi.fn(async () => {}),
      impact: vi.fn(async () => ({
        target: { name: 'foo', file: 'a.js' },
        callers: [],
        callsiteCount: 3,
        affectedClusters: ['c1'],
        affectedServices: 1,
      })),
      search: vi.fn(async () => []),
      listClusters: vi.fn(async () => [
        {
          id: 'c1',
          name: 'Cluster One',
          symbols: [
            { name: 'foo', file: 'a.js' },
            { name: 'bar', file: 'b.js' },
          ],
          callsiteCount: 7,
        },
      ]),
    }
  }

  it('analyzeSymbols pipes through gitnexus.impact + analyzeImpact', async () => {
    const client = makeFakeClient()
    const mod = createCodeIntelligenceModule(enabledConfig, {
      gitnexusFactory: () => client,
      symbolResolverFactory: () => ({ resolveTicket: async () => [] }),
    })
    await mod.ready
    const out = await mod.analyzeSymbols(['foo'])
    expect(client.start).toHaveBeenCalled()
    expect(client.impact).toHaveBeenCalledWith({ symbol: 'foo' })
    expect(out).toHaveLength(1)
    expect(out[0].blastRadius).toBe('LOW')
  })

  it('runPreflight returns "no linked symbols" when issue.codeLinks is empty', async () => {
    const client = makeFakeClient()
    const mod = createCodeIntelligenceModule(enabledConfig, {
      gitnexusFactory: () => client,
      symbolResolverFactory: () => ({ resolveTicket: async () => [] }),
    })
    const decision = await mod.runPreflight({ codeLinks: [] })
    expect(decision.outcome).toBe('allow')
    expect(decision.reason).toMatch(/no linked symbols/i)
  })

  it('runPreflight analyzes each linked symbol and runs the gate', async () => {
    const client = makeFakeClient()
    const mod = createCodeIntelligenceModule(enabledConfig, {
      gitnexusFactory: () => client,
      symbolResolverFactory: () => ({ resolveTicket: async () => [] }),
    })
    const decision = await mod.runPreflight({
      codeLinks: ['foo', { symbol: 'bar' }],
    })
    expect(client.impact).toHaveBeenCalledTimes(2)
    expect(decision.outcome).toBe('allow')
    expect(decision.reports).toHaveLength(2)
  })

  it('fetchGraphData translates clusters to graph nodes/edges', async () => {
    const client = makeFakeClient()
    const mod = createCodeIntelligenceModule(enabledConfig, {
      gitnexusFactory: () => client,
      symbolResolverFactory: () => ({ resolveTicket: async () => [] }),
    })
    const data = await mod.fetchGraphData()
    expect(data.clusters).toHaveLength(1)
    expect(data.nodes).toHaveLength(2)
    expect(data.nodes[0].clusterId).toBe('c1')
    expect(Array.isArray(data.edges)).toBe(true)
  })

  it('shutdown is idempotent and calls client.stop once', async () => {
    const client = makeFakeClient()
    const mod = createCodeIntelligenceModule(enabledConfig, {
      gitnexusFactory: () => client,
      symbolResolverFactory: () => ({ resolveTicket: async () => [] }),
    })
    await mod.ready
    await mod.shutdown()
    await mod.shutdown()
    expect(client.stop).toHaveBeenCalledTimes(1)
  })
})

describe('clustersToGraphData', () => {
  it('returns empty shape for empty input', () => {
    expect(clustersToGraphData([])).toEqual({ nodes: [], edges: [], clusters: [] })
  })

  it('creates one node per symbol and cross-cluster edges for shared files', () => {
    const data = clustersToGraphData([
      {
        id: 'c1',
        name: 'One',
        symbols: [{ name: 'a', file: 'shared.js' }],
        callsiteCount: 1,
      },
      {
        id: 'c2',
        name: 'Two',
        symbols: [{ name: 'b', file: 'shared.js' }],
        callsiteCount: 1,
      },
    ])
    expect(data.nodes).toHaveLength(2)
    expect(data.edges).toHaveLength(1)
    expect(data.edges[0].source).toContain('c1')
    expect(data.edges[0].target).toContain('c2')
  })
})

describe('useCodeIntelligence hook', () => {
  function Probe() {
    const state = useCodeIntelligence()
    return React.createElement(
      'div',
      null,
      React.createElement('span', { 'data-testid': 'enabled' }, String(state.enabled)),
      React.createElement('span', { 'data-testid': 'ready' }, String(state.ready)),
      React.createElement('span', { 'data-testid': 'has-module' }, String(Boolean(state.module)))
    )
  }

  it('renders disabled state cleanly', async () => {
    configModule.loadConfig.mockReturnValue({ enabled: false })
    configModule.isCodeIntelligenceEnabled.mockReturnValue(false)
    resetCodeIntelligenceModule()
    render(React.createElement(Probe))
    expect(screen.getByTestId('enabled').textContent).toBe('false')
    expect(screen.getByTestId('has-module').textContent).toBe('true')
    await waitFor(() => {
      expect(screen.getByTestId('ready').textContent).toBe('true')
    })
  })

  it('renders enabled state once ready promise resolves', async () => {
    configModule.loadConfig.mockReturnValue({
      enabled: true,
      gitnexusVersion: '1.5.3',
      repoPath: '/tmp/repo',
      llm: { baseUrl: 'http://localhost:11434/v1', apiKey: 'k', allowOpenRouter: false },
      features: {},
      thresholds: { preflightBlockAt: 'HIGH' },
    })
    configModule.isCodeIntelligenceEnabled.mockReturnValue(true)

    // Stub the HTTP proxy factory so start() resolves cleanly.
    const httpClient = await import('../httpClient.js')
    httpClient.createHttpGitNexusProxy.mockReturnValue({
      start: async () => {},
      stop: async () => {},
      impact: async () => ({}),
      search: async () => [],
      listClusters: async () => [],
    })

    resetCodeIntelligenceModule()
    render(React.createElement(Probe))
    expect(screen.getByTestId('enabled').textContent).toBe('true')
    await waitFor(() => {
      expect(screen.getByTestId('ready').textContent).toBe('true')
    })
  })
})
