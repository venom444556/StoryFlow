/**
 * Cluster classification for the local indexer.
 *
 * A "cluster" is a stable identity given to a group of related files.
 * The local indexer derives cluster identity purely from directory
 * structure — no LLM, no graph community detection. The heuristic:
 *
 *   1. If the file is under `src/components/<sub>/`, the cluster is
 *      `components/<sub>` (e.g. `components/board`, `components/timeline`).
 *   2. If the file is under `src/<top>/`, the cluster is `src/<top>`
 *      (e.g. `src/stores`, `src/pages`, `src/features`).
 *   3. If the file is under `server/`, the cluster is `server`.
 *   4. If the file is under `modules/<top>/<sub>/`, the cluster is
 *      `modules/<top>/<sub>` (e.g. `modules/code-intel/local-indexer`).
 *   5. Otherwise the cluster is the first path segment (e.g. `cli`,
 *      `plugin`, `docs`).
 *
 * This produces a clustering that maps directly to how humans think about
 * the codebase: "the board UI", "the server", "the code-intel feature".
 * It's monotonic in the sense that adding a new file under an existing
 * directory keeps cluster identity stable.
 */

/**
 * @param {string} relativePath - Repo-relative path with forward slashes.
 * @returns {string} Stable cluster id.
 */
export function clusterIdForFile(relativePath) {
  if (!relativePath || typeof relativePath !== 'string') return 'unknown'

  const parts = relativePath.split('/').filter(Boolean)
  if (parts.length === 0) return 'unknown'

  // src/components/<sub>/...
  if (parts[0] === 'src' && parts[1] === 'components' && parts.length >= 3) {
    return `components/${parts[2]}`
  }

  // src/features/<sub>/...   — group by feature name
  if (parts[0] === 'src' && parts[1] === 'features' && parts.length >= 3) {
    return `features/${parts[2]}`
  }

  // src/<top>/...
  if (parts[0] === 'src' && parts.length >= 2) {
    return `src/${parts[1]}`
  }

  // server/...
  if (parts[0] === 'server') {
    return 'server'
  }

  // modules/<top>/<sub>/...
  if (parts[0] === 'modules' && parts.length >= 3) {
    return `modules/${parts[1]}/${parts[2]}`
  }

  // Fallback: top-level directory.
  return parts[0]
}

/**
 * Build a human-friendly name for a cluster id.
 *
 * @param {string} clusterId
 * @returns {string}
 */
export function clusterNameFor(clusterId) {
  if (!clusterId) return 'Unknown'
  // Capitalize segments and join with " / ".
  return clusterId
    .split('/')
    .map((seg) => seg.charAt(0).toUpperCase() + seg.slice(1))
    .join(' / ')
}
