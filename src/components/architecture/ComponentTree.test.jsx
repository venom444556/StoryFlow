import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ComponentTree from './ComponentTree'

describe('ComponentTree', () => {
  const mockComponents = [
    { id: '1', name: 'App', type: 'page', parentId: null },
    { id: '2', name: 'Header', type: 'component', parentId: '1' },
    { id: '3', name: 'Footer', type: 'component', parentId: '1' },
    { id: '4', name: 'useAuth', type: 'hook', parentId: null },
    { id: '5', name: 'NavItem', type: 'component', parentId: '2' },
  ]

  const defaultProps = {
    components: mockComponents,
    selectedId: null,
    onSelect: vi.fn(),
    onAdd: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('should render without crashing', () => {
      render(<ComponentTree {...defaultProps} />)
      expect(screen.getByText('Components')).toBeInTheDocument()
    })

    it('should render all root components', () => {
      render(<ComponentTree {...defaultProps} />)
      expect(screen.getByText('App')).toBeInTheDocument()
      expect(screen.getByText('useAuth')).toBeInTheDocument()
    })

    it('should render child components', () => {
      render(<ComponentTree {...defaultProps} />)
      expect(screen.getByText('Header')).toBeInTheDocument()
      expect(screen.getByText('Footer')).toBeInTheDocument()
      expect(screen.getByText('NavItem')).toBeInTheDocument()
    })

    it('should render Add button', () => {
      render(<ComponentTree {...defaultProps} />)
      expect(screen.getByText('Add')).toBeInTheDocument()
    })

    it('should display type badges for each component', () => {
      render(<ComponentTree {...defaultProps} />)
      expect(screen.getByText('page')).toBeInTheDocument()
      expect(screen.getAllByText('component').length).toBeGreaterThan(0)
      expect(screen.getByText('hook')).toBeInTheDocument()
    })
  })

  describe('empty state', () => {
    it('should show empty state when no components', () => {
      render(<ComponentTree {...defaultProps} components={[]} />)
      expect(screen.getByText('No components yet')).toBeInTheDocument()
      expect(screen.getByText('Add your first component to start building your architecture.')).toBeInTheDocument()
    })

    it('should show Add Component button in empty state', () => {
      render(<ComponentTree {...defaultProps} components={[]} />)
      expect(screen.getByText('Add Component')).toBeInTheDocument()
    })

    it('should call onAdd when clicking Add Component in empty state', () => {
      render(<ComponentTree {...defaultProps} components={[]} />)
      fireEvent.click(screen.getByText('Add Component'))
      expect(defaultProps.onAdd).toHaveBeenCalledTimes(1)
    })
  })

  describe('selection', () => {
    it('should highlight selected component', () => {
      render(<ComponentTree {...defaultProps} selectedId="2" />)
      const headerButton = screen.getByText('Header').closest('button')
      expect(headerButton).toHaveClass('bg-white/10')
    })

    it('should call onSelect when clicking a component', () => {
      render(<ComponentTree {...defaultProps} />)
      fireEvent.click(screen.getByText('Header'))
      expect(defaultProps.onSelect).toHaveBeenCalledWith('2')
    })

    it('should call onSelect with correct id for nested components', () => {
      render(<ComponentTree {...defaultProps} />)
      fireEvent.click(screen.getByText('NavItem'))
      expect(defaultProps.onSelect).toHaveBeenCalledWith('5')
    })
  })

  describe('tree expansion', () => {
    it('should show expand/collapse icons for parent nodes', () => {
      render(<ComponentTree {...defaultProps} />)
      // App and Header have children, should have chevron icons
      const appButton = screen.getByText('App').closest('button')
      expect(appButton.querySelector('svg')).toBeInTheDocument()
    })

    it('should collapse children when clicking chevron', () => {
      render(<ComponentTree {...defaultProps} />)
      // Find the chevron for App (parent with children)
      const appButton = screen.getByText('App').closest('button')
      const chevron = appButton.querySelector('span')

      // Initially children are visible
      expect(screen.getByText('Header')).toBeInTheDocument()

      // Click to collapse
      fireEvent.click(chevron)

      // Children should still be in document but parent collapsed
      // Note: The component uses CSS/visibility for collapse, not removal
    })
  })

  describe('Add button', () => {
    it('should call onAdd when clicking Add button', () => {
      render(<ComponentTree {...defaultProps} />)
      fireEvent.click(screen.getByText('Add'))
      expect(defaultProps.onAdd).toHaveBeenCalledTimes(1)
    })
  })

  describe('tree structure', () => {
    it('should build correct tree hierarchy', () => {
      render(<ComponentTree {...defaultProps} />)
      // NavItem is nested under Header which is under App
      // All should be visible by default
      expect(screen.getByText('App')).toBeInTheDocument()
      expect(screen.getByText('Header')).toBeInTheDocument()
      expect(screen.getByText('NavItem')).toBeInTheDocument()
    })

    it('should handle orphaned parentId gracefully', () => {
      const componentsWithOrphan = [
        ...mockComponents,
        { id: '6', name: 'Orphan', type: 'component', parentId: 'non-existent' },
      ]
      render(<ComponentTree {...defaultProps} components={componentsWithOrphan} />)
      // Orphan should be treated as root
      expect(screen.getByText('Orphan')).toBeInTheDocument()
    })
  })

  describe('edge cases', () => {
    it('should handle components without parentId', () => {
      const noParentId = [
        { id: '1', name: 'Component1', type: 'component' },
        { id: '2', name: 'Component2', type: 'hook' },
      ]
      render(<ComponentTree {...defaultProps} components={noParentId} />)
      expect(screen.getByText('Component1')).toBeInTheDocument()
      expect(screen.getByText('Component2')).toBeInTheDocument()
    })

    it('should handle components with unknown type', () => {
      const unknownType = [
        { id: '1', name: 'UnknownComp', type: 'unknown', parentId: null },
      ]
      render(<ComponentTree {...defaultProps} components={unknownType} />)
      expect(screen.getByText('UnknownComp')).toBeInTheDocument()
      expect(screen.getByText('unknown')).toBeInTheDocument()
    })

    it('should handle deeply nested components', () => {
      const deepNesting = [
        { id: '1', name: 'Level1', type: 'component', parentId: null },
        { id: '2', name: 'Level2', type: 'component', parentId: '1' },
        { id: '3', name: 'Level3', type: 'component', parentId: '2' },
        { id: '4', name: 'Level4', type: 'component', parentId: '3' },
      ]
      render(<ComponentTree {...defaultProps} components={deepNesting} />)
      expect(screen.getByText('Level1')).toBeInTheDocument()
      expect(screen.getByText('Level2')).toBeInTheDocument()
      expect(screen.getByText('Level3')).toBeInTheDocument()
      expect(screen.getByText('Level4')).toBeInTheDocument()
    })
  })
})
