import { Suspense, useState, useEffect, useRef } from 'react'
import { Loader2 } from 'lucide-react'

/**
 * LazyLoad - Wrapper for lazy loading components when they enter viewport
 *
 * Uses Intersection Observer to detect when the component container
 * enters the viewport, then loads the actual content.
 */
export default function LazyLoad({
  children,
  placeholder,
  threshold = 0.1,
  rootMargin = '100px',
  minHeight = 100,
  className = '',
}) {
  const [isVisible, setIsVisible] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    const element = containerRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          setHasLoaded(true)
          observer.disconnect()
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(element)

    return () => observer.disconnect()
  }, [threshold, rootMargin])

  // Once loaded, always render (for smooth scrolling back)
  const shouldRender = hasLoaded

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ minHeight: !shouldRender ? minHeight : undefined }}
    >
      {shouldRender ? (
        <Suspense fallback={placeholder || <LoadingPlaceholder height={minHeight} />}>
          {children}
        </Suspense>
      ) : (
        placeholder || <LoadingPlaceholder height={minHeight} />
      )}
    </div>
  )
}

/**
 * Default loading placeholder
 */
export function LoadingPlaceholder({ height = 100, className = '' }) {
  return (
    <div
      className={[
        'flex items-center justify-center rounded-lg',
        'bg-[var(--color-bg-subtle)] animate-pulse',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ height }}
    >
      <Loader2 className="h-6 w-6 animate-spin text-[var(--color-fg-subtle)]" />
    </div>
  )
}

/**
 * Skeleton loading placeholder for cards
 */
export function SkeletonCard({ className = '' }) {
  return (
    <div
      className={[
        'rounded-lg border border-[var(--color-border-muted)]',
        'bg-[var(--color-bg-glass)] p-4',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="animate-pulse space-y-3">
        <div className="h-4 w-3/4 rounded bg-[var(--color-bg-subtle)]" />
        <div className="h-3 w-1/2 rounded bg-[var(--color-bg-subtle)]" />
        <div className="flex gap-2">
          <div className="h-6 w-16 rounded bg-[var(--color-bg-subtle)]" />
          <div className="h-6 w-16 rounded bg-[var(--color-bg-subtle)]" />
        </div>
      </div>
    </div>
  )
}

/**
 * Skeleton loading placeholder for lists
 */
export function SkeletonList({ count = 5, className = '' }) {
  return (
    <div className={['space-y-2', className].filter(Boolean).join(' ')}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-lg bg-[var(--color-bg-subtle)] p-3"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-[var(--color-bg-muted)]" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-3/4 rounded bg-[var(--color-bg-muted)]" />
              <div className="h-2 w-1/2 rounded bg-[var(--color-bg-muted)]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Skeleton loading placeholder for text blocks
 */
export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={['animate-pulse space-y-2', className].filter(Boolean).join(' ')}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-3 rounded bg-[var(--color-bg-subtle)]"
          style={{
            width: i === lines - 1 ? '60%' : '100%',
            animationDelay: `${i * 50}ms`,
          }}
        />
      ))}
    </div>
  )
}

/**
 * Skeleton loading placeholder for charts
 */
export function SkeletonChart({ height = 200, className = '' }) {
  return (
    <div
      className={[
        'animate-pulse rounded-lg bg-[var(--color-bg-subtle)]',
        'flex items-end justify-around gap-2 p-4',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ height }}
    >
      {Array.from({ length: 7 }).map((_, i) => (
        <div
          key={i}
          className="w-8 rounded-t bg-[var(--color-bg-muted)]"
          style={{
            height: `${30 + Math.random() * 50}%`,
            animationDelay: `${i * 100}ms`,
          }}
        />
      ))}
    </div>
  )
}
