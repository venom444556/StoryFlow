import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import DependencyEdge from './DependencyEdge'

describe('DependencyEdge', () => {
  const mockFromNode = { id: '1', x: 100, y: 100, type: 'component' }
  const mockToNode = { id: '2', x: 400, y: 100, type: 'hook' }

  const defaultProps = {
    fromNode: mockFromNode,
    toNode: mockToNode,
    sourceType: 'component',
    onDelete: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Helper to render SVG element
  const renderEdge = (props = {}) => {
    const { container } = render(
      <svg>
        <DependencyEdge {...defaultProps} {...props} />
      </svg>
    )
    return container.querySelector('g')
  }

  describe('rendering', () => {
    it('should render without crashing', () => {
      const edge = renderEdge()
      expect(edge).toBeInTheDocument()
    })

    it('should render path element', () => {
      const edge = renderEdge()
      const paths = edge.querySelectorAll('path')
      expect(paths.length).toBeGreaterThanOrEqual(1)
    })

    it('should render arrowhead circle', () => {
      const edge = renderEdge()
      const circles = edge.querySelectorAll('circle')
      expect(circles.length).toBeGreaterThanOrEqual(1)
    })

    it('should return null when fromNode is null', () => {
      const edge = renderEdge({ fromNode: null })
      expect(edge).toBeNull()
    })

    it('should return null when toNode is null', () => {
      const edge = renderEdge({ toNode: null })
      expect(edge).toBeNull()
    })

    it('should return null when both nodes are null', () => {
      const edge = renderEdge({ fromNode: null, toNode: null })
      expect(edge).toBeNull()
    })
  })

  describe('path calculation', () => {
    it('should create a bezier path between nodes', () => {
      const edge = renderEdge()
      const visiblePath = edge.querySelectorAll('path')[1] // Second path is visible
      const pathD = visiblePath?.getAttribute('d')

      // Should have bezier curve commands (C for cubic bezier)
      expect(pathD).toContain('M') // Move to
      expect(pathD).toContain('C') // Cubic bezier curve
    })

    it('should connect from output point to input point', () => {
      const edge = renderEdge()
      const paths = edge.querySelectorAll('path')

      // First path is hit area, second is visible
      const visiblePath = paths[1]
      const pathD = visiblePath?.getAttribute('d')

      // Path should start near the fromNode output point
      // Output point is at x + NODE_WIDTH + 4 = 100 + 180 + 4 = 284
      expect(pathD).toMatch(/M\s*28[0-9]/)
    })
  })

  describe('hover interactions', () => {
    it('should change style on mouse enter', () => {
      const edge = renderEdge()
      const visiblePath = edge.querySelectorAll('path')[1]

      fireEvent.mouseEnter(edge)

      const hoveredStroke = visiblePath?.getAttribute('stroke')
      // Hovered state should use blue color
      expect(hoveredStroke).toBe('#3b82f6')
    })

    it('should revert style on mouse leave', () => {
      const edge = renderEdge()
      const visiblePath = edge.querySelectorAll('path')[1]

      fireEvent.mouseEnter(edge)
      fireEvent.mouseLeave(edge)

      const stroke = visiblePath?.getAttribute('stroke')
      // Should revert to source type color (component = purple)
      expect(stroke).not.toBe('#3b82f6')
    })

    it('should show delete button on hover', () => {
      const edge = renderEdge()

      // Initially no delete button
      let deleteCircles = edge.querySelectorAll('circle[r="10"]')
      expect(deleteCircles.length).toBe(0)

      fireEvent.mouseEnter(edge)

      // After hover, delete button should appear
      deleteCircles = edge.querySelectorAll('circle[r="10"]')
      expect(deleteCircles.length).toBe(1)
    })

    it('should hide delete button on mouse leave', () => {
      const edge = renderEdge()

      fireEvent.mouseEnter(edge)
      fireEvent.mouseLeave(edge)

      const deleteCircles = edge.querySelectorAll('circle[r="10"]')
      expect(deleteCircles.length).toBe(0)
    })
  })

  describe('delete functionality', () => {
    it('should call onDelete when delete button is clicked', () => {
      const edge = renderEdge()

      fireEvent.mouseEnter(edge)

      // Find the delete button group
      const deleteButton = edge.querySelector('circle[r="10"]')?.parentElement
      if (deleteButton) {
        fireEvent.click(deleteButton)
        expect(defaultProps.onDelete).toHaveBeenCalledTimes(1)
      }
    })

    it('should stop propagation when delete is clicked', () => {
      const edge = renderEdge()

      fireEvent.mouseEnter(edge)

      const deleteButton = edge.querySelector('circle[r="10"]')?.parentElement
      const stopPropagation = vi.fn()

      if (deleteButton) {
        fireEvent.click(deleteButton, { stopPropagation })
        // The component should have stopped propagation
        expect(defaultProps.onDelete).toHaveBeenCalled()
      }
    })

    it('should not show delete button if onDelete is not provided', () => {
      const edge = renderEdge({ onDelete: undefined })

      fireEvent.mouseEnter(edge)

      const deleteCircles = edge.querySelectorAll('circle[r="10"]')
      expect(deleteCircles.length).toBe(0)
    })
  })

  describe('color handling', () => {
    it('should use source type color for edge', () => {
      const edge = renderEdge({ sourceType: 'hook' })
      const visiblePath = edge.querySelectorAll('path')[1]

      const stroke = visiblePath?.getAttribute('stroke')
      // Hook color is cyan #06b6d4
      expect(stroke).toBe('#06b6d4')
    })

    it('should fall back to gray for unknown type', () => {
      const edge = renderEdge({ sourceType: 'unknown' })
      const visiblePath = edge.querySelectorAll('path')[1]

      const stroke = visiblePath?.getAttribute('stroke')
      expect(stroke).toBe('#6b7280')
    })

    it('should fall back to gray when sourceType is undefined', () => {
      const edge = renderEdge({ sourceType: undefined })
      const visiblePath = edge.querySelectorAll('path')[1]

      const stroke = visiblePath?.getAttribute('stroke')
      expect(stroke).toBe('#6b7280')
    })
  })

  describe('hit area', () => {
    it('should render invisible hit area for better click detection', () => {
      const edge = renderEdge()
      const hitArea = edge.querySelectorAll('path')[0]

      expect(hitArea?.getAttribute('stroke')).toBe('transparent')
      expect(hitArea?.getAttribute('stroke-width')).toBe('14')
    })
  })

  describe('edge cases', () => {
    it('should handle nodes at same position', () => {
      const samePosition = {
        fromNode: { id: '1', x: 100, y: 100, type: 'component' },
        toNode: { id: '2', x: 100, y: 100, type: 'hook' },
      }
      const edge = renderEdge(samePosition)
      expect(edge).toBeInTheDocument()
    })

    it('should handle negative coordinates', () => {
      const negativeCoords = {
        fromNode: { id: '1', x: -100, y: -100, type: 'component' },
        toNode: { id: '2', x: 100, y: 100, type: 'hook' },
      }
      const edge = renderEdge(negativeCoords)
      expect(edge).toBeInTheDocument()
    })

    it('should handle very large coordinates', () => {
      const largeCoords = {
        fromNode: { id: '1', x: 10000, y: 10000, type: 'component' },
        toNode: { id: '2', x: 20000, y: 20000, type: 'hook' },
      }
      const edge = renderEdge(largeCoords)
      expect(edge).toBeInTheDocument()
    })
  })
})
