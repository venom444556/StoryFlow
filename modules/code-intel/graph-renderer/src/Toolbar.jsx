/**
 * Toolbar.jsx — top toolbar with search input and filter pills.
 * Filter pills cover cluster, ticket, blast radius.
 */

import React from 'react'

const BLAST_RADIUS_LEVELS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']

export default function Toolbar({
  searchTerm,
  onSearchChange,
  clusters,
  clusterIndex,
  activeClusterIds,
  onToggleCluster,
  ticketKeys,
  activeTicketKeys,
  onToggleTicket,
  activeBlastRadius,
  onToggleBlastRadius,
}) {
  return (
    <div className="sf-toolbar" data-testid="sf-toolbar">
      <div className="sf-search">
        <span aria-hidden>⌕</span>
        <input
          type="text"
          placeholder="Search nodes…"
          value={searchTerm || ''}
          onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
          data-testid="sf-search-input"
        />
      </div>
      <div className="sf-filter-pills">
        {(clusters || []).slice(0, 8).map((c) => {
          const idx = clusterIndex?.get(c.id) ?? 0
          const active = activeClusterIds?.includes(c.id)
          return (
            <button
              key={c.id}
              type="button"
              className={`sf-pill${active ? ' is-active' : ''}`}
              onClick={() => onToggleCluster && onToggleCluster(c.id)}
              data-testid={`sf-pill-cluster-${c.id}`}
            >
              <span
                className="sf-pill-dot"
                style={{ background: `var(--sf-cluster-${idx % 10})` }}
              />
              {c.name || c.id}
            </button>
          )
        })}
        {(ticketKeys || []).map((k) => {
          const active = activeTicketKeys?.includes(k)
          return (
            <button
              key={k}
              type="button"
              className={`sf-pill${active ? ' is-active' : ''}`}
              onClick={() => onToggleTicket && onToggleTicket(k)}
            >
              #{k}
            </button>
          )
        })}
        {BLAST_RADIUS_LEVELS.map((b) => {
          const active = activeBlastRadius?.includes(b)
          return (
            <button
              key={b}
              type="button"
              className={`sf-pill${active ? ' is-active' : ''}`}
              onClick={() => onToggleBlastRadius && onToggleBlastRadius(b)}
            >
              {b}
            </button>
          )
        })}
      </div>
    </div>
  )
}
