/**
 * Performance Optimization Utilities
 *
 * Tools for optimizing rendering, data fetching, and storage.
 */

import { useCallback, useRef, useMemo, useState, useEffect } from 'react'

/**
 * Debounce a function call
 */
export function debounce(fn, delay) {
  let timeoutId
  return function (...args) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn.apply(this, args), delay)
  }
}

/**
 * Throttle a function call
 */
export function throttle(fn, limit) {
  let inThrottle
  return function (...args) {
    if (!inThrottle) {
      fn.apply(this, args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * Hook for debounced values
 */
export function useDebouncedValue(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}

/**
 * Hook for debounced callbacks
 */
export function useDebouncedCallback(callback, delay = 300, deps = []) {
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(
    debounce((...args) => callbackRef.current(...args), delay),
    [delay, ...deps]
  )
}

/**
 * Hook for throttled callbacks
 */
export function useThrottledCallback(callback, limit = 100, deps = []) {
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(
    throttle((...args) => callbackRef.current(...args), limit),
    [limit, ...deps]
  )
}

/**
 * Hook for intersection observer (lazy loading)
 */
export function useIntersectionObserver(options = {}) {
  const [entry, setEntry] = useState(null)
  const [node, setNode] = useState(null)

  const observer = useRef(null)

  useEffect(() => {
    if (observer.current) observer.current.disconnect()

    observer.current = new IntersectionObserver(
      ([entry]) => setEntry(entry),
      {
        threshold: 0.1,
        rootMargin: '100px',
        ...options,
      }
    )

    if (node) observer.current.observe(node)

    return () => {
      if (observer.current) observer.current.disconnect()
    }
  }, [node, options.threshold, options.rootMargin, options.root])

  return [setNode, entry?.isIntersecting ?? false, entry]
}

/**
 * Hook for lazy loading components
 */
export function useLazyLoad(threshold = 0.1) {
  const [setRef, isVisible] = useIntersectionObserver({ threshold })
  const [hasLoaded, setHasLoaded] = useState(false)

  useEffect(() => {
    if (isVisible && !hasLoaded) {
      setHasLoaded(true)
    }
  }, [isVisible, hasLoaded])

  return [setRef, hasLoaded]
}

/**
 * Measure render performance
 */
export function useRenderCount(componentName) {
  const renderCount = useRef(0)
  renderCount.current++

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[Render] ${componentName}: ${renderCount.current}`)
    }
  })

  return renderCount.current
}

/**
 * Memoize expensive computations with cache
 */
export function memoizeWithCache(fn, getCacheKey = (...args) => JSON.stringify(args)) {
  const cache = new Map()
  const MAX_CACHE_SIZE = 100

  return function (...args) {
    const key = getCacheKey(...args)

    if (cache.has(key)) {
      return cache.get(key)
    }

    const result = fn.apply(this, args)

    // LRU-style eviction
    if (cache.size >= MAX_CACHE_SIZE) {
      const firstKey = cache.keys().next().value
      cache.delete(firstKey)
    }

    cache.set(key, result)
    return result
  }
}

/**
 * Batch multiple state updates
 */
export function useBatchedUpdates() {
  const pendingUpdates = useRef([])
  const frameRef = useRef(null)

  const scheduleUpdate = useCallback((update) => {
    pendingUpdates.current.push(update)

    if (!frameRef.current) {
      frameRef.current = requestAnimationFrame(() => {
        const updates = pendingUpdates.current
        pendingUpdates.current = []
        frameRef.current = null

        // Execute all updates
        updates.forEach((fn) => fn())
      })
    }
  }, [])

  useEffect(() => {
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
      }
    }
  }, [])

  return scheduleUpdate
}

/**
 * Check if data exceeds size threshold (for IndexedDB decisions)
 */
export function estimateDataSize(data) {
  try {
    const str = JSON.stringify(data)
    // Rough estimate: 2 bytes per character in UTF-16
    return str.length * 2
  } catch {
    return 0
  }
}

/**
 * Size thresholds
 */
export const SIZE_THRESHOLDS = {
  WARN: 512 * 1024, // 512KB - show warning
  LARGE: 1024 * 1024, // 1MB - suggest IndexedDB
  MAX_LOCALSTORAGE: 5 * 1024 * 1024, // 5MB - localStorage limit
}

/**
 * Check if project data is getting large
 */
export function checkDataSize(projects) {
  const size = estimateDataSize(projects)

  return {
    size,
    sizeFormatted: formatBytes(size),
    isLarge: size > SIZE_THRESHOLDS.LARGE,
    isWarning: size > SIZE_THRESHOLDS.WARN,
    isNearLimit: size > SIZE_THRESHOLDS.MAX_LOCALSTORAGE * 0.8,
    recommendation:
      size > SIZE_THRESHOLDS.LARGE
        ? 'Consider exporting old projects to free up space'
        : size > SIZE_THRESHOLDS.WARN
          ? 'Data size is growing - monitor usage'
          : null,
  }
}

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}
