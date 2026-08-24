import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Flame, FolderOpen, Github, Info, Sparkles, X } from 'lucide-react'

/**
 * Modal "Guía · Primeros Pasos" (Manual del usuario).
 *
 * Explica cómo funciona la selección, la gestión de grupos y el Modo Super,
 * con un pie de créditos. Va en un portal a <body> por el gotcha de
 * backdrop-blur como containing block de position:fixed.
 *
 * @param {boolean} abierto
 * @param {() => void} onClose
 */
export default function InfoModal({ abierto = false, onClose }) {
  return createPortal(
    <AnimatePresence>
      {abierto && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-label="Guía de uso"
        >
          <div className="flex min-h-full items-center justify-center p-4 sm:p-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 8 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              className="glass-panel relative w-full max-w-xl rounded-3xl p-5 sm:p-8"
            >
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar guía de uso"
                className="absolute right-4 top-4 z-10 rounded-lg p-2 text-ink-soft transition hover:bg-glass-strong hover:text-ink"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Encabezado */}
              <div className="flex items-center gap-3 pr-10">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-glass-border bg-glass text-indigo-400">
                  <Info className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold tracking-tight text-ink">
                    Guía · Primeros Pasos
                  </h2>
                  <p className="text-sm text-ink-faint">
                    Todo lo que necesitas para empezar a girar.
                  </p>
                </div>
              </div>

              {/* Secciones */}
              <div className="mt-5 flex flex-col gap-3">
                <section className="flex gap-3 rounded-2xl border border-glass-border bg-glass p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-cyan-400/20 text-indigo-400">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-ink">Cómo funciona</h3>
                    <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                      Cada giro elige a alguien de forma completamente aleatoria e independiente,
                      usando criptografía (<code>crypto.getRandomValues</code>). Todos tienen la
                      misma probabilidad en cada giro: un mismo participante puede salir varias
                      veces seguidas, igual que en una ruleta real.
                    </p>
                  </div>
                </section>

                <section className="flex gap-3 rounded-2xl border border-glass-border bg-glass p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-cyan-400/20 text-indigo-400">
                    <FolderOpen className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-ink">Gestión de Grupos</h3>
                    <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                      Crea grupos estilo Google Tasks y llévalos a la ruleta con un clic.
                      «Cargar a la Ruleta» copia el grupo a la lista activa de la ronda
                      (editarla no toca el grupo maestro) y «Reiniciar Ronda» la restaura
                      con todos los integrantes en 1 clic.
                    </p>
                  </div>
                </section>

                <section className="flex gap-3 rounded-2xl border border-glass-border bg-glass p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500/20 to-rose-500/20 text-orange-400">
                    <Flame className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-ink">Modo Super 🔥</h3>
                    <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                      Actívalo para generar suspenso: la ruleta hace una falsa parada en una
                      tajada vecina y luego avanza hasta el ganador real. Ocurre en el 17% de
                      los giros. El resultado nunca está amañado: el ganador se decide antes
                      de girar.
                    </p>
                  </div>
                </section>
              </div>

              {/* Créditos */}
              <footer className="mt-5 flex flex-col items-center gap-1.5 rounded-2xl border border-glass-border bg-glass px-4 py-4 text-center">
                <p className="text-sm text-ink-soft">
                  Made with <span className="text-rose-400">❤️</span> by{' '}
                  <a
                    href="https://github.com/AndresFelipe2810"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-semibold text-indigo-400 transition hover:text-indigo-300"
                  >
                    <Github className="h-4 w-4" />
                    AndresFelipe2810
                  </a>
                </p>
                <p className="text-xs text-ink-faint">Dedicated with love to Kiri ✨</p>
              </footer>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
