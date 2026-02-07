import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Filter, X, ChevronDown, Search } from 'lucide-react';
import Badge from '../ui/Badge';
import { ISSUE_TYPES, PRIORITIES } from '../../utils/constants';

const TYPE_OPTIONS = [
  { value: ISSUE_TYPES.EPIC, label: 'Epic', variant: 'purple' },
  { value: ISSUE_TYPES.STORY, label: 'Story', variant: 'green' },
  { value: ISSUE_TYPES.TASK, label: 'Task', variant: 'blue' },
  { value: ISSUE_TYPES.BUG, label: 'Bug', variant: 'red' },
  { value: ISSUE_TYPES.SUBTASK, label: 'Subtask', variant: 'gray' },
];

const PRIORITY_OPTIONS = [
  { value: PRIORITIES.CRITICAL, label: 'Critical', variant: 'red' },
  { value: PRIORITIES.HIGH, label: 'High', variant: 'yellow' },
  { value: PRIORITIES.MEDIUM, label: 'Medium', variant: 'blue' },
  { value: PRIORITIES.LOW, label: 'Low', variant: 'gray' },
];

const ASSIGNEE_OPTIONS = [
  { value: 'Claude', label: 'Claude' },
  { value: 'User', label: 'User' },
  { value: '__none__', label: 'Unassigned' },
];

// Reusable multi-select dropdown
function MultiSelectDropdown({ label, options, selected = [], onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const toggle = (value) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const hasSelection = selected.length > 0;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen((p) => !p)}
        className={[
          'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors',
          hasSelection
            ? 'text-white ring-1'
            : 'text-slate-400 hover:bg-white/[0.06] hover:text-slate-200',
        ].join(' ')}
        style={hasSelection ? {
          backgroundColor: 'rgba(var(--accent-active-rgb, 139, 92, 246), 0.15)',
          '--tw-ring-color': 'rgba(var(--accent-active-rgb, 139, 92, 246), 0.2)',
        } : undefined}
      >
        {label}
        {hasSelection && (
          <span
            className="flex h-4 w-4 items-center justify-center rounded-full text-[10px] text-white"
            style={{ backgroundColor: 'rgba(var(--accent-active-rgb, 139, 92, 246), 0.3)' }}
          >
            {selected.length}
          </span>
        )}
        <ChevronDown size={12} className={isOpen ? 'rotate-180' : ''} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ duration: 0.12 }}
            className="glass-card absolute left-0 top-full z-30 mt-1.5 min-w-[160px] overflow-hidden p-1"
          >
            {options.map((opt) => {
              const isSelected = selected.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  onClick={() => toggle(opt.value)}
                  className={[
                    'flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors',
                    isSelected
                      ? 'bg-white/10 text-white'
                      : 'text-slate-400 hover:bg-white/[0.06] hover:text-slate-200',
                  ].join(' ')}
                >
                  <span
                    className={[
                      'flex h-3.5 w-3.5 items-center justify-center rounded border text-[9px]',
                      isSelected
                        ? 'text-white'
                        : 'border-slate-600',
                    ].join(' ')}
                    style={isSelected ? {
                      borderColor: 'var(--accent-active, #8b5cf6)',
                      backgroundColor: 'var(--accent-active, #8b5cf6)',
                    } : undefined}
                  >
                    {isSelected && '\u2713'}
                  </span>
                  {opt.label}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FilterBar({
  filters = {},
  onFilterChange,
  issueTypes = TYPE_OPTIONS,
  labels = [],
  epics = [],
}) {
  const { types = [], priorities = [], assignees = [], labelFilter = [], search = '' } = filters;

  const handleChange = useCallback(
    (key, value) => {
      onFilterChange?.({ ...filters, [key]: value });
    },
    [filters, onFilterChange]
  );

  const activeCount =
    types.length + priorities.length + assignees.length + labelFilter.length + (search ? 1 : 0);

  const clearAll = () => {
    onFilterChange?.({
      types: [],
      priorities: [],
      assignees: [],
      labelFilter: [],
      search: '',
    });
  };

  // Build label options from incoming labels
  const labelOptions = labels.map((l) => ({ value: l, label: l, variant: 'cyan' }));

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-white/[0.05] bg-white/[0.02] px-3 py-2 backdrop-blur-sm">
      {/* Filter icon */}
      <div className="flex items-center gap-1.5 text-slate-500">
        <Filter size={14} />
        <span className="text-xs font-medium">Filters</span>
      </div>

      <div className="h-4 w-px bg-white/10" />

      {/* Type filter */}
      <MultiSelectDropdown
        label="Type"
        options={issueTypes}
        selected={types}
        onChange={(v) => handleChange('types', v)}
      />

      {/* Priority filter */}
      <MultiSelectDropdown
        label="Priority"
        options={PRIORITY_OPTIONS}
        selected={priorities}
        onChange={(v) => handleChange('priorities', v)}
      />

      {/* Assignee filter */}
      <MultiSelectDropdown
        label="Assignee"
        options={ASSIGNEE_OPTIONS}
        selected={assignees}
        onChange={(v) => handleChange('assignees', v)}
      />

      {/* Label filter */}
      {labelOptions.length > 0 && (
        <MultiSelectDropdown
          label="Labels"
          options={labelOptions}
          selected={labelFilter}
          onChange={(v) => handleChange('labelFilter', v)}
        />
      )}

      <div className="flex-1" />

      {/* Search */}
      <div className="relative">
        <Search
          size={13}
          className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-slate-500"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => handleChange('search', e.target.value)}
          placeholder="Search..."
          className="glass-input w-40 rounded-lg py-1 pl-7 pr-2 text-xs text-white placeholder-slate-500"
        />
        {search && (
          <button
            onClick={() => handleChange('search', '')}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-500 hover:text-white"
          >
            <X size={10} />
          </button>
        )}
      </div>

      {/* Active filter badges + clear */}
      {activeCount > 0 && (
        <>
          <div className="h-4 w-px bg-white/10" />

          {/* Show active filter badges */}
          <div className="flex flex-wrap items-center gap-1">
            {types.map((t) => (
              <Badge
                key={`type-${t}`}
                variant="purple"
                size="sm"
                removable
                onRemove={() => handleChange('types', types.filter((v) => v !== t))}
              >
                {t}
              </Badge>
            ))}
            {priorities.map((p) => (
              <Badge
                key={`pri-${p}`}
                variant="yellow"
                size="sm"
                removable
                onRemove={() =>
                  handleChange('priorities', priorities.filter((v) => v !== p))
                }
              >
                {p}
              </Badge>
            ))}
            {assignees.map((a) => (
              <Badge
                key={`asgn-${a}`}
                variant="blue"
                size="sm"
                removable
                onRemove={() =>
                  handleChange('assignees', assignees.filter((v) => v !== a))
                }
              >
                {a === '__none__' ? 'Unassigned' : a}
              </Badge>
            ))}
            {labelFilter.map((l) => (
              <Badge
                key={`lbl-${l}`}
                variant="cyan"
                size="sm"
                removable
                onRemove={() =>
                  handleChange('labelFilter', labelFilter.filter((v) => v !== l))
                }
              >
                {l}
              </Badge>
            ))}
          </div>

          {/* Clear all */}
          <button
            onClick={clearAll}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-slate-500 transition-colors hover:bg-white/[0.06] hover:text-slate-300"
          >
            <X size={10} />
            Clear
          </button>
        </>
      )}
    </div>
  );
}
