import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown, FolderOpen, Sparkles, Users } from 'lucide-react'
import ThemeSwitch from './ThemeSwitch'

const PROBABILIDAD_SUPER = '17%'

/**
 * Barra superior "Modern Glass" de la Ruleta de Participación.
 *
 * Mobile-first, dos filas compactas:
 *   Fila 1: selector de grupo (cargar a la ruleta)
 *   Fila 2: Gestionar Grupos + Modo Super + tema
 *
 * Seleccionar un grupo lo CARGA a la ruleta (copia del maestro → lista activa).
 * El Gestor de Grupos (crear/renombrar/editar integrantes) vive en un modal
 * aparte (escritorio) o en la pestaña "Mis Grupos" (móvil).
 */
export default function GroupTopBar({
  grupos = [],
  grupoCargadoId = null,
  onSelectGrupo,
  onOpenGestor,
  superMode = false,
  onToggleSuper,
  theme = 'dark',
  onToggleTheme,
}) {
  // ---- Selector ----
  const [selectValue, setSelectValue] = useState(grupoCargadoId ?? '')
  useEffect(() => {
    setSelectValue(grupoCargadoId ?? '')
  }, [grupoCargadoId])

  const handleSelectChange = (e) => {
    const value = e.target.value
    setSelectValue(value)
    onSelectGrupo(value === '' ? null : value)
  }

  return (
    <header className="glass-panel relative z-40 rounded-2xl p-4">
      <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:gap-3">
        {/* Fila 1: selector de grupo (con ícono y chevron decorativos) */}
        <div className="flex min-w-0 items-center gap-2 lg:flex-1">
          <div className="relative min-w-0 flex-1">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint"
            >
              <Users className="h-4 w-4" />
            </span>
            <select
              value={selectValue}
              onChange={handleSelectChange}
              aria-label="Grupo cargado en la ruleta"
              className="glass-field min-w-0 appearance-none py-2.5 pl-9 pr-9"
            >
              <option value="">Lista Temporal / Modo Libre</option>
              {grupos.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.nombre} ({g.estudiantes.length})
                </option>
              ))}
            </select>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint"
            >
              <ChevronDown className="h-4 w-4" />
            </span>
          </div>
        </div>

        {/* Fila 2: Gestionar Grupos + Modo Super + tema */}
        <div className="ml-auto flex flex-wrap items-center justify-end gap-2 lg:shrink-0">
          <button
            type="button"
            onClick={onOpenGestor}
            className="btn-ghost hidden shrink-0 px-3 py-2.5 text-sm md:inline-flex"
          >
            <FolderOpen className="h-4 w-4" />
            Gestionar Grupos
          </button>

          {/* Toggle Modo Super (compacto en mobile: solo icono + knob) */}
          <motion.button
            type="button"
            role="switch"
            aria-checked={superMode}
            aria-label="Modo Super"
            onClick={onToggleSuper}
            whileTap={{ scale: 0.97 }}
            className="flex shrink-0 items-center gap-2 rounded-xl border border-transparent px-1.5 py-1.5 text-left transition-colors bg-glass-strong"
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
              className={`flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
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
    </header>
  )
}
