import { useState } from 'react'
import { sanitizeColor } from '../../utils/sanitize'

const DIAMOND_SIZE = 8

export default function GanttMilestone({ milestone, cx, cy, onMilestoneClick }) {
  const [hovered, setHovered] = useState(false)
  const color = sanitizeColor(milestone.color, '#f59e0b')
  const s = DIAMOND_SIZE

  // Diamond path centered at (cx, cy)
  const diamondPath = `M ${cx} ${cy - s} L ${cx + s} ${cy} L ${cx} ${cy + s} L ${cx - s} ${cy} Z`

  return (
    <g
      className="cursor-pointer"
      onClick={() => onMilestoneClick?.(milestone)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Diamond */}
      <path
        d={diamondPath}
        fill={milestone.completed ? color : 'transparent'}
        stroke={color}
        strokeWidth={2}
        className="transition-transform duration-150"
        style={hovered ? { filter: `drop-shadow(0 0 6px ${color}80)` } : undefined}
      />

      {/* Label (shown on hover) */}
      {hovered && (
        <g>
          {/* Background pill */}
          <rect
            x={cx + s + 6}
            y={cy - 11}
            width={Math.min(milestone.name.length * 6.5 + 16, 160)}
            height={22}
            rx={6}
            style={{ fill: 'var(--th-panel, #1e293b)' }}
            stroke={color}
            strokeWidth={1}
            opacity={0.95}
          />
          <text
            x={cx + s + 14}
            y={cy}
            dominantBaseline="central"
            fontSize={10}
            fontWeight={500}
            fontFamily="Inter, system-ui, sans-serif"
            fill={color}
          >
            {milestone.name.length > 22 ? milestone.name.slice(0, 20) + '\u2026' : milestone.name}
          </text>
        </g>
      )}
    </g>
  )
}
