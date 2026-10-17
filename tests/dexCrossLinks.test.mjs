import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import ts from 'typescript'
import vm from 'node:vm'
import { dexSelectionId } from '../src/dex/helpers.ts'
const source = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const ast = ts.createSourceFile('App.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
const callbacks = new Map()
function visit(node) {
  if (ts.isVariableDeclaration(node) && ['openDexPokemonDetail','openDexMoveDetail','openDexAbilityDetail'].includes(node.name.getText(ast))) callbacks.set(node.name.getText(ast),node.initializer.arguments[0].getText(ast))
  ts.forEachChild(node,visit)
}
visit(ast)
function invoke(name,arg) {
  const state={mode:'pokemon',draft:'pika',committed:'pika',search:'pika',selection:'pokemon:pikachu'}
  const set=key=>value=>{state[key]=typeof value==='function'?value(state[key]):value}
  const context=vm.createContext({hasDexUnifiedSearch:true,siteLanguage:'ko',hideHoverTooltip(){},searchDisplayLabel:key=>key==='pikachu'?'피카츄':key,resolveAbilityInfo:()=>({key:'levitate',koLabel:'부유'}),dexSelectionId,setDexUnifiedSearchDraft:set('draft'),setDexUnifiedSearch:set('committed'),setDexSearch:set('search'),setDexSearchMode:set('mode'),setDexSelectedValue:set('selection')})
  const code=ts.transpileModule(`globalThis.navigate = ${callbacks.get(name)}`,{compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText
  vm.runInContext(code,context);context.navigate(arg)
  return state
}
for(const [callback,arg,mode,query,id] of [
 ['openDexMoveDetail','10만볼트','move','10만볼트','move:10만볼트'],
 ['openDexPokemonDetail','pikachu','pokemon','피카츄','pokemon:pikachu'],
 ['openDexAbilityDetail','levitate','ability','부유','ability:levitate'],
]) test(`${callback} commits category, target query and canonical selection together`,()=>{
 const state=invoke(callback,arg)
 assert.equal(state.mode,mode);assert.equal(state.draft,query);assert.equal(state.committed,query);assert.equal(state.search,query);assert.equal(state.selection,id)
})
