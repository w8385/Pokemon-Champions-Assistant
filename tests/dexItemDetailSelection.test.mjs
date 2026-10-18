import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'
import { CHAMPIONS_ITEM_OPTIONS, CHAMPIONS_ITEM_ALIASES, localizedChampionsItemLabel } from '../src/championsItems.ts'
import { parseDexSelectionId } from '../src/dex/helpers.ts'

const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const descriptions = JSON.parse(readFileSync(new URL('../src/dexDescriptions.json', import.meta.url), 'utf8'))
const appAst = ts.createSourceFile('App.tsx', app, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
const dataAst = ts.createSourceFile('data.ts', readFileSync(new URL('../src/dex/data.ts', import.meta.url), 'utf8'), ts.ScriptTarget.Latest, true)
function declaration(ast, name) {
  let found
  function visit(node) {
    if ((ts.isVariableDeclaration(node) || ts.isFunctionDeclaration(node)) && node.name?.getText(ast) === name) found = node
    ts.forEachChild(node, visit)
  }
  visit(ast)
  assert.ok(found, `${name} must exist`)
  return found.getText(ast).replace(/^export /, '')
}
const program = ts.transpileModule(`
  const ${declaration(appAst, 'ITEM_ALIAS_TO_CANONICAL')};
  ${declaration(appAst, 'canonicalChampionsItemName')}
  ${declaration(dataAst, 'normalizeSearchText')}
  let itemIndexCache = null;
  ${declaration(dataAst, 'getItemIndexSync')}
  ${declaration(dataAst, 'resolveItemInfo')}
  const resolve = ${(() => {
    let node
    function visit(n) {
      if (ts.isVariableDeclaration(n) && n.name.getText(appAst) === 'dexSelectedAllResult') node = n
      ts.forEachChild(n, visit)
    }
    visit(appAst)
    assert.ok(node)
    return node.initializer.arguments[0].getText(appAst)
  })()};
  globalThis.resolve = resolve;
`, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText
function selected(raw, overrides = {}) {
  const context = vm.createContext({
    CHAMPIONS_ITEM_OPTIONS, CHAMPIONS_ITEM_ALIASES, localizedChampionsItemLabel,
    getDexDescriptionsSync: () => descriptions,
    dexSelectedValue: `item:${raw}`, dexSearchMode: 'item',
    parseDexSelectionId, dexSelectionId: (kind, key) => `${kind}:${key}`,
    indexByKey: new Map(), MOVE_META_BY_NAME: {}, ABILITY_INDEX: { byKey: new Map() },
    ...overrides,
  })
  vm.runInContext(program, context)
  return context.resolve()
}

test('actual first Japanese item card opens detail even when description metadata is absent', () => {
  assert.equal(CHAMPIONS_ITEM_OPTIONS[0], 'あついいわ')
  assert.equal(descriptions.items['あついいわ'], undefined)
  const result = selected('あついいわ')
  assert.equal(result?.kind, 'item')
  assert.equal(result?.item, 'あついいわ')
  assert.equal(result?.id, 'item:あついいわ')
})

test('documented KO and EN item aliases resolve without changing the source selection', () => {
  for (const raw of ['뜨거운바위', 'Heat Rock']) {
    assert.ok(CHAMPIONS_ITEM_ALIASES['あついいわ'].includes(raw))
    assert.equal(selected(raw)?.item, raw)
  }
})

test('a description-backed entry and a roster-only item outside search results remain selectable', () => {
  assert.equal(selected('왕의징표석')?.item, '왕의징표석')
  assert.equal(selected(CHAMPIONS_ITEM_OPTIONS.at(-1), { dexItemOptions: [], dexAllResults: [], dexQueryPending: true })?.item, CHAMPIONS_ITEM_OPTIONS.at(-1))
})

test('unknown token and mismatched category show recovery instead of selecting another item', () => {
  assert.equal(selected('not-a-dex-item'), null)
  assert.equal(selected('あついいわ', { dexSearchMode: 'pokemon' }), null)
})
