import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Pencil, Plus, Save, Trash2, UserPlus, Users, X } from 'lucide-react'

/**
 * Panel lateral de participantes.
 *
 * Es una lista de trabajo: editar aquí no toca los grupos guardados. Cuando hay
 * un grupo seleccionado (`grupoNombre`), aparece un botón "Guardar en [grupo]"
 * para confirmar los cambios de forma explícita, con indicador de "sin guardar".
 *
 * @param {string[]} estudiantes
 * @param {(nombre: string) => void} onAgregar
 * @param {(index: number) => void} onEliminar
 * @param {() => void} onVaciar
 * @param {boolean} disabled
 * @param {string|null} grupoNombre - grupo seleccionado (null = Lista Temporal)
 * @param {(() => void)|null} onGuardarLista - guarda la lista en el grupo activo
 * @param {boolean} dirty - true si la lista tiene cambios sin guardar
 * @param {number|null} savedAt - marca del último guardado (para el aviso)
 * @param {string} [className]
 */
export default function ParticipantsPanel({
  estudiantes = [],
  onAgregar,
  onEliminar,
  onVaciar,
  disabled = false,
  grupoNombre = null,
  onGuardarLista = null,
  dirty = false,
  savedAt = null,
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
          <h2 className="font-bold text-ink">Participantes</h2>
          <span className="chip ml-auto bg-gradient-to-r from-indigo-500 to-cyan-400 text-white">
            {estudiantes.length}{' '}
            {estudiantes.length === 1 ? 'Participante' : 'Participantes'} en la Ruleta
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

        {/* Guardar lista en el grupo seleccionado (explícito) */}
        {grupoNombre && onGuardarLista && (
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-glass-border bg-glass-strong px-3 py-2">
            <button
              type="button"
              onClick={onGuardarLista}
              disabled={!dirty || disabled}
              className="btn-accent shrink-0 px-3 py-2 text-sm"
            >
              <Save className="h-4 w-4" />
              Guardar en {grupoNombre}
            </button>
            {dirty ? (
              <span className="chip border-amber-400/50 bg-amber-400/10 text-amber-400">
                <Pencil className="h-3 w-3" />
                Sin guardar
              </span>
            ) : (
              <span className="chip border-emerald-400/50 bg-emerald-400/10 text-emerald-400">
                <Check className="h-3 w-3" />
                {savedAt ? 'Guardado' : 'Sin cambios'}
              </span>
            )}
          </div>
        )}

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
      </div>
    </div>
  )
}
