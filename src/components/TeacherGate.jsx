import { useState } from 'react'
import { getPin, setPin as savePin } from '../teacherPin'

// Poartă cu PIN pentru zona de profesor — elevii nu pot intra fără el.
// PIN-ul e setat la prima accesare și păstrat local pe acest dispozitiv.
export default function TeacherGate({ onUnlock, onExit }) {
  const storedPin = getPin()
  const [pin, setPin] = useState('')
  const [err, setErr] = useState('')

  const submit = () => {
    const value = pin.trim()
    if (value.length < 4) {
      setErr('PIN-ul trebuie să aibă cel puțin 4 cifre.')
      return
    }
    if (storedPin) {
      if (value === storedPin) onUnlock()
      else setErr('PIN greșit. Mai încearcă.')
    } else {
      savePin(value)
      onUnlock()
    }
  }

  return (
    <div className="game-screen" style={{ maxWidth: 460, margin: '0 auto' }}>
      <h2 className="game-title">👩‍🏫 Zona profesorului</h2>
      <p className="game-subtitle">
        {storedPin
          ? 'Introdu PIN-ul de profesor pentru a continua.'
          : 'Setează un PIN de profesor (minim 4 cifre). Îl vei folosi data viitoare.'}
      </p>
      <input
        className="name-input"
        type="password"
        inputMode="numeric"
        placeholder="PIN…"
        value={pin}
        maxLength={8}
        onChange={(e) => {
          setPin(e.target.value.replace(/\D/g, ''))
          setErr('')
        }}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
        autoFocus
      />
      {err && <div className="feedback bad" style={{ fontSize: 18 }}>{err}</div>}
      <div>
        <button className="big-btn" onClick={submit}>
          {storedPin ? 'Intră 🔓' : 'Setează PIN 🔐'}
        </button>{' '}
        <button className="big-btn blue" onClick={onExit}>
          Înapoi la aplicație
        </button>
      </div>
    </div>
  )
}
