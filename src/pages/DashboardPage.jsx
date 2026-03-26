import { useState, useEffect } from 'react'
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

// Agent-priority dashboard card
function ProjectCard({ project, index, navigate, setTrashTarget }) {
  const [opData, setOpData] = useState(null)

  useEffect(() => {
    let mounted = true
    fetch(`/api/projects/${encodeURIComponent(project.id)}/operational`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (mounted && data) setOpData(data)
      })
      .catch(() => {})
    return () => {
      mounted = false
    }
  }, [project.id])

  const op = opData || {}
  const issues = project.board?.issues || []
  const doneCount = issues.filter((i) => i.status === 'Done').length
  const progress = issues.length > 0 ? Math.round((doneCount / issues.length) * 100) : 0

  const statusObj = op.agentState || {}
  const agentStateStr = statusObj.status || 'unavailable'
  const pendingGatesStr =
    op.pendingGatesCount !== undefined ? `${op.pendingGatesCount} pending` : 'No live gate data'

  const blockerCount = Array.isArray(op.activeBlockers) ? op.activeBlockers.length : undefined
  const blockersStr =
    blockerCount !== undefined ? `${blockerCount} active` : 'Blocker summary unavailable'

  const lastActivityStr = op.lastAgentActivity?.timestamp
    ? formatRelative(op.lastAgentActivity.timestamp)
    : 'Last activity unavailable'

  let agentStateClass =
    'bg-[var(--color-bg-muted)] text-[var(--color-fg-muted)] border-[var(--color-border-muted)]'
  if (agentStateStr === 'working')
    agentStateClass = 'provenance-ai text-[var(--color-ai)] border-[var(--color-ai-border)]'
  if (agentStateStr === 'blocked')
    agentStateClass =
      'state-gate-rejected text-[var(--color-danger)] border-[var(--color-gate-rejected-border)]'
  if (agentStateStr === 'needs-review')
    agentStateClass =
      'state-gate-pending text-[var(--color-gate-pending)] border-[var(--color-gate-pending-border)]'

  return (
    <div
      onClick={() => navigate(`/project/${project.id}/overview`)}
      className={[
        'glass-card-elevated group flex h-full min-h-[25rem] cursor-pointer flex-col p-6',
        `animate-entrance-scale stagger-${Math.min(index + 2, 8)}`,
      ].join(' ')}
    >
      <div className="mb-4 flex min-h-12 items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3
            className="truncate text-lg font-semibold tracking-tight text-[var(--color-fg-default)] group-hover:text-[var(--accent-default)] transition-colors"
            style={{ transitionDuration: 'var(--duration-fast)' }}
          >
            {project.name}
          </h3>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            setTrashTarget(project)
          }}
          className="shrink-0 rounded-md p-1.5 text-[var(--color-fg-subtle)] opacity-0 group-hover:opacity-100 transition-all hover:bg-[var(--color-danger-subtle)] hover:text-[var(--color-danger-fg)]"
          title="Move to trash"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="mb-6 grid auto-rows-fr grid-cols-2 gap-3 rounded-md border border-[var(--color-border-muted)] bg-[var(--color-bg-glass)] p-3">
        <div className="flex min-h-[4.5rem] flex-col gap-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-fg-faint)]">
            Agent State
          </span>
          <span
            className={`text-xs px-2 py-0.5 rounded border inline-flex items-center w-fit ${agentStateClass}`}
          >
            {agentStateStr}
          </span>
        </div>
        <div className="flex min-h-[4.5rem] flex-col gap-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-fg-faint)]">
            Gates
          </span>
          <span
            className={`text-xs font-medium ${op.pendingGatesCount > 0 ? 'text-[var(--color-gate-pending)]' : 'text-[var(--color-fg-muted)]'}`}
          >
            {pendingGatesStr}
          </span>
        </div>
        <div className="flex min-h-[4.5rem] flex-col gap-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-fg-faint)]">
            Blockers
          </span>
          <span
            className={`text-xs font-medium ${blockerCount > 0 ? 'text-[var(--color-danger)]' : 'text-[var(--color-fg-muted)]'}`}
          >
            {blockersStr}
          </span>
        </div>
        <div className="flex min-h-[4.5rem] flex-col gap-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-fg-faint)]">
            Last Activity
          </span>
          <span
            className="line-clamp-2 text-xs leading-5 text-[var(--color-fg-muted)]"
            title={lastActivityStr}
          >
            {lastActivityStr}
          </span>
        </div>
      </div>

      <div className="flex-1" />

      {issues.length > 0 ? (
        <div className="mb-4 min-h-[3.25rem]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-[var(--color-fg-subtle)]">
              {doneCount}/{issues.length} issues done
            </span>
            <span className="text-xs font-medium text-[var(--color-fg-muted)]">{progress}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-[var(--color-border-muted)] overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${progress}%`,
                background: progress === 100 ? 'var(--color-success)' : 'var(--color-fg-subtle)',
              }}
            />
          </div>
        </div>
      ) : (
        <div className="mb-4 flex min-h-[3.25rem] items-end text-xs italic text-[var(--color-fg-faint)]">
          No issues tracked
        </div>
      )}

      <div className="flex min-h-[3.5rem] flex-col justify-end gap-2 border-t border-[var(--color-border-muted)] pt-3">
        {project.techStack && project.techStack.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {project.techStack.slice(0, 3).map((tech) => (
              <span
                key={tech}
                className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--color-bg-subtle)] text-[var(--color-fg-subtle)] border border-[var(--color-border-muted)]"
              >
                {tech}
              </span>
            ))}
            {project.techStack.length > 3 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--color-bg-subtle)] text-[var(--color-fg-subtle)] border border-[var(--color-border-muted)]">
                +{project.techStack.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

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
  const [newProjectTechStack, setNewProjectTechStack] = useState('')
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
    const techStack = newProjectTechStack
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
    const project = addProject(name, { techStack })
    setShowNewModal(false)
    setNewProjectName('')
    setNewProjectTechStack('')
    navigate(`/project/${project.id}/overview`)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleCreate()
  }

  return (
    <div className="h-full overflow-auto p-8 lg:p-12">
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between animate-entrance">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-fg-default)]">
            Projects
          </h1>
          <p className="mt-3 text-base text-[var(--color-fg-muted)]">
            {projects.length} Project{projects.length !== 1 ? 's' : ''}
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
        <div className="grid auto-rows-fr grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={index}
              navigate={navigate}
              setTrashTarget={setTrashTarget}
            />
          ))}
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
          setNewProjectTechStack('')
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
        <div className="mt-3">
          <Input
            label="Tech stack"
            value={newProjectTechStack}
            onChange={(e) => setNewProjectTechStack(e.target.value)}
            placeholder="React, Node.js, PostgreSQL"
            onKeyDown={handleKeyDown}
          />
          <p className="mt-1 text-xs text-[var(--color-fg-subtle)]">
            Comma-separated list of technologies
          </p>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button
            variant="ghost"
            onClick={() => {
              setShowNewModal(false)
              setNewProjectName('')
              setNewProjectTechStack('')
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
