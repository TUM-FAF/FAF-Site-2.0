import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // In dev: served at root (localhost:5173/)
  // In prod: built into public/games/space-invaders/ so Astro can serve it
  base: '/games/space-invaders/',
  build: {
    outDir: '../../public/games/space-invaders',
    emptyOutDir: true,
  },
})
