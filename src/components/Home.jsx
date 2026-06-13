import { LEVELS } from '../levels'

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

export default function Home({ level, onSelectLevel, onSelectGame, sets = [], onSelectSet }) {
  return (
    <main>
      <div className="hero">
        <h1>Bun venit la Diamond Kids Academy! 👋</h1>
        <p>Antrenează-ți mintea cu jocuri de aritmetică mentală!</p>
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
            <span className="chip-name" style={{ color: 'var(--ink)' }}>{l.name}</span>
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
    </main>
  )
}
