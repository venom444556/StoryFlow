import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit3, Copy, Play, Trash2, ChevronRight, Plus } from 'lucide-react';

// ---------------------------------------------------------------------------
// Menu item definitions
// ---------------------------------------------------------------------------

function buildMenuItems({ onEdit, onDuplicate, onExecuteSingle, onDelete, onAddChildren, onDrillDown, isExecuting }) {
  const items = [
    {
      id: 'edit',
      label: 'Edit Node',
      icon: Edit3,
      onClick: onEdit,
      disabled: false,
      variant: 'default',
    },
    {
      id: 'duplicate',
      label: 'Duplicate',
      icon: Copy,
      onClick: onDuplicate,
      disabled: false,
      variant: 'default',
    },
  ];

  // Drill-down / Add sub-workflow options
  if (onDrillDown) {
    items.push({
      id: 'drilldown',
      label: 'Drill Down',
      icon: ChevronRight,
      onClick: onDrillDown,
      disabled: false,
      variant: 'default',
    });
  }
  if (onAddChildren) {
    items.push({
      id: 'add-children',
      label: 'Add Sub-workflow',
      icon: Plus,
      onClick: onAddChildren,
      disabled: false,
      variant: 'default',
    });
  }

  items.push({ id: 'sep-1', separator: true });
  items.push({
    id: 'execute',
    label: 'Execute This Node',
    icon: Play,
    onClick: onExecuteSingle,
    disabled: isExecuting,
    variant: 'default',
  });
  items.push({ id: 'sep-2', separator: true });
  items.push({
    id: 'delete',
    label: 'Delete',
    icon: Trash2,
    onClick: onDelete,
    disabled: isExecuting,
    variant: 'danger',
  });

  return items;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MENU_WIDTH = 192;
const MENU_HEIGHT_ESTIMATE = 220;

// ---------------------------------------------------------------------------
// NodeContextMenu
// ---------------------------------------------------------------------------

/**
 * Right-click context menu for workflow nodes.
 *
 * Props:
 * - x                {number}    x position relative to canvas
 * - y                {number}    y position relative to canvas
 * - node             {object}    the node that was right-clicked
 * - onClose          {function}  close the menu
 * - onEdit           {function}  open the detail modal for this node
 * - onDuplicate      {function}  duplicate this node
 * - onExecuteSingle  {function}  execute just this node
 * - onDelete         {function}  delete this node
 * - isExecuting      {boolean}   whether workflow is currently executing
 */
export default function NodeContextMenu({
  x,
  y,
  node,
  onClose,
  onEdit,
  onDuplicate,
  onExecuteSingle,
  onDelete,
  onAddChildren,
  onDrillDown,
  isExecuting = false,
}) {
  const menuRef = useRef(null);
  const [position, setPosition] = useState({ left: x, top: y });

  // Adjust position so the menu doesn't overflow the viewport
  useEffect(() => {
    if (!menuRef.current) return;

    const rect = menuRef.current.getBoundingClientRect();
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;

    let adjustedX = x;
    let adjustedY = y;

    if (rect.right > viewportW) {
      adjustedX = x - MENU_WIDTH;
    }
    if (rect.bottom > viewportH) {
      adjustedY = y - rect.height;
    }

    // Clamp to keep on screen
    adjustedX = Math.max(4, adjustedX);
    adjustedY = Math.max(4, adjustedY);

    if (adjustedX !== position.left || adjustedY !== position.top) {
      setPosition({ left: adjustedX, top: adjustedY });
    }
  }, [x, y]); // eslint-disable-line react-hooks/exhaustive-deps

  // Close on click outside
  useEffect(() => {
    const handleMouseDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose?.();
      }
    };

    // Defer so the opening right-click doesn't immediately close
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleMouseDown);
    }, 0);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const items = buildMenuItems({
    onEdit,
    onDuplicate,
    onExecuteSingle,
    onDelete,
    onAddChildren,
    onDrillDown,
    isExecuting,
  });

  return (
    <AnimatePresence>
      <motion.div
        ref={menuRef}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.12, ease: 'easeOut' }}
        className="absolute z-50 min-w-[192px] rounded-xl border border-[var(--color-border-emphasis)] p-1.5 shadow-2xl backdrop-blur-2xl"
        style={{
          left: position.left,
          top: position.top,
          backgroundColor: 'var(--th-panel-solid)',
        }}
        // Prevent the context menu itself from opening the browser menu
        onContextMenu={(e) => e.preventDefault()}
      >
        {items.map((item) => {
          if (item.separator) {
            return (
              <div
                key={item.id}
                className="mx-1 my-1 h-px bg-[var(--color-bg-glass)]"
              />
            );
          }

          const Icon = item.icon;
          const isDanger = item.variant === 'danger';
          const isDisabled = item.disabled;

          return (
            <button
              key={item.id}
              onClick={() => {
                if (isDisabled) return;
                item.onClick?.(node);
                onClose?.();
              }}
              disabled={isDisabled}
              className={[
                'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors duration-100',
                isDisabled
                  ? 'cursor-not-allowed text-[var(--color-fg-subtle)]'
                  : isDanger
                    ? 'text-red-400 hover:bg-red-500/10'
                    : 'text-[var(--color-fg-default)] hover:bg-[var(--color-bg-glass-hover)]',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <Icon
                size={14}
                className={
                  isDisabled
                    ? 'text-[var(--color-fg-subtle)]'
                    : isDanger
                      ? 'text-red-400'
                      : 'text-[var(--color-fg-muted)]'
                }
              />
              <span>{item.label}</span>
            </button>
          );
        })}
      </motion.div>
    </AnimatePresence>
  );
}
