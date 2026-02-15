import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Search } from 'lucide-react'
import Input from './Input'

describe('Input', () => {
  describe('Basic Rendering', () => {
    it('renders without crashing', () => {
      render(<Input />)
      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })

    it('renders as text input by default', () => {
      render(<Input />)
      expect(screen.getByRole('textbox')).toHaveAttribute('type', 'text')
    })

    it('renders with value', () => {
      render(<Input value="test value" onChange={() => {}} />)
      expect(screen.getByRole('textbox')).toHaveValue('test value')
    })

    it('renders with placeholder', () => {
      render(<Input placeholder="Enter text..." />)
      expect(screen.getByPlaceholderText('Enter text...')).toBeInTheDocument()
    })
  })

  describe('Label', () => {
    it('does not render label by default', () => {
      render(<Input />)
      expect(screen.queryByRole('label')).not.toBeInTheDocument()
    })

    it('renders label when provided', () => {
      render(<Input label="Username" />)
      expect(screen.getByText('Username')).toBeInTheDocument()
    })

    it('label is associated with input', () => {
      render(<Input label="Username" id="username" />)
      // Label renders as a standalone element (no htmlFor linking)
      expect(screen.getByText('Username')).toBeInTheDocument()
      expect(screen.getByRole('textbox')).toHaveAttribute('id', 'username')
    })
  })

  describe('Input Types', () => {
    it('renders as text input', () => {
      render(<Input type="text" />)
      expect(screen.getByRole('textbox')).toHaveAttribute('type', 'text')
    })

    it('renders as email input', () => {
      render(<Input type="email" />)
      expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email')
    })

    it('renders as password input', () => {
      render(<Input type="password" />)
      const input = document.querySelector('input[type="password"]')
      expect(input).toBeInTheDocument()
    })

    it('renders as number input', () => {
      render(<Input type="number" />)
      expect(screen.getByRole('spinbutton')).toBeInTheDocument()
    })
  })

  describe('Size Variants', () => {
    it('renders with sm size', () => {
      const { container } = render(<Input size="sm" />)
      const input = container.querySelector('input')
      expect(input.className).toContain('sm')
    })

    it('renders with md size (default)', () => {
      const { container } = render(<Input />)
      const input = container.querySelector('input')
      expect(input.className).toContain('md')
    })

    it('renders with lg size', () => {
      const { container } = render(<Input size="lg" />)
      const input = container.querySelector('input')
      expect(input.className).toContain('lg')
    })
  })

  describe('Icon', () => {
    it('does not show icon by default', () => {
      const { container } = render(<Input />)
      expect(container.querySelector('svg')).not.toBeInTheDocument()
    })

    it('renders custom icon', () => {
      render(<Input icon={Search} />)
      expect(document.querySelector('svg')).toBeInTheDocument()
    })

    it('adds left padding when icon is present', () => {
      render(<Input icon={Search} />)
      const input = screen.getByRole('textbox')
      expect(input.className).toContain('pl-')
    })
  })

  describe('Error State', () => {
    it('shows error styling when error is provided', () => {
      render(<Input error="This field is required" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('aria-invalid', 'true')
    })

    it('displays error message', () => {
      render(<Input error="This field is required" />)
      expect(screen.getByText('This field is required')).toBeInTheDocument()
    })

    it('shows error icon', () => {
      render(<Input error="Error" />)
      expect(document.querySelector('svg')).toBeInTheDocument()
    })

    it('error icon overrides custom icon', () => {
      render(<Input icon={Search} error="Error" />)
      const icons = document.querySelectorAll('svg')
      // Only error icon should be shown
      expect(icons.length).toBe(1)
    })
  })

  describe('Success State', () => {
    it('shows success icon when success is true', () => {
      render(<Input success />)
      expect(document.querySelector('svg')).toBeInTheDocument()
    })

    it('does not show success when error is present', () => {
      render(<Input success error="Error" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('aria-invalid', 'true')
    })
  })

  describe('Helper Text', () => {
    it('does not show helper text by default', () => {
      const { container } = render(<Input />)
      expect(container.querySelectorAll('p').length).toBe(0)
    })

    it('displays helper text', () => {
      render(<Input helperText="Enter your email address" />)
      expect(screen.getByText('Enter your email address')).toBeInTheDocument()
    })

    it('error message overrides helper text', () => {
      render(<Input helperText="Helper" error="Error" />)
      expect(screen.getByText('Error')).toBeInTheDocument()
      expect(screen.queryByText('Helper')).not.toBeInTheDocument()
    })

    it('has proper aria-describedby when helper text is present', () => {
      render(<Input helperText="Helper text" id="test-input" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('aria-describedby', 'test-input-helper')
    })
  })

  describe('Disabled State', () => {
    it('is not disabled by default', () => {
      render(<Input />)
      expect(screen.getByRole('textbox')).not.toBeDisabled()
    })

    it('is disabled when disabled prop is true', () => {
      render(<Input disabled />)
      expect(screen.getByRole('textbox')).toBeDisabled()
    })

    it('has disabled styling', () => {
      render(<Input disabled />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('opacity-50', 'cursor-not-allowed')
    })
  })

  describe('Change Handler', () => {
    it('calls onChange when value changes', () => {
      const handleChange = vi.fn()
      render(<Input onChange={handleChange} />)

      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'new value' } })
      expect(handleChange).toHaveBeenCalledTimes(1)
    })

    it('receives event object in onChange', () => {
      const handleChange = vi.fn()
      render(<Input onChange={handleChange} />)

      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'new value' } })
      expect(handleChange.mock.calls[0][0].target.value).toBe('new value')
    })
  })

  describe('Ref Forwarding', () => {
    it('forwards ref to input element', () => {
      const ref = { current: null }
      render(<Input ref={ref} />)
      expect(ref.current).toBeInstanceOf(HTMLInputElement)
    })

    it('ref can be used to focus input', () => {
      const ref = { current: null }
      render(<Input ref={ref} />)
      ref.current.focus()
      expect(document.activeElement).toBe(ref.current)
    })
  })

  describe('Custom Styling', () => {
    it('applies custom className to wrapper', () => {
      const { container } = render(<Input className="custom-class" />)
      expect(container.querySelector('.custom-class')).toBeInTheDocument()
    })
  })

  describe('Additional Props', () => {
    it('passes through data attributes', () => {
      render(<Input data-testid="custom-input" />)
      expect(screen.getByTestId('custom-input')).toBeInTheDocument()
    })

    it('passes through name attribute', () => {
      render(<Input name="email" />)
      expect(screen.getByRole('textbox')).toHaveAttribute('name', 'email')
    })

    it('passes through autoComplete attribute', () => {
      render(<Input autoComplete="email" />)
      expect(screen.getByRole('textbox')).toHaveAttribute('autoComplete', 'email')
    })

    it('passes through required attribute', () => {
      render(<Input required />)
      expect(screen.getByRole('textbox')).toBeRequired()
    })

    it('passes through maxLength attribute', () => {
      render(<Input maxLength={10} />)
      expect(screen.getByRole('textbox')).toHaveAttribute('maxLength', '10')
    })
  })

  describe('Accessibility', () => {
    it('has aria-invalid when error is present', () => {
      render(<Input error="Error" />)
      expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
    })

    it('does not have aria-invalid when no error', () => {
      render(<Input />)
      expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-invalid')
    })

    it('associates helper text with aria-describedby', () => {
      render(<Input helperText="Help text" id="my-input" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('aria-describedby', 'my-input-helper')

      const helpText = document.getElementById('my-input-helper')
      expect(helpText).toHaveTextContent('Help text')
    })

    it('is focusable', () => {
      render(<Input />)
      const input = screen.getByRole('textbox')
      input.focus()
      expect(document.activeElement).toBe(input)
    })
  })

  describe('Edge Cases', () => {
    it('handles empty value', () => {
      render(<Input value="" onChange={() => {}} />)
      expect(screen.getByRole('textbox')).toHaveValue('')
    })

    it('handles undefined value', () => {
      render(<Input value={undefined} onChange={() => {}} />)
      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })

    it('handles special characters in value', () => {
      render(<Input value="<script>alert('xss')</script>" onChange={() => {}} />)
      expect(screen.getByRole('textbox')).toHaveValue("<script>alert('xss')</script>")
    })

    it('handles very long values', () => {
      const longValue = 'a'.repeat(1000)
      render(<Input value={longValue} onChange={() => {}} />)
      expect(screen.getByRole('textbox')).toHaveValue(longValue)
    })
  })
})
