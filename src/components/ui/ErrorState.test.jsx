import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AlertTriangle } from 'lucide-react'
import ErrorState from './ErrorState'

describe('ErrorState', () => {
  describe('Basic Rendering', () => {
    it('renders without crashing', () => {
      render(<ErrorState />)
      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    })

    it('renders default title', () => {
      render(<ErrorState />)
      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    })

    it('renders default message', () => {
      render(<ErrorState />)
      expect(screen.getByText('An unexpected error occurred. Please try again.')).toBeInTheDocument()
    })

    it('renders with default icon', () => {
      render(<ErrorState />)
      // Icon should be hidden from accessibility
      const icon = document.querySelector('[aria-hidden="true"]')
      expect(icon).toBeInTheDocument()
    })
  })

  describe('Custom Content', () => {
    it('renders custom title', () => {
      render(<ErrorState title="Custom Error Title" />)
      expect(screen.getByText('Custom Error Title')).toBeInTheDocument()
    })

    it('renders custom message', () => {
      render(<ErrorState message="Custom error message here" />)
      expect(screen.getByText('Custom error message here')).toBeInTheDocument()
    })

    it('renders custom icon', () => {
      render(<ErrorState icon={AlertTriangle} />)
      const icon = document.querySelector('[aria-hidden="true"]')
      expect(icon).toBeInTheDocument()
    })

    it('renders custom retry label', () => {
      render(<ErrorState onRetry={() => {}} retryLabel="Retry Now" />)
      expect(screen.getByText('Retry Now')).toBeInTheDocument()
    })
  })

  describe('Retry Button', () => {
    it('does not show retry button when onRetry is not provided', () => {
      render(<ErrorState />)
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('shows retry button when onRetry is provided', () => {
      render(<ErrorState onRetry={() => {}} />)
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
    })

    it('calls onRetry when retry button is clicked', () => {
      const handleRetry = vi.fn()
      render(<ErrorState onRetry={handleRetry} />)

      fireEvent.click(screen.getByRole('button', { name: /try again/i }))
      expect(handleRetry).toHaveBeenCalledTimes(1)
    })

    it('retry button has refresh icon', () => {
      render(<ErrorState onRetry={() => {}} />)
      const button = screen.getByRole('button')
      const svg = button.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('retry button uses secondary variant', () => {
      render(<ErrorState onRetry={() => {}} />)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('glass')
    })

    it('retry button uses sm size', () => {
      render(<ErrorState onRetry={() => {}} />)
      const button = screen.getByRole('button')
      expect(button.className).toContain('sm')
    })
  })

  describe('Styling', () => {
    it('applies custom className', () => {
      render(<ErrorState className="custom-class" />)
      // The motion.div should have the custom class
      const container = screen.getByText('Something went wrong').parentElement.parentElement
      expect(container).toHaveClass('custom-class')
    })

    it('has centered layout', () => {
      render(<ErrorState />)
      const container = screen.getByText('Something went wrong').parentElement.parentElement
      expect(container).toHaveClass('items-center', 'justify-center', 'text-center')
    })

    it('icon container has error styling', () => {
      render(<ErrorState />)
      const iconContainer = document.querySelector('.rounded-full')
      expect(iconContainer).toBeInTheDocument()
    })
  })

  describe('Animation', () => {
    it('renders with motion container', () => {
      const { container } = render(<ErrorState />)
      // Framer motion adds inline styles for animation
      const motionDiv = container.firstChild
      expect(motionDiv).toBeInTheDocument()
    })
  })

  describe('Icon Rendering', () => {
    it('icon has aria-hidden attribute', () => {
      render(<ErrorState />)
      const icon = document.querySelector('[aria-hidden="true"]')
      expect(icon).toBeInTheDocument()
    })

    it('icon is inside styled container', () => {
      render(<ErrorState />)
      const iconContainer = document.querySelector('.rounded-full.h-12.w-12')
      expect(iconContainer).toBeInTheDocument()
    })
  })

  describe('Typography', () => {
    it('title uses h3 element', () => {
      render(<ErrorState title="Error Title" />)
      const heading = screen.getByRole('heading', { level: 3 })
      expect(heading).toHaveTextContent('Error Title')
    })

    it('message is a paragraph element', () => {
      render(<ErrorState message="Error message" />)
      expect(screen.getByText('Error message').tagName).toBe('P')
    })
  })

  describe('Edge Cases', () => {
    it('handles empty title', () => {
      render(<ErrorState title="" />)
      // Should render without crashing
      expect(document.body).toBeInTheDocument()
    })

    it('handles empty message', () => {
      render(<ErrorState message="" />)
      // Should render without crashing
      expect(document.body).toBeInTheDocument()
    })

    it('handles long title', () => {
      const longTitle = 'A'.repeat(200)
      render(<ErrorState title={longTitle} />)
      expect(screen.getByText(longTitle)).toBeInTheDocument()
    })

    it('handles long message', () => {
      const longMessage = 'B'.repeat(500)
      render(<ErrorState message={longMessage} />)
      expect(screen.getByText(longMessage)).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper heading hierarchy', () => {
      render(<ErrorState title="Accessible Error" />)
      expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument()
    })

    it('retry button is keyboard accessible', () => {
      render(<ErrorState onRetry={() => {}} />)
      const button = screen.getByRole('button')
      button.focus()
      expect(document.activeElement).toBe(button)
    })

    it('icon is decorative and hidden from screen readers', () => {
      render(<ErrorState />)
      const icon = document.querySelector('[aria-hidden="true"]')
      expect(icon).toBeInTheDocument()
    })
  })

  describe('Full Feature Usage', () => {
    it('renders all features together', () => {
      const handleRetry = vi.fn()
      render(
        <ErrorState
          icon={AlertTriangle}
          title="Connection Failed"
          message="Unable to connect to the server"
          onRetry={handleRetry}
          retryLabel="Reconnect"
          className="custom-error"
        />
      )

      expect(screen.getByText('Connection Failed')).toBeInTheDocument()
      expect(screen.getByText('Unable to connect to the server')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Reconnect' })).toBeInTheDocument()
      expect(document.querySelector('[aria-hidden="true"]')).toBeInTheDocument()
    })

    it('retry button works with all features', () => {
      const handleRetry = vi.fn()
      render(
        <ErrorState
          title="Error"
          message="Something happened"
          onRetry={handleRetry}
          retryLabel="Try Again"
        />
      )

      fireEvent.click(screen.getByRole('button'))
      expect(handleRetry).toHaveBeenCalledTimes(1)
    })
  })
})
