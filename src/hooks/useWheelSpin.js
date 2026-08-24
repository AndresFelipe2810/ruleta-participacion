import { useCallback, useEffect, useRef, useState } from 'react'
import { pickRandomIndex, randomBetween, secureRandom } from '../utils/random'
import { fireConfetti } from '../utils/confetti'

const FAKE_OUT_PROBABILITY = 0.17 // Modo Super: falsa parada en 15-20% de los giros
const POINTER_ANGLE = 1.5 * Math.PI // Puntero superior (12 en punto)
const TICK_GAP_MS = 28 // Frecuencia máxima de clics (evita ráfagas excesivas)

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3)
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

/**
 * Orquesta la animación de la ruleta.
 *
 * El ganador se decide ANTES de girar, de forma criptográficamente segura
 * (crypto.getRandomValues()) e independiente en cada giro: cada participante
 * tiene la misma probabilidad y no hay memoria entre giros. La animación es
 * puramente visual y siempre termina alineando la tajada ganadora con el
 * puntero. El "Modo Super" añade una falsa parada.
 *
 * @param {{ tick: () => void, victory: () => void, onFinish: (index: number) => void }} opts
 * @returns {{ rotation: number, isSpinning: boolean, girar: (arg: { numEstudiantes: number, superMode: boolean }) => number | null }}
 */
export function useWheelSpin({ tick, victory, onFinish }) {
  const [rotation, setRotation] = useState(0)
  const [isSpinning, setIsSpinning] = useState(false)

  const rotationRef = useRef(0)
  const spinningRef = useRef(false)
  const rafRef = useRef(null)
  const lastTickRef = useRef(0)

  // Los callbacks viven en un ref para que `girar` sea estable.
  const cbRef = useRef({ tick, victory, onFinish })
  useEffect(() => {
    cbRef.current = { tick, victory, onFinish }
  }, [tick, victory, onFinish])

  useEffect(() => () => cancelAnimationFrame(rafRef.current), [])

  const girar = useCallback(
    ({ numEstudiantes, superMode }) => {
      if (spinningRef.current || numEstudiantes === 0) return null

      const n = numEstudiantes
      const arcSize = (2 * Math.PI) / n

      // 1. Ganador decidido ANTES de girar, de forma criptográficamente segura
      //    e independiente: cada participante tiene la misma probabilidad en
      //    cada giro, sin memoria de giros anteriores.
      const indexGanador = pickRandomIndex(n)

      // 2. ¿El Modo Super dispara una falsa parada?
      const fakeOut = !!superMode && secureRandom() < FAKE_OUT_PROBABILITY

      const start = rotationRef.current

      // Delta de rotación que deja la tajada `index` (con un offset aleatorio
      // dentro de la tajada, para no caer en un borde) justo bajo el puntero.
      // Se resta `start % 2π` (no `start` entero): la rotación es acumulativa
      // y crece sin límite entre giros, así que solo importa su fase.
      const deltaFor = (index) => {
        const offset = randomBetween(0.15, 0.85) * arcSize
        const sliceCenter = index * arcSize + offset
        return POINTER_ANGLE - (start % (2 * Math.PI)) - sliceCenter
      }

      // Tajada "falsa": 1-3 puestos antes del ganador real.
      let fakeIndex = null
      let fakeTarget = null
      let realTarget = null

      if (fakeOut && n > 2) {
        fakeIndex = (indexGanador + 1 + Math.floor(secureRandom() * 3)) % n
        const fakeDelta = deltaFor(fakeIndex)
        const fakeSpins = (4 + Math.floor(secureRandom() * 3)) * 2 * Math.PI
        fakeTarget = start + fakeSpins + fakeDelta

        const realDelta = deltaFor(indexGanador)
        // Empujón final: distancia angular mínima (en sentido horario) desde
        // la parada falsa hasta caer en el ganador real (menos de una vuelta).
        // Alinea el centro real con el puntero: push ≡ fakeCenter − realCenter.
        let push = realDelta - fakeDelta
        push = ((push % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)
        if (push === 0) push = 2 * Math.PI
        realTarget = fakeTarget + push
      } else {
        const realDelta = deltaFor(indexGanador)
        const fullSpins = (6 + Math.floor(secureRandom() * 4)) * 2 * Math.PI
        realTarget = start + fullSpins + realDelta
      }

      spinningRef.current = true
      setIsSpinning(true)

      const duration = fakeOut ? 6500 : 4500
      const startTime = performance.now()

      const frame = (now) => {
        const elapsed = now - startTime
        const progress = Math.min(elapsed / duration, 1)

        let target
        if (fakeOut) {
          if (progress < 0.7) {
            // Fase 1: desacelera fuerte como si fuera a parar en el falso ganador.
            const p = progress / 0.7
            target = start + (fakeTarget - start) * easeOutCubic(p)
          } else {
            // Fase 2: empujón sutil para caer en el ganador real.
            const p = (progress - 0.7) / 0.3
            target = fakeTarget + (realTarget - fakeTarget) * easeInOutCubic(p)
          }
        } else {
          target = start + (realTarget - start) * easeOutCubic(progress)
        }

        // Clic por cada borde de tajada que pasa bajo el puntero.
        const prev = rotationRef.current
        const ticks = Math.floor((target - POINTER_ANGLE) / arcSize) -
          Math.floor((prev - POINTER_ANGLE) / arcSize)
        if (ticks > 0 && now - lastTickRef.current >= TICK_GAP_MS) {
          cbRef.current.tick()
          lastTickRef.current = now
        }

        rotationRef.current = target
        setRotation(target)

        if (progress < 1) {
          rafRef.current = requestAnimationFrame(frame)
        } else {
          spinningRef.current = false
          setIsSpinning(false)
          cbRef.current.victory()
          fireConfetti()
          cbRef.current.onFinish(indexGanador)
        }
      }

      rafRef.current = requestAnimationFrame(frame)
      return indexGanador
    },
    []
  )

  return { rotation, isSpinning, girar }
}
