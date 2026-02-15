import { Check } from 'lucide-react'
import { motion } from 'framer-motion'

/**
 * Stepper - Multi-step wizard progress indicator
 */
export default function Stepper({
  steps = [],
  currentStep = 0,
  onStepClick,
  orientation = 'horizontal',
  className = '',
}) {
  const isHorizontal = orientation === 'horizontal'

  return (
    <div
      className={[
        'flex',
        isHorizontal ? 'flex-row items-center' : 'flex-col',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {steps.map((step, index) => {
        const isCompleted = index < currentStep
        const isCurrent = index === currentStep
        const isClickable = onStepClick && (isCompleted || isCurrent)

        return (
          <div
            key={step.id || index}
            className={[
              'flex',
              isHorizontal ? 'flex-1 items-center' : 'items-start gap-3',
              index === steps.length - 1 && isHorizontal && 'flex-none',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {/* Step indicator */}
            <div
              className={[
                'flex',
                isHorizontal ? 'flex-col items-center' : 'flex-col items-center',
              ].join(' ')}
            >
              <button
                type="button"
                disabled={!isClickable}
                onClick={() => isClickable && onStepClick(index)}
                className={[
                  'relative flex h-8 w-8 items-center justify-center rounded-full',
                  'text-sm font-medium transition-all duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-[var(--interactive-default)] focus:ring-offset-2 focus:ring-offset-[var(--color-bg-base)]',
                  isClickable && 'cursor-pointer',
                  !isClickable && 'cursor-default',
                  isCompleted &&
                    'bg-[var(--interactive-default)] text-white',
                  isCurrent &&
                    'border-2 border-[var(--interactive-default)] bg-[var(--color-bg-glass)] text-[var(--interactive-default)]',
                  !isCompleted &&
                    !isCurrent &&
                    'border border-[var(--color-border-default)] bg-[var(--color-bg-glass)] text-[var(--color-fg-muted)]',
                ].join(' ')}
              >
                {isCompleted ? (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  >
                    <Check size={16} />
                  </motion.span>
                ) : (
                  <span>{index + 1}</span>
                )}
              </button>

              {/* Step label (horizontal) */}
              {isHorizontal && (
                <div className="mt-2 text-center">
                  <span
                    className={[
                      'block text-xs font-medium',
                      isCurrent
                        ? 'text-[var(--interactive-default)]'
                        : isCompleted
                          ? 'text-[var(--color-fg-default)]'
                          : 'text-[var(--color-fg-muted)]',
                    ].join(' ')}
                  >
                    {step.label}
                  </span>
                  {step.description && (
                    <span className="mt-0.5 block text-xs text-[var(--color-fg-subtle)]">
                      {step.description}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Step label (vertical) */}
            {!isHorizontal && (
              <div className="min-w-0 flex-1 pb-8">
                <span
                  className={[
                    'block text-sm font-medium',
                    isCurrent
                      ? 'text-[var(--interactive-default)]'
                      : isCompleted
                        ? 'text-[var(--color-fg-default)]'
                        : 'text-[var(--color-fg-muted)]',
                  ].join(' ')}
                >
                  {step.label}
                </span>
                {step.description && (
                  <span className="mt-0.5 block text-xs text-[var(--color-fg-subtle)]">
                    {step.description}
                  </span>
                )}
              </div>
            )}

            {/* Connector line */}
            {index < steps.length - 1 && (
              <div
                className={[
                  isHorizontal
                    ? 'mx-2 h-0.5 flex-1'
                    : 'absolute left-4 top-8 h-full w-0.5 -translate-x-1/2',
                  isCompleted
                    ? 'bg-[var(--interactive-default)]'
                    : 'bg-[var(--color-border-default)]',
                  'transition-colors duration-200',
                ].join(' ')}
                style={!isHorizontal ? { height: 'calc(100% - 2rem)' } : undefined}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

/**
 * StepperContent - Container for step content with animation
 */
export function StepperContent({ step, children, className = '' }) {
  return (
    <motion.div
      key={step}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/**
 * Helper to create step objects
 */
export function createStep(label, description, id) {
  return { id: id || label.toLowerCase().replace(/\s+/g, '-'), label, description }
}
