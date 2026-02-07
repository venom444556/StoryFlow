import React from 'react';
import Button from './Button';

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && (
        <Icon size={48} className="mb-4 text-slate-600" strokeWidth={1.5} />
      )}
      {title && (
        <h3 className="mb-2 text-lg font-medium text-slate-400">{title}</h3>
      )}
      {description && (
        <p className="mb-6 max-w-sm text-sm text-slate-500">{description}</p>
      )}
      {action && (
        <Button variant="secondary" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
