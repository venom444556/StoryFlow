import React from 'react';

const PADDING = {
  none: '',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-7',
};

export default function GlassCard({
  children,
  className = '',
  hover = false,
  padding = 'md',
  onClick,
}) {
  return (
    <div
      className={[
        'glass-card',
        PADDING[padding] || PADDING.md,
        hover && 'transition-all duration-200 hover:scale-[1.02] hover:brightness-110 cursor-pointer',
        onClick && 'cursor-pointer',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
