import { useRef, useState } from 'react'
import NumberPad from './NumberPad'
import { makeCustomExercise, pick, PRAISE, ENCOURAGE, explain } from '../levels'

// Joc pentru elevi: rezolvă un set de exerciții publicat de profesor
export default function CustomDrill({ set, onStars, onCelebrate, onRecord = () => {}, onSession = () => {} }) {
  const total = set.count
  const tally = useRef({})
  const startedAt = useRef(0)
  const [phase, setPhase] = useState('intro') // intro | play | summary
  const [question, setQuestion] = useState(null)
  const [qIndex, setQIndex] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [streak, setStreak] = useState(0)
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState(null)

  const nextQuestion = () => makeCustomExercise({ ops: set.ops, maxOperand: set.maxOperand })

  const start = () => {
    setQIndex(0)
    setCorrect(0)
    setStreak(0)
    setAnswer('')
    setFeedback(null)
    tally.current = {}
    startedAt.current = Date.now()
    setQuestion(nextQuestion())
    setPhase('play')
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

    const ni = qIndex + 1
    setTimeout(
      () => {
        setFeedback(null)
        if (ni >= total) {
          setPhase('summary')
          const finalCorrect = correct + (good ? 1 : 0)
          const perfect = finalCorrect === total
          onRecord('drillsBestCorrect', finalCorrect, 'max')
          onSession({
            correct: finalCorrect,
            attempts: total,
            ops: tally.current,
            seconds: Math.round((Date.now() - startedAt.current) / 1000),
            coins: finalCorrect + (perfect ? 10 : 0),
            perfect,
          })
          if (perfect) {
            onStars(5)
            onCelebrate()
          }
        } else {
          setQIndex(ni)
          setQuestion(nextQuestion())
        }
      },
      good ? 900 : 2600
    )
  }

  const starsForRound =
    correct === total ? 3 : correct >= total * 0.7 ? 2 : correct >= total * 0.4 ? 1 : 0

  return (
    <div className="game-screen">
      <h2 className="game-title">📘 {set.title}</h2>
      <p className="game-subtitle">Set de la profesor · {total} exerciții</p>

      {phase === 'intro' && (
        <>
          <div className="stat-row">
            <div className="stat-chip">
              Operații: <strong>{set.ops.join(' ')}</strong>
            </div>
            <div className="stat-chip">
              Numere până la: <strong>{set.maxOperand}</strong>
            </div>
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
              Exercițiul{' '}
              <strong>
                {qIndex + 1} / {total}
              </strong>
            </div>
            <div className="stat-chip">
              Corecte: <strong>{correct}</strong>
            </div>
            <div className="stat-chip">
              🔥 Serie: <strong>{streak}</strong>
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
          <div className="result-stars">{'⭐'.repeat(starsForRound) || '🌱'}</div>
          <div className="result-message">
            {correct === total
              ? 'Set rezolvat perfect! Ești un campion! 🏆'
              : correct >= total * 0.7
                ? 'Foarte bine! Aproape perfect! 🎉'
                : correct >= total * 0.4
                  ? 'Bun început! Continuă să exersezi! 💪'
                  : 'Exercițiul îl face pe maestru! Mai încearcă! 🌱'}
          </div>
          <div className="stat-row">
            <div className="stat-chip">
              Corecte:{' '}
              <strong>
                {correct} / {total}
              </strong>
            </div>
          </div>
          <button className="big-btn" onClick={start}>
            Încă o dată! 🔄
          </button>
        </>
      )}
    </div>
  )
}
