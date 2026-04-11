import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ImpactBadge from './ImpactBadge'

function makeReport(overrides = {}) {
  return {
    target: { name: 'auth.verify', file: 'server/auth.js' },
    blastRadius: 'LOW',
    callsiteCount: 3,
    affectedClusterIds: [],
    affectedServiceCount: 1,
    topCallers: [],
    rationale: '3 callsites within a single service — LOW blast radius.',
    ...overrides,
  }
}

describe('ImpactBadge', () => {
  it('renders nothing when report is null', () => {
    const { container } = render(<ImpactBadge report={null} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders nothing when report is undefined', () => {
    const { container } = render(<ImpactBadge report={undefined} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders with green color for LOW blast radius', () => {
    render(<ImpactBadge report={makeReport({ blastRadius: 'LOW', callsiteCount: 3 })} />)
    const badge = screen.getByTestId('impact-badge')
    expect(badge).toBeTruthy()
    expect(badge.getAttribute('data-blast-radius')).toBe('LOW')
    expect(badge.className).toContain('badge-green-bg')
    expect(badge.textContent).toContain('3 callsites')
    expect(screen.queryByTestId('impact-badge-service-warning')).toBeNull()
  })

  it('renders with red color for HIGH blast radius and shows service warning', () => {
    render(
      <ImpactBadge
        report={makeReport({
          blastRadius: 'HIGH',
          callsiteCount: 24,
          affectedServiceCount: 3,
          rationale: '24 callsites across 3 services — HIGH blast radius.',
        })}
      />
    )
    const badge = screen.getByTestId('impact-badge')
    expect(badge.getAttribute('data-blast-radius')).toBe('HIGH')
    expect(badge.className).toContain('badge-red-bg')
    expect(badge.textContent).toContain('24 callsites')
    const warn = screen.getByTestId('impact-badge-service-warning')
    expect(warn.textContent).toContain('3 services')
  })

  it('CRITICAL reports render with extra emphasis indicator', () => {
    render(
      <ImpactBadge
        report={makeReport({
          blastRadius: 'CRITICAL',
          callsiteCount: 80,
          affectedServiceCount: 5,
        })}
      />
    )
    const badge = screen.getByTestId('impact-badge')
    expect(badge.getAttribute('data-blast-radius')).toBe('CRITICAL')
    expect(badge.getAttribute('data-emphasis')).toBe('true')
    expect(badge.className).toContain('border-2')
  })

  it('tooltip (title attribute) contains the rationale string', () => {
    const report = makeReport({
      blastRadius: 'MEDIUM',
      callsiteCount: 12,
      rationale: '12 callsites within a single service — MEDIUM blast radius.',
    })
    render(<ImpactBadge report={report} />)
    const badge = screen.getByTestId('impact-badge')
    expect(badge.getAttribute('title')).toBe(report.rationale)
  })

  it('service warning does not appear for LOW/MEDIUM even with >1 services', () => {
    render(
      <ImpactBadge
        report={makeReport({
          blastRadius: 'MEDIUM',
          callsiteCount: 10,
          affectedServiceCount: 2,
        })}
      />
    )
    expect(screen.queryByTestId('impact-badge-service-warning')).toBeNull()
  })

  it('service warning does not appear for HIGH when only 1 service affected', () => {
    render(
      <ImpactBadge
        report={makeReport({
          blastRadius: 'HIGH',
          callsiteCount: 25,
          affectedServiceCount: 1,
        })}
      />
    )
    expect(screen.queryByTestId('impact-badge-service-warning')).toBeNull()
  })
})
