import { Component } from 'react'
import { AlertTriangle, RefreshCw, Home, ChevronDown, ChevronUp } from 'lucide-react'

/**
 * Error Boundary component that catches JavaScript errors in child components,
 * logs them, and displays a fallback UI instead of crashing the entire app.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo })

    // Log error to console for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    })
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  toggleDetails = () => {
    this.setState((prev) => ({ showDetails: !prev.showDetails }))
  }

  render() {
    if (this.state.hasError) {
      const { error, errorInfo, showDetails } = this.state

      return (
        <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg-subtle)] p-4">
          <div className="glass-card max-w-lg w-full p-8">
            {/* Icon */}
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20">
              <AlertTriangle size={32} className="text-red-400" />
            </div>

            {/* Title */}
            <h1 className="mb-2 text-center text-xl font-semibold text-[var(--color-fg-default)]">
              Something went wrong
            </h1>

            {/* Description */}
            <p className="mb-6 text-center text-sm text-[var(--color-fg-muted)]">
              An unexpected error occurred. Your data is safe — try refreshing the page or going back to the dashboard.
            </p>

            {/* Error message preview */}
            {error && (
              <div className="mb-6 rounded-lg bg-red-500/10 border border-red-500/20 p-3">
                <p className="font-mono text-xs text-red-300 break-all">
                  {error.toString()}
                </p>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={this.handleReset}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-accent-primary px-4 py-2.5 text-sm font-medium text-[var(--color-fg-default)] transition-colors hover:bg-accent-primary/80"
              >
                <RefreshCw size={16} />
                Try Again
              </button>
              <button
                onClick={this.handleGoHome}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[var(--color-bg-glass-hover)] px-4 py-2.5 text-sm font-medium text-[var(--color-fg-default)] transition-colors hover:bg-[var(--color-bg-muted)]"
              >
                <Home size={16} />
                Go to Dashboard
              </button>
            </div>

            {/* Expandable error details */}
            {errorInfo && (
              <div className="mt-6">
                <button
                  onClick={this.toggleDetails}
                  className="flex w-full items-center justify-between rounded-lg bg-[var(--color-bg-glass)] px-3 py-2 text-xs text-[var(--color-fg-muted)] hover:bg-[var(--color-bg-glass-hover)] transition-colors"
                >
                  <span>Technical Details</span>
                  {showDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                {showDetails && (
                  <div className="mt-2 max-h-48 overflow-auto rounded-lg bg-black/30 p-3">
                    <pre className="whitespace-pre-wrap font-mono text-xs text-[var(--color-fg-subtle)]">
                      {errorInfo.componentStack}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
