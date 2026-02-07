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
} from '../../utils/exportImport'

// ---------------------------------------------------------------------------
// Inline toast (simple temporary message)
// ---------------------------------------------------------------------------

function Toast({ message, type = 'success', onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000)
    return () => clearTimeout(t)
  }, [onDone])

  const bg =
    type === 'success'
      ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300'
      : 'bg-red-500/20 border-red-500/30 text-red-300'

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`absolute right-6 top-full mt-2 z-50 rounded-lg border px-4 py-2 text-xs font-medium shadow-lg backdrop-blur-md ${bg}`}
    >
      {message}
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Header
// ---------------------------------------------------------------------------

export default function Header({ breadcrumbs = [], onSearchClick, onSettingsClick, onHamburgerClick }) {
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
        const safeName = project.name
          .replace(/[^a-zA-Z0-9-_ ]/g, '')
          .replace(/\s+/g, '-')
          .toLowerCase()
        downloadJSON(json, `${safeName}.storyflow.json`)
        setToast({ message: `Exported "${project.name}"`, type: 'success' })
      }
    } else {
      // Dashboard -- export all projects
      if (projects.length === 0) {
        setToast({ message: 'No projects to export', type: 'error' })
        return
      }
      const json = exportAllProjectsJSON(projects)
      downloadJSON(json, 'storyflow-all-projects.json')
      setToast({
        message: `Exported ${projects.length} project${projects.length !== 1 ? 's' : ''}`,
        type: 'success',
      })
    }
  }, [params.id, getProject, projects])

  return (
    <header className="glass relative z-10 flex h-14 shrink-0 items-center justify-between border-b border-white/5 px-6">
      {/* Hamburger (mobile only) + Breadcrumbs */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={onHamburgerClick}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white md:hidden"
        >
          <Menu size={18} />
        </button>
      <nav className="flex items-center gap-1.5 text-sm">
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1
          return (
            <span key={index} className="flex items-center gap-1.5">
              {index > 0 && <span className="text-slate-600">/</span>}
              <span
                className={
                  isLast
                    ? 'font-medium text-white'
                    : 'text-slate-500'
                }
              >
                {crumb.label}
              </span>
            </span>
          )
        })}
        {breadcrumbs.length === 0 && (
          <span className="font-medium text-white">Dashboard</span>
        )}
      </nav>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        {/* Search */}
        <button
          onClick={onSearchClick}
          title="Search (Ctrl+/)"
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
        >
          <Search size={16} />
          <span className="hidden text-xs sm:inline">Search</span>
          <kbd className="hidden rounded border border-white/10 bg-white/5 px-1 py-0.5 text-[10px] font-medium text-slate-500 sm:inline-block">
            /
          </kbd>
        </button>

        {/* Import */}
        <button
          onClick={handleImportClick}
          title="Import project"
          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
        >
          <Upload size={16} />
        </button>

        {/* Export */}
        <button
          onClick={handleExportClick}
          title={params.id ? 'Export current project' : 'Export all projects'}
          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
        >
          <Download size={16} />
        </button>

        {/* Settings */}
        <button
          onClick={onSettingsClick}
          title="Settings"
          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
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
