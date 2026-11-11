import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import React, { act } from 'react'
import { Window } from 'happy-dom'
import { createServer } from 'vite'

const browser = new Window({ url: 'http://localhost/' })
Object.assign(globalThis, { window: browser, document: browser.document, HTMLElement: browser.HTMLElement, Element: browser.Element, IS_REACT_ACT_ENVIRONMENT: true })
const { createRoot } = await import('react-dom/client')
const server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom', optimizeDeps: { noDiscovery: true, include: [] }, logLevel: 'silent' })
test.after(async () => { await server.close(); await browser.happyDOM.abort() })

async function mount(element) {
  const host = document.createElement('div'); document.body.append(host)
  const root = createRoot(host)
  await act(async () => root.render(element))
  return { host, async cleanup() { await act(async () => root.unmount()); host.remove() } }
}

test('UI projection offers 21 natures, while canonical validation and neutral calculations retain all 25', async () => {
  const { SELECTABLE_NATURES, natureSelectionId } = await server.ssrLoadModule('/src/shared/display/naturePresentation.ts')
  const { NATURES } = await server.ssrLoadModule('/src/domain/champions/natures.ts')
  const { knownNature, natureMultiplier } = await server.ssrLoadModule('/src/domain/champions/buildRules.ts')
  const removed = ['docile', 'serious', 'bashful', 'quirky']
  assert.equal(NATURES.length, 25)
  assert.equal(SELECTABLE_NATURES.length, 21)
  assert.deepEqual(SELECTABLE_NATURES.filter(n => !n.up && !n.down).map(n => n.id), ['hardy'])
  assert.equal(SELECTABLE_NATURES.filter(n => n.up && n.down).length, 20)
  for (const nature of SELECTABLE_NATURES.filter(n => n.up && n.down)) {
    assert.equal(natureMultiplier(nature.id, nature.up), 1.1, nature.id)
    assert.equal(natureMultiplier(nature.id, nature.down), 0.9, nature.id)
  }
  for (const id of removed) {
    assert.ok(knownNature(id)); assert.equal(natureSelectionId(id), 'hardy')
    for (const stat of ['attack', 'defense', 'spAttack', 'spDefense', 'speed']) assert.equal(natureMultiplier(id, stat), 1)
  }
  assert.equal(natureSelectionId('invalid-nature'), 'invalid-nature')
  assert.equal(knownNature('invalid-nature'), false)
  assert.deepEqual(removed.filter(id => SELECTABLE_NATURES.some(n => n.id === id)), [])
})

test('all candidate producers use the one UI projection, not a clone of canonical options', () => {
  for (const path of ['src/App.tsx', 'src/features/party/PartyMemberCard.tsx', 'src/features/damage/QuickSideCard.tsx', 'src/features/damage/QuickEffortModal.tsx']) {
    const text = readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
    assert.match(text, /SELECTABLE_NATURES/, path)
    assert.doesNotMatch(text, /natureOptions=\{NATURES\.map|natures=\{NATURES\.map|const options = NATURES\.map/, path)
  }
  const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
  assert.match(app, /OCR_NATURE_INDEX = NATURES\.map/)
  assert.match(app, /NATURES\.some\(nature => nature\.id === raw\.nature\)/)
})

test('mounted build picker represents legacy neutral without commit; explicit Hardy selection commits once; invalid is visible', async () => {
  const { PokemonBuildFields } = await server.ssrLoadModule('/src/shared/display/PokemonBuildFields.tsx')
  const { SELECTABLE_NATURES } = await server.ssrLoadModule('/src/shared/display/naturePresentation.ts')
  const changes = []
  const props = { identity: 'legacy', natureOnly: true, ability: '', nature: 'docile', item: '', abilities: [], natures: SELECTABLE_NATURES.map(n => ({ value: n.id, label: n.label })), itemOptions: () => [], onAbility: () => {}, onNature: id => changes.push(id), onItem: () => {}, labels: { ability: 'Ability', nature: 'Nature', item: 'Item', none: 'None', itemPlaceholder: 'Search' }, itemLabel: v => v, itemSprite: () => '' }
  const mounted = await mount(React.createElement(PokemonBuildFields, props))
  try {
    const trigger = mounted.host.querySelector('.party-meta-chip-button')
    assert.match(trigger.textContent, /노력/)
    assert.match(trigger.getAttribute('aria-label'), /노력/)
    assert.deepEqual(changes, [])
    await act(async () => trigger.click())
    const options = [...document.querySelectorAll('.build-fields-popover .party-meta-option')]
    assert.equal(options.length, 21)
    assert.equal(options.filter(option => option.getAttribute('aria-pressed') === 'true').length, 1)
    assert.equal(options[0].getAttribute('aria-pressed'), 'true')
    assert.deepEqual(changes, [])
    await act(async () => options[0].click())
    assert.deepEqual(changes, ['hardy'])
  } finally { await mounted.cleanup() }
  const invalid = await mount(React.createElement(PokemonBuildFields, { ...props, nature: 'invalid-nature' }))
  try { assert.match(invalid.host.textContent, /invalid-nature/); assert.deepEqual(changes, ['hardy']) } finally { await invalid.cleanup() }
})

test('mounted effort modal represents legacy neutral without commit; choice still emits Hardy', async () => {
  const { EffortTuningModal } = await server.ssrLoadModule('/src/shared/display/EffortTuningModal.tsx')
  const { SELECTABLE_NATURES } = await server.ssrLoadModule('/src/shared/display/naturePresentation.ts')
  const events = []
  const mounted = await mount(React.createElement(EffortTuningModal, { evs: { hp: 0, attack: 0, defense: 0, spAttack: 0, spDefense: 0, speed: 0 }, nature: 'docile', natureOptions: SELECTABLE_NATURES.map(n => ({ id: n.id, label: n.label })), actualValue: () => 100, onEffort: () => {}, onNature: id => events.push(id), onClose: () => {}, translate: v => v, statTheme: () => '' }))
  try {
    const select = mounted.host.querySelector('select')
    assert.equal(select.querySelectorAll('option:not([disabled])').length, 21)
    assert.equal(select.value, 'docile')
    assert.equal(select.selectedOptions[0].textContent, '노력')
    assert.deepEqual(events, [])
    await act(async () => { select.value = 'hardy'; select.dispatchEvent(new browser.Event('change', { bubbles: true })) })
    assert.deepEqual(events, ['hardy'])
  } finally { await mounted.cleanup() }
  const invalid = await mount(React.createElement(EffortTuningModal, { evs: { hp: 0, attack: 0, defense: 0, spAttack: 0, spDefense: 0, speed: 0 }, nature: 'invalid-nature', natureOptions: SELECTABLE_NATURES.map(n => ({ id: n.id, label: n.label })), actualValue: () => 100, onEffort: () => {}, onNature: id => events.push(id), onClose: () => {}, translate: v => v, statTheme: () => '' }))
  try { assert.equal(invalid.host.querySelector('select').selectedOptions[0].textContent, 'invalid-nature'); assert.deepEqual(events, ['hardy']) } finally { await invalid.cleanup() }
})
