import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ComponentForm from './ComponentForm'

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }) => children,
}))

// Helper: find a form control (input/select/textarea) by the text of its closest label sibling
// The Input/Select components render <label> as a sibling, not linked via htmlFor
function getFieldByLabel(container, labelText) {
  const labels = container.querySelectorAll('label')
  for (const label of labels) {
    if (label.textContent.match(new RegExp(labelText, 'i'))) {
      const parent = label.parentElement
      return parent.querySelector('input, select, textarea')
    }
  }
  return null
}

describe('ComponentForm', () => {
  const mockComponents = [
    { id: '1', name: 'App', type: 'page', parentId: null },
    { id: '2', name: 'Header', type: 'component', parentId: '1' },
  ]

  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onSave: vi.fn(),
    component: null,
    allComponents: mockComponents,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('should render when isOpen is true', () => {
      render(<ComponentForm {...defaultProps} />)
      // "Add Component" appears in both title and submit button
      expect(screen.getAllByText('Add Component').length).toBeGreaterThanOrEqual(1)
    })

    it('should not render when isOpen is false', () => {
      render(<ComponentForm {...defaultProps} isOpen={false} />)
      expect(screen.queryByText('Add Component')).not.toBeInTheDocument()
    })

    it('should show "Edit Component" title when editing', () => {
      const editProps = {
        ...defaultProps,
        component: mockComponents[0],
      }
      render(<ComponentForm {...editProps} />)
      expect(screen.getByText('Edit Component')).toBeInTheDocument()
    })

    it('should render all form fields', () => {
      const { container } = render(<ComponentForm {...defaultProps} />)
      expect(getFieldByLabel(container, 'name')).toBeInTheDocument()
      expect(getFieldByLabel(container, 'type')).toBeInTheDocument()
      expect(getFieldByLabel(container, 'parent')).toBeInTheDocument()
      expect(getFieldByLabel(container, 'description')).toBeInTheDocument()
    })

    it('should render Cancel and Add Component buttons', () => {
      render(<ComponentForm {...defaultProps} />)
      expect(screen.getByText('Cancel')).toBeInTheDocument()
      // Submit button is the one with type="submit"
      const submitButton = screen.getByRole('button', { name: 'Add Component' })
      expect(submitButton).toBeInTheDocument()
    })

    it('should render Save Changes button when editing', () => {
      render(<ComponentForm {...defaultProps} component={mockComponents[0]} />)
      expect(screen.getByText('Save Changes')).toBeInTheDocument()
    })
  })

  describe('form initialization', () => {
    it('should initialize with empty values for new component', () => {
      const { container } = render(<ComponentForm {...defaultProps} />)
      expect(getFieldByLabel(container, 'name')).toHaveValue('')
      expect(getFieldByLabel(container, 'type')).toHaveValue('component')
    })

    it('should initialize with component values when editing', () => {
      const editComponent = {
        id: '1',
        name: 'TestComponent',
        type: 'hook',
        description: 'A test hook',
        parentId: null,
      }
      const { container } = render(<ComponentForm {...defaultProps} component={editComponent} />)
      expect(getFieldByLabel(container, 'name')).toHaveValue('TestComponent')
      expect(getFieldByLabel(container, 'type')).toHaveValue('hook')
    })

    it('should reset form when opening for new component after editing', async () => {
      const { rerender, container } = render(
        <ComponentForm {...defaultProps} component={mockComponents[0]} />
      )

      // Form should have edit values
      expect(getFieldByLabel(container, 'name')).toHaveValue('App')

      // Close and reopen for new component
      rerender(<ComponentForm {...defaultProps} isOpen={false} />)
      rerender(<ComponentForm {...defaultProps} isOpen={true} component={null} />)

      // Should be reset
      await waitFor(() => {
        expect(getFieldByLabel(container, 'name')).toHaveValue('')
      })
    })
  })

  describe('parent options', () => {
    it('should include "None (root)" option', () => {
      const { container } = render(<ComponentForm {...defaultProps} />)
      const parentSelect = getFieldByLabel(container, 'parent')
      expect(parentSelect).toContainHTML('None (root)')
    })

    it('should list all components as parent options for new component', () => {
      const { container } = render(<ComponentForm {...defaultProps} />)
      const parentSelect = getFieldByLabel(container, 'parent')
      expect(parentSelect).toContainHTML('App (page)')
      expect(parentSelect).toContainHTML('Header (component)')
    })

    it('should exclude self from parent options when editing', () => {
      const { container } = render(
        <ComponentForm {...defaultProps} component={mockComponents[0]} />
      )
      const parentSelect = getFieldByLabel(container, 'parent')
      // App (self) should not be in options
      const options = parentSelect.querySelectorAll('option')
      const optionTexts = Array.from(options).map((o) => o.textContent)
      expect(optionTexts).not.toContain('App (page)')
      expect(optionTexts).toContain('Header (component)')
    })
  })

  describe('form interaction', () => {
    it('should update name field', async () => {
      const user = userEvent.setup()
      const { container } = render(<ComponentForm {...defaultProps} />)
      const nameInput = getFieldByLabel(container, 'name')
      await user.type(nameInput, 'NewComponent')
      expect(nameInput).toHaveValue('NewComponent')
    })

    it('should update type selection', async () => {
      const user = userEvent.setup()
      const { container } = render(<ComponentForm {...defaultProps} />)
      const typeSelect = getFieldByLabel(container, 'type')
      await user.selectOptions(typeSelect, 'hook')
      expect(typeSelect).toHaveValue('hook')
    })

    it('should update parent selection', async () => {
      const user = userEvent.setup()
      const { container } = render(<ComponentForm {...defaultProps} />)
      const parentSelect = getFieldByLabel(container, 'parent')
      await user.selectOptions(parentSelect, '1')
      expect(parentSelect).toHaveValue('1')
    })

    it('should update description', async () => {
      const user = userEvent.setup()
      const { container } = render(<ComponentForm {...defaultProps} />)
      const descInput = getFieldByLabel(container, 'description')
      await user.type(descInput, 'A new component description')
      expect(descInput).toHaveValue('A new component description')
    })
  })

  describe('form submission', () => {
    it('should call onSave with form data on submit', async () => {
      const user = userEvent.setup()
      const { container } = render(<ComponentForm {...defaultProps} />)

      const nameInput = getFieldByLabel(container, 'name')
      const typeSelect = getFieldByLabel(container, 'type')
      const descInput = getFieldByLabel(container, 'description')

      await user.type(nameInput, 'NewComponent')
      await user.selectOptions(typeSelect, 'hook')
      await user.type(descInput, 'A description')

      const form = container.querySelector('form')
      fireEvent.submit(form)

      expect(defaultProps.onSave).toHaveBeenCalledWith({
        name: 'NewComponent',
        type: 'hook',
        description: 'A description',
        parentId: null,
      })
    })

    it('should call onClose after successful submit', async () => {
      const user = userEvent.setup()
      const { container } = render(<ComponentForm {...defaultProps} />)

      const nameInput = getFieldByLabel(container, 'name')
      await user.type(nameInput, 'NewComponent')
      fireEvent.click(screen.getByRole('button', { name: 'Add Component' }))

      expect(defaultProps.onClose).toHaveBeenCalled()
    })

    it('should not submit if name is empty', async () => {
      render(<ComponentForm {...defaultProps} />)
      fireEvent.click(screen.getByRole('button', { name: 'Add Component' }))
      expect(defaultProps.onSave).not.toHaveBeenCalled()
    })

    it('should not submit if name is only whitespace', async () => {
      const user = userEvent.setup()
      const { container } = render(<ComponentForm {...defaultProps} />)

      const nameInput = getFieldByLabel(container, 'name')
      await user.type(nameInput, '   ')
      fireEvent.click(screen.getByRole('button', { name: 'Add Component' }))

      expect(defaultProps.onSave).not.toHaveBeenCalled()
    })

    it('should trim name before saving', async () => {
      const user = userEvent.setup()
      const { container } = render(<ComponentForm {...defaultProps} />)

      const nameInput = getFieldByLabel(container, 'name')
      await user.type(nameInput, '  TrimmedName  ')
      fireEvent.click(screen.getByRole('button', { name: 'Add Component' }))

      expect(defaultProps.onSave).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'TrimmedName' })
      )
    })
  })

  describe('cancel behavior', () => {
    it('should call onClose when Cancel clicked', () => {
      render(<ComponentForm {...defaultProps} />)
      fireEvent.click(screen.getByText('Cancel'))
      expect(defaultProps.onClose).toHaveBeenCalled()
    })
  })

  describe('edge cases', () => {
    it('should handle empty allComponents array', () => {
      const { container } = render(<ComponentForm {...defaultProps} allComponents={[]} />)
      const parentSelect = getFieldByLabel(container, 'parent')
      // Should only have "None (root)" option
      const options = parentSelect.querySelectorAll('option')
      expect(options.length).toBe(1)
    })

    it('should handle component without optional fields', () => {
      const minimalComponent = { id: '1', name: 'Minimal', type: 'component' }
      const { container } = render(<ComponentForm {...defaultProps} component={minimalComponent} />)
      expect(getFieldByLabel(container, 'name')).toHaveValue('Minimal')
    })

    it('should disable submit button when name is empty', () => {
      render(<ComponentForm {...defaultProps} />)
      const submitButton = screen.getByRole('button', { name: 'Add Component' })
      expect(submitButton).toBeDisabled()
    })

    it('should enable submit button when name has value', async () => {
      const user = userEvent.setup()
      const { container } = render(<ComponentForm {...defaultProps} />)

      const nameInput = getFieldByLabel(container, 'name')
      await user.type(nameInput, 'SomeName')
      const submitButton = screen.getByRole('button', { name: 'Add Component' })
      expect(submitButton).not.toBeDisabled()
    })
  })
})
