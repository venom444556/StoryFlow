import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'

// Mock the feature module hook — we control enabled/ready/module per test.
vi.mock('../index.js', () => ({
  useCodeIntelligence: vi.fn(),
}))

// Mock the graph-renderer — jsdom has no canvas, and we're testing the page,
// not the renderer itself.
vi.mock('../../../../modules/code-intel/graph-renderer/src/index.js', () => ({
  default: (props) => (
    <div
      data-testid="graph-renderer-mock"
      data-node-count={props.nodes?.length ?? 0}
      data-edge-count={props.edges?.length ?? 0}
      data-theme={props.theme}
    />
  ),
}))

import CodebaseMapPage from './CodebaseMapPage.jsx'
import { useCodeIntelligence } from '../index.js'

const FIXTURE = {
  nodes: [
    { id: 'a', label: 'A', cluster: 'core' },
    { id: 'b', label: 'B', cluster: 'core' },
    { id: 'c', label: 'C', cluster: 'ui' },
  ],
  edges: [
    { source: 'a', target: 'b' },
    { source: 'b', target: 'c' },
  ],
  clusters: [
    { id: 'core', label: 'core' },
    { id: 'ui', label: 'ui' },
  ],
}

describe('CodebaseMapPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the empty state when the feature is disabled', () => {
    useCodeIntelligence.mockReturnValue({
      enabled: false,
      ready: true,
      error: null,
      module: null,
    })

    render(<CodebaseMapPage />)

    expect(screen.getByTestId('codebase-map-disabled')).toBeInTheDocument()
    expect(
      screen.getByText(/Code Intelligence is not enabled for this project/i)
    ).toBeInTheDocument()
    expect(screen.getByText(/code-intelligence\.example\.json/i)).toBeInTheDocument()
    expect(screen.queryByTestId('graph-renderer-mock')).not.toBeInTheDocument()
  })

  it('renders a loading indicator initially when enabled', () => {
    // fetchGraphData returns a pending promise so the page stays in the loading branch.
    const pending = new Promise(() => {})
    const module = { fetchGraphData: vi.fn(() => pending) }

    useCodeIntelligence.mockReturnValue({
      enabled: true,
      ready: true,
      error: null,
      module,
    })

    render(<CodebaseMapPage />)

    expect(screen.getByTestId('codebase-map-loading')).toBeInTheDocument()
    expect(module.fetchGraphData).toHaveBeenCalledTimes(1)
  })

  it('renders the graph-renderer with fixture data when the module resolves', async () => {
    const module = {
      fetchGraphData: vi.fn().mockResolvedValue(FIXTURE),
    }

    useCodeIntelligence.mockReturnValue({
      enabled: true,
      ready: true,
      error: null,
      module,
    })

    render(<CodebaseMapPage />)

    await waitFor(() => {
      expect(screen.getByTestId('graph-renderer-mock')).toBeInTheDocument()
    })

    const renderer = screen.getByTestId('graph-renderer-mock')
    expect(renderer).toHaveAttribute('data-node-count', '3')
    expect(renderer).toHaveAttribute('data-edge-count', '2')
    expect(renderer).toHaveAttribute('data-theme', 'obsidian-dark')
    expect(screen.getByTestId('codebase-map-page')).toBeInTheDocument()
  })

  it('renders the error state with a retry button when fetchGraphData rejects', async () => {
    const module = {
      fetchGraphData: vi
        .fn()
        .mockRejectedValueOnce(new Error('boom'))
        .mockResolvedValueOnce(FIXTURE),
    }

    useCodeIntelligence.mockReturnValue({
      enabled: true,
      ready: true,
      error: null,
      module,
    })

    render(<CodebaseMapPage />)

    await waitFor(() => {
      expect(screen.getByTestId('codebase-map-error')).toBeInTheDocument()
    })
    expect(screen.getByText(/boom/)).toBeInTheDocument()

    // Retry button should re-invoke fetchGraphData and recover on success.
    const retry = screen.getByRole('button', { name: /retry/i })
    fireEvent.click(retry)

    await waitFor(() => {
      expect(screen.getByTestId('graph-renderer-mock')).toBeInTheDocument()
    })
    expect(module.fetchGraphData).toHaveBeenCalledTimes(2)
  })
})
