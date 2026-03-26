import { format, parseISO } from 'date-fns'

const BAR_V_PADDING = 10
const BAR_RADIUS = 6
const FALLBACK_COLOR = '#a8a29e'

export default function GanttBar({
  phase,
  rowIndex,
  rowHeight,
  dateToX,
  _labelWidth,
  headerHeight = 0,
  onPhaseClick,
}) {
  const rowY = headerHeight + rowIndex * rowHeight
  const barHeight = rowHeight - BAR_V_PADDING * 2
  const barY = rowY + BAR_V_PADDING

  if (!phase.startDate && !phase.endDate) return null

  const sDate = phase.startDate || phase.endDate
  const eDate = phase.endDate || phase.startDate

  const x1 = dateToX(sDate)
  const x2 = dateToX(eDate)
  const barWidth = Math.max(x2 - x1, 8)
  const progress = phase.progress || 0
  const fillWidth = barWidth * (progress / 100)

  const isComplete = phase.status === 'completed' || progress === 100
  const isInProgress = phase.status === 'in-progress' || (progress > 0 && progress < 100)

  const phaseColor = phase.color || FALLBACK_COLOR

  // Date range label
  const startLabel = format(parseISO(sDate), 'MMM d')
  const endLabel = format(parseISO(eDate), 'MMM d')
  const dateRange = startLabel === endLabel ? startLabel : `${startLabel} – ${endLabel}`

  const statusLabel = isComplete ? 'Complete' : isInProgress ? `${progress}%` : 'Upcoming'

  return (
    <g className="cursor-pointer" onClick={() => onPhaseClick?.(phase)}>
      {/* Row hover highlight */}
      <rect
        x={0}
        y={rowY}
        width="100%"
        height={rowHeight}
        fill="transparent"
        className="hover:fill-white/[0.03]"
      />

      {/* Color dot */}
      <circle
        cx={20}
        cy={rowY + rowHeight / 2 - 6}
        r={5}
        fill={phaseColor}
        opacity={isComplete ? 0.4 : 0.8}
      />

      {/* Phase name */}
      <text
        x={32}
        y={rowY + rowHeight / 2 - 6}
        dominantBaseline="central"
        fontSize={13}
        fontWeight={600}
        fontFamily="Inter, system-ui, sans-serif"
        style={{ fill: isComplete ? 'var(--color-fg-subtle)' : 'var(--color-fg-default)' }}
        className="select-none"
      >
        {phase.name}
      </text>

      {/* Date range below name */}
      <text
        x={32}
        y={rowY + rowHeight / 2 + 10}
        dominantBaseline="central"
        fontSize={10}
        fontWeight={400}
        fontFamily="Inter, system-ui, sans-serif"
        style={{ fill: 'var(--color-fg-subtle)' }}
        className="select-none"
      >
        {dateRange}
      </text>

      {/* Background track */}
      <rect
        x={x1}
        y={barY}
        width={barWidth}
        height={barHeight}
        rx={BAR_RADIUS}
        ry={BAR_RADIUS}
        fill={phaseColor}
        opacity={isComplete ? 0.06 : 0.1}
      />

      {/* Progress fill */}
      {progress > 0 && (
        <rect
          x={x1}
          y={barY}
          width={Math.min(fillWidth, barWidth)}
          height={barHeight}
          rx={BAR_RADIUS}
          ry={BAR_RADIUS}
          fill={phaseColor}
          opacity={isComplete ? 0.2 : 0.4}
        />
      )}

      {/* Bar border */}
      <rect
        x={x1}
        y={barY}
        width={barWidth}
        height={barHeight}
        rx={BAR_RADIUS}
        ry={BAR_RADIUS}
        fill="none"
        stroke={phaseColor}
        strokeWidth={1}
        opacity={isComplete ? 0.2 : 0.5}
      />

      {/* Status label */}
      <text
        x={x1 + barWidth + 12}
        y={rowY + rowHeight / 2}
        dominantBaseline="central"
        fontSize={11}
        fontWeight={600}
        fontFamily="Inter, system-ui, sans-serif"
        style={{ fill: isComplete ? 'var(--color-fg-subtle)' : 'var(--color-fg-muted)' }}
      >
        {statusLabel}
      </text>
    </g>
  )
}
