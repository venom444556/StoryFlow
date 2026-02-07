import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FolderKanban, Plus, Trash2 } from 'lucide-react'
import { useProjects } from '../hooks/useProjects'
import GlassCard from '../components/ui/GlassCard'
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

const STATUS_ACCENT_COLOR = {
  planning: 'bg-blue-500',
  'in-progress': 'bg-yellow-500',
  completed: 'bg-green-500',
  archived: 'bg-gray-500',
}

const TECH_BADGE_VARIANTS = ['purple', 'blue', 'cyan', 'green', 'pink']

export default function DashboardPage() {
  const { projects, addProject, deleteProject } = useProjects()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [showNewModal, setShowNewModal] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleCreate = () => {
    const name = newProjectName.trim() || 'Untitled Project'
    const project = addProject(name)
    setShowNewModal(false)
    setNewProjectName('')
    navigate(`/project/${project.id}`)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleCreate()
  }

  return (
    <div className="p-6">
      {/* Title section */}
      <div className="mb-6">
        <h1 className="gradient-text text-2xl font-bold">Projects</h1>
        <p className="mt-1 text-sm text-slate-500">
          {projects.length} project{projects.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Action bar */}
      <div className="mb-6 flex items-center gap-3">
        <SearchBar
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search projects..."
          className="max-w-xs"
        />
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => setShowNewModal(true)}
        >
          New Project
        </Button>
      </div>

      {/* Project grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project) => {
            const statusVariant =
              STATUS_BADGE_VARIANT[project.status] || 'default'
            const accentColor =
              STATUS_ACCENT_COLOR[project.status] || 'bg-gray-500'
            const issues = project.board?.issues || []
            const openCount = issues.filter(
              (i) => i.status !== 'Done'
            ).length

            return (
              <GlassCard
                key={project.id}
                hover
                padding="none"
                onClick={() => navigate(`/project/${project.id}`)}
              >
                {/* Color accent bar */}
                <div className={`h-1 w-full ${accentColor}`} />

                <div className="p-5">
                  {/* Project name + delete */}
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <h3 className="truncate text-base font-semibold text-white">
                      {project.name}
                    </h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setDeleteTarget(project)
                      }}
                      className="shrink-0 rounded-md p-1 text-slate-600 transition-colors hover:bg-red-500/10 hover:text-red-400"
                      title="Delete project"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* Status badge */}
                  <div className="mb-3">
                    <Badge variant={statusVariant} dot size="sm">
                      {project.status}
                    </Badge>
                  </div>

                  {/* Tech stack badges */}
                  {project.techStack && project.techStack.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-1">
                      {project.techStack.slice(0, 3).map((tech, i) => (
                        <Badge
                          key={tech}
                          variant={
                            TECH_BADGE_VARIANTS[i % TECH_BADGE_VARIANTS.length]
                          }
                          size="sm"
                        >
                          {tech}
                        </Badge>
                      ))}
                      {project.techStack.length > 3 && (
                        <Badge variant="default" size="sm">
                          +{project.techStack.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Issue summary */}
                  <p className="mb-2 text-xs text-slate-500">
                    {issues.length} issue{issues.length !== 1 ? 's' : ''}
                    {openCount > 0 && `, ${openCount} open`}
                  </p>

                  {/* Last updated */}
                  <p className="text-xs text-slate-600">
                    Updated {formatRelative(project.updatedAt)}
                  </p>
                </div>
              </GlassCard>
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
        }}
        title="New Project"
        size="sm"
      >
        <Input
          label="Project name"
          value={newProjectName}
          onChange={(e) => setNewProjectName(e.target.value)}
          placeholder="My awesome project"
          onKeyDown={handleKeyDown}
          autoFocus
        />
        <div className="mt-4 flex justify-end gap-2">
          <Button
            variant="ghost"
            onClick={() => {
              setShowNewModal(false)
              setNewProjectName('')
            }}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={handleCreate}>
            Create Project
          </Button>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteProject(deleteTarget.id)}
        title={`Delete "${deleteTarget?.name}"?`}
        message="This will permanently remove the project and all its data. This action cannot be undone."
        confirmLabel="Delete Project"
      />
    </div>
  )
}
