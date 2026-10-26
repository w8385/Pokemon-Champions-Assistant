import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createServer } from 'vite'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const quick = app.slice(app.indexOf('const sideCard ='), app.indexOf('const statCard ='))
const party = app.slice(app.indexOf('registeredMoves.map('), app.indexOf('memberTopSuggestedMoves.length ?'))
const builder = app.slice(app.indexOf('sampleRegisteredMoves.map('), app.indexOf('  const sampleTopSuggestedMoves ='))
const damage = app.slice(app.indexOf('sampleDamageCalcs[0]?.row ?'), app.indexOf('sample-overview-stack sample-workbench-section sample-compare-targets-section', app.indexOf('sampleDamageCalcs[0]?.row ?')))

test('all editable move slots delegate the real input and option selection to one combobox', () => {
  for (const [section, callback] of [[quick, 'commit'], [party, 'selectMoveOption'], [builder, 'selectSampleMoveOption']]) {
    assert.match(section, /<RegisteredMoveSlot[^]*?search=\{\{/)
    assert.match(section, new RegExp('onSelect:.*' + callback))
    assert.doesNotMatch(section, /<div className="move-autocomplete-menu/)
    assert.doesNotMatch(section, /onKeyDown:/)
  }
  assert.match(quick, /filterMoveOptions\(draft, pool\)/)
  assert.match(app, /searchMoves\(options, query/)
  assert.match(app, /searchMoves\(index, query/)
})

test('sample damage uses the same real species picker; Dex and list filters do not add popups', () => {
  assert.match(damage, /<PokemonSearchField/)
  assert.doesNotMatch(damage, /<input\b/)
  assert.doesNotMatch(damage, /<div className="autocomplete-menu/)
  assert.match(app, /<SearchCombobox id="dex-unified-search" mode="filter"/)
  assert.match(readFileSync(new URL('../src/SpeedLinePanel.tsx', import.meta.url), 'utf8'), /<SearchCombobox id="speed-line-list-search" mode="filter"/)
})

test('filter mode renders one searchbox with no duplicate listbox', async () => {
  const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent' })
  try {
    const { default: SearchCombobox } = await server.ssrLoadModule('/src/SearchCombobox.tsx')
    const props = { id: 'dex-unified-search', mode: 'filter', value: '전기', options: [{ key: '볼트태클', label: '볼트태클' }], onChange() {}, onSelect() {} }
    const html = renderToStaticMarkup(React.createElement(SearchCombobox, props))
    assert.match(html, /role="searchbox"/)
    assert.doesNotMatch(html, /role="combobox"|role="listbox"|aria-controls/)

  } finally { await server.close() }
})

test('all move searches honor legal pool, initials and loaded multilingual labels', async () => {
  const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent' })
  try {
    const { searchMoves } = await server.ssrLoadModule('/src/moveSearch.ts')
    const pool = [{ name: '얼음엄니' }, { name: '볼트태클' }, { name: '불꽃펀치' }]
    const names = move => move.name === '얼음엄니' ? { nameEn: 'Ice Fang', nameJa: 'こおりのキバ' } : undefined
    assert.equal(searchMoves(pool, 'ㅇㅇㅇㄴ', { names, allowLoose: false })[0]?.name, '얼음엄니')
    assert.equal(searchMoves(pool, 'ice fang', { names })[0]?.name, '얼음엄니')
    assert.equal(searchMoves(pool, 'こおりのキバ', { names })[0]?.name, '얼음엄니')
    assert.deepEqual(searchMoves(pool.slice(1), 'ice fang', { names }), [])
  } finally { await server.close() }
})
