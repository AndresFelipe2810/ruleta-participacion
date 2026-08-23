import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Dices, FolderOpen, Pencil, Plus, Rocket, Trash2, X } from 'lucide-react'

/**
 * Gestor de Grupos estilo Google Tasks.
 *
 * Grid responsive de tarjetas, una por grupo. Cada tarjeta edita el grupo
 * MAESTRO (no la ronda en curso): nombre editable inline, conteo de integrantes,
 * añadir/quitar miembros y botón directo "Cargar este grupo a la Ruleta".
 *
 * Crear un grupo nuevo arranca SIEMPRE vacío (nunca hereda participantes).
 *
 * @param {{ id: string, nombre: string, estudiantes: string[] }[]} grupos
 * @param {string|null} grupoCargadoId - grupo cargado en la ruleta (para resaltar)
 * @param {(nombre: string) => void} onCrearGrupo
 * @param {(id: string, nombre: string) => void} onRenombrarGrupo
 * @param {(id: string) => void} onEliminarGrupo
 * @param {(id: string, estudiantes: string[]) => void} onActualizarGrupo
 * @param {(id: string) => void} onCargarGrupo - copia el maestro a la lista activa
 */
export default function GroupManager({
  grupos = [],
  grupoCargadoId = null,
  onCrearGrupo,
  onRenombrarGrupo,
  onEliminarGrupo,
  onActualizarGrupo,
  onCargarGrupo,
}) {
  const [nuevoNombre, setNuevoNombre] = useState('')

  const crear = () => {
    const n = nuevoNombre.trim()
    if (!n) return
    onCrearGrupo(n)
    setNuevoNombre('')
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Encabezado + formulario de creación (siempre vacío) */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-glass-border bg-gradient-to-br from-indigo-500/20 to-cyan-400/20 text-indigo-400">
            <FolderOpen className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-bold text-ink">Mis Grupos</h2>
            <p className="text-xs text-ink-faint">
              Los grupos maestros se editan aquí; la ruleta trabaja con una copia.
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <input
            value={nuevoNombre}
            onChange={(e) => setNuevoNombre(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') crear()
            }}
            placeholder="Nombre del grupo nuevo (se crea vacío)"
            aria-label="Nombre del grupo nuevo"
            className="glass-field flex-1"
          />
          <button
            type="button"
            onClick={crear}
            disabled={!nuevoNombre.trim()}
            className="btn-accent shrink-0 px-4 py-2.5"
          >
            <Plus className="h-4 w-4" />
            Crear grupo
          </button>
        </div>
      </div>

      {/* Grid de tarjetas */}
      <AnimatePresence mode="popLayout" initial={false}>
        {grupos.length > 0 ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {grupos.map((g) => (
              <GroupCard
                key={g.id}
                grupo={g}
                cargado={g.id === grupoCargadoId}
                onRenombrar={onRenombrarGrupo}
                onEliminar={onEliminarGrupo}
                onActualizar={onActualizarGrupo}
                onCargar={onCargarGrupo}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="vacio"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="glass-panel flex flex-col items-center gap-3 rounded-2xl p-10 text-center"
          >
            <FolderOpen className="h-10 w-10 text-ink-faint" />
            <p className="text-sm text-ink-faint">
              Aún no tienes grupos. Crea uno arriba y añade sus integrantes.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function GroupCard({ grupo, cargado, onRenombrar, onEliminar, onActualizar, onCargar }) {
  const [renombrando, setRenombrando] = useState(false)
  const [renameValue, setRenameValue] = useState(grupo.nombre)
  const [miembroNuevo, setMiembroNuevo] = useState('')

  const confirmarRenombrar = () => {
    const n = renameValue.trim()
    if (!n) return
    onRenombrar(grupo.id, n)
    setRenombrando(false)
  }

  const confirmarEliminar = () => {
    if (window.confirm(`¿Eliminar el grupo "${grupo.nombre}"?`)) {
      onEliminar(grupo.id)
    }
  }

  const agregarMiembro = () => {
    const m = miembroNuevo.trim()
    if (!m) return
    onActualizar(grupo.id, [...grupo.estudiantes, m])
    setMiembroNuevo('')
  }

  const quitarMiembro = (index) => {
    onActualizar(grupo.id, grupo.estudiantes.filter((_, i) => i !== index))
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, x: 20 }}
      transition={{ type: 'spring', stiffness: 350, damping: 28 }}
      className={
        'glass-panel flex flex-col gap-3 rounded-2xl p-4' +
        (cargado ? ' ring-1 ring-indigo-400/60' : '')
      }
    >
      {/* Cabecera: nombre editable + conteo */}
      <div className="flex items-start justify-between gap-2">
        {renombrando ? (
          <div className="flex min-w-0 flex-1 items-center gap-1.5">
            <input
              autoFocus
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') confirmarRenombrar()
                if (e.key === 'Escape') setRenombrando(false)
              }}
              aria-label="Nombre del grupo"
              className="glass-field min-w-0 flex-1 px-2 py-1.5 text-sm font-semibold"
            />
            <button
              type="button"
              onClick={confirmarRenombrar}
              aria-label="Confirmar nombre"
              className="shrink-0 rounded-lg p-1.5 text-emerald-400 transition hover:bg-emerald-500/10"
            >
              <Check className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setRenombrando(false)}
              aria-label="Cancelar renombrado"
              className="shrink-0 rounded-lg p-1.5 text-ink-soft transition hover:bg-glass-strong hover:text-ink"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <h3 className="min-w-0 flex-1 truncate font-bold text-ink">{grupo.nombre}</h3>
        )}
        <div className="flex shrink-0 items-center gap-1">
          {!renombrando && (
            <button
              type="button"
              onClick={() => {
                setRenameValue(grupo.nombre)
                setRenombrando(true)
              }}
              aria-label={'Renombrar grupo ' + grupo.nombre}
              className="rounded-lg p-1.5 text-ink-soft transition hover:bg-glass-strong hover:text-ink"
            >
              <Pencil className="h-4 w-4" />
            </button>
          )}
          <span className="chip">{grupo.estudiantes.length} integrantes</span>
          {cargado && (
            <span className="chip border-indigo-400/50 bg-indigo-500/10 text-indigo-300">
              <Dices className="h-3 w-3" />
              En la ruleta
            </span>
          )}
        </div>
      </div>

      {/* Miembros */}
      <div className="flex min-h-[48px] flex-col gap-1.5">
        {grupo.estudiantes.length > 0 ? (
          <ul className="flex max-h-40 flex-col gap-1.5 overflow-y-auto pr-1">
            {grupo.estudiantes.map((est, index) => (
              <li
                key={`${est}-${index}`}
                className="flex items-center gap-2 rounded-lg border border-glass-border bg-glass-strong px-2.5 py-1.5"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 to-violet-500 text-[10px] font-bold text-white">
                  {est.charAt(0).toUpperCase()}
                </span>
                <span className="flex-1 truncate text-sm font-medium text-ink">{est}</span>
                <button
                  type="button"
                  onClick={() => quitarMiembro(index)}
                  aria-label={'Quitar ' + est + ' del grupo'}
                  className="rounded-md p-1 text-ink-faint transition hover:bg-rose-500/10 hover:text-rose-400"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="py-2 text-center text-xs text-ink-faint">
            Sin integrantes todavía. Añade abajo.
          </p>
        )}
      </div>

      {/* Añadir miembro */}
      <div className="flex gap-2">
        <input
          value={miembroNuevo}
          onChange={(e) => setMiembroNuevo(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') agregarMiembro()
          }}
          placeholder="Añadir integrante…"
          aria-label={'Añadir integrante a ' + grupo.nombre}
          className="glass-field flex-1 px-2.5 py-2 text-sm"
        />
        <button
          type="button"
          onClick={agregarMiembro}
          disabled={!miembroNuevo.trim()}
          aria-label="Añadir integrante"
          className="btn-accent shrink-0 px-3 py-2"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Pie: cargar a la ruleta + eliminar grupo */}
      <div className="mt-auto flex gap-2 pt-1">
        <button
          type="button"
          onClick={() => onCargar(grupo.id)}
          className="btn-accent flex-1 px-3 py-2.5 text-sm"
        >
          <Rocket className="h-4 w-4" />
          {cargado ? 'Recargar en la Ruleta' : 'Cargar a la Ruleta'}
        </button>
        <button
          type="button"
          onClick={confirmarEliminar}
          aria-label={'Eliminar grupo ' + grupo.nombre}
          className="btn-ghost shrink-0 border-rose-400/40 px-3 py-2.5 text-rose-400 hover:bg-rose-500/10 hover:text-rose-400"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  )
}
