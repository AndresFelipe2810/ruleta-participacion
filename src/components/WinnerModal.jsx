import { AnimatePresence, motion } from 'framer-motion'
import { RotateCcw, Trash2, Trophy } from 'lucide-react'

export default function WinnerModal({ ganador = null, onMantener, onEliminar }) {
  return (
    <AnimatePresence>
      {ganador !== null && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label="Ganador seleccionado"
        >
          <motion.div
            className="glass-panel mx-4 w-full max-w-md rounded-3xl p-8 text-center shadow-2xl"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
          >
            {/* Icono trofeo con glow pulsante */}
            <div className="mx-auto flex h-[72px] w-[72px] items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 via-violet-500 to-cyan-400 text-white shadow-glow-accent">
              <motion.span
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="flex items-center justify-center"
              >
                <Trophy className="h-9 w-9" />
              </motion.span>
            </div>

            <p className="mt-6 text-xs font-bold uppercase tracking-widest text-indigo-400">
              ¡Ganador seleccionado!
            </p>
            <h2 className="mt-2 break-words text-3xl font-extrabold text-ink">{ganador}</h2>
            <p className="mt-2 text-sm text-ink-faint">
              ¿Qué deseas hacer con el ganador de esta ronda?
            </p>

            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={onMantener}
                className="btn-accent px-4 py-3"
              >
                <RotateCcw className="h-5 w-5" />
                Mantener en la ruleta
              </button>
              <button
                type="button"
                onClick={onEliminar}
                className="btn-ghost border-rose-400/40 text-rose-400 hover:bg-rose-500/10 hover:text-rose-400"
              >
                <Trash2 className="h-5 w-5" />
                Eliminar de esta ronda
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
