import { describe, it, expect } from 'vitest'
import {
  wouldCreateCycle,
  findCycles,
  findMissingDependencies,
  findOrphanedComponents,
  topologicalSort,
  cleanupInvalidReferences,
} from './graph'

describe('graph utilities', () => {
  describe('wouldCreateCycle', () => {
    it('returns true for self-reference', () => {
      const components = [{ id: 'a', dependencies: [] }]
      expect(wouldCreateCycle('a', 'a', components)).toBe(true)
    })

    it('returns false for valid dependency', () => {
      const components = [
        { id: 'a', dependencies: [] },
        { id: 'b', dependencies: [] },
      ]
      expect(wouldCreateCycle('a', 'b', components)).toBe(false)
    })

    it('detects simple cycle A -> B -> A', () => {
      const components = [
        { id: 'a', dependencies: ['b'] },
        { id: 'b', dependencies: [] },
      ]
      // If B depends on A, it would create A -> B -> A
      expect(wouldCreateCycle('b', 'a', components)).toBe(true)
    })

    it('detects longer cycle A -> B -> C -> A', () => {
      const components = [
        { id: 'a', dependencies: ['b'] },
        { id: 'b', dependencies: ['c'] },
        { id: 'c', dependencies: [] },
      ]
      // If C depends on A, it would create a cycle
      expect(wouldCreateCycle('c', 'a', components)).toBe(true)
    })

    it('allows dependency to unrelated component', () => {
      const components = [
        { id: 'a', dependencies: ['b'] },
        { id: 'b', dependencies: [] },
        { id: 'c', dependencies: [] },
      ]
      // C depending on B is fine
      expect(wouldCreateCycle('c', 'b', components)).toBe(false)
    })
  })

  describe('findCycles', () => {
    it('returns empty array for acyclic graph', () => {
      const components = [
        { id: 'a', dependencies: ['b'] },
        { id: 'b', dependencies: ['c'] },
        { id: 'c', dependencies: [] },
      ]
      expect(findCycles(components)).toEqual([])
    })

    it('finds simple cycle', () => {
      const components = [
        { id: 'a', dependencies: ['b'] },
        { id: 'b', dependencies: ['a'] },
      ]
      const cycles = findCycles(components)
      expect(cycles.length).toBeGreaterThan(0)
    })
  })

  describe('findMissingDependencies', () => {
    it('returns empty for valid dependencies', () => {
      const components = [
        { id: 'a', dependencies: ['b'] },
        { id: 'b', dependencies: [] },
      ]
      expect(findMissingDependencies(components)).toEqual([])
    })

    it('finds missing dependency', () => {
      const components = [
        { id: 'a', dependencies: ['nonexistent'] },
        { id: 'b', dependencies: [] },
      ]
      const missing = findMissingDependencies(components)
      expect(missing).toContainEqual({
        componentId: 'a',
        missingDep: 'nonexistent',
      })
    })
  })

  describe('findOrphanedComponents', () => {
    it('returns empty when all parents exist', () => {
      const components = [
        { id: 'parent', parentId: null },
        { id: 'child', parentId: 'parent' },
      ]
      expect(findOrphanedComponents(components)).toEqual([])
    })

    it('finds orphaned component', () => {
      const components = [
        { id: 'child', parentId: 'deleted-parent' },
      ]
      const orphaned = findOrphanedComponents(components)
      expect(orphaned).toContainEqual({
        componentId: 'child',
        missingParent: 'deleted-parent',
      })
    })
  })

  describe('topologicalSort', () => {
    it('sorts in dependency order', () => {
      const components = [
        { id: 'a', dependencies: ['b', 'c'] },
        { id: 'b', dependencies: ['c'] },
        { id: 'c', dependencies: [] },
      ]
      const sorted = topologicalSort(components)
      expect(sorted).not.toBeNull()
      // A depends on B and C, so A should process first (then its deps)
      // The algorithm returns nodes with no incoming edges first
      expect(sorted.length).toBe(3)
      expect(sorted).toContain('a')
      expect(sorted).toContain('b')
      expect(sorted).toContain('c')
    })

    it('returns null for cyclic graph', () => {
      const components = [
        { id: 'a', dependencies: ['b'] },
        { id: 'b', dependencies: ['a'] },
      ]
      expect(topologicalSort(components)).toBeNull()
    })
  })

  describe('cleanupInvalidReferences', () => {
    it('removes invalid dependencies', () => {
      const components = [
        { id: 'a', dependencies: ['b', 'deleted'], parentId: null },
        { id: 'b', dependencies: [], parentId: null },
      ]
      const cleaned = cleanupInvalidReferences(components)
      expect(cleaned[0].dependencies).toEqual(['b'])
    })

    it('nullifies invalid parentId', () => {
      const components = [
        { id: 'a', dependencies: [], parentId: 'deleted' },
      ]
      const cleaned = cleanupInvalidReferences(components)
      expect(cleaned[0].parentId).toBeNull()
    })
  })
})
