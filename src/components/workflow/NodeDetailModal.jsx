import React, { useMemo } from 'react';
import {
  Trash2,
  AlertCircle,
  CheckCircle,
  Play,
  Square,
  Layers,
  CheckSquare,
  Flag,
  GitBranch,
  Globe,
  Database,
  Code,
  Settings,
  FileText,
  Zap,
  Clock,
  XCircle,
  CircleDot,
  Info,
  Users,
  ListChecks,
} from 'lucide-react';
import { getNodeType } from '../../data/nodeTypes';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import TextArea from '../ui/TextArea';
import Badge from '../ui/Badge';

// ---------------------------------------------------------------------------
// Icon lookup -- maps the string icon name from nodeTypes to the component
// ---------------------------------------------------------------------------
const ICON_MAP = {
  Play,
  Square,
  Layers,
  CheckSquare,
  Flag,
  GitBranch,
  Globe,
  Database,
  Code,
};

// ---------------------------------------------------------------------------
// Status badge variant mapping
// ---------------------------------------------------------------------------
const STATUS_BADGE_VARIANT = {
  idle: 'gray',
  running: 'yellow',
  success: 'green',
  error: 'red',
};

const STATUS_LABELS = {
  idle: 'Not Started',
  running: 'Running',
  success: 'Completed',
  error: 'Failed',
};

// ---------------------------------------------------------------------------
// Type to badge variant
// ---------------------------------------------------------------------------
function getTypeBadgeVariant(type) {
  switch (type) {
    case 'start':
      return 'green';
    case 'end':
      return 'red';
    case 'api':
      return 'cyan';
    case 'database':
      return 'green';
    case 'code':
    case 'decision':
      return 'purple';
    case 'phase':
      return 'blue';
    case 'task':
      return 'blue';
    case 'milestone':
      return 'yellow';
    default:
      return 'gray';
  }
}

// ---------------------------------------------------------------------------
// Config fields per node type
// ---------------------------------------------------------------------------
function getConfigFields(nodeType) {
  switch (nodeType) {
    case 'api':
      return [
        { key: 'url', label: 'URL', type: 'input', placeholder: 'https://api.example.com/...' },
        { key: 'method', label: 'Method', type: 'input', placeholder: 'GET' },
        { key: 'timeout', label: 'Timeout (ms)', type: 'input', placeholder: '5000' },
      ];
    case 'database':
      return [
        { key: 'query', label: 'Query', type: 'textarea', placeholder: 'SELECT * FROM ...' },
        { key: 'connection', label: 'Connection', type: 'input', placeholder: 'postgres://...' },
        { key: 'retries', label: 'Retries', type: 'input', placeholder: '3' },
      ];
    case 'code':
      return [
        { key: 'script', label: 'Script', type: 'textarea', placeholder: 'data.map(x => ...)' },
      ];
    case 'decision':
      return [
        { key: 'condition', label: 'Condition', type: 'input', placeholder: 'data.count > 0' },
      ];
    case 'phase':
      return [
        { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Describe this phase...' },
      ];
    case 'task':
      return [
        { key: 'assignee', label: 'Assignee', type: 'input', placeholder: 'Name or email' },
        { key: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Additional context...' },
      ];
    case 'milestone':
      return [
        { key: 'dueDate', label: 'Due Date', type: 'input', placeholder: 'YYYY-MM-DD' },
        { key: 'criteria', label: 'Success Criteria', type: 'textarea', placeholder: 'What defines completion...' },
      ];
    default:
      return [];
  }
}

// ---------------------------------------------------------------------------
// Child status icon
// ---------------------------------------------------------------------------
function ChildStatusIcon({ status }) {
  switch (status) {
    case 'running':
      return <Clock size={13} className="animate-spin text-yellow-400" />;
    case 'success':
      return <CheckCircle size={13} className="text-green-400" />;
    case 'error':
      return <XCircle size={13} className="text-red-400" />;
    default:
      return <CircleDot size={13} className="text-slate-600" />;
  }
}

// ---------------------------------------------------------------------------
// Sub-workflow children summary
// ---------------------------------------------------------------------------
function getChildStats(children) {
  const nodes = children?.nodes || [];
  // Exclude start/end from actionable counts
  const actionable = nodes.filter((n) => n.type !== 'start' && n.type !== 'end');
  const actionableTotal = actionable.length;
  let completed = 0;
  let failed = 0;
  let running = 0;
  let idle = 0;

  for (const node of actionable) {
    switch (node.status) {
      case 'success':
        completed++;
        break;
      case 'error':
        failed++;
        break;
      case 'running':
        running++;
        break;
      default:
        idle++;
        break;
    }
  }

  return { actionableTotal, completed, failed, running, idle };
}

// ---------------------------------------------------------------------------
// NodeDetailModal
// ---------------------------------------------------------------------------

export default function NodeDetailModal({ node, isOpen, onClose, onUpdate, onDelete }) {
  const typeDef = useMemo(() => (node ? getNodeType(node.type) : null), [node?.type]);
  const configFields = useMemo(() => (node ? getConfigFields(node.type) : []), [node?.type]);

  if (!node) return null;

  const color = typeDef?.color || '#6b7280';
  const iconName = typeDef?.icon;
  const TypeIcon = iconName ? ICON_MAP[iconName] : null;

  const hasChildren = (node.children?.nodes?.length || 0) > 0;
  const childStats = hasChildren ? getChildStats(node.children) : null;
  const childNodes = hasChildren
    ? node.children.nodes.filter((n) => n.type !== 'start' && n.type !== 'end')
    : [];

  const isTerminal = node.type === 'start' || node.type === 'end';

  // ---- Handlers ----

  const handleTitleChange = (e) => {
    onUpdate?.(node.id, { title: e.target.value });
  };

  const handleDescriptionChange = (e) => {
    onUpdate?.(node.id, { description: e.target.value });
  };

  const handleConfigChange = (key, value) => {
    onUpdate?.(node.id, {
      config: { ...node.config, [key]: value },
    });
  };

  const handleDelete = () => {
    onDelete?.(node.id);
    onClose?.();
  };

  // Progress percentage for children
  const progressPercent =
    childStats && childStats.actionableTotal > 0
      ? Math.round((childStats.completed / childStats.actionableTotal) * 100)
      : 0;

  // ---- Render ----

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      {/* ================================================================== */}
      {/* HEADER SECTION                                                      */}
      {/* ================================================================== */}
      <div className="mb-6">
        {/* Color bar */}
        <div
          className="-mx-6 -mt-5 mb-5 h-1.5"
          style={{ backgroundColor: color }}
        />

        {/* Icon + title row */}
        <div className="flex items-start gap-4">
          {/* Node type icon */}
          <div
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${color}22` }}
          >
            {TypeIcon ? (
              <TypeIcon size={22} style={{ color }} />
            ) : (
              <Zap size={22} style={{ color }} />
            )}
          </div>

          {/* Title input */}
          <div className="flex-1">
            <input
              type="text"
              value={node.title}
              onChange={handleTitleChange}
              className="glass-input mb-2 w-full bg-transparent px-3 py-2 text-lg font-semibold text-white placeholder-slate-500 focus:outline-none"
              placeholder="Node title"
            />

            {/* Badges */}
            <div className="flex items-center gap-2">
              <Badge variant={getTypeBadgeVariant(node.type)} dot size="md">
                {typeDef?.label || node.type}
              </Badge>
              <Badge variant={STATUS_BADGE_VARIANT[node.status] || 'gray'} dot size="md">
                {STATUS_LABELS[node.status] || node.status}
              </Badge>
              {hasChildren && (
                <Badge variant="purple" dot size="md">
                  {childStats.actionableTotal} sub-steps
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================== */}
      {/* TYPE INFO (for non-terminal nodes)                                   */}
      {/* ================================================================== */}
      {!isTerminal && typeDef?.description && (
        <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
          <Info size={14} className="mt-0.5 flex-shrink-0 text-slate-500" />
          <p className="text-xs leading-relaxed text-slate-400">
            {typeDef.description}
          </p>
        </div>
      )}

      {/* ================================================================== */}
      {/* SUB-WORKFLOW PROGRESS (for nodes with children)                      */}
      {/* ================================================================== */}
      {hasChildren && childStats && (
        <div className="mb-6">
          <div className="mb-3 flex items-center gap-2">
            <ListChecks size={14} className="text-slate-500" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Sub-Workflow Progress
            </h4>
          </div>

          <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
            {/* Progress bar */}
            <div className="mb-3">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-sm font-medium text-white">
                  {progressPercent}% Complete
                </span>
                <span className="text-xs text-slate-400">
                  {childStats.completed} of {childStats.actionableTotal} steps done
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-700/60">
                {childStats.completed > 0 && (
                  <div
                    className="inline-block h-full rounded-full bg-green-500 transition-all duration-300"
                    style={{
                      width: `${(childStats.completed / childStats.actionableTotal) * 100}%`,
                    }}
                  />
                )}
                {childStats.running > 0 && (
                  <div
                    className="inline-block h-full bg-yellow-500 transition-all duration-300"
                    style={{
                      width: `${(childStats.running / childStats.actionableTotal) * 100}%`,
                    }}
                  />
                )}
                {childStats.failed > 0 && (
                  <div
                    className="inline-block h-full bg-red-500 transition-all duration-300"
                    style={{
                      width: `${(childStats.failed / childStats.actionableTotal) * 100}%`,
                    }}
                  />
                )}
              </div>
            </div>

            {/* Status summary chips */}
            <div className="mb-4 flex flex-wrap gap-2">
              {childStats.completed > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-400">
                  <CheckCircle size={11} />
                  {childStats.completed} completed
                </span>
              )}
              {childStats.running > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-500/10 px-2.5 py-1 text-xs font-medium text-yellow-400">
                  <Clock size={11} />
                  {childStats.running} in progress
                </span>
              )}
              {childStats.failed > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-400">
                  <XCircle size={11} />
                  {childStats.failed} failed
                </span>
              )}
              {childStats.idle > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-500/10 px-2.5 py-1 text-xs font-medium text-slate-400">
                  <CircleDot size={11} />
                  {childStats.idle} pending
                </span>
              )}
            </div>

            {/* Individual child steps list */}
            <div className="space-y-1">
              {childNodes.map((child) => {
                const childType = getNodeType(child.type);
                const childColor = childType?.color || '#6b7280';
                const childConfig = child.config || {};
                const assignee = childConfig.assignee;
                const notes = childConfig.notes || childConfig.description;

                return (
                  <div
                    key={child.id}
                    className="flex items-start gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-white/[0.04]"
                  >
                    {/* Status icon */}
                    <div className="mt-0.5 flex-shrink-0">
                      <ChildStatusIcon status={child.status} />
                    </div>

                    {/* Step info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={[
                            'text-sm font-medium',
                            child.status === 'success'
                              ? 'text-slate-400 line-through'
                              : child.status === 'error'
                                ? 'text-red-300'
                                : 'text-white',
                          ].join(' ')}
                        >
                          {child.title}
                        </span>
                        <span
                          className="inline-block rounded-full px-1.5 py-px text-[9px] font-medium"
                          style={{
                            backgroundColor: `${childColor}18`,
                            color: childColor,
                          }}
                        >
                          {childType?.label || child.type}
                        </span>
                      </div>
                      {/* Meta info line */}
                      {(assignee || notes) && (
                        <div className="mt-0.5 flex items-center gap-3">
                          {assignee && (
                            <span className="flex items-center gap-1 text-[10px] text-slate-500">
                              <Users size={9} />
                              {assignee}
                            </span>
                          )}
                          {notes && (
                            <span className="truncate text-[10px] text-slate-600">
                              {notes.length > 50 ? notes.slice(0, 48) + '\u2026' : notes}
                            </span>
                          )}
                        </div>
                      )}
                      {/* Error message */}
                      {child.error && (
                        <p className="mt-1 text-[11px] text-red-400">{child.error}</p>
                      )}
                    </div>

                    {/* Sub-node children indicator */}
                    {child.children?.nodes?.length > 0 && (
                      <span className="flex items-center gap-0.5 rounded-full bg-white/[0.06] px-1.5 py-0.5 text-[9px] text-slate-400">
                        <Layers size={9} />
                        {child.children.nodes.length}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* DESCRIPTION SECTION                                                 */}
      {/* ================================================================== */}
      <div className="mb-6">
        <div className="mb-3 flex items-center gap-2">
          <FileText size={14} className="text-slate-500" />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Description
          </h4>
        </div>
        <TextArea
          value={node.description || ''}
          onChange={handleDescriptionChange}
          placeholder="Add a description of what this node does..."
          rows={3}
        />
      </div>

      {/* ================================================================== */}
      {/* CONFIGURATION SECTION                                               */}
      {/* ================================================================== */}
      {configFields.length > 0 && (
        <div className="mb-6">
          <div className="mb-3 flex items-center gap-2">
            <Settings size={14} className="text-slate-500" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Configuration
            </h4>
          </div>

          <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
            <div className="space-y-4">
              {configFields.map((field) =>
                field.type === 'textarea' ? (
                  <TextArea
                    key={field.key}
                    label={field.label}
                    value={node.config?.[field.key] || ''}
                    onChange={(e) => handleConfigChange(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    rows={3}
                  />
                ) : (
                  <Input
                    key={field.key}
                    label={field.label}
                    value={node.config?.[field.key] || ''}
                    onChange={(e) => handleConfigChange(field.key, e.target.value)}
                    placeholder={field.placeholder}
                  />
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* EXECUTION RESULTS SECTION                                           */}
      {/* ================================================================== */}
      {(node.status === 'success' || node.status === 'error') && (
        <div className="mb-6">
          <div className="mb-3 flex items-center gap-2">
            <Zap size={14} className="text-slate-500" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Last Execution
            </h4>
          </div>

          {node.status === 'success' && (
            <div className="flex items-center gap-3 rounded-xl border border-green-500/20 bg-green-500/[0.08] p-4">
              <CheckCircle size={18} className="flex-shrink-0 text-green-400" />
              <div>
                <p className="text-sm font-medium text-green-300">Completed successfully</p>
                <p className="mt-0.5 text-xs text-green-400/70">
                  Node executed without errors.
                </p>
              </div>
            </div>
          )}

          {node.status === 'error' && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/[0.08] p-4">
              <div className="flex items-start gap-3">
                <AlertCircle size={18} className="mt-0.5 flex-shrink-0 text-red-400" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-red-300">Execution failed</p>
                  {node.error && (
                    <p className="mt-1.5 break-words rounded-lg border border-red-500/10 bg-red-500/[0.06] px-3 py-2 font-mono text-xs text-red-400">
                      {node.error}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================================================================== */}
      {/* FOOTER                                                              */}
      {/* ================================================================== */}
      <div className="flex items-center justify-between border-t border-white/[0.08] pt-5">
        {/* Delete -- left-aligned (hidden for terminal nodes) */}
        {!isTerminal ? (
          <button
            onClick={handleDelete}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600/20 px-4 py-2 text-sm font-medium text-red-400 transition-all duration-200 hover:bg-red-600/30 hover:text-red-300"
          >
            <Trash2 size={15} />
            Delete Node
          </button>
        ) : (
          <div />
        )}

        {/* Done -- right-aligned */}
        <button
          onClick={onClose}
          className="rounded-lg bg-white/10 px-5 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-white/[0.15]"
        >
          Done
        </button>
      </div>
    </Modal>
  );
}
