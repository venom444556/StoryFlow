import { describe, it, expect } from 'vitest'
import { COMPONENT_TYPES, TYPE_COLORS, TYPE_HEX_COLORS, TYPE_ICONS } from './constants'

describe('constants', () => {
  describe('COMPONENT_TYPES', () => {
    it('should be an array of type options', () => {
      expect(Array.isArray(COMPONENT_TYPES)).toBe(true)
      expect(COMPONENT_TYPES.length).toBeGreaterThan(0)
    })

    it('should have value and label for each type', () => {
      COMPONENT_TYPES.forEach((type) => {
        expect(type).toHaveProperty('value')
        expect(type).toHaveProperty('label')
        expect(typeof type.value).toBe('string')
        expect(typeof type.label).toBe('string')
      })
    })

    it('should include common component types', () => {
      const values = COMPONENT_TYPES.map((t) => t.value)
      expect(values).toContain('page')
      expect(values).toContain('component')
      expect(values).toContain('hook')
      expect(values).toContain('util')
      expect(values).toContain('context')
      expect(values).toContain('api')
      expect(values).toContain('service')
      expect(values).toContain('model')
    })
  })

  describe('TYPE_COLORS', () => {
    it('should be an object mapping types to color names', () => {
      expect(typeof TYPE_COLORS).toBe('object')
      expect(TYPE_COLORS).not.toBeNull()
    })

    it('should have a color for each component type', () => {
      COMPONENT_TYPES.forEach((type) => {
        expect(TYPE_COLORS[type.value]).toBeDefined()
        expect(typeof TYPE_COLORS[type.value]).toBe('string')
      })
    })

    it('should have expected color values', () => {
      expect(TYPE_COLORS.page).toBe('blue')
      expect(TYPE_COLORS.component).toBe('purple')
      expect(TYPE_COLORS.hook).toBe('cyan')
      expect(TYPE_COLORS.util).toBe('yellow')
      expect(TYPE_COLORS.context).toBe('green')
      expect(TYPE_COLORS.api).toBe('red')
      expect(TYPE_COLORS.service).toBe('pink')
      expect(TYPE_COLORS.model).toBe('gray')
    })
  })

  describe('TYPE_HEX_COLORS', () => {
    it('should be an object mapping types to hex color codes', () => {
      expect(typeof TYPE_HEX_COLORS).toBe('object')
      expect(TYPE_HEX_COLORS).not.toBeNull()
    })

    it('should have a hex color for each component type', () => {
      COMPONENT_TYPES.forEach((type) => {
        expect(TYPE_HEX_COLORS[type.value]).toBeDefined()
        expect(TYPE_HEX_COLORS[type.value]).toMatch(/^#[0-9a-fA-F]{6}$/)
      })
    })

    it('should have valid hex color values', () => {
      Object.values(TYPE_HEX_COLORS).forEach((color) => {
        expect(color).toMatch(/^#[0-9a-fA-F]{6}$/)
      })
    })
  })

  describe('TYPE_ICONS', () => {
    it('should be an object mapping types to icon components', () => {
      expect(typeof TYPE_ICONS).toBe('object')
      expect(TYPE_ICONS).not.toBeNull()
    })

    it('should have an icon for each component type', () => {
      COMPONENT_TYPES.forEach((type) => {
        expect(TYPE_ICONS[type.value]).toBeDefined()
        // Lucide icons are forwardRef objects, not plain functions
        expect(typeof TYPE_ICONS[type.value]).toBe('object')
      })
    })
  })

  describe('consistency checks', () => {
    it('should have matching keys across all type mappings', () => {
      const typeValues = COMPONENT_TYPES.map((t) => t.value)
      const colorKeys = Object.keys(TYPE_COLORS)
      const hexColorKeys = Object.keys(TYPE_HEX_COLORS)
      const iconKeys = Object.keys(TYPE_ICONS)

      // All should have the same keys
      expect(colorKeys.sort()).toEqual(typeValues.sort())
      expect(hexColorKeys.sort()).toEqual(typeValues.sort())
      expect(iconKeys.sort()).toEqual(typeValues.sort())
    })
  })
})
