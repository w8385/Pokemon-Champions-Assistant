import test from 'node:test'
import assert from 'node:assert/strict'
import { normalizeRoute } from '../src/navigation.ts'
import { commitComparisonEntry } from '../src/singleInlineEntry.ts'
import { comparisonSides } from '../src/unifiedComparisonAdapter.ts'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'

for (const tab of ['pick', 'speed', 'power', 'party']) test(`legacy ${tab} lands on unified matchup`, () => {
  assert.deepEqual(normalizeRoute(`#/single?tab=${tab}&my=2&opp=3`), { section: 'single', tab: 'party' })
})

test('opponent metadata-only save retains unknown nature/offense and recorded defense', () => {
  const record = { key: 'garchomp', ability: '', item: '', revealedMoves: ['지진'], defenseNature: 1.1, spDefenseNature: 1, defenseEv: 32, hpEv: 0, speedEv: 24, notes: 'known' }
  const draft = { key: 'garchomp', ability: 'rough-skin', item: '', nature: 'hardy', evs: { hp: 0, attack: 0, defense: 32, spAttack: 0, spDefense: 0, speed: 24 }, moves: ['지진', '', '', ''] }
  const saved = commitComparisonEntry('opponent', record, draft, new Set(['ability']))
  assert.equal(saved.ability, 'rough-skin')
  assert.equal(saved.defenseNature, 1.1)
  assert.equal(saved.defenseEv, 32)
  assert.equal('nature' in saved, false)
  assert.equal('attackEv' in saved, false)
  assert.equal(saved.notes, 'known')
})

test('explicit opponent full nature and offense effort survive independent metadata edits', () => {
  const record = { key: 'garchomp', item: '', ability: '', revealedMoves: [], defenseNature: 1.1, spDefenseNature: 1 }
  const draft = { key: 'garchomp', ability: '', item: '', nature: 'adamant', evs: { hp: 0, attack: 28, defense: 0, spAttack: 0, spDefense: 0, speed: 0 }, moves: ['지진', '', '', ''] }
  const saved = commitComparisonEntry('opponent', record, draft, new Set(['nature', 'attack', 'moves']))
  assert.equal(saved.nature, 'adamant')
  assert.equal(saved.attackEv, 28)
  assert.deepEqual(saved.revealedMoves, ['지진'])
  assert.equal(saved.defenseNature, 1.1)
  assert.equal(saved.spDefenseNature, 1)
})

test('own slot save changes only edited build and moves without writing battle assumptions', () => {
  const record = { key: '', config: { nature: 'jolly', speedStage: 0, scarf: false }, ability: '', item: '', evs: { hp: 0, attack: 0, defense: 0, spAttack: 0, spDefense: 0, speed: 0 }, picked: false }
  const draft = { key: 'meowscarada', ability: 'libero', item: '', nature: 'jolly', evs: { hp: 0, attack: 32, defense: 0, spAttack: 0, spDefense: 0, speed: 0 }, moves: ['무릎차기', '', '', ''], battle: { burned: true } }
  const saved = commitComparisonEntry('own', record, draft, new Set(['key', 'ability', 'attack', 'moves']))
  assert.equal(saved.key, 'meowscarada')
  assert.equal(saved.evs.attack, 32)
  assert.equal(saved.config.nature, 'jolly')
  assert.equal('battle' in saved, false)
})

test('changing species clears previous species build and unknown assumptions', () => {
  const draft = { key: 'meowscarada', ability: '', item: '', nature: 'hardy', evs: { hp: 0, attack: 0, defense: 0, spAttack: 0, spDefense: 0, speed: 0 }, moves: ['', '', '', ''] }
  const own = commitComparisonEntry('own', { key: 'garchomp', item: 'choice-scarf', ability: 'rough-skin', config: { nature: 'adamant', speedStage: 3, scarf: true }, evs: { hp: 0, attack: 32, defense: 0, spAttack: 0, spDefense: 0, speed: 32 } }, draft, new Set(['key']))
  assert.equal(own.evs.attack, 0)
  assert.equal(own.config.nature, 'hardy')
  assert.equal(own.config.speedStage, 0)
  const opp = commitComparisonEntry('opponent', { key: 'garchomp', item: '', ability: '', nature: 'adamant', attackEv: 32, defenseEv: 32, defenseNature: 1.1, speedEv: 32, notes: 'old', revealedMoves: ['지진'], natureBoost: true, scarf: true, speedStage: 3 }, draft, new Set(['key']))
  assert.equal(opp.attackEv, undefined)
  assert.equal(opp.defenseEv, 0)
  assert.equal(opp.defenseNature, 1)
  assert.equal(opp.nature, undefined)
  assert.deepEqual(opp.revealedMoves, [])
})

test('actual ability sanitizer preserves explicit blank even for a one-ability species', () => {
  const source = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
  const start = source.indexOf('function sanitizeAbilityForKey(')
  const end = source.indexOf('function sanitizePartyTuning(', start)
  const rows = new Map([['one', { abilities: ['trace'] }], ['two', { abilities: ['first', 'second'] }]])
  const context = vm.createContext({ indexByKey: rows, abilityMatchesKey: (key, value) => rows.get(key)?.abilities.includes(value), defaultAbilityForKey: key => rows.get(key)?.abilities[0] ?? '' })
  const code = ts.transpileModule(source.slice(start, end), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None } }).outputText
  vm.runInContext(`${code}\nthis.sanitize = sanitizeAbilityForKey`, context)
  assert.equal(context.sanitize('one', '', false), '')
  assert.equal(context.sanitize('one', '', true), '')
  assert.equal(context.sanitize('two', '', false), '')
  assert.equal(context.sanitize('one', undefined, true), 'trace')
  assert.equal(context.sanitize('one', 'trace', false), 'trace')
})

test('source knownness distinguishes absent offense from explicitly recorded zero and full nature', () => {
  const member = { key: 'cinderace', item: '', ability: '', config: { nature: 'hardy', speedStage: 0 }, evs: { hp: 0, attack: 0, defense: 0, spAttack: 0, spDefense: 0, speed: 0 } }
  const opponent = { key: 'garchomp', item: '', ability: '', defenseNature: 1.1, spDefenseNature: 1, revealedMoves: [] }
  const [, unknown] = comparisonSides([member], [opponent], 0, 0, {})
  assert.equal(unknown.speedNatureKnown, false)
  assert.deepEqual(unknown.knownOffense, { attack: false, spAttack: false })
  assert.equal(unknown.statNatureMultipliers.defense, 1.1)
  const [, known] = comparisonSides([member], [{ ...opponent, nature: 'adamant', attackEv: 32, spAttackEv: 0 }], 0, 0, {})
  assert.equal(known.speedNatureKnown, true)
  assert.deepEqual(known.knownOffense, { attack: true, spAttack: true })
  assert.deepEqual(known.statNatureMultipliers, {})
})

test('own species-only save preserves existing shared-species move catalog', () => {
  const source = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
  assert.doesNotMatch(source, /if \(dirty\.has\('key'\)\) dirty\.add\('moves'\)/)
  assert.match(source, /if \(dirty\.has\('moves'\)\) setConfirmedMovesByKey/)
  assert.doesNotMatch(source, /<QuickDamagePanel key=\{/)
  assert.match(source, /comparisonSlots=\{\[selectedMy, selectedOpp\]\}/)
  assert.match(source, /if \(key === \(side === 'attacker' \? attacker\.key : defender\.key\)\) return/)
  const oldCatalog = { cinderace: ['무릎차기', '화염볼', '', ''] }
  const own = { key: 'garchomp', item: '', ability: '', config: { nature: 'hardy', speedStage: 0, scarf: false }, evs: { hp: 0, attack: 0, defense: 0, spAttack: 0, spDefense: 0, speed: 0 } }
  const saved = commitComparisonEntry('own', own, { ...own, key: 'cinderace', nature: 'hardy', moves: oldCatalog.cinderace }, new Set(['key']))
  assert.equal(saved.key, 'cinderace')
  assert.deepEqual(oldCatalog.cinderace, ['무릎차기', '화염볼', '', ''])
})
