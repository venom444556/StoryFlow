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
  HelpCircle,
} from 'lucide-react'
import { useProjects } from '../../hooks/useProjects'
import Tooltip from '../ui/Tooltip'

const STATUS_DOT_COLORS = {
  planning: 'bg-[var(--status-info)]',
  'in-progress': 'bg-[var(--status-warning)]',
  completed: 'bg-[var(--status-success)]',
  archived: 'bg-[var(--color-fg-muted)]',
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
        mobileMenuOpen ? 'fixed inset-y-0 left-0 h-full' : 'hidden',
        // Desktop: always visible, relative position
        'md:relative md:flex md:h-full',
      ].join(' ')}
      style={{ zIndex: mobileMenuOpen ? 'var(--z-overlay)' : 'var(--z-sticky)' }}
      animate={{ width: mobileMenuOpen ? 260 : collapsed ? 64 : 260 }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Brand */}
      <div className="flex h-14 items-center gap-[var(--space-3)] border-b border-[var(--color-border-default)] px-[var(--space-4)]">
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-lg)]"
          style={{
            backgroundImage:
              'linear-gradient(to bottom right, var(--accent-active, #8b5cf6), #3b82f6)',
          }}
        >
          <Zap size={16} className="text-[var(--color-fg-default)]" />
        </div>
        {(!collapsed || mobileMenuOpen) && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="gradient-text text-[var(--text-lg)] font-[var(--font-bold)] tracking-tight"
          >
            StoryFlow
          </motion.span>
        )}

        {/* Mobile close button */}
        {mobileMenuOpen && (
          <button
            type="button"
            onClick={onMobileMenuClose}
            className={[
              'ml-auto rounded-[var(--radius-lg)] p-[var(--space-2)]',
              'text-[var(--color-fg-muted)] hover:bg-[var(--color-bg-glass-hover)] hover:text-[var(--color-fg-default)]',
              'transition-colors md:hidden',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--interactive-default)]',
            ].join(' ')}
            style={{ transitionDuration: 'var(--duration-fast)' }}
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-[var(--space-3)] py-[var(--space-4)]">
        {/* Dashboard link */}
        <NavLink
          to="/"
          end
          onClick={() => onMobileMenuClose?.()}
          className={({ isActive }) =>
            [
              'group flex items-center gap-[var(--space-3)] rounded-[var(--radius-lg)]',
              'px-[var(--space-3)] py-[var(--space-2)] text-[var(--text-sm)] font-[var(--font-medium)]',
              'transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--interactive-default)]',
              isActive
                ? 'bg-[var(--color-bg-glass-hover)] text-[var(--color-fg-default)]'
                : 'text-[var(--color-fg-muted)] hover:bg-[var(--color-bg-glass-hover)] hover:text-[var(--color-fg-default)]',
            ].join(' ')
          }
          style={{ transitionDuration: 'var(--duration-fast)' }}
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
        <div className="my-[var(--space-4)] border-t border-[var(--color-border-default)]" />

        {/* Projects section */}
        {(!collapsed || mobileMenuOpen) && (
          <div className="mb-[var(--space-2)] flex items-center justify-between px-[var(--space-3)]">
            <span className="text-[var(--text-xs)] font-[var(--font-semibold)] uppercase tracking-wider text-[var(--color-fg-muted)]">
              Projects
            </span>
            <span className="rounded-full bg-[var(--color-bg-glass-hover)] px-[var(--space-2)] py-0.5 text-[10px] font-[var(--font-medium)] text-[var(--color-fg-muted)]">
              {projects.length}
            </span>
          </div>
        )}

        {/* Project list */}
        <div className="space-y-0.5">
          {projects.map((project) => {
            const dotColor = STATUS_DOT_COLORS[project.status] || 'bg-[var(--color-fg-muted)]'

            if (collapsed && !mobileMenuOpen) {
              return (
                <Tooltip key={project.id} content={project.name} position="right">
                  <button
                    type="button"
                    onClick={() => handleNavClick(`/project/${project.id}`)}
                    className={[
                      'flex w-full items-center justify-center rounded-[var(--radius-lg)]',
                      'px-[var(--space-3)] py-[var(--space-2)]',
                      'text-[var(--color-fg-muted)] transition-colors',
                      'hover:bg-[var(--color-bg-glass-hover)] hover:text-[var(--color-fg-default)]',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--interactive-default)]',
                    ].join(' ')}
                    style={{ transitionDuration: 'var(--duration-fast)' }}
                  >
                    <FolderKanban size={18} className="shrink-0" />
                  </button>
                </Tooltip>
              )
            }

            return (
              <button
                type="button"
                key={project.id}
                onClick={() => handleNavClick(`/project/${project.id}`)}
                className={[
                  'flex w-full items-center gap-[var(--space-3)] rounded-[var(--radius-lg)]',
                  'px-[var(--space-3)] py-[var(--space-2)] text-[var(--text-sm)]',
                  'text-[var(--color-fg-muted)] transition-colors',
                  'hover:bg-[var(--color-bg-glass-hover)] hover:text-[var(--color-fg-default)]',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--interactive-default)]',
                ].join(' ')}
                style={{ transitionDuration: 'var(--duration-fast)' }}
              >
                <span className={`h-2 w-2 shrink-0 rounded-full ${dotColor}`} />
                <span className="truncate">{project.name}</span>
              </button>
            )
          })}
        </div>
      </nav>

      {/* Bottom section */}
      <div className="border-t border-[var(--color-border-default)] p-[var(--space-3)]">
        {/* Help button */}
        {collapsed && !mobileMenuOpen ? (
          <Tooltip content="Help" position="right">
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem('storyflow-welcomed')
                window.dispatchEvent(new Event('storyflow-show-welcome'))
              }}
              className="mb-2 flex w-full items-center justify-center rounded-[var(--radius-lg)] p-[var(--space-2)] text-[var(--color-fg-muted)] transition-colors hover:bg-[var(--color-bg-glass-hover)] hover:text-[var(--color-fg-default)]"
            >
              <HelpCircle size={16} />
            </button>
          </Tooltip>
        ) : (
          <button
            type="button"
            onClick={() => {
              localStorage.removeItem('storyflow-welcomed')
              window.dispatchEvent(new Event('storyflow-show-welcome'))
            }}
            className="mb-2 flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-[var(--color-fg-muted)] transition-colors hover:bg-[var(--color-bg-glass-hover)] hover:text-[var(--color-fg-default)]"
          >
            <HelpCircle size={14} />
            <span>Help & Tour</span>
          </button>
        )}
      </div>
      <div className="px-[var(--space-3)] pb-[var(--space-3)]">
        {collapsed && !mobileMenuOpen ? (
          <Tooltip content="New Project" position="right">
            <button
              type="button"
              onClick={handleNewProject}
              className={[
                'flex w-full items-center justify-center rounded-[var(--radius-lg)] p-[var(--space-2)]',
                'text-[var(--color-fg-default)] transition-all hover:brightness-110',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--interactive-default)] focus-visible:ring-offset-2',
              ].join(' ')}
              style={{
                backgroundImage:
                  'linear-gradient(to right, var(--accent-active, #8b5cf6), #3b82f6)',
                transitionDuration: 'var(--duration-fast)',
              }}
            >
              <Plus size={18} />
            </button>
          </Tooltip>
        ) : (
          <button
            type="button"
            onClick={handleNewProject}
            className={[
              'flex w-full items-center justify-center gap-[var(--space-2)] rounded-[var(--radius-lg)]',
              'px-[var(--space-4)] py-[var(--space-2)] text-[var(--text-sm)] font-[var(--font-medium)]',
              'text-[var(--color-fg-default)] transition-all hover:brightness-110',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--interactive-default)] focus-visible:ring-offset-2',
            ].join(' ')}
            style={{
              backgroundImage: 'linear-gradient(to right, var(--accent-active, #8b5cf6), #3b82f6)',
              transitionDuration: 'var(--duration-fast)',
            }}
          >
            <Plus size={16} />
            <span>New Project</span>
          </button>
        )}
      </div>

      {/* Collapse toggle (desktop only) */}
      <button
        type="button"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        onClick={onToggle}
        className={[
          'absolute -right-3 top-20 hidden h-6 w-6 items-center justify-center rounded-full',
          'border border-[var(--color-border-default)] bg-[var(--color-bg-subtle)]',
          'text-[var(--color-fg-muted)] shadow-lg transition-colors',
          'hover:bg-[var(--color-bg-muted)] hover:text-[var(--color-fg-default)]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--interactive-default)]',
          'md:flex',
        ].join(' ')}
        style={{
          zIndex: 'var(--z-sticky)',
          transitionDuration: 'var(--duration-fast)',
        }}
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </motion.aside>
  )
}
