import React from 'react';
import { motion } from 'framer-motion';

function getBarColor(value) {
  if (value < 25) return 'from-red-500 to-red-400';
  if (value < 50) return 'from-yellow-500 to-yellow-400';
  if (value < 75) return 'from-blue-500 to-blue-400';
  return 'from-green-500 to-green-400';
}

const SIZES = {
  sm: 'h-1.5',
  md: 'h-2.5',
};

export default function ProgressBar({
  value = 0,
  size = 'md',
  showLabel = false,
  className = '',
}) {
  const clampedValue = Math.max(0, Math.min(100, value));

  return (
    <div
      className={[
        'flex items-center gap-3',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div
        className={[
          'w-full overflow-hidden rounded-full bg-white/5',
          SIZES[size] || SIZES.md,
        ].join(' ')}
      >
        <motion.div
          className={[
            'h-full rounded-full bg-gradient-to-r',
            getBarColor(clampedValue),
          ].join(' ')}
          initial={{ width: 0 }}
          animate={{ width: `${clampedValue}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
      {showLabel && (
        <span className="shrink-0 text-xs font-medium text-slate-400">
          {Math.round(clampedValue)}%
        </span>
      )}
    </div>
  );
}
