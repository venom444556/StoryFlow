import { useState, useRef, useEffect, forwardRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react'
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
  parseISO,
} from 'date-fns'

/**
 * DatePicker - Date selection component
 */
const DatePicker = forwardRef(function DatePicker(
  {
    value,
    onChange,
    placeholder = 'Select date...',
    disabled = false,
    error,
    className = '',
    minDate,
    maxDate,
    clearable = true,
    dateFormat = 'MMM d, yyyy',
  },
  ref
) {
  const [isOpen, setIsOpen] = useState(false)
  const [viewDate, setViewDate] = useState(() => {
    if (value) {
      return typeof value === 'string' ? parseISO(value) : value
    }
    return new Date()
  })
  const containerRef = useRef(null)

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Update view date when value changes
  useEffect(() => {
    if (value) {
      const date = typeof value === 'string' ? parseISO(value) : value
      setViewDate(date)
    }
  }, [value])

  const selectedDate = value ? (typeof value === 'string' ? parseISO(value) : value) : null

  const handleSelect = (date) => {
    onChange?.(date.toISOString().split('T')[0])
    setIsOpen(false)
  }

  const handleClear = (e) => {
    e.stopPropagation()
    onChange?.(null)
  }

  const handlePrevMonth = () => setViewDate(subMonths(viewDate, 1))
  const handleNextMonth = () => setViewDate(addMonths(viewDate, 1))

  const isDateDisabled = (date) => {
    if (minDate && date < parseISO(minDate)) return true
    if (maxDate && date > parseISO(maxDate)) return true
    return false
  }

  // Generate calendar days
  const monthStart = startOfMonth(viewDate)
  const monthEnd = endOfMonth(viewDate)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)

  const days = []
  let day = calendarStart

  while (day <= calendarEnd) {
    days.push(day)
    day = addDays(day, 1)
  }

  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

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
          selectedDate ? 'text-[var(--color-fg-default)]' : 'text-[var(--color-fg-muted)]',
        ].join(' ')}
      >
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-[var(--color-fg-muted)]" />
          <span className="min-w-0 flex-1 truncate">
            {selectedDate ? format(selectedDate, dateFormat) : placeholder}
          </span>
        </div>

        {clearable && selectedDate && !disabled && (
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
      </button>

      {/* Calendar dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className={[
              'absolute left-0 top-full z-50 mt-1',
              'rounded-lg border border-[var(--color-border-default)]',
              'bg-[var(--color-bg-glass)] backdrop-blur-xl',
              'shadow-lg',
              'p-3',
            ].join(' ')}
          >
            {/* Month navigation */}
            <div className="mb-2 flex items-center justify-between">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="rounded p-1 text-[var(--color-fg-muted)] transition-colors hover:bg-[var(--color-bg-glass-hover)] hover:text-[var(--color-fg-default)]"
              >
                <ChevronLeft size={16} />
              </button>

              <span className="text-sm font-medium text-[var(--color-fg-default)]">
                {format(viewDate, 'MMMM yyyy')}
              </span>

              <button
                type="button"
                onClick={handleNextMonth}
                className="rounded p-1 text-[var(--color-fg-muted)] transition-colors hover:bg-[var(--color-bg-glass-hover)] hover:text-[var(--color-fg-default)]"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Week days header */}
            <div className="mb-1 grid grid-cols-7 gap-1">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="py-1 text-center text-xs font-medium text-[var(--color-fg-subtle)]"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, index) => {
                const isCurrentMonth = isSameMonth(day, viewDate)
                const isSelected = selectedDate && isSameDay(day, selectedDate)
                const isTodayDate = isToday(day)
                const isDisabled = isDateDisabled(day)

                return (
                  <button
                    key={index}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => handleSelect(day)}
                    className={[
                      'flex h-8 w-8 items-center justify-center rounded text-sm',
                      'transition-colors duration-100',
                      isDisabled && 'cursor-not-allowed opacity-30',
                      !isCurrentMonth && 'text-[var(--color-fg-subtle)]',
                      isCurrentMonth && !isSelected && 'text-[var(--color-fg-default)]',
                      isSelected &&
                        'bg-[var(--interactive-default)] text-white font-medium',
                      !isSelected &&
                        !isDisabled &&
                        'hover:bg-[var(--color-bg-glass-hover)]',
                      isTodayDate &&
                        !isSelected &&
                        'ring-1 ring-[var(--interactive-default)]',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {format(day, 'd')}
                  </button>
                )
              })}
            </div>

            {/* Today button */}
            <div className="mt-2 border-t border-[var(--color-border-muted)] pt-2">
              <button
                type="button"
                onClick={() => handleSelect(new Date())}
                className="w-full rounded-md py-1.5 text-center text-xs font-medium text-[var(--interactive-default)] transition-colors hover:bg-[var(--interactive-default)]/10"
              >
                Today
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error message */}
      {error && <p className="mt-1 text-xs text-[var(--color-danger)]">{error}</p>}
    </div>
  )
})

export default DatePicker
