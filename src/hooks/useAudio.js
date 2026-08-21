import { useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { playTick, playVictory } from '../utils/audio'

/**
 * Sound settings + play helpers. Playback only happens when sound is enabled.
 * @returns {{ soundEnabled: boolean, toggleSound: () => void, tick: () => void, victory: () => void }}
 */
export function useAudio() {
  const [soundEnabled, setSoundEnabled] = useLocalStorage('ruleta:sound', true)

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => !prev)
  }, [setSoundEnabled])

  const tick = useCallback(() => {
    if (soundEnabled) playTick()
  }, [soundEnabled])

  const victory = useCallback(() => {
    if (soundEnabled) playVictory()
  }, [soundEnabled])

  return { soundEnabled, toggleSound, tick, victory }
}
