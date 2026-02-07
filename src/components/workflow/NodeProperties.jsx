import React from 'react';
import { X, Trash2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { getNodeType } from '../../data/nodeTypes';
import Input from '../ui/Input';
import TextArea from '../ui/TextArea';
import Badge from '../ui/Badge';

// ---------------------------------------------------------------------------
// Status badge variant mapping
// ---------------------------------------------------------------------------
const STATUS_BADGE_VARIANT = {
  idle: 'gray',
  running: 'yellow',
  success: 'green',
  error: 'red',
};

// ---------------------------------------------------------------------------
// Config fields per node type
// ---------------------------------------------------------------------------
// Returns an array of { key, label, type } objects that describe which fields
// to render for a given node type.  `type` is 'input' | 'textarea'.

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
// NodeProperties
// ---------------------------------------------------------------------------

/**
 * Side panel for viewing and editing a selected workflow node.
 *
 * Props:
 * - node     {object|null}  the currently selected node
 * - onUpdate {function}     called with (nodeId, partialUpdates)
 * - onDelete {function}     called with (nodeId)
 * - onClose  {function}     close the panel
 */
export default function NodeProperties({ node, onUpdate, onDelete, onClose }) {
  if (!node) return null;

  const typeDef = getNodeType(node.type);
  const configFields = getConfigFields(node.type);

  const handleTitleChange = (e) => {
    onUpdate?.(node.id, { title: e.target.value });
  };

  const handleConfigChange = (key, value) => {
    onUpdate?.(node.id, {
      config: { ...node.config, [key]: value },
    });
  };

  return (
    <motion.div
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="flex h-full w-72 flex-col border-l border-white/[0.08] backdrop-blur-2xl"
      style={{ backgroundColor: 'var(--th-panel)' }}
    >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-3">
          <h3 className="text-sm font-semibold text-white">Node Properties</h3>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="space-y-5">
            {/* Title */}
            <Input
              label="Title"
              value={node.title}
              onChange={handleTitleChange}
              placeholder="Node title"
            />

            {/* Type (read-only) */}
            <div>
              <label className="mb-1.5 block text-sm text-slate-400">Type</label>
              <Badge
                variant={
                  node.type === 'start'
                    ? 'green'
                    : node.type === 'end'
                      ? 'red'
                      : node.type === 'api'
                        ? 'cyan'
                        : node.type === 'database'
                          ? 'green'
                          : node.type === 'code'
                            ? 'purple'
                            : node.type === 'decision'
                              ? 'purple'
                              : 'blue'
                }
                dot
              >
                {typeDef?.label || node.type}
              </Badge>
            </div>

            {/* Status (read-only) */}
            <div>
              <label className="mb-1.5 block text-sm text-slate-400">Status</label>
              <Badge
                variant={STATUS_BADGE_VARIANT[node.status] || 'gray'}
                dot
              >
                {node.status.charAt(0).toUpperCase() + node.status.slice(1)}
              </Badge>
            </div>

            {/* Error display */}
            {node.error && (
              <div className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3">
                <AlertCircle size={16} className="mt-0.5 flex-shrink-0 text-red-400" />
                <span className="text-xs text-red-300">{node.error}</span>
              </div>
            )}

            {/* Config section */}
            {configFields.length > 0 && (
              <div>
                <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Configuration
                </h4>
                <div className="space-y-3">
                  {configFields.map((field) =>
                    field.type === 'textarea' ? (
                      <TextArea
                        key={field.key}
                        label={field.label}
                        value={node.config?.[field.key] || ''}
                        onChange={(e) =>
                          handleConfigChange(field.key, e.target.value)
                        }
                        placeholder={field.placeholder}
                        rows={3}
                      />
                    ) : (
                      <Input
                        key={field.key}
                        label={field.label}
                        value={node.config?.[field.key] || ''}
                        onChange={(e) =>
                          handleConfigChange(field.key, e.target.value)
                        }
                        placeholder={field.placeholder}
                      />
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer – delete button */}
        <div className="border-t border-white/[0.08] p-4">
          <button
            onClick={() => onDelete?.(node.id)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-red-600/20 px-4 py-2 text-sm font-medium text-red-400 transition-all duration-200 hover:bg-red-600/30 hover:text-red-300"
          >
            <Trash2 size={15} />
            Delete Node
          </button>
        </div>
    </motion.div>
  );
}
