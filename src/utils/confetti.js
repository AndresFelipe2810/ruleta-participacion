import confetti from 'canvas-confetti'

const COLORS = ['#f43f5e', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6']

/**
 * Fires an elegant two-burst confetti explosion (60° and 120°).
 */
export function fireConfetti() {
  const defaults = {
    particleCount: 120,
    spread: 70,
    gravity: 0.8,
    colors: COLORS,
    scalar: 1.1,
    ticks: 220,
    zIndex: 100,
  }

  confetti({
    ...defaults,
    angle: 60,
    origin: { x: 0.15, y: 0.85 },
  })
  confetti({
    ...defaults,
    angle: 120,
    origin: { x: 0.85, y: 0.85 },
  })
}
