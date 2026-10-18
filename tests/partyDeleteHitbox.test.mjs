import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

let server, Heading
test.before(async () => {
  server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom', optimizeDeps: { noDiscovery: true, include: [] } })
  Heading = (await server.ssrLoadModule('/src/PokemonCardOverview.tsx')).PokemonCardHeading
})
test.after(async () => { await server?.close() })

test('shared card heading reserves a separate normal-flow lane for the real clear button', () => {
  const html = renderToStaticMarkup(React.createElement(Heading, {
    name: React.createElement('input', { id: 'party-species-0', readOnly: true, value: 'Cinderace' }),
    types: ['fire'], actions: React.createElement('button', { type: 'button', className: 'entry-card-clear-button', 'aria-label': '1 · 슬롯 비우기' }, '×'),
  }))
  assert.match(html, /class="entry-card-actions"><button[^>]*entry-card-clear-button/)
  assert.ok(html.indexOf('entry-card-actions') > html.indexOf('party-species-0'))
  assert.equal((html.match(/entry-card-clear-button/g) ?? []).length, 1)
  assert.doesNotMatch(renderToStaticMarkup(React.createElement(Heading, { name: 'Read-only' })), /entry-card-actions/)
})

test('clear control has a visible 44px target without absolute positioning or hidden hit-area pseudo elements', () => {
  const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8')
  const rule = css.match(/\.entry-card-clear-button\s*\{([^}]+)\}/)[1]
  assert.doesNotMatch(rule, /position:\s*absolute|top:|right:/)
  assert.match(rule, /width:\s*44px/)
  assert.match(rule, /height:\s*44px/)
  assert.match(rule, /flex:\s*0 0 44px/)
  assert.match(css, /\.entry-card-actions\s*\{[^}]*flex-shrink:\s*0/)
  assert.doesNotMatch(css, /\.entry-card-clear-button::(?:before|after)/)
  const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
  const start = app.indexOf('const partySpeciesOptions = filterSpeciesOptions(')
  const party = app.slice(start, app.indexOf('{row ? <><PokemonBuildFields', start))
  assert.match(party, /actions=\{row \? <button[^]*?onClick=\{\(\) => clearPartySlot\(idx\)\}/)
})
