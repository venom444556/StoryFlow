import { describe, it, expect } from 'vitest'
import { generateId } from './ids'

describe('ids utilities', () => {
  describe('generateId', () => {
    it('returns a string', () => {
      const id = generateId()
      expect(typeof id).toBe('string')
    })

    it('returns a non-empty string', () => {
      const id = generateId()
      expect(id.length).toBeGreaterThan(0)
    })

    it('generates unique IDs on each call', () => {
      const ids = new Set()
      for (let i = 0; i < 100; i++) {
        ids.add(generateId())
      }
      expect(ids.size).toBe(100)
    })

    it('generates IDs in UUID-like format', () => {
      const id = generateId()
      // UUID format has dashes or is alphanumeric
      // The mock in setup.js returns 'test-' prefix
      expect(id).toMatch(/^test-[a-z0-9]+$/)
    })

    it('does not return null or undefined', () => {
      const id = generateId()
      expect(id).not.toBeNull()
      expect(id).not.toBeUndefined()
    })

    it('generates different IDs in rapid succession', () => {
      const id1 = generateId()
      const id2 = generateId()
      const id3 = generateId()
      expect(id1).not.toBe(id2)
      expect(id2).not.toBe(id3)
      expect(id1).not.toBe(id3)
    })
  })
})
