import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  ChevronRight,
  ArrowUpDown,
  MoreHorizontal,
  Pencil,
  Trash2,
  Layers,
} from 'lucide-react';
import IssueTypeIcon from './IssueTypeIcon';
import QuickCreateBar from './QuickCreateBar';
import Badge from '../ui/Badge';
import DropdownMenu from '../ui/DropdownMenu';
import { getPriorityColor } from '../../utils/colors';

const PRIORITY_BADGE = {
  critical: 'red',
  high: 'yellow',
  medium: 'blue',
  low: 'gray',
};

const STATUS_BADGE = {
  'To Do': 'default',
  'In Progress': 'blue',
  Done: 'green',
};

const SORT_OPTIONS = [
  { key: 'priority', label: 'Priority' },
  { key: 'storyPoints', label: 'Story Points' },
  { key: 'status', label: 'Status' },
  { key: 'createdAt', label: 'Created Date' },
];

const PRIORITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };
const STATUS_ORDER = { 'To Do': 0, 'In Progress': 1, Done: 2 };

function sortIssues(issues, sortKey, sortDir) {
  const sorted = [...issues];
  sorted.sort((a, b) => {
    let cmp = 0;
    switch (sortKey) {
      case 'priority':
        cmp =
          (PRIORITY_ORDER[a.priority] ?? 99) -
          (PRIORITY_ORDER[b.priority] ?? 99);
        break;
      case 'storyPoints':
        cmp = (a.storyPoints ?? 0) - (b.storyPoints ?? 0);
        break;
      case 'status':
        cmp =
          (STATUS_ORDER[a.status] ?? 99) - (STATUS_ORDER[b.status] ?? 99);
        break;
      case 'createdAt':
        cmp = new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        break;
      default:
        cmp = 0;
    }
    return sortDir === 'asc' ? cmp : -cmp;
  });
  return sorted;
}

function BacklogRow({ issue, onIssueClick, onDeleteIssue }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      onClick={() => onIssueClick?.(issue)}
      className="group flex cursor-pointer items-center gap-3 rounded-lg border border-transparent px-4 py-2.5 transition-all hover:border-white/[0.06] hover:bg-white/[0.04]"
    >
      {/* Type icon */}
      <IssueTypeIcon type={issue.type} size={14} />

      {/* Key */}
      <span className="w-16 shrink-0 text-xs font-medium text-slate-500">
        {issue.key}
      </span>

      {/* Title */}
      <span className="min-w-0 flex-1 truncate text-sm text-slate-300 group-hover:text-white">
        {issue.title}
      </span>

      {/* Priority */}
      <Badge variant={PRIORITY_BADGE[issue.priority] || 'default'} size="sm" dot>
        {issue.priority}
      </Badge>

      {/* Story points */}
      <span className="flex h-5 w-8 items-center justify-center text-xs text-slate-500">
        {issue.storyPoints != null ? issue.storyPoints : '--'}
      </span>

      {/* Status */}
      <Badge variant={STATUS_BADGE[issue.status] || 'default'} size="sm">
        {issue.status}
      </Badge>

      {/* Labels */}
      <div className="flex w-20 items-center gap-1 overflow-hidden">
        {(issue.labels || []).slice(0, 2).map((label) => (
          <Badge key={label} variant="purple" size="sm">
            {label}
          </Badge>
        ))}
        {(issue.labels || []).length > 2 && (
          <span className="text-[10px] text-slate-600">
            +{issue.labels.length - 2}
          </span>
        )}
      </div>

      {/* Actions menu */}
      <div
        className="opacity-0 transition-opacity group-hover:opacity-100"
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownMenu
          trigger={
            <button className="rounded-md p-1 text-slate-500 transition-colors hover:bg-white/10 hover:text-white">
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
    </motion.div>
  );
}

export default function BacklogView({
  issues = [],
  onUpdateIssue,
  onCreateIssue,
  onDeleteIssue,
  onIssueClick,
}) {
  const [sortKey, setSortKey] = useState('priority');
  const [sortDir, setSortDir] = useState('asc');
  const [groupByEpic, setGroupByEpic] = useState(false);

  const toggleSort = useCallback(
    (key) => {
      if (sortKey === key) {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortKey(key);
        setSortDir('asc');
      }
    },
    [sortKey]
  );

  const sortedIssues = useMemo(
    () => sortIssues(issues, sortKey, sortDir),
    [issues, sortKey, sortDir]
  );

  // Group by epic
  const epicGroups = useMemo(() => {
    if (!groupByEpic) return null;

    const epics = issues.filter((i) => i.type === 'epic');
    const epicMap = {};
    epics.forEach((epic) => {
      epicMap[epic.id] = { epic, children: [] };
    });

    const noEpic = [];
    const nonEpicIssues = sortedIssues.filter((i) => i.type !== 'epic');

    nonEpicIssues.forEach((issue) => {
      if (issue.epicId && epicMap[issue.epicId]) {
        epicMap[issue.epicId].children.push(issue);
      } else {
        noEpic.push(issue);
      }
    });

    return { epicMap, noEpic, epicIds: Object.keys(epicMap) };
  }, [groupByEpic, issues, sortedIssues]);

  return (
    <div className="space-y-3">
      {/* Quick create */}
      <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-3">
        <QuickCreateBar onCreateIssue={onCreateIssue} defaultStatus="To Do" />
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        {/* Sort buttons */}
        <div className="flex items-center gap-1">
          <span className="mr-1 text-xs text-slate-500">Sort:</span>
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => toggleSort(opt.key)}
              className={[
                'flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors',
                sortKey === opt.key
                  ? 'bg-white/10 text-white'
                  : 'text-slate-500 hover:bg-white/[0.05] hover:text-slate-300',
              ].join(' ')}
            >
              {opt.label}
              {sortKey === opt.key && (
                <ArrowUpDown
                  size={10}
                  className={sortDir === 'desc' ? 'rotate-180' : ''}
                />
              )}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        {/* Group by epic toggle */}
        <button
          onClick={() => setGroupByEpic((v) => !v)}
          className={[
            'flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs transition-colors',
            groupByEpic
              ? 'text-white'
              : 'text-slate-500 hover:bg-white/[0.05] hover:text-slate-300',
          ].join(' ')}
          style={groupByEpic ? { backgroundColor: 'rgba(var(--accent-active-rgb, 139, 92, 246), 0.2)' } : undefined}
        >
          <Layers size={12} />
          Group by Epic
        </button>
      </div>

      {/* Table header */}
      <div className="flex items-center gap-3 border-b border-white/[0.06] px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
        <span className="w-6" />
        <span className="w-16">Key</span>
        <span className="flex-1">Title</span>
        <span className="w-20 text-center">Priority</span>
        <span className="w-8 text-center">Pts</span>
        <span className="w-24 text-center">Status</span>
        <span className="w-20">Labels</span>
        <span className="w-8" />
      </div>

      {/* Issue rows */}
      {!groupByEpic ? (
        <div className="space-y-0.5">
          <AnimatePresence mode="popLayout">
            {sortedIssues.map((issue) => (
              <BacklogRow
                key={issue.id}
                issue={issue}
                onIssueClick={onIssueClick}
                onDeleteIssue={onDeleteIssue}
              />
            ))}
          </AnimatePresence>

          {sortedIssues.length === 0 && (
            <div className="py-16 text-center text-sm text-slate-600">
              No issues in the backlog. Create one above.
            </div>
          )}
        </div>
      ) : (
        <EpicGroupedList
          epicGroups={epicGroups}
          onIssueClick={onIssueClick}
          onDeleteIssue={onDeleteIssue}
        />
      )}
    </div>
  );
}

function EpicGroupedList({ epicGroups, onIssueClick, onDeleteIssue }) {
  const [collapsed, setCollapsed] = useState({});

  if (!epicGroups) return null;

  const toggle = (id) =>
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="space-y-2">
      {epicGroups.epicIds.map((epicId) => {
        const { epic, children } = epicGroups.epicMap[epicId];
        const isCollapsed = collapsed[epicId];
        return (
          <div key={epicId}>
            {/* Epic header */}
            <button
              onClick={() => toggle(epicId)}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors"
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(var(--accent-active-rgb, 139, 92, 246), 0.06)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}
            >
              {isCollapsed ? (
                <ChevronRight size={14} className="text-slate-500" />
              ) : (
                <ChevronDown size={14} className="text-slate-500" />
              )}
              <IssueTypeIcon type="epic" size={14} />
              <span className="text-xs font-medium text-slate-500">
                {epic.key}
              </span>
              <span className="flex-1 text-sm font-medium" style={{ color: 'var(--accent-active, #8b5cf6)' }}>
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
                  className="ml-5 overflow-hidden border-l border-white/[0.04] pl-3"
                >
                  {children.map((issue) => (
                    <BacklogRow
                      key={issue.id}
                      issue={issue}
                      onIssueClick={onIssueClick}
                      onDeleteIssue={onDeleteIssue}
                    />
                  ))}
                  {children.length === 0 && (
                    <p className="py-3 text-xs text-slate-600">
                      No issues assigned to this epic.
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}

      {/* Orphan issues (no epic) */}
      {epicGroups.noEpic.length > 0 && (
        <div>
          <div className="flex items-center gap-2 px-3 py-2">
            <span className="text-sm font-medium text-slate-500">
              No Epic
            </span>
            <Badge variant="default" size="sm">
              {epicGroups.noEpic.length}
            </Badge>
          </div>
          <div className="ml-5 border-l border-white/[0.04] pl-3">
            {epicGroups.noEpic.map((issue) => (
              <BacklogRow
                key={issue.id}
                issue={issue}
                onIssueClick={onIssueClick}
                onDeleteIssue={onDeleteIssue}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
