export default function GradientBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div
        className="orb-1 absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full blur-[100px]"
        style={{ backgroundColor: 'var(--color-orb-purple)' }}
      />
      <div
        className="orb-2 absolute top-1/2 -left-40 w-[600px] h-[600px] rounded-full blur-[120px]"
        style={{ backgroundColor: 'var(--color-orb-blue)' }}
      />
      <div
        className="orb-3 absolute -bottom-40 right-1/3 w-[400px] h-[400px] rounded-full blur-[100px]"
        style={{ backgroundColor: 'var(--color-orb-cyan)' }}
      />
    </div>
  )
}
