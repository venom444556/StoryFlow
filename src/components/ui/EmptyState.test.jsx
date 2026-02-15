import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Inbox, FileText } from 'lucide-react'
import EmptyState from './EmptyState'

describe('EmptyState', () => {
  describe('Basic Rendering', () => {
    it('renders without crashing', () => {
      const { container } = render(<EmptyState />)
      expect(container).toBeInTheDocument()
    })

    it('renders with title', () => {
      render(<EmptyState title="No items found" />)
      expect(screen.getByText('No items found')).toBeInTheDocument()
    })

    it('renders with description', () => {
      render(<EmptyState description="Create your first item to get started" />)
      expect(screen.getByText('Create your first item to get started')).toBeInTheDocument()
    })

    it('renders with icon', () => {
      render(<EmptyState icon={Inbox} title="Empty" />)
      // Icon should be hidden from accessibility
      const icon = document.querySelector('[aria-hidden="true"]')
      expect(icon).toBeInTheDocument()
    })
  })

  describe('Action Button', () => {
    it('does not render action button by default', () => {
      render(<EmptyState title="Empty" />)
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('renders action button when action prop is provided', () => {
      const action = { label: 'Add Item', onClick: vi.fn() }
      render(<EmptyState title="Empty" action={action} />)
      expect(screen.getByRole('button', { name: 'Add Item' })).toBeInTheDocument()
    })

    it('calls onClick when action button is clicked', () => {
      const handleClick = vi.fn()
      const action = { label: 'Add Item', onClick: handleClick }
      render(<EmptyState title="Empty" action={action} />)

      fireEvent.click(screen.getByRole('button', { name: 'Add Item' }))
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('action button has secondary variant', () => {
      const action = { label: 'Add Item', onClick: vi.fn() }
      render(<EmptyState title="Empty" action={action} />)
      const button = screen.getByRole('button', { name: 'Add Item' })
      expect(button).toHaveClass('glass')
    })
  })

  describe('Icon Rendering', () => {
    it('icon has aria-hidden attribute', () => {
      render(<EmptyState icon={Inbox} title="Empty" />)
      const icon = document.querySelector('[aria-hidden="true"]')
      expect(icon).toBeInTheDocument()
    })

    it('does not render icon when not provided', () => {
      render(<EmptyState title="Empty" />)
      // Should not have any SVG elements from icons
      const svgs = document.querySelectorAll('svg')
      expect(svgs.length).toBe(0)
    })

    it('renders different icons', () => {
      const { rerender } = render(<EmptyState icon={Inbox} title="Empty" />)
      expect(document.querySelector('svg')).toBeInTheDocument()

      rerender(<EmptyState icon={FileText} title="Empty" />)
      expect(document.querySelector('svg')).toBeInTheDocument()
    })
  })

  describe('Layout and Styling', () => {
    it('centers content', () => {
      render(<EmptyState title="Empty" />)
      const container = screen.getByText('Empty').parentElement
      expect(container).toHaveClass('text-center')
    })

    it('applies custom className', () => {
      render(<EmptyState title="Empty" className="custom-class" />)
      const container = screen.getByText('Empty').parentElement
      expect(container).toHaveClass('custom-class')
    })

    it('preserves default flex layout with custom className', () => {
      render(<EmptyState title="Empty" className="custom-class" />)
      const container = screen.getByText('Empty').parentElement
      expect(container).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center')
    })
  })

  describe('Typography', () => {
    it('title uses appropriate heading element', () => {
      render(<EmptyState title="Empty Inbox" />)
      expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument()
    })

    it('description is a paragraph element', () => {
      render(<EmptyState description="Description text" />)
      expect(screen.getByText('Description text').tagName).toBe('P')
    })
  })

  describe('Conditional Rendering', () => {
    it('does not render title element when title is not provided', () => {
      render(<EmptyState description="Only description" />)
      expect(screen.queryByRole('heading')).not.toBeInTheDocument()
    })

    it('does not render description element when description is not provided', () => {
      const { container } = render(<EmptyState title="Only title" />)
      const paragraphs = container.querySelectorAll('p')
      expect(paragraphs.length).toBe(0)
    })

    it('does not render icon area when icon is not provided', () => {
      const { container } = render(<EmptyState title="No icon" />)
      expect(container.querySelector('svg')).not.toBeInTheDocument()
    })
  })

  describe('Full Feature Usage', () => {
    it('renders all features together', () => {
      const action = { label: 'Create', onClick: vi.fn() }
      render(
        <EmptyState
          icon={Inbox}
          title="No Messages"
          description="Your inbox is empty"
          action={action}
          className="custom-class"
        />
      )

      expect(document.querySelector('svg')).toBeInTheDocument()
      expect(screen.getByText('No Messages')).toBeInTheDocument()
      expect(screen.getByText('Your inbox is empty')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles empty string title', () => {
      render(<EmptyState title="" description="Has description" />)
      // Empty title should still render the heading element but empty
      expect(screen.getByText('Has description')).toBeInTheDocument()
    })

    it('handles empty string description', () => {
      render(<EmptyState title="Has title" description="" />)
      expect(screen.getByText('Has title')).toBeInTheDocument()
    })

    it('handles empty action label', () => {
      const action = { label: '', onClick: vi.fn() }
      render(<EmptyState title="Empty" action={action} />)
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('handles missing onClick in action', () => {
      const action = { label: 'Click Me' }
      render(<EmptyState title="Empty" action={action} />)

      expect(() => {
        fireEvent.click(screen.getByRole('button'))
      }).not.toThrow()
    })

    it('handles null values gracefully', () => {
      render(
        <EmptyState
          icon={null}
          title={null}
          description={null}
          action={null}
        />
      )
      // Should render without crashing
      expect(document.body).toBeInTheDocument()
    })

    it('handles undefined values gracefully', () => {
      render(
        <EmptyState
          icon={undefined}
          title={undefined}
          description={undefined}
          action={undefined}
        />
      )
      // Should render without crashing
      expect(document.body).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper heading hierarchy', () => {
      render(<EmptyState title="Accessible Title" />)
      const heading = screen.getByRole('heading', { level: 3 })
      expect(heading).toHaveTextContent('Accessible Title')
    })

    it('action button is keyboard accessible', () => {
      const action = { label: 'Create', onClick: vi.fn() }
      render(<EmptyState title="Empty" action={action} />)

      const button = screen.getByRole('button')
      button.focus()
      expect(document.activeElement).toBe(button)
    })

    it('icon is decorative and hidden from screen readers', () => {
      render(<EmptyState icon={Inbox} title="Empty" />)
      const icon = document.querySelector('[aria-hidden="true"]')
      expect(icon).toBeInTheDocument()
      expect(icon.getAttribute('aria-hidden')).toBe('true')
    })
  })
})
