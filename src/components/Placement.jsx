import { useState } from 'react'
import NumberPad from './NumberPad'
import { FORMULE, makePlacementTest, recommendLevel } from '../levels'

// Evaluare inițială: 8 exerciții cu dificultate crescătoare → treaptă recomandată
export default function Placement({ onDone, onCancel }) {
  const [test] = useState(() => makePlacementTest())
  const [i, setI] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [answer, setAnswer] = useState('')
  const [flash, setFlash] = useState(null)
  const [done, setDone] = useState(false)

  const q = test[i]

  const submit = (n) => {
    const good = n === q.answer
    if (good) setCorrect((c) => c + 1)
    setFlash(good)
    setAnswer('')
    setTimeout(() => {
      setFlash(null)
      if (i + 1 >= test.length) setDone(true)
      else setI(i + 1)
    }, 550)
  }

  if (done) {
    const lid = recommendLevel(correct)
    const treapta = FORMULE[Math.min(lid, FORMULE.length) - 1]
    return (
      <div className="game-screen">
        <h2 className="game-title">🎯 Rezultatul testului</h2>
        <div className="result-stars">{treapta.emoji}</div>
        <div className="result-message">
          Ai răspuns corect la {correct} din {test.length}.
        </div>
        <p className="game-subtitle">
          Îți recomandăm să începi de la{' '}
          <strong>Treapta {treapta.treapta} · {treapta.name}</strong>. O alegi când intri într-un joc de calcul.
        </p>
        <button className="big-btn" onClick={onDone}>
          Am înțeles, hai la joacă! 🚀
        </button>
      </div>
    )
  }

  return (
    <div className="game-screen">
      <h2 className="game-title">🎯 Test de nivel</h2>
      <p className="game-subtitle">Rezolvă exercițiile ca să-ți găsim treapta potrivită.</p>
      <div className="stat-row">
        <div className="stat-chip">
          Întrebarea{' '}
          <strong>
            {i + 1} / {test.length}
          </strong>
        </div>
        <div className="stat-chip">
          Corecte: <strong>{correct}</strong>
        </div>
      </div>
      <div className="question-text">{q.text} = ?</div>
      <div className={`feedback ${flash === true ? 'good' : flash === false ? 'bad' : ''}`}>
        {flash === true ? '✓' : flash === false ? '✗' : ''}
      </div>
      {flash === null && <NumberPad value={answer} onChange={setAnswer} onSubmit={submit} />}
      <button className="option-btn" style={{ marginTop: 12 }} onClick={onCancel}>
        Renunță
      </button>
    </div>
  )
}
