import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import IssueTypeIcon from './IssueTypeIcon'

describe('IssueTypeIcon', () => {
  describe('Basic Rendering', () => {
    it('renders without crashing', () => {
      render(<IssueTypeIcon type="task" />)
      expect(screen.getByTitle('Task')).toBeInTheDocument()
    })

    it('renders with default props', () => {
      const { container } = render(<IssueTypeIcon />)
      // Should default to task type when no type provided
      const icon = container.querySelector('div')
      expect(icon).toBeInTheDocument()
    })
  })

  describe('Type Variants', () => {
    it('renders epic type with correct styling', () => {
      render(<IssueTypeIcon type="epic" />)
      const icon = screen.getByTitle('Epic')
      expect(icon).toBeInTheDocument()
      expect(icon).toHaveClass('bg-purple-500/20')
      expect(icon).toHaveClass('ring-purple-500/30')
    })

    it('renders story type with correct styling', () => {
      render(<IssueTypeIcon type="story" />)
      const icon = screen.getByTitle('Story')
      expect(icon).toBeInTheDocument()
      expect(icon).toHaveClass('bg-green-500/20')
      expect(icon).toHaveClass('ring-green-500/30')
    })

    it('renders task type with correct styling', () => {
      render(<IssueTypeIcon type="task" />)
      const icon = screen.getByTitle('Task')
      expect(icon).toBeInTheDocument()
      expect(icon).toHaveClass('bg-blue-500/20')
      expect(icon).toHaveClass('ring-blue-500/30')
    })

    it('renders bug type with correct styling', () => {
      render(<IssueTypeIcon type="bug" />)
      const icon = screen.getByTitle('Bug')
      expect(icon).toBeInTheDocument()
      expect(icon).toHaveClass('bg-red-500/20')
      expect(icon).toHaveClass('ring-red-500/30')
    })

    it('renders subtask type with correct styling', () => {
      render(<IssueTypeIcon type="subtask" />)
      const icon = screen.getByTitle('Subtask')
      expect(icon).toBeInTheDocument()
      expect(icon).toHaveClass('bg-gray-500/20')
      expect(icon).toHaveClass('ring-gray-500/30')
    })
  })

  describe('Size Variants', () => {
    it('renders with size 12', () => {
      const { container } = render(<IssueTypeIcon type="task" size={12} />)
      const icon = container.querySelector('div')
      expect(icon).toHaveClass('h-5')
      expect(icon).toHaveClass('w-5')
    })

    it('renders with size 14', () => {
      const { container } = render(<IssueTypeIcon type="task" size={14} />)
      const icon = container.querySelector('div')
      expect(icon).toHaveClass('h-5.5')
      expect(icon).toHaveClass('w-5.5')
    })

    it('renders with size 16 (default)', () => {
      const { container } = render(<IssueTypeIcon type="task" size={16} />)
      const icon = container.querySelector('div')
      expect(icon).toHaveClass('h-6')
      expect(icon).toHaveClass('w-6')
    })

    it('renders with size 20', () => {
      const { container } = render(<IssueTypeIcon type="task" size={20} />)
      const icon = container.querySelector('div')
      expect(icon).toHaveClass('h-7')
      expect(icon).toHaveClass('w-7')
    })

    it('renders with size 24', () => {
      const { container } = render(<IssueTypeIcon type="task" size={24} />)
      const icon = container.querySelector('div')
      expect(icon).toHaveClass('h-8')
      expect(icon).toHaveClass('w-8')
    })
  })

  describe('Edge Cases', () => {
    it('falls back to task type for unknown type', () => {
      const { container } = render(<IssueTypeIcon type="unknown" />)
      const icon = container.querySelector('div')
      expect(icon).toHaveClass('bg-blue-500/20')
    })

    it('falls back to default size for unsupported size', () => {
      const { container } = render(<IssueTypeIcon type="task" size={99} />)
      const icon = container.querySelector('div')
      expect(icon).toHaveClass('h-6')
      expect(icon).toHaveClass('w-6')
    })

    it('accepts custom className', () => {
      const { container } = render(<IssueTypeIcon type="task" className="custom-class" />)
      const icon = container.querySelector('div')
      expect(icon).toHaveClass('custom-class')
    })

    it('handles null type gracefully', () => {
      const { container } = render(<IssueTypeIcon type={null} />)
      const icon = container.querySelector('div')
      expect(icon).toBeInTheDocument()
    })

    it('handles undefined type gracefully', () => {
      const { container } = render(<IssueTypeIcon type={undefined} />)
      const icon = container.querySelector('div')
      expect(icon).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has title attribute with capitalized type name', () => {
      render(<IssueTypeIcon type="epic" />)
      expect(screen.getByTitle('Epic')).toBeInTheDocument()
    })

    it('renders SVG icon inside container', () => {
      const { container } = render(<IssueTypeIcon type="task" />)
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })
  })
})
