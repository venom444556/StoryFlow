import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import GraphRenderer from '../src/GraphRenderer.jsx'

const minimal = {
  nodes: [
    { id: 'a', label: 'A', clusterId: 'c1', symbol: { name: 'a', file: 'src/a.js' } },
    { id: 'b', label: 'B', clusterId: 'c1', symbol: { name: 'b', file: 'src/b.js' } },
    { id: 'c', label: 'C', clusterId: 'c2', symbol: { name: 'c', file: 'src/c.js' } },
  ],
  edges: [
    { source: 'a', target: 'b', weight: 1 },
    { source: 'b', target: 'c', weight: 2 },
  ],
  clusters: [
    {
      id: 'c1',
      name: 'cluster one',
      symbols: [
        { name: 'a', file: 'src/a.js' },
        { name: 'b', file: 'src/b.js' },
      ],
      callsiteCount: 2,
    },
    { id: 'c2', name: 'cluster two', symbols: [{ name: 'c', file: 'src/c.js' }], callsiteCount: 1 },
  ],
}

describe('GraphRenderer — contract', () => {
  it('renders without crashing given a minimal props fixture (3 nodes, 2 edges, 1+ cluster)', () => {
    render(<GraphRenderer {...minimal} />)
    expect(screen.getByTestId('sf-graph-renderer')).toBeInTheDocument()
    expect(screen.getByTestId('sf-graph-canvas')).toBeInTheDocument()
    expect(screen.getByTestId('sf-sidebar')).toBeInTheDocument()
    expect(screen.getByTestId('sf-toolbar')).toBeInTheDocument()
    expect(screen.getByTestId('sf-viewport-controls')).toBeInTheDocument()
  })

  it('renders 300 nodes + 600 edges without throwing', async () => {
    const nodes = []
    for (let i = 0; i < 300; i++) {
      nodes.push({
        id: `n${i}`,
        label: `n${i}`,
        clusterId: `c${i % 10}`,
        symbol: { name: `sym${i}`, file: `src/dir${i % 5}/f${i}.js` },
      })
    }
    const edges = []
    for (let i = 0; i < 600; i++) {
      edges.push({
        source: `n${i % 300}`,
        target: `n${(i * 7 + 3) % 300}`,
        weight: 1 + (i % 3),
      })
    }
    const clusters = Array.from({ length: 10 }, (_, i) => ({
      id: `c${i}`,
      name: `cluster-${i}`,
      symbols: nodes.filter((n) => n.clusterId === `c${i}`).map((n) => n.symbol),
      callsiteCount: 0,
    }))
    expect(() =>
      render(<GraphRenderer nodes={nodes} edges={edges} clusters={clusters} />)
    ).not.toThrow()
    expect(screen.getByTestId('sf-graph-canvas')).toBeInTheDocument()
  })

  it('applies theme via data-theme attribute without remounting', () => {
    const { rerender, getByTestId } = render(
      <GraphRenderer {...minimal} theme={{ name: 'obsidian-dark' }} />
    )
    const root = getByTestId('sf-graph-renderer')
    const canvasBefore = getByTestId('sf-graph-canvas')
    expect(root).toHaveAttribute('data-theme', 'obsidian-dark')

    rerender(<GraphRenderer {...minimal} theme={{ name: 'warm-linen' }} />)
    const root2 = getByTestId('sf-graph-renderer')
    const canvasAfter = getByTestId('sf-graph-canvas')
    expect(root2).toHaveAttribute('data-theme', 'warm-linen')
    // Same canvas DOM node proves no remount.
    expect(canvasAfter).toBe(canvasBefore)
  })

  it('defaults to obsidian-dark theme', () => {
    render(<GraphRenderer {...minimal} />)
    expect(screen.getByTestId('sf-graph-renderer')).toHaveAttribute('data-theme', 'obsidian-dark')
  })
})
