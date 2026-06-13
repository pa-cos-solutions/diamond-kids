import { useState } from 'react'
import { generateWorksheet, OP_NAMES } from '../levels'

const STAT_COLUMNS = [
  { key: 'stars', label: '⭐ Stele' },
  { key: 'drillsBestCorrect', label: '⏱️ Record exerciții' },
  { key: 'flashWins', label: '⚡ Flash' },
  { key: 'memoryBest', label: '🧠 Memorie' },
  { key: 'abacusSolved', label: '🧮 Abac' },
]

const ALL_OPS = ['+', '-', '×', '÷']
const MAX_CHOICES = [10, 20, 50, 100, 1000]
const COUNT_CHOICES = [10, 20, 30, 40]

export default function TeacherDashboard({ profiles, onRename, onReset, onDelete, onExit }) {
  const [ops, setOps] = useState(['+', '-'])
  const [maxOperand, setMaxOperand] = useState(20)
  const [count, setCount] = useState(20)
  const [sheet, setSheet] = useState(null)
  const [showAnswers, setShowAnswers] = useState(false)

  const toggleOp = (op) =>
    setOps((cur) =>
      cur.includes(op) ? (cur.length > 1 ? cur.filter((o) => o !== op) : cur) : [...cur, op]
    )

  const generate = () => {
    setSheet(generateWorksheet({ ops, maxOperand, count }))
    setShowAnswers(false)
  }

  const rename = (p) => {
    const name = window.prompt('Nume nou pentru profil:', p.name)
    if (name && name.trim()) onRename(p.id, name.trim())
  }
  const reset = (p) => {
    if (window.confirm(`Resetezi tot progresul lui „${p.name}"? Stelele și recordurile revin la 0.`))
      onReset(p.id)
  }
  const remove = (p) => {
    if (window.confirm(`Ștergi definitiv profilul „${p.name}"?`)) onDelete(p.id)
  }

  return (
    <div>
      <div className="teacher-bar">
        <button className="back-btn" onClick={onExit}>
          ⬅ Înapoi
        </button>
        <h2 className="game-title" style={{ margin: 0 }}>
          👩‍🏫 Panou profesor
        </h2>
      </div>

      {/* ---- Elevi ---- */}
      <div className="game-screen" style={{ textAlign: 'left' }}>
        <h3 className="teacher-h3">
          👧 Elevii mei <span className="muted">({profiles.length})</span>
        </h3>
        {profiles.length === 0 ? (
          <p className="muted">
            Niciun profil de elev încă. Creează profiluri din ecranul „Cine se joacă azi?".
          </p>
        ) : (
          <div className="teacher-table-wrap">
            <table className="teacher-table">
              <thead>
                <tr>
                  <th>Elev</th>
                  {STAT_COLUMNS.map((c) => (
                    <th key={c.key}>{c.label}</th>
                  ))}
                  <th>Acțiuni</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((p) => (
                  <tr key={p.id}>
                    <td className="elev-cell">
                      <span className="elev-avatar">{p.avatar}</span> {p.name}
                    </td>
                    {STAT_COLUMNS.map((c) => (
                      <td key={c.key} className="num">
                        {p[c.key] || 0}
                      </td>
                    ))}
                    <td>
                      <div className="actions-cell">
                        <button className="mini-btn" title="Redenumește" onClick={() => rename(p)}>
                          ✏️
                        </button>
                        <button className="mini-btn" title="Resetează progresul" onClick={() => reset(p)}>
                          ↺
                        </button>
                        <button className="mini-btn danger" title="Șterge" onClick={() => remove(p)}>
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ---- Generator de exerciții ---- */}
      <div className="game-screen" style={{ textAlign: 'left', marginTop: 16 }}>
        <h3 className="teacher-h3">🧩 Generează exerciții noi</h3>

        <div className="gen-controls">
          <div className="gen-group">
            <span className="option-label">Operații</span>
            <div className="gen-ops">
              {ALL_OPS.map((op) => (
                <button
                  key={op}
                  className={`option-btn ${ops.includes(op) ? 'active' : ''}`}
                  onClick={() => toggleOp(op)}
                >
                  {op} {OP_NAMES[op]}
                </button>
              ))}
            </div>
          </div>
          <div className="gen-group">
            <span className="option-label">Număr maxim</span>
            <div className="gen-ops">
              {MAX_CHOICES.map((m) => (
                <button
                  key={m}
                  className={`option-btn ${maxOperand === m ? 'active' : ''}`}
                  onClick={() => setMaxOperand(m)}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
          <div className="gen-group">
            <span className="option-label">Câte exerciții</span>
            <div className="gen-ops">
              {COUNT_CHOICES.map((c) => (
                <button
                  key={c}
                  className={`option-btn ${count === c ? 'active' : ''}`}
                  onClick={() => setCount(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button className="big-btn blue" onClick={generate}>
          Generează 🧮
        </button>

        {sheet && (
          <>
            <div className="worksheet-toolbar">
              <button className="option-btn" onClick={() => setShowAnswers((s) => !s)}>
                {showAnswers ? '🙈 Ascunde răspunsurile' : '✅ Arată răspunsurile'}
              </button>
              <button className="option-btn" onClick={() => window.print()}>
                🖨️ Printează fișa
              </button>
            </div>
            <div className="worksheet">
              <div className="worksheet-title">💎 Diamond Kids Academy — Fișă de exerciții</div>
              <ol className="worksheet-grid">
                {sheet.map((ex, i) => (
                  <li key={i} className="ws-item">
                    <span className="ws-q">{ex.text} =</span>
                    <span className={`ws-a ${showAnswers ? 'filled' : ''}`}>
                      {showAnswers ? ex.answer : ''}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
