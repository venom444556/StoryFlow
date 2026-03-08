import { Bot, User } from 'lucide-react'

const VARIANTS = {
  ai: {
    bg: 'bg-[var(--color-ai-bg)]',
    text: 'text-[var(--color-ai-accent)]',
    border: 'border-[var(--color-ai-border)]',
    icon: Bot,
    label: 'AI',
  },
  human: {
    bg: 'bg-[var(--color-human-bg)]',
    text: 'text-[var(--color-human-accent)]',
    border: 'border-[var(--color-human-border)]',
    icon: User,
    label: 'Human',
  },
}

export default function AIBadge({ source = 'ai', className = '' }) {
  const variant = VARIANTS[source] || VARIANTS.ai
  const Icon = variant.icon

  return (
    <span
      className={[
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5',
        'text-[10px] font-semibold uppercase tracking-wide',
        variant.bg,
        variant.text,
        variant.border,
        className,
      ].join(' ')}
    >
      <Icon size={10} />
      {variant.label}
    </span>
  )
}
