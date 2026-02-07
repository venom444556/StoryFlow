import React from 'react';

const VARIANTS = {
  primary:
    'text-white hover:brightness-110 shadow-lg',
  secondary:
    'glass text-slate-200 hover:brightness-110 hover:text-white',
  danger:
    'bg-red-600 text-white hover:bg-red-500 shadow-lg shadow-red-500/20',
  ghost:
    'bg-transparent text-slate-300 hover:bg-white/10 hover:text-white',
};

const SIZES = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2.5',
};

const ICON_SIZES = {
  sm: 14,
  md: 16,
  lg: 18,
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  disabled = false,
  onClick,
  className = '',
  type = 'button',
  as: Component,
  ...rest
}) {
  const Tag = Component || 'button';
  const isButton = Tag === 'button';
  const isPrimary = (variant || 'primary') === 'primary';

  return (
    <Tag
      {...(isButton ? { type } : {})}
      className={[
        'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200',
        VARIANTS[variant] || VARIANTS.primary,
        SIZES[size] || SIZES.md,
        disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={isPrimary ? {
        backgroundImage: `linear-gradient(to right, var(--accent-active, #8b5cf6), #3b82f6)`,
        boxShadow: `0 10px 15px -3px rgba(var(--accent-active-rgb, 139, 92, 246), 0.2)`,
      } : undefined}
      onClick={disabled ? undefined : onClick}
      disabled={isButton ? disabled : undefined}
      {...rest}
    >
      {Icon && <Icon size={ICON_SIZES[size] || 16} />}
      {children}
    </Tag>
  );
}
