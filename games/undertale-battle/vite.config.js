import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/games/undertale-battle/',
  build: {
    outDir: '../../public/games/undertale-battle',
    emptyOutDir: true,
  },
})
