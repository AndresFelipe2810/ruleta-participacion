// Synthesized sound effects using the Web Audio API (no external audio files).
// The AudioContext is created lazily and resumed on the first call.

let ctx = null

/**
 * Creates (once) and resumes the shared AudioContext.
 * Returns null if the browser blocks/unsupports audio.
 */
function ensureCtx() {
  try {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext
      if (!AC) return null
      ctx = new AC()
    }
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {})
    }
    return ctx
  } catch (err) {
    return null
  }
}

/**
 * Plays a single tone with a short exponential gain envelope.
 * Returns immediately; never throws.
 */
function playTone({
  frequency,
  start,
  duration,
  type = 'triangle',
  volume = 0.25,
  attack = 0.005,
}) {
  const audio = ensureCtx()
  if (!audio) return

  try {
    const osc = audio.createOscillator()
    const gain = audio.createGain()
    const now = audio.currentTime + start

    osc.type = type
    osc.frequency.setValueAtTime(frequency, now)

    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(volume, now + attack)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration)

    osc.connect(gain)
    gain.connect(audio.destination)

    osc.start(now)
    osc.stop(now + duration + 0.05)
  } catch (err) {
    // Silent: audio should never break the app.
  }
}

/**
 * Short "click": square oscillator around 1200Hz for ~0.03s.
 */
export function playTick() {
  playTone({
    frequency: 1200,
    type: 'square',
    duration: 0.03,
    volume: 0.12,
    start: 0,
  })
}

/**
 * Victory fanfare: ascending arpeggio (C5-E5-G5-C6) with a triangle oscillator.
 */
export function playVictory() {
  const notes = [523.25, 659.25, 783.99, 1046.5] // C5, E5, G5, C6
  notes.forEach((freq, i) => {
    playTone({
      frequency: freq,
      type: 'triangle',
      duration: 0.35,
      volume: 0.22,
      start: i * 0.11,
    })
  })
}
