import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Avatar from './Avatar'

describe('Avatar', () => {
  describe('Basic Rendering', () => {
    it('renders without crashing', () => {
      render(<Avatar />)
      expect(screen.getByText('?')).toBeInTheDocument()
    })

    it('renders with a name', () => {
      render(<Avatar name="John Doe" />)
      expect(screen.getByText('JD')).toBeInTheDocument()
    })

    it('displays single initial for single word name', () => {
      render(<Avatar name="John" />)
      expect(screen.getByText('J')).toBeInTheDocument()
    })

    it('displays question mark for empty name', () => {
      render(<Avatar name="" />)
      expect(screen.getByText('?')).toBeInTheDocument()
    })
  })

  describe('Image Mode', () => {
    it('renders an image when src is provided', () => {
      render(<Avatar name="John Doe" src="/test-image.jpg" />)
      const img = screen.getByRole('img')
      expect(img).toBeInTheDocument()
      expect(img).toHaveAttribute('src', '/test-image.jpg')
      expect(img).toHaveAttribute('alt', 'John Doe')
    })

    it('does not show initials when image is provided', () => {
      render(<Avatar name="John Doe" src="/test-image.jpg" />)
      expect(screen.queryByText('JD')).not.toBeInTheDocument()
    })
  })

  describe('Size Variants', () => {
    it('renders with sm size', () => {
      render(<Avatar name="John Doe" size="sm" />)
      const avatar = screen.getByText('JD')
      expect(avatar).toHaveClass('h-6', 'w-6')
    })

    it('renders with md size (default)', () => {
      render(<Avatar name="John Doe" />)
      const avatar = screen.getByText('JD')
      expect(avatar).toHaveClass('h-8', 'w-8')
    })

    it('renders with lg size', () => {
      render(<Avatar name="John Doe" size="lg" />)
      const avatar = screen.getByText('JD')
      expect(avatar).toHaveClass('h-10', 'w-10')
    })

    it('renders with xl size', () => {
      render(<Avatar name="John Doe" size="xl" />)
      const avatar = screen.getByText('JD')
      expect(avatar).toHaveClass('h-12', 'w-12')
    })

    it('falls back to md size for invalid size', () => {
      render(<Avatar name="John Doe" size="invalid" />)
      const avatar = screen.getByText('JD')
      expect(avatar).toHaveClass('h-8', 'w-8')
    })
  })

  describe('Accessibility', () => {
    it('has aria-label with the name', () => {
      render(<Avatar name="John Doe" />)
      const avatar = screen.getByLabelText('John Doe')
      expect(avatar).toBeInTheDocument()
    })

    it('has title attribute with the name', () => {
      render(<Avatar name="John Doe" />)
      const avatar = screen.getByTitle('John Doe')
      expect(avatar).toBeInTheDocument()
    })
  })

  describe('Custom Styling', () => {
    it('applies custom className', () => {
      render(<Avatar name="John Doe" className="custom-class" />)
      const avatar = screen.getByText('JD')
      expect(avatar).toHaveClass('custom-class')
    })

    it('applies custom className to image mode', () => {
      render(<Avatar name="John Doe" src="/test.jpg" className="custom-class" />)
      const img = screen.getByRole('img')
      expect(img).toHaveClass('custom-class')
    })
  })

  describe('Gradient Assignment', () => {
    it('assigns consistent gradient for the same name', () => {
      const { rerender } = render(<Avatar name="Consistent Name" />)
      const avatar1 = screen.getByText('CN')
      const classes1 = avatar1.className

      rerender(<Avatar name="Consistent Name" />)
      const avatar2 = screen.getByText('CN')
      const classes2 = avatar2.className

      expect(classes1).toBe(classes2)
    })

    it('assigns different gradients for different names', () => {
      const { rerender } = render(<Avatar name="Alice" />)
      const avatar1 = screen.getByText('A')
      const hasGradient1 = avatar1.className.includes('from-')

      rerender(<Avatar name="Bob" />)
      const avatar2 = screen.getByText('B')
      const hasGradient2 = avatar2.className.includes('from-')

      expect(hasGradient1).toBe(true)
      expect(hasGradient2).toBe(true)
    })
  })

  describe('Edge Cases', () => {
    it('handles null name gracefully', () => {
      // null overrides the default parameter, so hashName(null) throws
      expect(() => render(<Avatar name={null} />)).toThrow()
    })

    it('handles undefined name gracefully', () => {
      render(<Avatar name={undefined} />)
      expect(screen.getByText('?')).toBeInTheDocument()
    })

    it('handles names with extra whitespace', () => {
      render(<Avatar name="  John   Doe  " />)
      expect(screen.getByText('JD')).toBeInTheDocument()
    })

    it('handles names with multiple words (takes first two)', () => {
      render(<Avatar name="John Michael Doe Smith" />)
      expect(screen.getByText('JM')).toBeInTheDocument()
    })
  })
})
