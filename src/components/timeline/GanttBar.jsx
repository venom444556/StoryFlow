import React from 'react'
import { sanitizeColor } from '../../utils/sanitize'

const BAR_V_PADDING = 10

export default function GanttBar({
  phase,
  rowIndex,
  rowHeight,
  dateToX,
  labelWidth,
  headerHeight = 0,
  onPhaseClick,
}) {
  const rowY = headerHeight + rowIndex * rowHeight
  const barHeight = rowHeight - BAR_V_PADDING * 2
  const barY = rowY + BAR_V_PADDING

  // Calculate bar position from dates
  const hasStart = Boolean(phase.startDate)
  const hasEnd = Boolean(phase.endDate)

  if (!hasStart || !hasEnd) return null

  const x1 = dateToX(phase.startDate)
  const x2 = dateToX(phase.endDate)
  const barWidth = Math.max(x2 - x1, 2)
  const progress = phase.progress || 0
  const fillWidth = barWidth * (progress / 100)
  const color = sanitizeColor(phase.color)

  return (
    <g className="cursor-pointer" onClick={() => onPhaseClick?.(phase)}>
      {/* Row background on hover */}
      <rect
        x={0}
        y={rowY}
        width="100%"
        height={rowHeight}
        fill="transparent"
        className="hover:fill-white/[0.02]"
      />

      {/* Phase label in left gutter */}
      <text
        x={labelWidth - 12}
        y={rowY + rowHeight / 2}
        textAnchor="end"
        dominantBaseline="central"
        fontSize={12}
        fontWeight={600}
        fontFamily="Inter, system-ui, sans-serif"
        style={{ fill: 'var(--th-text-secondary, #94a3b8)' }}
        className="select-none"
      >
        {phase.name.length > 18 ? phase.name.slice(0, 16) + '\u2026' : phase.name}
      </text>

      {/* Background bar */}
      <rect
        x={x1}
        y={barY}
        width={barWidth}
        height={barHeight}
        rx={5}
        ry={5}
        fill={color}
        opacity={0.18}
      />

      {/* Progress fill */}
      {progress > 0 && (
        <rect
          x={x1}
          y={barY}
          width={fillWidth}
          height={barHeight}
          rx={5}
          ry={5}
          fill={color}
          opacity={0.65}
        />
      )}

      {/* Progress text */}
      <text
        x={x1 + barWidth + 8}
        y={rowY + rowHeight / 2}
        dominantBaseline="central"
        fontSize={11}
        fontWeight={500}
        fontFamily="Inter, system-ui, sans-serif"
        style={{ fill: 'var(--th-text-muted, #64748b)' }}
      >
        {progress}%
      </text>
    </g>
  )
}
