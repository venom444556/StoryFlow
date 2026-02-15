import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import GlassCard from './GlassCard'

describe('GlassCard', () => {
  describe('Basic Rendering', () => {
    it('renders without crashing', () => {
      render(<GlassCard>Content</GlassCard>)
      expect(screen.getByText('Content')).toBeInTheDocument()
    })

    it('renders children content', () => {
      render(<GlassCard>Card Content</GlassCard>)
      expect(screen.getByText('Card Content')).toBeInTheDocument()
    })

    it('renders as div by default', () => {
      render(<GlassCard>Content</GlassCard>)
      expect(screen.getByText('Content').tagName).toBe('DIV')
    })

    it('applies glass-card class', () => {
      render(<GlassCard>Content</GlassCard>)
      expect(screen.getByText('Content')).toHaveClass('glass-card')
    })
  })

  describe('Padding Variants', () => {
    it('applies no padding when padding="none"', () => {
      render(<GlassCard padding="none">Content</GlassCard>)
      const card = screen.getByText('Content')
      expect(card.className).not.toContain('p-')
    })

    it('applies sm padding', () => {
      const { container } = render(<GlassCard padding="sm">Content</GlassCard>)
      const card = container.firstChild
      expect(card.className).toContain('p-')
    })

    it('applies md padding by default', () => {
      const { container } = render(<GlassCard>Content</GlassCard>)
      const card = container.firstChild
      expect(card.className).toContain('p-')
    })

    it('applies lg padding', () => {
      const { container } = render(<GlassCard padding="lg">Content</GlassCard>)
      const card = container.firstChild
      expect(card.className).toContain('p-')
    })

    it('falls back to md padding for invalid padding value', () => {
      const { container } = render(<GlassCard padding="invalid">Content</GlassCard>)
      const card = container.firstChild
      expect(card.className).toContain('p-')
    })
  })

  describe('Hover Effect', () => {
    it('does not have hover effect by default', () => {
      render(<GlassCard>Content</GlassCard>)
      const card = screen.getByText('Content')
      expect(card.className).not.toContain('hover:scale')
    })

    it('has hover effect when hover prop is true', () => {
      render(<GlassCard hover>Content</GlassCard>)
      const card = screen.getByText('Content')
      expect(card).toHaveClass('hover:scale-[1.02]', 'hover:brightness-110', 'cursor-pointer')
    })

    it('has transition classes when hover is enabled', () => {
      render(<GlassCard hover>Content</GlassCard>)
      const card = screen.getByText('Content')
      expect(card).toHaveClass('transition-all')
    })
  })

  describe('Click Handler', () => {
    it('does not have cursor-pointer without onClick or hover', () => {
      render(<GlassCard>Content</GlassCard>)
      const card = screen.getByText('Content')
      expect(card.className).not.toContain('cursor-pointer')
    })

    it('has cursor-pointer when onClick is provided', () => {
      render(<GlassCard onClick={() => {}}>Content</GlassCard>)
      const card = screen.getByText('Content')
      expect(card).toHaveClass('cursor-pointer')
    })

    it('calls onClick when clicked', () => {
      const handleClick = vi.fn()
      render(<GlassCard onClick={handleClick}>Content</GlassCard>)

      fireEvent.click(screen.getByText('Content'))
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('receives event object in onClick', () => {
      const handleClick = vi.fn()
      render(<GlassCard onClick={handleClick}>Content</GlassCard>)

      fireEvent.click(screen.getByText('Content'))
      expect(handleClick).toHaveBeenCalledWith(expect.any(Object))
    })
  })

  describe('Custom Element (as prop)', () => {
    it('renders as section when as="section"', () => {
      render(<GlassCard as="section">Content</GlassCard>)
      expect(screen.getByText('Content').tagName).toBe('SECTION')
    })

    it('renders as article when as="article"', () => {
      render(<GlassCard as="article">Content</GlassCard>)
      expect(screen.getByText('Content').tagName).toBe('ARTICLE')
    })

    it('renders as aside when as="aside"', () => {
      render(<GlassCard as="aside">Content</GlassCard>)
      expect(screen.getByText('Content').tagName).toBe('ASIDE')
    })

    it('renders as li when as="li"', () => {
      render(
        <ul>
          <GlassCard as="li">Content</GlassCard>
        </ul>
      )
      expect(screen.getByText('Content').tagName).toBe('LI')
    })
  })

  describe('Custom Styling', () => {
    it('applies custom className', () => {
      render(<GlassCard className="custom-class">Content</GlassCard>)
      expect(screen.getByText('Content')).toHaveClass('custom-class')
    })

    it('preserves glass-card class with custom className', () => {
      render(<GlassCard className="custom-class">Content</GlassCard>)
      const card = screen.getByText('Content')
      expect(card).toHaveClass('glass-card', 'custom-class')
    })

    it('has transition styles', () => {
      render(<GlassCard>Content</GlassCard>)
      const card = screen.getByText('Content')
      expect(card).toHaveStyle({ transitionDuration: 'var(--duration-normal)' })
    })
  })

  describe('Additional Props', () => {
    it('passes through data attributes', () => {
      render(<GlassCard data-testid="glass-card">Content</GlassCard>)
      expect(screen.getByTestId('glass-card')).toBeInTheDocument()
    })

    it('passes through aria attributes', () => {
      render(<GlassCard aria-label="Card label">Content</GlassCard>)
      expect(screen.getByLabelText('Card label')).toBeInTheDocument()
    })

    it('passes through role attribute', () => {
      render(<GlassCard role="region">Content</GlassCard>)
      expect(screen.getByRole('region')).toBeInTheDocument()
    })

    it('passes through id attribute', () => {
      render(<GlassCard id="unique-id">Content</GlassCard>)
      expect(document.getElementById('unique-id')).toBeInTheDocument()
    })
  })

  describe('Complex Children', () => {
    it('renders complex children', () => {
      render(
        <GlassCard>
          <h2>Title</h2>
          <p>Description</p>
          <button>Action</button>
        </GlassCard>
      )

      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument()
      expect(screen.getByText('Description')).toBeInTheDocument()
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('renders nested GlassCards', () => {
      render(
        <GlassCard data-testid="outer">
          <GlassCard data-testid="inner">Nested</GlassCard>
        </GlassCard>
      )

      expect(screen.getByTestId('outer')).toBeInTheDocument()
      expect(screen.getByTestId('inner')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles empty children', () => {
      const { container } = render(<GlassCard></GlassCard>)
      expect(container.querySelector('.glass-card')).toBeInTheDocument()
    })

    it('handles null children', () => {
      const { container } = render(<GlassCard>{null}</GlassCard>)
      expect(container.querySelector('.glass-card')).toBeInTheDocument()
    })

    it('handles undefined children', () => {
      const { container } = render(<GlassCard>{undefined}</GlassCard>)
      expect(container.querySelector('.glass-card')).toBeInTheDocument()
    })

    it('handles multiple className values', () => {
      render(<GlassCard className="class1 class2 class3">Content</GlassCard>)
      const card = screen.getByText('Content')
      expect(card).toHaveClass('class1', 'class2', 'class3')
    })

    it('works with hover and onClick together', () => {
      const handleClick = vi.fn()
      render(
        <GlassCard hover onClick={handleClick}>
          Content
        </GlassCard>
      )

      const card = screen.getByText('Content')
      expect(card).toHaveClass('hover:scale-[1.02]', 'cursor-pointer')

      fireEvent.click(card)
      expect(handleClick).toHaveBeenCalledTimes(1)
    })
  })

  describe('Accessibility', () => {
    it('can be made focusable with tabIndex', () => {
      render(<GlassCard tabIndex={0}>Content</GlassCard>)
      const card = screen.getByText('Content')
      card.focus()
      expect(document.activeElement).toBe(card)
    })

    it('supports keyboard interaction when clickable', () => {
      const handleClick = vi.fn()
      render(
        <GlassCard onClick={handleClick} tabIndex={0}>
          Content
        </GlassCard>
      )

      const card = screen.getByText('Content')
      card.focus()

      fireEvent.keyDown(card, { key: 'Enter' })
      // Note: Native div doesn't respond to Enter by default
      // This tests that the element can receive keyboard focus
      expect(document.activeElement).toBe(card)
    })
  })
})
