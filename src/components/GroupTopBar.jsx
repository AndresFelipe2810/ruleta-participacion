import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Check,
  Dices,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react'
import ThemeSwitch from './ThemeSwitch'

const PROBABILIDAD_SUPER = '17%'
const POPOVER_W = 288

/**
 * Barra superior "Modern Glass" para la Ruleta de Participación.
 *
 * Mobile-first, dos filas compactas:
 *   Fila 1: logo + selector de grupo (+ renombrar/eliminar si hay grupo)
 *   Fila 2: Crear Grupo + Modo Super + tema
 * El modo renombrar ocupa la fila completa (nunca se solapa). El popover de
 * creación se posiciona con un portal a <body> + fixed clampado al viewport,
 * así nunca queda fuera de pantalla ni por debajo de la ruleta.
 *
 * Crear un grupo guarda automáticamente los participantes actuales (pista en
 * el popover). Los cambios en la barra lateral se sincronizan en vivo con el
 * grupo seleccionado (ver App.jsx → aplicarActivos).
 */
export default function GroupTopBar({
  grupos = [],
  grupoSeleccionadoId = null,
  onSelectGrupo,
  onCrearGrupo,
  onRenombrarGrupo,
  onEliminarGrupo,
  estudiantesActivos = [],
  superMode = false,
  onToggleSuper,
  theme = 'dark',
  onToggleTheme,
}) {
  const grupoSeleccionado = grupos.find((g) => g.id === grupoSeleccionadoId) ?? null

  // ---- Selector ----
  const [selectValue, setSelectValue] = useState(grupoSeleccionadoId ?? '')
  useEffect(() => {
    setSelectValue(grupoSeleccionadoId ?? '')
  }, [grupoSeleccionadoId])

  const handleSelectChange = (e) => {
    const value = e.target.value
    setSelectValue(value)
    setRenombrando(false)
    onSelectGrupo(value === '' ? null : value)
  }

  // ---- Renombrar / Eliminar ----
  const [renombrando, setRenombrando] = useState(false)
  const [renameValue, setRenameValue] = useState('')

  const iniciarRenombrar = () => {
    if (!grupoSeleccionado) return
    setRenameValue(grupoSeleccionado.nombre)
    setRenombrando(true)
  }

  const confirmarRenombrar = () => {
    const nombre = renameValue.trim()
    if (!nombre || !grupoSeleccionado) return
    setRenombrando(false)
    onRenombrarGrupo(grupoSeleccionado.id, nombre)
  }

  const confirmarEliminar = () => {
    if (!grupoSeleccionado) return
    if (window.confirm(`¿Eliminar el grupo "${grupoSeleccionado.nombre}"?`)) {
      onEliminarGrupo(grupoSeleccionado.id)
    }
  }

  // ---- Popover crear (portal a <body> + clamp al viewport) ----
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [popoverNombre, setPopoverNombre] = useState('')
  const [popoverPos, setPopoverPos] = useState(null)
  const popoverRef = useRef(null)
  const crearBtnRef = useRef(null)

  const abrirPopover = () => {
    if (popoverOpen) {
      setPopoverOpen(false)
      setPopoverPos(null)
      return
    }
    const btn = crearBtnRef.current
    if (btn) {
      const rect = btn.getBoundingClientRect()
      const left = Math.max(
        16,
        Math.min(Math.round(rect.left), window.innerWidth - POPOVER_W - 16)
      )
      setPopoverPos({ left, top: Math.round(rect.bottom + 8) })
    }
    setPopoverOpen(true)
  }

  useEffect(() => {
    if (!popoverOpen) return

    const cerrar = () => {
      setPopoverOpen(false)
      setPopoverPos(null)
    }

    // Cierre al tocar/hacer clic fuera del popover y del botón.
    // Se escucha touchstart además de mousedown para que funcione en Android.
    const handlePointerDown = (e) => {
      const inPopover = popoverRef.current && popoverRef.current.contains(e.target)
      const inButton = crearBtnRef.current && crearBtnRef.current.contains(e.target)
      if (!inPopover && !inButton) cerrar()
    }
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') cerrar()
    }

    // En móvil, el teclado virtual se abre al enfocar el input y dispara un
    // resize de SOLO altura (innerHeight). Eso no debe cerrar el popover;
    // solo se cierra ante un cambio real de ancho (rotación / split-screen).
    const anchoInicial = window.innerWidth
    const closeOnResize = () => {
      if (Math.abs(window.innerWidth - anchoInicial) > 40) cerrar()
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('touchstart', handlePointerDown, { passive: true })
    document.addEventListener('keydown', handleKeyDown)
    window.addEventListener('resize', closeOnResize)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('touchstart', handlePointerDown, { passive: true })
      document.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('resize', closeOnResize)
    }
  }, [popoverOpen])

  const confirmarPopover = () => {
    const nombre = popoverNombre.trim()
    if (!nombre) return
    onCrearGrupo(nombre)
    setPopoverNombre('')
    setPopoverOpen(false)
    setPopoverPos(null)
  }

  const nombreExiste = popoverNombre.trim() && grupos.some(
    (g) => g.nombre.toLowerCase() === popoverNombre.trim().toLowerCase()
  )

  return (
    <header className="glass-panel relative z-40 rounded-2xl p-4">
      {/* --- Modo renombrar: ocupa la fila completa para nunca solaparse --- */}
      {renombrando && grupoSeleccionado ? (
        <div className="flex w-full items-center gap-2">
          <Pencil className="h-4 w-4 shrink-0 text-emerald-400" />
          <input
            autoFocus
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') confirmarRenombrar()
              if (e.key === 'Escape') setRenombrando(false)
            }}
            placeholder="Nuevo nombre del grupo"
            aria-label="Nombre del grupo"
            className="glass-field min-w-0 flex-1"
          />
          <button
            type="button"
            onClick={confirmarRenombrar}
            aria-label="Confirmar renombrado"
            className="shrink-0 rounded-lg p-2 text-emerald-400 transition hover:bg-emerald-500/10"
          >
            <Check className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setRenombrando(false)}
            aria-label="Cancelar renombrado"
            className="shrink-0 rounded-lg p-2 text-ink-soft transition hover:bg-glass-strong hover:text-ink"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          {/* Fila 1: logo + selector (+ acciones del grupo en mobile) */}
          <div className="flex min-w-0 items-center gap-2 lg:flex-1">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-cyan-400 shadow-glow-accent">
              <Dices className="h-5 w-5 text-white" />
            </div>
            <select
              value={selectValue}
              onChange={handleSelectChange}
              aria-label="Grupo activo"
              className="glass-field min-w-0 flex-1"
            >
              <option value="">Lista Temporal / Modo Libre</option>
              {grupos.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.nombre} ({g.estudiantes.length})
                </option>
              ))}
            </select>
            {grupoSeleccionado && (
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={iniciarRenombrar}
                  aria-label="Renombrar grupo"
                  className="rounded-lg p-2 text-ink-soft transition hover:bg-glass-strong hover:text-ink"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={confirmarEliminar}
                  aria-label="Eliminar grupo"
                  className="rounded-lg p-2 text-rose-400 transition hover:bg-rose-500/10"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Fila 2: Crear Grupo + Modo Super + tema */}
          <div className="flex flex-wrap items-center gap-2 lg:ml-auto lg:shrink-0">
            <button
              ref={crearBtnRef}
              type="button"
              onClick={abrirPopover}
              className="btn-accent shrink-0 px-3 py-2.5 text-sm sm:px-4"
              aria-expanded={popoverOpen}
              aria-haspopup="true"
            >
              <Plus className="h-4 w-4" />
              Crear Grupo
            </button>

            {/* Toggle Modo Super (compacto en mobile: solo icono + knob) */}
            <motion.button
              type="button"
              role="switch"
              aria-checked={superMode}
              onClick={onToggleSuper}
              whileTap={{ scale: 0.97 }}
              className="flex shrink-0 items-center gap-2 rounded-xl border border-transparent px-1.5 py-1.5 text-left transition-colors hover:bg-glass-strong"
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors ${
                  superMode
                    ? 'border-amber-400/50 bg-amber-400/10 text-amber-400'
                    : 'border-glass-border bg-glass-strong text-ink-faint'
                }`}
              >
                <Sparkles className="h-4 w-4" />
              </span>

              <span className="hidden flex-col items-start gap-0.5 sm:flex">
                <span className="flex items-center gap-2">
                  <span
                    className={`text-sm font-semibold transition-colors ${
                      superMode ? 'text-amber-400' : 'text-ink'
                    }`}
                  >
                    Modo Super
                  </span>
                  <span
                    className={`chip transition-colors ${
                      superMode ? 'border-amber-400/60 bg-amber-400/10 text-amber-400' : ''
                    }`}
                  >
                    {PROBABILIDAD_SUPER}
                  </span>
                </span>
                <span className="text-[11px] text-ink-faint">
                  Falsa parada al {PROBABILIDAD_SUPER}
                </span>
              </span>

              <span
                className={`hidden h-6 w-11 shrink-0 items-center rounded-full transition-colors sm:flex ${
                  superMode ? 'bg-gradient-to-r from-amber-400 to-orange-500' : 'bg-glass-strong'
                }`}
              >
                <motion.span
                  animate={{ x: superMode ? 20 : 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="ml-0.5 h-5 w-5 rounded-full bg-white shadow-md"
                />
              </span>
            </motion.button>

            <ThemeSwitch theme={theme} onToggleTheme={onToggleTheme} />
          </div>
        </div>
      )}

      {/* Popover crear: portal a <body> + fixed clampado al viewport.
          No puede ser hijo directo del header porque backdrop-blur crea un
          containing block que rompería el posicionamiento fixed. */}
      {createPortal(
        <AnimatePresence>
          {popoverOpen && popoverPos && (
            <motion.div
              ref={popoverRef}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.15 }}
              style={{ left: popoverPos.left, top: popoverPos.top }}
              className="glass-panel fixed z-50 w-[288px] max-w-[calc(100vw-2rem)] p-4 shadow-2xl"
            >
              <input
                autoFocus
                value={popoverNombre}
                onChange={(e) => setPopoverNombre(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') confirmarPopover()
                  if (e.key === 'Escape') setPopoverOpen(false)
                }}
                placeholder="Nombre del grupo"
                aria-label="Nombre del grupo"
                className="glass-field mb-2"
              />

              <p className="mb-3 text-xs text-ink-faint">
                {nombreExiste
                  ? `Actualizará el grupo "${popoverNombre.trim()}" con los ${
                      estudiantesActivos.length
                    } participantes actuales.`
                  : estudiantesActivos.length > 0
                    ? `Se creará con los ${estudiantesActivos.length} participantes actuales.`
                    : 'Se creará vacío: añade participantes en la barra lateral.'}
              </p>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={confirmarPopover}
                  disabled={!popoverNombre.trim()}
                  className="btn-accent px-4 py-2 text-sm"
                >
                  <Plus className="h-4 w-4" />
                  {nombreExiste ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </header>
  )
}
