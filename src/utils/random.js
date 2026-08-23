// Cryptographically-secure random helpers built on crypto.getRandomValues.

/**
 * Returns a random float in [0, 1) using crypto.getRandomValues().
 * Falls back to Math.random() if the Web Crypto API is unavailable.
 */
export function secureRandom() {
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const array = new Uint32Array(1)
    crypto.getRandomValues(array)
    return array[0] / (0xffffffff + 1)
  }
  return Math.random()
}

/**
 * Returns a random integer in [0, n-1] (inclusive) using a secure source.
 * @param {number} n - upper bound (exclusive). Must be >= 1.
 */
export function pickRandomIndex(n) {
  if (!Number.isFinite(n) || n <= 0) return 0
  return Math.min(n - 1, Math.floor(secureRandom() * n))
}

/**
 * Returns a random float in [min, max).
 * @param {number} min - lower bound (inclusive)
 * @param {number} max - upper bound (exclusive)
 */
export function randomBetween(min, max) {
  return min + secureRandom() * (max - min)
}

/**
 * Fisher-Yates shuffle criptográfico. No muta el array original.
 * @param {Array} arr
 * @returns {Array} copia barajada
 */
export function shuffleArray(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(secureRandom() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * Bolsa de selección uniforme (Shuffle Bag) con evitación de repetición
 * consecutiva.
 *
 * Baraja `items` y, si hay más de `avoidRepeatThreshold` opciones y el primer
 * elemento es el último ganador, lo intercambia con otro distinto. Así el mismo
 * participante no vuelve a salir en el giro siguiente sin sesgar la
 * uniformidad (la bolsa sigue conteniendo todos los elementos una sola vez).
 *
 * @param {Array} items - elementos a meter en la bolsa
 * @param {*} lastWinner - último ganador (comparado por igualdad estricta)
 * @param {{ avoidRepeatThreshold?: number }} [opts]
 * @returns {Array} bolsa barajada
 */
export function createShuffleBag(items, lastWinner, { avoidRepeatThreshold = 3 } = {}) {
  const bag = shuffleArray(items)
  if (bag.length > 1 && items.length > avoidRepeatThreshold && bag[0] === lastWinner) {
    const swapIdx = bag.findIndex((x, i) => i > 0 && x !== lastWinner)
    if (swapIdx > 0) {
      ;[bag[0], bag[swapIdx]] = [bag[swapIdx], bag[0]]
    }
  }
  return bag
}
