import { useState } from 'react'

const DIAMOND_SIZE = 10

export default function GanttMilestone({ milestone, cx, cy, onMilestoneClick }) {
  const [hovered, setHovered] = useState(false)
  const s = DIAMOND_SIZE

  const diamondPath = `M ${cx} ${cy - s} L ${cx + s} ${cy} L ${cx} ${cy + s} L ${cx - s} ${cy} Z`
  const tooltipWidth = Math.min(milestone.name.length * 7 + 24, 260)

  return (
    <g
      className="cursor-pointer"
      onClick={() => onMilestoneClick?.(milestone)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Diamond marker */}
      <path
        d={diamondPath}
        style={{
          fill: milestone.completed ? 'var(--color-fg-muted)' : 'transparent',
          stroke: milestone.completed ? 'var(--color-fg-muted)' : 'var(--color-fg-subtle)',
        }}
        strokeWidth={2}
        opacity={hovered ? 1 : 0.7}
      />

      {/* Tooltip on hover */}
      {hovered && (
        <g>
          <rect
            x={cx - tooltipWidth / 2}
            y={cy - s - 28}
            width={tooltipWidth}
            height={22}
            rx={6}
            style={{ fill: 'var(--color-bg-glass)', stroke: 'var(--color-border-emphasis)' }}
            strokeWidth={1}
          />
          <text
            x={cx}
            y={cy - s - 17}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={11}
            fontWeight={600}
            fontFamily="Inter, system-ui, sans-serif"
            style={{ fill: 'var(--color-fg-default)' }}
          >
            {milestone.name}
          </text>
        </g>
      )}
    </g>
  )
}
