import { describe, it, expect } from 'vitest'
import {
  formatRelative,
  formatDate,
  formatDateTime,
  formatShortDate,
  isOverdue,
  toISOString,
} from './dates'

describe('dates utilities', () => {
  describe('formatRelative', () => {
    it('returns relative string for valid ISO date', () => {
      const recent = new Date(Date.now() - 5000).toISOString()
      expect(formatRelative(recent)).toMatch(/ago/)
    })

    it('returns "Unknown" for null', () => {
      expect(formatRelative(null)).toBe('Unknown')
    })

    it('returns "Unknown" for undefined', () => {
      expect(formatRelative(undefined)).toBe('Unknown')
    })

    it('handles Date objects', () => {
      expect(formatRelative(new Date())).toMatch(/ago/)
    })

    it('handles numeric timestamps', () => {
      const ts = Date.now() - 60_000
      expect(formatRelative(ts)).toMatch(/minute/)
    })
  })

  describe('formatDate', () => {
    it('formats ISO string as readable date', () => {
      expect(formatDate('2026-01-15T10:00:00Z')).toMatch(/Jan/)
    })
  })

  describe('formatDateTime', () => {
    it('formats ISO string with time', () => {
      expect(formatDateTime('2026-01-15T10:00:00Z')).toMatch(/Jan.*2026/)
    })
  })

  describe('formatShortDate', () => {
    it('formats short date', () => {
      expect(formatShortDate('2026-01-15T10:00:00Z')).toMatch(/Jan 15/)
    })
  })

  describe('isOverdue', () => {
    it('returns true for past dates', () => {
      expect(isOverdue('2020-01-01')).toBe(true)
    })

    it('returns false for future dates', () => {
      expect(isOverdue('2099-01-01')).toBe(false)
    })
  })

  describe('toISOString', () => {
    it('converts Date to ISO string', () => {
      expect(toISOString(new Date('2026-01-15T10:00:00Z'))).toBe('2026-01-15T10:00:00.000Z')
    })
  })
})
