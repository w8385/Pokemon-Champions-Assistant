import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import packageJson from './package.json'

export default defineConfig({
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version),
    __APP_REVISION__: JSON.stringify((process.env.GITHUB_SHA || 'dev').slice(0, 12)),
  },
  base: process.env.GITHUB_ACTIONS ? '/Pokemon-Champions-Assistant/' : '/',
  server: {
    allowedHosts: ['midnight.tail8a61.ts.net'],
  },
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
