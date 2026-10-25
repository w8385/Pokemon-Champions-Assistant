import test from 'node:test'
import assert from 'node:assert/strict'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'
import { searchPokemon } from '../src/pokemonSearch.ts'
import { searchMoves } from '../src/moveSearch.ts'
import { byDisplayName, compareDisplayName } from '../src/displayOrder.ts'
import { championsData, additionalFormSpecs } from '../src/effectiveRoster.ts'

const names = entries => entries.map(entry => entry.name ?? entry.name_ko)

test('entire effective roster is shown in 가나다 order without changing authoritative IDs', () => {
  const rows = [...championsData.rows, ...additionalFormSpecs]
  const sourceKeys = rows.map(row => row.key)
  const ordered = searchPokemon(rows, '')
  assert.equal(ordered.length, rows.length)
  assert.deepEqual(new Set(ordered.map(row => row.key)), new Set(sourceKeys))
  for (let i=1; i<ordered.length; i++) {
    const left = ordered[i-1], right = ordered[i]
    assert.ok(left.name_ko.localeCompare(right.name_ko,'ko') < 0 || (left.name_ko === right.name_ko && left.key.localeCompare(right.key) <= 0), `${left.key} > ${right.key}`)
  }
  assert.deepEqual(rows.map(row => row.key),sourceKeys)
})

test('blank species catalog and equally ranked hits use Korean names, without mutating source or ranking speed', () => {
  const rows = [
    { key:'z', name_ko:'화염몬', name_en:'Firemon', speed:200 },
    { key:'b', name_ko:'가라몬', name_en:'Garamon', speed:20 },
    { key:'a', name_ko:'가라몬', name_en:'Garamon A', speed:10 },
    { key:'c', name_ko:'마라몬', name_en:'Maramon', speed:50 },
  ]
  const before = rows.map(row => row.key)
  assert.deepEqual(searchPokemon(rows, '').map(row => row.key), ['a','b','c','z'])
  assert.deepEqual(searchPokemon(rows, '몬').map(row => row.key), ['a','b','c','z'])
  assert.deepEqual(rows.map(row => row.key), before)
  assert.equal(searchPokemon(rows, 'Firemon')[0].key, 'z')
})

test('blank move selections and relevance ties are 가나다; exact and initials outrank tie order', () => {
  const moves = ['화염방사','아쿠아제트','가드','화염볼'].map(name => ({name}))
  const before = names(moves)
  assert.deepEqual(names(searchMoves(moves, '')), ['가드','아쿠아제트','화염방사','화염볼'])
  assert.deepEqual(names(searchMoves(moves, '화염')), ['화염방사','화염볼'])
  assert.equal(searchMoves(moves, 'ㅎㅇㅂ')[0].name, '화염볼')
  assert.equal(searchMoves(moves, '아젯')[0].name, '아쿠아제트')
  assert.deepEqual(names(moves), before)
})

test('per-form Dex move rows render alphabetically while preserving source pool identity and count', async () => {
  const server = await createServer({server:{middlewareMode:true},appType:'custom',logLevel:'silent'})
  try {
    const {DexMovePoolSection} = await server.ssrLoadModule('/src/DexMovePoolSection.tsx')
    const moves = [{name:'화염볼',type:'fire'},{name:'가드',type:'normal'},{name:'아쿠아제트',type:'water'}]
    const before = names(moves)
    const html = renderToStaticMarkup(React.createElement(DexMovePoolSection, {
      recordKey:'test',language:'ko',status:'ready',moves,metaForMove:()=>null,
      displayMoveName:name=>name,renderTypeBadge:type=>type,
      detailHref:name=>`#/dex/move/${name}`,onNavigate(){},
    }))
    assert.deepEqual([...html.matchAll(/class="dex-move-pool-link"[^>]*>([^<]+)/g)].map(match=>match[1]), ['가드','아쿠아제트','화염볼'])
    assert.match(html,/전체 3 · 표시 3/)
    assert.deepEqual(names(moves),before)
  } finally { await server.close() }
})

test('item and ability option defaults sort visible labels without changing search score or sources', () => {
  const app = readFileSync(new URL('../src/App.tsx',import.meta.url),'utf8')
  const source = ts.createSourceFile('App.tsx',app,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX)
  const func = name => {
    const node = source.statements.find(node => ts.isFunctionDeclaration(node) && node.name?.text === name)
    assert.ok(node,name)
    return node.getText(source)
  }
  const items = ['화염구슬','가벼운돌','기합의띠']
  const abilities = ['화염몸','가속','기합']
  const labels = { 화염구슬:'A Orb', 가벼운돌:'Z Stone', 기합의띠:'B Sash' }
  const context = {
    byDisplayName, compareDisplayName,
    CHAMPIONS_ITEM_OPTIONS:items, CHAMPIONS_ITEM_ALIASES:{},
    localizedChampionsItemLabel:(item,lang)=>lang==='en' ? labels[item] : item,
    translateText:(_language,item)=>item,
    matchesLooseQuery:(source,query)=>source.includes(query),
  }
  const code = ts.transpileModule(`${func('displayItemLabel')}\n${func('filterItemOptions')}\n${func('filterAbilityOptions')}\nglobalThis.itemFilter=filterItemOptions;globalThis.abilityFilter=filterAbilityOptions`,{compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText
  vm.runInNewContext(code,context)
  assert.deepEqual(Array.from(context.itemFilter('','ko')), ['가벼운돌','기합의띠','화염구슬'])
  assert.deepEqual(Array.from(context.itemFilter('','en')), ['화염구슬','기합의띠','가벼운돌'])
  assert.deepEqual(Array.from(context.abilityFilter(abilities,'')), ['가속','기합','화염몸'])
  assert.deepEqual(Array.from(context.itemFilter('구슬','ko')), ['화염구슬'])
  assert.deepEqual(items,['화염구슬','가벼운돌','기합의띠'])
  assert.deepEqual(abilities,['화염몸','가속','기합'])
})
