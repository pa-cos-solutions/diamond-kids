function toDigits(value, rods) {
  const digits = []
  let v = value
  for (let i = 0; i < rods; i++) {
    digits.push(v % 10)
    v = Math.floor(v / 10)
  }
  return digits.reverse() // index 0 = rodul din stânga (valoarea cea mai mare)
}

function fromDigits(digits) {
  return digits.reduce((acc, d) => acc * 10 + d, 0)
}

const PLACE_LABELS = ['1', '10', '100', '1000', '10000']

export default function Abacus({ value, onChange, rods, readonly = false }) {
  const digits = toDigits(value, rods)

  const setDigit = (rodIndex, digit) => {
    if (readonly) return
    const next = [...digits]
    next[rodIndex] = digit
    onChange(fromDigits(next))
  }

  const clickHeaven = (rodIndex) => {
    const d = digits[rodIndex]
    setDigit(rodIndex, d >= 5 ? d - 5 : d + 5)
  }

  // bilele de jos: index 0 este cea mai apropiată de bară
  const clickEarth = (rodIndex, beadIndex) => {
    const d = digits[rodIndex]
    const earth = d % 5
    const heaven = d >= 5 ? 5 : 0
    const newEarth = beadIndex < earth ? beadIndex : beadIndex + 1
    setDigit(rodIndex, heaven + newEarth)
  }

  return (
    <div className="abacus-wrap">
      <div className={`abacus ${readonly ? 'readonly' : ''}`}>
        {digits.map((d, rodIndex) => {
          const heavenActive = d >= 5
          const earth = d % 5
          return (
            <div className="abacus-rod" key={rodIndex}>
              <div className="heaven-zone">
                <div
                  className={`bead heaven ${heavenActive ? 'active' : ''}`}
                  onClick={() => clickHeaven(rodIndex)}
                />
              </div>
              <div className="abacus-bar" />
              <div className="earth-zone">
                {[0, 1, 2, 3].map((beadIndex) => (
                  <div
                    key={beadIndex}
                    className={`bead earth ${beadIndex < earth ? 'active' : ''}`}
                    onClick={() => clickEarth(rodIndex, beadIndex)}
                  />
                ))}
              </div>
              <div className="rod-label">{PLACE_LABELS[rods - 1 - rodIndex]}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
