/**
 * Import-spec resolver.
 *
 * Translates a relative import specifier (e.g. './foo' or '../bar/baz')
 * into the absolute path of the file it actually refers to. Tries the
 * common JS/TS extensions and the index.* fallback. Returns null for
 * unresolvable, package, or absolute alias imports — those are not
 * "local" callers and should be ignored by the indexer.
 */

import fs from 'node:fs'
import path from 'node:path'

/** Extensions tried in order when the spec doesn't include one. */
const RESOLUTION_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs', '.mts', '.cts']

/**
 * @param {string} fromAbsFile - Absolute path of the importing file.
 * @param {string} spec - Raw import specifier (e.g. './foo', '../bar', 'react').
 * @returns {string|null} Absolute path of the resolved target, or null.
 */
export function resolveImport(fromAbsFile, spec) {
  if (!spec || typeof spec !== 'string') return null

  // Bare specifiers like 'react', '@scope/pkg', or alias roots like
  // '@/components/foo' belong to the package graph, not the local source
  // graph — skip them.
  if (!spec.startsWith('./') && !spec.startsWith('../') && !spec.startsWith('/')) {
    return null
  }

  const fromDir = path.dirname(fromAbsFile)
  const base = path.resolve(fromDir, spec)

  // 1. Exact path as-is (already has an extension).
  if (hasKnownExtension(base) && fileExists(base)) return base

  // 2. Try appending each known extension.
  for (const ext of RESOLUTION_EXTENSIONS) {
    const candidate = base + ext
    if (fileExists(candidate)) return candidate
  }

  // 3. Try `<base>/index.<ext>`.
  for (const ext of RESOLUTION_EXTENSIONS) {
    const candidate = path.join(base, 'index' + ext)
    if (fileExists(candidate)) return candidate
  }

  return null
}

function hasKnownExtension(p) {
  const ext = path.extname(p).toLowerCase()
  return RESOLUTION_EXTENSIONS.includes(ext)
}

function fileExists(p) {
  try {
    const stat = fs.statSync(p)
    return stat.isFile()
  } catch {
    return false
  }
}

export { RESOLUTION_EXTENSIONS }
