import { motion, AnimatePresence } from 'framer-motion'
import { RefreshCcw, Loader2, Sparkles, Volume2, VolumeX, UserPlus } from 'lucide-react'
import WheelCanvas from './WheelCanvas'

const buttonVariants = {
  idle: { scale: 1, transition: { duration: 0.25 } },
  pulse: {
    scale: [1, 1.04, 1],
    transition: { repeat: Infinity, duration: 2, ease: 'easeInOut' },
  },
  hover: { scale: 1.05, transition: { duration: 0.2 } },
  tap: { scale: 0.97, transition: { duration: 0.1 } },
}

export default function WheelSection({
  estudiantes = [],
  rotation = 0,
  isSpinning = false,
  superMode = false,
  onGirar,
  soundEnabled = true,
  onToggleSound,
  className = '',
}) {
  const ready = !isSpinning && estudiantes.length > 0
  const count = estudiantes.length

  return (
    <div
      className={
        'glass-panel relative overflow-hidden rounded-[2rem] p-4 sm:p-10' +
        (className ? ' ' + className : '')
      }
    >
      {/* Botón de sonido compacto, en la esquina para no estorbar el centro */}
      {onToggleSound && (
        <button
          type="button"
          onClick={onToggleSound}
          aria-label={soundEnabled ? 'Desactivar sonido' : 'Activar sonido'}
          title={soundEnabled ? 'Desactivar sonido' : 'Activar sonido'}
          className="btn-ghost absolute right-4 top-4 z-20 p-2.5"
        >
          {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
        </button>
      )}

      <div className="flex flex-col items-center gap-4 sm:gap-6">
        {/* Canvas con aura de resplandor detrás */}
        <div className="relative w-full max-w-[520px]">
          <motion.div
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 -z-10 aspect-square w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-tr from-indigo-500/30 via-violet-500/25 to-cyan-400/30 blur-3xl"
            animate={{
              scale: isSpinning ? [1, 1.12, 1] : 1,
              opacity: isSpinning ? [0.7, 1, 0.7] : 0.7,
            }}
            transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
          />
          <WheelCanvas estudiantes={estudiantes} rotation={rotation} />
        </div>

        {/* Indicador Modo Super activo */}
        <AnimatePresence>
          {superMode && !isSpinning && (
            <motion.div
              key="super"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="chip"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Modo Super activo
            </motion.div>
          )}
        </AnimatePresence>

        {/* Botón ¡GIRAR RULETA! con resplandor pulsante */}
        <div className="relative w-full max-w-md">
          {ready && (
            <motion.span
              aria-hidden="true"
              className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-indigo-500/60 via-violet-500/60 to-cyan-400/60 blur-xl"
              animate={{ opacity: [0.4, 0.8, 0.4], scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            />
          )}
          <motion.button
            type="button"
            onClick={onGirar}
            disabled={isSpinning || count === 0}
            className="btn-accent relative w-full max-w-md rounded-2xl py-5 text-xl"
            variants={buttonVariants}
            animate={ready ? 'pulse' : 'idle'}
            whileHover={ready ? 'hover' : undefined}
            whileTap="tap"
          >
            {isSpinning ? (
              <>
                <Loader2 className="h-6 w-6 animate-spin" />
                Girando…
              </>
            ) : (
              <>
                <RefreshCcw className="h-6 w-6" />
                ¡GIRAR RULETA!
              </>
            )}
          </motion.button>
        </div>

        {/* Contador / estado vacío */}
        <AnimatePresence mode="wait">
          {count === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="flex items-center gap-2 text-sm text-ink-faint"
            >
              <UserPlus className="h-4 w-4" />
              Añade participantes para empezar
            </motion.div>
          ) : (
            <motion.p
              key="count"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="text-sm text-ink-faint"
            >
              {count} {count === 1 ? 'participante' : 'participantes'} en la ruleta
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
