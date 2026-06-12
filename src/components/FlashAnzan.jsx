import { useEffect, useRef, useState } from 'react'
import NumberPad from './NumberPad'
import { makeFlashSequence, pick, PRAISE } from '../levels'

const SPEEDS = [
  { label: '🐢 Lent', ms: 2500 },
  { label: '🚶 Mediu', ms: 1500 },
  { label: '🏃 Rapid', ms: 800 },
  { label: '⚡ Fulger', ms: 500 },
]

const COUNTS = [3, 5, 7, 10]

export default function FlashAnzan({ level, onStars, onCelebrate, onRecord = () => {} }) {
  const [phase, setPhase] = useState('config') // config | countdown | flash | answer | result
  const [speed, setSpeed] = useState(level.flash.defaultSpeed)
  const [count, setCount] = useState(level.flash.defaultCount)
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
    setSequence(makeFlashSequence(level, count))
    setAnswer('')
    setResult(null)
    setCountdown(3)
    setPhase('countdown')
  }

  // numărătoarea inversă 3, 2, 1...
  useEffect(() => {
    if (phase !== 'countdown') return
    if (countdown === 0) {
      setIndex(-1)
      setPhase('flash')
      return
    }
    later(() => setCountdown((c) => c - 1), 700)
  }, [phase, countdown]) // eslint-disable-line react-hooks/exhaustive-deps

  // afișăm numerele pe rând, cu o pauză scurtă între ele
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
      const earned = Math.max(1, Math.round(count / 3))
      onStars(earned)
      onRecord('flashWins', 1, 'inc')
      onCelebrate()
    }
    setPhase('result')
  }

  const fmt = (n) => (n < 0 ? `− ${Math.abs(n)}` : `${n}`)

  return (
    <div className="game-screen">
      <h2 className="game-title">⚡ Flash Anzan</h2>
      <p className="game-subtitle">
        Numerele apar unul câte unul. Adună-le în minte, apoi scrie totalul!
      </p>

      {rounds.played > 0 && (
        <div className="stat-row">
          <div className="stat-chip">
            Runde câștigate: <strong>{rounds.won} / {rounds.played}</strong>
          </div>
        </div>
      )}

      {phase === 'config' && (
        <>
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
          <button className="big-btn" onClick={start}>
            Start! 🚀
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
          <button className="big-btn" onClick={start}>
            Încă o rundă! 🔄
          </button>{' '}
          <button className="big-btn blue" onClick={() => setPhase('config')}>
            Schimbă setările ⚙️
          </button>
        </>
      )}
    </div>
  )
}
