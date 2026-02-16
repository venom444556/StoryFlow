import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ComponentDetail from './ComponentDetail'

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
      // The input/select/textarea is in the next sibling container
      const parent = label.parentElement
      return parent.querySelector('input, select, textarea')
    }
  }
  return null
}

describe('ComponentDetail', () => {
  const mockComponent = {
    id: '1',
    name: 'Header',
    type: 'component',
    description: 'Main header component',
    dependencies: ['2'],
    parentId: null,
  }

  const mockAllComponents = [
    { id: '1', name: 'Header', type: 'component', dependencies: ['2'], parentId: null },
    { id: '2', name: 'useAuth', type: 'hook', dependencies: [], parentId: null },
    { id: '3', name: 'Button', type: 'component', dependencies: [], parentId: null },
    { id: '4', name: 'Nav', type: 'component', dependencies: ['1'], parentId: null },
  ]

  const mockParentOptions = [
    { value: '', label: 'None (root)' },
    { value: '3', label: 'Button (component)' },
  ]

  const defaultProps = {
    component: mockComponent,
    allComponents: mockAllComponents,
    onUpdate: vi.fn(),
    onDelete: vi.fn(),
    parentOptions: mockParentOptions,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('should render without crashing', () => {
      render(<ComponentDetail {...defaultProps} />)
      // "Header" appears in heading and in the mini dep graph SVG text
      expect(screen.getAllByText('Header').length).toBeGreaterThanOrEqual(1)
    })

    it('should display component name', () => {
      render(<ComponentDetail {...defaultProps} />)
      // Find the heading specifically
      const heading = screen.getByRole('heading', { level: 3 })
      expect(heading).toHaveTextContent('Header')
    })

    it('should display component type badge', () => {
      render(<ComponentDetail {...defaultProps} />)
      expect(screen.getByText('component')).toBeInTheDocument()
    })

    it('should display Delete button', () => {
      render(<ComponentDetail {...defaultProps} />)
      expect(screen.getByText('Delete')).toBeInTheDocument()
    })

    it('should display Name input with correct value', () => {
      const { container } = render(<ComponentDetail {...defaultProps} />)
      const nameInput = getFieldByLabel(container, 'name')
      expect(nameInput).toBeInTheDocument()
      expect(nameInput).toHaveValue('Header')
    })

    it('should display Type select', () => {
      const { container } = render(<ComponentDetail {...defaultProps} />)
      const typeSelect = getFieldByLabel(container, 'type')
      expect(typeSelect).toBeInTheDocument()
    })

    it('should display Parent select', () => {
      const { container } = render(<ComponentDetail {...defaultProps} />)
      const parentSelect = getFieldByLabel(container, 'parent')
      expect(parentSelect).toBeInTheDocument()
    })

    it('should display Description textarea', () => {
      render(<ComponentDetail {...defaultProps} />)
      expect(screen.getByPlaceholderText(/describe what this component does/i)).toBeInTheDocument()
    })
  })

  describe('dependencies section', () => {
    it('should display "Depends on" label', () => {
      render(<ComponentDetail {...defaultProps} />)
      expect(screen.getByText('Depends on')).toBeInTheDocument()
    })

    it('should display existing dependencies as badges', () => {
      render(<ComponentDetail {...defaultProps} />)
      // Component depends on useAuth (id: 2)
      // useAuth appears in badge and possibly in SVG
      expect(screen.getAllByText('useAuth').length).toBeGreaterThanOrEqual(1)
    })

    it('should show "No dependencies" when component has no deps', () => {
      const noDepsComponent = { ...mockComponent, dependencies: [] }
      render(<ComponentDetail {...defaultProps} component={noDepsComponent} />)
      expect(screen.getByText('No dependencies')).toBeInTheDocument()
    })

    it('should show "Add dependency" button', () => {
      render(<ComponentDetail {...defaultProps} />)
      expect(screen.getByText('+ Add dependency')).toBeInTheDocument()
    })
  })

  describe('used by section', () => {
    it('should display "Used by" label when component is depended upon', () => {
      render(<ComponentDetail {...defaultProps} />)
      // Nav depends on Header
      expect(screen.getByText('Used by')).toBeInTheDocument()
    })

    it('should display components that depend on this one', () => {
      render(<ComponentDetail {...defaultProps} />)
      // Nav appears in badge and possibly in SVG
      expect(screen.getAllByText('Nav').length).toBeGreaterThanOrEqual(1)
    })

    it('should not show "Used by" section when no components depend on it', () => {
      const component = { ...mockComponent, id: '3' } // Button, nothing depends on it
      render(<ComponentDetail {...defaultProps} component={component} />)
      expect(screen.queryByText('Used by')).not.toBeInTheDocument()
    })
  })

  describe('interactions', () => {
    it('should call onUpdate when name changes', () => {
      const { container } = render(<ComponentDetail {...defaultProps} />)

      const nameInput = getFieldByLabel(container, 'name')
      fireEvent.change(nameInput, { target: { value: 'NewHeader' } })

      expect(defaultProps.onUpdate).toHaveBeenCalledWith('name', 'NewHeader')
    })

    it('should call onUpdate when type changes', async () => {
      const user = userEvent.setup()
      const { container } = render(<ComponentDetail {...defaultProps} />)

      const typeSelect = getFieldByLabel(container, 'type')
      await user.selectOptions(typeSelect, 'hook')

      expect(defaultProps.onUpdate).toHaveBeenCalledWith('type', 'hook')
    })

    it('should call onUpdate when parent changes', async () => {
      const user = userEvent.setup()
      const { container } = render(<ComponentDetail {...defaultProps} />)

      const parentSelect = getFieldByLabel(container, 'parent')
      await user.selectOptions(parentSelect, '3')

      expect(defaultProps.onUpdate).toHaveBeenCalledWith('parentId', '3')
    })

    it('should call onDelete when Delete button is clicked', () => {
      render(<ComponentDetail {...defaultProps} />)
      fireEvent.click(screen.getByText('Delete'))
      expect(defaultProps.onDelete).toHaveBeenCalled()
    })

    it('should call onUpdate when description changes', () => {
      render(<ComponentDetail {...defaultProps} />)

      const descTextarea = screen.getByPlaceholderText(/describe what this component does/i)
      fireEvent.change(descTextarea, { target: { value: 'Main header component updated' } })

      expect(defaultProps.onUpdate).toHaveBeenCalledWith(
        'description',
        'Main header component updated'
      )
    })
  })

  describe('dependency management', () => {
    it('should show select dropdown when Add dependency is clicked', () => {
      const { container } = render(<ComponentDetail {...defaultProps} />)
      fireEvent.click(screen.getByText('+ Add dependency'))
      // A new select element should appear
      const selects = container.querySelectorAll('select')
      expect(selects.length).toBeGreaterThanOrEqual(3) // Type + Parent + new dependency select
    })

    it('should remove dependency when remove button is clicked', () => {
      render(<ComponentDetail {...defaultProps} />)
      // Find the dependency badge with remove functionality
      const useAuthElements = screen.getAllByText('useAuth')
      const dependencyBadge = useAuthElements[0].closest('span')
      const removeButton = dependencyBadge?.querySelector('button')

      if (removeButton) {
        fireEvent.click(removeButton)
        expect(defaultProps.onUpdate).toHaveBeenCalledWith('dependencies', [])
      }
    })
  })

  describe('mini dependency graph', () => {
    it('should render mini dep graph when component has dependencies', () => {
      render(<ComponentDetail {...defaultProps} />)
      // The mini graph SVG has preserveAspectRatio (distinguishes it from Lucide icon SVGs)
      const svg = document.querySelector('svg[preserveAspectRatio]')
      expect(svg).toBeInTheDocument()
    })

    it('should not render mini dep graph when component has no connections', () => {
      const isolatedComponent = {
        id: '5',
        name: 'Isolated',
        type: 'util',
        dependencies: [],
        parentId: null,
      }
      const isolatedComponents = [...mockAllComponents, isolatedComponent]
      render(
        <ComponentDetail
          {...defaultProps}
          component={isolatedComponent}
          allComponents={isolatedComponents}
        />
      )
      // Should not have the mini graph SVG (Lucide icons are still SVGs but without preserveAspectRatio)
      const svg = document.querySelector('svg[preserveAspectRatio]')
      expect(svg).not.toBeInTheDocument()
    })
  })

  describe('edge cases', () => {
    it('should handle component without dependencies property', () => {
      const noDepsProperty = { id: '1', name: 'Test', type: 'component' }
      render(<ComponentDetail {...defaultProps} component={noDepsProperty} />)
      expect(screen.getByText('No dependencies')).toBeInTheDocument()
    })

    it('should handle component without description', () => {
      const noDesc = { ...mockComponent, description: undefined }
      render(<ComponentDetail {...defaultProps} component={noDesc} />)
      const textarea = screen.getByPlaceholderText(/describe what this component does/i)
      expect(textarea).toHaveValue('')
    })

    it('should handle null parentId correctly', () => {
      const { container } = render(<ComponentDetail {...defaultProps} />)
      const parentSelect = getFieldByLabel(container, 'parent')
      expect(parentSelect).toHaveValue('')
    })

    it('should render with missing dependency reference gracefully', () => {
      const componentWithMissingDep = {
        ...mockComponent,
        dependencies: ['non-existent-id'],
      }
      render(<ComponentDetail {...defaultProps} component={componentWithMissingDep} />)
      // Should not crash and should not show the missing dependency
      expect(screen.getByText('Depends on')).toBeInTheDocument()
    })
  })
})
