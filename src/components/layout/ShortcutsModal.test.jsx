import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ShortcutsModal from './ShortcutsModal'

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}))

describe('ShortcutsModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic rendering', () => {
    it('renders without crashing when open', () => {
      render(<ShortcutsModal {...defaultProps} />)
      expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument()
    })

    it('does not render when isOpen is false', () => {
      render(<ShortcutsModal isOpen={false} onClose={vi.fn()} />)
      expect(screen.queryByText('Keyboard Shortcuts')).not.toBeInTheDocument()
    })
  })

  describe('Sections', () => {
    it('renders Navigation section', () => {
      render(<ShortcutsModal {...defaultProps} />)
      expect(screen.getByText('Navigation')).toBeInTheDocument()
    })

    it('renders General section', () => {
      render(<ShortcutsModal {...defaultProps} />)
      expect(screen.getByText('General')).toBeInTheDocument()
    })
  })

  describe('Navigation shortcuts', () => {
    it('shows Overview tab shortcut', () => {
      render(<ShortcutsModal {...defaultProps} />)
      expect(screen.getByText('Overview tab')).toBeInTheDocument()
    })

    it('shows Architecture tab shortcut', () => {
      render(<ShortcutsModal {...defaultProps} />)
      expect(screen.getByText('Architecture tab')).toBeInTheDocument()
    })

    it('shows Workflow tab shortcut', () => {
      render(<ShortcutsModal {...defaultProps} />)
      expect(screen.getByText('Workflow tab')).toBeInTheDocument()
    })

    it('shows Board tab shortcut', () => {
      render(<ShortcutsModal {...defaultProps} />)
      expect(screen.getByText('Board tab')).toBeInTheDocument()
    })

    it('shows Wiki tab shortcut', () => {
      render(<ShortcutsModal {...defaultProps} />)
      expect(screen.getByText('Wiki tab')).toBeInTheDocument()
    })

    it('shows Timeline tab shortcut', () => {
      render(<ShortcutsModal {...defaultProps} />)
      expect(screen.getByText('Timeline tab')).toBeInTheDocument()
    })

    it('shows Decisions tab shortcut', () => {
      render(<ShortcutsModal {...defaultProps} />)
      expect(screen.getByText('Decisions tab')).toBeInTheDocument()
    })
  })

  describe('General shortcuts', () => {
    it('shows search/command palette shortcut', () => {
      render(<ShortcutsModal {...defaultProps} />)
      expect(screen.getByText('Search / command palette')).toBeInTheDocument()
    })

    it('shows keyboard shortcuts help shortcut', () => {
      render(<ShortcutsModal {...defaultProps} />)
      expect(screen.getByText('Show keyboard shortcuts')).toBeInTheDocument()
    })

    it('shows close modal shortcut', () => {
      render(<ShortcutsModal {...defaultProps} />)
      expect(screen.getByText('Close modal / panel')).toBeInTheDocument()
    })
  })

  describe('Keyboard hint elements (kbd)', () => {
    it('renders Alt or Option key for navigation shortcuts', () => {
      render(<ShortcutsModal {...defaultProps} />)
      // Check for Alt (Windows) or Option symbol (Mac)
      const kbdElements = screen.getAllByRole('presentation', { hidden: true })
      // Kbd elements display the key combinations
      const textContent = document.body.textContent
      expect(textContent).toMatch(/Alt|⌥/)
    })

    it('renders number keys for tab navigation', () => {
      render(<ShortcutsModal {...defaultProps} />)
      // Numbers 1-7 should be present for tab shortcuts
      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText('2')).toBeInTheDocument()
      expect(screen.getByText('3')).toBeInTheDocument()
      expect(screen.getByText('4')).toBeInTheDocument()
      expect(screen.getByText('5')).toBeInTheDocument()
      expect(screen.getByText('6')).toBeInTheDocument()
      expect(screen.getByText('7')).toBeInTheDocument()
    })

    it('renders / key for search shortcut', () => {
      render(<ShortcutsModal {...defaultProps} />)
      expect(screen.getByText('/')).toBeInTheDocument()
    })

    it('renders ? key for help shortcut', () => {
      render(<ShortcutsModal {...defaultProps} />)
      expect(screen.getByText('?')).toBeInTheDocument()
    })

    it('renders Esc key for close shortcut', () => {
      render(<ShortcutsModal {...defaultProps} />)
      expect(screen.getByText('Esc')).toBeInTheDocument()
    })
  })

  describe('Close functionality', () => {
    it('calls onClose when modal close is triggered', () => {
      const onClose = vi.fn()
      render(<ShortcutsModal isOpen={true} onClose={onClose} />)

      // Find close button (Modal component has a close button)
      const closeButton = screen.getByRole('button', { name: /close/i })
      fireEvent.click(closeButton)

      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('Modal props', () => {
    it('renders with correct title', () => {
      render(<ShortcutsModal {...defaultProps} />)
      expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument()
    })

    it('uses small size modal', () => {
      render(<ShortcutsModal {...defaultProps} />)
      // The modal should have max-w-sm class for small size
      const modalContent = document.querySelector('.max-w-sm')
      expect(modalContent).toBeInTheDocument()
    })
  })

  describe('Keyboard key styling', () => {
    it('renders kbd elements with proper styling', () => {
      render(<ShortcutsModal {...defaultProps} />)
      const kbdElements = document.querySelectorAll('kbd')
      expect(kbdElements.length).toBeGreaterThan(0)

      // Check first kbd has expected classes
      const firstKbd = kbdElements[0]
      expect(firstKbd).toHaveClass('inline-flex')
      expect(firstKbd).toHaveClass('rounded')
    })
  })

  describe('Platform detection', () => {
    it('renders keyboard shortcuts based on platform', () => {
      render(<ShortcutsModal {...defaultProps} />)
      // The component should detect Mac vs Windows and show appropriate modifier keys
      // This is determined by navigator.userAgent which defaults to non-Mac in test env
      const pageContent = document.body.textContent
      // Should have Ctrl or Cmd
      expect(pageContent).toMatch(/Ctrl|⌘/)
    })
  })

  describe('Accessibility', () => {
    it('shortcut rows are focusable on hover', () => {
      render(<ShortcutsModal {...defaultProps} />)
      const shortcutRows = document.querySelectorAll('.hover\\:bg-white\\/5')
      expect(shortcutRows.length).toBeGreaterThan(0)
    })
  })

  describe('Edge cases', () => {
    it('handles rapid open/close without errors', () => {
      const onClose = vi.fn()
      const { rerender } = render(<ShortcutsModal isOpen={true} onClose={onClose} />)

      rerender(<ShortcutsModal isOpen={false} onClose={onClose} />)
      rerender(<ShortcutsModal isOpen={true} onClose={onClose} />)
      rerender(<ShortcutsModal isOpen={false} onClose={onClose} />)

      // Should not throw and should not render when closed
      expect(screen.queryByText('Keyboard Shortcuts')).not.toBeInTheDocument()
    })
  })
})
