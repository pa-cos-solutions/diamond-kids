import { FORMULE } from '../levels'

// Selector de treaptă/formulă, folosit la intrarea în jocurile de calcul.
export default function TreaptaPicker({ onPick, subtitle = 'Alege treapta — exersezi exact procedeul ei.' }) {
  return (
    <>
      <p className="game-subtitle">{subtitle}</p>
      <div className="game-grid">
        {FORMULE.map((f) => (
          <button
            key={f.id}
            className="game-card"
            style={{ borderBottomColor: f.color }}
            onClick={() => onPick(f)}
          >
            <span className="game-emoji">{f.emoji}</span>
            <h3>Treapta {f.treapta} · {f.name}</h3>
            <p>{f.desc}</p>
          </button>
        ))}
      </div>
    </>
  )
}
