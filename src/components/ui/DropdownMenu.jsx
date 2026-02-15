import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export default function DropdownMenu({
  trigger,
  items = [],
  className = '',
  align = 'right',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      triggerRef.current?.focus();
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleKeyDown]);

  const alignClasses = {
    left: 'left-0',
    right: 'right-0',
    center: 'left-1/2 -translate-x-1/2',
  };

  return (
    <div ref={menuRef} className={['relative inline-block', className].filter(Boolean).join(' ')}>
      {/* Trigger */}
      <div
        ref={triggerRef}
        onClick={() => setIsOpen((prev) => !prev)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen((prev) => !prev);
          }
        }}
        role="button"
        tabIndex={0}
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        {trigger}
      </div>

      {/* Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={[
              'glass-card absolute mt-[var(--space-2)] min-w-[180px] overflow-hidden p-[var(--space-1)]',
              alignClasses[align] || alignClasses.right,
            ].join(' ')}
            style={{ zIndex: 'var(--z-dropdown)' }}
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            role="menu"
          >
            {items.map((item, i) => {
              const Icon = item.icon;
              return (
                <button
                  key={i}
                  onClick={() => {
                    item.onClick?.();
                    setIsOpen(false);
                  }}
                  role="menuitem"
                  className={[
                    'flex w-full items-center gap-[var(--space-3)] rounded-[var(--radius-md)]',
                    'px-[var(--space-3)] py-[var(--space-2)] text-[var(--text-sm)]',
                    'transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--interactive-default)]',
                    item.danger
                      ? 'text-[var(--color-danger)] hover:bg-[var(--color-danger-subtle)]'
                      : 'text-[var(--color-fg-muted)] hover:bg-[var(--color-bg-glass-hover)] hover:text-[var(--color-fg-default)]',
                  ].join(' ')}
                  style={{ transitionDuration: 'var(--duration-fast)' }}
                >
                  {Icon && <Icon size={15} aria-hidden="true" />}
                  {item.label}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
