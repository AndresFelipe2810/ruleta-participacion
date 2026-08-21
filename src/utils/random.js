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
