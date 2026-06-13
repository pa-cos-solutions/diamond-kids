import { useState } from 'react'
import NumberPad from './NumberPad'
import { LEVELS, makePlacementTest, recommendLevel } from '../levels'

// Evaluare inițială: 8 exerciții cu dificultate crescătoare → nivel recomandat
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
    const lvl = LEVELS.find((l) => l.id === lid)
    return (
      <div className="game-screen">
        <h2 className="game-title">🎯 Rezultatul testului</h2>
        <div className="result-stars">{lvl.emoji}</div>
        <div className="result-message">
          Ai răspuns corect la {correct} din {test.length}.
        </div>
        <p className="game-subtitle">
          Nivelul recomandat: <strong>{lvl.name}</strong> ({lvl.age})
        </p>
        <button className="big-btn" onClick={() => onDone(lid)}>
          Începe la nivelul {lvl.name} 🚀
        </button>
      </div>
    )
  }

  return (
    <div className="game-screen">
      <h2 className="game-title">🎯 Test de nivel</h2>
      <p className="game-subtitle">Rezolvă exercițiile ca să-ți găsim nivelul potrivit.</p>
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
