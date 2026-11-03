import test from 'node:test'
import assert from 'node:assert/strict'
import React, { act } from 'react'
import { Window } from 'happy-dom'
import { createServer } from 'vite'
import { readFileSync } from 'node:fs'

const browser = new Window({ url: 'http://localhost/' })
Object.assign(globalThis, { window: browser, document: browser.document, HTMLElement: browser.HTMLElement, Element: browser.Element, IS_REACT_ACT_ENVIRONMENT: true })

const { createRoot } = await import('react-dom/client')
const server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom', optimizeDeps: { noDiscovery: true, include: [] }, logLevel: 'silent' })
const { UiIcon } = await server.ssrLoadModule('/src/shared/display/UiIcon.tsx')
const Search = (await server.ssrLoadModule('/src/shared/search/SearchCombobox.tsx')).default
const { PokemonBuildFields } = await server.ssrLoadModule('/src/shared/display/PokemonBuildFields.tsx')
const { EffortTuningModal } = await server.ssrLoadModule('/src/shared/display/EffortTuningModal.tsx')

test.after(async () => { await server.close(); await browser.happyDOM.abort() })
async function mount(element) {
  const host = document.createElement('div'); document.body.append(host)
  const root = createRoot(host)
  await act(async () => root.render(element))
  return { host, async cleanup() { await act(async () => root.unmount()); host.remove() } }
}
async function click(element) { await act(async () => element.click()) }
async function key(element, name, keyCode = 0) { await act(async () => element.dispatchEvent(new browser.KeyboardEvent('keydown', { key: name, keyCode, bubbles: true, cancelable: true }))) }

test('shared geometric icons stay decorative and the input-owning search retains callbacks, ref and keyboard', async () => {
  const events = [], ref = React.createRef()
  const mounted = await mount(React.createElement('div', null, React.createElement(UiIcon, { name: 'search' }), React.createElement(Search, { id: 'b1-search', inputRef: ref, label: '포켓몬 검색', value: 'Pika', onChange: value => events.push(value), onSelect: item => events.push(item.key), options: [{ key: 'pikachu', label: 'Pikachu' }] })))
  assert.equal(mounted.host.querySelector('svg').getAttribute('aria-hidden'), 'true')
  assert.equal(ref.current.id, 'b1-search')
  assert.equal(mounted.host.querySelector('label').htmlFor, 'b1-search')
  await act(async () => ref.current.focus())
  await key(ref.current, 'Enter', 229); assert.deepEqual(events, [])
  await key(ref.current, 'Enter', 13); assert.deepEqual(events, ['pikachu'])
  await mounted.cleanup()
})

test('shared build popover preserves raw unknown and only explicit repair or clear commits', async () => {
  const changes = []
  const props = { identity: 'mega', ability: '', nature: '', item: 'raw item', fixedItem: 'mega stone', itemError: 'invalid item', abilities: [], natures: [], itemOptions: () => [], onAbility: v => changes.push(['ability', v]), onNature: v => changes.push(['nature', v]), onItem: v => changes.push(['item', v]), labels: { ability: 'Ability', nature: 'Nature', item: 'Item', none: 'None', itemPlaceholder: 'Search', fixed: 'Fixed' }, itemLabel: v => v, itemSprite: () => '/item.svg', repairLabel: 'Equip mega stone' }
  const mounted = await mount(React.createElement(PokemonBuildFields, props))
  const trigger = [...mounted.host.querySelectorAll('.party-meta-chip-button')][2]
  assert.match(trigger.textContent, /raw item/)
  await click(trigger)
  assert.equal(changes.length, 0)
  assert.equal(document.querySelector('.build-fields-popover input').readOnly, true)
  await key(document.querySelector('.build-fields-popover input'), 'Escape')
  assert.equal(document.activeElement, trigger)
  await click(trigger)
  await click([...document.querySelectorAll('.build-fields-popover button')].find(button => button.textContent.includes('Equip')))
  assert.deepEqual(changes, [['item', 'mega stone']])
  await mounted.cleanup()
  const editable = await mount(React.createElement(PokemonBuildFields, { ...props, fixedItem: null, itemError: null }))
  await click([...editable.host.querySelectorAll('.party-meta-chip-button')][2])
  const clear = document.querySelector('.meta-item-clear-button')
  assert.match(clear.getAttribute('aria-label'), /Item: Clear/)
  await click(clear)
  assert.deepEqual(changes.at(-1), ['item', ''])
  await editable.cleanup()
})

test('effort dialog retains six gauges, 66/32 budget, checkpoints, nature and focus return', async () => {
  const opener = document.createElement('button'); document.body.append(opener); opener.focus()
  const events = []
  const evs = { hp: 32, attack: 32, defense: 2, spAttack: 0, spDefense: 0, speed: 0 }
  const mounted = await mount(React.createElement(EffortTuningModal, { evs, nature: 'hardy', natureOptions: [{ id: 'hardy', label: 'Hardy' }], actualValue: () => 110, onEffort: (key, value) => events.push([key, value]), onNature: () => {}, onClose: () => events.push('closed'), translate: v => v, statTheme: () => '', opener, magicPoints: () => [11, 22, 32] }))
  assert.equal(mounted.host.querySelectorAll('[role="slider"]').length, 6)
  assert.match(mounted.host.textContent, /66\/66/)
  assert.equal(mounted.host.querySelectorAll('.effort-gauge-cell.checkpoint').length, 18)
  assert.equal(mounted.host.querySelector('select').value, 'hardy')
  const speed = [...mounted.host.querySelectorAll('.drag-stat-card')].at(-1)
  assert.equal(speed.querySelectorAll('.mini-action')[2].disabled, true)
  await click(speed.querySelectorAll('.mini-action')[2])
  assert.deepEqual(events, [])
  await key(mounted.host.querySelector('[role="dialog"]'), 'Escape')
  assert.equal(events.at(-1), 'closed')
  await mounted.cleanup()
  assert.equal(document.activeElement, opener)
  opener.remove()
})

test('purpose segments decorate existing native controls without replacing handlers or URLs', () => {
  const src = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
  const detail = readFileSync(new URL('../src/features/speedline/SpeedLinePanel.tsx', import.meta.url), 'utf8')
  const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8')
  assert.match(css, /\.dex-mode-tabs\.ui-segmented > \.tab-chip\s*\{[^}]*min-height: 44px/, 'override the older 42px Dex selector at the actual scoped control')
  for (const selector of ['dex-mode-tabs', 'creator-library-kind-tabs', 'sample-lab-tabs']) assert.match(src, new RegExp(`${selector} ui-segmented`))
  assert.match(src, /href=\{`#\/sample-builder\?sampleTab=\$\{value\}`\} role="tab" aria-selected/)
  assert.match(src, /aria-pressed=\{libraryContentKind === 'pokemon'\} onClick=\{\(\) => setLibraryContentKind\('pokemon'\)\}/)
  assert.match(src, /onClick=\{\(\) => \{ if \(mode === dexSearchMode\) return;/)
  assert.doesNotMatch(detail, /speed-line-view-switch|SpeedLineRangesPanel|view: 'ranges'/)
})


