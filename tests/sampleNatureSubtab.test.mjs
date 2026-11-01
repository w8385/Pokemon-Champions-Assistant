import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import React, { act } from 'react'
import { Window } from 'happy-dom'
import { createServer } from 'vite'

const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8')
const browser = new Window({ url: 'http://localhost/#/sample-builder?sampleTab=speed' })
Object.assign(globalThis, { window: browser, document: browser.document, localStorage: browser.localStorage, HTMLElement: browser.HTMLElement, IS_REACT_ACT_ENVIRONMENT: true })
const { createRoot } = await import('react-dom/client')
const server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom', optimizeDeps: { noDiscovery: true, include: [] }, logLevel: 'silent' })
const { PokemonBuildFields } = await server.ssrLoadModule('/src/PokemonBuildFields.tsx')
test.after(async () => { await server.close(); await browser.happyDOM.abort() })

const labels = { ability: 'Ability', nature: 'Nature', item: 'Item', none: 'None', itemPlaceholder: 'Search' }
const natures = [{ value: 'hardy', label: 'Hardy' }, { value: 'jolly', label: 'Jolly' }, { value: 'timid', label: 'Timid' }]
const initial = { key: 'grimmsnarl', config: { nature: 'hardy', speedStage: 2 }, evs: { hp: 3, attack: 8, defense: 2, spAttack: 0, spDefense: 4, speed: 32 }, ability: 'prankster', item: 'leftovers' }

test('both sample own effort cards call the same shared-nature editor and owner updater', () => {
  assert.match(app, /const renderSampleForgeNatureField\s*=\s*\(\)\s*=>[\s\S]*?<PokemonBuildFields[^]*?natureOnly[^]*?nature=\{sampleForge\.config\.nature\}[^]*?natures=\{NATURES\.map\(n => \(\{ value: n\.id, label: natureChipLabel\(n\.id, siteLanguage\) \}\)\)\}[^]*?onNature=\{nature => setSampleForge\(prev => \(\{ \.\.\.prev, config: \{ \.\.\.prev\.config, nature: nature as NatureId \} \}\)\)\}/)
  for (const tab of ['speed', 'damage']) {
    const card = app.slice(app.indexOf(`{sampleWorkbenchTab === '${tab}' ? <section`), app.indexOf(`renderSampleForgeEffortGrid('${tab}')`))
    assert.match(card, /sample-current-build-card-embedded/)
  }
  assert.equal((app.match(/\{renderSampleForgeNatureField\(\)\}/g) ?? []).length, 2)
  assert.match(css, /\.pokemon-build-fields\.nature-only\s*\{[^}]*grid-template-columns:\s*minmax\(0, 1fr\)/)
  assert.match(css, /@media \(max-width: 390px\)[^\n]*\.pokemon-build-fields\.nature-only[^\n]*grid-template-columns:\s*minmax\(0, 1fr\)/)
})

test('real nature portal commits selected value only, preserves owner, labels, focus, identity and existing full/item layouts', async () => {
  let build = structuredClone(initial)
  const changes = []
  const host = document.createElement('div'); document.body.append(host)
  const root = createRoot(host)
  const props = (mode, identity = 'sample-grimmsnarl') => ({ identity, natureOnly: mode === 'nature', itemOnly: mode === 'item', nature: build.config.nature, ability: build.ability, item: build.item, abilities: [{ value: 'prankster', label: 'Prankster' }], natures, itemOptions: () => [], onAbility: () => {}, onItem: () => {}, onNature: value => { build = { ...build, config: { ...build.config, nature: value } }; changes.push(value); render(mode, identity) }, labels, itemLabel: v => v, itemSprite: () => '/item.svg' })
  async function render(mode, identity) { await act(async () => root.render(React.createElement(PokemonBuildFields, props(mode, identity)))) }
  try {
    await render('nature')
    assert.equal(host.querySelectorAll('.party-meta-chip-button').length, 1)
    assert.equal(host.querySelectorAll('.party-meta-chip').length, 1)
    assert.match(host.querySelector('.party-meta-chip-button').textContent, /Hardy/)
    assert.doesNotMatch(host.textContent, /Prankster|leftovers|Ability|Item/)
    const trigger = host.querySelector('button')
    await act(async () => trigger.click())
    assert.equal(document.querySelectorAll('.build-fields-popover .party-meta-option').length, 3)
    assert.equal(changes.length, 0)
    await act(async () => document.querySelector('.build-fields-popover').dispatchEvent(new browser.KeyboardEvent('keydown', { key: 'Escape', bubbles: true })))
    assert.equal(document.querySelector('.build-fields-popover'), null)
    assert.equal(document.activeElement, trigger)
    await act(async () => trigger.click())
    await act(async () => [...document.querySelectorAll('.build-fields-popover button')].find(button => button.textContent === 'Jolly').click())
    assert.deepEqual(changes, ['jolly'])
    assert.deepEqual({ ...build, config: { ...build.config, nature: initial.config.nature } }, initial)
    assert.match(host.textContent, /Jolly/)
    assert.equal(document.activeElement, trigger)
    await act(async () => trigger.click())
    await render('nature', 'sample-other-species')
    assert.equal(document.querySelector('.build-fields-popover'), null)
    await render('full')
    assert.equal(host.querySelectorAll('.party-meta-chip-button').length, 3)
    await render('item')
    assert.equal(host.querySelectorAll('.party-meta-chip-button').length, 1)
    assert.match(host.textContent, /leftovers/)
  } finally { await act(async () => root.unmount()); host.remove() }
})

test('mounted speed/damage tabs commit own nature through App and retain draft fields', async () => {
  const App = (await server.ssrLoadModule('/src/App.tsx')).default
  const { loadFormLearnset } = await server.ssrLoadModule('/src/sharedLearnsets.ts')
  const { loadMoveMetaByName } = await server.ssrLoadModule('/src/dex/data.ts')
  const storageKey = 'pokemon-champions-assistant-demo:v1'
  const target = { key: 'corviknight', item: '', ability: '', notes: 'original target', revealedMoves: [], natureBoost: false, scarf: false, speedStage: 0, picked: false, hpEv: 0, defenseEv: 0, spDefenseEv: 0, speedEv: 0, defenseNature: 1, spDefenseNature: 1, opponentMoves: ['바디프레스', '', '', ''], moveName: 'legacy', opponentMoveName: '', attackEv: 0, spAttackEv: 0, attackNature: 1, spAttackNature: 1, reverseAttackStage: 0, reverseDefenseStage: 0 }
  const draft = { mainSection: 'sample', sampleWorkbenchTab: 'speed', sampleForge: { ...initial, item: '', picked: false, tuning: { magicNumber: 0, maxValue: 0 } }, sampleLockedMoves: ['속임수', '', '바디프레스', ''], sampleSpeedTargets: [target], sampleDamageTargets: [target] }
  localStorage.clear(); localStorage.setItem(storageKey, JSON.stringify(draft))
  for (const [tab, nextNature] of [['speed', 'jolly'], ['damage', 'timid']]) {
    window.location.hash = `#/sample-builder?sampleTab=${tab}`
    const host = document.createElement('div'); document.body.append(host)
    const root = createRoot(host)
    try {
      await act(async () => root.render(React.createElement(App)))
      await act(async () => { await Promise.all([loadFormLearnset('grimmsnarl'), loadFormLearnset('corviknight'), loadMoveMetaByName()]); await new Promise(resolve => setTimeout(resolve, 70)) })
      const panel = host.querySelector(`#sample-${tab}-section`)
      assert.ok(panel, `missing ${tab} panel`)
      const trigger = panel.querySelector('.sample-current-build-card-embedded .nature-only .party-meta-chip-button')
      assert.ok(trigger, 'own nature control missing')
      assert.equal(panel.querySelectorAll('[data-owner^="sample-grimmsnarl"] .move-slots-editor-cell').length, 4)
      const stat = () => Number(panel.querySelector('.sample-embedded-drag-stat-list .drag-stat-card .row-between span').textContent)
      const before = stat()
      const beforeSaved = JSON.parse(localStorage.getItem(storageKey))
      await act(async () => trigger.click())
      assert.equal(document.querySelectorAll('.build-fields-popover .party-meta-option').length, 25)
      const wanted = [...document.querySelectorAll('.build-fields-popover .party-meta-option')].find(button => button.textContent.includes(nextNature === 'jolly' ? '명랑' : '겁쟁이'))
      assert.ok(wanted, `missing localized ${nextNature} option`)
      await act(async () => wanted.click())
      const saved = JSON.parse(localStorage.getItem(storageKey))
      assert.equal(saved.sampleForge.config.nature, nextNature)
      assert.deepEqual(saved.sampleForge.evs, beforeSaved.sampleForge.evs)
      assert.deepEqual(saved.sampleLockedMoves, beforeSaved.sampleLockedMoves)
      assert.deepEqual(saved.sampleSpeedTargets, beforeSaved.sampleSpeedTargets)
      assert.deepEqual(saved.sampleDamageTargets, beforeSaved.sampleDamageTargets)
      assert.equal(saved.sampleForge.config.speedStage, beforeSaved.sampleForge.config.speedStage)
      assert.equal(saved.sampleForge.key, beforeSaved.sampleForge.key)
      assert.equal(saved.sampleForge.item, beforeSaved.sampleForge.item)
      assert.equal(saved.sampleForge.ability, beforeSaved.sampleForge.ability)
      assert.notEqual(stat(), before, `expected ${tab} actual stat recomputation`)
      console.log(`${tab} actual: ${before} → ${stat()}; ${saved.sampleForge.config.nature}; four move cells retained`)
    } finally { await act(async () => root.unmount()); host.remove() }
  }
  localStorage.clear()
})
