import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react'

/**
 * Virtualized list component for rendering large lists efficiently.
 * Only renders items that are visible in the viewport plus a buffer.
 *
 * @param {Array} items - Array of items to render
 * @param {number} itemHeight - Fixed height of each item in pixels
 * @param {Function} renderItem - Function to render each item: (item, index) => ReactNode
 * @param {number} overscan - Number of items to render outside viewport (default: 5)
 * @param {string} className - Additional CSS classes for the container
 * @param {Function} getItemKey - Function to get unique key for item (default: index)
 */
export default function VirtualList({
  items,
  itemHeight,
  renderItem,
  overscan = 5,
  className = '',
  getItemKey,
}) {
  const containerRef = useRef(null)
  const [scrollTop, setScrollTop] = useState(0)
  const [containerHeight, setContainerHeight] = useState(0)

  // Handle scroll events
  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop)
  }, [])

  // Update container height on resize
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const updateHeight = () => {
      setContainerHeight(container.clientHeight)
    }

    updateHeight()

    const resizeObserver = new ResizeObserver(updateHeight)
    resizeObserver.observe(container)

    return () => resizeObserver.disconnect()
  }, [])

  // Calculate visible range
  const { startIndex, endIndex, offsetY } = useMemo(() => {
    const totalHeight = items.length * itemHeight
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
    const visibleCount = Math.ceil(containerHeight / itemHeight)
    const end = Math.min(items.length - 1, start + visibleCount + overscan * 2)

    return {
      startIndex: start,
      endIndex: end,
      offsetY: start * itemHeight,
      totalHeight,
    }
  }, [items.length, itemHeight, scrollTop, containerHeight, overscan])

  // Get visible items
  const visibleItems = useMemo(() => {
    return items.slice(startIndex, endIndex + 1).map((item, i) => ({
      item,
      index: startIndex + i,
    }))
  }, [items, startIndex, endIndex])

  const totalHeight = items.length * itemHeight

  return (
    <div
      ref={containerRef}
      className={`overflow-y-auto ${className}`}
      onScroll={handleScroll}
    >
      {/* Spacer to maintain scroll height */}
      <div style={{ height: totalHeight, position: 'relative' }}>
        {/* Positioned container for visible items */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            transform: `translateY(${offsetY}px)`,
          }}
        >
          {visibleItems.map(({ item, index }) => (
            <div
              key={getItemKey ? getItemKey(item, index) : index}
              style={{ height: itemHeight }}
            >
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * Hook for virtualizing existing list components.
 * Returns slice info and container props.
 */
export function useVirtualList({
  itemCount,
  itemHeight,
  containerRef,
  overscan = 5,
}) {
  const [scrollTop, setScrollTop] = useState(0)
  const [containerHeight, setContainerHeight] = useState(0)

  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop)
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const updateHeight = () => {
      setContainerHeight(container.clientHeight)
    }

    updateHeight()

    const resizeObserver = new ResizeObserver(updateHeight)
    resizeObserver.observe(container)

    return () => resizeObserver.disconnect()
  }, [containerRef])

  const { startIndex, endIndex, offsetY, totalHeight } = useMemo(() => {
    const total = itemCount * itemHeight
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
    const visibleCount = Math.ceil(containerHeight / itemHeight)
    const end = Math.min(itemCount - 1, start + visibleCount + overscan * 2)

    return {
      startIndex: start,
      endIndex: end,
      offsetY: start * itemHeight,
      totalHeight: total,
    }
  }, [itemCount, itemHeight, scrollTop, containerHeight, overscan])

  return {
    startIndex,
    endIndex,
    offsetY,
    totalHeight,
    handleScroll,
    isVirtualized: itemCount > 50, // Only virtualize large lists
  }
}
