import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus, RefreshCcw, Trash2, UserPlus, Users, X } from 'lucide-react'

/**
 * Panel de participantes de la ronda activa (copia de trabajo).
 *
 * Editar aquí NO toca los grupos maestros: estos viven en el Gestor de Grupos.
 * Cuando se elimina a alguien de la ronda (por ejemplo, el ganador que ya
 * salió), "Reiniciar Ronda" en el pie restaura a todos los integrantes del
 * grupo maestro.
 *
 * @param {string[]} estudiantes
 * @param {(nombre: string) => void} onAgregar
 * @param {(index: number) => void} onEliminar
 * @param {() => void} onVaciar
 * @param {() => void} onReiniciar - restaura la lista activa desde el grupo maestro
 * @param {string|null} grupoNombre - grupo cargado (controla la visibilidad de Reiniciar Ronda)
 * @param {boolean} disabled
 * @param {string} [className]
 */
export default function ParticipantsPanel({
  estudiantes = [],
  onAgregar,
  onEliminar,
  onVaciar,
  onReiniciar = null,
  grupoNombre = null,
  disabled = false,
  className = '',
}) {
  const [nombre, setNombre] = useState('')

  const agregar = () => {
    const limpio = nombre.trim()
    if (!limpio) return
    setNombre('')
    onAgregar(limpio)
  }

  const confirmarVaciar = () => {
    if (window.confirm('¿Vaciar la lista de participantes? Esta acción no se puede deshacer.')) {
      onVaciar()
    }
  }

  return (
    <div
      className={'glass-panel rounded-2xl p-5' + (className ? ' ' + className : '')}
    >
      <div className="flex flex-col gap-4">
        {/* Encabezado */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-glass-border bg-gradient-to-br from-indigo-500/20 to-cyan-400/20 text-indigo-400">
            <Users className="h-5 w-5" />
          </div>
          <h2 className="font-bold text-ink">Participantes de la Ronda</h2>
          <span className="chip ml-auto bg-gradient-to-r from-indigo-500 to-cyan-400 text-white">
            {estudiantes.length}{' '}
            {estudiantes.length === 1 ? 'Participante' : 'Participantes'}
          </span>
        </div>

        {/* Input rápido */}
        <div className="flex gap-2">
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') agregar()
            }}
            disabled={disabled}
            placeholder="Añadir participante…"
            className="glass-field flex-1 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <button
            type="button"
            onClick={agregar}
            disabled={disabled || !nombre.trim()}
            className="btn-accent shrink-0 px-4 py-2.5"
          >
            <Plus className="h-4 w-4" />
            Añadir
          </button>
        </div>

        {/* Fichas / estado vacío */}
        <AnimatePresence mode="wait" initial={false}>
          {estudiantes.length > 0 ? (
            <motion.div
              key="lista"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-2"
            >
              <div className="flex max-h-[420px] flex-col gap-2 overflow-y-auto pr-1">
                <AnimatePresence initial={false}>
                  {estudiantes.map((est, index) => (
                    <motion.div
                      key={`${est}-${index}`}
                      layout
                      initial={{ opacity: 0, scale: 0.8, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8, x: 30 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                      className="flex items-center gap-2 rounded-xl border border-glass-border bg-glass-strong px-3 py-2"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 text-xs font-bold text-white">
                        {est.charAt(0).toUpperCase()}
                      </span>
                      <span className="flex-1 truncate text-sm font-medium text-ink">{est}</span>
                      <button
                        type="button"
                        onClick={() => onEliminar(index)}
                        aria-label={'Quitar ' + est}
                        className="rounded-md p-1 text-ink-faint transition hover:bg-rose-500/10 hover:text-rose-400"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Vaciar lista */}
              <button type="button" onClick={confirmarVaciar} className="btn-ghost self-end">
                <Trash2 className="h-4 w-4" />
                Vaciar lista
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="vacio"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-2 py-8 text-center"
            >
              <UserPlus className="h-10 w-10 text-ink-faint" />
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-sm text-ink-faint"
              >
                Añade participantes para empezar
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reiniciar Ronda: restaura todos los integrantes del grupo maestro en 1 clic */}
        {onReiniciar && grupoNombre && !disabled && (
          <div className="flex items-center gap-2">
            <span className="chip max-w-[170px] truncate">Grupo: {grupoNombre}</span>
            <button
              type="button"
              onClick={onReiniciar}
              title="Restaurar todos los integrantes del grupo a la ruleta"
              className="btn-ghost shrink-0"
            >
              <RefreshCcw className="h-4 w-4" />
              Reiniciar Ronda
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
