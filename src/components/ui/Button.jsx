import React from 'react';
import { Loader2 } from 'lucide-react';

const VARIANTS = {
  primary: [
    'text-[var(--color-fg-on-accent)] hover:brightness-110 shadow-lg',
    'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--interactive-default)]',
    'focus-visible:ring-offset-[var(--color-bg-base)]',
  ].join(' '),
  secondary: [
    'glass text-[var(--color-fg-muted)] hover:text-[var(--color-fg-default)] hover:brightness-110',
    'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--interactive-default)]',
    'focus-visible:ring-offset-[var(--color-bg-base)]',
  ].join(' '),
  danger: [
    'bg-[var(--color-danger)] text-[var(--color-fg-on-accent)] hover:brightness-110 shadow-lg shadow-red-500/20',
    'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-danger)]',
    'focus-visible:ring-offset-[var(--color-bg-base)]',
  ].join(' '),
  ghost: [
    'bg-transparent text-[var(--color-fg-muted)] hover:bg-[var(--color-bg-glass-hover)] hover:text-[var(--color-fg-default)]',
    'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--interactive-default)]',
    'focus-visible:ring-offset-[var(--color-bg-base)]',
  ].join(' '),
  outline: [
    'bg-transparent border border-[var(--color-border-default)] text-[var(--color-fg-muted)]',
    'hover:border-[var(--color-border-emphasis)] hover:text-[var(--color-fg-default)] hover:bg-[var(--color-bg-glass)]',
    'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--interactive-default)]',
    'focus-visible:ring-offset-[var(--color-bg-base)]',
  ].join(' '),
};

const SIZES = {
  sm: 'h-[var(--size-input-sm)] px-[var(--space-3)] text-[var(--text-xs)] gap-[var(--space-2)]',
  md: 'h-[var(--size-input-md)] px-[var(--space-4)] text-[var(--text-sm)] gap-[var(--space-2)]',
  lg: 'h-[var(--size-input-lg)] px-[var(--space-6)] text-[var(--text-base)] gap-[var(--space-3)]',
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
  iconRight: IconRight,
  disabled = false,
  isLoading = false,
  onClick,
  className = '',
  type = 'button',
  as: Component,
  ...rest
}) {
  const Tag = Component || 'button';
  const isButton = Tag === 'button';
  const isPrimary = (variant || 'primary') === 'primary';
  const isDisabled = disabled || isLoading;

  return (
    <Tag
      {...(isButton ? { type } : {})}
      className={[
        'inline-flex items-center justify-center rounded-[var(--radius-lg)] font-[var(--font-medium)]',
        'transition-all outline-none',
        VARIANTS[variant] || VARIANTS.primary,
        SIZES[size] || SIZES.md,
        isDisabled && 'opacity-50 cursor-not-allowed pointer-events-none',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{
        transitionDuration: 'var(--duration-normal)',
        transitionTimingFunction: 'var(--ease-default)',
        ...(isPrimary ? {
          backgroundImage: `linear-gradient(to right, var(--accent-active, #8b5cf6), #3b82f6)`,
          boxShadow: `0 10px 15px -3px rgba(var(--accent-active-rgb, 139, 92, 246), 0.2)`,
        } : {}),
      }}
      onClick={isDisabled ? undefined : onClick}
      disabled={isButton ? isDisabled : undefined}
      aria-disabled={isDisabled || undefined}
      {...rest}
    >
      {isLoading ? (
        <Loader2 size={ICON_SIZES[size] || 16} className="animate-spin" />
      ) : (
        Icon && <Icon size={ICON_SIZES[size] || 16} />
      )}
      {children}
      {!isLoading && IconRight && <IconRight size={ICON_SIZES[size] || 16} />}
    </Tag>
  );
}
