import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FolderKanban, Plus, Trash2, RotateCcw, Trash } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useProjects } from '../hooks/useProjects'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import SearchBar from '../components/ui/SearchBar'
import Modal from '../components/ui/Modal'
import Input from '../components/ui/Input'
import EmptyState from '../components/ui/EmptyState'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { formatRelative } from '../utils/dates'

const STATUS_BADGE_VARIANT = {
  planning: 'blue',
  'in-progress': 'yellow',
  completed: 'green',
  archived: 'gray',
}

const TECH_BADGE_VARIANTS = ['default']

export default function DashboardPage() {
  const {
    projects,
    trashedProjects,
    addProject,
    trashProject,
    restoreProject,
    permanentlyDeleteProject,
    emptyTrash,
  } = useProjects()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [showNewModal, setShowNewModal] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [nameError, setNameError] = useState('')
  const [trashTarget, setTrashTarget] = useState(null)
  const [permanentDeleteTarget, setPermanentDeleteTarget] = useState(null)
  const [showEmptyTrashConfirm, setShowEmptyTrashConfirm] = useState(false)
  const [showTrash, setShowTrash] = useState(false)

  const filtered = projects.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))

  const handleCreate = () => {
    const name = newProjectName.trim()
    if (!name) {
      setNameError('Project name is required')
      return
    }
    if (projects.some((p) => p.name.toLowerCase() === name.toLowerCase())) {
      setNameError('A project with this name already exists')
      return
    }
    setNameError('')
    const project = addProject(name)
    setShowNewModal(false)
    setNewProjectName('')
    navigate(`/project/${project.id}`)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleCreate()
  }

  return (
    <div className="h-full overflow-auto p-6 lg:p-8">
      {/* Title row — title left, actions right */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between animate-entrance">
        <div>
          <h1 className="heading-accent text-2xl font-bold tracking-tight text-[var(--color-fg-default)]">
            Projects
          </h1>
          <p className="mt-3 text-sm text-[var(--color-fg-muted)]">
            {projects.length} project{projects.length !== 1 ? 's' : ''}
            {trashedProjects.length > 0 && (
              <span className="text-[var(--color-fg-subtle)]">
                {' · '}
                {trashedProjects.length} in trash
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 animate-entrance stagger-1">
          <SearchBar
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="w-56"
          />
          <Button variant="primary" icon={Plus} onClick={() => setShowNewModal(true)}>
            New Project
          </Button>
          {trashedProjects.length > 0 && (
            <Button
              variant={showTrash ? 'secondary' : 'ghost'}
              icon={Trash}
              onClick={() => setShowTrash((prev) => !prev)}
            >
              Trash ({trashedProjects.length})
            </Button>
          )}
        </div>
      </div>

      {/* Trash section */}
      <AnimatePresence>
        {showTrash && trashedProjects.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="mb-6 overflow-hidden"
          >
            <div className="rounded-xl border border-[var(--color-danger)]/20 bg-[var(--color-danger-subtle)] p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trash2 size={16} className="text-[var(--color-danger)]" />
                  <h2 className="text-sm font-semibold text-[var(--color-fg-default)]">Trash</h2>
                  <span className="text-xs text-[var(--color-fg-muted)]">
                    {trashedProjects.length} project{trashedProjects.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowEmptyTrashConfirm(true)}
                  className="text-[var(--color-danger)] hover:text-[var(--color-danger-fg)]"
                >
                  Empty Trash
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                {trashedProjects.map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-glass)] p-3 opacity-70"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[var(--color-fg-default)]">
                        {project.name}
                      </p>
                      {project.deletedAt && (
                        <p className="text-xs text-[var(--color-fg-subtle)]">
                          Deleted {formatRelative(project.deletedAt)}
                        </p>
                      )}
                    </div>
                    <div className="ml-3 flex shrink-0 gap-1">
                      <button
                        onClick={() => restoreProject(project.id)}
                        className="rounded-md p-1.5 text-[var(--color-fg-muted)] transition-colors hover:bg-[var(--color-success-subtle)] hover:text-[var(--color-success)]"
                        title="Restore project"
                      >
                        <RotateCcw size={14} />
                      </button>
                      <button
                        onClick={() => setPermanentDeleteTarget(project)}
                        className="rounded-md p-1.5 text-[var(--color-fg-muted)] transition-colors hover:bg-[var(--color-danger-subtle)] hover:text-[var(--color-danger)]"
                        title="Permanently delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Project grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((project, index) => {
            const statusVariant = STATUS_BADGE_VARIANT[project.status] || 'default'
            const issues = project.board?.issues || []
            const doneCount = issues.filter((i) => i.status === 'Done').length
            const openCount = issues.filter((i) => i.status !== 'Done').length
            const progress = issues.length > 0 ? Math.round((doneCount / issues.length) * 100) : 0

            return (
              <div
                key={project.id}
                onClick={() => navigate(`/project/${project.id}`)}
                className={[
                  'glass-card-elevated group cursor-pointer p-5',
                  `animate-entrance-scale stagger-${Math.min(index + 2, 8)}`,
                ].join(' ')}
              >
                {/* Header: name + status + trash */}
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3
                      className="truncate text-base font-semibold text-[var(--color-fg-default)] group-hover:text-[var(--accent-default)] transition-colors"
                      style={{ transitionDuration: 'var(--duration-fast)' }}
                    >
                      {project.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={statusVariant} dot size="sm">
                      {project.status}
                    </Badge>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setTrashTarget(project)
                      }}
                      className="rounded-md p-1 text-[var(--color-fg-subtle)] opacity-0 group-hover:opacity-100 transition-all hover:bg-[var(--color-danger-subtle)] hover:text-[var(--color-danger-fg)]"
                      style={{ transitionDuration: 'var(--duration-fast)' }}
                      title="Move to trash"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Tech stack */}
                {project.techStack && project.techStack.length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-1">
                    {project.techStack.slice(0, 3).map((tech, i) => (
                      <Badge
                        key={tech}
                        variant={TECH_BADGE_VARIANTS[i % TECH_BADGE_VARIANTS.length]}
                        size="sm"
                      >
                        {tech}
                      </Badge>
                    ))}
                    {project.techStack.length > 3 && (
                      <Badge variant="default" size="sm">
                        +{project.techStack.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Progress bar */}
                {issues.length > 0 && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-[var(--color-fg-muted)]">
                        {doneCount}/{issues.length} done
                      </span>
                      <span className="text-xs font-medium text-[var(--color-fg-muted)]">
                        {progress}%
                      </span>
                    </div>
                    <div className="h-1 w-full rounded-full bg-[var(--color-bg-muted)]">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${progress}%`,
                          background:
                            progress === 100 ? 'var(--color-success)' : 'var(--accent-default)',
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Footer: stats + timestamp */}
                <div className="flex items-center justify-between text-xs text-[var(--color-fg-subtle)]">
                  <span>
                    {issues.length} issue{issues.length !== 1 ? 's' : ''}
                    {openCount > 0 && (
                      <span className="text-[var(--color-fg-muted)]"> · {openCount} open</span>
                    )}
                  </span>
                  {project.updatedAt && <span>{formatRelative(project.updatedAt)}</span>}
                </div>
              </div>
            )
          })}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="Create your first project"
          description="Get started by creating a new project to organize your development workflow."
          action={{
            label: 'New Project',
            onClick: () => setShowNewModal(true),
          }}
        />
      ) : (
        <EmptyState
          icon={FolderKanban}
          title="No matching projects"
          description="Try adjusting your search query."
        />
      )}

      {/* New Project Modal */}
      <Modal
        isOpen={showNewModal}
        onClose={() => {
          setShowNewModal(false)
          setNewProjectName('')
          setNameError('')
        }}
        title="New Project"
        size="sm"
      >
        <Input
          label="Project name"
          value={newProjectName}
          onChange={(e) => {
            setNewProjectName(e.target.value)
            if (nameError) setNameError('')
          }}
          placeholder="My awesome project"
          onKeyDown={handleKeyDown}
          autoFocus
          required
          error={nameError}
        />
        <div className="mt-4 flex justify-end gap-2">
          <Button
            variant="ghost"
            onClick={() => {
              setShowNewModal(false)
              setNewProjectName('')
              setNameError('')
            }}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={handleCreate} disabled={!newProjectName.trim()}>
            Create Project
          </Button>
        </div>
      </Modal>

      {/* Move to Trash Confirmation */}
      <ConfirmDialog
        isOpen={!!trashTarget}
        onClose={() => setTrashTarget(null)}
        onConfirm={() => trashProject(trashTarget.id)}
        title={`Move "${trashTarget?.name}" to trash?`}
        message="The project will be moved to trash. You can restore it later or permanently delete it."
        confirmLabel="Move to Trash"
      />

      {/* Permanent Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!permanentDeleteTarget}
        onClose={() => setPermanentDeleteTarget(null)}
        onConfirm={() => permanentlyDeleteProject(permanentDeleteTarget.id)}
        title={`Permanently delete "${permanentDeleteTarget?.name}"?`}
        message="This will permanently remove the project and all its data. This action cannot be undone."
        confirmLabel="Delete Forever"
      />

      {/* Empty Trash Confirmation */}
      <ConfirmDialog
        isOpen={showEmptyTrashConfirm}
        onClose={() => setShowEmptyTrashConfirm(false)}
        onConfirm={() => {
          emptyTrash()
          setShowEmptyTrashConfirm(false)
          setShowTrash(false)
        }}
        title="Empty trash?"
        message={`This will permanently delete ${trashedProjects.length} project${trashedProjects.length !== 1 ? 's' : ''} and all their data. This action cannot be undone.`}
        confirmLabel="Empty Trash"
      />
    </div>
  )
}
