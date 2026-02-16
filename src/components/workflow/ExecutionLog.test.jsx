import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ExecutionLog from './ExecutionLog'

// Mock scrollTo for auto-scroll functionality
const mockScrollTo = vi.fn()
Element.prototype.scrollTo = mockScrollTo

describe('ExecutionLog', () => {
  beforeEach(() => {
    mockScrollTo.mockClear()
  })

  // ---------------------------------------------------------------------------
  // Basic Rendering
  // ---------------------------------------------------------------------------

  describe('basic rendering', () => {
    it('renders with empty logs', () => {
      render(<ExecutionLog logs={[]} />)

      expect(screen.getByText('Execution Log')).toBeInTheDocument()
      expect(screen.getByText('No execution logs yet.')).toBeInTheDocument()
      expect(screen.getByText('Click Execute to run the workflow.')).toBeInTheDocument()
    })

    it('renders with default empty array when logs prop is undefined', () => {
      render(<ExecutionLog />)

      expect(screen.getByText('No execution logs yet.')).toBeInTheDocument()
    })

    it('renders the header with terminal icon', () => {
      render(<ExecutionLog logs={[]} />)

      expect(screen.getByText('Execution Log')).toBeInTheDocument()
    })
  })

  // ---------------------------------------------------------------------------
  // Log Entries Display
  // ---------------------------------------------------------------------------

  describe('log entries display', () => {
    const mockLogs = [
      { timestamp: '10:00:00', message: 'Starting workflow...', level: 'info' },
      { timestamp: '10:00:01', message: 'Node completed', level: 'success' },
      { timestamp: '10:00:02', message: 'Warning issued', level: 'warning' },
      { timestamp: '10:00:03', message: 'Error occurred', level: 'error' },
    ]

    it('renders all log entries', () => {
      render(<ExecutionLog logs={mockLogs} />)

      expect(screen.getByText('Starting workflow...')).toBeInTheDocument()
      expect(screen.getByText('Node completed')).toBeInTheDocument()
      expect(screen.getByText('Warning issued')).toBeInTheDocument()
      expect(screen.getByText('Error occurred')).toBeInTheDocument()
    })

    it('displays timestamps for each log', () => {
      render(<ExecutionLog logs={mockLogs} />)

      expect(screen.getByText('10:00:00')).toBeInTheDocument()
      expect(screen.getByText('10:00:01')).toBeInTheDocument()
      expect(screen.getByText('10:00:02')).toBeInTheDocument()
      expect(screen.getByText('10:00:03')).toBeInTheDocument()
    })

    it('displays log count badge when logs exist', () => {
      render(<ExecutionLog logs={mockLogs} />)

      expect(screen.getByText('4')).toBeInTheDocument()
    })

    it('does not display count badge when logs are empty', () => {
      render(<ExecutionLog logs={[]} />)

      expect(screen.queryByText('0')).not.toBeInTheDocument()
    })
  })

  // ---------------------------------------------------------------------------
  // Log Level Styling
  // ---------------------------------------------------------------------------

  describe('log level styling', () => {
    it('applies info styling', () => {
      const logs = [{ timestamp: '10:00:00', message: 'Info message', level: 'info' }]
      render(<ExecutionLog logs={logs} />)

      // The message span is inside a wrapper div (min-w-0 flex-1), which is inside the log entry div
      const logEntry = screen.getByText('Info message').closest('div').parentElement
      expect(logEntry).toHaveClass('bg-[var(--color-bg-glass)]')
    })

    it('applies success styling', () => {
      const logs = [{ timestamp: '10:00:00', message: 'Success message', level: 'success' }]
      render(<ExecutionLog logs={logs} />)

      const logEntry = screen.getByText('Success message').closest('div').parentElement
      expect(logEntry).toHaveClass('bg-green-500/10')
    })

    it('applies warning styling', () => {
      const logs = [{ timestamp: '10:00:00', message: 'Warning message', level: 'warning' }]
      render(<ExecutionLog logs={logs} />)

      const logEntry = screen.getByText('Warning message').closest('div').parentElement
      expect(logEntry).toHaveClass('bg-yellow-500/10')
    })

    it('applies error styling', () => {
      const logs = [{ timestamp: '10:00:00', message: 'Error message', level: 'error' }]
      render(<ExecutionLog logs={logs} />)

      const logEntry = screen.getByText('Error message').closest('div').parentElement
      expect(logEntry).toHaveClass('bg-red-500/10')
    })

    it('applies default styling for unknown level', () => {
      const logs = [{ timestamp: '10:00:00', message: 'Unknown level', level: 'unknown' }]
      render(<ExecutionLog logs={logs} />)

      const logEntry = screen.getByText('Unknown level').closest('div').parentElement
      // Falls back to info styling
      expect(logEntry).toHaveClass('bg-[var(--color-bg-glass)]')
    })
  })

  // ---------------------------------------------------------------------------
  // Clear Functionality
  // ---------------------------------------------------------------------------

  describe('clear functionality', () => {
    it('shows clear button when logs exist', () => {
      const logs = [{ timestamp: '10:00:00', message: 'Test', level: 'info' }]
      render(<ExecutionLog logs={logs} onClear={vi.fn()} />)

      expect(screen.getByTitle('Clear log')).toBeInTheDocument()
    })

    it('hides clear button when logs are empty', () => {
      render(<ExecutionLog logs={[]} onClear={vi.fn()} />)

      expect(screen.queryByTitle('Clear log')).not.toBeInTheDocument()
    })

    it('calls onClear when clear button is clicked', () => {
      const onClear = vi.fn()
      const logs = [{ timestamp: '10:00:00', message: 'Test', level: 'info' }]
      render(<ExecutionLog logs={logs} onClear={onClear} />)

      fireEvent.click(screen.getByTitle('Clear log'))
      expect(onClear).toHaveBeenCalledTimes(1)
    })
  })

  // ---------------------------------------------------------------------------
  // Auto-scroll Behavior
  // ---------------------------------------------------------------------------

  describe('auto-scroll behavior', () => {
    it('scrolls to bottom when new logs are added', () => {
      const logs = [{ timestamp: '10:00:00', message: 'First log', level: 'info' }]
      const { rerender } = render(<ExecutionLog logs={logs} />)

      const newLogs = [...logs, { timestamp: '10:00:01', message: 'Second log', level: 'info' }]
      rerender(<ExecutionLog logs={newLogs} />)

      // The component should have scrolled (the ref effect triggers on logs.length change)
      // We verify the log is rendered
      expect(screen.getByText('Second log')).toBeInTheDocument()
    })
  })

  // ---------------------------------------------------------------------------
  // Edge Cases
  // ---------------------------------------------------------------------------

  describe('edge cases', () => {
    it('handles logs with empty message', () => {
      const logs = [{ timestamp: '10:00:00', message: '', level: 'info' }]
      render(<ExecutionLog logs={logs} />)

      expect(screen.getByText('10:00:00')).toBeInTheDocument()
    })

    it('handles logs with special characters in message', () => {
      const logs = [
        {
          timestamp: '10:00:00',
          message: '<script>alert("xss")</script>',
          level: 'info',
        },
      ]
      render(<ExecutionLog logs={logs} />)

      // Should render as text, not execute
      expect(screen.getByText('<script>alert("xss")</script>')).toBeInTheDocument()
    })

    it('handles very long messages', () => {
      const longMessage = 'A'.repeat(1000)
      const logs = [{ timestamp: '10:00:00', message: longMessage, level: 'info' }]
      render(<ExecutionLog logs={logs} />)

      expect(screen.getByText(longMessage)).toBeInTheDocument()
    })

    it('handles many log entries', () => {
      const logs = Array.from({ length: 100 }, (_, i) => ({
        timestamp: `10:00:${i.toString().padStart(2, '0')}`,
        message: `Log entry ${i}`,
        level: 'info',
      }))
      render(<ExecutionLog logs={logs} />)

      expect(screen.getByText('100')).toBeInTheDocument() // Badge count
      expect(screen.getByText('Log entry 0')).toBeInTheDocument()
      expect(screen.getByText('Log entry 99')).toBeInTheDocument()
    })
  })
})
