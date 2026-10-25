import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'
import { createServer } from 'vite'

const source = ts.createSourceFile('App.tsx', readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
const rows = JSON.parse(readFileSync(new URL('../src/pokemon_champions_verified_data.json', import.meta.url))).rows
const descriptions = JSON.parse(readFileSync(new URL('../src/dexDescriptions.json', import.meta.url))).abilities
const maushold = rows.find(row => row.key === 'maushold')
const garchomp = rows.find(row => row.key === 'garchomp')
const compile = text => ts.transpileModule(text, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None, jsx: ts.JsxEmit.React } }).outputText
let cardsMemo, availabilityMemo, select, checkbox, legacyNames
function visit(node) {
  if (ts.isVariableDeclaration(node) && node.name.getText(source) === 'doubleBoardStateCards') cardsMemo = node.initializer
  if (ts.isVariableDeclaration(node) && node.name.getText(source) === 'doubleFriendGuardAvailableOpp') availabilityMemo = node.initializer
  if (ts.isVariableDeclaration(node) && node.name.getText(source) === 'FRIEND_GUARD_NAMES') legacyNames = node.initializer
  if (ts.isJsxElement(node) && node.openingElement.tagName.getText(source) === 'select' && node.getText(source).includes('opp-ability-option-')) select = node.openingElement
  if (ts.isConditionalExpression(node) && node.getText(source).includes('doubleFriendGuardAvailableOpp ? <label')) checkbox = node
  ts.forEachChild(node, visit)
}
visit(source)
assert.ok(cardsMemo && availabilityMemo && select && checkbox)

function evaluate(raw, key, classifyAbilityForKey) {
  const opponent = { key, ability: raw, item: '', revealedMoves: [] }
  const option = { row: rows.find(row => row.key === key), entry: opponent }
  const context = vm.createContext({
    React: { useMemo: fn => fn(), createElement: (tag, props, ...children) => ({ tag, props, children }) },
    doubleSlotMeta: Object.fromEntries(['myLeft', 'myRight', 'oppLeft', 'oppRight'].map(slot => [slot, { side: slot.startsWith('my') ? 'my' : 'opp', label: slot, option: slot === 'oppLeft' ? option : null }])),
    displayName: row => row.name_ko, siteLanguage: 'ko', lt: text => text, displayItemLabel: text => text,
    visibleChampionsItem: () => '', confirmedMovesByKey: {}, doubleSpeedBySlot: {}, doubleProtectBySlot: {}, doubleTailwindMy: false, doubleTailwindOpp: false,
    classifyAbilityForKey, asyncDataVersion: 0, doubleFriendGuardOpp: false, setDoubleFriendGuardOpp() {},
    opponents: [opponent], oppMember: opponent, selectedOpp: 0, setOpponents(next) { context.opponents = next },
  })
  vm.runInContext(compile(`const doubleBoardStateCards = ${cardsMemo.getText(source)}; ${legacyNames ? `const FRIEND_GUARD_NAMES = ${legacyNames.getText(source)};` : ''} const doubleFriendGuardAvailableOpp = ${availabilityMemo.getText(source)}; globalThis.available = doubleFriendGuardAvailableOpp; globalThis.cards = doubleBoardStateCards;`), context)
  context.doubleFriendGuardAvailableOpp = context.available
  vm.runInContext(compile(`globalThis.control = ${checkbox.getText(source)}; globalThis.change = ${select.attributes.properties.find(attr => attr.name?.text === 'onChange').initializer.expression.getText(source)}`), context)
  return context
}

test('actual opponent selector stores canonical Friend Guard and Double control uses form authority', async () => {
  const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent' })
  try {
    const { classifyAbilityForKey } = await server.ssrLoadModule('/src/App.tsx')
    const selected = evaluate('', 'maushold', classifyAbilityForKey)
    selected.change({ target: { value: 'friend-guard' } })
    assert.equal(selected.opponents[0].ability, 'friend-guard')
    const canonical = evaluate(selected.opponents[0].ability, 'maushold', classifyAbilityForKey)
    assert.equal(canonical.available, true)
    assert.ok(canonical.control, 'the actual conditional checkbox must render')
    for (const raw of ['프렌드가드', 'Friend Guard']) {
      assert.equal(evaluate(raw, 'maushold', classifyAbilityForKey).available, true, raw)
    }
    assert.equal(evaluate(descriptions['friend-guard'].nameJa, 'maushold', classifyAbilityForKey).available, false, 'lazy Japanese alias not loaded yet')
    const { loadDexDescriptions } = await server.ssrLoadModule('/src/dex/data.ts')
    await loadDexDescriptions()
    assert.equal(evaluate(descriptions['friend-guard'].nameJa, 'maushold', classifyAbilityForKey).available, true, 'Japanese alias after lazy load')
    for (const [key, raw] of [['garchomp', 'friend-guard'], ['garchomp', '프렌드가드'], ['maushold', ''], ['maushold', 'creator-original']]) {
      const unavailable = evaluate(raw, key, classifyAbilityForKey)
      assert.equal(unavailable.available, false, `${key}/${raw}`)
      assert.equal(unavailable.control, null)
    }
  } finally { await server.close() }
})
