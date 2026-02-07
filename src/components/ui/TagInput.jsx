import React, { useState, useRef, useEffect } from 'react';
import Badge from './Badge';

export default function TagInput({
  tags = [],
  onChange,
  placeholder = 'Add tag...',
  suggestions = [],
  className = '',
}) {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  const filteredSuggestions = suggestions.filter(
    (s) =>
      s.toLowerCase().includes(inputValue.toLowerCase()) &&
      !tags.includes(s) &&
      inputValue.length > 0
  );

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addTag = (tag) => {
    const trimmed = tag.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInputValue('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const removeTag = (index) => {
    const next = tags.filter((_, i) => i !== index);
    onChange(next);
  };

  const handleKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && inputValue.trim()) {
      e.preventDefault();
      addTag(inputValue);
    }
    if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  return (
    <div ref={containerRef} className={['relative', className].filter(Boolean).join(' ')}>
      <div
        className="glass-input flex flex-wrap items-center gap-1.5 px-2 py-1.5"
        onClick={() => inputRef.current?.focus()}
      >
        {tags.map((tag, i) => (
          <Badge
            key={`${tag}-${i}`}
            variant="purple"
            size="sm"
            removable
            onRemove={() => removeTag(i)}
          >
            {tag}
          </Badge>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setShowSuggestions(true);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          placeholder={tags.length === 0 ? placeholder : ''}
          className="min-w-[80px] flex-1 border-none bg-transparent py-1 text-sm text-white placeholder-slate-500 outline-none"
        />
      </div>

      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="glass-card absolute left-0 right-0 top-full z-20 mt-1 max-h-40 overflow-y-auto p-1">
          {filteredSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => addTag(suggestion)}
              className="w-full rounded-md px-3 py-1.5 text-left text-sm text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
