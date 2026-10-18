import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { draftStorageKey, readDraft, writeDraft } from '../src/comparisonDraftState.ts'
import { snapshotDefenderDrafts, removeDefenderDrafts } from '../src/singleOpponentRegistration.ts'
import { resetPairAssumptions, pairTarget } from '../src/comparisonPairState.ts'

const seed = key => ({ key, ability: '', item: '', nature: 'hardy', evs: { hp: 0, attack: 0, defense: 0, spAttack: 0, spDefense: 0, speed: 0 }, moves: ['', '', '', ''], battle: { burned: false, attackStage: 0 }, actual: {}, speedStage: 0, speedNatureKnown: false, speedNatureMultiplier: 1, statNatureMultipliers: {}, speedScarfOverride: null, speedAbilityActive: false, knownOffense: { attack: false, spAttack: false } })
const storageFixture = () => {
  const data = new Map()
  return { data, storage: { getItem: key => data.get(key) ?? null, setItem: (key, value) => { data.set(key, value) }, removeItem: key => { data.delete(key) } } }
}
const source = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const reset = source.slice(source.indexOf('  const resetSingleOpponentEntry = '), source.indexOf('  const resetPartyForFreshEntry = '))
const revisionStart = source.indexOf('  React.useEffect(() => {\n    if (!comparisonMode || !initialSides || !opponentResetRevision)')
const revision = source.slice(revisionStart, source.indexOf('  const opener = ', revisionStart))

test('failed storage read is reported before confirming or mutating master', () => {
  const broken = { getItem() { throw new DOMException('secret', 'SecurityError') }, removeItem() { throw Error('must not remove') }, setItem() { throw Error('must not restore') } }
  assert.deepEqual(snapshotDefenderDrafts(broken, 6), { ok: false })
  assert.match(reset, /snapshotDefenderDrafts\(localStorage, emptyOpponents\.length\)/)
  assert.match(reset, /try \{ return snapshotDefenderDrafts\(localStorage, emptyOpponents\.length\) \} catch/)
  assert.ok(reset.indexOf('snapshotDefenderDrafts(') < reset.indexOf('window.confirm('))
  assert.ok(reset.indexOf('snapshotDefenderDrafts(') < reset.indexOf('resetOpponentsForFreshEntry()'))
  assert.match(reset, /window\.alert\(/)
})

test('failed removal of seed-compatible dirty defender draft keeps empty master reset uncommitted and reload draft intact', () => {
  const { data, storage } = storageFixture()
  const empty = seed('')
  const draft = { ...empty, key: 'garchomp' }
  assert.equal(writeDraft(storage, 'defender', 0, empty, draft, new Set(['key'])), true)
  const failure = { ...storage, removeItem(key) { if (key === draftStorageKey('defender', 0)) throw new DOMException('secret', 'SecurityError'); storage.removeItem(key) } }
  const snapshot = snapshotDefenderDrafts(failure, 6)
  assert.equal(snapshot.ok, true)
  assert.deepEqual(removeDefenderDrafts(failure, snapshot), { ok: false, restored: true })
  assert.equal(readDraft(storage, 'defender', 0, empty)?.side.key, 'garchomp')
  assert.match(reset, /removeDefenderDrafts\(localStorage, snapshot\)/)
  assert.match(reset, /try \{ return removeDefenderDrafts\(localStorage, snapshot\) \} catch/)
  assert.ok(reset.indexOf('removeDefenderDrafts(') < reset.indexOf('resetOpponentsForFreshEntry()'))
  assert.ok(reset.indexOf('removeDefenderDrafts(') < reset.indexOf('setOpponentResetRevision('))
  assert.equal(data.size, 1)
})

test('midway remove failure restores previously removed drafts without touching own, Quick, catalog or master', () => {
  const { data, storage } = storageFixture()
  for (let i = 0; i < 6; i++) data.set(draftStorageKey('defender', i), `draft-${i}`)
  for (const [key, value] of [['pokemon-champions-own', 'own'], ['pokemon-champions-quick', 'quick'], ['pokemon-champions-catalog', 'catalog'], [draftStorageKey('attacker', 0), 'own draft']]) data.set(key, value)
  const original = new Map(data)
  const failure = { ...storage, removeItem(key) { if (key === draftStorageKey('defender', 4)) throw new DOMException('secret', 'QuotaExceededError'); storage.removeItem(key) } }
  assert.deepEqual(removeDefenderDrafts(failure, snapshotDefenderDrafts(failure, 6)), { ok: false, restored: true })
  assert.deepEqual(data, original)
})

test('rollback failure is explicitly distinguishable from restored failure', () => {
  const { data, storage } = storageFixture()
  data.set(draftStorageKey('defender', 0), 'a')
  data.set(draftStorageKey('defender', 1), 'b')
  const failure = { ...storage, removeItem(key) { if (key === draftStorageKey('defender', 1)) throw new DOMException('blocked', 'SecurityError'); storage.removeItem(key) }, setItem() { throw new DOMException('blocked', 'QuotaExceededError') } }
  assert.deepEqual(removeDefenderDrafts(failure, snapshotDefenderDrafts(failure, 6)), { ok: false, restored: false })
  assert.equal(data.has(draftStorageKey('defender', 0)), false)
  assert.match(reset, /restored/)
})

test('successful reset removes six drafts only, including invalid JSON, and canceled confirmation does not remove any', () => {
  const { data, storage } = storageFixture()
  for (let i = 0; i < 6; i++) data.set(draftStorageKey('defender', i), i === 3 ? '{invalid' : `draft-${i}`)
  data.set(draftStorageKey('attacker', 0), 'own build')
  const snapshot = snapshotDefenderDrafts(storage, 6)
  assert.equal(snapshot.ok, true)
  assert.equal(snapshot.hasDraft, true)
  assert.equal(data.size, 7) // cancel: do not call remove
  assert.ok(reset.indexOf('window.confirm(') < reset.indexOf('removeDefenderDrafts('))
  assert.deepEqual(removeDefenderDrafts(storage, snapshot), { ok: true })
  for (let i = 0; i < 6; i++) assert.equal(data.has(draftStorageKey('defender', i)), false)
  assert.equal(data.get(draftStorageKey('attacker', 0)), 'own build')
})

test('already-empty master revision clears both temporary sides, closes any modal and preserves dirty own build', () => {
  const own = seed('own'), empty = seed('')
  const ownDraft = { ...own, ability: 'edited', evs: { ...own.evs, speed: 12 }, moves: ['custom', '', '', ''], battle: { burned: true, attackStage: 6 }, actual: { speed: '999' }, speedStage: 6, speedScarfOverride: true, speedAbilityActive: true }
  const cleaned = resetPairAssumptions(ownDraft, own, new Set(['ability', 'speed', 'moves']))
  assert.equal(cleaned.ability, 'edited')
  assert.equal(cleaned.evs.speed, 12)
  assert.equal(cleaned.moves[0], 'custom')
  assert.deepEqual(cleaned.battle, own.battle)
  assert.deepEqual(cleaned.actual, {})
  assert.equal(cleaned.speedStage, 0)
  assert.equal(cleaned.speedScarfOverride, null)
  assert.equal(cleaned.speedAbilityActive, false)
  assert.equal(pairTarget(1, empty), pairTarget(1, empty)) // no seed or target change to trigger other effect
  assert.match(revision, /setAttacker\(prev => resetPairAssumptions\(prev, initialSides\[0\], dirty\.attacker\)\)/)
  assert.match(revision, /setDefender\([^]*resetPairAssumptions\([^]*initialSides\[1\]/)
  assert.match(revision, /setModalSide\(null\)/)
  assert.match(revision, /previousTargets\.current/)
  assert.match(revision, /setConditions\(quickDefaultConditions\(\)\)/)
})
