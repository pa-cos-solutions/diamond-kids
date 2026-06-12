import { useEffect, useRef, useState } from 'react'
import NumberPad from './NumberPad'
import { makeQuestion, OP_NAMES, pick, PRAISE, ENCOURAGE } from '../levels'

const ROUND_SIZE = 10

export default function Drills({ level, onStars, onCelebrate, onRecord = () => {} }) {
  const allOps = level.drill.ops
  const [selectedOps, setSelectedOps] = useState(allOps)
  const [phase, setPhase] = useState('config') // config | play | summary
  const [question, setQuestion] = useState(null)
  const [qIndex, setQIndex] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [streak, setStreak] = useState(0)
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [elapsed, setElapsed] = useState(0)
  const timerRef = useRef(null)

  // selecția de operații se resetează când se schimbă nivelul
  useEffect(() => setSelectedOps(level.drill.ops), [level])

  useEffect(() => () => clearInterval(timerRef.current), [])

  const toggleOp = (op) => {
    setSelectedOps((ops) =>
      ops.includes(op) ? (ops.length > 1 ? ops.filter((o) => o !== op) : ops) : [...ops, op]
    )
  }

  const start = () => {
    setQIndex(0)
    setCorrect(0)
    setStreak(0)
    setElapsed(0)
    setAnswer('')
    setFeedback(null)
    setQuestion(makeQuestion(level, selectedOps))
    setPhase('play')
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000)
  }

  const check = (n) => {
    const good = n === question.answer
    if (good) {
      setCorrect((c) => c + 1)
      setStreak((s) => s + 1)
      setFeedback({ good: true, text: pick(PRAISE) })
      onStars(1)
      if ((streak + 1) % 5 === 0) onCelebrate()
    } else {
      setStreak(0)
      setFeedback({ good: false, text: `${pick(ENCOURAGE)} Corect era ${question.answer}.` })
    }
    setAnswer('')

    const next = qIndex + 1
    setTimeout(() => {
      setFeedback(null)
      if (next >= ROUND_SIZE) {
        clearInterval(timerRef.current)
        setPhase('summary')
        const finalCorrect = correct + (good ? 1 : 0)
        onRecord('drillsBestCorrect', finalCorrect, 'max')
        if (finalCorrect === ROUND_SIZE) {
          onStars(5) // bonus pentru rundă perfectă
          onCelebrate()
        }
      } else {
        setQIndex(next)
        setQuestion(makeQuestion(level, selectedOps))
      }
    }, good ? 900 : 1800)
  }

  const finalCorrect = correct
  const starsForRound = finalCorrect === ROUND_SIZE ? 3 : finalCorrect >= 7 ? 2 : finalCorrect >= 4 ? 1 : 0

  return (
    <div className="game-screen">
      <h2 className="game-title">⏱️ Exerciții cronometrate</h2>
      <p className="game-subtitle">Rezolvă {ROUND_SIZE} exerciții cât de repede poți!</p>

      {phase === 'config' && (
        <>
          <div className="option-row">
            <span className="option-label">Ce operații vrei să exersezi?</span>
            {allOps.map((op) => (
              <button
                key={op}
                className={`option-btn ${selectedOps.includes(op) ? 'active' : ''}`}
                onClick={() => toggleOp(op)}
              >
                {op} {OP_NAMES[op]}
              </button>
            ))}
          </div>
          <button className="big-btn" onClick={start}>
            Start! 🚀
          </button>
        </>
      )}

      {phase === 'play' && (
        <>
          <div className="stat-row">
            <div className="stat-chip">
              Exercițiul <strong>{qIndex + 1} / {ROUND_SIZE}</strong>
            </div>
            <div className="stat-chip">
              Corecte: <strong>{correct}</strong>
            </div>
            <div className="stat-chip">
              🔥 Serie: <strong>{streak}</strong>
            </div>
            <div className="stat-chip">
              ⏱ <strong>{elapsed}s</strong>
            </div>
          </div>
          <div className="question-text">{question.text} = ?</div>
          <div className={`feedback ${feedback ? (feedback.good ? 'good' : 'bad') : ''}`}>
            {feedback?.text}
          </div>
          {!feedback && <NumberPad value={answer} onChange={setAnswer} onSubmit={check} />}
        </>
      )}

      {phase === 'summary' && (
        <>
          <div className="result-stars">
            {'⭐'.repeat(starsForRound) || '🌱'}
          </div>
          <div className="result-message">
            {finalCorrect === ROUND_SIZE
              ? 'Rundă perfectă! Ești un campion! 🏆'
              : finalCorrect >= 7
                ? 'Foarte bine! Aproape perfect! 🎉'
                : finalCorrect >= 4
                  ? 'Bun început! Continuă să exersezi! 💪'
                  : 'Exercițiul îl face pe maestru! Mai încearcă! 🌱'}
          </div>
          <div className="stat-row">
            <div className="stat-chip">
              Corecte: <strong>{finalCorrect} / {ROUND_SIZE}</strong>
            </div>
            <div className="stat-chip">
              Timp: <strong>{elapsed}s</strong>
            </div>
          </div>
          <button className="big-btn" onClick={start}>
            Încă o rundă! 🔄
          </button>{' '}
          <button className="big-btn blue" onClick={() => setPhase('config')}>
            Schimbă operațiile ⚙️
          </button>
        </>
      )}
    </div>
  )
}
