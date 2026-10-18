import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

const source = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const ast = ts.createSourceFile('App.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
function initializer(name) {
  let expression
  function visit(node) {
    if (ts.isVariableDeclaration(node) && node.name.getText(ast) === name) expression = node.initializer
    ts.forEachChild(node, visit)
  }
  visit(ast)
  assert.ok(expression, name)
  return expression.getText(ast)
}
function evaluate(expression, values) {
  const context = vm.createContext({...values})
  const code = ts.transpileModule(`globalThis.result = ${expression}`, {compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText
  vm.runInContext(code,context)
  return context.result
}
const option = key => ({key, name:key, meta:{type:'normal'}, koLabel:key, pokemonKeys:[]})
const roster = Array.from({length:80},(_,i)=>option(`p${i}`))
const moves = Array.from({length:90},(_,i)=>option(`m${i}`))
const abilities = Array.from({length:70},(_,i)=>option(`a${i}`))
const items = Array.from({length:65},(_,i)=>`i${i}`)
const filters = {
  filterSpeciesOptions:()=>roster, filterDexMoveOptions:()=>moves,
  filterDexAbilityOptions:()=>abilities, filterItemOptions:()=>items,
  siteLanguage:'ko', deferredDexSearch:'', asyncDataVersion:0,
}

test('all four actual Dex option projections keep every canonical source match', () => {
  for (const [name, expected] of [['dexSpeciesOptions',80],['dexMoveOptions',90],['dexAbilityOptions',70],['dexItemOptions',65]]) {
    const memo = evaluate(initializer(name), {...filters, React:{useMemo:fn=>fn()}})
    assert.equal(memo.length,expected,name)
    assert.equal(new Set(memo.map(x=>x.key ?? x)).size,expected)
  }
})

test('unified queried results retain every kind past previous per-kind and global caps', () => {
  const result = evaluate(initializer('dexAllResults'), {
    ...filters, deferredDexUnifiedSearch:'common',
    React:{useMemo:fn=>fn()}, indexByKey:new Map(roster.map(o=>[o.key,{key:o.key}])),
    dexSelectionId:(kind,key)=>`${kind}:${key}`,
    localizedDexText:()=>null, itemDescriptionFor:()=>null,
  })
  assert.equal(result.length,305)
  for (const [kind,total] of [['pokemon',80],['move',90],['ability',70],['item',65]]) {
    assert.equal(result.filter(x=>x.kind===kind).length,total)
  }
  assert.equal(new Set(result.map(x=>x.id)).size,305)
})

test('scope pagination resets only when category or committed normalized query changes', async () => {
  const server = await createServer({server:{middlewareMode:true},appType:'custom',logLevel:'silent'})
  try {
    const {dexPageScope,dexVisibleCount,DEX_PAGE_SIZE} = await server.ssrLoadModule('/src/dexPagination.ts')
    const a = dexPageScope('pokemon','  Pikachu  ')
    assert.equal(a,dexPageScope('pokemon','pikachu'))
    assert.notEqual(a,dexPageScope('move','pikachu'))
    assert.notEqual(a,dexPageScope('pokemon','eevee'))
    assert.equal(dexVisibleCount({scope:a,count:72},a),72)
    assert.equal(dexVisibleCount({scope:a,count:72},dexPageScope('pokemon','eevee')),DEX_PAGE_SIZE)
    assert.equal(dexVisibleCount({scope:a,count:72},a,30),30)
  } finally { await server.close() }
})

test('deep-detail return waits for the exact list scope, settled query and loaded cards', async () => {
  const server = await createServer({server:{middlewareMode:true},appType:'custom',logLevel:'silent'})
  try {
    const {dexScrollRestoreReady} = await server.ssrLoadModule('/src/dexPagination.ts')
    const pending = {scope:'pokemon\u0000mega',count:82,y:6482}
    const view = {section:'dex',selection:null,queryPending:false,scope:pending.scope,visibleCount:82,totalCount:82}
    assert.equal(dexScrollRestoreReady(pending,{...view,queryPending:true}),false)
    assert.equal(dexScrollRestoreReady(pending,{...view,scope:'ability\u0000trace'}),false)
    assert.equal(dexScrollRestoreReady(pending,{...view,visibleCount:24}),false)
    assert.equal(dexScrollRestoreReady(pending,{...view,selection:'pokemon:mega-alakazam'}),false)
    assert.equal(dexScrollRestoreReady(pending,{...view,section:'sample'}),false)
    assert.equal(dexScrollRestoreReady(pending,view),true)
    assert.equal(dexScrollRestoreReady({...pending,count:100},{...view,totalCount:82}),true)
  } finally { await server.close() }
})

test('route restoration defers Dex scroll to a cancellable effect after render, not popstate frames', () => {
  const routeEffect = source.slice(source.indexOf('const restoreRoute = () => {'),source.indexOf("window.addEventListener('hashchange', restoreRoute)"))
  assert.match(routeEffect,/pendingDexScrollRestore\.current\s*=/)
  assert.doesNotMatch(routeEffect,/requestAnimationFrame|scrollTo/)
  assert.match(source,/const pending = pendingDexScrollRestore\.current[\s\S]*?dexScrollRestoreReady\(pending,/)
  assert.match(source,/cancelAnimationFrame/)
})

test('actual grid displays count, manual fallback and honest completion without replacing preview links', async () => {
  const server = await createServer({server:{middlewareMode:true},appType:'custom',logLevel:'silent'})
  try {
    const {DexBrowseGrid} = await server.ssrLoadModule('/src/DexBrowseGrid.tsx')
    const props = {language:'ko',busy:false,onNavigate(){},renderTypeBadge:()=>null,onLoadMore(){},totalCount:60}
    const item = {id:'pokemon:p1',kind:'pokemon',href:'#/dex?dexTab=pokemon&sel=pokemon%3Ap1',label:'피카츄'}
    let html = renderToStaticMarkup(React.createElement(DexBrowseGrid,{...props,items:[item]}))
    assert.match(html,/1\s*\/\s*60/)
    assert.match(html,/더보기/)
    assert.match(html,/dex-browse-sentinel/)
    assert.match(html,/href="#\/dex\?dexTab=pokemon/)
    html = renderToStaticMarkup(React.createElement(DexBrowseGrid,{...props,items:[item],totalCount:1}))
    assert.doesNotMatch(html,/>더보기</)
    assert.match(html,/모두 표시/)
    html = renderToStaticMarkup(React.createElement(DexBrowseGrid,{...props,items:[],totalCount:0,busy:true}))
    assert.match(html,/검색 중/)
    assert.doesNotMatch(html,/dex-browse-card/)
  } finally { await server.close() }
})

test('list stores visible batch beside native history scroll and route keeps original URL keys', () => {
  assert.match(source,/dexListCount/)
  assert.match(source,/dexListScroll/)
  assert.match(source,/params\.set\('dexTab'/)
  assert.match(source,/params\.set\('sel'/)
  assert.match(source,/dexQueryPending\s*\?\s*\[\]/)
})

test('sentinel consumes one intersection per page, disconnects and has no-observer fallback', () => {
  const grid = readFileSync(new URL('../src/DexBrowseGrid.tsx',import.meta.url),'utf8')
  const tree = ts.createSourceFile('DexBrowseGrid.tsx',grid,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX)
  const functionNode = tree.statements.find(node => ts.isFunctionDeclaration(node) && node.name?.text === 'DexLoadSentinel')
  assert.ok(functionNode)
  const code = ts.transpileModule(`${functionNode.getText(tree)}\nglobalThis.Sentinel = DexLoadSentinel`, {compilerOptions:{target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.React}}).outputText
  const observers = []
  let cleanup
  let loaded = 0
  const ReactStub = {useRef:()=>({current:{}}),useEffect:effect=>{ cleanup = effect() },createElement:()=>null}
  const context = vm.createContext({React:ReactStub,IntersectionObserver:class {
    constructor(callback,options) {this.callback=callback;this.options=options;this.disconnected=0;observers.push(this)}
    observe(node) {this.node=node}
    disconnect() {this.disconnected++}
  }})
  vm.runInContext(code,context)
  context.Sentinel({onLoadMore:()=>loaded++})
  assert.equal(observers.length,1)
  assert.match(observers[0].options.rootMargin,/400px/)
  observers[0].callback([{isIntersecting:false}])
  observers[0].callback([{isIntersecting:true},{isIntersecting:true}])
  observers[0].callback([{isIntersecting:true}])
  assert.equal(loaded,1)
  assert.ok(observers[0].disconnected >= 1)
  cleanup()
  context.Sentinel({onLoadMore:()=>loaded++})
  observers[1].callback([{isIntersecting:true}])
  assert.equal(loaded,2)
  delete context.IntersectionObserver
  context.Sentinel({onLoadMore:()=>loaded++})
  assert.equal(observers.length,2)
  assert.equal(loaded,2)
})

test('page transition from a new category can advance before its scope effect, without duplicate callbacks', async () => {
  const server = await createServer({server:{middlewareMode:true},appType:'custom',logLevel:'silent'})
  try {
    const {dexNextPage,dexPageScope,DEX_PAGE_SIZE} = await server.ssrLoadModule('/src/dexPagination.ts')
    const old = {scope:dexPageScope('pokemon',''),count:72}
    const nextScope = dexPageScope('move','')
    const advanced = dexNextPage(old,nextScope,100,DEX_PAGE_SIZE)
    assert.equal(advanced.scope,nextScope)
    assert.equal(advanced.count,48)
    assert.equal(dexNextPage(advanced,nextScope,100,DEX_PAGE_SIZE),advanced)
    assert.equal(dexNextPage({scope:nextScope,count:96},nextScope,100,96).count,100)
  } finally { await server.close() }
})
