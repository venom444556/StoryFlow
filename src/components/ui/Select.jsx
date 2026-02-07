import React from 'react';
import { ChevronDown } from 'lucide-react';

export default function Select({
  label,
  value,
  onChange,
  options = [],
  placeholder,
  disabled = false,
  className = '',
  ...rest
}) {
  return (
    <div className={['w-full', className].filter(Boolean).join(' ')}>
      {label && (
        <label className="mb-1.5 block text-sm text-slate-400">{label}</label>
      )}
      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={[
            'glass-input w-full appearance-none px-3 py-2 pr-9 text-sm text-white',
            disabled && 'cursor-not-allowed opacity-50',
            !value && 'text-slate-500',
          ]
            .filter(Boolean)
            .join(' ')}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option
              key={opt.value}
              value={opt.value}
              className="bg-slate-800 text-white"
            >
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
        />
      </div>
    </div>
  );
}
