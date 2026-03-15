import { useMemo, useRef, useState, useEffect } from 'react'
import { parseISO, differenceInDays, addDays, subDays, min, max } from 'date-fns'
import { Calendar } from 'lucide-react'
import GlassCard from '../ui/GlassCard'
import EmptyState from '../ui/EmptyState'
import GanttTimeAxis from './GanttTimeAxis'
import GanttBar from './GanttBar'
import GanttMilestone from './GanttMilestone'

const LABEL_WIDTH = 240
const ROW_HEIGHT = 64
const HEADER_HEIGHT = 48
const BOTTOM_PADDING = 24

export default function GanttChart({
  phases = [],
  milestones = [],
  onPhaseClick,
  onMilestoneClick,
  timeScale = 'weeks',
}) {
  const containerRef = useRef(null)
  const [containerWidth, setContainerWidth] = useState(0)

  useEffect(() => {
    if (!containerRef.current) return
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width)
      }
    })
    observer.observe(containerRef.current)
    setContainerWidth(containerRef.current.clientWidth)
    return () => observer.disconnect()
  }, [])

  // Gather all dates to compute range
  const { dateToX, chartWidth, chartHeight, minDate, maxDate, sortedPhases, ready } =
    useMemo(() => {
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
          chartWidth: containerWidth || 800,
          chartHeight: 200,
          minDate: new Date(),
          maxDate: new Date(),
          sortedPhases: [],
          ready: false,
        }
      }

      if (containerWidth === 0) {
        return {
          dateToX: () => 0,
          chartWidth: 800,
          chartHeight: 200,
          minDate: new Date(),
          maxDate: new Date(),
          sortedPhases: sorted,
          ready: false,
        }
      }

      const earliest = subDays(min(allDates), 3)
      const latest = addDays(max(allDates), 3)
      const totalDays = differenceInDays(latest, earliest) || 1

      // Fill the container — bars stretch to the edge of the window
      const drawWidth = Math.max(containerWidth, totalDays * 16)
      const cHeight = HEADER_HEIGHT + sorted.length * ROW_HEIGHT + BOTTOM_PADDING

      const pxPerDay = (drawWidth - LABEL_WIDTH) / totalDays

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
        ready: true,
      }
    }, [phases, milestones, containerWidth])

  // No phases with dates at all — show empty state (no container needed)
  const hasPhasesWithDates = phases.some((p) => p.startDate && p.endDate)
  if (!hasPhasesWithDates) {
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
      const mDate = parseISO(m.date)
      // Try phaseId first, then find the phase whose date range contains this milestone
      let rowIndex = sortedPhases.findIndex((p) => p.id === m.phaseId)
      if (rowIndex < 0) {
        rowIndex = sortedPhases.findIndex(
          (p) =>
            p.startDate &&
            p.endDate &&
            mDate >= parseISO(p.startDate) &&
            mDate <= parseISO(p.endDate)
        )
      }
      // Still no match — find the nearest phase by date proximity
      if (rowIndex < 0) {
        let minDist = Infinity
        sortedPhases.forEach((p, i) => {
          if (!p.endDate) return
          const dist = Math.abs(differenceInDays(mDate, parseISO(p.endDate)))
          if (dist < minDist) {
            minDist = dist
            rowIndex = i
          }
        })
      }
      if (rowIndex < 0) rowIndex = sortedPhases.length - 1
      const cy = HEADER_HEIGHT + rowIndex * ROW_HEIGHT + ROW_HEIGHT / 2
      return { milestone: m, cx, cy }
    })

  return (
    <GlassCard padding="none" className="overflow-hidden">
      <div
        ref={containerRef}
        className="overflow-x-auto"
        style={{ minHeight: ready ? undefined : 100 }}
      >
        {!ready ? null : (
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
              style={{ fill: 'var(--color-bg-glass)' }}
            />

            {/* Header bottom border */}
            <line
              x1={0}
              y1={HEADER_HEIGHT}
              x2={chartWidth}
              y2={HEADER_HEIGHT}
              style={{ stroke: 'var(--color-border-emphasis)' }}
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
                  style={{ stroke: 'var(--color-border-default)' }}
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
              style={{ stroke: 'var(--color-border-default)' }}
              strokeWidth={1}
            />

            {/* Left gutter separator */}
            <line
              x1={LABEL_WIDTH}
              y1={0}
              x2={LABEL_WIDTH}
              y2={chartHeight}
              style={{ stroke: 'var(--color-border-default)' }}
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
        )}
      </div>
    </GlassCard>
  )
}
