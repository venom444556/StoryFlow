import { useState } from 'react'
import { TYPE_HEX_COLORS } from './constants'
import { NODE_WIDTH } from '../../utils/canvasConstants'

// ---------------------------------------------------------------------------
// DependencyEdge
// ---------------------------------------------------------------------------
// SVG bezier arrow between two architecture components.
// Arrow goes FROM depender TO dependency (A→B means "A depends on B").
// Connects from the nearest facing sides of each node pair.
// ---------------------------------------------------------------------------
const NODE_HEIGHT_CENTER = 48 // approximate center of a node

// Pick connection ports based on relative node positions so lines connect
// from the sides that face each other instead of always right→left.
function getConnectionPoints(fromNode, toNode) {
  const fromCx = fromNode.x + NODE_WIDTH / 2
  const fromCy = fromNode.y + NODE_HEIGHT_CENTER
  const toCx = toNode.x + NODE_WIDTH / 2
  const toCy = toNode.y + NODE_HEIGHT_CENTER

  const dx = toCx - fromCx
  const dy = toCy - fromCy

  let start, end

  if (Math.abs(dx) >= Math.abs(dy)) {
    // Nodes are more horizontal — connect right→left or left→right
    if (dx >= 0) {
      start = { x: fromNode.x + NODE_WIDTH + 4, y: fromCy }
      end = { x: toNode.x - 4, y: toCy }
    } else {
      start = { x: fromNode.x - 4, y: fromCy }
      end = { x: toNode.x + NODE_WIDTH + 4, y: toCy }
    }
  } else {
    // Nodes are more vertical — connect bottom→top or top→bottom
    if (dy >= 0) {
      start = { x: fromCx, y: fromNode.y + NODE_HEIGHT_CENTER * 2 + 4 }
      end = { x: toCx, y: toNode.y - 4 }
    } else {
      start = { x: fromCx, y: fromNode.y - 4 }
      end = { x: toCx, y: toNode.y + NODE_HEIGHT_CENTER * 2 + 4 }
    }
  }

  return { start, end, isVertical: Math.abs(dy) > Math.abs(dx) }
}

function buildSmartPath(sx, sy, ex, ey, isVertical) {
  if (isVertical) {
    const midY = (sy + ey) / 2
    return `M ${sx} ${sy} C ${sx} ${midY}, ${ex} ${midY}, ${ex} ${ey}`
  }
  const midX = (sx + ex) / 2
  return `M ${sx} ${sy} C ${midX} ${sy}, ${midX} ${ey}, ${ex} ${ey}`
}

export default function DependencyEdge({ fromNode, toNode, sourceType, onDelete, edgeOpacity }) {
  const [hovered, setHovered] = useState(false)

  if (!fromNode || !toNode) return null

  const { start, end, isVertical } = getConnectionPoints(fromNode, toNode)
  const pathD = buildSmartPath(start.x, start.y, end.x, end.y, isVertical)

  const baseColor = TYPE_HEX_COLORS[sourceType] || '#6b7280'
  const strokeColor = hovered ? '#22d3ee' : baseColor

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
            style={{ fill: 'var(--color-bg-base)' }}
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
