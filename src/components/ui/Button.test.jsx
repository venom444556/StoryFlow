import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Plus, ArrowRight } from 'lucide-react'
import Button from './Button'

describe('Button', () => {
  describe('Basic Rendering', () => {
    it('renders without crashing', () => {
      render(<Button>Click Me</Button>)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('renders children content', () => {
      render(<Button>Button Text</Button>)
      expect(screen.getByText('Button Text')).toBeInTheDocument()
    })

    it('renders as button element by default', () => {
      render(<Button>Test</Button>)
      expect(screen.getByRole('button').tagName).toBe('BUTTON')
    })
  })

  describe('Variant Props', () => {
    it('renders primary variant by default', () => {
      render(<Button>Primary</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('text-[var(--color-fg-on-accent)]')
    })

    it('renders secondary variant', () => {
      render(<Button variant="secondary">Secondary</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('glass')
    })

    it('renders danger variant', () => {
      render(<Button variant="danger">Danger</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('text-[var(--color-fg-on-accent)]')
    })

    it('renders ghost variant', () => {
      render(<Button variant="ghost">Ghost</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-transparent')
    })

    it('renders outline variant', () => {
      render(<Button variant="outline">Outline</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('border')
    })

    it('uses primary variant when invalid variant is provided', () => {
      render(<Button variant="invalid">Test</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('text-[var(--color-fg-on-accent)]')
    })
  })

  describe('Size Props', () => {
    it('renders with sm size', () => {
      const { container } = render(<Button size="sm">Small</Button>)
      const button = container.querySelector('button')
      expect(button.className).toContain('sm')
    })

    it('renders with md size (default)', () => {
      const { container } = render(<Button>Medium</Button>)
      const button = container.querySelector('button')
      expect(button.className).toContain('md')
    })

    it('renders with lg size', () => {
      const { container } = render(<Button size="lg">Large</Button>)
      const button = container.querySelector('button')
      expect(button.className).toContain('lg')
    })
  })

  describe('Icon Props', () => {
    it('renders with left icon', () => {
      render(<Button icon={Plus}>With Icon</Button>)
      const button = screen.getByRole('button')
      const svg = button.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('renders with right icon', () => {
      render(<Button iconRight={ArrowRight}>With Right Icon</Button>)
      const button = screen.getByRole('button')
      const svg = button.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('renders with both icons', () => {
      render(<Button icon={Plus} iconRight={ArrowRight}>Both Icons</Button>)
      const button = screen.getByRole('button')
      const svgs = button.querySelectorAll('svg')
      expect(svgs.length).toBe(2)
    })

    it('hides right icon when loading', () => {
      render(<Button iconRight={ArrowRight} isLoading>Loading</Button>)
      const button = screen.getByRole('button')
      const svgs = button.querySelectorAll('svg')
      // Only loading spinner should be visible
      expect(svgs.length).toBe(1)
    })
  })

  describe('Disabled State', () => {
    it('is not disabled by default', () => {
      render(<Button>Enabled</Button>)
      expect(screen.getByRole('button')).not.toBeDisabled()
    })

    it('is disabled when disabled prop is true', () => {
      render(<Button disabled>Disabled</Button>)
      expect(screen.getByRole('button')).toBeDisabled()
    })

    it('has disabled styling when disabled', () => {
      render(<Button disabled>Disabled</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('opacity-50', 'cursor-not-allowed')
    })

    it('does not call onClick when disabled', () => {
      const handleClick = vi.fn()
      render(<Button disabled onClick={handleClick}>Disabled</Button>)

      fireEvent.click(screen.getByRole('button'))
      expect(handleClick).not.toHaveBeenCalled()
    })
  })

  describe('Loading State', () => {
    it('is not loading by default', () => {
      render(<Button>Not Loading</Button>)
      const button = screen.getByRole('button')
      expect(button.querySelector('.animate-spin')).not.toBeInTheDocument()
    })

    it('shows loading spinner when isLoading is true', () => {
      render(<Button isLoading>Loading</Button>)
      const button = screen.getByRole('button')
      expect(button.querySelector('.animate-spin')).toBeInTheDocument()
    })

    it('is disabled when loading', () => {
      render(<Button isLoading>Loading</Button>)
      expect(screen.getByRole('button')).toBeDisabled()
    })

    it('does not call onClick when loading', () => {
      const handleClick = vi.fn()
      render(<Button isLoading onClick={handleClick}>Loading</Button>)

      fireEvent.click(screen.getByRole('button'))
      expect(handleClick).not.toHaveBeenCalled()
    })

    it('replaces left icon with loading spinner', () => {
      render(<Button icon={Plus} isLoading>Loading</Button>)
      const button = screen.getByRole('button')
      const spinners = button.querySelectorAll('.animate-spin')
      expect(spinners.length).toBe(1)
    })
  })

  describe('Click Handler', () => {
    it('calls onClick when clicked', () => {
      const handleClick = vi.fn()
      render(<Button onClick={handleClick}>Click Me</Button>)

      fireEvent.click(screen.getByRole('button'))
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('receives event object in onClick', () => {
      const handleClick = vi.fn()
      render(<Button onClick={handleClick}>Click Me</Button>)

      fireEvent.click(screen.getByRole('button'))
      expect(handleClick).toHaveBeenCalledWith(expect.any(Object))
    })
  })

  describe('Button Type', () => {
    it('has type="button" by default', () => {
      render(<Button>Default Type</Button>)
      expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
    })

    it('can have type="submit"', () => {
      render(<Button type="submit">Submit</Button>)
      expect(screen.getByRole('button')).toHaveAttribute('type', 'submit')
    })

    it('can have type="reset"', () => {
      render(<Button type="reset">Reset</Button>)
      expect(screen.getByRole('button')).toHaveAttribute('type', 'reset')
    })
  })

  describe('Custom Component (as prop)', () => {
    it('renders as a custom element', () => {
      render(<Button as="a" href="/test">Link Button</Button>)
      const link = screen.getByText('Link Button')
      expect(link.tagName).toBe('A')
      expect(link).toHaveAttribute('href', '/test')
    })

    it('does not add type attribute to non-button elements', () => {
      render(<Button as="a" href="/test">Link Button</Button>)
      const link = screen.getByText('Link Button')
      expect(link).not.toHaveAttribute('type')
    })

    it('does not add disabled attribute to non-button elements', () => {
      render(<Button as="a" disabled href="/test">Link Button</Button>)
      const link = screen.getByText('Link Button')
      expect(link).not.toHaveAttribute('disabled')
    })

    it('adds aria-disabled to non-button elements when disabled', () => {
      render(<Button as="a" disabled href="/test">Link Button</Button>)
      const link = screen.getByText('Link Button')
      expect(link).toHaveAttribute('aria-disabled', 'true')
    })
  })

  describe('Custom Styling', () => {
    it('applies custom className', () => {
      render(<Button className="custom-class">Custom</Button>)
      expect(screen.getByRole('button')).toHaveClass('custom-class')
    })

    it('preserves default classes with custom className', () => {
      render(<Button className="custom-class">Custom</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('inline-flex', 'items-center', 'justify-center')
    })
  })

  describe('Additional Props', () => {
    it('passes through additional props', () => {
      render(<Button data-testid="custom-button">Props</Button>)
      expect(screen.getByTestId('custom-button')).toBeInTheDocument()
    })

    it('passes through aria attributes', () => {
      render(<Button aria-label="Custom label">Aria</Button>)
      expect(screen.getByLabelText('Custom label')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('is focusable by default', () => {
      render(<Button>Focusable</Button>)
      const button = screen.getByRole('button')
      button.focus()
      expect(document.activeElement).toBe(button)
    })

    it('has focus-visible styles', () => {
      render(<Button>Focus</Button>)
      const button = screen.getByRole('button')
      expect(button.className).toContain('focus-visible:ring')
    })
  })

  describe('Edge Cases', () => {
    it('handles empty children', () => {
      const { container } = render(<Button></Button>)
      expect(container.querySelector('button')).toBeInTheDocument()
    })

    it('handles complex children', () => {
      render(
        <Button>
          <span data-testid="inner">Complex</span> Content
        </Button>
      )
      expect(screen.getByTestId('inner')).toBeInTheDocument()
    })

    it('handles undefined onClick', () => {
      render(<Button>No Handler</Button>)
      expect(() => {
        fireEvent.click(screen.getByRole('button'))
      }).not.toThrow()
    })
  })
})
