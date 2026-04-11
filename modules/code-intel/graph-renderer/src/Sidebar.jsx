/**
 * Sidebar.jsx — left-side collapsible file-tree derived from the `clusters`
 * prop. Each cluster's member SymbolRefs contain `file` paths; we split on
 * "/" to build a folder tree, color the cluster header with the same swatch
 * used in the graph, and wire a click to onClusterClick.
 */

import React, { useMemo, useState } from 'react'

const CLUSTER_VAR_COUNT = 10

function buildTree(cluster) {
  const root = { name: cluster.name || cluster.id, children: new Map(), files: [] }
  for (const sym of cluster.symbols || []) {
    const file = sym.file || sym.name || ''
    const parts = file.split('/').filter(Boolean)
    if (parts.length === 0) {
      root.files.push({ name: sym.name || file, sym })
      continue
    }
    let node = root
    for (let i = 0; i < parts.length - 1; i++) {
      const seg = parts[i]
      if (!node.children.has(seg)) {
        node.children.set(seg, { name: seg, children: new Map(), files: [] })
      }
      node = node.children.get(seg)
    }
    node.files.push({ name: parts[parts.length - 1], sym })
  }
  return root
}

function TreeFolder({ node, depth }) {
  const [open, setOpen] = useState(depth < 2)
  const childCount = node.children.size + node.files.length
  return (
    <li>
      <div
        className="sf-tree-node is-folder"
        style={{ paddingLeft: depth * 10 + 6 }}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="sf-tree-chevron">{open ? '▾' : '▸'}</span>
        <span>{node.name}</span>
        <span className="sf-tree-count">{childCount}</span>
      </div>
      {open && (
        <ul className="sf-tree-children">
          {[...node.children.values()].map((child) => (
            <TreeFolder key={child.name} node={child} depth={depth + 1} />
          ))}
          {node.files.map((f, i) => (
            <li key={`${f.name}-${i}`}>
              <div className="sf-tree-node" style={{ paddingLeft: (depth + 1) * 10 + 6 }}>
                <span className="sf-tree-chevron" />
                <span>{f.name}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </li>
  )
}

export default function Sidebar({ clusters, clusterIndex, activeClusterIds, onClusterClick }) {
  const trees = useMemo(
    () => (clusters || []).map((c) => ({ cluster: c, tree: buildTree(c) })),
    [clusters]
  )
  const activeSet = activeClusterIds ? new Set(activeClusterIds) : null

  return (
    <aside className="sf-sidebar" data-testid="sf-sidebar">
      <div className="sf-sidebar-header">
        <span>Explorer</span>
        <span>{clusters?.length || 0} clusters</span>
      </div>
      <ul>
        {trees.map(({ cluster, tree }) => {
          const idx = clusterIndex?.get(cluster.id) ?? 0
          const swatch = `var(--sf-cluster-${idx % CLUSTER_VAR_COUNT})`
          const active = activeSet ? activeSet.has(cluster.id) : false
          return (
            <li key={cluster.id}>
              <div
                className={`sf-tree-node is-cluster${active ? ' is-active' : ''}`}
                onClick={() => onClusterClick && onClusterClick(cluster.id)}
                data-testid={`sf-cluster-${cluster.id}`}
              >
                <span className="sf-tree-swatch" style={{ background: swatch }} />
                <span>{cluster.name || cluster.id}</span>
                <span className="sf-tree-count">{cluster.symbols?.length ?? 0}</span>
              </div>
              <ul className="sf-tree-children">
                {[...tree.children.values()].map((child) => (
                  <TreeFolder key={child.name} node={child} depth={1} />
                ))}
              </ul>
            </li>
          )
        })}
      </ul>
    </aside>
  )
}
