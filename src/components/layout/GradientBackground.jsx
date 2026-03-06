export default function GradientBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      {/* Primary warm glow — top right, large and atmospheric */}
      <div
        className="ambient-glow absolute -top-[25%] -right-[10%] h-[85%] w-[75%] rounded-full blur-[160px]"
        style={{
          background:
            'radial-gradient(ellipse at 40% 50%, var(--color-orb-purple) 0%, transparent 55%)',
        }}
      />

      {/* Secondary glow — bottom left, cooler tone */}
      <div
        className="ambient-glow absolute -bottom-[15%] -left-[10%] h-[65%] w-[60%] rounded-full blur-[140px] opacity-70"
        style={{
          background:
            'radial-gradient(ellipse at 60% 50%, var(--color-orb-blue) 0%, transparent 55%)',
          animationDelay: '3s',
        }}
      />

      {/* Tertiary glow — center-bottom, adds depth */}
      <div
        className="absolute bottom-[5%] left-[30%] h-[40%] w-[40%] rounded-full blur-[120px] opacity-50"
        style={{
          background: 'radial-gradient(circle, var(--color-orb-cyan) 0%, transparent 50%)',
        }}
      />

      {/* Subtle noise texture for organic feel */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.025]" aria-hidden="true">
        <filter id="grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.75"
            numOctaves="4"
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
    </div>
  )
}
