import { NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  FolderKanban,
  Plus,
  ChevronLeft,
  ChevronRight,
  X,
  Zap,
} from 'lucide-react'
import { useProjects } from '../../hooks/useProjects'
import Tooltip from '../ui/Tooltip'

const STATUS_DOT_COLORS = {
  planning: 'bg-blue-400',
  'in-progress': 'bg-yellow-400',
  completed: 'bg-green-400',
  archived: 'bg-gray-400',
}

export default function Sidebar({ collapsed, onToggle, mobileMenuOpen, onMobileMenuClose }) {
  const { projects, addProject } = useProjects()
  const navigate = useNavigate()

  const handleNewProject = () => {
    const project = addProject('New Project')
    navigate(`/project/${project.id}`)
    onMobileMenuClose?.()
  }

  const handleNavClick = (path) => {
    navigate(path)
    onMobileMenuClose?.()
  }

  return (
    <motion.aside
      className={[
        'glass-sidebar flex flex-col',
        // Mobile: fixed overlay or hidden
        mobileMenuOpen ? 'fixed inset-y-0 left-0 z-40 h-full' : 'hidden',
        // Desktop: always visible, relative position
        'md:relative md:flex md:z-20 md:h-full',
      ].join(' ')}
      animate={{ width: mobileMenuOpen ? 260 : (collapsed ? 64 : 260) }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
    >
      {/* Brand */}
      <div className="flex h-14 items-center gap-2.5 border-b border-white/5 px-4">
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundImage: 'linear-gradient(to bottom right, var(--accent-active, #8b5cf6), #3b82f6)' }}
        >
          <Zap size={16} className="text-white" />
        </div>
        {(!collapsed || mobileMenuOpen) && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="gradient-text text-lg font-bold tracking-tight"
          >
            StoryFlow
          </motion.span>
        )}

        {/* Mobile close button */}
        {mobileMenuOpen && (
          <button
            onClick={onMobileMenuClose}
            className="ml-auto rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white md:hidden"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {/* Dashboard link */}
        <NavLink
          to="/"
          end
          onClick={() => onMobileMenuClose?.()}
          className={({ isActive }) =>
            [
              'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-white/10 text-white'
                : 'text-slate-400 hover:bg-white/5 hover:text-slate-200',
            ].join(' ')
          }
        >
          {collapsed && !mobileMenuOpen ? (
            <Tooltip content="Dashboard" position="right">
              <LayoutDashboard size={18} className="shrink-0" />
            </Tooltip>
          ) : (
            <>
              <LayoutDashboard size={18} className="shrink-0" />
              <span>Dashboard</span>
            </>
          )}
        </NavLink>

        {/* Divider */}
        <div className="my-4 border-t border-white/5" />

        {/* Projects section */}
        {(!collapsed || mobileMenuOpen) && (
          <div className="mb-2 flex items-center justify-between px-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Projects
            </span>
            <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] font-medium text-slate-400">
              {projects.length}
            </span>
          </div>
        )}

        {/* Project list */}
        <div className="space-y-0.5">
          {projects.map((project) => {
            const dotColor = STATUS_DOT_COLORS[project.status] || 'bg-gray-400'

            if (collapsed && !mobileMenuOpen) {
              return (
                <Tooltip key={project.id} content={project.name} position="right">
                  <button
                    onClick={() => handleNavClick(`/project/${project.id}`)}
                    className="flex w-full items-center justify-center rounded-lg px-3 py-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-200"
                  >
                    <FolderKanban size={18} className="shrink-0" />
                  </button>
                </Tooltip>
              )
            }

            return (
              <button
                key={project.id}
                onClick={() => handleNavClick(`/project/${project.id}`)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-200"
              >
                <span className={`h-2 w-2 shrink-0 rounded-full ${dotColor}`} />
                <span className="truncate">{project.name}</span>
              </button>
            )
          })}
        </div>
      </nav>

      {/* Bottom section */}
      <div className="border-t border-white/5 p-3">
        {collapsed && !mobileMenuOpen ? (
          <Tooltip content="New Project" position="right">
            <button
              onClick={handleNewProject}
              className="flex w-full items-center justify-center rounded-lg p-2 text-white transition-all hover:brightness-110"
              style={{ backgroundImage: 'linear-gradient(to right, var(--accent-active, #8b5cf6), #3b82f6)' }}
            >
              <Plus size={18} />
            </button>
          </Tooltip>
        ) : (
          <button
            onClick={handleNewProject}
            className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-all hover:brightness-110"
            style={{ backgroundImage: 'linear-gradient(to right, var(--accent-active, #8b5cf6), #3b82f6)' }}
          >
            <Plus size={16} />
            <span>New Project</span>
          </button>
        )}
      </div>

      {/* Collapse toggle (desktop only) */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 z-30 hidden h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-surface-secondary text-slate-400 shadow-lg transition-colors hover:bg-surface-tertiary hover:text-white md:flex"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </motion.aside>
  )
}
