import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, Layers } from 'lucide-react'
import IssueTypeIcon from './IssueTypeIcon'
import { BacklogRow } from './BacklogView'
import ProgressBar from '../ui/ProgressBar'
import Badge from '../ui/Badge'
import EmptyState from '../ui/EmptyState'
import GlassCard from '../ui/GlassCard'

export default function EpicsView({ issues = [], onIssueClick, onDeleteIssue }) {
  const [expandedEpicId, setExpandedEpicId] = useState(null)

  const epicCards = useMemo(() => {
    const epics = issues.filter((i) => i.type === 'epic')
    return epics.map((epic) => {
      const children = issues.filter((i) => i.epicId === epic.id && i.id !== epic.id)
      const total = children.length
      const done = children.filter((c) => c.status === 'Done').length
      const inProgress = children.filter((c) => c.status === 'In Progress').length
      const toDo = total - done - inProgress
      const totalPoints = children.reduce((sum, c) => sum + (c.storyPoints ?? 0), 0)
      const donePoints = children
        .filter((c) => c.status === 'Done')
        .reduce((sum, c) => sum + (c.storyPoints ?? 0), 0)
      const progress = total > 0 ? Math.round((done / total) * 100) : 0
      return { ...epic, children, total, done, inProgress, toDo, totalPoints, donePoints, progress }
    })
  }, [issues])

  const orphanIssues = useMemo(() => {
    const epicIds = new Set(issues.filter((i) => i.type === 'epic').map((e) => e.id))
    return issues.filter((i) => i.type !== 'epic' && (!i.epicId || !epicIds.has(i.epicId)))
  }, [issues])

  if (epicCards.length === 0 && orphanIssues.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <EmptyState
          icon={Layers}
          title="No epics yet"
          description="Create an epic to group related stories, tasks, and bugs into larger bodies of work."
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Epic cards grid */}
      <div className="grid gap-4 lg:grid-cols-2">
        {epicCards.map((epic) => {
          const isExpanded = expandedEpicId === epic.id
          return (
            <GlassCard key={epic.id} className="overflow-hidden p-0">
              {/* Card header — clickable to expand */}
              <button
                type="button"
                onClick={() => setExpandedEpicId(isExpanded ? null : epic.id)}
                className="w-full cursor-pointer p-4 text-left transition-colors hover:bg-[var(--color-bg-glass-hover)]"
              >
                {/* Title row */}
                <div className="flex items-center gap-2">
                  <IssueTypeIcon type="epic" size={16} />
                  <span className="shrink-0 text-xs font-medium text-[var(--color-fg-muted)]">
                    {epic.key}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold text-[var(--color-fg-default)]">
                    {epic.title}
                  </span>
                  <motion.div
                    animate={{ rotate: isExpanded ? 90 : 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <ChevronRight size={14} className="text-[var(--color-fg-muted)]" />
                  </motion.div>
                </div>

                {/* Description preview */}
                {epic.description && (
                  <p className="mt-1.5 line-clamp-2 pl-6 text-xs text-[var(--color-fg-muted)]">
                    {epic.description}
                  </p>
                )}

                {/* Progress bar */}
                <div className="mt-3 pl-6">
                  <ProgressBar value={epic.progress} size="sm" />
                </div>

                {/* Stats row */}
                <div className="mt-2 flex flex-wrap items-center gap-2 pl-6">
                  <span className="text-xs font-medium text-[var(--color-fg-default)]">
                    {epic.done}/{epic.total} done
                  </span>
                  {epic.totalPoints > 0 && (
                    <>
                      <span className="text-[var(--color-fg-subtle)]">·</span>
                      <span className="text-xs text-[var(--color-fg-muted)]">
                        {epic.donePoints}/{epic.totalPoints} pts
                      </span>
                    </>
                  )}
                  {epic.total > 0 && (
                    <>
                      <span className="text-[var(--color-fg-subtle)]">·</span>
                      <div className="flex items-center gap-1.5">
                        {epic.toDo > 0 && (
                          <Badge variant="default" size="xs">
                            {epic.toDo} to do
                          </Badge>
                        )}
                        {epic.inProgress > 0 && (
                          <Badge variant="blue" size="xs">
                            {epic.inProgress} active
                          </Badge>
                        )}
                        {epic.done > 0 && (
                          <Badge variant="green" size="xs">
                            {epic.done} done
                          </Badge>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </button>

              {/* Expanded child issues */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden border-t border-[var(--color-border-default)]"
                  >
                    <div className="max-h-[400px] overflow-y-auto p-2">
                      {epic.children.length === 0 ? (
                        <p className="py-4 text-center text-xs text-[var(--color-fg-muted)]">
                          No child issues yet
                        </p>
                      ) : (
                        epic.children.map((child) => (
                          <BacklogRow
                            key={child.id}
                            issue={child}
                            onIssueClick={onIssueClick}
                            onDeleteIssue={onDeleteIssue}
                          />
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </GlassCard>
          )
        })}
      </div>

      {/* Orphan issues */}
      {orphanIssues.length > 0 && (
        <OrphanSection
          issues={orphanIssues}
          onIssueClick={onIssueClick}
          onDeleteIssue={onDeleteIssue}
        />
      )}
    </div>
  )
}

function OrphanSection({ issues, onIssueClick, onDeleteIssue }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <GlassCard className="p-0">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="flex w-full items-center gap-2 p-4 text-left transition-colors hover:bg-[var(--color-bg-glass-hover)]"
      >
        <motion.div animate={{ rotate: isOpen ? 90 : 0 }} transition={{ duration: 0.15 }}>
          <ChevronRight size={14} className="text-[var(--color-fg-muted)]" />
        </motion.div>
        <span className="text-sm font-medium text-[var(--color-fg-muted)]">
          Not assigned to an epic
        </span>
        <Badge variant="default" size="xs">
          {issues.length}
        </Badge>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-[var(--color-border-default)]"
          >
            <div className="max-h-[400px] overflow-y-auto p-2">
              {issues.map((issue) => (
                <BacklogRow
                  key={issue.id}
                  issue={issue}
                  onIssueClick={onIssueClick}
                  onDeleteIssue={onDeleteIssue}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  )
}
