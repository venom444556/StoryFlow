import { motion } from 'framer-motion'

/**
 * Skeleton - Loading placeholder
 */
export default function Skeleton({
  width,
  height,
  variant = 'rectangular',
  className = '',
  animate = true,
}) {
  const baseClasses = [
    'bg-[var(--color-bg-glass)]',
    animate && 'animate-pulse',
  ]

  const variantClasses = {
    rectangular: 'rounded-md',
    circular: 'rounded-full',
    text: 'rounded',
  }

  const style = {
    width: width || '100%',
    height: height || (variant === 'text' ? '1em' : '100%'),
  }

  return (
    <div
      className={[
        ...baseClasses,
        variantClasses[variant] || variantClasses.rectangular,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={style}
    />
  )
}

/**
 * Skeleton group for common patterns
 */
export function SkeletonCard({ lines = 3, className = '' }) {
  return (
    <div
      className={[
        'space-y-3 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-glass)] p-4',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <Skeleton height="1.5rem" width="60%" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height="1rem"
          width={i === lines - 1 ? '40%' : '100%'}
          variant="text"
        />
      ))}
    </div>
  )
}

export function SkeletonAvatar({ size = 'md' }) {
  const sizes = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
    xl: 'h-12 w-12',
  }

  return <Skeleton variant="circular" className={sizes[size] || sizes.md} />
}

export function SkeletonList({ count = 5, className = '' }) {
  return (
    <div className={['space-y-3', className].filter(Boolean).join(' ')}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <SkeletonAvatar />
          <div className="flex-1 space-y-2">
            <Skeleton height="1rem" width="70%" variant="text" />
            <Skeleton height="0.75rem" width="40%" variant="text" />
          </div>
        </div>
      ))}
    </div>
  )
}
