import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import vm from 'node:vm'
import ts from 'typescript'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'
import { dexSelectionId } from '../src/dex/helpers.ts'

const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const ast = ts.createSourceFile('App.tsx', app, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
function declaration(name) {
  let found
  function visit(node) {
    if (ts.isVariableDeclaration(node) && node.name.getText(ast) === name) found = node
    ts.forEachChild(node, visit)
  }
  visit(ast)
  assert.ok(found, `${name} is declared in actual App`)
  return found
}
function evaluate(declarations, context) {
  const code = ts.transpileModule(`${declarations.map(name => `const ${declaration(name).getText(ast)};`).join('\n')}\nglobalThis.result = {${declarations.join(',')}}`, { compilerOptions:{target:ts.ScriptTarget.ES2022} }).outputText
  vm.runInNewContext(code, context)
  return context.result
}
function compile(path) {
  const exports = {}
  const output = ts.transpileModule(readFileSync(path, 'utf8'), { compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true} }).outputText
  vm.runInNewContext(output, { exports, require:createRequire(path) })
  return exports
}

test('actual pool link opens move category on a fresh native tab with destination query', () => {
  const { dexListHref, dexDetailHref } = evaluate(['dexListHref','dexDetailHref'], { React:{useMemo:fn=>fn()},URLSearchParams,dexSearchMode:'pokemon',dexUnifiedSearchDraft:'후딘',dexSelectionId })
  assert.match(dexListHref, /dexTab=pokemon/)
  const href = dexDetailHref('move','볼가득넣기')
  const params = new URL(href.slice(1),'https://example.test').searchParams
  assert.equal(params.get('dexTab'),'move')
  assert.equal(params.get('sel'),'move:볼가득넣기')
  assert.equal(params.get('q'),'볼가득넣기')
  assert.equal(params.get('uq'),'볼가득넣기')
  assert.match(app, /detailHref=\{name => dexDetailHref\('move', name\)\}/)
  assert.match(app, /event\.ctrlKey \|\| event\.shiftKey \|\| event\.altKey/)
})

test('ID 747 resolves synchronously on a fresh direct URL but unknown identity remains missing', async () => {
  const api = compile(new URL('../src/dexGameMoveIndex.ts', import.meta.url))
  const source = api.getDexGameMove('볼가득넣기')
  assert.equal(source.id,747)
  assert.equal(source.sourceKo,'볼가득넣기')
  assert.equal(source.type,'normal')
  assert.equal(api.getDexGameMove('실제로없는기술'),null)
  const server = await createServer({server:{middlewareMode:true},appType:'custom',logLevel:'silent'})
  let getMoveMetadata
  try { ({getMoveMetadata} = await server.ssrLoadModule('/src/moveMetadata.ts'))
  const projected = getMoveMetadata('볼가득넣기').meta
  assert.equal(projected.category,null)
  assert.equal(projected.power,null)
  assert.equal(projected.accuracy,null)
  assert.equal(projected.pp,null)
  assert.equal(projected.type,'normal')
  assert.equal(getMoveMetadata('실제로없는기술'),null)
  assert.match(declaration('dexSelectedAllResult').getText(ast), /getMoveMetadata\(key\)\?\.meta/)
  const resolver = declaration('dexSelectedAllResult').initializer.getText(ast)
  function resolve(selection) {
    const context = {React:{useMemo:fn=>fn()},dexSelectedValue:selection,dexSearchMode:'move',
      parseDexSelectionId:token=>({kind:token.slice(0,token.indexOf(':')),key:token.slice(token.indexOf(':')+1)}),
      dexSelectionId, getMoveMetadata,asyncDataVersion:0}
    const code = ts.transpileModule(`globalThis.result = ${resolver}`,{compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText
    vm.runInNewContext(code,context)
    return context.result
  }
  assert.equal(resolve('move:볼가득넣기').meta.type,'normal')
  assert.equal(resolve('move:실제로없는기술'),null)
  assert.match(app, /dexSelectedMove\.meta\.category \? displayMoveCategoryName\(dexSelectedMove\.meta\.category, siteLanguage\) : '—'/)
  assert.match(app, /dexSelectedMove\.meta\.priority \?\? '—'/)
  } finally { await server.close() }
})

test('all 510 pinned source move types agree in lazy pool and small fresh-route index', () => {
  const data = JSON.parse(readFileSync(new URL('../src/dexGameLearnsets.json',import.meta.url),'utf8'))
  const index = JSON.parse(readFileSync(new URL('../src/dexGameMoveIndex.json',import.meta.url),'utf8'))
  const original = JSON.parse(readFileSync(new URL('./fixtures/champoutMoveTypes.json',import.meta.url),'utf8'))
  const names = ['normal','fighting','flying','poison','ground','rock','bug','ghost','steel','fire','water','grass','electric','psychic','ice','dragon','dark','fairy']
  assert.equal(Object.keys(original).length,510)
  assert.equal(Object.keys(data.moves).length,510)
  assert.equal(Object.keys(index).length,510)
  for (const [id, move] of Object.entries(data.moves)) {
    assert.equal(move.type,names[original[id]], `pinned move ${id} ${move.appName}`)
    assert.deepEqual(index[move.appName],{id:Number(id),sourceKo:move.sourceKo,type:move.type})
  }
  assert.equal(data.moves[74].type,'grass')
  assert.equal(data.moves[779].type,'steel')
  assert.equal(data.moves[747].type,'normal')
})

test('rendered game pool badges and type filters use source type over legacy metadata', async () => {
  const server = await createServer({server:{middlewareMode:true},appType:'custom',logLevel:'silent'})
  try {
    const {DexMovePoolSection} = await server.ssrLoadModule('/src/DexMovePoolSection.tsx')
    const html = renderToStaticMarkup(React.createElement(DexMovePoolSection,{
      recordKey:'stunfisk-galarian', language:'ko', status:'ready',moves:[{name:'집게덫',type:'steel'}],
      provenance:{kind:'game-snapshot',date:'2026-09-09',commit:'50e7233b78c3b81df29563f9695386c28e77fc95'},
      metaForMove:()=>({type:'grass',category:'physical',power:35,accuracy:100,pp:15}),
      displayMoveName:name=>name,renderTypeBadge:type=>React.createElement('span',{'data-type':type},type),
      detailHref:name=>`#/dex?dexTab=move&sel=move:${name}`,onNavigate(){},
    }))
    assert.match(html, /<option value="steel">steel<\/option>/)
    assert.doesNotMatch(html, /<option value="grass">grass<\/option>/)
    assert.match(html, /data-type="steel"/)
    assert.match(html, /타입은 게임 스냅샷/)
  } finally {await server.close()}
  assert.match(declaration('dexSelectedAllResult').getText(ast), /getMoveMetadata\(key\)\?\.meta/)
  assert.match(app, /tooltipPropsForMove=\{name => bindTooltip\(moveTooltipData\(name, siteLanguage\)\)\}/)
})
