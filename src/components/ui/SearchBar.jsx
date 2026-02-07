import React from 'react';
import { Search, X } from 'lucide-react';

export default function SearchBar({
  value,
  onChange,
  placeholder = 'Search...',
  className = '',
}) {
  const handleClear = () => {
    onChange({ target: { value: '' } });
  };

  return (
    <div className={['relative w-full', className].filter(Boolean).join(' ')}>
      <Search
        size={16}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
      />
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="glass-input w-full rounded-xl py-2 pl-9 pr-9 text-sm text-white placeholder-slate-500"
      />
      {value && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-slate-500 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
