import React, { useState } from 'react'
import { buildBezierPath, getConnectionColor } from '../../utils/workflow'

// ---------------------------------------------------------------------------
// WorkflowConnection
// ---------------------------------------------------------------------------

/**
 * SVG connection path between two workflow nodes.
 *
 * Props:
 * - fromNode   {object}    source node ({ id, x, y, status, ... })
 * - toNode     {object}    target node ({ id, x, y, status, ... })
 * - connection {object}    { id, from, to }
 * - onDelete   {function}  callback to remove this connection
 */

const NODE_WIDTH = 180
// Handle Y offset from node top — matches the fixed `top-[34px]` in WorkflowNode
// Handle center = 34px (top offset) + 7px (half of 14px handle height) = 41px
const HANDLE_CENTER_Y = 41

function getOutputPoint(node) {
  return {
    x: node.x + NODE_WIDTH + 7, // right handle position
    y: node.y + HANDLE_CENTER_Y,
  }
}

function getInputPoint(node) {
  return {
    x: node.x - 7, // left handle position
    y: node.y + HANDLE_CENTER_Y,
  }
}

export default function WorkflowConnection({ fromNode, toNode, connection, onDelete }) {
  const [hovered, setHovered] = useState(false)

  if (!fromNode || !toNode) return null

  const start = getOutputPoint(fromNode)
  const end = getInputPoint(toNode)
  const pathD = buildBezierPath(start.x, start.y, end.x, end.y)

  const baseColor = getConnectionColor(fromNode, toNode)
  const strokeColor = hovered ? '#3b82f6' : baseColor

  // Midpoint for delete button
  const midX = (start.x + end.x) / 2
  const midY = (start.y + end.y) / 2

  // Animated dash for running state
  const isFlowing =
    fromNode.status === 'running' ||
    toNode.status === 'running' ||
    (fromNode.status === 'success' && toNode.status === 'running')

  return (
    <g onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      {/* Invisible wider hit area for hover */}
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
        strokeWidth={hovered ? 3 : 2}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={isFlowing ? '8 4' : 'none'}
        className="transition-colors duration-200"
        style={
          isFlowing
            ? {
                animation: 'dash-flow 0.6s linear infinite',
              }
            : undefined
        }
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
      {hovered && (
        <g
          className="cursor-pointer"
          onClick={(e) => {
            e.stopPropagation()
            onDelete?.(connection)
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
          {/* X icon */}
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

      {/* Inline keyframes for dash animation */}
      <style>{`
        @keyframes dash-flow {
          to { stroke-dashoffset: -12; }
        }
      `}</style>
    </g>
  )
}
