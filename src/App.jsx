import { useCallback, useEffect, useRef, useState } from 'react'
import { Dices } from 'lucide-react'
import GroupTopBar from './components/GroupTopBar'
import WheelSection from './components/WheelSection'
import ParticipantsPanel from './components/ParticipantsPanel'
import WinnerModal from './components/WinnerModal'
import { useWheelSpin } from './hooks/useWheelSpin'
import { useLocalStorage } from './hooks/useLocalStorage'
import { useAudio } from './hooks/useAudio'

// La app arranca LIMPIA: sin grupos demo, en "Lista Temporal / Modo Libre".
const uuid = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`

export default function App() {
  const [grupos, setGrupos] = useLocalStorage('ruleta:grupos', [])
  const [grupoSeleccionadoId, setGrupoSeleccionadoId] = useLocalStorage('ruleta:grupoId', null)
  const [estudiantesActivos, setEstudiantesActivos] = useLocalStorage('ruleta:activos', [])
  const [superMode, setSuperMode] = useLocalStorage('ruleta:super', false)
  const [theme, setTheme] = useLocalStorage('ruleta:theme', 'dark')
  const [ganador, setGanador] = useState(null)
  const [savedAt, setSavedAt] = useState(null)

  const audio = useAudio()

  // Aplica la clase de tema al <html> para que los tokens CSS resuelvan.
  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
    root.classList.toggle('light', theme === 'light')
  }, [theme])

  // Guarda el ganador en un ref: se decide al pulsar GIRAR y se muestra al detenerse.
  const winnerRef = useRef(null)
  const onFinish = useCallback(() => {
    const w = winnerRef.current
    if (w) setGanador(w)
  }, [])

  const { rotation, isSpinning, girar } = useWheelSpin({
    tick: audio.tick,
    victory: audio.victory,
    onFinish,
  })

  /* ---------- Lista activa (lista de trabajo) ----------
     La barra lateral es la lista de hoy: se puede editar libremente y NO toca
     los grupos guardados. Cuando hay un grupo seleccionado, los cambios se
     confirman de forma explícita con el botón "Guardar en [grupo]". */
  const handleAgregar = useCallback(
    (nombre) => setEstudiantesActivos((prev) => [...prev, nombre]),
    [setEstudiantesActivos]
  )

  const handleEliminarEstudiante = useCallback(
    (index) => setEstudiantesActivos((prev) => prev.filter((_, i) => i !== index)),
    [setEstudiantesActivos]
  )

  const handleVaciar = useCallback(() => setEstudiantesActivos([]), [setEstudiantesActivos])

  // Al pulsar "Guardar en [grupo]" se copia la lista actual al grupo seleccionado.
  const handleGuardarLista = useCallback(() => {
    if (!grupoSeleccionadoId) return
    setGrupos((prev) =>
      prev.map((g) =>
        g.id === grupoSeleccionadoId ? { ...g, estudiantes: [...estudiantesActivos] } : g
      )
    )
    setSavedAt(Date.now())
  }, [grupoSeleccionadoId, estudiantesActivos, setGrupos])

  /* ---------- Grupos (maestros) ---------- */
  const handleSelectGrupo = useCallback(
    (id) => {
      if (id === null) {
        setGrupoSeleccionadoId(null)
        return
      }
      const grupo = grupos.find((g) => g.id === id)
      if (!grupo) return
      setGrupoSeleccionadoId(id)
      setEstudiantesActivos([...grupo.estudiantes])
    },
    [grupos, setGrupoSeleccionadoId, setEstudiantesActivos]
  )

  // Crear un grupo guarda también los participantes actuales (o queda vacío).
  // Si ya existe un grupo con ese nombre, se actualiza con la lista actual.
  const handleCrearGrupo = useCallback(
    (nombre) => {
      const n = nombre.trim()
      if (!n) return
      const existente = grupos.find((g) => g.nombre.toLowerCase() === n.toLowerCase())
      if (existente) {
        setGrupos((prev) =>
          prev.map((g) =>
            g.id === existente.id ? { ...g, estudiantes: [...estudiantesActivos] } : g
          )
        )
        setGrupoSeleccionadoId(existente.id)
      } else {
        const nuevo = { id: uuid(), nombre: n, estudiantes: [...estudiantesActivos] }
        setGrupos((prev) => [...prev, nuevo])
        setGrupoSeleccionadoId(nuevo.id)
      }
    },
    [grupos, estudiantesActivos, setGrupos, setGrupoSeleccionadoId]
  )

  const handleRenombrarGrupo = useCallback(
    (id, nombre) => {
      const n = nombre.trim()
      if (!n) return
      setGrupos((prev) => prev.map((g) => (g.id === id ? { ...g, nombre: n } : g)))
    },
    [setGrupos]
  )

  const handleEliminarGrupo = useCallback(
    (id) => {
      setGrupos((prev) => prev.filter((g) => g.id !== id))
      if (grupoSeleccionadoId === id) setGrupoSeleccionadoId(null)
    },
    [grupoSeleccionadoId, setGrupos, setGrupoSeleccionadoId]
  )

  /* ---------- Giro ---------- */
  const handleGirar = useCallback(() => {
    if (isSpinning || estudiantesActivos.length === 0) return
    const idx = girar({ numEstudiantes: estudiantesActivos.length, superMode })
    if (idx !== null) {
      winnerRef.current = { nombre: estudiantesActivos[idx], index: idx }
    }
  }, [isSpinning, estudiantesActivos, superMode, girar])

  const handleMantener = useCallback(() => setGanador(null), [])
  const handleEliminarGanador = useCallback(() => {
    const w = ganador
    if (!w) return
    setEstudiantesActivos((prev) => prev.filter((_, i) => i !== w.index))
    setGanador(null)
  }, [ganador, setEstudiantesActivos])

  const handleToggleTheme = useCallback(
    (next) => setTheme(next),
    [setTheme]
  )

  // Grupo activo + si la lista de trabajo tiene cambios sin guardar.
  const grupoActivo = grupos.find((g) => g.id === grupoSeleccionadoId) ?? null
  const dirty = !!grupoActivo && (
    grupoActivo.estudiantes.length !== estudiantesActivos.length ||
    grupoActivo.estudiantes.some((e, i) => e !== estudiantesActivos[i])
  )

  return (
    <div className="min-h-screen px-4 pb-12 pt-6 text-ink sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        {/* Título */}
        <header className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-cyan-400 shadow-glow-accent-lg">
            <Dices className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">
              Ruleta de Participación
            </h1>
            <p className="text-sm text-ink-faint">Gira, elige al azar y celebra el ganador.</p>
          </div>
        </header>

        {/* Barra superior de control de grupos */}
        <GroupTopBar
          grupos={grupos}
          grupoSeleccionadoId={grupoSeleccionadoId}
          onSelectGrupo={handleSelectGrupo}
          onCrearGrupo={handleCrearGrupo}
          onRenombrarGrupo={handleRenombrarGrupo}
          onEliminarGrupo={handleEliminarGrupo}
          estudiantesActivos={estudiantesActivos}
          superMode={superMode}
          onToggleSuper={() => setSuperMode((v) => !v)}
          theme={theme}
          onToggleTheme={handleToggleTheme}
        />

        {/* Área principal: ruleta (centro) + participantes (lateral).
            En mobile, si la lista está vacía el panel va arriba para poder
            escribir enseguida; al añadir, la ruleta sube al tope. */}
        <main className="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_360px]">
          <WheelSection
            estudiantes={estudiantesActivos}
            rotation={rotation}
            isSpinning={isSpinning}
            superMode={superMode}
            onGirar={handleGirar}
            soundEnabled={audio.soundEnabled}
            onToggleSound={audio.toggleSound}
            className={estudiantesActivos.length === 0 ? 'order-2 lg:order-none' : ''}
          />

          <ParticipantsPanel
            estudiantes={estudiantesActivos}
            onAgregar={handleAgregar}
            onEliminar={handleEliminarEstudiante}
            onVaciar={handleVaciar}
            disabled={isSpinning}
            grupoNombre={grupoActivo ? grupoActivo.nombre : null}
            onGuardarLista={grupoActivo ? handleGuardarLista : null}
            dirty={dirty}
            savedAt={savedAt}
            className={estudiantesActivos.length === 0 ? 'order-1 lg:order-none' : ''}
          />
        </main>
      </div>

      <WinnerModal
        ganador={ganador ? ganador.nombre : null}
        onMantener={handleMantener}
        onEliminar={handleEliminarGanador}
      />
    </div>
  )
}
