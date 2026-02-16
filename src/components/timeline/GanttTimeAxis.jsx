import React, { useMemo } from 'react'
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
  labelWidth,
}) {
  const ticks = useMemo(() => {
    const result = []

    if (timeScale === 'weeks') {
      let cursor = startOfWeek(minDate, { weekStartsOn: 1 })
      while (isBefore(cursor, maxDate) || differenceInDays(cursor, maxDate) === 0) {
        if (isAfter(cursor, minDate) || differenceInDays(cursor, minDate) === 0) {
          result.push({
            date: cursor,
            x: dateToX(cursor),
            label: format(cursor, 'MMM d'),
          })
        }
        cursor = addWeeks(cursor, 1)
      }
    } else {
      let cursor = startOfMonth(minDate)
      while (isBefore(cursor, maxDate) || differenceInDays(cursor, maxDate) === 0) {
        if (isAfter(cursor, minDate) || differenceInDays(cursor, minDate) === 0) {
          result.push({
            date: cursor,
            x: dateToX(cursor),
            label: format(cursor, 'MMM yyyy'),
          })
        }
        cursor = addMonths(cursor, 1)
      }
    }

    return result
  }, [minDate, maxDate, dateToX, timeScale])

  // Today line
  const today = new Date()
  const todayX = dateToX(today)
  const showToday = isAfter(today, minDate) && isBefore(today, maxDate)

  return (
    <g>
      {/* Vertical grid lines + labels */}
      {ticks.map((tick, i) => (
        <g key={i}>
          <line
            x1={tick.x}
            y1={headerHeight}
            x2={tick.x}
            y2={chartHeight}
            style={{ stroke: 'var(--th-border, rgba(255,255,255,0.06))' }}
            strokeWidth={1}
          />
          <text
            x={tick.x}
            y={headerHeight / 2}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={10}
            fontFamily="Inter, system-ui, sans-serif"
            style={{ fill: 'var(--th-text-muted, #64748b)' }}
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
            stroke="#ef4444"
            strokeWidth={1.5}
            strokeDasharray="4 3"
          />
          <text
            x={todayX}
            y={headerHeight / 2}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={9}
            fontWeight={600}
            fontFamily="Inter, system-ui, sans-serif"
            fill="#ef4444"
          >
            Today
          </text>
        </g>
      )}
    </g>
  )
}
