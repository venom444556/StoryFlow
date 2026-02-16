// UUID generation wrapper
export const generateId = () => crypto.randomUUID()

/**
 * Generate a URL-friendly slug from a project name.
 *
 * "My Awesome App"  → "my-awesome-app"
 * "  Hello World! " → "hello-world"
 * "café résumé"     → "cafe-resume"
 * ""                → "untitled"
 *
 * @param {string} name - The human-readable project name
 * @returns {string} A lowercase, hyphen-separated slug
 */
export function generateSlug(name) {
  const slug = (name || '')
    .normalize('NFD') // Decompose accented chars (é → e + combining accent)
    .replace(/[\u0300-\u036f]/g, '') // Strip combining diacritical marks
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove non-alphanumeric (except spaces and hyphens)
    .replace(/[\s-]+/g, '-') // Collapse whitespace/hyphens into single hyphen
    .replace(/^-+|-+$/g, '') // Trim leading/trailing hyphens

  return slug || 'untitled'
}

/**
 * Generate a unique project slug, appending a numeric suffix if the base
 * slug already exists among the given project IDs.
 *
 * "my-app" with no conflicts   → "my-app"
 * "my-app" with "my-app" taken → "my-app-2"
 * "my-app" with 2 taken        → "my-app-3"
 *
 * @param {string} name - The human-readable project name
 * @param {string[]} existingIds - Array of existing project IDs to check against
 * @returns {string} A unique slug-based project ID
 */
export function generateProjectId(name, existingIds = []) {
  const base = generateSlug(name)
  const idSet = new Set(existingIds)

  if (!idSet.has(base)) return base

  let counter = 2
  while (idSet.has(`${base}-${counter}`)) {
    counter++
  }
  return `${base}-${counter}`
}
