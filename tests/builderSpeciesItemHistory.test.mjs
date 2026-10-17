import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'
import { CHAMPIONS_ITEM_OPTIONS } from '../src/championsItems.ts'

const source = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const ast = ts.createSourceFile('App.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
const declarations = new Map()
function visit(node) {
  if ((ts.isFunctionDeclaration(node) || ts.isVariableDeclaration(node)) && node.name && ['selectSpecies', 'megaStoneForKey', 'canonicalChampionsItemName', 'normalizeItemForKey', 'isAllowedChampionsItem', 'itemForSpeciesSelection', 'saveCurrentSample'].includes(node.name.getText(ast))) declarations.set(node.name.getText(ast), node)
  ts.forEachChild(node, visit)
}
visit(ast)
const transpile = text => ts.transpileModule(text, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText
function builder(initialKey, initialItem) {
  const rows = new Map([
    ['mega-gyarados', { name_ko: '메가갸라도스' }],
    ['mega-garchomp', { name_ko: '메가한카리아스' }],
    ['cinderace', { name_ko: '에이스번' }],
  ])
  const state = { forge: { key: initialKey, item: initialItem, ability: 'prior', evs: {}, config: { nature: 'jolly' }, tuning: {} }, saved: [] }
  const set = field => update => { state[field] = typeof update === 'function' ? update(state[field]) : update }
  const context = vm.createContext({ indexByKey: rows, CHAMPIONS_ITEM_OPTIONS, ITEM_ALIAS_TO_CANONICAL: new Map(), sampleForge: state.forge, siteLanguage: 'ko', confirmedMovesByKey: {}, Date,
    defaultAbilityForKey: () => 'new', defaultNatureForKey: () => 'jolly', displayItemLabel: value => value, visibleChampionsItem: (_key, value) => value, searchDisplayLabel: key => key,
    setSampleTuningModalOpen(){}, setSampleForge: update => { set('forge')(update); context.sampleForge = state.forge }, setSampleLockedMoves(){}, setSampleItemDraft: value => { state.draft = value }, setSampleSearch(){}, setActiveSearchField(){}, setSavedSamples: set('saved'), setSampleLabelDraft(){},
    sampleLabelDraft: 'sample', sampleLockedMoves: [], sampleRow: {}, displayName: () => 'sample', natureLabel: () => 'jolly',
  })
  const names = ['megaStoneForKey', 'canonicalChampionsItemName', 'normalizeItemForKey', 'isAllowedChampionsItem', 'itemForSpeciesSelection', 'selectSpecies', 'saveCurrentSample']
  vm.runInContext(transpile(names.filter(name => declarations.has(name)).map(name => declarations.get(name).getText(ast)).join('\n') + '\nglobalThis.select = selectSpecies; globalThis.save = saveCurrentSample;'), context)
  return { state, select: key => context.select('sample', 0, key), save: () => context.save() }
}

test('Builder selected Mega to ordinary clears incompatible stone before saving', () => {
  const app = builder('mega-gyarados', '갸라도스나이트')
  app.select('cinderace')
  assert.equal(app.state.forge.item, '')
  assert.equal(app.state.draft, '')
  app.save()
  assert.equal(app.state.saved[0].member.item, '')
})

test('Builder selected Mega to different Mega equips destination stone', () => {
  const app = builder('mega-gyarados', '갸라도스나이트')
  app.select('mega-garchomp')
  assert.equal(app.state.forge.item, '한카리아스나이트')
  app.save()
  assert.equal(app.state.saved[0].member.item, '한카리아스나이트')
})

test('Builder ordinary legal item survives selecting another ordinary species', () => {
  const app = builder('cinderace', 'こだわりスカーフ')
  app.select('garchomp')
  assert.equal(app.state.forge.item, 'こだわりスカーフ')
})
