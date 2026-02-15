import React from 'react';
import Button from './Button';

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = '',
}) {
  return (
    <div className={[
      'flex flex-col items-center justify-center py-[var(--space-16)] text-center',
      className,
    ].filter(Boolean).join(' ')}>
      {Icon && (
        <Icon
          size={48}
          className="mb-[var(--space-4)] text-[var(--color-fg-faint)]"
          strokeWidth={1.5}
          aria-hidden="true"
        />
      )}
      {title && (
        <h3 className="mb-[var(--space-2)] text-[var(--text-lg)] font-[var(--font-medium)] text-[var(--color-fg-subtle)]">
          {title}
        </h3>
      )}
      {description && (
        <p className="mb-[var(--space-6)] max-w-sm text-[var(--text-sm)] text-[var(--color-fg-subtle)]">
          {description}
        </p>
      )}
      {action && (
        <Button variant="secondary" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
