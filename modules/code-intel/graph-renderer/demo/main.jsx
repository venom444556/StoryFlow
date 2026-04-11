import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import GraphRenderer from '@storyflow/code-intel-graph-renderer'
import small from './fixtures/small.json'
import medium from './fixtures/medium.json'
import large from './fixtures/large.json'

const FIXTURES = {
  small: { label: 'Small — 10 nodes', data: small },
  medium: { label: 'Medium — 100 nodes', data: medium },
  large: { label: 'Large — 300 nodes', data: large },
}

function App() {
  const [fixtureKey, setFixtureKey] = useState('large')
  const [themeName, setThemeName] = useState('obsidian-dark')
  const [lastClick, setLastClick] = useState(null)

  useEffect(() => {
    document.body.style.background = themeName === 'obsidian-dark' ? '#0b0d12' : '#f7f2e8'
    document.body.style.color = themeName === 'obsidian-dark' ? '#e6e8ee' : '#2a2620'
  }, [themeName])

  const data = FIXTURES[fixtureKey].data

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        padding: 16,
        gap: 12,
        boxSizing: 'border-box',
      }}
    >
      <header style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <strong style={{ fontSize: 16 }}>StoryFlow · code-intel graph-renderer</strong>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          fixture:
          <select value={fixtureKey} onChange={(e) => setFixtureKey(e.target.value)}>
            {Object.entries(FIXTURES).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          theme:
          <select value={themeName} onChange={(e) => setThemeName(e.target.value)}>
            <option value="obsidian-dark">obsidian-dark</option>
            <option value="warm-linen">warm-linen</option>
          </select>
        </label>
        <span style={{ opacity: 0.7, fontSize: 12 }}>
          {data.nodes.length} nodes / {data.edges.length} edges / {data.clusters.length} clusters
        </span>
        {lastClick && <span style={{ opacity: 0.7, fontSize: 12 }}>clicked: {lastClick}</span>}
      </header>
      <div style={{ flex: 1, minHeight: 0 }}>
        <GraphRenderer
          nodes={data.nodes}
          edges={data.edges}
          clusters={data.clusters}
          theme={{ name: themeName }}
          onNodeClick={(n) => setLastClick(`node ${n.id} (${n.label})`)}
          onClusterClick={(id) => setLastClick(`cluster ${id}`)}
        />
      </div>
    </div>
  )
}

createRoot(document.getElementById('root')).render(<App />)
