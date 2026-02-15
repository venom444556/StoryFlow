import { useMemo, useCallback } from 'react';
import BoardColumn from './BoardColumn';

export default function SprintBoard({
  issues = [],
  statusColumns = ['To Do', 'In Progress', 'Done'],
  onUpdateIssue,
  onCreateIssue,
  onIssueClick,
}) {
  // Group issues by status
  const issuesByStatus = useMemo(() => {
    const grouped = {};
    statusColumns.forEach((col) => {
      grouped[col] = [];
    });
    issues.forEach((issue) => {
      const col = statusColumns.includes(issue.status)
        ? issue.status
        : statusColumns[0];
      if (!grouped[col]) grouped[col] = [];
      grouped[col].push(issue);
    });
    return grouped;
  }, [issues, statusColumns]);

  // Handle drop: move issue to new status
  const handleDrop = useCallback(
    (issueId, newStatus) => {
      onUpdateIssue?.(issueId, { status: newStatus });
    },
    [onUpdateIssue]
  );

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {statusColumns.map((status) => (
        <BoardColumn
          key={status}
          title={status}
          status={status}
          issues={issuesByStatus[status] || []}
          onDrop={handleDrop}
          onIssueClick={onIssueClick}
          onCreateIssue={onCreateIssue}
        />
      ))}
    </div>
  );
}
