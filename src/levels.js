export const LEVELS = [
  {
    id: 1,
    name: 'Începător',
    age: '5–6 ani',
    emoji: '🐣',
    color: '#22c55e',
    drill: { ops: ['+', '-'], addMax: 10, mulA: null, mulB: null },
    flash: { min: 1, max: 5, neg: false, defaultCount: 3, defaultSpeed: 2500 },
    memory: { start: 2 },
    abacus: { rods: 2 },
  },
  {
    id: 2,
    name: 'Elementar',
    age: '6–7 ani',
    emoji: '🐥',
    color: '#0ea5e9',
    drill: { ops: ['+', '-'], addMax: 20, mulA: null, mulB: null },
    flash: { min: 1, max: 9, neg: false, defaultCount: 4, defaultSpeed: 2000 },
    memory: { start: 3 },
    abacus: { rods: 2 },
  },
  {
    id: 3,
    name: 'Mediu',
    age: '8–9 ani',
    emoji: '🦊',
    color: '#f59e0b',
    drill: { ops: ['+', '-', '×'], addMax: 100, mulA: [2, 5], mulB: [2, 10] },
    flash: { min: 1, max: 9, neg: true, defaultCount: 5, defaultSpeed: 1500 },
    memory: { start: 4 },
    abacus: { rods: 3 },
  },
  {
    id: 4,
    name: 'Avansat',
    age: '10–11 ani',
    emoji: '🦁',
    color: '#f97316',
    drill: { ops: ['+', '-', '×', '÷'], addMax: 1000, mulA: [2, 10], mulB: [2, 10] },
    flash: { min: 10, max: 99, neg: false, defaultCount: 5, defaultSpeed: 1500 },
    memory: { start: 5 },
    abacus: { rods: 4 },
  },
  {
    id: 5,
    name: 'Expert',
    age: '11–12 ani',
    emoji: '🚀',
    color: '#a855f7',
    drill: { ops: ['+', '-', '×', '÷'], addMax: 10000, mulA: [11, 99], mulB: [2, 9] },
    flash: { min: 10, max: 99, neg: true, defaultCount: 6, defaultSpeed: 1000 },
    memory: { start: 6 },
    abacus: { rods: 5 },
  },
]

export const OP_NAMES = {
  '+': 'Adunare',
  '-': 'Scădere',
  '×': 'Înmulțire',
  '÷': 'Împărțire',
}

export function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function makeQuestion(level, ops) {
  const op = ops[rand(0, ops.length - 1)]
  const { addMax, mulA, mulB } = level.drill
  let a, b, answer
  switch (op) {
    case '+':
      a = rand(1, addMax - 1)
      b = rand(1, addMax - a)
      answer = a + b
      break
    case '-':
      a = rand(2, addMax)
      b = rand(1, a - 1)
      answer = a - b
      break
    case '×':
      a = rand(mulA[0], mulA[1])
      b = rand(mulB[0], mulB[1])
      answer = a * b
      break
    case '÷': {
      const divisor = rand(mulB[0], mulB[1])
      const quotient = rand(2, mulA[1] > 10 ? 12 : 10)
      a = divisor * quotient
      b = divisor
      answer = quotient
      break
    }
    default:
      a = 1; b = 1; answer = 2
  }
  return { a, b, op, answer, text: `${a} ${op} ${b}` }
}

// Generator configurabil pentru profesor — exerciții „noi" după parametri liberi
export function makeCustomExercise({ ops, maxOperand }) {
  const op = pick(ops)
  const factorMax = Math.min(maxOperand, 12) // ×/÷ rămân rezonabile pentru copii
  let a, b, answer
  switch (op) {
    case '+':
      a = rand(1, maxOperand); b = rand(1, maxOperand); answer = a + b; break
    case '-':
      a = rand(1, maxOperand); b = rand(0, a); answer = a - b; break
    case '×':
      a = rand(1, factorMax); b = rand(1, factorMax); answer = a * b; break
    case '÷': {
      b = rand(2, factorMax); answer = rand(1, factorMax); a = b * answer; break
    }
    default:
      a = 1; b = 1; answer = 2
  }
  return { text: `${a} ${op} ${b}`, answer }
}

// Construiește o fișă de `count` exerciții, evitând duplicatele
export function generateWorksheet({ ops, maxOperand, count }) {
  const out = []
  const seen = new Set()
  let guard = 0
  while (out.length < count && guard < count * 40) {
    guard++
    const ex = makeCustomExercise({ ops, maxOperand })
    if (seen.has(ex.text)) continue
    seen.add(ex.text)
    out.push(ex)
  }
  return out
}

export function makeFlashSequence(level, count) {
  const { min, max, neg } = level.flash
  const numbers = []
  let total = 0
  for (let i = 0; i < count; i++) {
    let n = rand(min, max)
    // după primul număr putem scădea, dar fără să coborâm sub zero
    if (neg && i > 0 && total > min && Math.random() < 0.4) {
      n = -rand(min, Math.min(max, total))
    }
    numbers.push(n)
    total += n
  }
  return { numbers, total }
}

// ---- Test de nivel (evaluare inițială) ----
export function makePlacementTest() {
  const qs = []
  for (const lid of [1, 2, 3, 4]) {
    const lvl = LEVELS.find((l) => l.id === lid)
    qs.push(makeQuestion(lvl, lvl.drill.ops))
    qs.push(makeQuestion(lvl, lvl.drill.ops))
  }
  return qs // 8 întrebări, dificultate crescătoare
}

export function recommendLevel(correct) {
  if (correct <= 2) return 1
  if (correct <= 4) return 2
  if (correct <= 6) return 3
  if (correct <= 7) return 4
  return 5
}

// ---- Mini-tutor pe bază de reguli (explică greșeala) ----
export function explain(a, op, b, answer) {
  switch (op) {
    case '+':
      return `Adună întâi zecile, apoi unitățile: ${a} + ${b} = ${answer}.`
    case '-':
      return `Pornește de la ${b} și numără în sus până la ${a} — diferența este ${answer}.`
    case '×':
      return `${a} × ${b} înseamnă ${a} adunat de ${b} ori, adică ${answer}.`
    case '÷':
      return `Caută numărul care înmulțit cu ${b} dă ${a}: este ${answer}, pentru că ${b} × ${answer} = ${a}.`
    default:
      return `Răspunsul corect este ${answer}.`
  }
}

// ---- Insigne (badges) ----
export const BADGES = [
  { id: 'first', icon: '🌱', name: 'Primul pas', test: (p) => (p.totalCorrect || 0) >= 1 },
  { id: 'streak3', icon: '🔥', name: 'Serie de 3 zile', test: (p) => (p.streak || 0) >= 3 },
  { id: 'streak7', icon: '🏅', name: 'O săptămână întreagă', test: (p) => (p.streak || 0) >= 7 },
  { id: 'perfect', icon: '🏆', name: 'Rundă perfectă', test: (p) => (p.perfectRounds || 0) >= 1 },
  { id: 'stars50', icon: '⭐', name: '50 de stele', test: (p) => (p.stars || 0) >= 50 },
  { id: 'stars200', icon: '💫', name: '200 de stele', test: (p) => (p.stars || 0) >= 200 },
  { id: 'correct100', icon: '💯', name: '100 de răspunsuri corecte', test: (p) => (p.totalCorrect || 0) >= 100 },
  { id: 'coins100', icon: '🪙', name: '100 de monede', test: (p) => (p.coins || 0) >= 100 },
]

export function earnedBadges(profile) {
  return BADGES.filter((b) => b.test(profile)).map((b) => b.id)
}

// ---- Date (zi / săptămână) pentru streak ----
export function dayKey(d = new Date()) {
  return d.toISOString().slice(0, 10) // YYYY-MM-DD
}
export function yesterdayKey() {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return dayKey(d)
}

export const PRAISE = ['Bravo! 🎉', 'Corect! ⭐', 'Super! 🌟', 'Excelent! 🏆', 'Genial! 🤩', 'Așa da! 💪']
export const ENCOURAGE = ['Hmm, mai încearcă! 🤔', 'Aproape! Nu te da bătut! 💪', 'Ups! Următoarea va fi a ta! 🍀']

export function pick(arr) {
  return arr[rand(0, arr.length - 1)]
}
