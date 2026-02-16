import { useMemo } from 'react'
import { parseISO, differenceInDays, addDays, subDays, min, max } from 'date-fns'
import { Calendar } from 'lucide-react'
import GlassCard from '../ui/GlassCard'
import EmptyState from '../ui/EmptyState'
import GanttTimeAxis from './GanttTimeAxis'
import GanttBar from './GanttBar'
import GanttMilestone from './GanttMilestone'

const LABEL_WIDTH = 160
const ROW_HEIGHT = 44
const HEADER_HEIGHT = 36
const BOTTOM_PADDING = 20
const RIGHT_PADDING = 60

export default function GanttChart({
  phases = [],
  milestones = [],
  onPhaseClick,
  onMilestoneClick,
  timeScale = 'weeks',
}) {
  // Gather all dates to compute range
  const { dateToX, chartWidth, chartHeight, minDate, maxDate, sortedPhases } = useMemo(() => {
    const allDates = []

    const sorted = [...phases]
      .filter((p) => p.startDate && p.endDate)
      .sort((a, b) => a.startDate.localeCompare(b.startDate))

    for (const p of sorted) {
      allDates.push(parseISO(p.startDate))
      allDates.push(parseISO(p.endDate))
    }
    for (const m of milestones) {
      if (m.date) allDates.push(parseISO(m.date))
    }

    if (allDates.length === 0) {
      return {
        dateToX: () => 0,
        chartWidth: 800,
        chartHeight: 200,
        minDate: new Date(),
        maxDate: new Date(),
        sortedPhases: [],
      }
    }

    const earliest = subDays(min(allDates), 7)
    const latest = addDays(max(allDates), 7)
    const totalDays = differenceInDays(latest, earliest) || 1

    const drawWidth = Math.max(800, totalDays * 12)
    const cHeight = HEADER_HEIGHT + sorted.length * ROW_HEIGHT + BOTTOM_PADDING

    const pxPerDay = (drawWidth - LABEL_WIDTH - RIGHT_PADDING) / totalDays

    const toX = (date) => {
      const d = typeof date === 'string' ? parseISO(date) : date
      return LABEL_WIDTH + differenceInDays(d, earliest) * pxPerDay
    }

    return {
      dateToX: toX,
      chartWidth: drawWidth,
      chartHeight: cHeight,
      minDate: earliest,
      maxDate: latest,
      sortedPhases: sorted,
    }
  }, [phases, milestones])

  // No phases with dates — show empty state
  if (sortedPhases.length === 0) {
    return (
      <GlassCard>
        <EmptyState
          icon={Calendar}
          title="No chart data"
          description="Add phases with start and end dates to see the Gantt chart."
        />
      </GlassCard>
    )
  }

  // Map milestones to their row positions
  const milestoneElements = milestones
    .filter((m) => m.date)
    .map((m) => {
      const cx = dateToX(m.date)
      // Find row index by phaseId, default to placing below last row
      let rowIndex = sortedPhases.findIndex((p) => p.id === m.phaseId)
      if (rowIndex < 0) rowIndex = sortedPhases.length - 1
      const cy = HEADER_HEIGHT + rowIndex * ROW_HEIGHT + ROW_HEIGHT / 2
      return { milestone: m, cx, cy }
    })

  return (
    <GlassCard padding="none" className="overflow-hidden">
      <div className="overflow-x-auto">
        <svg
          width={chartWidth}
          height={chartHeight}
          className="select-none"
          style={{ minWidth: '100%' }}
        >
          {/* Header background */}
          <rect
            x={0}
            y={0}
            width={chartWidth}
            height={HEADER_HEIGHT}
            style={{ fill: 'var(--th-panel, rgba(15,23,42,0.6))' }}
          />

          {/* Header bottom border */}
          <line
            x1={0}
            y1={HEADER_HEIGHT}
            x2={chartWidth}
            y2={HEADER_HEIGHT}
            style={{ stroke: 'var(--th-border-hover, rgba(255,255,255,0.12))' }}
            strokeWidth={1}
          />

          {/* Horizontal row separators (skip first — header border handles it) */}
          {sortedPhases.map((_, i) =>
            i > 0 ? (
              <line
                key={`row-line-${i}`}
                x1={0}
                y1={HEADER_HEIGHT + i * ROW_HEIGHT}
                x2={chartWidth}
                y2={HEADER_HEIGHT + i * ROW_HEIGHT}
                style={{ stroke: 'var(--th-border, rgba(255,255,255,0.06))' }}
                strokeWidth={1}
              />
            ) : null
          )}
          {/* Bottom line */}
          <line
            x1={0}
            y1={HEADER_HEIGHT + sortedPhases.length * ROW_HEIGHT}
            x2={chartWidth}
            y2={HEADER_HEIGHT + sortedPhases.length * ROW_HEIGHT}
            style={{ stroke: 'var(--th-border, rgba(255,255,255,0.06))' }}
            strokeWidth={1}
          />

          {/* Left gutter separator */}
          <line
            x1={LABEL_WIDTH}
            y1={0}
            x2={LABEL_WIDTH}
            y2={chartHeight}
            style={{ stroke: 'var(--th-border, rgba(255,255,255,0.06))' }}
            strokeWidth={1}
          />

          {/* Time axis (grid lines + labels + today) */}
          <GanttTimeAxis
            minDate={minDate}
            maxDate={maxDate}
            dateToX={dateToX}
            timeScale={timeScale}
            chartHeight={HEADER_HEIGHT + sortedPhases.length * ROW_HEIGHT}
            headerHeight={HEADER_HEIGHT}
            labelWidth={LABEL_WIDTH}
          />

          {/* Phase bars */}
          {sortedPhases.map((phase, i) => (
            <GanttBar
              key={phase.id}
              phase={phase}
              rowIndex={i}
              rowHeight={ROW_HEIGHT}
              dateToX={dateToX}
              labelWidth={LABEL_WIDTH}
              headerHeight={HEADER_HEIGHT}
              onPhaseClick={onPhaseClick}
            />
          ))}

          {/* Milestones */}
          {milestoneElements.map(({ milestone, cx, cy }) => (
            <GanttMilestone
              key={milestone.id}
              milestone={milestone}
              cx={cx}
              cy={cy}
              onMilestoneClick={onMilestoneClick}
            />
          ))}
        </svg>
      </div>
    </GlassCard>
  )
}
