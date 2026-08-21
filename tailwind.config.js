/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Tokens de tema (se resuelven por CSS var, cambian con .dark/.light)
        base: 'var(--bg-base)',
        glass: 'var(--glass-bg)',
        'glass-strong': 'var(--glass-strong)',
        'glass-border': 'var(--glass-border)',
        field: 'var(--field-bg)',
        ink: 'var(--ink)',
        'ink-soft': 'var(--ink-soft)',
        'ink-faint': 'var(--ink-faint)',
      },
      boxShadow: {
        glass: 'var(--glass-shadow)',
        'glow-accent': '0 0 40px -6px var(--accent-glow)',
        'glow-accent-lg': '0 10px 60px -12px var(--accent-glow)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      keyframes: {
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      animation: {
        'float-slow': 'float-slow 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
