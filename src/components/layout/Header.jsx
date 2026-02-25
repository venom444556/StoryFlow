import { useRef, useState, useCallback, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Search, Upload, Download, Settings, Menu } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useProjects } from '../../hooks/useProjects'
import {
  exportProjectJSON,
  exportAllProjectsJSON,
  downloadJSON,
  readFileAsJSON,
  parseProjectJSON,
  estimateExportSize,
  formatFileSize,
} from '../../utils/exportImport'

// ---------------------------------------------------------------------------
// Inline toast (simple temporary message)
// ---------------------------------------------------------------------------

function Toast({ message, type = 'success', onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000)
    return () => clearTimeout(t)
  }, [onDone])

  const colorClasses =
    type === 'success'
      ? 'bg-[var(--color-success-subtle)] border-[var(--color-success)]/30 text-[var(--color-success)]'
      : 'bg-[var(--color-danger-subtle)] border-[var(--color-danger)]/30 text-[var(--color-danger)]'

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={[
        'absolute right-[var(--space-6)] top-full mt-[var(--space-2)]',
        'rounded-[var(--radius-lg)] border px-[var(--space-4)] py-[var(--space-2)]',
        'text-[var(--text-xs)] font-[var(--font-medium)] shadow-lg backdrop-blur-md',
        colorClasses,
      ].join(' ')}
      style={{ zIndex: 'var(--z-toast)' }}
      role="alert"
    >
      {message}
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Header
// ---------------------------------------------------------------------------

export default function Header({
  breadcrumbs = [],
  onSearchClick,
  onSettingsClick,
  onHamburgerClick,
}) {
  const params = useParams()
  const { projects, getProject, importProject } = useProjects()
  const fileInputRef = useRef(null)
  const [toast, setToast] = useState(null)

  // --- Import handler ---
  const handleImportClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileChange = useCallback(
    async (e) => {
      const file = e.target.files?.[0]
      if (!file) return

      // Reject files larger than 10 MB
      if (file.size > 10 * 1024 * 1024) {
        setToast({ message: 'Import failed: file exceeds 10 MB limit', type: 'error' })
        return
      }

      try {
        const text = await readFileAsJSON(file)
        const result = parseProjectJSON(text)

        if (!result.success) {
          setToast({ message: `Import failed: ${result.error}`, type: 'error' })
          return
        }

        if (result.projects) {
          // Multi-project import
          let count = 0
          for (const proj of result.projects) {
            importProject(proj)
            count++
          }
          setToast({
            message: `Imported ${count} project${count !== 1 ? 's' : ''} successfully`,
            type: 'success',
          })
        } else if (result.project) {
          importProject(result.project)
          setToast({
            message: `Imported "${result.project.name}" successfully`,
            type: 'success',
          })
        }
      } catch {
        setToast({ message: 'Failed to read file', type: 'error' })
      }

      // Reset the input so the same file can be re-imported
      e.target.value = ''
    },
    [importProject]
  )

  // --- Export handler ---
  const handleExportClick = useCallback(() => {
    if (params.id) {
      // On a project page -- export current project
      const project = getProject(params.id)
      if (project) {
        const json = exportProjectJSON(project)
        const size = formatFileSize(new Blob([json]).size)
        const safeName = project.name
          .replace(/[^a-zA-Z0-9-_ ]/g, '')
          .replace(/\s+/g, '-')
          .toLowerCase()
        downloadJSON(json, `${safeName}.storyflow.json`)
        setToast({ message: `Exported "${project.name}" (${size})`, type: 'success' })
      }
    } else {
      // Dashboard -- export all projects
      if (projects.length === 0) {
        setToast({ message: 'No projects to export', type: 'error' })
        return
      }
      const json = exportAllProjectsJSON(projects)
      const size = formatFileSize(new Blob([json]).size)
      downloadJSON(json, 'storyflow-all-projects.json')
      setToast({
        message: `Exported ${projects.length} project${projects.length !== 1 ? 's' : ''} (${size})`,
        type: 'success',
      })
    }
  }, [params.id, getProject, projects])

  // --- Export size for tooltip ---
  const exportSize = (() => {
    if (params.id) {
      const project = getProject(params.id)
      return project ? formatFileSize(estimateExportSize(project)) : null
    }
    return projects.length > 0 ? formatFileSize(estimateExportSize(projects)) : null
  })()

  const iconButtonClasses = [
    'rounded-[var(--radius-lg)] p-[var(--space-2)]',
    'text-[var(--color-fg-muted)] transition-colors',
    'hover:bg-[var(--color-bg-glass-hover)] hover:text-[var(--color-fg-default)]',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--interactive-default)]',
  ].join(' ')

  return (
    <header
      className={[
        'glass relative flex h-14 shrink-0 items-center justify-between',
        'border-b border-[var(--color-border-default)] px-[var(--space-6)]',
      ].join(' ')}
      style={{ zIndex: 'var(--z-sticky)' }}
    >
      {/* Hamburger (mobile only) + Breadcrumbs */}
      <div className="flex items-center gap-[var(--space-2)]">
        <button
          onClick={onHamburgerClick}
          className={`${iconButtonClasses} md:hidden`}
          style={{ transitionDuration: 'var(--duration-fast)' }}
          aria-label="Open menu"
        >
          <Menu size={18} />
        </button>
        <nav className="flex items-center gap-[var(--space-2)] text-[var(--text-sm)]">
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1
            return (
              <span key={index} className="flex items-center gap-[var(--space-2)]">
                {index > 0 && <span className="text-[var(--color-fg-faint)]">/</span>}
                <span
                  className={
                    isLast
                      ? 'font-[var(--font-medium)] text-[var(--color-fg-default)]'
                      : 'text-[var(--color-fg-muted)]'
                  }
                >
                  {crumb.label}
                </span>
              </span>
            )
          })}
          {breadcrumbs.length === 0 && (
            <span className="font-[var(--font-medium)] text-[var(--color-fg-default)]">
              Dashboard
            </span>
          )}
        </nav>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-[var(--space-1)]">
        {/* Search */}
        <button
          onClick={onSearchClick}
          aria-label="Search (Ctrl+/)"
          title="Search (Ctrl+/)"
          className={[
            'flex items-center gap-[var(--space-2)] rounded-[var(--radius-lg)]',
            'px-[var(--space-3)] py-[var(--space-2)]',
            'text-[var(--color-fg-muted)] transition-colors',
            'hover:bg-[var(--color-bg-glass-hover)] hover:text-[var(--color-fg-default)]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--interactive-default)]',
          ].join(' ')}
          style={{ transitionDuration: 'var(--duration-fast)' }}
        >
          <Search size={16} />
          <span className="hidden text-[var(--text-xs)] sm:inline">Search</span>
          <kbd
            className={[
              'hidden rounded-[var(--radius-sm)] border border-[var(--color-border-default)]',
              'bg-[var(--color-bg-glass)] px-[var(--space-1)] py-0.5',
              'text-[10px] font-[var(--font-medium)] text-[var(--color-fg-muted)]',
              'sm:inline-block',
            ].join(' ')}
          >
            /
          </kbd>
        </button>

        {/* Import */}
        <button
          onClick={handleImportClick}
          aria-label="Import project"
          title="Import project"
          className={iconButtonClasses}
          style={{ transitionDuration: 'var(--duration-fast)' }}
        >
          <Upload size={16} />
        </button>

        {/* Export */}
        <button
          onClick={handleExportClick}
          aria-label={params.id ? 'Export current project' : 'Export all projects'}
          title={
            exportSize
              ? `Export${params.id ? '' : ` all ${projects.length} projects`} (${exportSize})`
              : params.id
                ? 'Export current project'
                : 'Export all projects'
          }
          className={iconButtonClasses}
          style={{ transitionDuration: 'var(--duration-fast)' }}
        >
          <Download size={16} />
        </button>

        {/* Settings */}
        <button
          onClick={onSettingsClick}
          aria-label="Settings"
          title="Settings"
          className={iconButtonClasses}
          style={{ transitionDuration: 'var(--duration-fast)' }}
        >
          <Settings size={16} />
        </button>

        {/* Hidden file input for import */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Toast notifications */}
      <AnimatePresence>
        {toast && (
          <Toast
            key={toast.message}
            message={toast.message}
            type={toast.type}
            onDone={() => setToast(null)}
          />
        )}
      </AnimatePresence>
    </header>
  )
}
