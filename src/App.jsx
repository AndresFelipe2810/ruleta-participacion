import { useCallback, useEffect, useRef, useState } from 'react'
import { Dices, Info } from 'lucide-react'
import GroupTopBar from './components/GroupTopBar'
import WheelSection from './components/WheelSection'
import ParticipantsPanel from './components/ParticipantsPanel'
import GroupManager from './components/GroupManager'
import GroupManagerModal from './components/GroupManagerModal'
import InfoModal from './components/InfoModal'
import MobileTabs from './components/MobileTabs'
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
  const [grupoCargadoId, setGrupoCargadoId] = useLocalStorage('ruleta:grupoId', null)
  const [estudiantesActivos, setEstudiantesActivos] = useLocalStorage('ruleta:activos', [])
  const [superMode, setSuperMode] = useLocalStorage('ruleta:super', false)
  const [theme, setTheme] = useLocalStorage('ruleta:theme', 'dark')
  const [ganador, setGanador] = useState(null)
  const [gestorAbierto, setGestorAbierto] = useState(false)
  const [infoAbierta, setInfoAbierta] = useState(false)
  const [tabMovil, setTabMovil] = useState('ruleta')

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

  /* ---------- Lista activa (copia de trabajo de la ronda) ----------
     Editar aquí NO toca los grupos maestros. El grupo se restaura con
     "Reiniciar Ronda". */
  const handleAgregar = useCallback(
    (nombre) => setEstudiantesActivos((prev) => [...prev, nombre]),
    [setEstudiantesActivos]
  )

  const handleEliminarEstudiante = useCallback(
    (index) => setEstudiantesActivos((prev) => prev.filter((_, i) => i !== index)),
    [setEstudiantesActivos]
  )

  const handleVaciar = useCallback(() => setEstudiantesActivos([]), [setEstudiantesActivos])

  /* ---------- Cargar grupo a la ruleta (copia del maestro) ---------- */
  const cargarGrupo = useCallback(
    (id) => {
      if (id === null) {
        setGrupoCargadoId(null) // Lista Temporal: se conserva la lista activa libre
        return
      }
      const grupo = grupos.find((g) => g.id === id)
      if (!grupo) return
      setGrupoCargadoId(id)
      setEstudiantesActivos([...grupo.estudiantes])
    },
    [grupos, setGrupoCargadoId, setEstudiantesActivos]
  )

  // Desde el Gestor: carga y cierra el modal / cambia a la pestaña Ruleta.
  const cargarDesdeGestor = useCallback(
    (id) => {
      cargarGrupo(id)
      setGestorAbierto(false)
      setTabMovil('ruleta')
    },
    [cargarGrupo]
  )

  // Reiniciar Ronda: restaura todos los integrantes del grupo maestro en 1 clic.
  const handleReiniciarRonda = useCallback(() => {
    if (!grupoCargadoId) return
    const grupo = grupos.find((g) => g.id === grupoCargadoId)
    if (!grupo) return
    setEstudiantesActivos([...grupo.estudiantes])
  }, [grupoCargadoId, grupos, setEstudiantesActivos])

  /* ---------- Grupos (maestros, se editan solo en el Gestor) ---------- */
  // Crear grupo nuevo = SIEMPRE vacío (nunca hereda participantes).
  const handleCrearGrupo = useCallback(
    (nombre) => {
      const n = nombre.trim()
      if (!n) return
      const existente = grupos.find((g) => g.nombre.toLowerCase() === n.toLowerCase())
      if (existente) return
      const nuevo = { id: uuid(), nombre: n, estudiantes: [] }
      setGrupos((prev) => [...prev, nuevo])
    },
    [grupos, setGrupos]
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
      if (grupoCargadoId === id) setGrupoCargadoId(null)
    },
    [grupoCargadoId, setGrupos, setGrupoCargadoId]
  )

  const handleActualizarGrupo = useCallback(
    (id, estudiantes) => {
      setGrupos((prev) =>
        prev.map((g) => (g.id === id ? { ...g, estudiantes: [...estudiantes] } : g))
      )
    },
    [setGrupos]
  )

  /* ---------- Giro ---------- */
  const handleGirar = useCallback(() => {
    if (isSpinning || estudiantesActivos.length === 0) return
    // El ganador se elige dentro de `girar` de forma criptográficamente segura e
    // independiente en cada giro; devuelve el índice elegido.
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

  const handleToggleTheme = useCallback((next) => setTheme(next), [setTheme])

  const grupoActivo = grupos.find((g) => g.id === grupoCargadoId) ?? null

  return (
    <div className="min-h-screen px-4 pb-24 pt-6 text-ink sm:px-6 lg:pb-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        {/* Título */}
        <header className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-cyan-400 shadow-glow-accent-lg">
              <Dices className="h-6 w-6 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">
                Ruleta de Participación
              </h1>
              <p className="text-sm text-ink-faint">Gira, elige al azar y celebra el ganador.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setInfoAbierta(true)}
            aria-label="Abrir guía de uso"
            title="Guía de uso"
            className="shrink-0 rounded-xl border border-glass-border bg-glass p-2.5 text-ink-soft transition hover:bg-glass-strong hover:text-ink"
          >
            <Info className="h-5 w-5" />
          </button>
        </header>

        {/* Barra superior: selector de grupo + Gestionar Grupos + Modo Super + tema */}
        <GroupTopBar
          grupos={grupos}
          grupoCargadoId={grupoCargadoId}
          onSelectGrupo={cargarGrupo}
          onOpenGestor={() => setGestorAbierto(true)}
          superMode={superMode}
          onToggleSuper={() => setSuperMode((v) => !v)}
          theme={theme}
          onToggleTheme={handleToggleTheme}
        />

        {/* Área principal. Desktop (lg): ruleta + participantes lado a lado.
            Mobile: solo la pestaña activa (Ruleta | Participantes | Mis Grupos). */}
        <main className="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className={tabMovil === 'ruleta' ? '' : 'hidden lg:block'}>
            <WheelSection
              estudiantes={estudiantesActivos}
              rotation={rotation}
              isSpinning={isSpinning}
              superMode={superMode}
              onGirar={handleGirar}
              soundEnabled={audio.soundEnabled}
              onToggleSound={audio.toggleSound}
            />
          </div>

          <div className={tabMovil === 'participantes' ? '' : 'hidden lg:block'}>
            <ParticipantsPanel
              estudiantes={estudiantesActivos}
              onAgregar={handleAgregar}
              onEliminar={handleEliminarEstudiante}
              onVaciar={handleVaciar}
              onReiniciar={handleReiniciarRonda}
              grupoNombre={grupoActivo ? grupoActivo.nombre : null}
              disabled={isSpinning}
            />
          </div>

          {/* Mis Grupos: solo como pestaña en mobile; en desktop va en el modal */}
          <div className={tabMovil === 'grupos' ? 'lg:hidden' : 'hidden'}>
            <GroupManager
              grupos={grupos}
              grupoCargadoId={grupoCargadoId}
              onCrearGrupo={handleCrearGrupo}
              onRenombrarGrupo={handleRenombrarGrupo}
              onEliminarGrupo={handleEliminarGrupo}
              onActualizarGrupo={handleActualizarGrupo}
              onCargarGrupo={cargarDesdeGestor}
            />
          </div>
        </main>
      </div>

      {/* Navegación inferior mobile/tablet */}
      <MobileTabs activa={tabMovil} onChange={setTabMovil} />

      {/* Gestor de Grupos (escritorio): modal a pantalla completa */}
      <GroupManagerModal
        abierto={gestorAbierto}
        onClose={() => setGestorAbierto(false)}
        grupos={grupos}
        grupoCargadoId={grupoCargadoId}
        onCrearGrupo={handleCrearGrupo}
        onRenombrarGrupo={handleRenombrarGrupo}
        onEliminarGrupo={handleEliminarGrupo}
        onActualizarGrupo={handleActualizarGrupo}
        onCargarGrupo={cargarDesdeGestor}
      />

      <WinnerModal
        ganador={ganador ? ganador.nombre : null}
        onMantener={handleMantener}
        onEliminar={handleEliminarGanador}
      />

      {/* Guía / Manual de primeros pasos */}
      <InfoModal abierto={infoAbierta} onClose={() => setInfoAbierta(false)} />
    </div>
  )
}
