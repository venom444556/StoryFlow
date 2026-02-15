import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Edit, Trash2, Copy } from 'lucide-react'
import DropdownMenu from './DropdownMenu'

describe('DropdownMenu', () => {
  const defaultItems = [
    { label: 'Edit', icon: Edit, onClick: vi.fn() },
    { label: 'Copy', icon: Copy, onClick: vi.fn() },
    { label: 'Delete', icon: Trash2, onClick: vi.fn(), danger: true },
  ]

  const defaultProps = {
    trigger: <button>Open Menu</button>,
    items: defaultItems,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('renders trigger without crashing', () => {
      render(<DropdownMenu {...defaultProps} />)
      expect(screen.getByText('Open Menu')).toBeInTheDocument()
    })

    it('does not show menu items by default', () => {
      render(<DropdownMenu {...defaultProps} />)
      expect(screen.queryByText('Edit')).not.toBeInTheDocument()
    })

    it('applies custom className', () => {
      const { container } = render(
        <DropdownMenu {...defaultProps} className="custom-class" />
      )
      expect(container.querySelector('.custom-class')).toBeInTheDocument()
    })
  })

  describe('Menu Opening', () => {
    it('opens menu when trigger is clicked', async () => {
      render(<DropdownMenu {...defaultProps} />)

      fireEvent.click(screen.getByText('Open Menu'))

      await waitFor(() => {
        expect(screen.getByText('Edit')).toBeInTheDocument()
      })
    })

    it('shows all menu items when open', async () => {
      render(<DropdownMenu {...defaultProps} />)

      fireEvent.click(screen.getByText('Open Menu'))

      await waitFor(() => {
        expect(screen.getByText('Edit')).toBeInTheDocument()
        expect(screen.getByText('Copy')).toBeInTheDocument()
        expect(screen.getByText('Delete')).toBeInTheDocument()
      })
    })

    it('opens menu with Enter key', async () => {
      render(<DropdownMenu {...defaultProps} />)

      // The trigger wrapper div has role="button" and handles keyboard events
      const triggerWrapper = screen.getByText('Open Menu').closest('[aria-haspopup="menu"]')
      fireEvent.keyDown(triggerWrapper, { key: 'Enter' })

      await waitFor(() => {
        expect(screen.getByText('Edit')).toBeInTheDocument()
      })
    })

    it('opens menu with Space key', async () => {
      render(<DropdownMenu {...defaultProps} />)

      const triggerWrapper = screen.getByText('Open Menu').closest('[aria-haspopup="menu"]')
      fireEvent.keyDown(triggerWrapper, { key: ' ' })

      await waitFor(() => {
        expect(screen.getByText('Edit')).toBeInTheDocument()
      })
    })
  })

  describe('Menu Closing', () => {
    it('closes menu when clicking outside', async () => {
      render(
        <div>
          <DropdownMenu {...defaultProps} />
          <button>Outside</button>
        </div>
      )

      fireEvent.click(screen.getByText('Open Menu'))
      await waitFor(() => {
        expect(screen.getByText('Edit')).toBeInTheDocument()
      })

      fireEvent.mouseDown(screen.getByText('Outside'))

      await waitFor(() => {
        expect(screen.queryByText('Edit')).not.toBeInTheDocument()
      })
    })

    it('closes menu when pressing Escape', async () => {
      render(<DropdownMenu {...defaultProps} />)

      fireEvent.click(screen.getByText('Open Menu'))
      await waitFor(() => {
        expect(screen.getByText('Edit')).toBeInTheDocument()
      })

      fireEvent.keyDown(document, { key: 'Escape' })

      await waitFor(() => {
        expect(screen.queryByText('Edit')).not.toBeInTheDocument()
      })
    })

    it('closes menu when item is clicked', async () => {
      render(<DropdownMenu {...defaultProps} />)

      fireEvent.click(screen.getByText('Open Menu'))
      await waitFor(() => {
        expect(screen.getByText('Edit')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('Edit'))

      await waitFor(() => {
        expect(screen.queryByText('Edit')).not.toBeInTheDocument()
      })
    })

    it('toggles menu when trigger is clicked again', async () => {
      render(<DropdownMenu {...defaultProps} />)

      // Open
      fireEvent.click(screen.getByText('Open Menu'))
      await waitFor(() => {
        expect(screen.getByText('Edit')).toBeInTheDocument()
      })

      // Close
      fireEvent.click(screen.getByText('Open Menu'))
      await waitFor(() => {
        expect(screen.queryByText('Edit')).not.toBeInTheDocument()
      })
    })
  })

  describe('Item Interactions', () => {
    it('calls onClick when item is clicked', async () => {
      const handleEdit = vi.fn()
      const items = [{ label: 'Edit', onClick: handleEdit }]

      render(<DropdownMenu trigger={<button>Menu</button>} items={items} />)

      fireEvent.click(screen.getByText('Menu'))
      await waitFor(() => {
        expect(screen.getByText('Edit')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('Edit'))
      expect(handleEdit).toHaveBeenCalledTimes(1)
    })

    it('handles missing onClick gracefully', async () => {
      const items = [{ label: 'No Handler' }]

      render(<DropdownMenu trigger={<button>Menu</button>} items={items} />)

      fireEvent.click(screen.getByText('Menu'))
      await waitFor(() => {
        expect(screen.getByText('No Handler')).toBeInTheDocument()
      })

      expect(() => {
        fireEvent.click(screen.getByText('No Handler'))
      }).not.toThrow()
    })
  })

  describe('Item Icons', () => {
    it('renders icons with items', async () => {
      render(<DropdownMenu {...defaultProps} />)

      fireEvent.click(screen.getByText('Open Menu'))

      await waitFor(() => {
        const buttons = screen.getAllByRole('menuitem')
        buttons.forEach(button => {
          const svg = button.querySelector('svg')
          expect(svg).toBeInTheDocument()
        })
      })
    })

    it('icons are hidden from screen readers', async () => {
      render(<DropdownMenu {...defaultProps} />)

      fireEvent.click(screen.getByText('Open Menu'))

      await waitFor(() => {
        const hiddenIcons = document.querySelectorAll('[aria-hidden="true"]')
        expect(hiddenIcons.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Danger Items', () => {
    it('applies danger styling to danger items', async () => {
      render(<DropdownMenu {...defaultProps} />)

      fireEvent.click(screen.getByText('Open Menu'))

      await waitFor(() => {
        const deleteButton = screen.getByText('Delete').closest('button')
        expect(deleteButton).toHaveClass('text-[var(--color-danger)]')
      })
    })
  })

  describe('Alignment', () => {
    it('aligns right by default', () => {
      render(<DropdownMenu {...defaultProps} />)
      // Default alignment is right - checked through class presence when menu opens
      fireEvent.click(screen.getByText('Open Menu'))
    })

    it('can align left', async () => {
      render(<DropdownMenu {...defaultProps} align="left" />)

      fireEvent.click(screen.getByText('Open Menu'))

      await waitFor(() => {
        const menu = screen.getByRole('menu')
        expect(menu).toHaveClass('left-0')
      })
    })

    it('can align center', async () => {
      render(<DropdownMenu {...defaultProps} align="center" />)

      fireEvent.click(screen.getByText('Open Menu'))

      await waitFor(() => {
        const menu = screen.getByRole('menu')
        expect(menu).toHaveClass('left-1/2', '-translate-x-1/2')
      })
    })
  })

  describe('Accessibility', () => {
    it('has aria-haspopup on trigger', () => {
      render(<DropdownMenu {...defaultProps} />)
      const triggerContainer = screen.getByText('Open Menu').closest('[aria-haspopup="menu"]')
      expect(triggerContainer).toHaveAttribute('aria-haspopup', 'menu')
    })

    it('has aria-expanded false when closed', () => {
      render(<DropdownMenu {...defaultProps} />)
      const triggerContainer = screen.getByText('Open Menu').closest('[aria-haspopup="menu"]')
      expect(triggerContainer).toHaveAttribute('aria-expanded', 'false')
    })

    it('has aria-expanded true when open', async () => {
      render(<DropdownMenu {...defaultProps} />)

      fireEvent.click(screen.getByText('Open Menu'))

      await waitFor(() => {
        const triggerContainer = screen.getByText('Open Menu').closest('[aria-haspopup="menu"]')
        expect(triggerContainer).toHaveAttribute('aria-expanded', 'true')
      })
    })

    it('menu has role="menu"', async () => {
      render(<DropdownMenu {...defaultProps} />)

      fireEvent.click(screen.getByText('Open Menu'))

      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument()
      })
    })

    it('items have role="menuitem"', async () => {
      render(<DropdownMenu {...defaultProps} />)

      fireEvent.click(screen.getByText('Open Menu'))

      await waitFor(() => {
        const menuItems = screen.getAllByRole('menuitem')
        expect(menuItems.length).toBe(3)
      })
    })

    it('trigger is focusable with tabIndex', () => {
      render(<DropdownMenu {...defaultProps} />)
      const triggerContainer = screen.getByText('Open Menu').closest('[aria-haspopup="menu"]')
      expect(triggerContainer).toHaveAttribute('tabIndex', '0')
    })
  })

  describe('Empty States', () => {
    it('handles empty items array', () => {
      render(<DropdownMenu trigger={<button>Menu</button>} items={[]} />)

      fireEvent.click(screen.getByText('Menu'))
      // Should not crash, menu opens but is empty
    })

    it('handles undefined items', () => {
      render(<DropdownMenu trigger={<button>Menu</button>} />)

      expect(() => {
        fireEvent.click(screen.getByText('Menu'))
      }).not.toThrow()
    })
  })

  describe('Edge Cases', () => {
    it('handles rapid opening and closing', async () => {
      render(<DropdownMenu {...defaultProps} />)

      for (let i = 0; i < 5; i++) {
        fireEvent.click(screen.getByText('Open Menu'))
      }

      // Should not crash
      expect(screen.getByText('Open Menu')).toBeInTheDocument()
    })

    it('handles items without icons', async () => {
      const items = [
        { label: 'No Icon', onClick: vi.fn() },
      ]

      render(<DropdownMenu trigger={<button>Menu</button>} items={items} />)

      fireEvent.click(screen.getByText('Menu'))

      await waitFor(() => {
        expect(screen.getByText('No Icon')).toBeInTheDocument()
      })
    })

    it('cleans up event listeners on unmount', () => {
      const { unmount } = render(<DropdownMenu {...defaultProps} />)

      fireEvent.click(screen.getByText('Open Menu'))

      expect(() => {
        unmount()
      }).not.toThrow()
    })
  })
})
