// Curated palette of 12 vivid, high-contrast CSS colors for wheel segments.
const PALETTE = [
  '#f43f5e', // rose
  '#f59e0b', // amber
  '#10b981', // emerald
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f97316', // orange
  '#6366f1', // indigo
  '#84cc16', // lime
  '#e11d48', // rose-deep
  '#06b6d4', // cyan
]

/**
 * Returns an array of `count` CSS colors.
 * Cycles through the curated 12-color palette when count > 12.
 * @param {number} count - number of colors to return.
 */
export function getSegmentColors(count) {
  const n = Math.max(0, Math.floor(count))
  return Array.from({ length: n }, (_, i) => PALETTE[i % PALETTE.length])
}
