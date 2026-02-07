/**
 * Input sanitization utilities for StoryFlow.
 *
 * Prevents CSS injection via user-provided color values and
 * prototype pollution via imported JSON objects.
 */

// ---------------------------------------------------------------------------
// Color validation
// ---------------------------------------------------------------------------

const HEX_COLOR = /^#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/
const RGB_COLOR = /^rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*(,\s*(0|1|0?\.\d+))?\s*\)$/
const HSL_COLOR = /^hsla?\(\s*\d{1,3}\s*,\s*\d{1,3}%\s*,\s*\d{1,3}%\s*(,\s*(0|1|0?\.\d+))?\s*\)$/

/**
 * Returns the color if it matches a safe pattern (hex, rgb, hsl),
 * otherwise returns the fallback.
 */
export function sanitizeColor(color, fallback = '#6366f1') {
  if (!color || typeof color !== 'string') return fallback
  const trimmed = color.trim()
  if (HEX_COLOR.test(trimmed) || RGB_COLOR.test(trimmed) || HSL_COLOR.test(trimmed)) {
    return trimmed
  }
  return fallback
}

// ---------------------------------------------------------------------------
// Prototype pollution guard
// ---------------------------------------------------------------------------

const DANGEROUS_KEYS = new Set(['__proto__', 'constructor', 'prototype'])

/**
 * Recursively strip __proto__, constructor, and prototype keys from an object.
 * Returns a clean copy — does not mutate the input.
 */
export function stripDangerousKeys(obj) {
  if (Array.isArray(obj)) {
    return obj.map(stripDangerousKeys)
  }
  if (obj !== null && typeof obj === 'object') {
    const clean = {}
    for (const [key, value] of Object.entries(obj)) {
      if (!DANGEROUS_KEYS.has(key)) {
        clean[key] = stripDangerousKeys(value)
      }
    }
    return clean
  }
  return obj
}
