/**
 * Source file parser for the local indexer.
 *
 * Extracts exported symbols and import references from JS/JSX/TS/TSX files
 * using regex patterns. This is intentionally NOT a full AST parse — it's
 * a "good enough" static-analysis layer that handles the common idioms:
 *
 *   - export function foo()
 *   - export const foo = ...
 *   - export class Foo
 *   - export default function foo()
 *   - export { foo, bar }
 *   - export { foo as bar }
 *   - import foo from './bar'
 *   - import { foo, bar } from './baz'
 *   - import * as foo from './bar'
 *   - require('./foo')
 *   - const foo = require('./bar')
 *
 * Anything more exotic (re-exports through barrel files with aliasing,
 * dynamic imports with template literals, etc.) is best-effort.
 */

/** Match patterns for exported declarations. */
const EXPORT_PATTERNS = [
  // export [default] [async] function name(
  {
    re: /^[ \t]*export\s+(?:default\s+)?(?:async\s+)?function\s+(\w+)/gm,
    kind: 'function',
  },
  // export class Name
  { re: /^[ \t]*export\s+(?:default\s+)?class\s+(\w+)/gm, kind: 'class' },
  // export const|let|var name =
  {
    re: /^[ \t]*export\s+(?:const|let|var)\s+(\w+)\s*=/gm,
    kind: 'const',
  },
  // export { foo, bar as baz }   — captures the inside of the braces
  {
    re: /^[ \t]*export\s*\{([^}]+)\}/gm,
    kind: 'reexport',
  },
]

/** Match patterns for imports. Captures source path. */
const IMPORT_PATTERNS = [
  // import ... from 'path'
  /import\s+(?:[\w*${}\s,]+from\s+)?['"`]([^'"`]+)['"`]/g,
  // import('path')   dynamic
  /import\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
  // require('path')
  /require\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
]

/** Strip line and block comments so import patterns don't match inside them. */
function stripComments(source) {
  let out = ''
  let i = 0
  const n = source.length
  while (i < n) {
    const c = source[i]
    const next = source[i + 1]
    if (c === '/' && next === '/') {
      while (i < n && source[i] !== '\n') i++
      continue
    }
    if (c === '/' && next === '*') {
      i += 2
      while (i < n && !(source[i] === '*' && source[i + 1] === '/')) i++
      i += 2
      continue
    }
    out += c
    i++
  }
  return out
}

/**
 * Find all matches of a global regex against text and return them as an array.
 * Wraps the global stateful regex API so it's reusable.
 *
 * @param {RegExp} pattern
 * @param {string} text
 * @returns {RegExpExecArray[]}
 */
function findAll(pattern, text) {
  const results = []
  pattern.lastIndex = 0
  let match
  while ((match = pattern.exec(text)) !== null) {
    results.push(match)
    if (match.index === pattern.lastIndex) pattern.lastIndex++
  }
  return results
}

/**
 * Parse a single file's source text and extract its exports and imports.
 *
 * @param {string} relativePath - Repo-relative path (used for the SymbolRef.file).
 * @param {string} source - Raw file contents.
 * @returns {{
 *   exports: Array<{ name: string, kind: string, line: number }>,
 *   imports: string[],
 * }}
 */
export function parseFile(relativePath, source) {
  const exports = []
  const imports = []

  // For exports we want line numbers, so work on the original source
  // (not the comment-stripped version).
  for (const { re, kind } of EXPORT_PATTERNS) {
    const matches = findAll(re, source)
    for (const match of matches) {
      const line = lineOfOffset(source, match.index)
      if (kind === 'reexport') {
        const inside = match[1] || ''
        for (const piece of inside.split(',')) {
          const trimmed = piece.trim()
          if (!trimmed) continue
          const asMatch = /^\s*\w+\s+as\s+(\w+)\s*$/.exec(trimmed)
          const ident = asMatch ? asMatch[1] : trimmed
          if (/^\w+$/.test(ident)) {
            exports.push({ name: ident, kind: 'const', line })
          }
        }
      } else {
        exports.push({ name: match[1], kind, line })
      }
    }
  }

  // For imports we want to ignore matches inside comments.
  const cleaned = stripComments(source)
  for (const re of IMPORT_PATTERNS) {
    const matches = findAll(re, cleaned)
    for (const match of matches) {
      const spec = match[1]
      if (spec) imports.push(spec)
    }
  }

  // Dedupe exports by name (last one wins) and dedupe imports by spec.
  const seenExportNames = new Map()
  for (const e of exports) seenExportNames.set(e.name, e)

  return {
    exports: Array.from(seenExportNames.values()),
    imports: Array.from(new Set(imports)),
  }
}

/**
 * @param {string} source
 * @param {number} offset
 * @returns {number} 1-based line number containing the given offset.
 */
function lineOfOffset(source, offset) {
  let line = 1
  for (let i = 0; i < offset && i < source.length; i++) {
    if (source[i] === '\n') line++
  }
  return line
}
