import { describe, it, expect } from 'vitest'
import { sanitizeColor, stripDangerousKeys } from './sanitize'

describe('sanitize utilities', () => {
  describe('sanitizeColor', () => {
    describe('hex colors', () => {
      it('accepts valid 3-character hex color', () => {
        expect(sanitizeColor('#fff')).toBe('#fff')
        expect(sanitizeColor('#ABC')).toBe('#ABC')
      })

      it('accepts valid 4-character hex color (with alpha)', () => {
        expect(sanitizeColor('#fffa')).toBe('#fffa')
      })

      it('accepts valid 6-character hex color', () => {
        expect(sanitizeColor('#ffffff')).toBe('#ffffff')
        expect(sanitizeColor('#AABBCC')).toBe('#AABBCC')
      })

      it('accepts valid 8-character hex color (with alpha)', () => {
        expect(sanitizeColor('#ffffffaa')).toBe('#ffffffaa')
      })

      it('rejects invalid hex colors', () => {
        expect(sanitizeColor('#ff')).toBe('#6366f1')
        expect(sanitizeColor('#fffff')).toBe('#6366f1')
        expect(sanitizeColor('#gggggg')).toBe('#6366f1')
        expect(sanitizeColor('ffffff')).toBe('#6366f1') // missing #
      })

      it('trims whitespace around valid hex colors', () => {
        expect(sanitizeColor('  #fff  ')).toBe('#fff')
      })
    })

    describe('rgb colors', () => {
      it('accepts valid rgb color', () => {
        expect(sanitizeColor('rgb(255, 128, 0)')).toBe('rgb(255, 128, 0)')
      })

      it('accepts rgb without spaces', () => {
        expect(sanitizeColor('rgb(255,128,0)')).toBe('rgb(255,128,0)')
      })

      it('accepts rgb values matching the format pattern (no range validation)', () => {
        // sanitizeColor only validates format (1-3 digits), not 0-255 range
        expect(sanitizeColor('rgb(256, 0, 0)')).toBe('rgb(256, 0, 0)')
      })
    })

    describe('rgba colors', () => {
      it('accepts valid rgba color', () => {
        expect(sanitizeColor('rgba(255, 128, 0, 0.5)')).toBe('rgba(255, 128, 0, 0.5)')
      })

      it('accepts rgba with 0 or 1 alpha', () => {
        expect(sanitizeColor('rgba(255, 128, 0, 0)')).toBe('rgba(255, 128, 0, 0)')
        expect(sanitizeColor('rgba(255, 128, 0, 1)')).toBe('rgba(255, 128, 0, 1)')
      })
    })

    describe('hsl colors', () => {
      it('accepts valid hsl color', () => {
        expect(sanitizeColor('hsl(180, 50%, 50%)')).toBe('hsl(180, 50%, 50%)')
      })
    })

    describe('hsla colors', () => {
      it('accepts valid hsla color', () => {
        expect(sanitizeColor('hsla(180, 50%, 50%, 0.5)')).toBe('hsla(180, 50%, 50%, 0.5)')
      })
    })

    describe('invalid inputs', () => {
      it('returns fallback for null', () => {
        expect(sanitizeColor(null)).toBe('#6366f1')
      })

      it('returns fallback for undefined', () => {
        expect(sanitizeColor(undefined)).toBe('#6366f1')
      })

      it('returns fallback for empty string', () => {
        expect(sanitizeColor('')).toBe('#6366f1')
      })

      it('returns fallback for non-string types', () => {
        expect(sanitizeColor(123)).toBe('#6366f1')
        expect(sanitizeColor({})).toBe('#6366f1')
        expect(sanitizeColor([])).toBe('#6366f1')
      })

      it('returns fallback for CSS injection attempts', () => {
        expect(sanitizeColor('red; background: url(evil.js)')).toBe('#6366f1')
        expect(sanitizeColor('expression(alert(1))')).toBe('#6366f1')
        expect(sanitizeColor('url(javascript:alert(1))')).toBe('#6366f1')
      })

      it('returns fallback for named colors (not supported)', () => {
        expect(sanitizeColor('red')).toBe('#6366f1')
        expect(sanitizeColor('blue')).toBe('#6366f1')
      })
    })

    describe('custom fallback', () => {
      it('returns custom fallback for invalid input', () => {
        expect(sanitizeColor('invalid', '#000000')).toBe('#000000')
      })

      it('returns custom fallback for null', () => {
        expect(sanitizeColor(null, '#ffffff')).toBe('#ffffff')
      })
    })
  })

  describe('stripDangerousKeys', () => {
    describe('object handling', () => {
      it('removes __proto__ key', () => {
        const input = { name: 'test', __proto__: { polluted: true } }
        const result = stripDangerousKeys(input)
        expect(result).not.toHaveProperty('__proto__')
        expect(result.name).toBe('test')
      })

      it('removes constructor key', () => {
        const input = { name: 'test', constructor: { polluted: true } }
        const result = stripDangerousKeys(input)
        expect(result).not.toHaveProperty('constructor')
        expect(result.name).toBe('test')
      })

      it('removes prototype key', () => {
        const input = { name: 'test', prototype: { polluted: true } }
        const result = stripDangerousKeys(input)
        expect(result).not.toHaveProperty('prototype')
        expect(result.name).toBe('test')
      })

      it('preserves safe keys', () => {
        const input = { name: 'test', value: 42, nested: { foo: 'bar' } }
        const result = stripDangerousKeys(input)
        expect(result).toEqual(input)
      })

      it('handles empty object', () => {
        expect(stripDangerousKeys({})).toEqual({})
      })
    })

    describe('nested objects', () => {
      it('removes dangerous keys from nested objects', () => {
        const input = {
          level1: {
            __proto__: 'polluted',
            safe: 'value',
            level2: {
              constructor: 'bad',
              data: 'good',
            },
          },
        }
        const result = stripDangerousKeys(input)
        expect(result.level1).not.toHaveProperty('__proto__')
        expect(result.level1.safe).toBe('value')
        expect(result.level1.level2).not.toHaveProperty('constructor')
        expect(result.level1.level2.data).toBe('good')
      })

      it('handles deeply nested structures', () => {
        const input = {
          a: { b: { c: { d: { __proto__: 'bad', e: 'good' } } } },
        }
        const result = stripDangerousKeys(input)
        expect(result.a.b.c.d).not.toHaveProperty('__proto__')
        expect(result.a.b.c.d.e).toBe('good')
      })
    })

    describe('array handling', () => {
      it('processes arrays correctly', () => {
        const input = [
          { name: 'item1', __proto__: 'bad' },
          { name: 'item2', constructor: 'bad' },
        ]
        const result = stripDangerousKeys(input)
        expect(Array.isArray(result)).toBe(true)
        expect(result.length).toBe(2)
        expect(result[0]).not.toHaveProperty('__proto__')
        expect(result[0].name).toBe('item1')
        expect(result[1]).not.toHaveProperty('constructor')
        expect(result[1].name).toBe('item2')
      })

      it('handles empty arrays', () => {
        expect(stripDangerousKeys([])).toEqual([])
      })

      it('handles arrays with nested objects', () => {
        const input = [{ nested: { __proto__: 'bad', value: 'good' } }]
        const result = stripDangerousKeys(input)
        expect(result[0].nested).not.toHaveProperty('__proto__')
        expect(result[0].nested.value).toBe('good')
      })
    })

    describe('primitive handling', () => {
      it('returns strings unchanged', () => {
        expect(stripDangerousKeys('hello')).toBe('hello')
      })

      it('returns numbers unchanged', () => {
        expect(stripDangerousKeys(42)).toBe(42)
        expect(stripDangerousKeys(3.14)).toBe(3.14)
      })

      it('returns booleans unchanged', () => {
        expect(stripDangerousKeys(true)).toBe(true)
        expect(stripDangerousKeys(false)).toBe(false)
      })

      it('returns null unchanged', () => {
        expect(stripDangerousKeys(null)).toBe(null)
      })

      it('returns undefined unchanged', () => {
        expect(stripDangerousKeys(undefined)).toBe(undefined)
      })
    })

    describe('immutability', () => {
      it('does not mutate the original object', () => {
        const original = { name: 'test', __proto__: 'bad' }
        const originalCopy = JSON.parse(JSON.stringify(original))
        stripDangerousKeys(original)
        // Note: __proto__ is special in JS, so we just check name
        expect(original.name).toBe(originalCopy.name)
      })

      it('returns a new object', () => {
        const input = { name: 'test' }
        const result = stripDangerousKeys(input)
        expect(result).not.toBe(input)
        expect(result).toEqual(input)
      })
    })
  })
})
