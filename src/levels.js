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

export const PRAISE = ['Bravo! 🎉', 'Corect! ⭐', 'Super! 🌟', 'Excelent! 🏆', 'Genial! 🤩', 'Așa da! 💪']
export const ENCOURAGE = ['Hmm, mai încearcă! 🤔', 'Aproape! Nu te da bătut! 💪', 'Ups! Următoarea va fi a ta! 🍀']

export function pick(arr) {
  return arr[rand(0, arr.length - 1)]
}
