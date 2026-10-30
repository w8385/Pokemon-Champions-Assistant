import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { readDraft, writeDraft, forgetDraft, draftStorageKey } from '../src/comparisonDraftState.ts'

const seed = { key: 'a', ability: '', item: '', nature: 'hardy', evs: { hp: 0, attack: 0, defense: 0, spAttack: 0, spDefense: 0, speed: 0 }, moves: ['', '', '', ''], speedNatureKnown: false, knownOffense: { attack: false, spAttack: false }, statNatureMultipliers: { defense: 1.1 } }
const draft = { ...seed, ability: '', evs: { ...seed.evs, defense: 12 }, actual: { speed: '999' }, battle: { burned: true }, speedStage: 6, moves: ['a', '', '', ''] }
const memory = new Map()
const storage = { getItem: k => memory.get(k) ?? null, setItem: (k, v) => memory.set(k, v), removeItem: k => memory.delete(k) }

test('comparison draft restores only dirty build fields for compatible slot and seed', () => {
  memory.clear()
  writeDraft(storage, 'attacker', 2, seed, draft, new Set(['defense', 'ability', 'moves']))
  const restored = readDraft(storage, 'attacker', 2, seed)
  assert.equal(restored.side.evs.defense, 12)
  assert.equal(restored.side.ability, '')
  assert.deepEqual(restored.side.moves, ['a', '', '', ''])
  assert.equal(restored.side.statNatureMultipliers.defense, 1.1)
  assert.equal(restored.side.actual, undefined)
  assert.equal(restored.side.battle, undefined)
  assert.equal(restored.side.speedStage, undefined)
  assert.deepEqual([...restored.dirty].sort(), ['ability', 'defense', 'moves'])
  assert.equal(readDraft(storage, 'attacker', 3, seed), null)
  assert.equal(readDraft(storage, 'attacker', 2, { ...seed, key: 'b' }), null)
  assert.equal(readDraft(storage, 'attacker', 2, { ...seed, item: 'changed' }), null)
})

test('invalid payload rejected, sibling slot preserved, explicit empty ability retained', () => {
  memory.clear()
  writeDraft(storage, 'defender', 0, seed, draft, new Set(['ability']))
  writeDraft(storage, 'defender', 1, seed, draft, new Set(['defense']))
  forgetDraft(storage, 'defender', 1)
  assert.equal(readDraft(storage, 'defender', 0, seed).side.ability, '')
  assert.equal(readDraft(storage, 'defender', 1, seed), null)
  storage.setItem(draftStorageKey('defender', 0), JSON.stringify({ version: 1, seed: JSON.stringify(seed), dirty: ['defense'], patch: { evs: { defense: 99 }, battle: { burned: true } } }))
  assert.equal(readDraft(storage, 'defender', 0, seed), null)
})

test('species-only replacement restores its blank ability and moves without leaking prior species', () => {
  memory.clear()
  const prior = { ...seed, key: 'a', ability: 'prior', item: 'prior', moves: ['prior', '', '', ''] }
  const next = { ...draft, key: 'b', ability: '', item: '', nature: 'hardy', evs: { ...seed.evs }, moves: ['', '', '', ''] }
  writeDraft(storage, 'defender', 4, prior, next, new Set(['key']))
  const restored = readDraft(storage, 'defender', 4, prior)
  assert.equal(restored.side.key, 'b')
  assert.equal(restored.side.ability, '')
  assert.equal(restored.side.item, '')
  assert.deepEqual(restored.side.moves, ['', '', '', ''])
  assert.deepEqual([...restored.dirty], ['key'])
})

test('invalid new effort and nature writes reject without replacing a readable draft or sibling', () => {
  memory.clear()
  const key = draftStorageKey('attacker', 2)
  assert.equal(writeDraft(storage, 'attacker', 2, seed, draft, new Set(['defense'])), true)
  assert.equal(writeDraft(storage, 'defender', 2, seed, draft, new Set(['ability'])), true)
  const original = memory.get(key)
  const sibling = memory.get(draftStorageKey('defender', 2))
  const invalid = [
    [{ ...draft, evs: { ...seed.evs, speed: 33 } }, ['speed']],
    [{ ...draft, evs: { ...seed.evs, speed: 32, attack: 32, defense: 3 } }, ['speed', 'attack', 'defense']],
    [{ ...draft, nature: 'not-a-nature' }, ['nature']],
    [{ ...draft, moves: ['a', '', '', '', 'extra'] }, ['moves']],
    [{ ...draft, evs: { ...seed.evs, speed: -1 } }, ['speed']],
    [{ ...draft, evs: { ...seed.evs, speed: 1.5 } }, ['speed']],
    [draft, ['unknown-field']],
  ]
  for (const [next, fields] of invalid) {
    assert.equal(writeDraft(storage, 'attacker', 2, seed, next, new Set(fields)), false, fields.join(','))
    assert.equal(memory.get(key), original)
    assert.equal(memory.get(draftStorageKey('defender', 2)), sibling)
    assert.equal(readDraft(storage, 'attacker', 2, seed).side.evs.defense, 12)
  }
})

test('merged seed budget and all six explicit species replacement values are validated', () => {
  memory.clear()
  const invested = { ...seed, evs: { ...seed.evs, attack: 32, defense: 32 } }
  const key = draftStorageKey('defender', 3)
  assert.equal(writeDraft(storage, 'defender', 3, invested, { ...draft, evs: { ...invested.evs, speed: 3 } }, new Set(['speed'])), false)
  assert.equal(memory.has(key), false)
  assert.equal(writeDraft(storage, 'defender', 3, seed, { ...draft, evs: { ...seed.evs, speed: 33 } }, new Set(['key'])), false)
  assert.equal(memory.has(key), false)
  const legal = { ...draft, evs: { ...seed.evs, attack: 32, defense: 32, speed: 2 }, moves: ['alias', '', 'move', ''] }
  assert.equal(writeDraft(storage, 'defender', 3, seed, legal, new Set(['key'])), true)
  assert.deepEqual(readDraft(storage, 'defender', 3, seed).side.evs, legal.evs)
  assert.deepEqual(readDraft(storage, 'defender', 3, seed).side.moves, legal.moves)
  assert.equal(readDraft(storage, 'defender', 3, { ...seed, item: 'changed' }), null)
  assert.equal(readDraft(storage, 'defender', 4, seed), null)
  const raw = memory.get(key)
  memory.set(key, JSON.stringify({ ...JSON.parse(raw), patch: { nature: 'not-a-nature' }, dirty: ['nature'] }))
  assert.equal(readDraft(storage, 'defender', 3, seed), null)
  assert.equal(memory.get(key).includes('not-a-nature'), true)
})

test('serialization and storage failures return false without throwing or removing prior draft', () => {
  memory.clear()
  assert.equal(writeDraft(storage, 'attacker', 1, seed, draft, new Set(['ability'])), true)
  const key = draftStorageKey('attacker', 1)
  const original = memory.get(key)
  assert.equal(writeDraft(storage, 'attacker', 1, seed, { ...draft, moves: null }, new Set(['moves'])), false)
  assert.equal(writeDraft(storage, 'attacker', 1, seed, { ...draft, ability: 123 }, new Set(['ability'])), false)
  assert.equal(writeDraft({ ...storage, setItem: () => { throw Error('quota') } }, 'attacker', 1, seed, draft, new Set(['ability'])), false)
  assert.equal(writeDraft(storage, 'attacker', 1, { ...seed, item: 1n }, draft, new Set(['ability'])), false)
  assert.equal(memory.get(key), original)
  assert.equal(readDraft(storage, 'attacker', 1, seed).side.ability, '')
})

test('sparse payload rejects unclaimed effort objects rather than treating them as dirty fields', () => {
  memory.clear()
  const key = draftStorageKey('attacker', 0)
  memory.set(key, JSON.stringify({ version: 1, seed: JSON.stringify(seed), dirty: ['ability'], patch: { ability: '', evs: {} } }))
  assert.equal(readDraft(storage, 'attacker', 0, seed), null)
  assert.equal(memory.has(key), true)
})

test('shared results precede cards, with moves below stats and one opponent search near slot', () => {
  const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
  const quick = app.slice(app.indexOf('function QuickDamagePanel('), app.indexOf('function LanguageIcon('))
  assert.match(quick, /quick-comparison-results[^]*?\{speedStrip\}[^]*?quick-result\$\{selectedVerdict/)
  const view = quick.slice(quick.indexOf('return <section className={`panel wide quick-damage'))
  assert.ok(view.indexOf('className="quick-comparison-results"') < view.indexOf('className="quick-sides"'))
  assert.match(quick, /\{statCard\(side, entry, row\)\}[^]*?quick-registered-moves/)
  assert.match(quick, /entrySelectors\?\.\(speciesSearch\('defender', lt\('상대 엔트리 입력'\)\),/)
  assert.match(app, /entrySelectors=\{\(opponentSearch, reset\) =>[^]*?className="selected-opponent-search">\{opponentSearch\}/)
  assert.doesNotMatch(quick, /single-entry-commit/)
  assert.match(quick, /comparisonMode \?[^]*?비교 초안/)
})
