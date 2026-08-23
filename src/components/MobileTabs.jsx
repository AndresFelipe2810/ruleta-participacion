import { motion } from 'framer-motion'
import { Dices, FolderOpen, Users } from 'lucide-react'

const TABS = [
  { id: 'ruleta', label: 'Ruleta', icon: Dices },
  { id: 'participantes', label: 'Participantes', icon: Users },
  { id: 'grupos', label: 'Mis Grupos', icon: FolderOpen },
]

/**
 * Barra de pestañas inferior para móvil/tablet (solo < lg).
 * @param {'ruleta'|'participantes'|'grupos'} activa
 * @param {(tab: string) => void} onChange
 */
export default function MobileTabs({ activa = 'ruleta', onChange }) {
  return (
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-glass-border bg-glass-strong/90 backdrop-blur-md lg:hidden"
    >
      <div className="mx-auto flex max-w-md items-stretch">
        {TABS.map(({ id, label, icon: Icon }) => {
          const isActive = activa === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              aria-current={isActive ? 'page' : undefined}
              className={
                'relative flex flex-1 flex-col items-center gap-0.5 py-2.5 pb-4 pt-3 text-[11px] font-semibold transition-colors ' +
                (isActive ? 'text-indigo-300' : 'text-ink-faint hover:text-ink-soft')
              }
            >
              {isActive && (
                <motion.span
                  layoutId="tab-activa"
                  className="absolute inset-x-6 top-0 h-0.5 rounded-full bg-gradient-to-r from-indigo-400 to-cyan-400"
                  transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                />
              )}
              <Icon className="h-5 w-5" />
              {label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
