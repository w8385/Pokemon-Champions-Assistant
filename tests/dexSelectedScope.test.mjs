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
  const context = vm.createContext({ hasDexUnifiedSearch: true, dexQueryPending: false, dexSelectedValue: pokemon.id, dexSearchMode: 'pokemon', dexAllResults: [pokemon], dexCategoryResults: [pokemon], parseDexSelectionId, indexByKey: new Map([['pikachu', row]]), MOVE_META_BY_NAME: {}, ...overrides })
  vm.runInContext(code, context)
  return context.resolve()
}

test('Dex selected detail is scoped to the active category, including fallback IDs', () => {
  assert.equal(resolve()?.key, 'pikachu')
  assert.equal(resolve({ dexSearchMode: 'move', dexCategoryResults: [] }), null)
  assert.equal(resolve({ dexSearchMode: 'item', dexAllResults: [], dexCategoryResults: [] }), null)
})

test('legacy Dex rows are an alternative to unified results rather than a duplicate list', () => {
  for (const [mode, options] of [['pokemon', 'dexSpeciesOptions'], ['move', 'dexMoveOptions'], ['ability', 'dexAbilityOptions'], ['item', 'dexItemOptions']]) {
    assert.ok(source.includes(`{!hasDexUnifiedSearch && dexSearchMode === '${mode}' ? ${options}.map`), `${mode} rows must not render twice for a unified query`)
  }
})

test('pending unified-query input cannot display an old committed detail or commit an old Enter result', () => {
  assert.equal(resolve({ dexQueryPending: true }), null)
  const input = source.slice(source.indexOf('value={dexUnifiedSearchDraft}'), source.indexOf('</div>', source.indexOf('value={dexUnifiedSearchDraft}')))
  assert.match(input, /if \([^\n]*dexQueryPending[^\n]*\) return/)
})
