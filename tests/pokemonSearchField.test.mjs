import test from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'vite'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
let server, Field, nextSearchHighlight
test.before(async () => { server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom', optimizeDeps: { noDiscovery: true, include: [] } }); const module = await server.ssrLoadModule('/src/PokemonSearchField.tsx'); Field = module.default; nextSearchHighlight = module.nextSearchHighlight })
test.after(async () => { await server?.close() })
test('shared search field owns input and accessible listbox options with sprites', () => {
 const html = renderToStaticMarkup(React.createElement(Field, { id:'reference-search', label:'Reference search', value:'Gar', onChange(){}, onSelect(){}, options:[{key:'garchomp',label:'Garchomp',sprite:'/g.png'}] }))
 assert.match(html, /role="combobox"/)
 assert.match(html, /aria-controls="reference-search-options"/)
 assert.match(html, /aria-expanded="false"/)
 assert.match(html, /value="Gar"/)
})
test('initial ArrowUp highlights the last option and both directions wrap', () => {
 assert.equal(typeof nextSearchHighlight, 'function')
 assert.equal(nextSearchHighlight(-1, 3, -1), 2)
 assert.equal(nextSearchHighlight(-1, 3, 1), 0)
 assert.equal(nextSearchHighlight(0, 3, -1), 2)
 assert.equal(nextSearchHighlight(2, 3, 1), 0)
 assert.equal(nextSearchHighlight(-1, 0, -1), -1)
})
test('Escape prevents native search clearing from reopening the dropdown', () => {
 let tree
 const props = { id: 'escape-search', value: 'Lucario', onChange(){}, onSelect(){}, options: [{ key: 'lucario', label: 'Lucario' }] }
 function Capture() { tree = Field(props); return tree }
 renderToStaticMarkup(React.createElement(Capture))
 const input = tree.props.children.find(child => child?.type === 'input')
 let prevented = false
 input.props.onKeyDown({ key: 'Escape', nativeEvent: {}, keyCode: 27, preventDefault(){ prevented = true } })
 assert.equal(prevented, true)
})
test('Enter selects the first available result without arrow navigation', () => {
 let tree, selected = null, prevented = false
 function Capture() { tree = Field({ id: 'enter-search', value: 'Gar', onChange(){}, onSelect(key){ selected = key }, options: [{ key: 'garchomp', label: 'Garchomp' }, { key: 'mega-garchomp', label: 'Mega Garchomp' }] }); return tree }
 renderToStaticMarkup(React.createElement(Capture))
 const input = tree.props.children.find(child => child?.type === 'input')
 input.props.onFocus()
 input.props.onKeyDown({ key: 'Enter', nativeEvent: {}, keyCode: 13, preventDefault(){ prevented = true } })
 assert.equal(selected, 'garchomp')
 assert.equal(prevented, true)
})

test('Enter does not select during composition, for empty results, blank input or disabled fields', () => {
 for (const scenario of [{ value:'Gar', isComposing:true }, { value:'Gar', keyCode:229 }, { value:'Gar', disabled:true }, { value:'Gar', options:[] }, { value:' ' }]) {
  let tree, selected = null
  function Capture() { tree = Field({ id:'guarded-enter', value:scenario.value, disabled:scenario.disabled, onChange(){}, onSelect(key){ selected=key }, options:scenario.options ?? [{ key:'garchomp', label:'Garchomp' }] }); return tree }
  renderToStaticMarkup(React.createElement(Capture))
  const input = tree.props.children.find(child => child?.type === 'input')
  input.props.onFocus()
  input.props.onKeyDown({ key:'Enter', nativeEvent:{ isComposing:scenario.isComposing }, keyCode:scenario.keyCode ?? 13, preventDefault(){} })
  assert.equal(selected, null)
 }
})

test('Escape followed by Enter cannot select a hidden search result', () => {
 let tree, selected = null
 function Capture() { tree = Field({ id:'dismissed-enter', value:'Gar', onChange(){}, onSelect(key){ selected=key }, options:[{key:'garchomp',label:'Garchomp'}] }); return tree }
 renderToStaticMarkup(React.createElement(Capture))
 const input = tree.props.children.find(child => child?.type === 'input')
 input.props.onFocus()
 input.props.onKeyDown({ key:'Escape', nativeEvent:{}, keyCode:27, preventDefault(){} })
 input.props.onKeyDown({ key:'Enter', nativeEvent:{}, keyCode:13, preventDefault(){} })
 assert.equal(selected, null)
})

test('invalid numeric draft can disable selection without changing query', () => {
 const html = renderToStaticMarkup(React.createElement(Field, { id:'disabled-search', value:'Gar', disabled:true, onChange(){}, onSelect(){}, options:[{key:'garchomp',label:'Garchomp'}] }))
 assert.match(html, /disabled=""/)
 assert.match(html, /value="Gar"/)
})
