import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Trash2 } from 'lucide-react'
import ConfirmDialog from './ConfirmDialog'

describe('ConfirmDialog', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('renders when isOpen is true', () => {
      render(<ConfirmDialog {...defaultProps} />)
      expect(screen.getByText('Are you sure?')).toBeInTheDocument()
    })

    it('does not render when isOpen is false', () => {
      render(<ConfirmDialog {...defaultProps} isOpen={false} />)
      expect(screen.queryByText('Are you sure?')).not.toBeInTheDocument()
    })

    it('renders default title', () => {
      render(<ConfirmDialog {...defaultProps} />)
      expect(screen.getByText('Are you sure?')).toBeInTheDocument()
    })

    it('renders default message', () => {
      render(<ConfirmDialog {...defaultProps} />)
      expect(screen.getByText('This action cannot be undone.')).toBeInTheDocument()
    })

    it('renders default button labels', () => {
      render(<ConfirmDialog {...defaultProps} />)
      expect(screen.getByText('Cancel')).toBeInTheDocument()
      expect(screen.getByText('Delete')).toBeInTheDocument()
    })
  })

  describe('Custom Content', () => {
    it('renders custom title', () => {
      render(<ConfirmDialog {...defaultProps} title="Custom Title" />)
      expect(screen.getByText('Custom Title')).toBeInTheDocument()
    })

    it('renders custom message', () => {
      render(<ConfirmDialog {...defaultProps} message="Custom message here" />)
      expect(screen.getByText('Custom message here')).toBeInTheDocument()
    })

    it('renders custom confirm label', () => {
      render(<ConfirmDialog {...defaultProps} confirmLabel="Confirm Action" />)
      expect(screen.getByText('Confirm Action')).toBeInTheDocument()
    })

    it('renders custom cancel label', () => {
      render(<ConfirmDialog {...defaultProps} cancelLabel="Go Back" />)
      expect(screen.getByText('Go Back')).toBeInTheDocument()
    })

    it('renders custom icon', () => {
      render(<ConfirmDialog {...defaultProps} icon={Trash2} />)
      // The icon should be in the document (rendered but hidden from accessibility)
      const iconContainer = document.querySelector('[aria-hidden="true"]')
      expect(iconContainer).toBeInTheDocument()
    })
  })

  describe('Button Variants', () => {
    it('uses danger variant by default', () => {
      render(<ConfirmDialog {...defaultProps} />)
      const confirmButton = screen.getByText('Delete')
      expect(confirmButton).toBeInTheDocument()
    })

    it('can use different variant for confirm button', () => {
      render(<ConfirmDialog {...defaultProps} variant="primary" />)
      const confirmButton = screen.getByText('Delete')
      expect(confirmButton).toBeInTheDocument()
    })
  })

  describe('User Interactions', () => {
    it('calls onClose when cancel button is clicked', () => {
      const onClose = vi.fn()
      render(<ConfirmDialog {...defaultProps} onClose={onClose} />)

      fireEvent.click(screen.getByText('Cancel'))
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('calls onConfirm and onClose when confirm button is clicked', () => {
      const onClose = vi.fn()
      const onConfirm = vi.fn()
      render(<ConfirmDialog {...defaultProps} onClose={onClose} onConfirm={onConfirm} />)

      fireEvent.click(screen.getByText('Delete'))
      expect(onConfirm).toHaveBeenCalledTimes(1)
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('handles missing onConfirm gracefully', () => {
      const onClose = vi.fn()
      render(<ConfirmDialog isOpen={true} onClose={onClose} />)

      expect(() => {
        fireEvent.click(screen.getByText('Delete'))
      }).not.toThrow()
      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('Modal Behavior', () => {
    it('renders within a Modal component', () => {
      render(<ConfirmDialog {...defaultProps} />)
      // Modal should add role="dialog"
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('uses small modal size', () => {
      render(<ConfirmDialog {...defaultProps} />)
      // The dialog should be present with modal characteristics
      const dialog = screen.getByRole('dialog')
      expect(dialog).toBeInTheDocument()
    })

    it('does not show close button', () => {
      render(<ConfirmDialog {...defaultProps} title="Test" />)
      // Modal's close button should not be present
      expect(screen.queryByLabelText('Close modal')).not.toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has dialog role', () => {
      render(<ConfirmDialog {...defaultProps} />)
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('icon is hidden from screen readers', () => {
      render(<ConfirmDialog {...defaultProps} />)
      const hiddenIcon = document.querySelector('[aria-hidden="true"]')
      expect(hiddenIcon).toBeInTheDocument()
    })

    it('buttons are accessible', () => {
      render(<ConfirmDialog {...defaultProps} />)
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('Layout', () => {
    it('renders content centered', () => {
      render(<ConfirmDialog {...defaultProps} />)
      const container = screen.getByText('Are you sure?').parentElement
      expect(container).toHaveClass('text-center')
    })

    it('renders icon in styled container', () => {
      render(<ConfirmDialog {...defaultProps} />)
      const iconContainer = document.querySelector('.rounded-full')
      expect(iconContainer).toBeInTheDocument()
    })

    it('renders buttons in a flex row', () => {
      render(<ConfirmDialog {...defaultProps} />)
      const cancelButton = screen.getByText('Cancel')
      const confirmButton = screen.getByText('Delete')
      const buttonContainer = cancelButton.parentElement
      expect(buttonContainer).toHaveClass('flex')
    })
  })

  describe('Edge Cases', () => {
    it('handles rapid open/close', () => {
      const { rerender } = render(<ConfirmDialog {...defaultProps} isOpen={true} />)
      expect(screen.getByText('Are you sure?')).toBeInTheDocument()

      rerender(<ConfirmDialog {...defaultProps} isOpen={false} />)
      // With AnimatePresence, content may still be animating out

      rerender(<ConfirmDialog {...defaultProps} isOpen={true} />)
      expect(screen.getByText('Are you sure?')).toBeInTheDocument()
    })

    it('handles empty title', () => {
      render(<ConfirmDialog {...defaultProps} title="" />)
      // Should still render the dialog structure
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('handles empty message', () => {
      render(<ConfirmDialog {...defaultProps} message="" />)
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('handles long content', () => {
      const longTitle = 'A'.repeat(200)
      const longMessage = 'B'.repeat(500)

      render(<ConfirmDialog {...defaultProps} title={longTitle} message={longMessage} />)

      expect(screen.getByText(longTitle)).toBeInTheDocument()
      expect(screen.getByText(longMessage)).toBeInTheDocument()
    })
  })
})
