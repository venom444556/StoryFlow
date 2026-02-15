import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import LoadingState from './LoadingState'

describe('LoadingState', () => {
  describe('Basic Rendering', () => {
    it('renders without crashing', () => {
      render(<LoadingState />)
      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('renders default message', () => {
      render(<LoadingState />)
      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('renders spinner', () => {
      const { container } = render(<LoadingState />)
      expect(container.querySelector('.animate-spin')).toBeInTheDocument()
    })
  })

  describe('Custom Message', () => {
    it('renders custom message', () => {
      render(<LoadingState message="Please wait..." />)
      expect(screen.getByText('Please wait...')).toBeInTheDocument()
    })

    it('does not render message when empty string', () => {
      render(<LoadingState message="" />)
      expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })

    it('does not render message when null', () => {
      render(<LoadingState message={null} />)
      // Spinner should still be visible
      const spinner = document.querySelector('.animate-spin')
      expect(spinner).toBeInTheDocument()
    })
  })

  describe('Size Variants', () => {
    it('renders with sm size', () => {
      render(<LoadingState size="sm" />)
      const message = screen.getByText('Loading...')
      expect(message.className).toContain('xs')
    })

    it('renders with md size (default)', () => {
      render(<LoadingState size="md" />)
      const message = screen.getByText('Loading...')
      expect(message.className).toContain('sm')
    })

    it('renders with lg size', () => {
      render(<LoadingState size="lg" />)
      const message = screen.getByText('Loading...')
      expect(message.className).toContain('base')
    })

    it('uses md size for invalid size value', () => {
      render(<LoadingState size="invalid" />)
      const message = screen.getByText('Loading...')
      expect(message.className).toContain('sm')
    })
  })

  describe('Full Screen Mode', () => {
    it('is not full screen by default', () => {
      const { container } = render(<LoadingState />)
      expect(container.querySelector('.fixed')).not.toBeInTheDocument()
    })

    it('is full screen when fullScreen prop is true', () => {
      const { container } = render(<LoadingState fullScreen />)
      expect(container.querySelector('.fixed.inset-0')).toBeInTheDocument()
    })

    it('full screen has backdrop', () => {
      const { container } = render(<LoadingState fullScreen />)
      expect(container.querySelector('.backdrop-blur-sm')).toBeInTheDocument()
    })

    it('full screen centers content', () => {
      const { container } = render(<LoadingState fullScreen />)
      const overlay = container.querySelector('.fixed')
      expect(overlay).toHaveClass('flex', 'items-center', 'justify-center')
    })
  })

  describe('Styling', () => {
    it('applies custom className', () => {
      const { container } = render(<LoadingState className="custom-class" />)
      expect(container.querySelector('.custom-class')).toBeInTheDocument()
    })

    it('has centered layout', () => {
      const { container } = render(<LoadingState />)
      const wrapper = container.firstChild
      expect(wrapper).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center')
    })
  })

  describe('Spinner', () => {
    it('spinner is animated', () => {
      const { container } = render(<LoadingState />)
      expect(container.querySelector('.animate-spin')).toBeInTheDocument()
    })

    it('spinner is hidden from screen readers', () => {
      render(<LoadingState />)
      const spinner = document.querySelector('[aria-hidden="true"]')
      expect(spinner).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('message has role="status"', () => {
      render(<LoadingState />)
      expect(screen.getByRole('status')).toBeInTheDocument()
    })

    it('message has aria-live="polite"', () => {
      render(<LoadingState />)
      const message = screen.getByRole('status')
      expect(message).toHaveAttribute('aria-live', 'polite')
    })

    it('spinner is decorative and hidden from screen readers', () => {
      render(<LoadingState />)
      const spinner = document.querySelector('.animate-spin')
      expect(spinner.parentElement).toHaveAttribute('aria-hidden', 'true')
    })
  })

  describe('Animation', () => {
    it('renders with motion container', () => {
      const { container } = render(<LoadingState />)
      // Framer motion adds the element
      expect(container.firstChild).toBeInTheDocument()
    })
  })

  describe('Combined Features', () => {
    it('renders all features together', () => {
      render(
        <LoadingState
          message="Loading data..."
          size="lg"
          className="custom-class"
        />
      )

      expect(screen.getByText('Loading data...')).toBeInTheDocument()
      expect(document.querySelector('.animate-spin')).toBeInTheDocument()
      expect(document.querySelector('.custom-class')).toBeInTheDocument()
    })

    it('fullScreen with custom message and size', () => {
      const { container } = render(
        <LoadingState
          message="Fetching..."
          size="sm"
          fullScreen
        />
      )

      expect(screen.getByText('Fetching...')).toBeInTheDocument()
      expect(container.querySelector('.fixed')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles undefined message', () => {
      render(<LoadingState message={undefined} />)
      // Should render spinner without message
      expect(document.querySelector('.animate-spin')).toBeInTheDocument()
    })

    it('handles long message', () => {
      const longMessage = 'Loading '.repeat(50)
      render(<LoadingState message={longMessage} />)
      expect(screen.getByText(longMessage)).toBeInTheDocument()
    })

    it('handles special characters in message', () => {
      render(<LoadingState message="Loading <data> & processing..." />)
      expect(screen.getByText('Loading <data> & processing...')).toBeInTheDocument()
    })

    it('multiple LoadingStates can coexist', () => {
      render(
        <>
          <LoadingState message="Loading 1" />
          <LoadingState message="Loading 2" />
        </>
      )

      expect(screen.getByText('Loading 1')).toBeInTheDocument()
      expect(screen.getByText('Loading 2')).toBeInTheDocument()
    })
  })
})
