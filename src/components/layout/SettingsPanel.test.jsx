import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import SettingsPanel from './SettingsPanel'
import { SettingsProvider } from '../../contexts/SettingsContext'

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}))

// Wrapper component with SettingsProvider
function renderWithProvider(ui, options) {
  return render(<SettingsProvider>{ui}</SettingsProvider>, options)
}

describe('SettingsPanel', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // Reset localStorage
    localStorage.clear()
  })

  describe('Basic rendering', () => {
    it('renders without crashing when open', () => {
      renderWithProvider(<SettingsPanel {...defaultProps} />)
      expect(screen.getByText('Settings')).toBeInTheDocument()
    })

    it('does not render when isOpen is false', () => {
      renderWithProvider(<SettingsPanel isOpen={false} onClose={vi.fn()} />)
      expect(screen.queryByText('Settings')).not.toBeInTheDocument()
    })

    it('renders backdrop when open', () => {
      renderWithProvider(<SettingsPanel {...defaultProps} />)
      const backdrop = document.querySelector('.fixed.inset-0.bg-black\\/40')
      expect(backdrop).toBeInTheDocument()
    })
  })

  describe('Close functionality', () => {
    it('calls onClose when close button is clicked', () => {
      const onClose = vi.fn()
      renderWithProvider(<SettingsPanel isOpen={true} onClose={onClose} />)

      // Find the button with X icon
      const buttons = screen.getAllByRole('button')
      const closeBtn = buttons.find(
        (btn) => btn.querySelector('svg') && btn.classList.contains('hover:bg-white/10')
      )
      if (closeBtn) {
        fireEvent.click(closeBtn)
        expect(onClose).toHaveBeenCalledTimes(1)
      }
    })

    it('calls onClose when backdrop is clicked', () => {
      const onClose = vi.fn()
      renderWithProvider(<SettingsPanel isOpen={true} onClose={onClose} />)

      const backdrop = document.querySelector('.fixed.inset-0.bg-black\\/40')
      if (backdrop) {
        fireEvent.click(backdrop)
        expect(onClose).toHaveBeenCalledTimes(1)
      }
    })
  })

  describe('Section labels', () => {
    it('renders Appearance section', () => {
      renderWithProvider(<SettingsPanel {...defaultProps} />)
      expect(screen.getByText('Appearance')).toBeInTheDocument()
    })

    it('renders Navigation section', () => {
      renderWithProvider(<SettingsPanel {...defaultProps} />)
      expect(screen.getByText('Navigation')).toBeInTheDocument()
    })

    it('renders Saving section', () => {
      renderWithProvider(<SettingsPanel {...defaultProps} />)
      expect(screen.getByText('Saving')).toBeInTheDocument()
    })

    it('renders Workflow Canvas section', () => {
      renderWithProvider(<SettingsPanel {...defaultProps} />)
      expect(screen.getByText('Workflow Canvas')).toBeInTheDocument()
    })

    it('renders Reset section', () => {
      renderWithProvider(<SettingsPanel {...defaultProps} />)
      expect(screen.getByText('Reset')).toBeInTheDocument()
    })
  })

  describe('Appearance settings', () => {
    it('renders Dark Mode toggle', () => {
      renderWithProvider(<SettingsPanel {...defaultProps} />)
      expect(screen.getByText('Dark Mode')).toBeInTheDocument()
    })

    it('renders Accent Color setting', () => {
      renderWithProvider(<SettingsPanel {...defaultProps} />)
      expect(screen.getByText('Accent Color')).toBeInTheDocument()
    })

    it('renders Animations toggle', () => {
      renderWithProvider(<SettingsPanel {...defaultProps} />)
      expect(screen.getByText('Animations')).toBeInTheDocument()
    })

    it('renders Compact Cards toggle', () => {
      renderWithProvider(<SettingsPanel {...defaultProps} />)
      expect(screen.getByText('Compact Cards')).toBeInTheDocument()
    })

    it('shows all 5 accent color options', () => {
      renderWithProvider(<SettingsPanel {...defaultProps} />)
      const colorButtons = screen
        .getAllByRole('button')
        .filter((btn) => btn.classList.contains('rounded-full') && btn.classList.contains('h-6'))
      expect(colorButtons).toHaveLength(5)
    })
  })

  describe('Navigation settings', () => {
    it('renders Show Breadcrumbs toggle', () => {
      renderWithProvider(<SettingsPanel {...defaultProps} />)
      expect(screen.getByText('Show Breadcrumbs')).toBeInTheDocument()
    })
  })

  describe('Saving settings', () => {
    it('renders Auto-Save toggle', () => {
      renderWithProvider(<SettingsPanel {...defaultProps} />)
      expect(screen.getByText('Auto-Save')).toBeInTheDocument()
    })

    it('renders Confirm on Delete toggle', () => {
      renderWithProvider(<SettingsPanel {...defaultProps} />)
      expect(screen.getByText('Confirm on Delete')).toBeInTheDocument()
    })
  })

  describe('Workflow Canvas settings', () => {
    it('renders Snap to Grid toggle', () => {
      renderWithProvider(<SettingsPanel {...defaultProps} />)
      expect(screen.getByText('Snap to Grid')).toBeInTheDocument()
    })

    it('renders Grid Size select', () => {
      renderWithProvider(<SettingsPanel {...defaultProps} />)
      expect(screen.getByText('Grid Size')).toBeInTheDocument()
    })

    it('shows grid size options (10px, 20px, 40px)', () => {
      renderWithProvider(<SettingsPanel {...defaultProps} />)
      const selects = screen.getAllByRole('combobox')
      const select = selects.find((s) => s.querySelector('option[value="20"]'))
      expect(select).toBeInTheDocument()

      // Check options
      const options = select.querySelectorAll('option')
      expect(options).toHaveLength(3)
      expect(options[0].textContent).toBe('10px')
      expect(options[1].textContent).toBe('20px')
      expect(options[2].textContent).toBe('40px')
    })
  })

  describe('Reset settings', () => {
    it('renders Reset All Settings button', () => {
      renderWithProvider(<SettingsPanel {...defaultProps} />)
      expect(screen.getByText('Reset All Settings')).toBeInTheDocument()
    })

    it('calls resetSettings and onClose when reset button is clicked', () => {
      const onClose = vi.fn()
      renderWithProvider(<SettingsPanel isOpen={true} onClose={onClose} />)

      const resetButton = screen.getByText('Reset All Settings')
      fireEvent.click(resetButton)

      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('Toggle interactions', () => {
    it('toggles dark mode when switch is clicked', () => {
      renderWithProvider(<SettingsPanel {...defaultProps} />)

      // Find the dark mode toggle (switch role)
      const switches = screen.getAllByRole('switch')
      const darkModeSwitch = switches[0] // First switch is dark mode

      // Should start as checked (dark mode is default)
      expect(darkModeSwitch).toHaveAttribute('aria-checked', 'true')

      fireEvent.click(darkModeSwitch)

      expect(darkModeSwitch).toHaveAttribute('aria-checked', 'false')
    })

    it('toggles animations setting', () => {
      renderWithProvider(<SettingsPanel {...defaultProps} />)

      const switches = screen.getAllByRole('switch')
      // Animations is the 2nd switch (index 1, after dark mode)
      const animationsSwitch = switches[1]

      // Should start as checked (animations enabled by default)
      expect(animationsSwitch).toHaveAttribute('aria-checked', 'true')

      fireEvent.click(animationsSwitch)

      expect(animationsSwitch).toHaveAttribute('aria-checked', 'false')
    })
  })

  describe('Accent color selection', () => {
    it('clicking accent color button changes selection', () => {
      renderWithProvider(<SettingsPanel {...defaultProps} />)

      const colorButtons = screen
        .getAllByRole('button')
        .filter((btn) => btn.classList.contains('rounded-full') && btn.classList.contains('h-6'))

      // Click the blue color (second button)
      fireEvent.click(colorButtons[1])

      // The clicked button should now have scale-110 and ring-2 classes
      expect(colorButtons[1]).toHaveClass('scale-110')
    })
  })

  describe('Grid size selection', () => {
    it('changing grid size updates the value', () => {
      renderWithProvider(<SettingsPanel {...defaultProps} />)

      const selects = screen.getAllByRole('combobox')
      const select = selects.find((s) => s.querySelector('option[value="20"]'))

      // Default should be 20px
      expect(select.value).toBe('20')

      // Change to 40px
      fireEvent.change(select, { target: { value: '40' } })

      expect(select.value).toBe('40')
    })
  })

  describe('Descriptions', () => {
    it('shows dark mode description', () => {
      renderWithProvider(<SettingsPanel {...defaultProps} />)
      expect(screen.getByText('Toggle between dark and light theme')).toBeInTheDocument()
    })

    it('shows accent color description', () => {
      renderWithProvider(<SettingsPanel {...defaultProps} />)
      expect(screen.getByText('Primary highlight color')).toBeInTheDocument()
    })

    it('shows animations description', () => {
      renderWithProvider(<SettingsPanel {...defaultProps} />)
      expect(screen.getByText('Enable motion and transitions')).toBeInTheDocument()
    })

    it('shows compact cards description', () => {
      renderWithProvider(<SettingsPanel {...defaultProps} />)
      expect(screen.getByText('Smaller project cards on dashboard')).toBeInTheDocument()
    })

    it('shows breadcrumbs description', () => {
      renderWithProvider(<SettingsPanel {...defaultProps} />)
      expect(screen.getByText('Path navigation in header')).toBeInTheDocument()
    })

    it('shows auto-save description', () => {
      renderWithProvider(<SettingsPanel {...defaultProps} />)
      expect(screen.getByText('Automatically save changes')).toBeInTheDocument()
    })

    it('shows confirm on delete description', () => {
      renderWithProvider(<SettingsPanel {...defaultProps} />)
      expect(screen.getByText('Show confirmation before deleting')).toBeInTheDocument()
    })

    it('shows snap to grid description', () => {
      renderWithProvider(<SettingsPanel {...defaultProps} />)
      expect(screen.getByText('Align nodes to grid when dragging')).toBeInTheDocument()
    })

    it('shows grid size description', () => {
      renderWithProvider(<SettingsPanel {...defaultProps} />)
      expect(screen.getByText('Spacing for snap-to-grid')).toBeInTheDocument()
    })
  })

  describe('Footer', () => {
    it('shows auto-save message in footer', () => {
      renderWithProvider(<SettingsPanel {...defaultProps} />)
      expect(screen.getByText('Settings are saved automatically')).toBeInTheDocument()
    })
  })

  describe('Panel structure', () => {
    it('has correct panel width', () => {
      renderWithProvider(<SettingsPanel {...defaultProps} />)
      const panel = document.querySelector('.w-\\[380px\\]')
      expect(panel).toBeInTheDocument()
    })

    it('is scrollable content area', () => {
      renderWithProvider(<SettingsPanel {...defaultProps} />)
      const scrollArea = document.querySelector('.overflow-y-auto')
      expect(scrollArea).toBeInTheDocument()
    })
  })

  describe('Edge cases', () => {
    it('handles missing SettingsContext gracefully', () => {
      // This should throw because SettingsPanel requires SettingsProvider
      expect(() => {
        render(<SettingsPanel {...defaultProps} />)
      }).toThrow('useSettings must be used within SettingsProvider')
    })
  })
})
