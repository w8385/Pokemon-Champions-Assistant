import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'
import { itemForSpeciesSelection } from '../src/itemIdentity.ts'
import { championsData } from '../src/effectiveRoster.ts'
import { createServer } from 'vite'

const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent' })
const { abilityForSpeciesSelection } = await server.ssrLoadModule('/src/abilityIdentity.ts')
await server.close()

const source = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const ast = ts.createSourceFile('App.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
const callbacks = new Map()
function visit(node) {
  if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && ['selectSpecies', 'nextOpponentSlotIndex', 'commitOpponentQuickSearch'].includes(node.name.text)) callbacks.set(node.name.text, node.getText(ast))
  ts.forEachChild(node, visit)
}
visit(ast)
assert.equal(callbacks.size, 3, 'both live App callbacks and slot progression must be extracted from the AST')
const js = ts.transpileModule([...callbacks.values()].join('\n') + '\nglobalThis.detailSelect = selectSpecies; globalThis.quickSelect = commitOpponentQuickSearch;', { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText

function fixture(key, item, selectedOpp = 1) {
  const record = { key, item, ability: 'recorded-ability', config: { nature: 'timid', scarf: true, speedStage: 2 }, evs: { hp: 11 }, tuning: { attack: 3 }, revealedMoves: ['move-a', '', 'move-c', ''], rawSource: { item, move: 'source-spelling' } }
  const state = { opponents: [{ key: 'cinderace', item: '' }, record, { key: '', item: '' }], selectedOpp, opponentSearch: ['', 'old label', ''], opponentItemDrafts: ['', 'original draft', ''], opponentAbilityDrafts: ['', 'original ability draft', ''], quickSearch: 'typed query', writes: 0 }
  const set = field => update => { state[field] = typeof update === 'function' ? update(state[field]) : update }
  const context = vm.createContext({ opponents: state.opponents, opponentSearch: state.opponentSearch, selectedOpp, opponentQuickSearch: state.quickSearch, siteLanguage: 'ko', itemForSpeciesSelection, abilityForSpeciesSelection, indexByKey: new Map(championsData.rows.map(row => [row.key, row])),
    setOpponents: update => { state.writes++; set('opponents')(update); context.opponents = state.opponents },
    setOpponentSearch: update => { set('opponentSearch')(update); context.opponentSearch = state.opponentSearch },
    setOpponentItemDrafts: set('opponentItemDrafts'), setOpponentAbilityDrafts: set('opponentAbilityDrafts'),
    setSelectedOpp: value => { state.selectedOpp = value; context.selectedOpp = value }, setOpponentQuickSearch: set('quickSearch'),
    abilitiesForKey: () => [], normalizeItemForKey: itemForSpeciesSelection,
    displayItemLabel: item => item, visibleChampionsItem: (_key, item) => item, searchDisplayLabel: key => `label:${key}`,
    resolveSpeciesKey: () => key, filterSpeciesOptions: () => [], opponentQuickInputRef: { current: { focus() {} } }, setTimeout: callback => callback(), MAX_OPPONENTS: 3,
  })
  vm.runInContext(js, context)
  return { state, record, detail: target => context.detailSelect('opponent', 1, target), quick: target => context.quickSelect(target) }
}

for (const [label, call] of [['detail species picker', 'detail'], ['quick opponent search', 'quick']]) {
  test(`${label}: reselecting identical ordinary form retains unknown raw item and full recorded build`, () => {
    const app = fixture('garchomp', 'unrecognized-original')
    const original = JSON.stringify(app.record)
    app[call]('garchomp')
    assert.equal(JSON.stringify(app.state.opponents[1]), original)
    assert.equal(app.state.opponents[1], app.record)
    assert.equal(app.state.writes, 0)
    assert.equal(app.state.opponentSearch[1], 'label:garchomp')
    if (call === 'quick') { assert.equal(app.state.selectedOpp, 2); assert.equal(app.state.quickSearch, '') }
  })
  for (const item of ['', 'こだわりスカーフ']) {
    test(`${label}: reselecting identical Mega form retains ${item || 'blank'} raw item and build`, () => {
      const app = fixture('mega-gyarados', item)
      app[call]('mega-gyarados')
      assert.equal(app.state.opponents[1], app.record)
      assert.equal(app.state.writes, 0)
      assert.equal(app.state.opponents[1].item, item)
      assert.equal(app.state.opponentItemDrafts[1], 'original draft')
      assert.equal(app.state.opponentAbilityDrafts[1], 'original ability draft')
    })
  }
  test(`${label}: actual form change equips required stone without moving slot or dropping other fields`, () => {
    const app = fixture('garchomp', 'unrecognized-original')
    app[call]('mega-gyarados')
    assert.equal(app.state.opponents[1].key, 'mega-gyarados')
    assert.equal(app.state.opponents[1].item, '갸라도스나이트')
    assert.equal(app.state.opponents[1].ability, 'mold-breaker')
    assert.equal(app.state.opponents[1].revealedMoves, app.record.revealedMoves)
    assert.equal(app.state.opponents[1].rawSource, app.record.rawSource)
    assert.equal(app.state.opponents[0].key, 'cinderace')
    assert.equal(app.state.writes, 1)
    if (call === 'quick') assert.equal(app.state.selectedOpp, 2)
  })
}
