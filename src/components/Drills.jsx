import { useEffect, useRef, useState } from 'react'
import NumberPad from './NumberPad'
import TreaptaPicker from './TreaptaPicker'
import { makeFormulaQuestion, pick, PRAISE, ENCOURAGE, explain } from '../levels'

const ROUND_SIZE = 10

export default function Drills({ onStars, onCelebrate, onRecord = () => {}, onSession = () => {} }) {
  const [formula, setFormula] = useState(null)
  const [phase, setPhase] = useState('pick') // pick | play | summary
  const [question, setQuestion] = useState(null)
  const [qIndex, setQIndex] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [streak, setStreak] = useState(0)
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [elapsed, setElapsed] = useState(0)
  const timerRef = useRef(null)
  const tally = useRef({})

  useEffect(() => () => clearInterval(timerRef.current), [])

  const start = (f = formula) => {
    setQIndex(0)
    setCorrect(0)
    setStreak(0)
    setElapsed(0)
    setAnswer('')
    setFeedback(null)
    tally.current = {}
    setQuestion(makeFormulaQuestion(f))
    setPhase('play')
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000)
  }

  const pickTreapta = (f) => {
    setFormula(f)
    start(f)
  }

  const check = (n) => {
    const good = n === question.answer
    const t = tally.current[question.op] || { c: 0, a: 0 }
    t.a += 1
    if (good) t.c += 1
    tally.current[question.op] = t
    if (good) {
      setCorrect((c) => c + 1)
      setStreak((s) => s + 1)
      setFeedback({ good: true, text: pick(PRAISE) })
      onStars(1)
      if ((streak + 1) % 5 === 0) onCelebrate()
    } else {
      setStreak(0)
      setFeedback({
        good: false,
        text: `${pick(ENCOURAGE)} ${explain(question.a, question.op, question.b, question.answer)}`,
      })
    }
    setAnswer('')

    const next = qIndex + 1
    setTimeout(() => {
      setFeedback(null)
      if (next >= ROUND_SIZE) {
        clearInterval(timerRef.current)
        setPhase('summary')
        const finalCorrect = correct + (good ? 1 : 0)
        const perfect = finalCorrect === ROUND_SIZE
        onRecord('drillsBestCorrect', finalCorrect, 'max')
        onSession({
          correct: finalCorrect,
          attempts: ROUND_SIZE,
          ops: tally.current,
          seconds: elapsed,
          coins: finalCorrect + (perfect ? 10 : 0),
          perfect,
        })
        if (perfect) {
          onStars(5) // bonus pentru rundă perfectă
          onCelebrate()
        }
      } else {
        setQIndex(next)
        setQuestion(makeFormulaQuestion(formula))
      }
    }, good ? 900 : 2600)
  }

  const finalCorrect = correct
  const starsForRound = finalCorrect === ROUND_SIZE ? 3 : finalCorrect >= 7 ? 2 : finalCorrect >= 4 ? 1 : 0

  return (
    <div className="game-screen">
      <h2 className="game-title">⏱️ Exerciții cronometrate</h2>

      {phase === 'pick' && (
        <TreaptaPicker
          onPick={pickTreapta}
          subtitle={`Rezolvă ${ROUND_SIZE} exerciții cât de repede poți! Alege întâi treapta.`}
        />
      )}

      {phase !== 'pick' && formula && (
        <p className="game-subtitle">
          {formula.emoji} <strong>Treapta {formula.treapta} · {formula.name}</strong> — {formula.desc}
        </p>
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
          <button className="big-btn" onClick={() => start()}>Încă o rundă! 🔄</button>{' '}
          <button className="big-btn blue" onClick={() => setPhase('pick')}>
            🪜 Altă treaptă
          </button>
        </>
      )}
    </div>
  )
}
