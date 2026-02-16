import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ErrorBoundary from './ErrorBoundary'

// Component that throws an error for testing
function ThrowError({ shouldThrow = false }) {
  if (shouldThrow) {
    throw new Error('Test error message')
  }
  return <div>Child content rendered successfully</div>
}

describe('ErrorBoundary', () => {
  // Suppress console.error for expected errors during tests
  let originalConsoleError

  beforeEach(() => {
    originalConsoleError = console.error
    console.error = vi.fn()
  })

  afterEach(() => {
    console.error = originalConsoleError
  })

  describe('Normal rendering (no errors)', () => {
    it('renders children when there is no error', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      )
      expect(screen.getByText('Child content rendered successfully')).toBeInTheDocument()
    })

    it('does not show error UI when children render successfully', () => {
      render(
        <ErrorBoundary>
          <div>Valid content</div>
        </ErrorBoundary>
      )
      expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument()
    })
  })

  describe('Error state', () => {
    it('displays error UI when a child throws', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )
      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    })

    it('shows the error message', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )
      expect(screen.getByText(/Test error message/)).toBeInTheDocument()
    })

    it('shows description text', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )
      expect(screen.getByText(/An unexpected error occurred/i)).toBeInTheDocument()
    })

    it('shows Try Again button', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )
      expect(screen.getByRole('button', { name: /Try Again/i })).toBeInTheDocument()
    })

    it('shows Go to Dashboard button', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )
      expect(screen.getByRole('button', { name: /Go to Dashboard/i })).toBeInTheDocument()
    })

    it('logs error to console', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )
      expect(console.error).toHaveBeenCalledWith(
        'ErrorBoundary caught an error:',
        expect.any(Error),
        expect.any(Object)
      )
    })
  })

  describe('Try Again button', () => {
    it('resets error state when clicked', () => {
      // Use a mutable flag so the child stops throwing before handleReset
      // re-renders children. handleReset sets hasError=false which immediately
      // re-renders children — if they still throw, the boundary re-catches.
      let shouldThrow = true
      function ConditionalThrow() {
        if (shouldThrow) {
          throw new Error('Test error message')
        }
        return <div>Child content rendered successfully</div>
      }

      render(
        <ErrorBoundary>
          <ConditionalThrow />
        </ErrorBoundary>
      )

      // Error UI should be shown
      expect(screen.getByText('Something went wrong')).toBeInTheDocument()

      // Stop throwing before clicking Try Again
      shouldThrow = false

      // Click Try Again — handleReset clears error state, re-renders children
      fireEvent.click(screen.getByRole('button', { name: /Try Again/i }))

      // Should now show children
      expect(screen.getByText('Child content rendered successfully')).toBeInTheDocument()
    })
  })

  describe('Go to Dashboard button', () => {
    it('navigates to home when clicked', () => {
      // Mock window.location.href
      const originalLocation = window.location
      delete window.location
      window.location = { href: '', reload: vi.fn() }

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      fireEvent.click(screen.getByRole('button', { name: /Go to Dashboard/i }))

      expect(window.location.href).toBe('/')

      // Restore
      window.location = originalLocation
    })
  })

  describe('Technical Details toggle', () => {
    it('shows Technical Details button when errorInfo is present', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )
      expect(screen.getByRole('button', { name: /Technical Details/i })).toBeInTheDocument()
    })

    it('toggles technical details on click', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      const detailsButton = screen.getByRole('button', { name: /Technical Details/i })

      // Details should be hidden initially
      const preElement = screen.queryByRole('pre') || document.querySelector('pre')
      expect(preElement).not.toBeInTheDocument()

      // Click to show details
      fireEvent.click(detailsButton)

      // Now pre element should be visible
      const shownPre = document.querySelector('pre')
      expect(shownPre).toBeInTheDocument()

      // Click to hide details
      fireEvent.click(detailsButton)

      // Pre should be hidden again
      expect(document.querySelector('pre')).not.toBeInTheDocument()
    })
  })

  describe('Reload functionality', () => {
    it('has a handleReload method that reloads the page', () => {
      // Replace window.location entirely to mock reload (jsdom marks reload as non-configurable)
      const originalLocation = window.location
      delete window.location
      window.location = { ...originalLocation, reload: vi.fn() }

      // The handleReload is an instance method, verify the component structure supports it
      const errorBoundary = new ErrorBoundary({})
      errorBoundary.handleReload()

      expect(window.location.reload).toHaveBeenCalled()

      // Restore
      window.location = originalLocation
    })
  })

  describe('Static getDerivedStateFromError', () => {
    it('returns hasError true with error object', () => {
      const error = new Error('Test error')
      const result = ErrorBoundary.getDerivedStateFromError(error)

      expect(result).toEqual({
        hasError: true,
        error: error,
      })
    })
  })

  describe('Edge cases', () => {
    it('handles error without message gracefully', () => {
      function ThrowEmptyError() {
        throw new Error()
      }

      render(
        <ErrorBoundary>
          <ThrowEmptyError />
        </ErrorBoundary>
      )

      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    })

    it('handles non-Error throw', () => {
      function ThrowString() {
        throw 'String error'
      }

      render(
        <ErrorBoundary>
          <ThrowString />
        </ErrorBoundary>
      )

      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    })

    it('renders multiple children correctly when no error', () => {
      render(
        <ErrorBoundary>
          <div>Child 1</div>
          <div>Child 2</div>
          <div>Child 3</div>
        </ErrorBoundary>
      )

      expect(screen.getByText('Child 1')).toBeInTheDocument()
      expect(screen.getByText('Child 2')).toBeInTheDocument()
      expect(screen.getByText('Child 3')).toBeInTheDocument()
    })
  })
})
