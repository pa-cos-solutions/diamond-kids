import { useEffect, useState } from 'react'
import Abacus from './Abacus'
import NumberPad from './NumberPad'
import { rand, pick, PRAISE, ENCOURAGE } from '../levels'

const MODES = [
  { id: 'free', label: '🎨 Joacă liber' },
  { id: 'build', label: '🔨 Construiește numărul' },
  { id: 'read', label: '👀 Citește abacul' },
]

export default function AbacusGame({ level, onStars, onCelebrate }) {
  const rods = level.abacus.rods
  const maxNumber = Math.pow(10, rods) - 1

  const [mode, setMode] = useState('free')
  const [value, setValue] = useState(0)
  const [target, setTarget] = useState(() => rand(1, maxNumber))
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [solved, setSolved] = useState(false)
  const [score, setScore] = useState(0)

  const newTarget = () => {
    setTarget((old) => {
      let t = rand(1, maxNumber)
      while (t === old) t = rand(1, maxNumber)
      return t
    })
    setValue(0)
    setSolved(false)
    setFeedback(null)
  }

  const switchMode = (m) => {
    setMode(m)
    setValue(0)
    setAnswer('')
    setFeedback(null)
    setSolved(false)
    setTarget(rand(1, maxNumber))
  }

  // în modul „construiește": detectăm automat când abacul arată numărul țintă
  useEffect(() => {
    if (mode === 'build' && !solved && value === target) {
      setSolved(true)
      setFeedback({ good: true, text: pick(PRAISE) })
      setScore((s) => s + 1)
      onStars(1)
      onCelebrate()
      const t = setTimeout(newTarget, 1600)
      return () => clearTimeout(t)
    }
  }, [value, target, mode, solved]) // eslint-disable-line react-hooks/exhaustive-deps

  const checkRead = (n) => {
    if (n === target) {
      setFeedback({ good: true, text: pick(PRAISE) })
      setScore((s) => s + 1)
      onStars(1)
      onCelebrate()
      setAnswer('')
      setTimeout(() => {
        setTarget((old) => {
          let t = rand(1, maxNumber)
          while (t === old) t = rand(1, maxNumber)
          return t
        })
        setFeedback(null)
      }, 1600)
    } else {
      setFeedback({ good: false, text: pick(ENCOURAGE) })
      setAnswer('')
    }
  }

  return (
    <div className="game-screen">
      <h2 className="game-title">🧮 Abac virtual</h2>
      <p className="game-subtitle">
        Bilele de sus valorează 5, bilele de jos valorează 1. Apropie-le de bară ca să numere!
      </p>

      <div className="mode-tabs">
        {MODES.map((m) => (
          <button
            key={m.id}
            className={`mode-tab ${mode === m.id ? 'active' : ''}`}
            onClick={() => switchMode(m.id)}
          >
            {m.label}
          </button>
        ))}
      </div>

      {mode !== 'free' && (
        <div className="stat-row">
          <div className="stat-chip">
            Rezolvate: <strong>{score}</strong>
          </div>
        </div>
      )}

      {mode === 'build' && (
        <p className="question-text" style={{ fontSize: 'clamp(30px, 6vw, 44px)' }}>
          Arată pe abac: <span style={{ color: 'var(--orange)' }}>{target}</span>
        </p>
      )}

      {mode === 'read' && (
        <p className="question-text" style={{ fontSize: 'clamp(30px, 6vw, 44px)' }}>
          Ce număr arată abacul?
        </p>
      )}

      <Abacus
        value={mode === 'read' ? target : value}
        onChange={setValue}
        rods={rods}
        readonly={mode === 'read'}
      />

      {(mode === 'free' || mode === 'build') && (
        <div className="abacus-value">{value}</div>
      )}

      {feedback && (
        <div className={`feedback ${feedback.good ? 'good' : 'bad'}`}>{feedback.text}</div>
      )}

      {mode === 'read' && !feedback?.good && (
        <NumberPad value={answer} onChange={setAnswer} onSubmit={checkRead} />
      )}

      {mode === 'build' && (
        <button className="big-btn blue" onClick={newTarget}>
          Alt număr 🔄
        </button>
      )}
    </div>
  )
}
