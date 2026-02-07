import React from 'react';

export default function Input({
  label,
  value,
  onChange,
  placeholder,
  disabled = false,
  className = '',
  type = 'text',
  icon: Icon,
  ...rest
}) {
  return (
    <div className={['w-full', className].filter(Boolean).join(' ')}>
      {label && (
        <label className="mb-1.5 block text-sm text-slate-400">{label}</label>
      )}
      <div className="relative">
        {Icon && (
          <Icon
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
          />
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={[
            'glass-input w-full px-3 py-2 text-sm text-white placeholder-slate-500',
            Icon && 'pl-9',
            disabled && 'cursor-not-allowed opacity-50',
          ]
            .filter(Boolean)
            .join(' ')}
          {...rest}
        />
      </div>
    </div>
  );
}
