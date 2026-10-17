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

test('mounted markup groups speed and result, moves below stat controls and one opponent search near slot', () => {
  const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
  const quick = app.slice(app.indexOf('function QuickDamagePanel('), app.indexOf('function LanguageIcon('))
  assert.match(quick, /quick-comparison-results[^]*?\{speedStrip\}[^]*?<div className="quick-result"/)
  assert.match(quick, /\{statCard\(side, entry, row\)\}[^]*?quick-registered-moves/)
  assert.match(quick, /entrySelectors\?\.\(speciesSearch\('defender', lt\('상대 엔트리 입력'\)\)\)/)
  assert.match(app, /entrySelectors=\{opponentSearch =>[^]*?className="selected-opponent-search">\{opponentSearch\}/)
  assert.doesNotMatch(quick, /single-entry-commit/)
  assert.match(quick, /comparisonMode \?[^]*?비교 초안/)
})
