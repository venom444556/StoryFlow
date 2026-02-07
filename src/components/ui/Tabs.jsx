import React from 'react';
import { motion } from 'framer-motion';

export default function Tabs({
  tabs = [],
  activeTab,
  onTabChange,
  className = '',
}) {
  return (
    <div
      className={[
        'glass inline-flex gap-1 rounded-lg p-1',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab;
        const Icon = tab.icon;

        return (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={[
              'relative flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors duration-200',
              isActive
                ? 'text-white'
                : 'text-slate-400 hover:text-slate-200',
            ].join(' ')}
          >
            {isActive && (
              <motion.div
                layoutId="tab-indicator"
                className="absolute inset-0 rounded-md bg-white/10"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              {Icon && <Icon size={16} />}
              {tab.label}
            </span>
            {isActive && (
              <motion.div
                layoutId="tab-underline"
                className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full"
                style={{ backgroundImage: 'linear-gradient(to right, var(--accent-active, #8b5cf6), #3b82f6)' }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
