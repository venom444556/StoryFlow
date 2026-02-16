import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronDown,
  ChevronRight,
  ArrowUpDown,
  MoreHorizontal,
  Pencil,
  Trash2,
  Layers,
  Tag,
} from 'lucide-react'
import IssueTypeIcon from './IssueTypeIcon'
import QuickCreateBar from './QuickCreateBar'
import Badge from '../ui/Badge'
import Avatar from '../ui/Avatar'
import DropdownMenu from '../ui/DropdownMenu'
import { getLabel } from '../../utils/labelDefinitions'

const PRIORITY_BADGE = {
  critical: 'red',
  high: 'yellow',
  medium: 'blue',
  low: 'gray',
}

const STATUS_BADGE = {
  'To Do': 'default',
  'In Progress': 'blue',
  Done: 'green',
}

const SORT_OPTIONS = [
  { key: 'priority', label: 'Priority' },
  { key: 'storyPoints', label: 'Story Points' },
  { key: 'status', label: 'Status' },
  { key: 'createdAt', label: 'Created Date' },
]

const PRIORITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 }
const STATUS_ORDER = { 'To Do': 0, 'In Progress': 1, Done: 2 }

const STATUS_ACCENT = {
  'To Do': 'bg-[var(--color-fg-faint)]',
  'In Progress': 'bg-blue-400',
  Done: 'bg-green-400',
}
const STATUS_NAMES = ['To Do', 'In Progress', 'Done']

function sortIssues(issues, sortKey, sortDir) {
  const sorted = [...issues]
  sorted.sort((a, b) => {
    let cmp = 0
    switch (sortKey) {
      case 'priority':
        cmp = (PRIORITY_ORDER[a.priority] ?? 99) - (PRIORITY_ORDER[b.priority] ?? 99)
        break
      case 'storyPoints':
        cmp = (a.storyPoints ?? 0) - (b.storyPoints ?? 0)
        break
      case 'status':
        cmp = (STATUS_ORDER[a.status] ?? 99) - (STATUS_ORDER[b.status] ?? 99)
        break
      case 'createdAt':
        cmp = new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
        break
      default:
        cmp = 0
    }
    return sortDir === 'asc' ? cmp : -cmp
  })
  return sorted
}

function BacklogRow({ issue, onIssueClick, onDeleteIssue }) {
  const labels = issue.labels || []
  const visibleLabels = labels.slice(0, 3)
  const overflowCount = labels.length - 3

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      onClick={() => onIssueClick?.(issue)}
      className="group cursor-pointer rounded-lg border border-transparent px-4 py-2.5 transition-all hover:border-[var(--color-border-default)] hover:bg-[var(--color-bg-glass-hover)]"
    >
      {/* Row 1: Type icon + Key + Title + Assignee */}
      <div className="flex items-center gap-2">
        <IssueTypeIcon type={issue.type} size={14} />
        <span className="shrink-0 text-xs font-medium text-[var(--color-fg-muted)]">
          {issue.key}
        </span>
        <span className="min-w-0 flex-1 truncate text-sm text-[var(--color-fg-muted)] group-hover:text-[var(--color-fg-default)]">
          {issue.title}
        </span>
        {issue.assignee && <Avatar name={issue.assignee} size="sm" />}
      </div>

      {/* Row 2: Priority + Points + Status + Labels + Actions */}
      <div className="mt-1.5 flex items-center gap-2 pl-6">
        {/* Priority */}
        <Badge variant={PRIORITY_BADGE[issue.priority] || 'default'} size="xs" dot>
          {issue.priority}
        </Badge>

        {/* Story points */}
        {issue.storyPoints !== null && issue.storyPoints !== undefined && (
          <span
            className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-bg-muted)] text-[10px] font-bold text-[var(--color-fg-muted)]"
            title={`${issue.storyPoints} story points`}
          >
            {issue.storyPoints}
          </span>
        )}

        {/* Status */}
        <Badge variant={STATUS_BADGE[issue.status] || 'default'} size="xs">
          {issue.status}
        </Badge>

        {/* Labels */}
        {labels.length > 0 && (
          <>
            <div className="h-3 w-px bg-[var(--color-border-default)]" />
            <div className="flex items-center gap-1">
              {visibleLabels.map((label) => {
                const def = getLabel(label)
                return (
                  <Badge key={label} variant="purple" size="xs">
                    {def && (
                      <span
                        className="mr-1 inline-block h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: def.color }}
                      />
                    )}
                    {label}
                  </Badge>
                )
              })}
              {overflowCount > 0 && (
                <span
                  className="flex items-center gap-0.5 text-[10px] text-[var(--color-fg-subtle)]"
                  title={labels.slice(3).join(', ')}
                >
                  <Tag size={9} />+{overflowCount}
                </span>
              )}
            </div>
          </>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Actions menu */}
        <div
          className="opacity-0 transition-opacity group-hover:opacity-100"
          onClick={(e) => e.stopPropagation()}
        >
          <DropdownMenu
            trigger={
              <button className="rounded-md p-1 text-[var(--color-fg-muted)] transition-colors hover:bg-[var(--color-bg-glass-hover)] hover:text-[var(--color-fg-default)]">
                <MoreHorizontal size={14} />
              </button>
            }
            items={[
              {
                icon: Pencil,
                label: 'Edit',
                onClick: () => onIssueClick?.(issue),
              },
              {
                icon: Trash2,
                label: 'Delete',
                danger: true,
                onClick: () => onDeleteIssue?.(issue.id),
              },
            ]}
          />
        </div>
      </div>
    </motion.div>
  )
}

function StatusGroupedList({ sortedIssues, onIssueClick, onDeleteIssue }) {
  const [collapsed, setCollapsed] = useState({})

  const toggle = (status) => setCollapsed((prev) => ({ ...prev, [status]: !prev[status] }))

  // Group issues by status
  const grouped = {}
  STATUS_NAMES.forEach((s) => {
    grouped[s] = []
  })
  const other = []
  sortedIssues.forEach((issue) => {
    if (grouped[issue.status]) {
      grouped[issue.status].push(issue)
    } else {
      other.push(issue)
    }
  })

  return (
    <div className="space-y-3">
      {STATUS_NAMES.map((statusName) => {
        const groupIssues = grouped[statusName]
        const isCollapsed = collapsed[statusName]
        return (
          <div
            key={statusName}
            className="rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-glass)] backdrop-blur-sm"
          >
            {/* Section header */}
            <button
              onClick={() => toggle(statusName)}
              className="flex w-full items-center gap-2.5 px-4 py-3 text-left transition-colors hover:bg-[var(--color-bg-glass-hover)] rounded-xl"
            >
              {isCollapsed ? (
                <ChevronRight size={14} className="text-[var(--color-fg-muted)]" />
              ) : (
                <ChevronDown size={14} className="text-[var(--color-fg-muted)]" />
              )}
              <span
                className={[
                  'h-2 w-2 shrink-0 rounded-full',
                  STATUS_ACCENT[statusName] || 'bg-[var(--color-fg-faint)]',
                ].join(' ')}
              />
              <h3 className="text-sm font-semibold text-[var(--color-fg-muted)]">{statusName}</h3>
              <Badge variant={STATUS_BADGE[statusName] || 'default'} size="sm">
                {groupIssues.length}
              </Badge>
            </button>

            {/* Collapsible body */}
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden border-t border-[var(--color-border-default)]"
                >
                  <div className="px-1 pb-2">
                    {groupIssues.length > 0 ? (
                      groupIssues.map((issue) => (
                        <BacklogRow
                          key={issue.id}
                          issue={issue}
                          onIssueClick={onIssueClick}
                          onDeleteIssue={onDeleteIssue}
                        />
                      ))
                    ) : (
                      <p className="py-4 text-center text-xs text-[var(--color-fg-subtle)]">
                        No issues
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}

      {/* Catch-all for unknown statuses */}
      {other.length > 0 && (
        <div className="rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-glass)] backdrop-blur-sm">
          <button
            onClick={() => toggle('__other')}
            className="flex w-full items-center gap-2.5 px-4 py-3 text-left transition-colors hover:bg-[var(--color-bg-glass-hover)] rounded-xl"
          >
            {collapsed['__other'] ? (
              <ChevronRight size={14} className="text-[var(--color-fg-muted)]" />
            ) : (
              <ChevronDown size={14} className="text-[var(--color-fg-muted)]" />
            )}
            <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--color-fg-faint)]" />
            <h3 className="text-sm font-semibold text-[var(--color-fg-muted)]">Other</h3>
            <Badge variant="default" size="sm">
              {other.length}
            </Badge>
          </button>
          <AnimatePresence>
            {!collapsed['__other'] && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden border-t border-[var(--color-border-default)]"
              >
                <div className="px-1 pb-2">
                  {other.map((issue) => (
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
        </div>
      )}
    </div>
  )
}

export default function BacklogView({
  issues = [],
  onUpdateIssue: _onUpdateIssue,
  onCreateIssue,
  onDeleteIssue,
  onIssueClick,
}) {
  const [sortKey, setSortKey] = useState('priority')
  const [sortDir, setSortDir] = useState('asc')
  const [groupByEpic, setGroupByEpic] = useState(false)

  const toggleSort = useCallback(
    (key) => {
      if (sortKey === key) {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
      } else {
        setSortKey(key)
        setSortDir('asc')
      }
    },
    [sortKey]
  )

  const sortedIssues = useMemo(
    () => sortIssues(issues, sortKey, sortDir),
    [issues, sortKey, sortDir]
  )

  // Group by epic
  const epicGroups = useMemo(() => {
    if (!groupByEpic) return null

    const epics = issues.filter((i) => i.type === 'epic')
    const epicMap = {}
    epics.forEach((epic) => {
      epicMap[epic.id] = { epic, children: [] }
    })

    const noEpic = []
    const nonEpicIssues = sortedIssues.filter((i) => i.type !== 'epic')

    nonEpicIssues.forEach((issue) => {
      if (issue.epicId && epicMap[issue.epicId]) {
        epicMap[issue.epicId].children.push(issue)
      } else {
        noEpic.push(issue)
      }
    })

    return { epicMap, noEpic, epicIds: Object.keys(epicMap) }
  }, [groupByEpic, issues, sortedIssues])

  return (
    <div className="space-y-3">
      {/* Toolbar: sort + create + group toggle */}
      <div className="flex items-center gap-3">
        {/* Sort buttons */}
        <div className="flex items-center gap-1">
          <span className="mr-1 text-xs text-[var(--color-fg-muted)]">Sort:</span>
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => toggleSort(opt.key)}
              className={[
                'flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors',
                sortKey === opt.key
                  ? 'bg-[var(--color-bg-glass-hover)] text-[var(--color-fg-default)]'
                  : 'text-[var(--color-fg-muted)] hover:bg-[var(--color-bg-glass)] hover:text-[var(--color-fg-muted)]',
              ].join(' ')}
            >
              {opt.label}
              {sortKey === opt.key && (
                <ArrowUpDown size={10} className={sortDir === 'desc' ? 'rotate-180' : ''} />
              )}
            </button>
          ))}
        </div>

        {/* Quick create inline */}
        <div className="min-w-0 flex-1">
          <QuickCreateBar onCreateIssue={onCreateIssue} defaultStatus="To Do" />
        </div>

        {/* Group by epic toggle */}
        <button
          onClick={() => setGroupByEpic((v) => !v)}
          className={[
            'flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs transition-colors',
            groupByEpic
              ? 'text-[var(--color-fg-default)]'
              : 'text-[var(--color-fg-muted)] hover:bg-[var(--color-bg-glass)] hover:text-[var(--color-fg-muted)]',
          ].join(' ')}
          style={
            groupByEpic
              ? { backgroundColor: 'rgba(var(--accent-active-rgb, 139, 92, 246), 0.2)' }
              : undefined
          }
        >
          <Layers size={12} />
          Group by Epic
        </button>
      </div>

      {/* Issue sections */}
      {!groupByEpic ? (
        <StatusGroupedList
          sortedIssues={sortedIssues}
          onIssueClick={onIssueClick}
          onDeleteIssue={onDeleteIssue}
        />
      ) : (
        <EpicGroupedList
          epicGroups={epicGroups}
          onIssueClick={onIssueClick}
          onDeleteIssue={onDeleteIssue}
        />
      )}
    </div>
  )
}

function EpicGroupedList({ epicGroups, onIssueClick, onDeleteIssue }) {
  const [collapsed, setCollapsed] = useState({})

  if (!epicGroups) return null

  const toggle = (id) => setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }))

  return (
    <div className="space-y-3">
      {epicGroups.epicIds.map((epicId) => {
        const { epic, children } = epicGroups.epicMap[epicId]
        const isCollapsed = collapsed[epicId]
        return (
          <div
            key={epicId}
            className="rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-glass)] backdrop-blur-sm"
          >
            {/* Epic header */}
            <button
              onClick={() => toggle(epicId)}
              className="flex w-full items-center gap-2.5 px-4 py-3 text-left transition-colors hover:bg-[var(--color-bg-glass-hover)] rounded-xl"
            >
              {isCollapsed ? (
                <ChevronRight size={14} className="text-[var(--color-fg-muted)]" />
              ) : (
                <ChevronDown size={14} className="text-[var(--color-fg-muted)]" />
              )}
              <IssueTypeIcon type="epic" size={14} />
              <span className="text-xs font-medium text-[var(--color-fg-muted)]">{epic.key}</span>
              <span
                className="flex-1 text-sm font-medium"
                style={{ color: 'var(--accent-active, #8b5cf6)' }}
              >
                {epic.title}
              </span>
              <Badge variant="purple" size="sm">
                {children.length} issues
              </Badge>
            </button>

            {/* Children */}
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden border-t border-[var(--color-border-default)]"
                >
                  <div className="px-1 pb-2">
                    {children.map((issue) => (
                      <BacklogRow
                        key={issue.id}
                        issue={issue}
                        onIssueClick={onIssueClick}
                        onDeleteIssue={onDeleteIssue}
                      />
                    ))}
                    {children.length === 0 && (
                      <p className="py-4 text-center text-xs text-[var(--color-fg-subtle)]">
                        No issues assigned to this epic.
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}

      {/* Orphan issues (no epic) */}
      {epicGroups.noEpic.length > 0 && (
        <div className="rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-glass)] backdrop-blur-sm">
          <button
            onClick={() => toggle('__noEpic')}
            className="flex w-full items-center gap-2.5 px-4 py-3 text-left transition-colors hover:bg-[var(--color-bg-glass-hover)] rounded-xl"
          >
            {collapsed['__noEpic'] ? (
              <ChevronRight size={14} className="text-[var(--color-fg-muted)]" />
            ) : (
              <ChevronDown size={14} className="text-[var(--color-fg-muted)]" />
            )}
            <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--color-fg-faint)]" />
            <h3 className="text-sm font-semibold text-[var(--color-fg-muted)]">No Epic</h3>
            <Badge variant="default" size="sm">
              {epicGroups.noEpic.length}
            </Badge>
          </button>
          <AnimatePresence>
            {!collapsed['__noEpic'] && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden border-t border-[var(--color-border-default)]"
              >
                <div className="px-1 pb-2">
                  {epicGroups.noEpic.map((issue) => (
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
        </div>
      )}
    </div>
  )
}
