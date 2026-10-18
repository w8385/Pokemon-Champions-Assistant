import test from 'node:test'
import assert from 'node:assert/strict'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'
import { Window } from 'happy-dom'

let server, Combobox, Field, Slot, createRoot, act
const options = [{ key: 'ice', label: 'Ice Fang' }, { key: 'fire', label: 'Fire Fang' }]
const labels = { slot: '번', category: v => v, power: '위력', accuracy: '명중', pp: 'PP', unknown: '미확인' }
test.before(async () => {
  const window = new Window({ url: 'http://localhost/' })
  Object.assign(globalThis, { window, document: window.document, HTMLElement: window.HTMLElement, IS_REACT_ACT_ENVIRONMENT: true })
  ;({ createRoot } = await import('react-dom/client'))
  ;({ act } = await import('react'))
  server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom', optimizeDeps: { noDiscovery: true, include: [] } })
  Combobox = (await server.ssrLoadModule('/src/SearchCombobox.tsx')).default
  Field = (await server.ssrLoadModule('/src/PokemonSearchField.tsx')).default
  Slot = (await server.ssrLoadModule('/src/PokemonCardOverview.tsx')).RegisteredMoveSlot
})
test.after(async () => { await server?.close(); await window?.happyDOM?.abort?.() })
async function mount(element) {
  const host = document.createElement('div'); document.body.append(host)
  const root = createRoot(host)
  await act(async () => { root.render(element) })
  return { host, async cleanup() { await act(async () => root.unmount()); host.remove() } }
}
async function key(input, name, extra = {}) {
  await act(async () => { input.dispatchEvent(new window.KeyboardEvent('keydown', { key: name, code: name, keyCode: extra.keyCode ?? (name === 'Enter' ? 13 : 0), bubbles: true, cancelable: true, isComposing: extra.isComposing ?? false })) })
}
async function focus(input) { await act(async () => { input.focus() }) }

test('adapter and registered slot both render the same real combobox input, with metadata and one list', async () => {
  const a = await mount(React.createElement(Field, { id: 'quick-attacker', value: 'Ice', onChange(){}, onSelect(){}, options }))
  assert.equal(a.host.querySelectorAll('input').length, 1)
  assert.equal(a.host.querySelector('input').id, 'quick-attacker')
  await a.cleanup()
  const b = await mount(React.createElement(Slot, { number: 2, name: 'Ice', type: 'ice', meta: { category: 'physical', power: 65, accuracy: 95, pp: 15 }, labels, inputProps: { onChange(){} }, search: { id: 'move-2', options, onSelect(){} } }))
  await focus(b.host.querySelector('input'))
  assert.equal(b.host.querySelectorAll('input').length, 1)
  assert.equal(b.host.querySelectorAll('[role="listbox"]').length, 1)
  assert.match(b.host.textContent, /위력 65/)
  assert.match(b.host.innerHTML, /registered-move-slot-head/)
  assert.equal(b.host.querySelector('input').id, 'move-2')
  await b.cleanup()
})

test('visible options feed highlight, Enter and click exactly once; closed Escape, Tab and blur cannot commit', async () => {
  const picked = []
  const mounted = await mount(React.createElement(Combobox, { id: 'search', value: 'Fang', onChange(){}, onSelect: option => picked.push(option.key), options }))
  const input = mounted.host.querySelector('input')
  await focus(input)
  await key(input, 'ArrowDown'); await key(input, 'ArrowDown'); await key(input, 'Enter')
  assert.deepEqual(picked, ['fire'])
  await key(input, 'Enter'); assert.deepEqual(picked, ['fire'])
  await focus(input); await key(input, 'Escape'); await key(input, 'Enter'); assert.deepEqual(picked, ['fire'])
  await focus(input); await key(input, 'Tab'); await key(input, 'Enter'); assert.deepEqual(picked, ['fire'])
  await focus(input); await act(async () => input.blur()); await key(input, 'Enter'); assert.deepEqual(picked, ['fire'])
  await focus(input); await act(async () => mounted.host.querySelector('[role="option"]').click()); assert.deepEqual(picked, ['fire', 'ice'])
  await mounted.cleanup()
})

test('IME and keyCode 229, blank query, disabled and readonly suppress commits', async () => {
  const picked = []
  const mounted = await mount(React.createElement(Combobox, { id: 'ime', value: 'Fang', onChange(){}, onSelect: option => picked.push(option.key), options }))
  const input = mounted.host.querySelector('input')
  await focus(input)
  await act(async () => input.dispatchEvent(new window.CompositionEvent('compositionstart', { bubbles: true })))
  await key(input, 'Enter'); await key(input, 'Enter', { keyCode: 229 })
  assert.deepEqual(picked, [])
  await act(async () => input.dispatchEvent(new window.CompositionEvent('compositionend', { bubbles: true })))
  await key(input, 'Enter'); assert.deepEqual(picked, ['ice'])
  await mounted.cleanup()
  for (const props of [{ value: '' }, { disabled: true }, { readOnly: true }]) {
    const item = await mount(React.createElement(Combobox, { id: 'guard', value: 'Fang', onChange(){}, onSelect: option => picked.push(option.key), options, ...props }))
    await focus(item.host.querySelector('input')); await key(item.host.querySelector('input'), 'Enter')
    assert.deepEqual(picked, ['ice'])
    await item.cleanup()
  }
})

test('empty move focus shows legal options without hidden Enter commit', async () => {
  const picked = []
  const mounted = await mount(React.createElement(Slot, { number: 4, name: '', labels, inputProps: { onChange(){} }, search: { id: 'move-4', options, showAllOnEmpty: true, onSelect: option => picked.push(option.key) } }))
  const input = mounted.host.querySelector('input')
  await focus(input)
  assert.equal(mounted.host.querySelectorAll('[role="option"]').length, 2)
  assert.match(mounted.host.querySelector('[role="listbox"]').className, /move-autocomplete-menu/)
  await key(input, 'Enter')
  assert.deepEqual(picked, [])
  await act(async () => mounted.host.querySelectorAll('[role="option"]')[1].click())
  assert.deepEqual(picked, ['fire'])
  await mounted.cleanup()
})

test('move search composes tooltip/editor events and preserves readonly legacy input', async () => {
  const calls = []
  const props = { number: 1, name: 'Ice', labels, inputProps: { onFocus: () => calls.push('focus'), onBlur: () => calls.push('blur'), onChange: () => calls.push('change') }, tooltipProps: { onFocus: () => calls.push('tip-focus'), onBlur: () => calls.push('tip-blur'), onMouseEnter: () => calls.push('tip-hover') } }
  const mounted = await mount(React.createElement(Slot, { ...props, search: { id: 'move', options, onSelect(){} } }))
  const input = mounted.host.querySelector('input')
  await focus(input); await act(async () => input.dispatchEvent(new window.MouseEvent('mouseenter', { bubbles: true })))
  await act(async () => input.blur())
  assert.deepEqual(calls.filter(x => x.includes('focus') || x.includes('blur')), ['tip-focus', 'focus', 'tip-blur', 'blur'])
  await mounted.cleanup()
  const html = renderToStaticMarkup(React.createElement(Slot, { ...props, inputProps: { readOnly: true, 'aria-label': 'move' }, search: { id: 'ignored', options, onSelect(){} } }))
  assert.match(html, /readonly=""|readOnly=""/)
  assert.doesNotMatch(html, /role="combobox"/)
})

test('filter mode keeps caller-owned results and forwards native keyboard/composition events', async () => {
  const calls = []
  const mounted = await mount(React.createElement(Combobox, { id: 'dex-filter', mode: 'filter', value: '얼음', onChange: value => calls.push(`change:${value}`), onSelect: () => calls.push('selected'), options,
    inputProps: { onKeyDown: event => calls.push(`key:${event.key}`), onCompositionStart: () => calls.push('start'), onCompositionEnd: () => calls.push('end') } }))
  const input = mounted.host.querySelector('input')
  await focus(input)
  assert.equal(input.getAttribute('role'), 'searchbox')
  assert.equal(mounted.host.querySelectorAll('[role="listbox"]').length, 0)
  await key(input, 'ArrowDown'); await key(input, 'Enter')
  await act(async () => input.dispatchEvent(new window.CompositionEvent('compositionstart', { bubbles: true })))
  await act(async () => input.dispatchEvent(new window.CompositionEvent('compositionend', { bubbles: true })))
  assert.deepEqual(calls, ['key:ArrowDown', 'key:Enter', 'start', 'end'])
  await mounted.cleanup()
})
