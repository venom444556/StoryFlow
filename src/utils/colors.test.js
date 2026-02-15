import { describe, it, expect } from 'vitest'
import { getPriorityColor } from './colors'

describe('colors utilities', () => {
  describe('getPriorityColor', () => {
    it('returns correct colors for critical priority', () => {
      const result = getPriorityColor('critical')
      expect(result).toEqual({
        bg: 'bg-red-100',
        text: 'text-red-700',
        border: 'border-red-300',
        dot: 'bg-red-500',
      })
    })

    it('returns correct colors for high priority', () => {
      const result = getPriorityColor('high')
      expect(result).toEqual({
        bg: 'bg-orange-100',
        text: 'text-orange-700',
        border: 'border-orange-300',
        dot: 'bg-orange-500',
      })
    })

    it('returns correct colors for medium priority', () => {
      const result = getPriorityColor('medium')
      expect(result).toEqual({
        bg: 'bg-yellow-100',
        text: 'text-yellow-700',
        border: 'border-yellow-300',
        dot: 'bg-yellow-500',
      })
    })

    it('returns correct colors for low priority', () => {
      const result = getPriorityColor('low')
      expect(result).toEqual({
        bg: 'bg-blue-100',
        text: 'text-blue-700',
        border: 'border-blue-300',
        dot: 'bg-blue-500',
      })
    })

    it('returns default gray colors for unknown priority', () => {
      const result = getPriorityColor('unknown')
      expect(result).toEqual({
        bg: 'bg-gray-100',
        text: 'text-gray-700',
        border: 'border-gray-300',
        dot: 'bg-gray-500',
      })
    })

    it('returns default gray colors for undefined', () => {
      const result = getPriorityColor(undefined)
      expect(result).toEqual({
        bg: 'bg-gray-100',
        text: 'text-gray-700',
        border: 'border-gray-300',
        dot: 'bg-gray-500',
      })
    })

    it('returns default gray colors for null', () => {
      const result = getPriorityColor(null)
      expect(result).toEqual({
        bg: 'bg-gray-100',
        text: 'text-gray-700',
        border: 'border-gray-300',
        dot: 'bg-gray-500',
      })
    })

    it('returns default gray colors for empty string', () => {
      const result = getPriorityColor('')
      expect(result).toEqual({
        bg: 'bg-gray-100',
        text: 'text-gray-700',
        border: 'border-gray-300',
        dot: 'bg-gray-500',
      })
    })

    it('is case-sensitive (CRITICAL returns default)', () => {
      const result = getPriorityColor('CRITICAL')
      expect(result).toEqual({
        bg: 'bg-gray-100',
        text: 'text-gray-700',
        border: 'border-gray-300',
        dot: 'bg-gray-500',
      })
    })

    it('returns object with all required properties', () => {
      const result = getPriorityColor('medium')
      expect(result).toHaveProperty('bg')
      expect(result).toHaveProperty('text')
      expect(result).toHaveProperty('border')
      expect(result).toHaveProperty('dot')
    })
  })
})
