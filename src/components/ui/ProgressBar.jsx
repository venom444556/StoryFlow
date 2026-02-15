import React from 'react';
import { motion } from 'framer-motion';

function getBarColor(value) {
  if (value < 25) return 'from-[var(--color-danger)] to-red-400';
  if (value < 50) return 'from-[var(--color-warning)] to-yellow-400';
  if (value < 75) return 'from-[var(--color-info)] to-blue-400';
  return 'from-[var(--color-success)] to-green-400';
}

const SIZES = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

export default function ProgressBar({
  value = 0,
  size = 'md',
  showLabel = false,
  className = '',
  color,
  animated = true,
}) {
  const clampedValue = Math.max(0, Math.min(100, value));
  const barColor = color || getBarColor(clampedValue);

  return (
    <div
      className={[
        'flex items-center gap-[var(--space-3)]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      role="progressbar"
      aria-valuenow={clampedValue}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={[
          'w-full overflow-hidden rounded-full bg-[var(--color-bg-glass)]',
          SIZES[size] || SIZES.md,
        ].join(' ')}
      >
        {animated ? (
          <motion.div
            className={[
              'h-full rounded-full bg-gradient-to-r',
              barColor,
            ].join(' ')}
            initial={{ width: 0 }}
            animate={{ width: `${clampedValue}%` }}
            transition={{
              duration: 0.6,
              ease: [0.4, 0, 0.2, 1],
            }}
          />
        ) : (
          <div
            className={[
              'h-full rounded-full bg-gradient-to-r transition-all',
              barColor,
            ].join(' ')}
            style={{
              width: `${clampedValue}%`,
              transitionDuration: 'var(--duration-slow)',
            }}
          />
        )}
      </div>
      {showLabel && (
        <span className="shrink-0 text-[var(--text-xs)] font-[var(--font-medium)] text-[var(--color-fg-subtle)] tabular-nums">
          {Math.round(clampedValue)}%
        </span>
      )}
    </div>
  );
}
