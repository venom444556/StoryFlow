import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import IssueCard from './IssueCard';
import QuickCreateBar from './QuickCreateBar';
import Badge from '../ui/Badge';

const STATUS_ACCENT = {
  'To Do': {
    dot: 'bg-[var(--color-fg-faint)]',
    dropGlow: 'ring-[var(--color-fg-faint)]/30 border-[var(--color-fg-faint)]/40',
  },
  'In Progress': {
    dot: 'bg-blue-400',
    dropGlow: 'ring-blue-400/30 border-blue-400/40',
  },
  Done: {
    dot: 'bg-green-400',
    dropGlow: 'ring-green-400/30 border-green-400/40',
  },
};

export default function BoardColumn({
  title,
  issues = [],
  status,
  onDrop,
  onIssueClick,
  onCreateIssue,
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [draggingIssue, setDraggingIssue] = useState(null);

  const accent = STATUS_ACCENT[status] || STATUS_ACCENT['To Do'];

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    // Only set false when leaving the column entirely
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragOver(false);
      const issueId = e.dataTransfer.getData('text/plain');
      if (issueId) {
        onDrop?.(issueId, status);
      }
    },
    [onDrop, status]
  );

  const handleCreateIssue = useCallback(
    (issueData) => {
      onCreateIssue?.({ ...issueData, status });
    },
    [onCreateIssue, status]
  );

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={[
        'flex min-w-[280px] flex-1 flex-col rounded-xl border transition-all duration-200',
        'bg-[var(--color-bg-glass)] backdrop-blur-sm',
        isDragOver
          ? `border-2 ${accent.dropGlow} ring-2 bg-[var(--color-bg-glass-hover)]`
          : 'border-[var(--color-border-default)]',
      ].join(' ')}
    >
      {/* Column header */}
      <div className="flex shrink-0 items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span
            className={['h-2 w-2 rounded-full', accent.dot].join(' ')}
          />
          <h3 className="text-sm font-semibold text-[var(--color-fg-muted)]">{title}</h3>
          <Badge variant="default" size="sm">
            {issues.length}
          </Badge>
        </div>
        <button
          onClick={() => {
            onCreateIssue?.({
              title: 'New Issue',
              type: 'task',
              status,
              priority: 'medium',
              description: '',
              storyPoints: null,
              epicId: null,
              sprintId: null,
              assignee: null,
              labels: [],
              subtasks: [],
              comments: [],
              dependencies: [],
            });
          }}
          className="rounded-md p-1 text-[var(--color-fg-muted)] transition-colors hover:bg-[var(--color-bg-glass-hover)] hover:text-[var(--color-fg-default)]"
          title="Add issue"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Issues list */}
      <div className="flex-1 space-y-2 overflow-y-auto px-3 pb-2">
        <AnimatePresence mode="popLayout">
          {issues.map((issue) => (
            <IssueCard
              key={issue.id}
              issue={issue}
              onClick={onIssueClick}
              onDragStart={(iss) => setDraggingIssue(iss.id)}
              onDragEnd={() => setDraggingIssue(null)}
              isDragging={draggingIssue === issue.id}
            />
          ))}
        </AnimatePresence>

        {/* Empty state */}
        {issues.length === 0 && !isDragOver && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-xs text-[var(--color-fg-subtle)]">No issues</p>
          </div>
        )}

        {/* Drop indicator */}
        {isDragOver && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 48 }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center justify-center rounded-lg border-2 border-dashed"
            style={{
              borderColor: 'rgba(var(--accent-active-rgb, 139, 92, 246), 0.3)',
              backgroundColor: 'rgba(var(--accent-active-rgb, 139, 92, 246), 0.05)',
            }}
          >
            <span className="text-xs" style={{ color: 'var(--accent-active, #8b5cf6)' }}>Drop here</span>
          </motion.div>
        )}
      </div>

      {/* Quick create */}
      <div className="shrink-0 border-t border-[var(--color-border-default)] px-3 py-2">
        <QuickCreateBar
          onCreateIssue={handleCreateIssue}
          defaultStatus={status}
        />
      </div>
    </div>
  );
}
