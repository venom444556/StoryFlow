import { useMemo } from 'react'

export default function Minimap({
  nodes = [],
  viewBox = { x: 0, y: 0, width: 1000, height: 800 },
  viewport = { x: 0, y: 0, width: 500, height: 400 },
  width = 160,
  height = 100,
  className = '',
  onViewportChange,
}) {
  const scale = useMemo(() => {
    const sx = width / (viewBox.width || 1)
    const sy = height / (viewBox.height || 1)
    return Math.min(sx, sy)
  }, [width, height, viewBox])

  const miniNodes = useMemo(
    () =>
      nodes.map((n) => ({
        id: n.id,
        x: (n.x - viewBox.x) * scale,
        y: (n.y - viewBox.y) * scale,
        w: Math.max((n.width || 120) * scale, 4),
        h: Math.max((n.height || 40) * scale, 3),
      })),
    [nodes, viewBox, scale]
  )

  const vp = {
    x: (viewport.x - viewBox.x) * scale,
    y: (viewport.y - viewBox.y) * scale,
    w: viewport.width * scale,
    h: viewport.height * scale,
  }

  const handleClick = (e) => {
    if (!onViewportChange) return
    const rect = e.currentTarget.getBoundingClientRect()
    const cx = (e.clientX - rect.left) / scale + viewBox.x
    const cy = (e.clientY - rect.top) / scale + viewBox.y
    onViewportChange({ x: cx - viewport.width / 2, y: cy - viewport.height / 2 })
  }

  return (
    <div
      className={[
        'rounded-[var(--radius-md)] border border-[var(--color-border-muted)]',
        'overflow-hidden',
        className,
      ].join(' ')}
      style={{ width, height, backgroundColor: 'var(--color-bg-glass)' }}
      onClick={handleClick}
    >
      <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height}>
        {miniNodes.map((n) => (
          <rect
            key={n.id}
            x={n.x}
            y={n.y}
            width={n.w}
            height={n.h}
            rx={1}
            fill="var(--color-fg-subtle)"
            opacity={0.5}
          />
        ))}
        <rect
          x={vp.x}
          y={vp.y}
          width={vp.w}
          height={vp.h}
          rx={2}
          fill="none"
          stroke="var(--accent-default)"
          strokeWidth={1.5}
          opacity={0.7}
        />
      </svg>
    </div>
  )
}
