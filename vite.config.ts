import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_ACTIONS ? '/Pokemon-Champions-Assistant/' : '/',
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react-vendor'
          }
          if (id.includes('/src/championsMovePools.json') || id.includes('/src/pokemonMovePools.json')) {
            return 'move-pools'
          }
          if (id.includes('/src/pokemon_champions_verified_data.json') || id.includes('/src/championsMovePoolSources.json')) {
            return 'champions-data'
          }
        },
      },
    },
  },
})
