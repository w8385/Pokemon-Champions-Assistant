import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import ts from 'typescript'
import vm from 'node:vm'
import { parseDexSelectionId } from '../src/dex/helpers.ts'

const source = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const ast = ts.createSourceFile('App.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
let callback
function visit(node) {
  if (ts.isVariableDeclaration(node) && node.name.getText(ast) === 'dexSelectedAllResult') callback = node.initializer.arguments[0]
  ts.forEachChild(node, visit)
}
visit(ast)
assert.ok(callback)
const code = ts.transpileModule(`const resolve = ${callback.getText(ast)}; globalThis.resolve = resolve`, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText
const row = { key: 'pikachu' }
const pokemon = { id: 'pokemon:pikachu', kind: 'pokemon', key: 'pikachu', row }
function resolve(overrides = {}) {
  const context = vm.createContext({ hasDexUnifiedSearch: true, dexQueryPending: false, dexSelectedValue: pokemon.id, dexSearchMode: 'pokemon', dexAllResults: [pokemon], dexCategoryResults: [pokemon], parseDexSelectionId, indexByKey: new Map([['pikachu', row]]), MOVE_META_BY_NAME: {}, ABILITY_INDEX: {byKey: new Map()}, getItemIndexSync: () => ({byKey: new Map()}), dexSelectionId: (kind,key) => `${kind}:${key}`, ...overrides })
  vm.runInContext(code, context)
  return context.resolve()
}

test('Dex selected detail is scoped to the active category, including fallback IDs', () => {
  assert.equal(resolve()?.key, 'pikachu')
  assert.equal(resolve({ dexSearchMode: 'move', dexCategoryResults: [] }), null)
  assert.equal(resolve({ dexSearchMode: 'item', dexAllResults: [], dexCategoryResults: [] }), null)
})

test('blank-query and unified results share one projected card grid without duplicate rendering', () => {
  assert.match(source, /if \(hasDexUnifiedSearch\) return dexCategoryResults/)
  for (const [mode, options] of [['pokemon', 'dexSpeciesOptions'], ['move', 'dexMoveOptions'], ['ability', 'dexAbilityOptions']]) {
    assert.ok(source.includes(`if (dexSearchMode === '${mode}') return ${options}.${mode === 'pokemon' ? 'flatMap' : 'map'}`), `${mode} projects the blank-query list`)
  }
  assert.match(source, /return dexItemOptions\.map\(/)
  assert.equal((source.match(/<DexBrowseGrid\b/g) ?? []).length, 1)
})

test('pending unified-query input cannot commit an old Enter result; explicit detail remains stable', () => {
  assert.equal(resolve({ dexQueryPending: true })?.key, 'pikachu')
  const input = source.slice(source.indexOf('value={dexUnifiedSearchDraft}'), source.indexOf('</div>', source.indexOf('value={dexUnifiedSearchDraft}')))
  assert.match(input, /if \([^\n]*dexQueryPending[^\n]*\) return/)
})
