import { useState } from 'react'
import { buildBezierPath } from '../../utils/workflow'
import { TYPE_HEX_COLORS } from './constants'
import { NODE_WIDTH } from '../../utils/canvasConstants'

// ---------------------------------------------------------------------------
// DependencyEdge
// ---------------------------------------------------------------------------
// SVG bezier arrow between two architecture components.
// Adapted from WorkflowConnection but simplified — no execution status.
// Arrow goes FROM depender TO dependency (A→B means "A depends on B").
// ---------------------------------------------------------------------------
const NODE_HEIGHT_CENTER = 40 // approximate center of a node

function getOutputPoint(node) {
  return {
    x: node.x + NODE_WIDTH + 4,
    y: node.y + NODE_HEIGHT_CENTER,
  }
}

function getInputPoint(node) {
  return {
    x: node.x - 4,
    y: node.y + NODE_HEIGHT_CENTER,
  }
}

export default function DependencyEdge({ fromNode, toNode, sourceType, onDelete, edgeOpacity }) {
  const [hovered, setHovered] = useState(false)

  if (!fromNode || !toNode) return null

  // Arrow goes from the depender (fromNode) output to the dependency (toNode) input
  const start = getOutputPoint(fromNode)
  const end = getInputPoint(toNode)
  const pathD = buildBezierPath(start.x, start.y, end.x, end.y)

  const baseColor = TYPE_HEX_COLORS[sourceType] || '#6b7280'
  const strokeColor = hovered ? '#3b82f6' : baseColor

  // Midpoint for delete button
  const midX = (start.x + end.x) / 2
  const midY = (start.y + end.y) / 2

  return (
    <g
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={
        edgeOpacity !== undefined ? { opacity: edgeOpacity, transition: 'opacity 0.2s' } : undefined
      }
    >
      {/* Invisible wider hit area */}
      <path
        d={pathD}
        stroke="transparent"
        strokeWidth="14"
        fill="none"
        className="cursor-pointer"
      />

      {/* Visible path */}
      <path
        d={pathD}
        stroke={strokeColor}
        strokeWidth={hovered ? 2.5 : 1.5}
        fill="none"
        strokeLinecap="round"
        opacity={hovered ? 1 : 0.6}
        className="transition-all duration-200"
      />

      {/* Arrowhead */}
      <circle
        cx={end.x}
        cy={end.y}
        r="3"
        fill={strokeColor}
        className="transition-colors duration-200"
      />

      {/* Delete button at midpoint (shown on hover) */}
      {hovered && onDelete && (
        <g
          className="cursor-pointer"
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
        >
          <circle
            cx={midX}
            cy={midY}
            r="10"
            style={{ fill: 'var(--th-bg)' }}
            stroke="#ef4444"
            strokeWidth="2"
          />
          <line
            x1={midX - 3.5}
            y1={midY - 3.5}
            x2={midX + 3.5}
            y2={midY + 3.5}
            stroke="#ef4444"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <line
            x1={midX + 3.5}
            y1={midY - 3.5}
            x2={midX - 3.5}
            y2={midY + 3.5}
            stroke="#ef4444"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>
      )}
    </g>
  )
}
