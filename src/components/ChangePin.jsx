import { useState } from 'react'
import { getPin, setPin } from '../teacherPin'

// Schimbarea PIN-ului — disponibilă DOAR în panoul profesorului (deja protejat cu PIN).
// În plus, cere PIN-ul curent înainte de a-l înlocui, ca o a doua confirmare.
export default function ChangePin() {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [msg, setMsg] = useState(null) // { ok: bool, text: string }

  const onlyDigits = (v) => v.replace(/\D/g, '')

  const submit = () => {
    if (current !== getPin()) {
      setMsg({ ok: false, text: 'PIN-ul curent este greșit.' })
      return
    }
    if (next.length < 4) {
      setMsg({ ok: false, text: 'PIN-ul nou trebuie să aibă cel puțin 4 cifre.' })
      return
    }
    if (next !== confirm) {
      setMsg({ ok: false, text: 'PIN-urile noi nu se potrivesc.' })
      return
    }
    setPin(next)
    setCurrent('')
    setNext('')
    setConfirm('')
    setMsg({ ok: true, text: 'PIN-ul a fost schimbat. ✅' })
  }

  return (
    <div className="game-screen" style={{ textAlign: 'left', marginTop: 16 }}>
      <h3 className="teacher-h3">🔐 Schimbă PIN-ul de profesor</h3>
      <p className="muted" style={{ fontSize: 14, marginTop: 0 }}>
        Doar profesorul poate schimba PIN-ul. Confirmă cu PIN-ul curent.
      </p>
      <div className="pin-change-form">
        <input
          className="name-input"
          type="password"
          inputMode="numeric"
          placeholder="PIN curent"
          maxLength={8}
          value={current}
          onChange={(e) => {
            setCurrent(onlyDigits(e.target.value))
            setMsg(null)
          }}
        />
        <input
          className="name-input"
          type="password"
          inputMode="numeric"
          placeholder="PIN nou (min. 4 cifre)"
          maxLength={8}
          value={next}
          onChange={(e) => {
            setNext(onlyDigits(e.target.value))
            setMsg(null)
          }}
        />
        <input
          className="name-input"
          type="password"
          inputMode="numeric"
          placeholder="Confirmă PIN-ul nou"
          maxLength={8}
          value={confirm}
          onChange={(e) => {
            setConfirm(onlyDigits(e.target.value))
            setMsg(null)
          }}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
        />
        <button className="big-btn" onClick={submit}>
          Salvează PIN-ul nou 🔐
        </button>
      </div>
      {msg && (
        <div className={`feedback ${msg.ok ? 'good' : 'bad'}`} style={{ fontSize: 18 }}>
          {msg.text}
        </div>
      )}
    </div>
  )
}
