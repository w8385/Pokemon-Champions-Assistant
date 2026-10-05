import test from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'vite'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
let server, Panel
test.before(async () => { server = await createServer({ server: { middlewareMode:true, hmr:false }, appType:'custom', optimizeDeps:{ noDiscovery:true, include:[] } }); Panel = (await server.ssrLoadModule('/src/SpeedLinePanel.tsx')).default })
test.after(async () => { await server?.close() })
const rows = [{key:'fast', name_ko:'빠름', name_en:'Fast', speed:100, types:[]}, {key:'slow', name_ko:'느림', name_en:'Slow', speed:50, types:[]}]
const state = {referenceKey:'slow', referenceEffort:0, referenceNature:'neutral', listEffort:0, listNature:'neutral', query:'', forms:'all', comparison:'all', sort:'desc', rangeMode:'all', gap:10, items:'both', targetKey:'fast', targetItem:'scarf'}
const render = (patch={}) => renderToStaticMarkup(React.createElement(Panel, {rows, state:{...state,...patch}, onChange(){}, language:'en', translate:x=>x, displayName:x=>x.name_en}))
test('two distinct selectable rows preserve target identity and render inversion', () => {
 const html = render()
 assert.match(html, /data-key="fast" data-variant="normal"/)
 assert.match(html, /data-key="fast" data-variant="scarf"/)
 assert.match(html, /aria-pressed="true"/)
 assert.match(html, /Choice Scarf/)
 assert.match(html, /Investment/)
})
test('hidden target still resolves from full roster while unknown target shows key', () => {
 assert.match(render({items:'normal', query:'slow'}), /Fast[^]*Choice Scarf/)
 const html = render({targetKey:'unknown-key'})
 assert.match(html, /unknown-key/)
 assert.doesNotMatch(html, /Minimum effort/)
})
test('reference jump focuses immediately and recenters after deferred row layout', () => {
 let tree
 function Capture() { tree = Panel({ rows, state, onChange(){}, language:'en', translate:x=>x, displayName:x=>x.name_en }); return tree }
 renderToStaticMarkup(React.createElement(Capture))
 const nodes=[]
 const walk = node => { if(Array.isArray(node)) return node.forEach(walk); if(node?.props) { nodes.push(node); walk(node.props.children) } }
 walk(tree)
 const marker=nodes.find(node=>node.props.className?.includes('speed-line-reference-marker'))
 const button=nodes.find(node=>node.type==='button'&&node.props.children==='Jump to reference')
 const calls=[]; const frames=[]; const original=globalThis.requestAnimationFrame
 marker.props.ref.current={scrollIntoView:options=>calls.push(options),focus:()=>calls.push('focus')}
 globalThis.requestAnimationFrame=callback=>{frames.push(callback);return frames.length}
 try { button.props.onClick(); while(frames.length) frames.shift()(); assert.equal(calls[0].behavior,'auto'); assert.equal(calls[1],'focus'); assert.equal(calls.length,3); assert.equal(calls[2].block,'center') }
 finally { globalThis.requestAnimationFrame=original }
})
