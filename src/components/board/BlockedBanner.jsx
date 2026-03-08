import { AlertTriangle } from 'lucide-react'

export default function BlockedBanner({ blockedAt }) {
  if (!blockedAt) return null

  const date = new Date(blockedAt)
  const formatted =
    date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) +
    ', ' +
    date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="mb-2 flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-wide bg-[var(--color-danger-subtle)] text-[var(--color-danger)]">
      <AlertTriangle size={10} />
      <span>Blocked since {formatted}</span>
    </div>
  )
}
