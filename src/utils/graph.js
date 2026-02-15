/**
 * Graph utilities for detecting cycles and validating dependencies
 * in architecture components and other directed graph structures.
 */

/**
 * Detect if adding a dependency would create a cycle in the dependency graph.
 * Uses depth-first search to check if target is reachable from source.
 *
 * @param {string} fromId - The component that would have the dependency
 * @param {string} toId - The component being depended on
 * @param {Array} components - Array of components with { id, dependencies: [] }
 * @returns {boolean} - True if adding this dependency would create a cycle
 */
export function wouldCreateCycle(fromId, toId, components) {
  if (fromId === toId) return true

  // Build adjacency list from existing dependencies
  const adjacency = new Map()
  for (const comp of components) {
    adjacency.set(comp.id, comp.dependencies || [])
  }

  // Add the proposed dependency temporarily
  const fromDeps = adjacency.get(fromId) || []
  adjacency.set(fromId, [...fromDeps, toId])

  // DFS to check if fromId is reachable from toId (would indicate a cycle)
  const visited = new Set()
  const stack = [toId]

  while (stack.length > 0) {
    const current = stack.pop()
    if (current === fromId) {
      return true // Found a cycle
    }
    if (visited.has(current)) {
      continue
    }
    visited.add(current)

    const deps = adjacency.get(current) || []
    for (const dep of deps) {
      if (!visited.has(dep)) {
        stack.push(dep)
      }
    }
  }

  return false
}

/**
 * Find all cycles in a dependency graph.
 * Uses Tarjan's algorithm for strongly connected components.
 *
 * @param {Array} components - Array of components with { id, dependencies: [] }
 * @returns {Array<Array<string>>} - Array of cycles, each cycle is an array of component IDs
 */
export function findCycles(components) {
  const adjacency = new Map()
  for (const comp of components) {
    adjacency.set(comp.id, comp.dependencies || [])
  }

  const cycles = []
  const visited = new Set()
  const recursionStack = new Set()
  const path = []

  function dfs(nodeId) {
    visited.add(nodeId)
    recursionStack.add(nodeId)
    path.push(nodeId)

    const deps = adjacency.get(nodeId) || []
    for (const dep of deps) {
      if (!visited.has(dep)) {
        dfs(dep)
      } else if (recursionStack.has(dep)) {
        // Found a cycle - extract it from the path
        const cycleStart = path.indexOf(dep)
        if (cycleStart !== -1) {
          const cycle = path.slice(cycleStart)
          cycles.push(cycle)
        }
      }
    }

    path.pop()
    recursionStack.delete(nodeId)
  }

  for (const comp of components) {
    if (!visited.has(comp.id)) {
      dfs(comp.id)
    }
  }

  return cycles
}

/**
 * Validate that all dependency references point to existing components.
 *
 * @param {Array} components - Array of components with { id, dependencies: [] }
 * @returns {Array<{componentId: string, missingDep: string}>} - Array of invalid references
 */
export function findMissingDependencies(components) {
  const validIds = new Set(components.map((c) => c.id))
  const missing = []

  for (const comp of components) {
    for (const depId of comp.dependencies || []) {
      if (!validIds.has(depId)) {
        missing.push({ componentId: comp.id, missingDep: depId })
      }
    }
  }

  return missing
}

/**
 * Validate that all parent references point to existing components.
 *
 * @param {Array} components - Array of components with { id, parentId }
 * @returns {Array<{componentId: string, missingParent: string}>} - Array of orphaned components
 */
export function findOrphanedComponents(components) {
  const validIds = new Set(components.map((c) => c.id))
  const orphaned = []

  for (const comp of components) {
    if (comp.parentId && !validIds.has(comp.parentId)) {
      orphaned.push({ componentId: comp.id, missingParent: comp.parentId })
    }
  }

  return orphaned
}

/**
 * Get topological sort order for components (dependencies first).
 * Returns null if there's a cycle.
 *
 * @param {Array} components - Array of components with { id, dependencies: [] }
 * @returns {Array<string>|null} - Sorted component IDs or null if cycle exists
 */
export function topologicalSort(components) {
  const adjacency = new Map()
  const inDegree = new Map()

  // Initialize
  for (const comp of components) {
    adjacency.set(comp.id, comp.dependencies || [])
    inDegree.set(comp.id, 0)
  }

  // Calculate in-degrees
  for (const comp of components) {
    for (const dep of comp.dependencies || []) {
      if (inDegree.has(dep)) {
        inDegree.set(dep, inDegree.get(dep) + 1)
      }
    }
  }

  // Start with nodes that have no incoming edges
  const queue = []
  for (const [id, degree] of inDegree) {
    if (degree === 0) {
      queue.push(id)
    }
  }

  const result = []
  while (queue.length > 0) {
    const current = queue.shift()
    result.push(current)

    const deps = adjacency.get(current) || []
    for (const dep of deps) {
      const newDegree = inDegree.get(dep) - 1
      inDegree.set(dep, newDegree)
      if (newDegree === 0) {
        queue.push(dep)
      }
    }
  }

  // If we couldn't process all nodes, there's a cycle
  if (result.length !== components.length) {
    return null
  }

  return result
}

/**
 * Clean up invalid references from components.
 * Removes dependencies and parentIds that point to non-existent components.
 *
 * @param {Array} components - Array of components
 * @returns {Array} - Cleaned components with invalid references removed
 */
export function cleanupInvalidReferences(components) {
  const validIds = new Set(components.map((c) => c.id))

  return components.map((comp) => ({
    ...comp,
    parentId: comp.parentId && validIds.has(comp.parentId) ? comp.parentId : null,
    dependencies: (comp.dependencies || []).filter((depId) => validIds.has(depId)),
  }))
}
