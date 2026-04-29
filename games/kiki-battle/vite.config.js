import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/games/kiki-battle/',
  build: {
    outDir: '../../public/games/kiki-battle',
    emptyOutDir: true,
  },
})
