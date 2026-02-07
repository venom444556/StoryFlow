import React from 'react';
import { X } from 'lucide-react';

const VARIANTS = {
  default: 'bg-slate-500/20 text-slate-300',
  purple: 'bg-purple-500/20 text-purple-300',
  blue: 'bg-blue-500/20 text-blue-300',
  green: 'bg-green-500/20 text-green-300',
  yellow: 'bg-yellow-500/20 text-yellow-300',
  red: 'bg-red-500/20 text-red-300',
  pink: 'bg-pink-500/20 text-pink-300',
  cyan: 'bg-cyan-500/20 text-cyan-300',
  gray: 'bg-gray-500/20 text-gray-300',
};

const DOT_COLORS = {
  default: 'bg-slate-400',
  purple: 'bg-purple-400',
  blue: 'bg-blue-400',
  green: 'bg-green-400',
  yellow: 'bg-yellow-400',
  red: 'bg-red-400',
  pink: 'bg-pink-400',
  cyan: 'bg-cyan-400',
  gray: 'bg-gray-400',
};

const SIZES = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
};

export default function Badge({
  children,
  variant = 'default',
  size = 'sm',
  dot = false,
  removable = false,
  onRemove,
}) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        VARIANTS[variant] || VARIANTS.default,
        SIZES[size] || SIZES.sm,
      ].join(' ')}
    >
      {dot && (
        <span
          className={[
            'h-1.5 w-1.5 rounded-full',
            DOT_COLORS[variant] || DOT_COLORS.default,
          ].join(' ')}
        />
      )}
      {children}
      {removable && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
          className="ml-0.5 rounded-full p-0.5 transition-colors hover:bg-white/10"
        >
          <X size={10} />
        </button>
      )}
    </span>
  );
}
