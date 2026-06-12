const COLORS = ['#f59e0b', '#0ea5e9', '#22c55e', '#ec4899', '#a855f7', '#ef4444', '#facc15']

export default function Confetti({ trigger }) {
  if (!trigger) return null
  const pieces = Array.from({ length: 30 }, (_, i) => ({
    left: Math.random() * 100,
    delay: Math.random() * 0.3,
    color: COLORS[i % COLORS.length],
    size: 8 + Math.random() * 8,
    round: Math.random() > 0.5,
  }))
  return (
    <div className="confetti-layer" key={trigger}>
      {pieces.map((p, i) => (
        <span
          key={i}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            animationDelay: `${p.delay}s`,
            background: p.color,
            width: p.size,
            height: p.size,
            borderRadius: p.round ? '50%' : '3px',
          }}
        />
      ))}
    </div>
  )
}
