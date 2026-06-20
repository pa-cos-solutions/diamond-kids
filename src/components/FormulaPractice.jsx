import { useEffect, useRef, useState } from 'react'
import NumberPad from './NumberPad'
import { FORMULE, makeFormulaSequence, pick, PRAISE } from '../levels'

const SPEEDS = [
  { label: '🐢 Lent', ms: 2500 },
  { label: '🚶 Mediu', ms: 1500 },
  { label: '🏃 Rapid', ms: 800 },
  { label: '⚡ Fulger', ms: 500 },
]
const COUNTS = [3, 5, 7, 10]

export default function FormulaPractice({ onStars, onCelebrate, onRecord = () => {}, onSession = () => {} }) {
  const [formula, setFormula] = useState(null)
  const [mode, setMode] = useState('flash') // flash | column
  const [phase, setPhase] = useState('pick') // pick | config | countdown | flash | answer | result
  const [speed, setSpeed] = useState(1500)
  const [count, setCount] = useState(5)
  const [sequence, setSequence] = useState(null)
  const [index, setIndex] = useState(-1)
  const [showNumber, setShowNumber] = useState(false)
  const [countdown, setCountdown] = useState(3)
  const [answer, setAnswer] = useState('')
  const [result, setResult] = useState(null)
  const [rounds, setRounds] = useState({ played: 0, won: 0 })
  const timers = useRef([])

  useEffect(() => () => timers.current.forEach(clearTimeout), [])
  const later = (fn, ms) => timers.current.push(setTimeout(fn, ms))

  const start = () => {
    setSequence(makeFormulaSequence(formula, count))
    setAnswer('')
    setResult(null)
    setCountdown(3)
    setPhase(mode === 'column' ? 'answer' : 'countdown')
  }

  // numărătoare inversă 3, 2, 1…
  useEffect(() => {
    if (phase !== 'countdown') return
    if (countdown === 0) {
      setIndex(-1)
      setPhase('flash')
      return
    }
    later(() => setCountdown((c) => c - 1), 700)
  }, [phase, countdown]) // eslint-disable-line react-hooks/exhaustive-deps

  // afișăm numerele pe rând
  useEffect(() => {
    if (phase !== 'flash') return
    if (index >= count - 1) {
      later(() => setPhase('answer'), speed)
      return
    }
    later(() => {
      setIndex((i) => i + 1)
      setShowNumber(true)
      later(() => setShowNumber(false), Math.max(speed - 150, 250))
    }, index === -1 ? 100 : speed)
  }, [phase, index]) // eslint-disable-line react-hooks/exhaustive-deps

  const check = (n) => {
    const correct = n === sequence.total
    setResult({ correct, expected: sequence.total })
    setRounds((r) => ({ played: r.played + 1, won: r.won + (correct ? 1 : 0) }))
    if (correct) {
      onStars(1)
      onRecord('formulaWins', 1, 'inc')
      onCelebrate()
    }
    // contează ca o sesiune de calcul mental (adunări + scăderi)
    const plus = sequence.numbers.filter((x, i) => i === 0 || x > 0).length
    const minus = sequence.numbers.filter((x) => x < 0).length
    onSession({
      correct: correct ? 1 : 0,
      attempts: 1,
      ops: {
        '+': { a: plus, c: correct ? plus : 0 },
        '-': { a: minus, c: correct ? minus : 0 },
      },
      coins: correct ? Math.max(1, Math.round(count / 2)) : 0,
    })
    setPhase('result')
  }

  const fmt = (n) => (n < 0 ? `− ${Math.abs(n)}` : `${n}`)
  const fmtCol = (n, i) => (i === 0 ? `${n}` : n < 0 ? `−  ${Math.abs(n)}` : `+  ${n}`)

  return (
    <div className="game-screen">
      <h2 className="game-title">🪜 Calcul mental pe formule</h2>

      {phase === 'pick' && (
        <>
          <p className="game-subtitle">Alege treapta — exersezi exact procedeul ei.</p>
          <div className="game-grid">
            {FORMULE.map((f) => (
              <button
                key={f.id}
                className="game-card"
                style={{ borderBottomColor: f.color }}
                onClick={() => { setFormula(f); setPhase('config') }}
              >
                <span className="game-emoji">{f.emoji}</span>
                <h3>Treapta {f.treapta} · {f.name}</h3>
                <p>{f.desc}</p>
              </button>
            ))}
          </div>
        </>
      )}

      {phase !== 'pick' && formula && (
        <p className="game-subtitle">
          {formula.emoji} <strong>Treapta {formula.treapta} · {formula.name}</strong> — {formula.desc}
        </p>
      )}

      {rounds.played > 0 && phase !== 'pick' && (
        <div className="stat-row">
          <div className="stat-chip">
            Runde câștigate: <strong>{rounds.won} / {rounds.played}</strong>
          </div>
        </div>
      )}

      {phase === 'config' && (
        <>
          <div className="option-row">
            <span className="option-label">Cum vrei să apară?</span>
            <button
              className={`option-btn ${mode === 'flash' ? 'active' : ''}`}
              onClick={() => setMode('flash')}
            >
              ⚡ Pe rând
            </button>
            <button
              className={`option-btn ${mode === 'column' ? 'active' : ''}`}
              onClick={() => setMode('column')}
            >
              📋 În coloană
            </button>
          </div>
          <div className="option-row">
            <span className="option-label">Câte numere?</span>
            {COUNTS.map((c) => (
              <button
                key={c}
                className={`option-btn ${count === c ? 'active' : ''}`}
                onClick={() => setCount(c)}
              >
                {c}
              </button>
            ))}
          </div>
          {mode === 'flash' && (
            <div className="option-row">
              <span className="option-label">Cât de repede?</span>
              {SPEEDS.map((s) => (
                <button
                  key={s.ms}
                  className={`option-btn ${speed === s.ms ? 'active' : ''}`}
                  onClick={() => setSpeed(s.ms)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}
          <button className="big-btn" onClick={start}>Start! 🚀</button>{' '}
          <button className="big-btn blue" onClick={() => setPhase('pick')}>
            ⬅ Altă treaptă
          </button>
        </>
      )}

      {phase === 'countdown' && (
        <div className="flash-stage">
          <div className="flash-countdown" key={countdown}>
            {countdown === 0 ? 'Start!' : countdown}
          </div>
        </div>
      )}

      {phase === 'flash' && (
        <>
          <div className="flash-stage">
            {showNumber && index >= 0 && (
              <div className="flash-number" key={index}>
                {fmt(sequence.numbers[index])}
              </div>
            )}
          </div>
          <div className="flash-progress">
            {sequence.numbers.map((_, i) => (
              <span key={i} className={`flash-dot ${i <= index ? 'done' : ''}`} />
            ))}
          </div>
        </>
      )}

      {phase === 'answer' && (
        <>
          {mode === 'column' && (
            <div className="formula-column">
              {sequence.numbers.map((n, i) => (
                <div key={i} className="formula-col-row">{fmtCol(n, i)}</div>
              ))}
              <div className="formula-col-line" />
              <div className="formula-col-row formula-col-q">?</div>
            </div>
          )}
          <p className="question-text" style={{ fontSize: 'clamp(28px, 6vw, 40px)' }}>
            Cât fac toate împreună? 🤔
          </p>
          <NumberPad value={answer} onChange={setAnswer} onSubmit={check} />
        </>
      )}

      {phase === 'result' && (
        <>
          <div className={`feedback ${result.correct ? 'good' : 'bad'}`}>
            {result.correct
              ? pick(PRAISE)
              : `Răspunsul corect era ${result.expected}. ${pick(['Mai încearcă! 💪', 'Data viitoare îl prinzi! 🍀'])}`}
          </div>
          <div className="stat-row">
            <div className="stat-chip">
              Numerele au fost:{' '}
              <strong>{sequence.numbers.map(fmt).join('  ,  ')}</strong>
            </div>
          </div>
          <button className="big-btn" onClick={start}>Încă o rundă! 🔄</button>{' '}
          <button className="big-btn blue" onClick={() => setPhase('config')}>
            Schimbă setările ⚙️
          </button>{' '}
          <button className="big-btn" onClick={() => setPhase('pick')}>
            🧮 Altă treaptă
          </button>
        </>
      )}
    </div>
  )
}
