import { useEffect, useRef, useState } from 'react'
import NumberPad from './NumberPad'
import { rand, pick, PRAISE } from '../levels'

function makeNumber(len) {
  let s = String(rand(1, 9))
  for (let i = 1; i < len; i++) s += String(rand(0, 9))
  return s
}

const START_OPTIONS = [2, 3, 4, 5]

export default function MemoryGame({ onStars, onCelebrate, onRecord = () => {} }) {
  const [startLen, setStartLen] = useState(3)
  const [phase, setPhase] = useState('intro') // intro | show | recall | result
  const [length, setLength] = useState(3)
  const [best, setBest] = useState(0)
  const [number, setNumber] = useState('')
  const [answer, setAnswer] = useState('')
  const [result, setResult] = useState(null)
  const timerRef = useRef(null)

  useEffect(() => () => clearTimeout(timerRef.current), [])

  const chooseStart = (n) => {
    setStartLen(n)
    setLength(n)
    setBest(0)
  }

  const show = (len) => {
    const n = makeNumber(len)
    setNumber(n)
    setAnswer('')
    setResult(null)
    setPhase('show')
    clearTimeout(timerRef.current)
    // timp de memorare proporțional cu lungimea numărului
    timerRef.current = setTimeout(() => setPhase('recall'), 800 + len * 600)
  }

  const check = (n) => {
    const correct = String(n) === number
    setResult({ correct })
    if (correct) {
      const newLen = length + 1
      setBest((b) => Math.max(b, length))
      setLength(Math.min(newLen, 9))
      onStars(Math.max(1, length - startLen + 1))
      onRecord('memoryBest', length, 'max')
      onCelebrate()
    } else {
      setLength(Math.max(startLen, length - 1))
    }
    setPhase('result')
  }

  return (
    <div className="game-screen">
      <h2 className="game-title">🧠 Memorie numerică</h2>
      <p className="game-subtitle">
        Privește numărul cu atenție, ține-l minte, apoi scrie-l din memorie!
      </p>

      <div className="stat-row">
        <div className="stat-chip">
          Cifre acum: <strong>{length}</strong>
        </div>
        {best > 0 && (
          <div className="stat-chip">
            🏆 Record: <strong>{best} cifre</strong>
          </div>
        )}
      </div>

      {phase === 'intro' && (
        <>
          <div className="option-row">
            <span className="option-label">Câte cifre la început?</span>
            {START_OPTIONS.map((n) => (
              <button
                key={n}
                className={`option-btn ${startLen === n ? 'active' : ''}`}
                onClick={() => chooseStart(n)}
              >
                {n}
              </button>
            ))}
          </div>
          <div className="flash-stage">
            <div className="memory-hidden">? ? ?</div>
          </div>
          <button className="big-btn" onClick={() => show(length)}>
            Sunt gata! 🚀
          </button>
        </>
      )}

      {phase === 'show' && (
        <div className="flash-stage">
          <div className="memory-number">{number}</div>
          <p className="game-subtitle">Memorează-l! 👀</p>
        </div>
      )}

      {phase === 'recall' && (
        <>
          <p className="question-text" style={{ fontSize: 'clamp(28px, 6vw, 40px)' }}>
            Care era numărul? 🤔
          </p>
          <NumberPad value={answer} onChange={setAnswer} onSubmit={check} />
        </>
      )}

      {phase === 'result' && (
        <>
          <div className={`feedback ${result.correct ? 'good' : 'bad'}`}>
            {result.correct
              ? `${pick(PRAISE)} Acum încercăm cu ${length} cifre!`
              : `Numărul era ${number}. Mai încearcă! 💪`}
          </div>
          <button className="big-btn" onClick={() => show(length)}>
            Următorul număr! 🔄
          </button>
        </>
      )}
    </div>
  )
}
