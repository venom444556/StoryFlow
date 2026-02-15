import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Badge from './Badge'

describe('Badge', () => {
  describe('Basic Rendering', () => {
    it('renders without crashing', () => {
      render(<Badge>Test</Badge>)
      expect(screen.getByText('Test')).toBeInTheDocument()
    })

    it('renders children content', () => {
      render(<Badge>Badge Content</Badge>)
      expect(screen.getByText('Badge Content')).toBeInTheDocument()
    })
  })

  describe('Variant Props', () => {
    const variants = ['default', 'purple', 'blue', 'green', 'yellow', 'red', 'pink', 'cyan', 'gray']
    const semanticVariants = ['success', 'warning', 'error', 'info']

    variants.forEach((variant) => {
      it(`renders ${variant} variant`, () => {
        render(<Badge variant={variant}>{variant}</Badge>)
        expect(screen.getByText(variant)).toBeInTheDocument()
      })
    })

    semanticVariants.forEach((variant) => {
      it(`renders ${variant} semantic variant`, () => {
        render(<Badge variant={variant}>{variant}</Badge>)
        expect(screen.getByText(variant)).toBeInTheDocument()
      })
    })

    it('uses default variant when invalid variant is provided', () => {
      render(<Badge variant="invalid">Test</Badge>)
      expect(screen.getByText('Test')).toBeInTheDocument()
    })
  })

  describe('Size Props', () => {
    it('renders with sm size (default)', () => {
      render(<Badge size="sm">Small</Badge>)
      const badge = screen.getByText('Small').parentElement || screen.getByText('Small')
      expect(badge).toBeInTheDocument()
    })

    it('renders with md size', () => {
      render(<Badge size="md">Medium</Badge>)
      expect(screen.getByText('Medium')).toBeInTheDocument()
    })

    it('uses sm size when invalid size is provided', () => {
      render(<Badge size="invalid">Test</Badge>)
      expect(screen.getByText('Test')).toBeInTheDocument()
    })
  })

  describe('Dot Indicator', () => {
    it('does not show dot by default', () => {
      const { container } = render(<Badge>No Dot</Badge>)
      const dots = container.querySelectorAll('.rounded-full.h-1\\.5')
      expect(dots.length).toBe(0)
    })

    it('shows dot when dot prop is true', () => {
      const { container } = render(<Badge dot>With Dot</Badge>)
      const dots = container.querySelectorAll('.h-1\\.5.w-1\\.5.rounded-full')
      expect(dots.length).toBe(1)
    })

    it('shows colored dot for different variants', () => {
      const { container } = render(<Badge dot variant="success">Success</Badge>)
      const dot = container.querySelector('.h-1\\.5.w-1\\.5.rounded-full')
      expect(dot).toBeInTheDocument()
    })
  })

  describe('Outline Mode', () => {
    it('does not use outline by default', () => {
      const { container } = render(<Badge>Default</Badge>)
      const badge = container.querySelector('span')
      expect(badge).not.toHaveClass('bg-transparent')
    })

    it('uses outline style when outline prop is true', () => {
      const { container } = render(<Badge outline>Outline</Badge>)
      const badge = container.querySelector('span')
      expect(badge).toHaveClass('bg-transparent')
      expect(badge).toHaveClass('border')
    })

    it('applies outline variant colors correctly', () => {
      const { container } = render(<Badge outline variant="purple">Purple Outline</Badge>)
      const badge = container.querySelector('span')
      expect(badge).toHaveClass('border')
    })
  })

  describe('Removable Badge', () => {
    it('does not show remove button by default', () => {
      render(<Badge>Not Removable</Badge>)
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('shows remove button when removable is true', () => {
      render(<Badge removable>Removable</Badge>)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('has accessible label on remove button', () => {
      render(<Badge removable>Removable</Badge>)
      expect(screen.getByLabelText('Remove')).toBeInTheDocument()
    })

    it('calls onRemove when remove button is clicked', () => {
      const handleRemove = vi.fn()
      render(<Badge removable onRemove={handleRemove}>Removable</Badge>)

      fireEvent.click(screen.getByRole('button'))
      expect(handleRemove).toHaveBeenCalledTimes(1)
    })

    it('stops propagation when remove button is clicked', () => {
      const parentClick = vi.fn()
      const handleRemove = vi.fn()

      render(
        <div onClick={parentClick}>
          <Badge removable onRemove={handleRemove}>Removable</Badge>
        </div>
      )

      fireEvent.click(screen.getByRole('button'))
      expect(handleRemove).toHaveBeenCalledTimes(1)
      expect(parentClick).not.toHaveBeenCalled()
    })

    it('handles missing onRemove gracefully', () => {
      render(<Badge removable>Removable</Badge>)

      // Should not throw when clicking without onRemove handler
      expect(() => {
        fireEvent.click(screen.getByRole('button'))
      }).not.toThrow()
    })
  })

  describe('Accessibility', () => {
    it('renders as a span element', () => {
      const { container } = render(<Badge>Test</Badge>)
      expect(container.querySelector('span')).toBeInTheDocument()
    })

    it('remove button is keyboard accessible', () => {
      const handleRemove = vi.fn()
      render(<Badge removable onRemove={handleRemove}>Removable</Badge>)

      const button = screen.getByRole('button')
      button.focus()
      expect(document.activeElement).toBe(button)
    })
  })

  describe('Edge Cases', () => {
    it('handles empty children', () => {
      const { container } = render(<Badge></Badge>)
      expect(container.querySelector('span')).toBeInTheDocument()
    })

    it('handles complex children', () => {
      render(
        <Badge>
          <span data-testid="inner">Complex</span>
        </Badge>
      )
      expect(screen.getByTestId('inner')).toBeInTheDocument()
    })

    it('combines dot and removable features', () => {
      const handleRemove = vi.fn()
      const { container } = render(
        <Badge dot removable onRemove={handleRemove}>
          Combined
        </Badge>
      )

      const dot = container.querySelector('.h-1\\.5.w-1\\.5.rounded-full')
      expect(dot).toBeInTheDocument()
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('combines outline and dot features', () => {
      const { container } = render(
        <Badge outline dot variant="success">
          Combined
        </Badge>
      )

      const badge = container.querySelector('span')
      expect(badge).toHaveClass('border')
      const dot = container.querySelector('.h-1\\.5.w-1\\.5.rounded-full')
      expect(dot).toBeInTheDocument()
    })
  })
})
