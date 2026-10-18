import test from 'node:test'
import assert from 'node:assert/strict'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

test('four real Dex preview cards render once as native detail links with existing preview classes', async () => {
  const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent' })
  try {
    const { DexBrowseGrid } = await server.ssrLoadModule('/src/DexBrowseGrid.tsx')
    const items = [
      { id:'pokemon:gengar', href:'#/dex/pokemon/gengar', kind:'pokemon', label:'팬텀', secondaryLabel:'Gengar', sprite:'/gengar.png', types:['ghost','poison'] },
      { id:'move:shadow-ball', href:'#/dex/move/shadow-ball', kind:'move', label:'섀도볼', types:['ghost'], metaText:'특수 · 위력 80 · PP 15' },
      { id:'ability:levitate', href:'#/dex/ability/levitate', kind:'ability', label:'부유', metaText:'3마리', pokemonSprites:[{key:'gengar',src:'/gengar.png'}] },
      { id:'item:orb', href:'#/dex/item/orb', kind:'item', label:'구슬', sprite:'/orb.png', secondaryLabel:'설명' },
    ]
    const html = renderToStaticMarkup(React.createElement(DexBrowseGrid, { items, language:'ko', busy:false, onNavigate(){}, renderTypeBadge:type=>React.createElement('span', {'data-type':type},type) }))
    assert.equal((html.match(/<a\s/g) ?? []).length, 4)
    assert.match(html, /href="#\/dex\/pokemon\/gengar"/)
    for (const cls of ['dex-pokemon-preview-row','dex-move-preview-row','dex-ability-result-card','dex-item-preview-sprite']) assert.match(html, new RegExp(cls))
    assert.match(html, /data-type="ghost"/)
  } finally { await server.close() }
})

test('browse links preserve native href and compose item tooltip with parent navigation', async () => {
  const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent' })
  try {
    const { DexBrowseGrid } = await server.ssrLoadModule('/src/DexBrowseGrid.tsx')
    const events = []
    const item = { id:'item:orb', href:'#/dex/item/orb', kind:'item', label:'구슬' }
    const grid = DexBrowseGrid({items:[item], language:'en', busy:false, renderTypeBadge:()=>null,
      tooltipPropsForItem:id => ({'data-tooltip':id, onClick:()=>events.push('tooltip')}),
      onNavigate:(_event,id)=>events.push(id),
    })
    const anchor = grid.props.children[2][0]
    assert.equal(anchor.type, 'a')
    assert.equal(anchor.props.href, item.href)
    assert.equal(anchor.props['data-tooltip'], item.id)
    anchor.props.onClick({defaultPrevented:false, preventDefault(){ events.push('prevented') }})
    assert.deepEqual(events, ['tooltip',item.id])
    assert.match(renderToStaticMarkup(React.createElement(DexBrowseGrid, { items:[item], language:'en', busy:false, onNavigate(){}, renderTypeBadge:()=>null })), /item-generic\.svg/)
  } finally { await server.close() }
})
