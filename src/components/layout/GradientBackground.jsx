export default function GradientBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      {/* Primary warm glow — top right */}
      <div
        className="ambient-glow absolute -top-[30%] -right-[15%] h-[80%] w-[70%] rounded-full blur-[150px]"
        style={{
          background: 'radial-gradient(ellipse, var(--color-orb-purple) 0%, transparent 60%)',
        }}
      />

      {/* Secondary glow — bottom left */}
      <div
        className="absolute -bottom-[20%] -left-[15%] h-[60%] w-[55%] rounded-full blur-[130px] opacity-60"
        style={{
          background: 'radial-gradient(ellipse, var(--color-orb-blue) 0%, transparent 60%)',
        }}
      />

      {/* Subtle noise texture */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.02]" aria-hidden="true">
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
    </div>
  )
}
