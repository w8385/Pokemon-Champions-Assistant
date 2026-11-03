import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'
import { createServer } from 'vite'
import { CHAMPIONS_ITEM_OPTIONS, CHAMPIONS_ITEM_ALIASES, localizedChampionsItemLabel } from '../src/domain/champions/championsItems.ts'
import { classifyHeldItem, canonicalHeldItem, isCalculableHeldItem } from '../src/domain/champions/itemIdentity.ts'
import { byDisplayName, compareDisplayName } from '../src/shared/search/displayOrder.ts'

const ast = ts.createSourceFile('App.tsx', readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
const itemAst = ts.createSourceFile('itemPresentation.ts', readFileSync(new URL('../src/shared/display/itemPresentation.ts', import.meta.url), 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
const entryAst = ts.createSourceFile('entryHelpers.tsx', readFileSync(new URL('../src/shared/display/entryHelpers.tsx', import.meta.url), 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
const declarations = new Map()
let input
function visit(node) {
  if ((ts.isFunctionDeclaration(node) || ts.isVariableDeclaration(node)) && node.name && ts.isIdentifier(node.name)) declarations.set(node.name.text, node)
  if (ts.isJsxSelfClosingElement(node) && node.tagName.getText(ast) === 'input' && node.attributes.properties.some(p => ts.isJsxAttribute(p) && p.name.text === 'className' && p.initializer?.text === 'opponent-meta-input')) input = node
  ts.forEachChild(node, visit)
}
visit(ast)
function itemVisit(node) { if ((ts.isFunctionDeclaration(node) || ts.isVariableDeclaration(node)) && node.name && ts.isIdentifier(node.name)) declarations.set(node.name.text, { getText: () => node.getText(itemAst).replace(/^export /, '') }); ts.forEachChild(node, itemVisit) }
itemVisit(itemAst)
function entryVisit(node) { if ((ts.isFunctionDeclaration(node) || ts.isVariableDeclaration(node)) && node.name && ts.isIdentifier(node.name)) declarations.set(node.name.text, { getText: () => node.getText(entryAst).replace(/^export /, '') })
  ts.forEachChild(node, entryVisit) }
entryVisit(entryAst)
assert.match(readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8'), /from '\.\/shared\/display\/entryHelpers'/)
assert.ok(input, 'actual opponent item input JSX')
const attr = name => input.attributes.properties.find(p => ts.isJsxAttribute(p) && p.name.text === name)?.initializer?.expression
const transpile = text => ts.transpileModule(text, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None } }).outputText
const handlerCode = transpile([...['isAllowedChampionsItem', 'matchesLooseQuery', 'displayItemLabel', 'filterItemOptions', 'resolveItemInput', 'sameItemField', 'highlightedAutocompleteIndex', 'nextAutocompleteIndex'].map(name => declarations.get(name).getText(ast)), ...['selectOpponentItemOption', 'commitOpponentItemInput', 'setAutocompleteMenuOpen', 'moveAutocompleteMenuHighlight', 'closeAutocompleteMenu'].map(name => declarations.get(name).getText(ast)), `globalThis.keyDown = ${attr('onKeyDown').getText(ast)}; globalThis.focus = ${attr('onFocus').getText(ast)}; globalThis.blur = ${attr('onBlur').getText(ast)}; globalThis.change = ${attr('onChange').getText(ast)};`].join('\n'))

function itemFixture(item = '') {
  const record = { key: 'garchomp', item, ability: 'rough-skin', revealedMoves: ['a', '', '', ''], rawSource: { item } }
  const state = { opponents: [record], opponentItemDrafts: [item], selectedOpp: 0, activeItemField: null, autocompleteHighlight: null, writes: 0 }
  const context = vm.createContext({ ...state, oppMember: record, siteLanguage: 'ko', CHAMPIONS_ITEM_OPTIONS, CHAMPIONS_ITEM_ALIASES, localizedChampionsItemLabel, canonicalChampionsItemName: canonicalHeldItem, classifyHeldItem, isCalculableHeldItem, byDisplayName, compareDisplayName,
    resolveItemInfo: () => null, translateText: (_language, text) => text, React: { useCallback: callback => callback },
    setTimeout: callback => callback(),
    setOpponents(update) { state.opponents = typeof update === 'function' ? update(state.opponents) : update; context.opponents = state.opponents; state.writes++ },
    setOpponentItemDrafts(update) { state.opponentItemDrafts = typeof update === 'function' ? update(state.opponentItemDrafts) : update; context.opponentItemDrafts = state.opponentItemDrafts },
    setActiveItemField(update) { state.activeItemField = typeof update === 'function' ? update(state.activeItemField) : update; context.activeItemField = state.activeItemField },
    setAutocompleteHighlight(update) { state.autocompleteHighlight = typeof update === 'function' ? update(state.autocompleteHighlight) : update; context.autocompleteHighlight = state.autocompleteHighlight },
  })
  vm.runInContext(handlerCode, context)
  const key = (name, options = {}) => { let prevented = false; context.keyDown({ key: name, keyCode: options.code ?? 13, nativeEvent: { isComposing: Boolean(options.composing) }, preventDefault() { prevented = true } }); return prevented }
  const type = value => context.change({ target: { value } })
  return { state, context, key, type, options: query => vm.runInContext(`filterItemOptions(${JSON.stringify(query)}, siteLanguage, { fallbackToAll: false }).slice(0, 8)`, context) }
}

test('actual opponent item JSX selects visible highlighted approved candidate for partial query', () => {
  const app = itemFixture('unrecognized-old-raw')
  app.context.focus()
  app.type('구애')
  const options = app.options('구애')
  assert.ok(options.length >= 1 && options.includes('こだわりスカーフ'))
  const chosen = options[Math.min(1, options.length - 1)]
  assert.equal(app.key('ArrowDown'), true)
  assert.equal(app.key('Enter'), true)
  assert.equal(app.state.opponents[0].item, chosen)
  assert.equal(app.state.opponents[0].ability, 'rough-skin')
  assert.equal(app.state.opponents[0].rawSource.item, 'unrecognized-old-raw')
  assert.equal(app.state.autocompleteHighlight, null)
})

test('actual opponent item handler uses first visible candidate without an arrow and guards closed/IME/unknown/blank/old raw', () => {
  const first = itemFixture(); first.context.focus(); first.type('구애'); first.key('Enter')
  assert.equal(first.state.opponents[0].item, first.options('구애')[0])
  const exact = itemFixture('unrecognized-old-raw'); exact.context.focus(); exact.type('こだわりスカーフ'); exact.key('Enter')
  assert.equal(exact.state.opponents[0].item, 'こだわりスカーフ', 'open exact query selects approved candidate')
  for (const guard of ['closed', 'Escape', 'Tab', 'ime', '229']) {
    const app = itemFixture('unrecognized-old-raw'); app.context.focus(); app.type('구애')
    if (guard === 'closed') app.context.closeAutocompleteMenu('opponent-item-0')
    if (guard === 'Escape' || guard === 'Tab') app.key(guard)
    app.key('Enter', { composing: guard === 'ime', code: guard === '229' ? 229 : 13 })
    assert.equal(app.state.opponents[0].item, 'unrecognized-old-raw', guard)
  }
  for (const guard of ['closed', 'Escape', 'Tab']) {
    for (const raw of ['こだわりスカーフ', '']) {
      const app = itemFixture('unrecognized-old-raw'); app.context.focus(); app.type(raw)
      if (guard === 'closed') app.context.closeAutocompleteMenu('opponent-item-0')
      else app.key(guard)
      const writes = app.state.writes
      app.key('Enter')
      assert.equal(app.state.writes, writes, `${guard}: ${raw || 'explicit blank'}`)
      assert.equal(app.state.opponents[0].item, 'unrecognized-old-raw', `${guard}: ${raw || 'explicit blank'}`)
    }
  }
  for (const raw of ['not-an-item', '돌격조끼', 'とつげきチョッキ', 'Assault Vest', '']) {
    const app = itemFixture('unrecognized-old-raw'); app.context.focus(); app.type(raw); app.key('Enter')
    assert.equal(app.state.opponents[0].item, raw === '' ? '' : 'unrecognized-old-raw', raw)
  }
  const old = itemFixture('unrecognized-old-raw'); old.context.focus(); old.context.blur()
  assert.equal(old.state.opponents[0].item, 'unrecognized-old-raw')
  const restored = itemFixture(old.state.opponents[0].item)
  assert.equal(restored.state.opponents[0].item, 'unrecognized-old-raw', 'reload-like initial draft keeps saved raw item')
})

function memoExpression(name) {
  const node = declarations.get(name)
  assert.ok(node && ts.isCallExpression(node.initializer))
  return node.initializer.getText(ast)
}

test('actual lazy provider and App description memo update same direct ordinary item selection on settled load, retain EN/JA and unknown recovery', async () => {
  const vite = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom', optimizeDeps: { noDiscovery: true, include: [] }, logLevel: 'silent' })
  try {
    const { itemDescriptionFor, moveDescriptionFor, abilityDescriptionFor, loadDexDescriptions } = await vite.ssrLoadModule('/src/adapters/catalog/data.ts')
    const selectedKey = CHAMPIONS_ITEM_OPTIONS[0]
    assert.equal(selectedKey, 'あついいわ')
    assert.equal(itemDescriptionFor(selectedKey), null, 'real provider initially unloaded')
    const memos = new Map()
    const context = vm.createContext({ dexSelectedItem: selectedKey, dexSelectedMove: null, dexSelectedAbility: null, asyncDataVersion: 0, siteLanguage: 'ko', itemDescriptionFor, moveDescriptionFor, abilityDescriptionFor,
      localizedDexText: (entry, language) => entry?.text?.[language] ?? null,
      React: { useMemo(fn, deps) { const previous = memos.get(context.memoName); if (previous && previous.deps.length === deps.length && deps.every((dep, idx) => Object.is(dep, previous.deps[idx]))) return previous.value; const value = fn(); memos.set(context.memoName, { deps, value }); return value } },
    })
    const run = (name) => { context.memoName = name; return vm.runInContext(transpile(`globalThis.result = ${memoExpression(name)};`), context) || context.result }
    assert.equal(run('dexSelectedItemDescription'), null)
    await loadDexDescriptions()
    context.asyncDataVersion = 1 // actual App Promise.all settle tick, selection unchanged
    const description = run('dexSelectedItemDescription')
    assert.ok(description?.text?.ko?.summary, 'same selection must leave loading/null state after provider settles')
    assert.ok(description?.nameEn && description?.nameJa)
    context.dexSelectedItem = 'not-a-dex-item'
    assert.equal(run('dexSelectedItemDescription'), null)
    context.dexSelectedItem = 'あついいわ'
    for (const language of ['en', 'ja']) { context.siteLanguage = language; assert.ok(run('dexSelectedItemDescription')?.text?.[language]?.summary, language) }
  } finally { await vite.close() }
})
