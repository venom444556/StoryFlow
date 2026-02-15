import { useState, useMemo, useCallback } from 'react'
import { Outlet, useLocation, useParams } from 'react-router-dom'
import GradientBackground from './GradientBackground'
import Sidebar from './Sidebar'
import Header from './Header'
import CommandPalette from './CommandPalette'
import SettingsPanel from './SettingsPanel'
import ShortcutsModal from './ShortcutsModal'
import ToastContainer from '../ui/Toast'
import { useProjects } from '../../hooks/useProjects'
import { useKeyboardShortcuts, SHORTCUTS } from '../../hooks/useKeyboardShortcuts'
import { useUIStore } from '../../stores/uiStore'

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [showCommandPalette, setShowCommandPalette] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const params = useParams()
  const { getProject } = useProjects()

  // Toast notifications from UI store
  const toasts = useUIStore((state) => state.toasts)
  const removeToast = useUIStore((state) => state.removeToast)

  const toggleCommandPalette = useCallback(() => {
    setShowCommandPalette((prev) => !prev)
  }, [])

  const closeCommandPalette = useCallback(() => {
    setShowCommandPalette(false)
  }, [])

  const toggleShortcuts = useCallback(() => {
    setShowShortcuts((prev) => !prev)
  }, [])

  // Global keyboard shortcuts
  useKeyboardShortcuts({
    [SHORTCUTS.SEARCH]: toggleCommandPalette,
    [SHORTCUTS.ESCAPE]: () => {
      closeCommandPalette()
      setShowShortcuts(false)
    },
    [SHORTCUTS.HELP]: toggleShortcuts,
  })

  const breadcrumbs = useMemo(() => {
    const crumbs = []

    if (location.pathname === '/') {
      crumbs.push({ label: 'Dashboard', path: '/' })
    } else if (location.pathname.startsWith('/project/') && params.id) {
      const project = getProject(params.id)
      crumbs.push({ label: 'Dashboard', path: '/' })
      crumbs.push({
        label: project ? project.name : 'Project',
        path: `/project/${params.id}`,
      })
    } else {
      crumbs.push({ label: 'Dashboard', path: '/' })
      crumbs.push({ label: 'Not Found', path: location.pathname })
    }

    return crumbs
  }, [location.pathname, params.id, getProject])

  return (
    <div className="flex h-screen bg-[var(--color-bg-subtle)] text-[var(--color-fg-default)]">
      <GradientBackground />
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((prev) => !prev)}
        mobileMenuOpen={mobileMenuOpen}
        onMobileMenuClose={() => setMobileMenuOpen(false)}
      />

      {/* Mobile backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          breadcrumbs={breadcrumbs}
          onSearchClick={toggleCommandPalette}
          onSettingsClick={() => setShowSettings(true)}
          onHamburgerClick={() => setMobileMenuOpen((prev) => !prev)}
        />
        <main className="relative z-10 flex-1 overflow-hidden">
          <Outlet />
        </main>
      </div>

      {/* Command palette overlay */}
      <CommandPalette isOpen={showCommandPalette} onClose={closeCommandPalette} />

      {/* Settings panel */}
      <SettingsPanel isOpen={showSettings} onClose={() => setShowSettings(false)} />

      {/* Shortcuts modal */}
      <ShortcutsModal isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  )
}
