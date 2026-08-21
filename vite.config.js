import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Rutas relativas para que la app funcione en GitHub Pages
  // bajo cualquier subruta (https://<usuario>.github.io/<repo>/).
  base: './',
})
