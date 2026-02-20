// ---------------------------------------------------------------------------
// Auto-layout algorithm for architecture dependency graph
// ---------------------------------------------------------------------------
// Uses a layered (Sugiyama-style) layout based on dependency depth.
// Topological sort assigns layers, then nodes within each layer are
// spaced vertically.
// ---------------------------------------------------------------------------

import { NODE_WIDTH } from '../../utils/canvasConstants'
const NODE_HEIGHT = 80
const HORIZONTAL_GAP = 100
const VERTICAL_GAP = 40
const GRID_SIZE = 20

function snapToGrid(value) {
  return Math.round(value / GRID_SIZE) * GRID_SIZE
}

/**
 * Auto-layout components into a layered dependency graph.
 *
 * @param {Array<{ id: string, dependencies: string[] }>} components
 * @returns {Map<string, { x: number, y: number }>} position map
 */
export function autoLayout(components) {
  const positions = new Map()

  if (components.length === 0) return positions

  // Build adjacency: component → things it depends on
  const depMap = new Map()
  const idSet = new Set(components.map((c) => c.id))

  components.forEach((c) => {
    const validDeps = (c.dependencies || []).filter((d) => idSet.has(d))
    depMap.set(c.id, validDeps)
  })

  // Assign layers via modified topological sort (Kahn's algorithm)
  // Layer 0 = components with no dependencies
  const inDegree = new Map()
  components.forEach((c) => inDegree.set(c.id, 0))
  components.forEach((c) => {
    ;(c.dependencies || []).forEach((depId) => {
      if (idSet.has(depId)) {
        inDegree.set(depId, (inDegree.get(depId) || 0) + 1)
      }
    })
  })

  // Note: We want dependencies to appear to the LEFT (earlier layers).
  // A depends on B means B should be in an earlier layer.
  // So we reverse: B has "inDegree" from A. Layer 0 has things depended on but not depending.

  // Actually, let's think about this differently:
  // We want: if A depends on B, B is to the left of A.
  // So build a graph where edges go FROM dependency TO depender.
  // inDegree of a node = number of things it depends on.

  const dependsOnCount = new Map()
  components.forEach((c) => {
    const validDeps = (c.dependencies || []).filter((d) => idSet.has(d))
    dependsOnCount.set(c.id, validDeps.length)
  })

  // Build reverse adjacency: for each dep, who depends on it
  const dependedBy = new Map()
  components.forEach((c) => dependedBy.set(c.id, []))
  components.forEach((c) => {
    ;(c.dependencies || []).forEach((depId) => {
      if (idSet.has(depId) && dependedBy.has(depId)) {
        dependedBy.get(depId).push(c.id)
      }
    })
  })

  const layers = new Map() // id → layer number
  const queue = []

  // Start with nodes that depend on nothing
  components.forEach((c) => {
    if (dependsOnCount.get(c.id) === 0) {
      queue.push(c.id)
      layers.set(c.id, 0)
    }
  })

  let maxLayer = 0
  while (queue.length > 0) {
    const current = queue.shift()
    const currentLayer = layers.get(current)

    // Process nodes that depend on `current`
    for (const depender of dependedBy.get(current) || []) {
      const newLayer = currentLayer + 1
      const existing = layers.get(depender)
      if (existing === undefined || newLayer > existing) {
        layers.set(depender, newLayer)
        if (newLayer > maxLayer) maxLayer = newLayer
      }
      dependsOnCount.set(depender, dependsOnCount.get(depender) - 1)
      if (dependsOnCount.get(depender) === 0) {
        queue.push(depender)
      }
    }
  }

  // Assign unplaced nodes (cycles or disconnected) to layer maxLayer + 1
  components.forEach((c) => {
    if (!layers.has(c.id)) {
      layers.set(c.id, maxLayer + 1)
    }
  })

  // Group by layer
  const layerGroups = new Map()
  components.forEach((c) => {
    const layer = layers.get(c.id)
    if (!layerGroups.has(layer)) layerGroups.set(layer, [])
    layerGroups.get(layer).push(c.id)
  })

  // Position each layer
  for (const [layer, nodeIds] of layerGroups) {
    const x = snapToGrid(60 + layer * (NODE_WIDTH + HORIZONTAL_GAP))
    const totalHeight = nodeIds.length * NODE_HEIGHT + (nodeIds.length - 1) * VERTICAL_GAP
    const startY = snapToGrid(Math.max(60, 200 - totalHeight / 2))

    nodeIds.forEach((id, index) => {
      const y = snapToGrid(startY + index * (NODE_HEIGHT + VERTICAL_GAP))
      positions.set(id, { x, y })
    })
  }

  return positions
}
