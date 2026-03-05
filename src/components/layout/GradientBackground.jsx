export default function GradientBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      {/* Warm radial glow — top right */}
      <div
        className="ambient-glow absolute -top-[20%] -right-[10%] h-[70%] w-[60%] rounded-full blur-[120px]"
        style={{
          background: 'radial-gradient(circle, var(--color-orb-purple) 0%, transparent 70%)',
        }}
      />

      {/* Subtle secondary glow — bottom left */}
      <div
        className="absolute -bottom-[15%] -left-[10%] h-[50%] w-[50%] rounded-full blur-[100px] opacity-50"
        style={{
          background: 'radial-gradient(circle, var(--color-orb-blue) 0%, transparent 70%)',
        }}
      />

      {/* Dot grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Subtle noise texture via SVG filter */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.015]" aria-hidden="true">
        <filter id="grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="4"
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>

      {/* Top edge gradient line — warm accent */}
      <div
        className="absolute left-0 right-0 top-0 h-px"
        style={{
          background:
            'linear-gradient(to right, transparent, rgba(245, 158, 11, 0.15) 30%, rgba(249, 115, 22, 0.1) 70%, transparent)',
        }}
      />
    </div>
  )
}
