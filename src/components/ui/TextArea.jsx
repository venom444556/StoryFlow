import React from 'react';

export default function TextArea({
  label,
  value,
  onChange,
  placeholder,
  disabled = false,
  rows = 4,
  className = '',
  ...rest
}) {
  return (
    <div className={['w-full', className].filter(Boolean).join(' ')}>
      {label && (
        <label className="mb-1.5 block text-sm text-slate-400">{label}</label>
      )}
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        className={[
          'glass-input w-full resize-y px-3 py-2 text-sm text-white placeholder-slate-500',
          disabled && 'cursor-not-allowed opacity-50',
        ]
          .filter(Boolean)
          .join(' ')}
        {...rest}
      />
    </div>
  );
}
