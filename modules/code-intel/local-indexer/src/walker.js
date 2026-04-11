/**
 * Filesystem walker for the local indexer.
 *
 * Recursively collects every file under a root that matches a known
 * source-code extension, while skipping the usual noise directories.
 * Pure node:fs — no external dependencies.
 */

import fs from 'node:fs'
import path from 'node:path'

/** File extensions the indexer understands. */
const SOURCE_EXTENSIONS = new Set(['.js', '.jsx', '.mjs', '.cjs', '.ts', '.tsx', '.mts', '.cts'])

/** Directory names we never descend into. */
const SKIP_DIRS = new Set([
  'node_modules',
  '.git',
  'dist',
  'build',
  'coverage',
  '.next',
  '.nuxt',
  '.cache',
  '.parcel-cache',
  '.vite',
  '.turbo',
  'out',
  '__snapshots__',
])

/**
 * Walk a directory tree and return absolute paths of every source file.
 *
 * @param {string} root - Absolute path to walk.
 * @param {{ extensions?: Set<string>, skipDirs?: Set<string> }} [opts]
 * @returns {string[]}
 */
export function walkSourceFiles(root, opts = {}) {
  const exts = opts.extensions || SOURCE_EXTENSIONS
  const skip = opts.skipDirs || SKIP_DIRS
  const out = []

  /** @param {string} dir */
  function visit(dir) {
    let entries
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true })
    } catch {
      return
    }
    for (const entry of entries) {
      if (entry.name.startsWith('.') && entry.name !== '.storyflow') {
        // Skip dot dirs/files except .storyflow which holds our config.
        if (entry.isDirectory()) continue
      }
      if (entry.isDirectory()) {
        if (skip.has(entry.name)) continue
        visit(path.join(dir, entry.name))
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase()
        if (exts.has(ext)) {
          out.push(path.join(dir, entry.name))
        }
      }
    }
  }

  visit(root)
  return out
}

/**
 * Convert an absolute path under `root` to a repo-relative path with
 * forward slashes (so cluster identity is portable across platforms).
 *
 * @param {string} root
 * @param {string} absPath
 * @returns {string}
 */
export function toRelative(root, absPath) {
  const rel = path.relative(root, absPath)
  return rel.split(path.sep).join('/')
}

export { SOURCE_EXTENSIONS, SKIP_DIRS }
