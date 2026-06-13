import { LEVELS, BADGES, dayKey } from '../levels'

const GAMES = [
  {
    id: 'abacus',
    emoji: '🧮',
    title: 'Abac virtual',
    desc: 'Joacă-te cu abacul soroban: construiește numere și învață să le citești!',
    color: 'var(--orange)',
  },
  {
    id: 'flash',
    emoji: '⚡',
    title: 'Flash Anzan',
    desc: 'Numerele apar rapid pe ecran — adună-le în minte și scrie rezultatul!',
    color: 'var(--blue)',
  },
  {
    id: 'drills',
    emoji: '⏱️',
    title: 'Exerciții cronometrate',
    desc: 'Adunare, scădere, înmulțire și împărțire contra cronometru!',
    color: 'var(--green)',
  },
  {
    id: 'memory',
    emoji: '🧠',
    title: 'Memorie numerică',
    desc: 'Privește numărul, ține-l minte și scrie-l din memorie!',
    color: 'var(--purple)',
  },
]

const DAILY_GOAL = 10

export default function Home({
  level,
  profile,
  profiles = [],
  onSelectLevel,
  onSelectGame,
  onStartPlacement,
  sets = [],
  onSelectSet,
}) {
  const today = dayKey()
  const dailyDone = profile?.dailyDate === today ? profile.dailyCount || 0 : 0
  const dailyPct = Math.min(100, Math.round((dailyDone / DAILY_GOAL) * 100))
  const badgeCount = (profile?.badges || []).length
  const ranked = [...profiles].sort((a, b) => (b.stars || 0) - (a.stars || 0))

  return (
    <main>
      <div className="hero">
        <h1>Bun venit la Diamond Kids Academy! 👋</h1>
        <p>Antrenează-ți mintea cu jocuri de aritmetică mentală!</p>
      </div>

      {/* Antrenament zilnic + statistici */}
      <div className="today-card">
        <div className="today-stats">
          <div className="today-stat">
            <span className="today-emoji">🔥</span>
            <strong>{profile?.streak || 0}</strong>
            <span className="today-label">zile la rând</span>
          </div>
          <div className="today-stat">
            <span className="today-emoji">🪙</span>
            <strong>{profile?.coins || 0}</strong>
            <span className="today-label">monede</span>
          </div>
          <div className="today-stat">
            <span className="today-emoji">🏅</span>
            <strong>{badgeCount}</strong>
            <span className="today-label">insigne</span>
          </div>
        </div>
        <div className="goal-box">
          <div className="goal-head">
            🎯 Antrenament zilnic: <strong>{dailyDone}/{DAILY_GOAL}</strong>
            {dailyDone >= DAILY_GOAL && <span className="goal-done"> ✓ gata pe azi!</span>}
          </div>
          <div className="goal-bar">
            <div className="goal-fill" style={{ width: `${dailyPct}%` }} />
          </div>
        </div>
        <button className="goal-test-btn" onClick={onStartPlacement}>
          🎯 Test de nivel
        </button>
      </div>

      <div className="section-label">1️⃣ Alege nivelul tău:</div>
      <div className="level-chips">
        {LEVELS.map((l) => (
          <button
            key={l.id}
            className={`level-chip ${l.id === level.id ? 'active' : ''}`}
            style={{ color: l.color }}
            onClick={() => onSelectLevel(l.id)}
          >
            <span className="chip-emoji">{l.emoji}</span>
            <span className="chip-name" style={{ color: 'var(--ink)' }}>
              {l.name}
            </span>
            <span className="chip-age">{l.age}</span>
          </button>
        ))}
      </div>

      <div className="section-label">2️⃣ Alege un joc:</div>
      <div className="game-grid">
        {GAMES.map((g) => (
          <button
            key={g.id}
            className="game-card"
            style={{ borderBottomColor: g.color }}
            onClick={() => onSelectGame(g.id)}
          >
            <span className="game-emoji">{g.emoji}</span>
            <h3>{g.title}</h3>
            <p>{g.desc}</p>
          </button>
        ))}
      </div>

      {sets.length > 0 && (
        <>
          <div className="section-label">📘 Exerciții de la profesor:</div>
          <div className="game-grid">
            {sets.map((s) => (
              <button
                key={s.id}
                className="game-card"
                style={{ borderBottomColor: 'var(--purple)' }}
                onClick={() => onSelectSet(s)}
              >
                <span className="game-emoji">📘</span>
                <h3>{s.title}</h3>
                <p>
                  {s.count} exerciții · {s.ops.join(' ')} · până la {s.maxOperand}
                </p>
              </button>
            ))}
          </div>
        </>
      )}

      {/* Insigne câștigate */}
      {badgeCount > 0 && (
        <>
          <div className="section-label">🏅 Insignele tale:</div>
          <div className="badge-row">
            {BADGES.filter((b) => (profile?.badges || []).includes(b.id)).map((b) => (
              <div key={b.id} className="badge-chip" title={b.name}>
                <span className="badge-icon">{b.icon}</span>
                <span className="badge-name">{b.name}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Clasament între profilurile contului */}
      {ranked.length > 1 && (
        <>
          <div className="section-label">🏆 Clasament:</div>
          <div className="leaderboard">
            {ranked.map((p, i) => (
              <div key={p.id} className={`lb-row ${p.id === profile?.id ? 'me' : ''}`}>
                <span className="lb-rank">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}</span>
                <span className="lb-avatar">{p.avatar}</span>
                <span className="lb-name">{p.name}</span>
                <span className="lb-xp">⭐ {p.stars || 0}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  )
}
