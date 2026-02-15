import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import TemplateSelector from './TemplateSelector'

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    button: ({ children, onClick, ...props }) => (
      <button onClick={onClick} {...props}>
        {children}
      </button>
    ),
  },
}))

// Mock the Modal component
vi.mock('../ui/Modal', () => ({
  default: ({ isOpen, onClose, title, children, size }) => {
    if (!isOpen) return null
    return (
      <div data-testid="modal" data-size={size}>
        <div data-testid="modal-header">
          <h2>{title}</h2>
          <button data-testid="modal-close" onClick={onClose}>
            Close
          </button>
        </div>
        <div data-testid="modal-content">{children}</div>
      </div>
    )
  },
}))

// Mock page templates
vi.mock('../../data/pageTemplates', () => ({
  pageTemplates: [
    {
      id: 'blank',
      name: 'Blank Page',
      icon: '📄',
      description: 'Start with a clean slate',
      content: '',
    },
    {
      id: 'meeting-notes',
      name: 'Meeting Notes',
      icon: '📝',
      description: 'Capture meeting discussions',
      content: '# Meeting Notes\n\n**Date:**',
    },
    {
      id: 'technical-spec',
      name: 'Technical Spec',
      icon: '🔧',
      description: 'Document a technical design',
      content: '# Technical Specification\n\n## Overview',
    },
  ],
}))

describe('TemplateSelector', () => {
  const mockOnClose = vi.fn()
  const mockOnSelect = vi.fn()

  beforeEach(() => {
    mockOnClose.mockClear()
    mockOnSelect.mockClear()
  })

  describe('basic rendering', () => {
    it('renders when isOpen is true', () => {
      render(
        <TemplateSelector
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      )

      expect(screen.getByTestId('modal')).toBeInTheDocument()
    })

    it('does not render when isOpen is false', () => {
      render(
        <TemplateSelector
          isOpen={false}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      )

      expect(screen.queryByTestId('modal')).not.toBeInTheDocument()
    })

    it('displays correct title', () => {
      render(
        <TemplateSelector
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      )

      expect(screen.getByText('Choose a Template')).toBeInTheDocument()
    })

    it('uses lg size for modal', () => {
      render(
        <TemplateSelector
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      )

      expect(screen.getByTestId('modal')).toHaveAttribute('data-size', 'lg')
    })
  })

  describe('template display', () => {
    it('displays all templates', () => {
      render(
        <TemplateSelector
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      )

      expect(screen.getByText('Blank Page')).toBeInTheDocument()
      expect(screen.getByText('Meeting Notes')).toBeInTheDocument()
      expect(screen.getByText('Technical Spec')).toBeInTheDocument()
    })

    it('displays template icons', () => {
      render(
        <TemplateSelector
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      )

      expect(screen.getByText('📄')).toBeInTheDocument()
      expect(screen.getByText('📝')).toBeInTheDocument()
      expect(screen.getByText('🔧')).toBeInTheDocument()
    })

    it('displays template descriptions', () => {
      render(
        <TemplateSelector
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      )

      expect(screen.getByText('Start with a clean slate')).toBeInTheDocument()
      expect(screen.getByText('Capture meeting discussions')).toBeInTheDocument()
      expect(screen.getByText('Document a technical design')).toBeInTheDocument()
    })
  })

  describe('template selection', () => {
    it('calls onSelect with template when clicked', () => {
      render(
        <TemplateSelector
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      )

      fireEvent.click(screen.getByText('Blank Page'))

      expect(mockOnSelect).toHaveBeenCalledWith({
        id: 'blank',
        name: 'Blank Page',
        icon: '📄',
        description: 'Start with a clean slate',
        content: '',
      })
    })

    it('calls onClose after selecting template', () => {
      render(
        <TemplateSelector
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      )

      fireEvent.click(screen.getByText('Meeting Notes'))

      expect(mockOnClose).toHaveBeenCalled()
    })

    it('passes full template object on selection', () => {
      render(
        <TemplateSelector
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      )

      fireEvent.click(screen.getByText('Technical Spec'))

      expect(mockOnSelect).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'technical-spec',
          content: expect.stringContaining('# Technical Specification'),
        })
      )
    })
  })

  describe('modal closing', () => {
    it('calls onClose when modal close button is clicked', () => {
      render(
        <TemplateSelector
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      )

      fireEvent.click(screen.getByTestId('modal-close'))

      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  describe('grid layout', () => {
    it('renders templates in a grid', () => {
      render(
        <TemplateSelector
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      )

      const content = screen.getByTestId('modal-content')
      const grid = content.querySelector('.grid')

      expect(grid).toHaveClass('grid-cols-2')
      expect(grid).toHaveClass('sm:grid-cols-3')
    })
  })

  describe('template buttons', () => {
    it('renders templates as buttons', () => {
      render(
        <TemplateSelector
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      )

      const buttons = screen.getAllByRole('button')
      // 3 template buttons + 1 modal close button
      expect(buttons.length).toBeGreaterThanOrEqual(3)
    })

    it('templates have glass-card styling', () => {
      render(
        <TemplateSelector
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      )

      const content = screen.getByTestId('modal-content')
      const templateButtons = content.querySelectorAll('button')

      templateButtons.forEach((button) => {
        expect(button).toHaveClass('glass-card')
      })
    })
  })

  describe('edge cases', () => {
    it('handles rapid selection clicks', () => {
      render(
        <TemplateSelector
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      )

      // Click multiple times rapidly
      fireEvent.click(screen.getByText('Blank Page'))
      fireEvent.click(screen.getByText('Meeting Notes'))
      fireEvent.click(screen.getByText('Technical Spec'))

      // Each click triggers both callbacks
      expect(mockOnSelect).toHaveBeenCalledTimes(3)
      expect(mockOnClose).toHaveBeenCalledTimes(3)
    })

    it('handles re-opening the modal', () => {
      const { rerender } = render(
        <TemplateSelector
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      )

      expect(screen.getByTestId('modal')).toBeInTheDocument()

      // Close modal
      rerender(
        <TemplateSelector
          isOpen={false}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      )

      expect(screen.queryByTestId('modal')).not.toBeInTheDocument()

      // Re-open modal
      rerender(
        <TemplateSelector
          isOpen={true}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      )

      expect(screen.getByTestId('modal')).toBeInTheDocument()
      expect(screen.getByText('Blank Page')).toBeInTheDocument()
    })
  })
})
