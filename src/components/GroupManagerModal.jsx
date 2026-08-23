import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import GroupManager from './GroupManager'

/**
 * Modal a pantalla completa para el Gestor de Grupos (escritorio).
 *
 * Va en un portal a <body>: el overlay es top-level con backdrop-blur, así que
 * no sufre el gotcha del containing block de position:fixed.
 *
 * @param {boolean} abierto
 * @param {() => void} onClose
 * @param {object} groupManagerProps - props para <GroupManager/>
 */
export default function GroupManagerModal({ abierto = false, onClose, ...groupManagerProps }) {
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
          aria-label="Gestor de grupos"
        >
          <div className="flex min-h-full items-start justify-center p-4 sm:p-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 8 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              className="glass-panel relative w-full max-w-5xl rounded-3xl p-5 sm:p-8"
            >
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar gestor de grupos"
                className="absolute right-4 top-4 z-10 rounded-lg p-2 text-ink-soft transition hover:bg-glass-strong hover:text-ink"
              >
                <X className="h-5 w-5" />
              </button>
              <GroupManager {...groupManagerProps} />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
