export default function NumberPad({ value, onChange, onSubmit }) {
  const press = (d) => {
    if (value.length >= 7) return
    onChange(value === '0' ? String(d) : value + d)
  }

  return (
    <div className="numpad">
      <div className="numpad-display">
        {value === '' ? <span className="placeholder">Scrie răspunsul…</span> : value}
      </div>
      <div className="numpad-grid">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
          <button key={d} className="numpad-key" onClick={() => press(d)}>
            {d}
          </button>
        ))}
        <button className="numpad-key action" onClick={() => onChange(value.slice(0, -1))}>
          ⌫
        </button>
        <button className="numpad-key" onClick={() => press(0)}>
          0
        </button>
        <button
          className="numpad-key submit"
          onClick={() => value !== '' && onSubmit(Number(value))}
        >
          ✔
        </button>
      </div>
    </div>
  )
}
