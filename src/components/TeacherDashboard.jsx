import { useState } from 'react'
import { generateWorksheet, OP_NAMES } from '../levels'

const OP_LABEL = { '+': 'adunare', '-': 'scădere', '×': 'înmulțire', '÷': 'împărțire' }

function accuracy(p) {
  const a = p.totalAttempts || 0
  return a ? Math.round(((p.totalCorrect || 0) / a) * 100) : null
}

function weakSpot(p) {
  const s = p.opStats || {}
  let worst = null
  let worstPct = 1.01
  for (const [op, v] of Object.entries(s)) {
    if ((v.a || 0) < 3) continue
    const pct = v.c / v.a
    if (pct < worstPct) {
      worstPct = pct
      worst = op
    }
  }
  return worst ? `${worst} ${OP_LABEL[worst]} (${Math.round(worstPct * 100)}%)` : '—'
}

const ALL_OPS = ['+', '-', '×', '÷']
const MAX_CHOICES = [10, 20, 50, 100, 1000]
const COUNT_CHOICES = [10, 20, 30, 40]

export default function TeacherDashboard({
  profiles,
  onRename,
  onReset,
  onDelete,
  sets = [],
  onCreateSet,
  onDeleteSet,
  onExit,
}) {
  const [ops, setOps] = useState(['+', '-'])
  const [maxOperand, setMaxOperand] = useState(20)
  const [count, setCount] = useState(20)
  const [sheet, setSheet] = useState(null)
  const [showAnswers, setShowAnswers] = useState(false)
  const [title, setTitle] = useState('')

  const publish = () => {
    const t = title.trim() || `Exerciții: ${ops.join(' ')} · până la ${maxOperand}`
    onCreateSet({ title: t, ops: [...ops], maxOperand, count })
    setTitle('')
  }

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
                  <th>⭐ Stele</th>
                  <th>🪙 Monede</th>
                  <th>🔥 Serie</th>
                  <th>🎯 Precizie</th>
                  <th>📉 Punct slab</th>
                  <th>⏱️ Timp</th>
                  <th>Acțiuni</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((p) => {
                  const acc = accuracy(p)
                  return (
                    <tr key={p.id}>
                      <td className="elev-cell">
                        <span className="elev-avatar">{p.avatar}</span> {p.name}
                      </td>
                      <td className="num">{p.stars || 0}</td>
                      <td className="num">{p.coins || 0}</td>
                      <td className="num">{p.streak || 0}</td>
                      <td className="num">{acc === null ? '—' : `${acc}%`}</td>
                      <td>{weakSpot(p)}</td>
                      <td className="num">{Math.round((p.weekSeconds || 0) / 60)} min</td>
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
                  )
                })}
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

        <div className="publish-row">
          <input
            className="name-input"
            placeholder="Nume set (ex: Adunări până la 20)"
            maxLength={40}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && publish()}
          />
          <div className="publish-btns">
            <button className="big-btn blue" onClick={generate}>
              Previzualizează 🧮
            </button>
            <button className="big-btn" onClick={publish}>
              📤 Publică pentru elevi
            </button>
          </div>
          <p className="muted" style={{ fontSize: 14, margin: '4px 0 0' }}>
            Setul publicat apare imediat la elevi, în secțiunea „Exerciții de la profesor".
          </p>
        </div>

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

      {/* ---- Seturi publicate ---- */}
      <div className="game-screen" style={{ textAlign: 'left', marginTop: 16 }}>
        <h3 className="teacher-h3">
          📤 Publicate pentru elevi <span className="muted">({sets.length})</span>
        </h3>
        {sets.length === 0 ? (
          <p className="muted">
            Niciun set publicat încă. Configurează mai sus și apasă „Publică pentru elevi".
          </p>
        ) : (
          <div className="set-list">
            {sets.map((s) => (
              <div key={s.id} className="set-item">
                <div>
                  <strong>{s.title}</strong>
                  <div className="muted" style={{ fontSize: 14 }}>
                    {s.count} exerciții · {s.ops.join(' ')} · până la {s.maxOperand}
                  </div>
                </div>
                <button
                  className="mini-btn danger"
                  title="Șterge setul"
                  onClick={() => {
                    if (window.confirm(`Ștergi setul „${s.title}"? Nu va mai fi disponibil la elevi.`))
                      onDeleteSet(s.id)
                  }}
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
