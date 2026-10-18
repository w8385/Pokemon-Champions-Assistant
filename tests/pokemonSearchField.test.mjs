import test from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'vite'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { Window } from 'happy-dom'
let server, Field, nextSearchHighlight, createRoot, act
const options = [{ key: 'garchomp', label: 'Garchomp' }, { key: 'mega-garchomp', label: 'Mega Garchomp' }]
test.before(async () => {
 const win = new Window({ url:'http://localhost/' })
 Object.assign(globalThis, { window:win, document:win.document, HTMLElement:win.HTMLElement, IS_REACT_ACT_ENVIRONMENT:true })
 ;({ createRoot } = await import('react-dom/client'))
 ;({ act } = await import('react'))
 server = await createServer({ server:{ middlewareMode:true, hmr:false }, appType:'custom', optimizeDeps:{ noDiscovery:true, include:[] } })
 const module = await server.ssrLoadModule('/src/PokemonSearchField.tsx'); Field = module.default; nextSearchHighlight = module.nextSearchHighlight
})
test.after(async () => { await server?.close(); await window?.happyDOM?.abort?.() })
async function mounted(overrides = {}) {
 const host = document.createElement('div'); document.body.append(host)
 const picked = []
 const root = createRoot(host)
 await act(async () => root.render(React.createElement(Field, { id:'reference-search', value:'Gar', onChange(){}, onSelect:key => picked.push(key), options, ...overrides })))
 const input = host.querySelector('input')
 return { host, input, picked, async close() { await act(async () => root.unmount()); host.remove() } }
}
async function key(input, name, extra = {}) {
 let accepted
 await act(async () => { accepted = input.dispatchEvent(new window.KeyboardEvent('keydown', { key:name, code:name, bubbles:true, cancelable:true, keyCode:extra.keyCode ?? 13, isComposing:extra.isComposing ?? false })) })
 return accepted
}
async function focus(input) { await act(async () => input.focus()) }
test('shared search field owns input and accessible listbox options with sprites', () => {
 const html = renderToStaticMarkup(React.createElement(Field, { id:'reference-search', label:'Reference search', value:'Gar', onChange(){}, onSelect(){}, options:[{key:'garchomp',label:'Garchomp',sprite:'/g.png'}] }))
 assert.match(html, /role="combobox"/); assert.match(html, /aria-controls="reference-search-options"/); assert.match(html, /aria-expanded="false"/); assert.match(html, /value="Gar"/)
})
test('initial ArrowUp highlights the last option and both directions wrap', () => {
 assert.equal(nextSearchHighlight(-1, 3, -1), 2); assert.equal(nextSearchHighlight(-1, 3, 1), 0)
 assert.equal(nextSearchHighlight(0, 3, -1), 2); assert.equal(nextSearchHighlight(2, 3, 1), 0); assert.equal(nextSearchHighlight(-1, 0, -1), -1)
})
test('Escape prevents native search clearing and cannot commit after list closes', async () => {
 const m = await mounted(); await focus(m.input)
 assert.equal(await key(m.input, 'Escape'), false)
 await key(m.input, 'Enter'); assert.deepEqual(m.picked, []); assert.equal(m.host.querySelector('[role="listbox"]'), null)
 await m.close()
})
test('Enter commits first visible option without arrow navigation and not twice', async () => {
 const m = await mounted(); await focus(m.input); assert.equal(await key(m.input, 'Enter'), false)
 assert.deepEqual(m.picked, ['garchomp']); await key(m.input, 'Enter'); assert.deepEqual(m.picked, ['garchomp']); await m.close()
})
test('composition, keyCode 229, disabled and blank input suppress selection', async () => {
 const m = await mounted(); await focus(m.input)
 await act(async () => m.input.dispatchEvent(new window.CompositionEvent('compositionstart', { bubbles:true })))
 await key(m.input, 'Enter'); await key(m.input, 'Enter', { keyCode:229 }); assert.deepEqual(m.picked, [])
 await act(async () => m.input.dispatchEvent(new window.CompositionEvent('compositionend', { bubbles:true })))
 await key(m.input, 'Enter'); assert.deepEqual(m.picked, ['garchomp']); await m.close()
 for (const scenario of [{ disabled:true }, { value:' ' }, { options:[] }]) {
  const guarded = await mounted(scenario); await focus(guarded.input); await key(guarded.input, 'Enter'); assert.deepEqual(guarded.picked, []); await guarded.close()
 }
})
test('invalid numeric draft disables selection without changing query', () => {
 const html = renderToStaticMarkup(React.createElement(Field, { id:'disabled-search', value:'Gar', disabled:true, onChange(){}, onSelect(){}, options }))
 assert.match(html, /disabled=""/); assert.match(html, /value="Gar"/)
})
