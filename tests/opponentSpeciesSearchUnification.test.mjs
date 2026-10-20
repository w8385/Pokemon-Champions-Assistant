import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import ts from 'typescript'
import React from 'react'
import { createServer } from 'vite'
import { Window } from 'happy-dom'

const source = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const tree = ts.createSourceFile('App.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
const fieldNodes = []
function visit(node) {
  if ((ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node)) && node.tagName.getText(tree) === 'PokemonSearchField') {
    const id = node.attributes.properties.find(attr => attr.name?.getText(tree) === 'id')
    fieldNodes.push({ id: id?.initializer?.getText(tree), text: node.getText(tree) })
  }
  ts.forEachChild(node, visit)
}
visit(tree)

test('legacy strip, quick-entry and selected-slot editor use real shared input with distinct IDs and owner callbacks', () => {
  const matching = fieldNodes.filter(node => /opponent-(?:strip-quick|entry-quick|detail-species)/.test(node.id ?? ''))
  assert.equal(matching.length, 3)
  assert.equal(new Set(matching.map(node => node.id)).size, 3)
  for (const field of matching) {
    assert.match(field.text, /onChange=/)
    assert.match(field.text, /onSelect=/)
    assert.match(field.text, /options=/)
    assert.doesNotMatch(field.text, /onKeyDown=|onMouseDown=/)
  }
  assert.match(matching.find(node => node.id.includes('strip-quick')).text, /commitOpponentQuickSearch/)
  assert.match(matching.find(node => node.id.includes('entry-quick')).text, /commitOpponentQuickSearch/)
  assert.match(matching.find(node => node.id.includes('detail-species')).text, /selectSpecies\('opponent'/)
})

let server, Field, root, host, act
const win = new Window({ url: 'http://localhost/' })
test.before(async () => {
  Object.assign(globalThis, { window: win, document: win.document, HTMLElement: win.HTMLElement, IS_REACT_ACT_ENVIRONMENT: true })
  ;({ createRoot: root } = await import('react-dom/client'))
  ;({ act } = await import('react'))
  server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom', optimizeDeps: { noDiscovery: true, include: [] } })
  Field = (await server.ssrLoadModule('/src/PokemonSearchField.tsx')).default
})
test.after(async () => { await server?.close(); await win.happyDOM.abort() })
async function render(props) {
  host = document.createElement('div'); document.body.append(host)
  const mounted = root(host)
  await act(async () => mounted.render(React.createElement(Field, props)))
  return { input: host.querySelector('input'), async close() { await act(async () => mounted.unmount()); host.remove() } }
}
async function press(input, key, extras = {}) {
  await act(async () => input.dispatchEvent(new win.KeyboardEvent('keydown', { key, code: key, bubbles: true, cancelable: true, keyCode: extras.keyCode ?? (key === 'Enter' ? 13 : 0), isComposing: extras.isComposing ?? false })))
}
const options = [{ key: 'new-a', label: 'New A' }, { key: 'new-b', label: 'New B' }]

test('quick entry chooses one ranked option, advances and focuses the same visible input; IME/dismiss never advances', async () => {
  const slots = [{ key: 'existing', item: 'held', ability: 'known' }, { key: '', item: '', ability: '' }, { key: '', item: '', ability: '' }]
  let selected = 0, commits = 0
  const ref = React.createRef()
  const commit = key => { commits++; slots[selected] = { ...slots[selected], key }; selected = slots.findIndex((slot, idx) => idx > selected && !slot.key); if (selected < 0) selected = 0; setTimeout(() => ref.current?.focus(), 0) }
  const props = { id: 'opponent-entry-quick', inputRef: ref, value: 'new', onChange() {}, onSelect: commit, options }
  const m = await render(props)
  assert.equal(ref.current, m.input)
  await act(async () => m.input.focus())
  await act(async () => m.input.dispatchEvent(new win.CompositionEvent('compositionstart', { bubbles: true })))
  await press(m.input, 'Enter'); await press(m.input, 'Enter', { keyCode: 229 })
  assert.equal(commits, 0)
  await act(async () => m.input.dispatchEvent(new win.CompositionEvent('compositionend', { bubbles: true })))
  await press(m.input, 'ArrowDown'); await press(m.input, 'ArrowDown'); await press(m.input, 'Enter')
  await act(async () => win.happyDOM.whenAsyncComplete())
  assert.equal(commits, 1)
  assert.equal(slots[0].item, 'held')
  assert.equal(slots[0].key, 'new-b')
  assert.equal(selected, 1)
  assert.equal(document.activeElement, m.input)
  await press(m.input, 'Enter'); assert.equal(commits, 1)
  await act(async () => m.input.blur()); await act(async () => m.input.focus()); await press(m.input, 'Escape'); await press(m.input, 'Enter'); assert.equal(commits, 1)
  await act(async () => m.input.blur()); await act(async () => m.input.focus()); await press(m.input, 'Tab'); await press(m.input, 'Enter'); assert.equal(commits, 1)
  await m.close()
})

test('detailed species picker commits only explicit selection to the current slot, preserving other partial records', async () => {
  const slots = [{ key: 'old', item: 'kept', ability: '' }, { key: 'other', item: 'other-item', ability: 'known' }]
  let commits = 0
  const m = await render({ id: 'opponent-detail-species-0', value: 'new', onChange() {}, onSelect: key => { slots[0] = { ...slots[0], key }; commits++ }, options })
  await act(async () => m.input.focus())
  await press(m.input, 'Enter')
  assert.equal(commits, 1)
  assert.deepEqual(slots, [{ key: 'new-a', item: 'kept', ability: '' }, { key: 'other', item: 'other-item', ability: 'known' }])
  await press(m.input, 'Enter'); assert.equal(commits, 1)
  await m.close()
})
