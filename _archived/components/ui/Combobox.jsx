import { useState, useRef, useEffect, forwardRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Check, Search, X } from 'lucide-react'

/**
 * Combobox - Searchable select dropdown
 */
const Combobox = forwardRef(function Combobox(
  {
    options = [],
    value,
    onChange,
    placeholder = 'Select...',
    searchPlaceholder = 'Search...',
    disabled = false,
    error,
    className = '',
    renderOption,
    getOptionLabel = (opt) => opt?.label || opt,
    getOptionValue = (opt) => opt?.value ?? opt,
    multiple = false,
    clearable = true,
  },
  ref
) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef(null)
  const inputRef = useRef(null)

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
        setSearch('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Focus input when opening
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const filteredOptions = options.filter((opt) => {
    const label = getOptionLabel(opt)
    return label.toLowerCase().includes(search.toLowerCase())
  })

  const selectedOption = multiple
    ? options.filter((opt) => value?.includes(getOptionValue(opt)))
    : options.find((opt) => getOptionValue(opt) === value)

  const handleSelect = (option) => {
    const optValue = getOptionValue(option)

    if (multiple) {
      const currentValues = value || []
      const newValues = currentValues.includes(optValue)
        ? currentValues.filter((v) => v !== optValue)
        : [...currentValues, optValue]
      onChange?.(newValues)
    } else {
      onChange?.(optValue)
      setIsOpen(false)
      setSearch('')
    }
  }

  const handleClear = (e) => {
    e.stopPropagation()
    onChange?.(multiple ? [] : null)
  }

  const getDisplayValue = () => {
    if (multiple) {
      if (!selectedOption?.length) return placeholder
      if (selectedOption.length === 1) return getOptionLabel(selectedOption[0])
      return `${selectedOption.length} selected`
    }
    return selectedOption ? getOptionLabel(selectedOption) : placeholder
  }

  const hasValue = multiple ? value?.length > 0 : value != null

  return (
    <div ref={containerRef} className={['relative', className].filter(Boolean).join(' ')}>
      {/* Trigger button */}
      <button
        ref={ref}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={[
          'flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2',
          'border bg-[var(--color-bg-glass)] text-left text-sm',
          'transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-[var(--interactive-default)] focus:ring-offset-1 focus:ring-offset-[var(--color-bg-base)]',
          disabled && 'cursor-not-allowed opacity-50',
          error
            ? 'border-[var(--color-danger)]'
            : isOpen
              ? 'border-[var(--interactive-default)]'
              : 'border-[var(--color-border-default)]',
          hasValue ? 'text-[var(--color-fg-default)]' : 'text-[var(--color-fg-muted)]',
        ].join(' ')}
      >
        <span className="min-w-0 flex-1 truncate">{getDisplayValue()}</span>

        <div className="flex items-center gap-1">
          {clearable && hasValue && !disabled && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              onKeyDown={(e) => e.key === 'Enter' && handleClear(e)}
              className="rounded p-0.5 text-[var(--color-fg-muted)] hover:bg-[var(--color-bg-glass-hover)] hover:text-[var(--color-fg-default)]"
            >
              <X size={14} />
            </span>
          )}
          <ChevronDown
            size={16}
            className={[
              'text-[var(--color-fg-muted)] transition-transform duration-200',
              isOpen && 'rotate-180',
            ].join(' ')}
          />
        </div>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className={[
              'absolute left-0 right-0 top-full z-50 mt-1',
              'rounded-lg border border-[var(--color-border-default)]',
              'bg-[var(--color-bg-glass)] backdrop-blur-xl',
              'shadow-lg',
              'overflow-hidden',
            ].join(' ')}
          >
            {/* Search input */}
            <div className="border-b border-[var(--color-border-muted)] p-2">
              <div className="flex items-center gap-2 rounded-md bg-[var(--color-bg-subtle)] px-2 py-1.5">
                <Search size={14} className="text-[var(--color-fg-muted)]" />
                <input
                  ref={inputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="min-w-0 flex-1 bg-transparent text-sm text-[var(--color-fg-default)] placeholder-[var(--color-fg-subtle)] focus:outline-none"
                />
              </div>
            </div>

            {/* Options list */}
            <div className="max-h-60 overflow-auto p-1">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-6 text-center text-sm text-[var(--color-fg-muted)]">
                  No options found
                </div>
              ) : (
                filteredOptions.map((option, index) => {
                  const optValue = getOptionValue(option)
                  const isSelected = multiple
                    ? value?.includes(optValue)
                    : optValue === value

                  return (
                    <button
                      key={optValue ?? index}
                      type="button"
                      onClick={() => handleSelect(option)}
                      className={[
                        'flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm',
                        'transition-colors duration-100',
                        isSelected
                          ? 'bg-[var(--interactive-default)]/10 text-[var(--interactive-default)]'
                          : 'text-[var(--color-fg-default)] hover:bg-[var(--color-bg-glass-hover)]',
                      ].join(' ')}
                    >
                      {multiple && (
                        <span
                          className={[
                            'flex h-4 w-4 items-center justify-center rounded border',
                            isSelected
                              ? 'border-[var(--interactive-default)] bg-[var(--interactive-default)]'
                              : 'border-[var(--color-border-default)]',
                          ].join(' ')}
                        >
                          {isSelected && <Check size={12} className="text-white" />}
                        </span>
                      )}
                      <span className="min-w-0 flex-1">
                        {renderOption ? renderOption(option) : getOptionLabel(option)}
                      </span>
                      {!multiple && isSelected && (
                        <Check size={16} className="text-[var(--interactive-default)]" />
                      )}
                    </button>
                  )
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error message */}
      {error && <p className="mt-1 text-xs text-[var(--color-danger)]">{error}</p>}
    </div>
  )
})

export default Combobox
