import React, { useState, useMemo, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  LayoutGrid,
  List,
  Layers,
  BarChart3,
} from 'lucide-react';
import SprintBoard from '../board/SprintBoard';
import BacklogView from '../board/BacklogView';
import FilterBar from '../board/FilterBar';
import EpicSidebar from '../board/EpicSidebar';
import IssueDetail from '../board/IssueDetail';
import BurndownChart from '../board/BurndownChart';
import VelocityChart from '../board/VelocityChart';

const SUB_TABS = [
  { key: 'board', label: 'Board', icon: LayoutGrid },
  { key: 'backlog', label: 'Backlog', icon: List },
  { key: 'epics', label: 'Epics', icon: Layers },
  { key: 'charts', label: 'Charts', icon: BarChart3 },
];

const EMPTY_FILTERS = {
  types: [],
  priorities: [],
  assignees: [],
  labelFilter: [],
  search: '',
};

// Generate sample burndown / velocity data from current issues
function computeChartData(issues) {
  // Burndown: simulate from total points for a default 10-day sprint
  const totalPoints = issues.reduce(
    (sum, i) => sum + (i.storyPoints ?? 0),
    0
  );
  const donePoints = issues
    .filter((i) => i.status === 'Done')
    .reduce((sum, i) => sum + (i.storyPoints ?? 0), 0);
  const inProgressPoints = issues
    .filter((i) => i.status === 'In Progress')
    .reduce((sum, i) => sum + (i.storyPoints ?? 0), 0);

  const days = 10;
  const burndown = [];
  for (let d = 0; d <= days; d++) {
    const ideal = totalPoints - (totalPoints / days) * d;
    // Simulate actual based on current completion
    const fraction = d / days;
    const completedSoFar =
      donePoints * Math.min(fraction * 1.3, 1) +
      inProgressPoints * Math.min(fraction * 0.6, 0.5);
    const actual = Math.max(0, totalPoints - completedSoFar);
    burndown.push({
      date: `Day ${d}`,
      ideal: Math.round(ideal * 10) / 10,
      actual: Math.round(actual * 10) / 10,
    });
  }

  // Velocity: group completed issues by a simple mock sprint model
  const doneIssues = issues.filter((i) => i.status === 'Done');
  const velocity = [];
  if (doneIssues.length > 0) {
    // Create a couple mock sprints from done issues
    const chunkSize = Math.max(1, Math.ceil(doneIssues.length / 3));
    for (let s = 0; s < 3; s++) {
      const chunk = doneIssues.slice(s * chunkSize, (s + 1) * chunkSize);
      if (chunk.length > 0) {
        velocity.push({
          name: `Sprint ${s + 1}`,
          points: chunk.reduce((sum, i) => sum + (i.storyPoints ?? 1), 0),
        });
      }
    }
  }

  return { burndown, velocity };
}

export default function BoardTab({
  project,
  addIssue,
  updateIssue,
  deleteIssue,
}) {
  const [activeView, setActiveView] = useState('board');
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [showEpicSidebar, setShowEpicSidebar] = useState(false);
  const [activeEpicId, setActiveEpicId] = useState(null);

  const board = project?.board;
  const allIssues = board?.issues ?? [];
  const statusColumns = board?.statusColumns ?? ['To Do', 'In Progress', 'Done'];

  // Collect all unique labels for filter bar
  const allLabels = useMemo(() => {
    const labelSet = new Set();
    allIssues.forEach((i) => (i.labels || []).forEach((l) => labelSet.add(l)));
    return Array.from(labelSet).sort();
  }, [allIssues]);

  // Collect epics for filter bar
  const allEpics = useMemo(
    () => allIssues.filter((i) => i.type === 'epic'),
    [allIssues]
  );

  // Apply filters
  const filteredIssues = useMemo(() => {
    let result = allIssues;

    // Epic filter (from sidebar)
    if (activeEpicId) {
      result = result.filter(
        (i) => i.id === activeEpicId || i.epicId === activeEpicId
      );
    }

    // Type filter
    if (filters.types.length > 0) {
      result = result.filter((i) => filters.types.includes(i.type));
    }

    // Priority filter
    if (filters.priorities.length > 0) {
      result = result.filter((i) => filters.priorities.includes(i.priority));
    }

    // Assignee filter
    if (filters.assignees.length > 0) {
      result = result.filter((i) => {
        if (filters.assignees.includes('__none__') && !i.assignee) return true;
        return filters.assignees.includes(i.assignee);
      });
    }

    // Label filter
    if (filters.labelFilter.length > 0) {
      result = result.filter((i) =>
        filters.labelFilter.some((l) => (i.labels || []).includes(l))
      );
    }

    // Search filter
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (i) =>
          i.title?.toLowerCase().includes(q) ||
          i.key?.toLowerCase().includes(q) ||
          i.description?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [allIssues, filters, activeEpicId]);

  // Chart data
  const chartData = useMemo(() => computeChartData(allIssues), [allIssues]);

  // Handlers
  const handleIssueClick = useCallback(
    (issue) => {
      setSelectedIssue(issue);
    },
    []
  );

  const handleCloseDetail = useCallback(() => {
    setSelectedIssue(null);
  }, []);

  const handleUpdateIssue = useCallback(
    (issueId, updates) => {
      updateIssue?.(issueId, updates);
      // Update the selected issue in-memory so the panel shows changes immediately
      setSelectedIssue((prev) => {
        if (prev && prev.id === issueId) {
          return { ...prev, ...updates };
        }
        return prev;
      });
    },
    [updateIssue]
  );

  const handleCreateIssue = useCallback(
    (issueData) => {
      const nextNumber = board?.nextIssueNumber ?? 1;
      addIssue?.({
        key: `SF-${nextNumber}`,
        ...issueData,
      });
    },
    [addIssue, board?.nextIssueNumber]
  );

  const handleDeleteIssue = useCallback(
    (issueId) => {
      deleteIssue?.(issueId);
      if (selectedIssue?.id === issueId) {
        setSelectedIssue(null);
      }
    },
    [deleteIssue, selectedIssue?.id]
  );

  const handleFilterByEpic = useCallback((epicId) => {
    setActiveEpicId(epicId);
  }, []);

  if (!project) return null;

  return (
    <div className="flex h-full flex-col">
      {/* Sub-navigation tabs */}
      <div className="mb-4 flex items-center gap-1 overflow-x-auto rounded-xl border border-white/[0.05] bg-white/[0.02] p-1">
        {SUB_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeView === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => {
                setActiveView(tab.key);
                // Auto-show epic sidebar in epics view
                if (tab.key === 'epics') {
                  setShowEpicSidebar(true);
                }
              }}
              className={[
                'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-white/10 text-white shadow-sm'
                  : 'text-slate-500 hover:bg-white/[0.04] hover:text-slate-300',
              ].join(' ')}
            >
              <Icon size={15} />
              {tab.label}
            </button>
          );
        })}

        <div className="flex-1" />

        {/* Epic sidebar toggle (for board view) */}
        {(activeView === 'board' || activeView === 'epics') && (
          <button
            onClick={() => setShowEpicSidebar((v) => !v)}
            className={[
              'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
              showEpicSidebar
                ? 'text-white'
                : 'text-slate-500 hover:bg-white/[0.05] hover:text-slate-300',
            ].join(' ')}
            style={showEpicSidebar ? { backgroundColor: 'rgba(var(--accent-active-rgb, 139, 92, 246), 0.15)' } : undefined}
          >
            <Layers size={13} />
            Epics
          </button>
        )}
      </div>

      {/* Filter bar (visible for board and backlog views) */}
      {(activeView === 'board' || activeView === 'backlog' || activeView === 'epics') && (
        <div className="mb-4">
          <FilterBar
            filters={filters}
            onFilterChange={setFilters}
            labels={allLabels}
            epics={allEpics}
          />
        </div>
      )}

      {/* Main content area */}
      <div className="flex min-h-0 flex-1 gap-0 overflow-hidden rounded-xl">
        {/* Epic sidebar */}
        {(activeView === 'board' || activeView === 'epics') && (
          <EpicSidebar
            issues={allIssues}
            onFilterByEpic={handleFilterByEpic}
            activeEpicId={activeEpicId}
            isCollapsed={!showEpicSidebar}
            onToggleCollapse={() => setShowEpicSidebar((v) => !v)}
          />
        )}

        {/* Views */}
        <div className="min-w-0 flex-1 overflow-auto p-1">
          <AnimatePresence mode="wait">
            {activeView === 'board' && (
              <motion.div
                key="board"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <SprintBoard
                  issues={filteredIssues}
                  statusColumns={statusColumns}
                  onUpdateIssue={handleUpdateIssue}
                  onCreateIssue={handleCreateIssue}
                  onIssueClick={handleIssueClick}
                />
              </motion.div>
            )}

            {activeView === 'backlog' && (
              <motion.div
                key="backlog"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <BacklogView
                  issues={filteredIssues}
                  onUpdateIssue={handleUpdateIssue}
                  onCreateIssue={handleCreateIssue}
                  onDeleteIssue={handleDeleteIssue}
                  onIssueClick={handleIssueClick}
                />
              </motion.div>
            )}

            {activeView === 'epics' && (
              <motion.div
                key="epics"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <SprintBoard
                  issues={filteredIssues}
                  statusColumns={statusColumns}
                  onUpdateIssue={handleUpdateIssue}
                  onCreateIssue={handleCreateIssue}
                  onIssueClick={handleIssueClick}
                />
              </motion.div>
            )}

            {activeView === 'charts' && (
              <motion.div
                key="charts"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <div className="grid gap-6 lg:grid-cols-2">
                  <BurndownChart data={chartData.burndown} />
                  <VelocityChart sprints={chartData.velocity} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Issue detail slide-out panel */}
      <AnimatePresence>
        {selectedIssue && (
          <IssueDetail
            key={selectedIssue.id}
            issue={selectedIssue}
            onUpdate={handleUpdateIssue}
            onDelete={handleDeleteIssue}
            onClose={handleCloseDetail}
            allIssues={allIssues}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
