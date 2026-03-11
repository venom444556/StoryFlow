export default function GradientBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      {/* Primary teal glow — top right, tighter and focused */}
      <div
        className="ambient-glow absolute -top-[20%] -right-[5%] h-[70%] w-[60%] rounded-full blur-[120px]"
        style={{
          background:
            'radial-gradient(ellipse at 40% 50%, var(--color-orb-purple) 0%, transparent 50%)',
        }}
      />

      {/* Secondary glow — bottom left, cool blue tone */}
      <div
        className="ambient-glow absolute -bottom-[10%] -left-[5%] h-[55%] w-[50%] rounded-full blur-[100px] opacity-70"
        style={{
          background:
            'radial-gradient(ellipse at 60% 50%, var(--color-orb-blue) 0%, transparent 50%)',
          animationDelay: '3s',
        }}
      />

      {/* Tertiary glow — center-bottom, subtle depth */}
      <div
        className="absolute bottom-[5%] left-[30%] h-[35%] w-[35%] rounded-full blur-[90px] opacity-50"
        style={{
          background: 'radial-gradient(circle, var(--color-orb-cyan) 0%, transparent 45%)',
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
