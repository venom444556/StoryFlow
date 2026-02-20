import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import GradientBackground from './GradientBackground'

describe('GradientBackground', () => {
  it('renders without crashing', () => {
    render(<GradientBackground />)
    // Component renders a container div
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

  it('renders orb-1 with correct classes', () => {
    render(<GradientBackground />)
    const orb1 = document.querySelector('.orb-1')
    expect(orb1).toBeInTheDocument()
    expect(orb1).toHaveClass('absolute')
    expect(orb1).toHaveClass('-top-40')
    expect(orb1).toHaveClass('-right-40')
  })

  it('renders orb-2 with correct classes', () => {
    render(<GradientBackground />)
    const orb2 = document.querySelector('.orb-2')
    expect(orb2).toBeInTheDocument()
    expect(orb2).toHaveClass('absolute')
    expect(orb2).toHaveClass('top-1/2')
    expect(orb2).toHaveClass('-left-40')
  })

  it('renders orb-3 with correct classes', () => {
    render(<GradientBackground />)
    const orb3 = document.querySelector('.orb-3')
    expect(orb3).toBeInTheDocument()
    expect(orb3).toHaveClass('absolute')
    expect(orb3).toHaveClass('-bottom-40')
    expect(orb3).toHaveClass('right-1/3')
  })

  it('has overflow-hidden on container', () => {
    render(<GradientBackground />)
    const container = document.querySelector('.fixed.inset-0')
    expect(container).toHaveClass('overflow-hidden')
  })
})
