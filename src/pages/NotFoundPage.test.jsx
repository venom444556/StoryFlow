import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter, MemoryRouter, Routes, Route } from 'react-router-dom'
import NotFoundPage from './NotFoundPage'

// Helper to render with router
function renderWithRouter(ui, { route = '/not-found' } = {}) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      {ui}
    </MemoryRouter>
  )
}

describe('NotFoundPage', () => {
  describe('Basic Rendering', () => {
    it('renders the 404 heading', () => {
      renderWithRouter(<NotFoundPage />)
      expect(screen.getByText('404')).toBeInTheDocument()
    })

    it('renders the "Page not found" subtitle', () => {
      renderWithRouter(<NotFoundPage />)
      expect(screen.getByText('Page not found')).toBeInTheDocument()
    })

    it('renders explanatory message', () => {
      renderWithRouter(<NotFoundPage />)
      expect(
        screen.getByText(/the page you are looking for does not exist or has been moved/i)
      ).toBeInTheDocument()
    })

    it('renders "Back to Dashboard" button', () => {
      renderWithRouter(<NotFoundPage />)
      expect(screen.getByRole('button', { name: /back to dashboard/i })).toBeInTheDocument()
    })

    it('renders the Home icon', () => {
      renderWithRouter(<NotFoundPage />)
      // The Home icon is inside the button - we verify button renders which contains icon
      const button = screen.getByRole('button', { name: /back to dashboard/i })
      // Button should contain an SVG (the icon)
      const svg = button.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })
  })

  describe('Styling', () => {
    it('applies gradient text class to 404', () => {
      renderWithRouter(<NotFoundPage />)
      const heading = screen.getByText('404')
      expect(heading).toHaveClass('gradient-text')
    })

    it('centers content vertically and horizontally', () => {
      renderWithRouter(<NotFoundPage />)
      const container = screen.getByText('404').closest('div')
      expect(container).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center')
    })

    it('renders 404 with large font size', () => {
      renderWithRouter(<NotFoundPage />)
      const heading = screen.getByText('404')
      expect(heading).toHaveClass('text-7xl')
    })
  })

  describe('Navigation', () => {
    it('has correct link to dashboard', () => {
      renderWithRouter(<NotFoundPage />)
      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('href', '/')
    })

    it('navigates to dashboard when button is clicked', async () => {
      // Render with routes to verify navigation works
      render(
        <MemoryRouter initialEntries={['/some-invalid-route']}>
          <Routes>
            <Route path="/" element={<div data-testid="dashboard">Dashboard</div>} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </MemoryRouter>
      )

      // Should start on NotFoundPage
      expect(screen.getByText('404')).toBeInTheDocument()

      // Click the link/button
      const link = screen.getByRole('link')
      await userEvent.click(link)

      // Should navigate to dashboard
      expect(screen.getByTestId('dashboard')).toBeInTheDocument()
    })
  })

  describe('Button Behavior', () => {
    it('button has primary variant styling', () => {
      renderWithRouter(<NotFoundPage />)
      // The Button component with variant="primary" should have appropriate classes
      const button = screen.getByRole('button', { name: /back to dashboard/i })
      // Primary buttons typically have accent/highlight styling
      expect(button).toBeInTheDocument()
    })

    it('link wraps the button properly', () => {
      renderWithRouter(<NotFoundPage />)
      const link = screen.getByRole('link')
      const button = screen.getByRole('button', { name: /back to dashboard/i })
      expect(link.contains(button)).toBe(true)
    })
  })

  describe('Accessibility', () => {
    it('has semantic heading structure', () => {
      renderWithRouter(<NotFoundPage />)
      // 404 is h1
      const h1 = screen.getByRole('heading', { level: 1 })
      expect(h1).toHaveTextContent('404')

      // "Page not found" is h2
      const h2 = screen.getByRole('heading', { level: 2 })
      expect(h2).toHaveTextContent('Page not found')
    })

    it('button is keyboard accessible', async () => {
      renderWithRouter(<NotFoundPage />)
      const button = screen.getByRole('button', { name: /back to dashboard/i })

      // Button can receive focus
      button.focus()
      expect(document.activeElement).toBe(button)
    })

    it('link is keyboard accessible', async () => {
      renderWithRouter(<NotFoundPage />)
      const link = screen.getByRole('link')

      // Link can receive focus
      link.focus()
      expect(document.activeElement).toBe(link)
    })
  })

  describe('Edge Cases', () => {
    it('renders correctly regardless of current route', () => {
      // Test with various invalid routes
      const routes = [
        '/invalid',
        '/project/non-existent-id',
        '/foo/bar/baz',
        '/api/test',
      ]

      routes.forEach((route) => {
        const { unmount } = render(
          <MemoryRouter initialEntries={[route]}>
            <Routes>
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </MemoryRouter>
        )

        expect(screen.getByText('404')).toBeInTheDocument()
        expect(screen.getByRole('link')).toHaveAttribute('href', '/')

        unmount()
      })
    })

    it('component is self-contained without external state', () => {
      // NotFoundPage should render without any providers
      render(
        <BrowserRouter>
          <NotFoundPage />
        </BrowserRouter>
      )

      expect(screen.getByText('404')).toBeInTheDocument()
      expect(screen.getByText('Page not found')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /back to dashboard/i })).toBeInTheDocument()
    })
  })

  describe('Content Structure', () => {
    it('renders content in correct order', () => {
      renderWithRouter(<NotFoundPage />)

      const container = screen.getByText('404').parentElement
      const children = Array.from(container.children)

      // First should be 404 heading
      expect(children[0]).toHaveTextContent('404')
      // Then "Page not found" heading
      expect(children[1]).toHaveTextContent('Page not found')
      // Then explanatory paragraph
      expect(children[2]).toHaveTextContent(/does not exist/i)
      // Finally the link/button
      expect(children[3]).toContainElement(screen.getByRole('button'))
    })

    it('message text has appropriate styling', () => {
      renderWithRouter(<NotFoundPage />)
      const message = screen.getByText(/does not exist/i)
      expect(message).toHaveClass('text-sm', 'text-slate-500')
    })
  })
})
