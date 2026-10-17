import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'
import { dexSelectionId } from '../src/dex/helpers.ts'

const source = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const ast = ts.createSourceFile('App.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
const declarations = new Map()
function visit(node) {
  if (node.name && (ts.isFunctionDeclaration(node) || ts.isVariableDeclaration(node)) && ['syncViewStateToUrl', 'pushDexDetailHistory', 'openDexPokemonDetail', 'openDexMoveDetail', 'restoreRoute'].includes(node.name.getText(ast))) declarations.set(node.name.getText(ast), node)
  ts.forEachChild(node, visit)
}
visit(ast)
const code = ts.transpileModule([...declarations.values()].map(node => node.getText(ast)).join('\n') + '\nglobalThis.openPokemon = openDexPokemonDetail; globalThis.openMove = openDexMoveDetail; globalThis.sync = syncViewStateToUrl; globalThis.restore = restoreRoute;', { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText

function harness() {
  let current = 0
  let onRestore = () => {}
  const entries = ['https://example.test/#/dex?dexTab=pokemon&q=후딘&uq=후딘&sel=pokemon%3Aalakazam']
  const location = { get href() { return entries[current] }, get hash() { return new URL(entries[current]).hash } }
  const history = {
    pushState(_data, _title, url) { entries.splice(++current); entries.push(String(url)) },
    replaceState(_data, _title, url) { entries[current] = String(url) },
    back() { if (current > 0) { current--; onRestore() } },
    forward() { if (current < entries.length - 1) { current++; onRestore() } },
  }
  const state = { mode: 'pokemon', query: '후딘', selection: 'pokemon:alakazam' }
  const parseViewStateFromUrl = () => {
    const route = new URL(location.hash.slice(1), 'https://example.test')
    return { mainSection: 'dex', dexSearchMode: route.searchParams.get('dexTab'), dexSearch: route.searchParams.get('q'), dexUnifiedSearch: route.searchParams.get('uq'), dexSelectedValue: route.searchParams.get('sel') }
  }
  const context = vm.createContext({ URL, URLSearchParams, window: { location, history }, dexSelectionId, parseViewStateFromUrl, lastSpeedLineRoute: { current: null }, setMainSection(){}, setLibrarySourceId(){}, setActiveTab(){}, setSampleWorkbenchTab(){}, setSelectedMy(){}, setSelectedOpp(){}, party: [], opponents: [], sanitizeSelectedIndex(){}, restoringDexRoute: { current: null }, siteLanguage: 'ko', hideHoverTooltip(){}, searchDisplayLabel: key => key === 'mega-alakazam' ? '메가후딘' : key,
    setDexSearchMode: value => { state.mode = value }, setDexSearch(){}, setDexUnifiedSearchDraft: value => { state.query = value }, setDexUnifiedSearch(){}, setDexSelectedValue: value => { state.selection = value },
    React: { useCallback: fn => fn },
  })
  vm.runInContext(code, context)
  onRestore = () => context.restore()
  const sync = () => context.sync({ mainSection: 'dex', dexSearchMode: state.mode, dexSearch: state.query, dexUnifiedSearch: state.query, dexSelectedValue: state.selection })
  return { context, history, entries, state, get href() { return location.href }, sync }
}

test('Dex detail chips preserve atomic category/query/selection and Back/Forward, without a keystroke entry', () => {
  const app = harness()
  app.context.openMove('사이코키네시스'); app.sync()
  assert.equal(app.entries.length, 2)
  assert.match(app.href, /dexTab=move&q=/)
  assert.equal(new URL(new URL(app.href).hash.slice(1), 'https://example.test').searchParams.get('sel'), 'move:사이코키네시스')
  app.context.openPokemon('mega-alakazam'); app.sync()
  assert.equal(app.entries.length, 3)
  assert.match(app.href, /dexTab=pokemon&q=/)
  app.history.back()
  assert.deepEqual({ mode: app.state.mode, query: app.state.query, selection: app.state.selection }, { mode: 'move', query: '사이코키네시스', selection: 'move:사이코키네시스' })
  assert.equal(new URL(new URL(app.href).hash.slice(1), 'https://example.test').searchParams.get('dexTab'), 'move')
  assert.equal(new URL(new URL(app.href).hash.slice(1), 'https://example.test').searchParams.get('q'), '사이코키네시스')
  assert.equal(new URL(new URL(app.href).hash.slice(1), 'https://example.test').searchParams.get('sel'), 'move:사이코키네시스')
  app.history.back()
  assert.deepEqual({ mode: app.state.mode, query: app.state.query, selection: app.state.selection }, { mode: 'pokemon', query: '후딘', selection: 'pokemon:alakazam' })
  assert.equal(new URL(app.href).hash.includes('sel=pokemon%3Aalakazam'), true)
  app.history.forward()
  assert.equal(app.state.mode, 'move')
  assert.equal(new URL(new URL(app.href).hash.slice(1), 'https://example.test').searchParams.get('sel'), 'move:사이코키네시스')
  // Draft URL sync intentionally replaces the current entry rather than pushing per key.
  app.context.setDexUnifiedSearchDraft('other')
  app.sync()
  assert.equal(app.entries.length, 3)
})
