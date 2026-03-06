import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import GradientBackground from './GradientBackground'

describe('GradientBackground', () => {
  it('renders without crashing', () => {
    render(<GradientBackground />)
    const container = document.querySelector('.fixed.inset-0')
    expect(container).toBeInTheDocument()
  })

  it('renders three gradient orbs', () => {
    render(<GradientBackground />)
    const orbs = document.querySelectorAll('.rounded-full')
    expect(orbs).toHaveLength(3)
  })

  it('has pointer-events-none to allow clicking through', () => {
    render(<GradientBackground />)
    const container = document.querySelector('.fixed.inset-0')
    expect(container).toHaveClass('pointer-events-none')
  })

  it('renders primary glow orb with correct classes', () => {
    render(<GradientBackground />)
    const orb = document.querySelector('.ambient-glow')
    expect(orb).toBeInTheDocument()
    expect(orb).toHaveClass('absolute')
    expect(orb).toHaveClass('rounded-full')
  })

  it('renders secondary glow orb', () => {
    const { container } = render(<GradientBackground />)
    const orbs = container.querySelectorAll('.rounded-full')
    expect(orbs[1]).toBeInTheDocument()
    expect(orbs[1]).toHaveClass('absolute')
  })

  it('has overflow-hidden on container', () => {
    render(<GradientBackground />)
    const container = document.querySelector('.fixed.inset-0')
    expect(container).toHaveClass('overflow-hidden')
  })

  it('renders subtle noise texture SVG', () => {
    render(<GradientBackground />)
    const svg = document.querySelector('svg')
    expect(svg).toBeInTheDocument()
    expect(svg).toHaveAttribute('aria-hidden', 'true')
  })
})
