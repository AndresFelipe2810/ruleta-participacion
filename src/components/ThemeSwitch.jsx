import { motion } from 'framer-motion'
import { Moon, Sun } from 'lucide-react'

/**
 * Toggle animado dark/light (Modern Glass).
 * @param {string} theme - 'dark' | 'light'
 * @param {(next: 'dark' | 'light') => void} onToggleTheme
 */
export default function ThemeSwitch({ theme = 'dark', onToggleTheme }) {
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label="Cambiar tema"
      onClick={() => onToggleTheme(isDark ? 'light' : 'dark')}
      className="glass-field flex w-auto shrink-0 cursor-pointer items-center gap-2 border px-1.5 py-1.5"
    >
      <span className="relative flex items-center gap-1">
        <motion.span
          layout
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className={`absolute inset-y-1 w-8 rounded-lg ${
            isDark
              ? 'right-0 bg-gradient-to-r from-indigo-500 to-violet-500'
              : 'left-0 bg-gradient-to-r from-cyan-400 to-sky-400'
          }`}
          aria-hidden="true"
        />
        <span
          className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
            isDark ? 'text-white' : 'text-ink'
          }`}
        >
          <Moon className="h-4 w-4" />
        </span>
        <span
          className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
            !isDark ? 'text-white' : 'text-ink-soft'
          }`}
        >
          <Sun className="h-4 w-4 text-black" />
        </span>
      </span>
    </button>
  )
}
