import { useMemo } from 'react'
import {
  startOfWeek,
  addWeeks,
  startOfMonth,
  addMonths,
  format,
  isAfter,
  isBefore,
  differenceInDays,
} from 'date-fns'

export default function GanttTimeAxis({
  minDate,
  maxDate,
  dateToX,
  timeScale = 'weeks',
  chartHeight,
  headerHeight,
}) {
  const { ticks, monthHeaders } = useMemo(() => {
    const tickResult = []
    const months = []

    if (timeScale === 'weeks') {
      let cursor = startOfWeek(minDate, { weekStartsOn: 1 })
      while (isBefore(cursor, maxDate) || differenceInDays(cursor, maxDate) === 0) {
        if (isAfter(cursor, minDate) || differenceInDays(cursor, minDate) === 0) {
          tickResult.push({
            date: cursor,
            x: dateToX(cursor),
            label: format(cursor, 'd'),
          })
        }
        cursor = addWeeks(cursor, 1)
      }

      // Build month headers from ticks
      let currentMonth = null
      let monthStart = null
      for (const tick of tickResult) {
        const monthKey = format(tick.date, 'yyyy-MM')
        if (monthKey !== currentMonth) {
          if (currentMonth && monthStart) {
            months.push({
              label: format(monthStart, 'MMMM yyyy'),
              x: dateToX(monthStart),
              endX: tick.x,
            })
          }
          currentMonth = monthKey
          monthStart = tick.date
        }
      }
      if (currentMonth && monthStart) {
        const lastTick = tickResult[tickResult.length - 1]
        months.push({
          label: format(monthStart, 'MMMM yyyy'),
          x: dateToX(monthStart),
          endX: lastTick ? lastTick.x + 80 : dateToX(monthStart) + 80,
        })
      }
    } else {
      let cursor = startOfMonth(minDate)
      while (isBefore(cursor, maxDate) || differenceInDays(cursor, maxDate) === 0) {
        if (isAfter(cursor, minDate) || differenceInDays(cursor, minDate) === 0) {
          tickResult.push({
            date: cursor,
            x: dateToX(cursor),
            label: format(cursor, 'MMM yyyy'),
          })
        }
        cursor = addMonths(cursor, 1)
      }
    }

    return { ticks: tickResult, monthHeaders: months }
  }, [minDate, maxDate, dateToX, timeScale])

  // Today line
  const today = new Date()
  const todayX = dateToX(today)
  const showToday = isAfter(today, minDate) && isBefore(today, maxDate)

  const weekLabelY = timeScale === 'weeks' ? headerHeight - 6 : headerHeight / 2

  return (
    <g>
      {/* Month header band */}
      {timeScale === 'weeks' &&
        monthHeaders.map((m, i) => (
          <g key={`month-${i}`}>
            <text
              x={m.x + 8}
              y={14}
              fontSize={10}
              fontWeight={700}
              fontFamily="Inter, system-ui, sans-serif"
              letterSpacing="0.06em"
              style={{ fill: 'var(--color-fg-default)', textTransform: 'uppercase' }}
            >
              {m.label.toUpperCase()}
            </text>
          </g>
        ))}

      {/* Separator between month and week rows */}
      {timeScale === 'weeks' && (
        <line
          x1={0}
          y1={22}
          x2="100%"
          y2={22}
          style={{ stroke: 'var(--color-border-default)' }}
          strokeWidth={1}
          opacity={0.5}
        />
      )}

      {/* Vertical grid lines + day labels */}
      {ticks.map((tick, i) => (
        <g key={i}>
          <line
            x1={tick.x}
            y1={headerHeight}
            x2={tick.x}
            y2={chartHeight}
            style={{ stroke: 'var(--color-border-default)' }}
            strokeWidth={1}
            opacity={0.4}
          />
          <text
            x={tick.x}
            y={weekLabelY}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={10}
            fontWeight={500}
            fontFamily="Inter, system-ui, sans-serif"
            style={{ fill: 'var(--color-fg-subtle)' }}
          >
            {tick.label}
          </text>
        </g>
      ))}

      {/* Today line */}
      {showToday && (
        <g>
          <line
            x1={todayX}
            y1={headerHeight}
            x2={todayX}
            y2={chartHeight}
            style={{ stroke: 'var(--color-fg-default)' }}
            strokeWidth={2}
            opacity={0.6}
          />
          <rect
            x={todayX - 20}
            y={headerHeight - 16}
            width={40}
            height={16}
            rx={4}
            style={{ fill: 'var(--color-fg-default)' }}
            opacity={0.9}
          />
          <text
            x={todayX}
            y={headerHeight - 8}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={9}
            fontWeight={700}
            fontFamily="Inter, system-ui, sans-serif"
            letterSpacing="0.04em"
            style={{ fill: 'var(--color-bg-primary)' }}
          >
            TODAY
          </text>
        </g>
      )}
    </g>
  )
}
