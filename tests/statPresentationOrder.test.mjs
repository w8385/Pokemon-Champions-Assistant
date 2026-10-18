import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

let server, Modal, presentation
test.before(async () => {
  server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom', optimizeDeps: { noDiscovery: true, include: [] } })
  Modal = (await server.ssrLoadModule('/src/EffortTuningModal.tsx')).EffortTuningModal
})
test.after(async () => { await server?.close() })
test('card and effort dialog share the same row-major stat presentation order', async () => {
  const module = await server.ssrLoadModule('/src/statPresentation.ts')
  presentation = module.STAT_PRESENTATION
  const expected = ['hp', 'attack', 'defense', 'spAttack', 'spDefense', 'speed']
  assert.deepEqual(presentation.map(s => s.key), expected)
  const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
  assert.match(app, /import \{ STAT_PRESENTATION as EFFORT_STAT_OPTIONS \} from '.\/statPresentation'/)
  assert.doesNotMatch(app, /const EFFORT_STAT_OPTIONS[^=]*=\s*\[/)
  const modal = renderToStaticMarkup(React.createElement(Modal, { evs: Object.fromEntries(expected.map(k => [k, 0])), nature: 'hardy', natureOptions: [{ id: 'hardy', label: 'Hardy' }], actualValue: () => 100, onEffort(){}, onNature(){}, onClose(){}, translate: s => s, statTheme: key => `key-${key}` }))
  const modalKeys = [...modal.matchAll(/class="drag-stat-card key-(\w+) /g)].map(m => m[1])
  assert.deepEqual(modalKeys, expected)
  const { PokemonStatGrid } = await server.ssrLoadModule('/src/PokemonCardOverview.tsx')
  const outside = renderToStaticMarkup(React.createElement(PokemonStatGrid, { stats: presentation.map(s => ({ ...s, theme: `key-${s.key}`, value: 100, ev: 0 })) }))
  const outsideKeys = [...outside.matchAll(/class="stat-preview-row key-(\w+)"/g)].map(m => m[1])
  assert.deepEqual(outsideKeys, modalKeys)
})
