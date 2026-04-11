/**
 * Heuristics for extracting structured evidence from a ticket's text.
 *
 * Every function is pure: same input, same output, no side effects.
 */

/**
 * Extract all `[[Symbol:foo.bar]]` markers from text and return their
 * normalized (lowercased) symbol names.
 *
 * @param {string} text
 * @returns {Set<string>}
 */
export function extractExplicitSymbolMarkers(text) {
  const out = new Set()
  if (!text) return out
  const re = /\[\[Symbol:\s*([^\]\s]+)\s*\]\]/gi
  let m
  while ((m = re.exec(text)) !== null) {
    const name = m[1]
    if (name) out.add(name.toLowerCase())
  }
  return out
}

/**
 * Extract file-path-like tokens from ticket text. Matches tokens containing
 * a slash and a typical source file extension, plus quoted/backticked paths.
 *
 * @param {string} text
 * @returns {Set<string>}
 */
export function extractFilePathMentions(text) {
  const out = new Set()
  if (!text) return out

  // Backtick or quote wrapped paths.
  const quoted = /[`'"]([^`'"\s]+\/[^`'"\s]+)[`'"]/g
  let m
  while ((m = quoted.exec(text)) !== null) {
    out.add(m[1].toLowerCase())
  }

  // Bare path-like tokens with a recognizable extension.
  const bare =
    /\b([\w./-]+\/[\w.-]+\.(?:js|jsx|ts|tsx|mjs|cjs|py|go|rs|java|rb|css|scss|json|md))\b/gi
  while ((m = bare.exec(text)) !== null) {
    out.add(m[1].toLowerCase())
  }

  return out
}

/**
 * Extract identifier-like tokens (camelCase, snake_case, dotted.path).
 * Informational only; authoritative name matching lives in `scoring.js`.
 *
 * @param {string} text
 * @returns {Set<string>}
 */
export function extractIdentifierMentions(text) {
  const out = new Set()
  if (!text) return out
  const re = /\b([a-zA-Z_][\w]*(?:\.[a-zA-Z_][\w]*)+|[a-z][a-zA-Z0-9]*[A-Z][\w]*|[a-z]+_[\w]+)\b/g
  let m
  while ((m = re.exec(text)) !== null) {
    out.add(m[1].toLowerCase())
  }
  return out
}
