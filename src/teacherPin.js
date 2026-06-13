// PIN-ul profesorului, păstrat local pe acest dispozitiv.
// Sursă unică folosită de poarta de acces (TeacherGate) și de schimbarea PIN-ului.
const PIN_KEY = 'dk-teacher-pin'

export function getPin() {
  return localStorage.getItem(PIN_KEY)
}

export function setPin(pin) {
  localStorage.setItem(PIN_KEY, pin)
}

export function hasPin() {
  return !!localStorage.getItem(PIN_KEY)
}
