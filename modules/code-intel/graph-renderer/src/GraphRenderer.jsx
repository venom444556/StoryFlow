/**
 * GraphRenderer.jsx — top-level component matching GraphRendererProps in
 * CONTRACTS.md. Composes Sidebar, Toolbar, Graph, and ViewportControls.
 */

import React, { useMemo, useRef, useState, useCallback } from 'react'
import Graph from './Graph.jsx'
import Sidebar from './Sidebar.jsx'
import Toolbar from './Toolbar.jsx'
import './theme/obsidian-dark.css'
import './theme/warm-linen.css'
import './styles.css'

export default function GraphRenderer({
  nodes = [],
  edges = [],
  clusters = [],
  filter,
  onNodeClick,
  onClusterClick,
  theme,
}) {
  const themeName = theme?.name || 'obsidian-dark'
  const rootRef = useRef(null)
  const graphRef = useRef(null)

  // Local filter state overlays external `filter` prop. External prop takes
  // precedence when provided; internal state is used for pills/search when
  // no external filter is given.
  const [internalFilter, setInternalFilter] = useState({})
  const effectiveFilter = useMemo(() => {
    const ext = filter || {}
    return {
      clusterIds: ext.clusterIds ?? internalFilter.clusterIds,
      ticketKeys: ext.ticketKeys ?? internalFilter.ticketKeys,
      blastRadius: ext.blastRadius ?? internalFilter.blastRadius,
      searchTerm: ext.searchTerm ?? internalFilter.searchTerm,
    }
  }, [filter, internalFilter])

  // Stable cluster -> palette index shared by Toolbar/Sidebar/Graph.
  const clusterIndex = useMemo(() => {
    const m = new Map()
    clusters.forEach((c, i) => m.set(c.id, i))
    let next = m.size
    for (const n of nodes) if (!m.has(n.clusterId)) m.set(n.clusterId, next++)
    return m
  }, [clusters, nodes])

  const toggle = (key) => (value) =>
    setInternalFilter((f) => {
      const current = f[key] || []
      const exists = current.includes(value)
      const next = exists ? current.filter((x) => x !== value) : [...current, value]
      return { ...f, [key]: next.length ? next : undefined }
    })

  const handleClusterPill = toggle('clusterIds')
  const handleTicketPill = toggle('ticketKeys')
  const handleBlastRadiusPill = toggle('blastRadius')

  const handleSearch = useCallback(
    (term) => setInternalFilter((f) => ({ ...f, searchTerm: term || undefined })),
    []
  )

  const handleClusterClick = useCallback(
    (id) => {
      if (onClusterClick) onClusterClick(id)
      handleClusterPill(id)
    },
    [onClusterClick]
  )

  return (
    <div
      ref={rootRef}
      className="sf-graph-renderer"
      data-theme={themeName}
      data-testid="sf-graph-renderer"
    >
      <Sidebar
        clusters={clusters}
        clusterIndex={clusterIndex}
        activeClusterIds={effectiveFilter.clusterIds}
        onClusterClick={handleClusterClick}
      />
      <Toolbar
        searchTerm={effectiveFilter.searchTerm}
        onSearchChange={handleSearch}
        clusters={clusters}
        clusterIndex={clusterIndex}
        activeClusterIds={effectiveFilter.clusterIds}
        onToggleCluster={handleClusterPill}
        ticketKeys={[]}
        activeTicketKeys={effectiveFilter.ticketKeys}
        onToggleTicket={handleTicketPill}
        activeBlastRadius={effectiveFilter.blastRadius}
        onToggleBlastRadius={handleBlastRadiusPill}
      />
      <Graph
        ref={graphRef}
        nodes={nodes}
        edges={edges}
        clusters={clusters}
        filter={effectiveFilter}
        onNodeClick={onNodeClick}
        rootRef={rootRef}
      />
      <div className="sf-viewport-controls" data-testid="sf-viewport-controls">
        <button type="button" title="Zoom in" onClick={() => graphRef.current?.zoomIn()}>
          +
        </button>
        <button type="button" title="Zoom out" onClick={() => graphRef.current?.zoomOut()}>
          −
        </button>
        <button type="button" title="Fit" onClick={() => graphRef.current?.fit()}>
          ⊡
        </button>
        <button type="button" title="Reset" onClick={() => graphRef.current?.reset()}>
          ↺
        </button>
      </div>
    </div>
  )
}
