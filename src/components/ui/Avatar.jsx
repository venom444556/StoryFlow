const GRADIENTS = [
  'from-purple-500 to-blue-500',
  'from-blue-500 to-cyan-500',
  'from-cyan-500 to-green-500',
  'from-green-500 to-yellow-500',
  'from-yellow-500 to-orange-500',
  'from-orange-500 to-red-500',
  'from-red-500 to-pink-500',
  'from-pink-500 to-purple-500',
]

function hashName(name) {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return Math.abs(hash)
}

function getInitials(name) {
  if (!name) return '?'
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return '?'
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase()
  }
  return words[0][0].toUpperCase()
}

const SIZES = {
  sm: { container: 'h-6 w-6', text: 'text-[10px]' },
  md: { container: 'h-8 w-8', text: 'text-[var(--text-xs)]' },
  lg: { container: 'h-10 w-10', text: 'text-[var(--text-sm)]' },
  xl: { container: 'h-12 w-12', text: 'text-[var(--text-base)]' },
}

export default function Avatar({ name = '', size = 'md', className = '', src, variant }) {
  const gradient = GRADIENTS[hashName(name) % GRADIENTS.length]
  const initials = getInitials(name)
  const sizeClasses = SIZES[size] || SIZES.md

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={[
          'inline-flex items-center justify-center rounded-full object-cover',
          sizeClasses.container,
          className,
        ].join(' ')}
      />
    )
  }

  if (variant === 'ai') {
    return (
      <div
        className={[
          'inline-flex items-center justify-center rounded-full',
          'bg-[var(--color-ai-bg)] text-[var(--color-ai-accent)] border border-[var(--color-ai-border)]',
          sizeClasses.container,
          sizeClasses.text,
          className,
        ].join(' ')}
        title="AI Agent"
        aria-label="AI Agent"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-1/2 h-1/2"
        >
          <path d="M12 8V4H8" />
          <rect width="16" height="12" x="4" y="8" rx="2" />
          <path d="M2 14h2" />
          <path d="M20 14h2" />
          <path d="M15 13v2" />
          <path d="M9 13v2" />
        </svg>
      </div>
    )
  }

  return (
    <div
      className={[
        'inline-flex items-center justify-center rounded-full bg-gradient-to-br',
        'font-semibold text-[var(--color-fg-on-accent)]',
        gradient,
        sizeClasses.container,
        sizeClasses.text,
        className,
      ].join(' ')}
      title={name}
      aria-label={name}
    >
      {initials}
    </div>
  )
}
