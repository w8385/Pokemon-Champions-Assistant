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
          if (id.includes('/src/canonical-data/champions/championsMovePools.json') || id.includes('/src/canonical-data/champions/pokemonMovePools.json')) {
            return 'move-pools'
          }
          if (id.includes('/src/canonical-data/champions/pokemon_champions_verified_data.json') || id.includes('/src/canonical-data/champions/championsMovePoolSources.json')) {
            return 'champions-data'
          }
        },
      },
    },
  },
})
