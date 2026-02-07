import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export default function DropdownMenu({
  trigger,
  items = [],
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={menuRef} className={['relative inline-block', className].filter(Boolean).join(' ')}>
      {/* Trigger */}
      <div onClick={() => setIsOpen((prev) => !prev)}>{trigger}</div>

      {/* Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="glass-card absolute right-0 z-30 mt-1.5 min-w-[180px] overflow-hidden p-1"
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
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
                  className={[
                    'flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors',
                    item.danger
                      ? 'text-red-400 hover:bg-red-500/10 hover:text-red-300'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white',
                  ].join(' ')}
                >
                  {Icon && <Icon size={15} />}
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
