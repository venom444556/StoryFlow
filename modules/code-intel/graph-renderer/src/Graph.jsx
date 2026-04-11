/**
 * Graph.jsx — main force-directed graph surface.
 *
 * Library choice: d3-force + raw canvas (no react-force-graph-2d).
 * Rationale: react-force-graph-2d is convenient but pulls in a large
 * transitive dep tree (three.js peers, etc). A hand-rolled canvas loop on
 * top of d3-force is ~150 lines, gives us full control over node/edge
 * drawing (curved translucent edges, cluster glow, label fade-in at zoom),
 * and comfortably hits the 300-node / 60fps performance target on a 2020
 * MacBook Air. It also keeps install time fast for the demo.
 *
 * Rendering loop:
 *  - One offscreen d3-force simulation ticks physics.
 *  - A single requestAnimationFrame loop draws to canvas every frame.
 *  - Physics runs until alpha < 0.01, then we stop ticking but keep drawing
 *    only when the viewport or hover state changes (idle = zero CPU).
 *  - Click / drag / zoom are handled directly on the canvas element.
 */

import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  forwardRef,
} from 'react'
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
  forceX,
  forceY,
} from 'd3-force'

const CLUSTER_VAR_COUNT = 10

function clusterColor(clusterIdToIndex, clusterId) {
  const idx = clusterIdToIndex.get(clusterId) ?? 0
  return `var(--sf-cluster-${idx % CLUSTER_VAR_COUNT})`
}

function resolveCssVar(el, name) {
  if (!el) return '#7c5cff'
  const v = getComputedStyle(el).getPropertyValue(name).trim()
  return v || '#7c5cff'
}

/** Apply GraphFilter to a node list. Returns { visibleIds, highlightedIds }. */
function applyFilter(nodes, filter) {
  const visible = new Set()
  const highlighted = new Set()
  const clusterSet = filter?.clusterIds?.length ? new Set(filter.clusterIds) : null
  const term = filter?.searchTerm?.trim().toLowerCase() || null
  for (const n of nodes) {
    if (clusterSet && !clusterSet.has(n.clusterId)) continue
    if (term) {
      const hay = (n.label || n.id || '').toLowerCase()
      if (!hay.includes(term)) continue
      highlighted.add(n.id)
    }
    visible.add(n.id)
  }
  return { visible, highlighted }
}

/**
 * Main graph component.
 */
const Graph = forwardRef(function Graph(
  { nodes, edges, clusters, filter, onNodeClick, rootRef },
  ref
) {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const simRef = useRef(null)
  const rafRef = useRef(0)
  const dirtyRef = useRef(true)
  const viewRef = useRef({ x: 0, y: 0, k: 1 }) // pan/zoom
  const dragStateRef = useRef(null)
  const hoverRef = useRef(null)

  // Cluster id -> palette index, stable across prop updates.
  const clusterIndex = useMemo(() => {
    const m = new Map()
    ;(clusters || []).forEach((c, i) => m.set(c.id, i))
    // Include any cluster ids referenced by nodes that weren't in `clusters`.
    let next = m.size
    for (const n of nodes) {
      if (!m.has(n.clusterId)) m.set(n.clusterId, next++)
    }
    return m
  }, [clusters, nodes])

  // Stable node/edge objects for d3 (it mutates them in place with x/y/vx/vy).
  const simNodesRef = useRef([])
  const simLinksRef = useRef([])

  // Rebuild simulation when topology changes.
  useEffect(() => {
    const simNodes = nodes.map((n) => ({
      ...n,
      x: Math.random() * 200 - 100,
      y: Math.random() * 200 - 100,
    }))
    const byId = new Map(simNodes.map((n) => [n.id, n]))
    const simLinks = edges
      .filter((e) => byId.has(e.source) && byId.has(e.target))
      .map((e) => ({ ...e }))

    // Compute in-degree for sizing.
    const inDeg = new Map()
    for (const l of simLinks) {
      inDeg.set(l.target, (inDeg.get(l.target) || 0) + 1)
    }
    for (const n of simNodes) {
      if (n.size === null || n.size === undefined) {
        const d = inDeg.get(n.id) || 0
        n.radius = 3 + Math.sqrt(d) * 1.6
      } else {
        n.radius = Math.max(2, n.size)
      }
    }

    simNodesRef.current = simNodes
    simLinksRef.current = simLinks

    // Stop prior sim.
    if (simRef.current) simRef.current.stop()

    const sim = forceSimulation(simNodes)
      .force(
        'link',
        forceLink(simLinks)
          .id((d) => d.id)
          .distance((l) => 28 + 8 / (l.weight || 1))
          .strength(0.55)
      )
      .force('charge', forceManyBody().strength(-55).distanceMax(400))
      .force('center', forceCenter(0, 0))
      .force('x', forceX(0).strength(0.04))
      .force('y', forceY(0).strength(0.04))
      .force(
        'collide',
        forceCollide()
          .radius((d) => d.radius + 1.5)
          .iterations(1)
      )
      .alpha(1)
      .alphaDecay(0.03)
      .velocityDecay(0.35)

    sim.on('tick', () => {
      dirtyRef.current = true
    })

    simRef.current = sim
    dirtyRef.current = true

    return () => sim.stop()
  }, [nodes, edges])

  // Resolve colors from CSS variables on the container so themes Just Work.
  const paletteRef = useRef({ clusters: [], edge: '#888', label: '#fff' })
  const refreshPalette = useCallback(() => {
    const host = containerRef.current
    if (!host) return
    paletteRef.current.clusters = Array.from({ length: CLUSTER_VAR_COUNT }, (_, i) =>
      resolveCssVar(host, `--sf-cluster-${i}`)
    )
    paletteRef.current.edge = resolveCssVar(host, '--sf-edge')
    paletteRef.current.edgeHi = resolveCssVar(host, '--sf-edge-hi')
    paletteRef.current.label = resolveCssVar(host, '--sf-node-label')
    paletteRef.current.stroke = resolveCssVar(host, '--sf-node-stroke')
    dirtyRef.current = true
  }, [])

  useLayoutEffect(() => {
    refreshPalette()
  }, [refreshPalette])

  // Observe theme changes on the outer rootRef: just re-read CSS vars.
  useEffect(() => {
    if (!rootRef?.current) return
    const obs = new MutationObserver(() => refreshPalette())
    obs.observe(rootRef.current, { attributes: true, attributeFilter: ['data-theme'] })
    return () => obs.disconnect()
  }, [rootRef, refreshPalette])

  // Filter computed each render.
  const { visible: visibleSet, highlighted: highlightedSet } = useMemo(
    () => applyFilter(nodes, filter),
    [nodes, filter]
  )

  // Canvas resize handling.
  const sizeRef = useRef({ w: 0, h: 0, dpr: 1 })
  useLayoutEffect(() => {
    const canvas = canvasRef.current
    const wrap = canvas?.parentElement
    if (!canvas || !wrap) return
    const ro = new ResizeObserver(() => {
      const rect = wrap.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      canvas.width = Math.max(1, Math.floor(rect.width * dpr))
      canvas.height = Math.max(1, Math.floor(rect.height * dpr))
      canvas.style.width = rect.width + 'px'
      canvas.style.height = rect.height + 'px'
      sizeRef.current = { w: rect.width, h: rect.height, dpr }
      // Reset center so graph stays in view initially.
      if (viewRef.current.x === 0 && viewRef.current.y === 0) {
        viewRef.current = { x: rect.width / 2, y: rect.height / 2, k: 1 }
      }
      dirtyRef.current = true
    })
    ro.observe(wrap)
    return () => ro.disconnect()
  }, [])

  // Draw loop.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const draw = () => {
      rafRef.current = requestAnimationFrame(draw)
      const sim = simRef.current
      const running = sim && sim.alpha() > sim.alphaMin()
      if (!dirtyRef.current && !running) return
      dirtyRef.current = false

      const { w, h, dpr } = sizeRef.current
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)

      const view = viewRef.current
      ctx.save()
      ctx.translate(view.x, view.y)
      ctx.scale(view.k, view.k)

      const simNodes = simNodesRef.current
      const simLinks = simLinksRef.current
      const pal = paletteRef.current
      const showLabels = view.k > 1.4

      // Edges — curved, translucent. Quadratic with small perpendicular offset.
      ctx.lineCap = 'round'
      for (const l of simLinks) {
        const s = typeof l.source === 'object' ? l.source : null
        const t = typeof l.target === 'object' ? l.target : null
        if (!s || !t) continue
        if (!visibleSet.has(s.id) || !visibleSet.has(t.id)) continue
        const weight = l.weight || 1
        ctx.strokeStyle = pal.edge
        ctx.lineWidth = Math.max(0.4, Math.min(2.4, 0.6 + weight * 0.45)) / view.k
        const mx = (s.x + t.x) / 2
        const my = (s.y + t.y) / 2
        const dx = t.x - s.x
        const dy = t.y - s.y
        const len = Math.hypot(dx, dy) || 1
        const nx = -dy / len
        const ny = dx / len
        const curve = Math.min(18, len * 0.15)
        const cx = mx + nx * curve
        const cy = my + ny * curve
        ctx.beginPath()
        ctx.moveTo(s.x, s.y)
        ctx.quadraticCurveTo(cx, cy, t.x, t.y)
        ctx.stroke()
      }

      // Nodes
      for (const n of simNodes) {
        if (!visibleSet.has(n.id)) continue
        const idx = clusterIndex.get(n.clusterId) ?? 0
        const color = pal.clusters[idx % CLUSTER_VAR_COUNT] || '#7c5cff'
        const r = n.radius
        const hovered = hoverRef.current === n.id
        const isHi = highlightedSet.has(n.id)

        // Soft outer glow for bigger/hi nodes
        if (r > 6 || hovered || isHi) {
          const glow = ctx.createRadialGradient(n.x, n.y, r * 0.5, n.x, n.y, r * 3)
          glow.addColorStop(0, color + '88')
          glow.addColorStop(1, color + '00')
          ctx.fillStyle = glow
          ctx.beginPath()
          ctx.arc(n.x, n.y, r * 3, 0, Math.PI * 2)
          ctx.fill()
        }

        ctx.beginPath()
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2)
        ctx.fillStyle = color
        ctx.fill()
        ctx.lineWidth = (hovered || isHi ? 1.8 : 1) / view.k
        ctx.strokeStyle = hovered || isHi ? pal.edgeHi : pal.stroke
        ctx.stroke()

        if (showLabels && n.label) {
          ctx.fillStyle = pal.label
          ctx.font = `${11 / view.k}px -apple-system, sans-serif`
          ctx.textAlign = 'left'
          ctx.textBaseline = 'middle'
          ctx.fillText(n.label, n.x + r + 2 / view.k, n.y)
        }
      }

      ctx.restore()
    }

    rafRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafRef.current)
  }, [visibleSet, highlightedSet, clusterIndex])

  // Pointer interactions
  const toWorld = useCallback((clientX, clientY) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const px = clientX - rect.left
    const py = clientY - rect.top
    const v = viewRef.current
    return { x: (px - v.x) / v.k, y: (py - v.y) / v.k, px, py }
  }, [])

  const pickNode = useCallback(
    (wx, wy) => {
      const simNodes = simNodesRef.current
      // Reverse for top-most-first.
      for (let i = simNodes.length - 1; i >= 0; i--) {
        const n = simNodes[i]
        if (!visibleSet.has(n.id)) continue
        const dx = n.x - wx
        const dy = n.y - wy
        if (dx * dx + dy * dy <= (n.radius + 1) * (n.radius + 1)) return n
      }
      return null
    },
    [visibleSet]
  )

  const onPointerDown = (e) => {
    const { x, y, px, py } = toWorld(e.clientX, e.clientY)
    const picked = pickNode(x, y)
    if (picked) {
      dragStateRef.current = { type: 'node', node: picked, moved: false }
      picked.fx = picked.x
      picked.fy = picked.y
      simRef.current?.alphaTarget(0.15).restart()
    } else {
      dragStateRef.current = {
        type: 'pan',
        startX: px,
        startY: py,
        origX: viewRef.current.x,
        origY: viewRef.current.y,
        moved: false,
      }
    }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e) => {
    const ds = dragStateRef.current
    const { x, y } = toWorld(e.clientX, e.clientY)
    if (!ds) {
      const picked = pickNode(x, y)
      const id = picked ? picked.id : null
      if (hoverRef.current !== id) {
        hoverRef.current = id
        dirtyRef.current = true
        canvasRef.current.style.cursor = id ? 'pointer' : 'grab'
      }
      return
    }
    ds.moved = true
    if (ds.type === 'node') {
      ds.node.fx = x
      ds.node.fy = y
      dirtyRef.current = true
    } else {
      const rect = canvasRef.current.getBoundingClientRect()
      const px = e.clientX - rect.left
      const py = e.clientY - rect.top
      viewRef.current = {
        ...viewRef.current,
        x: ds.origX + (px - ds.startX),
        y: ds.origY + (py - ds.startY),
      }
      dirtyRef.current = true
      canvasRef.current.style.cursor = 'grabbing'
    }
  }

  const onPointerUp = (e) => {
    const ds = dragStateRef.current
    dragStateRef.current = null
    if (!ds) return
    if (ds.type === 'node') {
      ds.node.fx = null
      ds.node.fy = null
      simRef.current?.alphaTarget(0)
      if (!ds.moved && onNodeClick) {
        // Strip sim internals before passing back.
        const { x, y, vx, vy, fx, fy, index, radius, ...pub } = ds.node
        onNodeClick(pub)
      }
    }
    canvasRef.current.style.cursor = 'grab'
  }

  const onWheel = (e) => {
    e.preventDefault()
    const { px, py } = toWorld(e.clientX, e.clientY)
    const v = viewRef.current
    const factor = Math.exp(-e.deltaY * 0.0015)
    const k = Math.max(0.2, Math.min(6, v.k * factor))
    // Keep pointer stable in world space.
    const wx = (px - v.x) / v.k
    const wy = (py - v.y) / v.k
    viewRef.current = { k, x: px - wx * k, y: py - wy * k }
    dirtyRef.current = true
  }

  const fitView = useCallback(() => {
    const simNodes = simNodesRef.current
    if (!simNodes.length) return
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity
    for (const n of simNodes) {
      if (!visibleSet.has(n.id)) continue
      if (n.x < minX) minX = n.x
      if (n.y < minY) minY = n.y
      if (n.x > maxX) maxX = n.x
      if (n.y > maxY) maxY = n.y
    }
    if (!Number.isFinite(minX)) return
    const { w, h } = sizeRef.current
    const pad = 60
    const gw = maxX - minX || 1
    const gh = maxY - minY || 1
    const k = Math.min((w - pad * 2) / gw, (h - pad * 2) / gh, 2.5)
    const cx = (minX + maxX) / 2
    const cy = (minY + maxY) / 2
    viewRef.current = { k, x: w / 2 - cx * k, y: h / 2 - cy * k }
    dirtyRef.current = true
  }, [visibleSet])

  useImperativeHandle(
    ref,
    () => ({
      zoomIn: () => {
        const v = viewRef.current
        const { w, h } = sizeRef.current
        const k = Math.min(6, v.k * 1.25)
        viewRef.current = {
          k,
          x: w / 2 - ((w / 2 - v.x) / v.k) * k,
          y: h / 2 - ((h / 2 - v.y) / v.k) * k,
        }
        dirtyRef.current = true
      },
      zoomOut: () => {
        const v = viewRef.current
        const { w, h } = sizeRef.current
        const k = Math.max(0.2, v.k / 1.25)
        viewRef.current = {
          k,
          x: w / 2 - ((w / 2 - v.x) / v.k) * k,
          y: h / 2 - ((h / 2 - v.y) / v.k) * k,
        }
        dirtyRef.current = true
      },
      fit: fitView,
      reset: () => {
        const { w, h } = sizeRef.current
        viewRef.current = { x: w / 2, y: h / 2, k: 1 }
        dirtyRef.current = true
        simRef.current?.alpha(0.6).restart()
      },
    }),
    [fitView]
  )

  return (
    <div className="sf-canvas-wrap" ref={containerRef}>
      <canvas
        ref={canvasRef}
        className="sf-canvas"
        data-testid="sf-graph-canvas"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={onWheel}
      />
      {nodes.length === 0 && <div className="sf-empty">no nodes</div>}
    </div>
  )
})

export default Graph
