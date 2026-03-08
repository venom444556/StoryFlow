import { useMemo } from 'react'

export default function Sparkline({
  data = [],
  width = 120,
  height = 32,
  color = 'var(--accent-default)',
  fillOpacity = 0.15,
  strokeWidth = 1.5,
  className = '',
}) {
  const path = useMemo(() => {
    if (data.length < 2) return null
    const max = Math.max(...data, 1)
    const min = Math.min(...data, 0)
    const range = max - min || 1
    const stepX = width / (data.length - 1)

    const points = data.map((v, i) => ({
      x: i * stepX,
      y: height - ((v - min) / range) * (height - 4) - 2,
    }))

    const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
    const fill = `${line} L${width},${height} L0,${height} Z`

    return { line, fill }
  }, [data, width, height])

  if (!path) {
    return <div className={className} style={{ width, height }} />
  }

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className={className}
      fill="none"
    >
      <path d={path.fill} fill={color} opacity={fillOpacity} />
      <path
        d={path.line}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
