import { motion } from 'framer-motion'
import { Circle, AlertTriangle } from 'lucide-react'

/**
 * @typedef {import('../../../../modules/code-intel/CONTRACTS.md').ImpactReport} ImpactReport
 */

/**
 * Map a blast radius to a badge variant. Returns null if report is not
 * actionable (no report, or LOW-but-unclassified).
 *
 * @param {string} blastRadius
 * @returns {{variant: string, emphasis: boolean}}
 */
function variantForBlastRadius(blastRadius) {
  switch (blastRadius) {
    case 'CRITICAL':
      return { variant: 'red', emphasis: true }
    case 'HIGH':
      return { variant: 'red', emphasis: false }
    case 'MEDIUM':
      return { variant: 'yellow', emphasis: false }
    case 'LOW':
    default:
      return { variant: 'green', emphasis: false }
  }
}

const BG_CLASSES = {
  red: 'bg-[var(--badge-red-bg)] text-[var(--badge-red-fg)] border-[var(--badge-red-border)]',
  yellow:
    'bg-[var(--badge-yellow-bg)] text-[var(--badge-yellow-fg)] border-[var(--badge-yellow-border)]',
  green:
    'bg-[var(--badge-green-bg)] text-[var(--badge-green-fg)] border-[var(--badge-green-border)]',
}

const DOT_CLASSES = {
  red: 'text-[var(--badge-red-fg)]',
  yellow: 'text-[var(--badge-yellow-fg)]',
  green: 'text-[var(--badge-green-fg)]',
}

/**
 * A small color-coded badge summarising the code-intelligence impact report
 * for an issue. Renders nothing at all when no report is available.
 *
 * @param {{ report: ImpactReport|null }} props
 */
export default function ImpactBadge({ report }) {
  if (!report) return null

  const { blastRadius, callsiteCount, affectedServiceCount, rationale } = report
  const { variant, emphasis } = variantForBlastRadius(blastRadius)

  const showServiceWarning =
    (blastRadius === 'HIGH' || blastRadius === 'CRITICAL') && affectedServiceCount > 1

  const baseClasses = [
    'inline-flex items-center gap-1 rounded-full border px-1.5 py-px text-[10px] font-medium leading-4',
    BG_CLASSES[variant],
    emphasis ? 'border-2 font-semibold' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const content = (
    <>
      <Circle size={8} className={DOT_CLASSES[variant]} fill="currentColor" aria-hidden="true" />
      <span>
        {callsiteCount} {callsiteCount === 1 ? 'callsite' : 'callsites'}
      </span>
      {showServiceWarning && (
        <>
          <span aria-hidden="true" className="opacity-50">
            {'  '}
          </span>
          <AlertTriangle size={10} aria-hidden="true" />
          <span data-testid="impact-badge-service-warning">{affectedServiceCount} services</span>
        </>
      )}
    </>
  )

  if (emphasis) {
    return (
      <motion.span
        data-testid="impact-badge"
        data-blast-radius={blastRadius}
        data-emphasis="true"
        className={baseClasses}
        title={rationale}
        animate={{ opacity: [1, 0.7, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        {content}
      </motion.span>
    )
  }

  return (
    <span
      data-testid="impact-badge"
      data-blast-radius={blastRadius}
      className={baseClasses}
      title={rationale}
    >
      {content}
    </span>
  )
}
