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
  const words = name.trim().split(/\s+/)
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

export default function Avatar({ name = '', size = 'md', className = '', src }) {
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

  return (
    <div
      className={[
        'inline-flex items-center justify-center rounded-full bg-gradient-to-br',
        'font-[var(--font-semibold)] text-[var(--color-fg-on-accent)]',
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
